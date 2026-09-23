const SESSION_COOKIE = 'sauformula_panel_session';
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 180;

export type PanelSessionEnv = {
  APPLICATIONS_DB?: D1Database;
};

type PanelSessionRow = {
  member_email: string;
  google_subject: string;
  expires_at: number;
  revoked_at: number | null;
};

export type PanelSessionIdentity = {
  email: string;
  googleSubject: string;
  tokenHash: string;
};

function base64Url(bytes: Uint8Array) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function randomUrlSafeValue(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function parseCookies(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  for (const item of (cookieHeader ?? '').split(';')) {
    const separator = item.indexOf('=');
    if (separator < 1) continue;
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (!name) continue;
    try {
      cookies.set(name, decodeURIComponent(value));
    } catch {
      cookies.set(name, value);
    }
  }
  return cookies;
}

function cookieSecurity(requestUrl: string) {
  return new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
}

function cookieName(name: string, requestUrl: string) {
  return new URL(requestUrl).protocol === 'https:' ? `__Host-${name}` : name;
}

export function sessionCookie(value: string, requestUrl: string) {
  return `${cookieName(SESSION_COOKIE, requestUrl)}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${cookieSecurity(requestUrl)}`;
}

export function clearSessionCookie(requestUrl: string) {
  return `${cookieName(SESSION_COOKIE, requestUrl)}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieSecurity(requestUrl)}`;
}

export function flowCookie(
  name: 'state' | 'nonce' | 'verifier',
  value: string,
  requestUrl: string,
) {
  const nameWithPrefix = cookieName(`sauformula_oauth_${name}`, requestUrl);
  return `${nameWithPrefix}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${cookieSecurity(requestUrl)}`;
}

export function clearFlowCookie(
  name: 'state' | 'nonce' | 'verifier',
  requestUrl: string,
) {
  const nameWithPrefix = cookieName(`sauformula_oauth_${name}`, requestUrl);
  return `${nameWithPrefix}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieSecurity(requestUrl)}`;
}

export function readFlowCookies(request: Request) {
  const cookies = parseCookies(request.headers.get('cookie'));
  return {
    state:
      cookies.get(cookieName('sauformula_oauth_state', request.url)) ?? '',
    nonce:
      cookies.get(cookieName('sauformula_oauth_nonce', request.url)) ?? '',
    verifier:
      cookies.get(cookieName('sauformula_oauth_verifier', request.url)) ?? '',
  };
}

export function hasPanelSessionCookie(request: Request) {
  const cookies = parseCookies(request.headers.get('cookie'));
  return cookies.has(cookieName(SESSION_COOKIE, request.url));
}

export async function createPanelSession(
  database: D1Database,
  identity: { email: string; googleSubject: string },
) {
  const token = randomUrlSafeValue();
  const tokenHash = await sha256Hex(token);
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_SECONDS * 1000;

  await database.batch([
    database
      .prepare(
        'DELETE FROM panel_sessions WHERE expires_at <= ? OR (revoked_at IS NOT NULL AND revoked_at <= ?)',
      )
      .bind(now, now - 30 * 24 * 60 * 60 * 1000),
    database
      .prepare(
        `INSERT INTO panel_sessions (token_hash, member_email, google_subject, created_at, expires_at, last_seen_at, revoked_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      )
      .bind(
        tokenHash,
        identity.email,
        identity.googleSubject,
        now,
        expiresAt,
        now,
      ),
    database
      .prepare(
        `INSERT INTO panel_auth_events (id, member_email, google_subject, action, detail, created_at)
         VALUES (?, ?, ?, 'login_succeeded', '', ?)`,
      )
      .bind(crypto.randomUUID(), identity.email, identity.googleSubject, now),
  ]);

  return { token, expiresAt };
}

export async function recordPanelAuthEvent(
  database: D1Database,
  input: {
    email?: string;
    googleSubject?: string;
    action: 'login_denied' | 'login_failed' | 'logout';
    detail?: string;
  },
) {
  await database
    .prepare(
      `INSERT INTO panel_auth_events (id, member_email, google_subject, action, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.email ?? '',
      input.googleSubject ?? '',
      input.action,
      (input.detail ?? '').slice(0, 200),
      Date.now(),
    )
    .run();
}

export async function getPanelSessionIdentity(
  request: Request,
  database: D1Database,
): Promise<PanelSessionIdentity | null> {
  const cookies = parseCookies(request.headers.get('cookie'));
  const token = cookies
    .get(cookieName(SESSION_COOKIE, request.url))
    ?.trim() ?? '';
  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const row = await database
    .prepare(
      `SELECT member_email, google_subject, expires_at, revoked_at
       FROM panel_sessions WHERE token_hash = ? LIMIT 1`,
    )
    .bind(tokenHash)
    .first<PanelSessionRow>();
  if (!row || row.revoked_at !== null || row.expires_at <= Date.now())
    return null;

  return {
    email: row.member_email.trim().toLowerCase(),
    googleSubject: row.google_subject,
    tokenHash,
  };
}

export async function refreshPanelSession(
  request: Request,
  database: D1Database,
) {
  const cookies = parseCookies(request.headers.get('cookie'));
  const token =
    cookies.get(cookieName(SESSION_COOKIE, request.url))?.trim() ?? '';
  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_SECONDS * 1000;
  const update = await database
    .prepare(
      `UPDATE panel_sessions
       SET expires_at = ?, last_seen_at = ?
       WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?`,
    )
    .bind(expiresAt, now, tokenHash, now)
    .run();
  return update.meta.changes > 0 ? { token, expiresAt } : null;
}

export async function revokePanelSession(
  request: Request,
  database: D1Database,
) {
  const identity = await getPanelSessionIdentity(request, database);
  if (!identity) return null;
  const now = Date.now();
  await database.batch([
    database
      .prepare(
        'UPDATE panel_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL',
      )
      .bind(now, identity.tokenHash),
    database
      .prepare(
        `INSERT INTO panel_auth_events (id, member_email, google_subject, action, detail, created_at)
         VALUES (?, ?, ?, 'logout', '', ?)`,
      )
      .bind(
        crypto.randomUUID(),
        identity.email,
        identity.googleSubject,
        now,
      ),
  ]);
  return identity;
}

export function hasTrustedMutationOrigin(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  return Boolean(origin && origin === new URL(request.url).origin);
}
