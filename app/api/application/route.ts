import { env } from 'cloudflare:workers';

import { insertApplication } from '@/lib/applications-db';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_HOSTNAMES = new Set(['sauformula.org', 'www.sauformula.org']);

const universityLabels = {
  sau: 'Sakarya Üniversitesi',
  subu: 'Sakarya Uygulamalı Bilimler Üniversitesi',
} as const;

const classLabels = {
  preparation: 'Hazırlık',
  '1': '1. sınıf',
  '2': '2. sınıf',
  '3': '3. sınıf',
  '4': '4. sınıf',
  graduate: 'Lisansüstü',
} as const;

const teamLabels = {
  'vehicle-dynamics': 'Araç Dinamiği',
  'chassis-structures': 'Şasi ve Yapısal Sistemler',
  powertrain: 'Güç Aktarma Sistemleri',
  aerodynamics: 'Aerodinamik',
  'composites-manufacturing': 'Kompozitler ve Üretim',
  'electrical-electronics': 'Elektrik ve Elektronik',
  'sponsorship-partnerships': 'Sponsorluk ve İş Birlikleri',
  'media-communications': 'Medya ve İletişim',
  'finance-operations': 'Finans ve Operasyon',
} as const;

const weeklyHoursLabels = {
  '0-4': 'Haftada 0–4 saat',
  '5-8': 'Haftada 5–8 saat',
  '9-12': 'Haftada 9–12 saat',
  '13-20': 'Haftada 13–20 saat',
  '20+': 'Haftada 20 saatten fazla',
} as const;

const availabilityLabels = {
  yes: 'Evet',
  no: 'Hayır',
  depends: 'Koşullara göre / Henüz emin değilim',
} as const;

type ApplicationPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  university?: unknown;
  academicDepartment?: unknown;
  classLevel?: unknown;
  linkedin?: unknown;
  portfolio?: unknown;
  primaryTeam?: unknown;
  secondaryTeam?: unknown;
  programs?: unknown;
  weeklyHours?: unknown;
  summerParticipation?: unknown;
  busyPeriods?: unknown;
  communityExperience?: unknown;
  communityDetails?: unknown;
  projects?: unknown;
  motivation?: unknown;
  responsibilityScenario?: unknown;
  motivationFactor?: unknown;
  additionalNotes?: unknown;
  consent?: unknown;
  language?: unknown;
  turnstileToken?: unknown;
};

type RuntimeEnv = {
  APPLICATIONS_DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
};

type TurnstileResult = {
  success?: boolean;
  hostname?: string;
  action?: string;
};

const runtimeEnv = env as unknown as RuntimeEnv;

function json(data: Record<string, unknown>, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function readText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isOptionalHttpUrl(value: string) {
  if (!value) return true;
  if (value.length > 300) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return new URL(origin).hostname === new URL(request.url).hostname;
  } catch {
    return false;
  }
}

function isKeyOf<T extends object>(
  value: string,
  object: T,
): value is Extract<keyof T, string> {
  return Object.hasOwn(object, value);
}

export function GET() {
  const siteKey = runtimeEnv.TURNSTILE_SITE_KEY;
  if (!siteKey) return json({ ok: false, code: 'service_unavailable' }, 503);
  return json({ ok: true, siteKey });
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request))
    return json({ ok: false, code: 'invalid_origin' }, 403);

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 48_000)
    return json({ ok: false, code: 'payload_too_large' }, 413);

  let payload: ApplicationPayload;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 48_000)
      return json({ ok: false, code: 'payload_too_large' }, 413);
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return json({ ok: false, code: 'invalid_request' }, 400);
    }
    payload = parsed as ApplicationPayload;
  } catch {
    return json({ ok: false, code: 'invalid_request' }, 400);
  }

  const name = readText(payload.name);
  const email = readText(payload.email).toLowerCase();
  const phone = readText(payload.phone);
  const university = readText(payload.university);
  const academicDepartment = readText(payload.academicDepartment);
  const classLevel = readText(payload.classLevel);
  const linkedin = readText(payload.linkedin);
  const portfolio = readText(payload.portfolio);
  const primaryTeam = readText(payload.primaryTeam);
  const secondaryTeam = readText(payload.secondaryTeam);
  const programs = readText(payload.programs);
  const weeklyHours = readText(payload.weeklyHours);
  const summerParticipation = readText(payload.summerParticipation);
  const busyPeriods = readText(payload.busyPeriods);
  const communityExperience = readText(payload.communityExperience);
  const communityDetails = readText(payload.communityDetails);
  const projects = readText(payload.projects);
  const motivation = readText(payload.motivation);
  const responsibilityScenario = readText(payload.responsibilityScenario);
  const motivationFactor = readText(payload.motivationFactor);
  const additionalNotes = readText(payload.additionalNotes);
  const language = payload.language === 'en' ? 'en' : 'tr';
  const turnstileToken = readText(payload.turnstileToken);

  const fields = {
    name: name.length >= 2 && name.length <= 100,
    email: isEmail(email),
    phone: phone.length >= 7 && phone.length <= 30,
    university: isKeyOf(university, universityLabels),
    academicDepartment:
      academicDepartment.length >= 2 && academicDepartment.length <= 120,
    classLevel: isKeyOf(classLevel, classLabels),
    linkedin: isOptionalHttpUrl(linkedin),
    portfolio: isOptionalHttpUrl(portfolio),
    primaryTeam: isKeyOf(primaryTeam, teamLabels),
    secondaryTeam:
      (!secondaryTeam || isKeyOf(secondaryTeam, teamLabels)) &&
      secondaryTeam !== primaryTeam,
    programs: programs.length <= 1500,
    weeklyHours: isKeyOf(weeklyHours, weeklyHoursLabels),
    summerParticipation: isKeyOf(summerParticipation, availabilityLabels),
    busyPeriods: isKeyOf(busyPeriods, availabilityLabels),
    communityExperience:
      communityExperience === 'yes' || communityExperience === 'no',
    communityDetails:
      communityExperience === 'no' ||
      (communityDetails.length >= 10 && communityDetails.length <= 2000),
    projects: projects.length <= 2500,
    motivation: motivation.length >= 20 && motivation.length <= 2500,
    responsibilityScenario:
      responsibilityScenario.length >= 20 &&
      responsibilityScenario.length <= 2500,
    motivationFactor:
      motivationFactor.length >= 10 && motivationFactor.length <= 1500,
    additionalNotes: additionalNotes.length <= 2000,
    consent: payload.consent === true,
  };
  const invalidFields = Object.entries(fields)
    .filter(([, valid]) => !valid)
    .map(([field]) => field);
  if (invalidFields.length)
    return json(
      { ok: false, code: 'validation_failed', fields: invalidFields },
      400,
    );
  if (turnstileToken.length < 20 || turnstileToken.length > 2048) {
    return json({ ok: false, code: 'verification_required' }, 400);
  }

  const turnstileSecret = runtimeEnv.TURNSTILE_SECRET_KEY;
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!turnstileSecret || !database)
    return json({ ok: false, code: 'service_unavailable' }, 503);

  const verificationBody = new FormData();
  verificationBody.set('secret', turnstileSecret);
  verificationBody.set('response', turnstileToken);
  verificationBody.set('idempotency_key', crypto.randomUUID());
  const visitorIp = request.headers.get('CF-Connecting-IP');
  if (visitorIp) verificationBody.set('remoteip', visitorIp);

  let verification: TurnstileResult;
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: verificationBody,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok)
      return json({ ok: false, code: 'verification_unavailable' }, 503);
    verification = (await response.json()) as TurnstileResult;
  } catch {
    return json({ ok: false, code: 'verification_unavailable' }, 503);
  }

  if (
    !verification?.success ||
    verification.action !== 'application' ||
    !verification.hostname ||
    !ALLOWED_HOSTNAMES.has(verification.hostname)
  ) {
    return json({ ok: false, code: 'verification_failed' }, 400);
  }

  const applicationId = crypto.randomUUID();
  const submittedAt = Date.now();
  try {
    const result = await insertApplication(database, {
      id: applicationId,
      submittedAt,
      name,
      email,
      phone,
      university,
      academicDepartment,
      classLevel,
      linkedin,
      portfolio,
      primaryTeam,
      secondaryTeam,
      programs,
      weeklyHours,
      summerParticipation,
      busyPeriods,
      communityExperience,
      communityDetails,
      projects,
      motivation,
      responsibilityScenario,
      motivationFactor,
      additionalNotes,
      language,
    });
    if (!result.success || result.meta.changes !== 1) {
      throw new Error('Application insert did not succeed');
    }
  } catch {
    console.error('Application persistence failed', { applicationId });
    return json({ ok: false, code: 'storage_failed' }, 503);
  }

  return json({ ok: true, stored: true });
}
