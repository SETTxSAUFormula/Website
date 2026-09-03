import { env } from 'cloudflare:workers';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_EMAIL_URL = 'https://api.resend.com/emails';
const APPLICATION_RECIPIENT = 'info@sauformula.org';
const APPLICATION_SENDER = 'SAUFormula Başvuru <applications@forms.sauformula.org>';
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
  'vehicle-dynamics': 'Vehicle Dynamics — Araç Dinamiği',
  'chassis-structures': 'Chassis & Structures — Şasi ve Yapısal Sistemler',
  powertrain: 'Powertrain — Güç Aktarma Sistemi',
  aerodynamics: 'Aerodynamics — Aerodinamik',
  'composites-manufacturing': 'Composites & Manufacturing — Kompozitler ve Üretim',
  'electrical-electronics': 'Electrical & Electronics — Elektrik ve Elektronik',
  'sponsorship-partnerships': 'Sponsorship & Partnerships — Sponsorluk ve İş Birlikleri',
  'media-communications': 'Media & Communications — Medya ve İletişim',
  'finance-operations': 'Finance & Operations — Finans ve Operasyon',
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

const motivationLabels = {
  production: 'Somut bir araç ve ürün ortaya çıkarmak',
  learning: 'Teknik ve kişisel olarak gelişmek',
  competition: 'Yarışma ortamında yer almak',
  teamwork: 'Disiplinler arası bir ekiple çalışmak',
  career: 'Kariyer ve profesyonel çevre kazanmak',
  other: 'Diğer',
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
  RESEND_API_KEY?: string;
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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return entities[character];
  });
}

function htmlText(value: string) {
  return escapeHtml(value).replace(/\n/g, '<br>');
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

function isKeyOf<T extends object>(value: string, object: T): value is Extract<keyof T, string> {
  return value in object;
}

function infoRow(label: string, value: string) {
  return `<tr><td style="width:190px;padding:10px 14px;border-bottom:1px solid #dbe7e1;color:#557066;font-size:13px;font-weight:700;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 14px;border-bottom:1px solid #dbe7e1;color:#10231c;font-size:14px;line-height:1.55;vertical-align:top">${htmlText(value || '—')}</td></tr>`;
}

function responseBlock(title: string, value: string) {
  return `<div style="margin:0 0 14px;padding:16px 18px;border:1px solid #dbe7e1;background:#f8fbf9"><div style="margin-bottom:7px;color:#26724e;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase">${escapeHtml(title)}</div><div style="color:#10231c;font-size:14px;line-height:1.65">${htmlText(value || '—')}</div></div>`;
}

export function GET() {
  const siteKey = runtimeEnv.TURNSTILE_SITE_KEY;
  if (!siteKey) return json({ ok: false }, 503);
  return json({ ok: true, siteKey });
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return json({ ok: false }, 403);

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 48_000) return json({ ok: false }, 413);

  let payload: ApplicationPayload;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 48_000) return json({ ok: false }, 413);
    payload = JSON.parse(rawBody) as ApplicationPayload;
  } catch {
    return json({ ok: false }, 400);
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

  const valid =
    name.length >= 2 &&
    name.length <= 100 &&
    isEmail(email) &&
    phone.length >= 7 &&
    phone.length <= 30 &&
    isKeyOf(university, universityLabels) &&
    academicDepartment.length >= 2 &&
    academicDepartment.length <= 120 &&
    isKeyOf(classLevel, classLabels) &&
    isOptionalHttpUrl(linkedin) &&
    isOptionalHttpUrl(portfolio) &&
    isKeyOf(primaryTeam, teamLabels) &&
    (!secondaryTeam || isKeyOf(secondaryTeam, teamLabels)) &&
    secondaryTeam !== primaryTeam &&
    programs.length >= 2 &&
    programs.length <= 1_500 &&
    isKeyOf(weeklyHours, weeklyHoursLabels) &&
    isKeyOf(summerParticipation, availabilityLabels) &&
    isKeyOf(busyPeriods, availabilityLabels) &&
    (communityExperience === 'yes' || communityExperience === 'no') &&
    (communityExperience === 'no' || (communityDetails.length >= 10 && communityDetails.length <= 2_000)) &&
    projects.length >= 10 &&
    projects.length <= 2_500 &&
    motivation.length >= 20 &&
    motivation.length <= 2_500 &&
    responsibilityScenario.length >= 20 &&
    responsibilityScenario.length <= 2_500 &&
    isKeyOf(motivationFactor, motivationLabels) &&
    additionalNotes.length <= 2_000 &&
    payload.consent === true &&
    turnstileToken.length >= 20 &&
    turnstileToken.length <= 2_048;

  if (!valid) return json({ ok: false }, 400);

  const turnstileSecret = runtimeEnv.TURNSTILE_SECRET_KEY;
  const resendApiKey = runtimeEnv.RESEND_API_KEY;
  if (!turnstileSecret || !resendApiKey) return json({ ok: false }, 503);

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
    verification = (await response.json()) as TurnstileResult;
  } catch {
    return json({ ok: false }, 503);
  }

  if (
    !verification.success ||
    verification.action !== 'application' ||
    !verification.hostname ||
    !ALLOWED_HOSTNAMES.has(verification.hostname)
  ) {
    return json({ ok: false }, 400);
  }

  const universityLabel = universityLabels[university];
  const classLabel = classLabels[classLevel];
  const primaryTeamLabel = teamLabels[primaryTeam];
  const secondaryTeamLabel = secondaryTeam && isKeyOf(secondaryTeam, teamLabels) ? teamLabels[secondaryTeam] : 'Belirtilmedi';
  const weeklyHoursLabel = weeklyHoursLabels[weeklyHours];
  const summerLabel = availabilityLabels[summerParticipation];
  const busyPeriodsLabel = availabilityLabels[busyPeriods];
  const motivationFactorLabel = motivationLabels[motivationFactor];
  const receivedAt = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const text = [
    'YENİ SAUFORMULA TAKIM BAŞVURUSU',
    '================================',
    '',
    `Ad Soyad: ${name}`,
    `E-posta: ${email}`,
    `Telefon: ${phone}`,
    `Üniversite: ${universityLabel}`,
    `Bölüm / Program: ${academicDepartment}`,
    `Sınıf: ${classLabel}`,
    `LinkedIn: ${linkedin || 'Belirtilmedi'}`,
    `Portföy / GitHub: ${portfolio || 'Belirtilmedi'}`,
    '',
    'DEPARTMAN VE ZAMAN',
    '-------------------',
    `Birinci tercih: ${primaryTeamLabel}`,
    `İkinci tercih: ${secondaryTeamLabel}`,
    `Haftalık ayırabileceği süre: ${weeklyHoursLabel}`,
    `Yaz atölyelerine katılım: ${summerLabel}`,
    `Yoğun dönemlerde aktif rol: ${busyPeriodsLabel}`,
    '',
    'DENEYİM VE YETKİNLİKLER',
    '------------------------',
    `Bildiği programlar / araçlar:\n${programs}`,
    '',
    `Topluluk deneyimi: ${communityExperience === 'yes' ? 'Var' : 'Yok'}`,
    communityExperience === 'yes' ? `Topluluk deneyimi ayrıntıları:\n${communityDetails}` : '',
    '',
    `Daha önce yaptığı projeler:\n${projects}`,
    '',
    'MOTİVASYON VE TAKIM UYUMU',
    '--------------------------',
    `Takıma katılma nedeni:\n${motivation}`,
    '',
    `Bir sorumluluğu zamanında tamamlayamazsa izleyeceği yol:\n${responsibilityScenario}`,
    '',
    `En çok motive eden unsur: ${motivationFactorLabel}`,
    '',
    `Ek notlar:\n${additionalNotes || 'Yok'}`,
    '',
    `Başvuru dili: ${language.toUpperCase()}`,
    `Gönderim zamanı: ${receivedAt}`,
  ].filter(Boolean).join('\n');

  const html = `<!doctype html><html><body style="margin:0;background:#eef5f1;font-family:Arial,sans-serif;color:#10231c"><div style="max-width:760px;margin:0 auto;padding:24px 12px"><div style="background:#041a12;border-top:5px solid #00e27b;padding:26px 28px;color:#fff"><div style="color:#00e27b;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase">SAUFormula · Yeni Başvuru</div><h1 style="margin:10px 0 6px;font-size:25px;line-height:1.25">${escapeHtml(name)}</h1><div style="color:#b5c8bf;font-size:14px;line-height:1.5">${escapeHtml(primaryTeamLabel)}</div></div><div style="background:#fff;padding:24px 28px"><h2 style="margin:0 0 12px;font-size:18px">Hızlı özet</h2><table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #dbe7e1">${infoRow('Üniversite', universityLabel)}${infoRow('Bölüm / Sınıf', `${academicDepartment} · ${classLabel}`)}${infoRow('Birinci tercih', primaryTeamLabel)}${infoRow('İkinci tercih', secondaryTeamLabel)}${infoRow('Haftalık süre', weeklyHoursLabel)}${infoRow('Gönderim zamanı', receivedAt)}</table><h2 style="margin:28px 0 12px;font-size:18px">İletişim</h2><table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #dbe7e1">${infoRow('E-posta', email)}${infoRow('Telefon', phone)}${infoRow('LinkedIn', linkedin || 'Belirtilmedi')}${infoRow('Portföy / GitHub', portfolio || 'Belirtilmedi')}</table><h2 style="margin:28px 0 12px;font-size:18px">Uygunluk ve zaman</h2><table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #dbe7e1">${infoRow('Yaz atölyelerine katılım', summerLabel)}${infoRow('Yoğun dönemlerde aktif rol', busyPeriodsLabel)}</table><h2 style="margin:28px 0 12px;font-size:18px">Deneyim ve yetkinlikler</h2>${responseBlock('Bildiği programlar ve araçlar', programs)}${responseBlock('Topluluk deneyimi', communityExperience === 'yes' ? communityDetails : 'Daha önce bir toplulukta yer almamış.')}${responseBlock('Daha önce yaptığı projeler', projects)}<h2 style="margin:28px 0 12px;font-size:18px">Motivasyon ve takım uyumu</h2>${responseBlock('Takıma neden katılmak istiyor?', motivation)}${responseBlock('Sorumluluğu zamanında tamamlayamazsa nasıl ilerler?', responsibilityScenario)}${responseBlock('Takımda en çok motive eden unsur', motivationFactorLabel)}${responseBlock('Eklemek istediği diğer bilgiler', additionalNotes || 'Ek bilgi belirtilmedi.')}<div style="margin-top:26px;padding:14px 16px;background:#e7f8ef;border-left:4px solid #00b865;color:#22533d;font-size:13px;line-height:1.55">Başvuru sahibi formdaki veri işleme bilgilendirmesini kabul etti. Yanıtlamak için bu e-postaya doğrudan cevap verebilirsiniz.</div></div></div></body></html>`;

  let emailResponse: Response;
  try {
    emailResponse = await fetch(RESEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `application-${crypto.randomUUID()}`,
        'User-Agent': 'SAUFormula-Website/1.0',
      },
      body: JSON.stringify({
        from: APPLICATION_SENDER,
        to: [APPLICATION_RECIPIENT],
        reply_to: email,
        subject: `[ÖNEMLİ] Yeni takım başvurusu — ${name} · ${primaryTeamLabel.split(' — ')[0]}`,
        text,
        html,
        headers: {
          Importance: 'high',
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'X-Entity-Ref-ID': crypto.randomUUID(),
        },
        tags: [
          { name: 'source', value: 'application-form' },
          { name: 'department', value: primaryTeam },
          { name: 'university', value: university },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return json({ ok: false }, 502);
  }

  if (!emailResponse.ok) return json({ ok: false }, 502);
  return json({ ok: true });
}
