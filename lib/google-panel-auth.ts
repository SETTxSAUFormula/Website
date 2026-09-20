import { createRemoteJWKSet, jwtVerify } from 'jose';

import { validGoogleIdentityClaims } from '@/lib/panel-auth-validation';
import { randomUrlSafeValue, sha256Hex } from '@/lib/panel-session';

const GOOGLE_AUTHORIZATION_ENDPOINT =
  'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);

export type PanelGoogleAuthEnv = {
  PANEL_GOOGLE_CLIENT_ID?: string;
  PANEL_GOOGLE_CLIENT_SECRET?: string;
  PANEL_AUTH_ORIGIN?: string;
};

export function getPanelGoogleConfig(
  request: Request,
  runtimeEnv: PanelGoogleAuthEnv,
) {
  const clientId = runtimeEnv.PANEL_GOOGLE_CLIENT_ID?.trim() ?? '';
  const clientSecret = runtimeEnv.PANEL_GOOGLE_CLIENT_SECRET?.trim() ?? '';
  const requestUrl = new URL(request.url);
  const configuredOrigin = runtimeEnv.PANEL_AUTH_ORIGIN?.trim() ?? '';
  let origin = '';

  try {
    const parsedOrigin = configuredOrigin
      ? new URL(configuredOrigin)
      : requestUrl.hostname === 'localhost' ||
          requestUrl.hostname === '127.0.0.1'
        ? new URL(requestUrl.origin)
        : null;
    const localOrigin =
      parsedOrigin?.hostname === 'localhost' ||
      parsedOrigin?.hostname === '127.0.0.1';
    origin =
      parsedOrigin && (parsedOrigin.protocol === 'https:' || localOrigin)
        ? parsedOrigin.origin
        : '';
  } catch {
    origin = '';
  }

  if (!clientId || !clientSecret || !origin) return null;
  return {
    clientId,
    clientSecret,
    origin,
    redirectUri: `${origin}/api/auth/google/callback`,
  };
}

function base64UrlFromHex(hex: string) {
  const bytes = new Uint8Array(
    hex.match(/.{2}/g)?.map((value) => Number.parseInt(value, 16)) ?? [],
  );
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function createGoogleAuthorization(
  request: Request,
  runtimeEnv: PanelGoogleAuthEnv,
) {
  const config = getPanelGoogleConfig(request, runtimeEnv);
  if (!config) return null;

  const state = randomUrlSafeValue();
  const nonce = randomUrlSafeValue();
  const verifier = randomUrlSafeValue(48);
  const challenge = base64UrlFromHex(await sha256Hex(verifier));
  const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'openid email',
    redirect_uri: config.redirectUri,
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();

  return { authorizationUrl, state, nonce, verifier };
}

export async function exchangeGoogleAuthorizationCode(
  request: Request,
  runtimeEnv: PanelGoogleAuthEnv,
  input: { code: string; verifier: string; nonce: string },
) {
  const config = getPanelGoogleConfig(request, runtimeEnv);
  if (!config) return null;

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: input.code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
      code_verifier: input.verifier,
    }),
  });
  if (!response.ok) return null;
  const tokens = (await response.json()) as { id_token?: unknown };
  if (typeof tokens.id_token !== 'string') return null;

  const { payload } = await jwtVerify(tokens.id_token, GOOGLE_JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: config.clientId,
    maxTokenAge: '10m',
    clockTolerance: 5,
  });
  return validGoogleIdentityClaims(payload, input.nonce);
}
