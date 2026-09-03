const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_EMAIL_URL = 'https://api.resend.com/emails';
const CONTACT_RECIPIENT = 'info@sauformula.org';
const CONTACT_SENDER = 'SAUFormula Website <website@forms.sauformula.org>';
const ALLOWED_HOSTNAMES = new Set(['sauformula.org', 'www.sauformula.org']);

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  language?: unknown;
  turnstileToken?: unknown;
  company?: unknown;
};

type TurnstileResult = {
  success?: boolean;
  hostname?: string;
  action?: string;
};

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

function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;

  try {
    return new URL(origin).hostname === new URL(request.url).hostname;
  } catch {
    return false;
  }
}

export function GET() {
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  if (!siteKey) return json({ ok: false }, 503);
  return json({ ok: true, siteKey });
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return json({ ok: false }, 403);

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 16_000) return json({ ok: false }, 413);

  let payload: ContactPayload;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 16_000) return json({ ok: false }, 413);
    payload = JSON.parse(rawBody) as ContactPayload;
  } catch {
    return json({ ok: false }, 400);
  }

  // Honeypot: bots commonly fill fields that are hidden from people.
  if (readText(payload.company)) return json({ ok: true });

  const name = readText(payload.name);
  const email = readText(payload.email).toLowerCase();
  const subject = readText(payload.subject);
  const message = readText(payload.message);
  const language = payload.language === 'en' ? 'en' : 'tr';
  const turnstileToken = readText(payload.turnstileToken);

  if (
    name.length < 2 ||
    name.length > 100 ||
    !isEmail(email) ||
    subject.length < 2 ||
    subject.length > 100 ||
    message.length < 10 ||
    message.length > 5_000 ||
    turnstileToken.length < 20 ||
    turnstileToken.length > 2_048
  ) {
    return json({ ok: false }, 400);
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
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
    verification.action !== 'contact' ||
    !verification.hostname ||
    !ALLOWED_HOSTNAMES.has(verification.hostname)
  ) {
    return json({ ok: false }, 400);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const receivedAt = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  let emailResponse: Response;
  try {
    emailResponse = await fetch(RESEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `contact-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        from: CONTACT_SENDER,
        to: [CONTACT_RECIPIENT],
        reply_to: email,
        subject: `[SAUFormula] ${subject}`,
        text: `Ad Soyad / Name: ${name}\nE-posta / Email: ${email}\nKonu / Subject: ${subject}\nDil / Language: ${language.toUpperCase()}\nTarih / Date: ${receivedAt}\n\n${message}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><h2 style="margin:0 0 20px">Yeni web sitesi mesajı</h2><p><strong>Ad Soyad:</strong> ${safeName}<br><strong>E-posta:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a><br><strong>Konu:</strong> ${safeSubject}<br><strong>Dil:</strong> ${language.toUpperCase()}<br><strong>Tarih:</strong> ${escapeHtml(receivedAt)}</p><hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0"><p>${safeMessage}</p></div>`,
        tags: [{ name: 'source', value: 'contact-form' }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return json({ ok: false }, 502);
  }

  if (!emailResponse.ok) return json({ ok: false }, 502);
  return json({ ok: true });
}
