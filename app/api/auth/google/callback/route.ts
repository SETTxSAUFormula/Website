import { env } from 'cloudflare:workers';

import {
  exchangeGoogleAuthorizationCode,
  getPanelGoogleConfig,
  type PanelGoogleAuthEnv,
} from '@/lib/google-panel-auth';
import {
  resolveActivePanelUser,
  type PanelAccessEnv,
} from '@/lib/panel-access';
import {
  clearFlowCookie,
  createPanelSession,
  readFlowCookies,
  recordPanelAuthEvent,
  sessionCookie,
} from '@/lib/panel-session';

type RuntimeEnv = PanelGoogleAuthEnv & PanelAccessEnv;

const runtimeEnv = env as unknown as RuntimeEnv;

function panelRedirect(
  request: Request,
  path: string,
  cookies: string[] = [],
) {
  const config = getPanelGoogleConfig(request, runtimeEnv);
  const location = new URL(path, config?.origin ?? new URL(request.url).origin);
  const headers = new Headers({
    Location: location.toString(),
    'Cache-Control': 'no-store, private',
    'Referrer-Policy': 'no-referrer',
  });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

function clearedFlowCookies(request: Request) {
  return [
    clearFlowCookie('state', request.url),
    clearFlowCookie('nonce', request.url),
    clearFlowCookie('verifier', request.url),
  ];
}

function errorRedirect(request: Request, error: string) {
  return panelRedirect(
    request,
    `/panel/giris?error=${encodeURIComponent(error)}`,
    clearedFlowCookies(request),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code')?.trim() ?? '';
  const returnedState = url.searchParams.get('state')?.trim() ?? '';
  const providerError = url.searchParams.get('error')?.trim() ?? '';
  const flow = readFlowCookies(request);

  if (providerError) return errorRedirect(request, 'cancelled');
  if (
    !code ||
    code.length > 4096 ||
    !returnedState ||
    returnedState !== flow.state ||
    !flow.nonce ||
    !flow.verifier
  )
    return errorRedirect(request, 'invalid_flow');
  if (!runtimeEnv.APPLICATIONS_DB) return errorRedirect(request, 'config');

  try {
    const identity = await exchangeGoogleAuthorizationCode(
      request,
      runtimeEnv,
      { code, verifier: flow.verifier, nonce: flow.nonce },
    );
    if (!identity) {
      await recordPanelAuthEvent(runtimeEnv.APPLICATIONS_DB, {
        action: 'login_failed',
        detail: 'google_identity_invalid',
      });
      return errorRedirect(request, 'invalid_identity');
    }

    const user = await resolveActivePanelUser(identity.email, runtimeEnv);
    if (!user) {
      await recordPanelAuthEvent(runtimeEnv.APPLICATIONS_DB, {
        email: identity.email,
        googleSubject: identity.subject,
        action: 'login_denied',
        detail: 'member_not_active',
      });
      return errorRedirect(request, 'not_authorized');
    }

    const session = await createPanelSession(runtimeEnv.APPLICATIONS_DB, {
      email: user.email,
      googleSubject: identity.subject,
    });
    return panelRedirect(request, '/panel', [
      sessionCookie(session.token, request.url),
      ...clearedFlowCookies(request),
    ]);
  } catch (error) {
    console.error('Panel Google sign-in failed', error);
    try {
      await recordPanelAuthEvent(runtimeEnv.APPLICATIONS_DB, {
        action: 'login_failed',
        detail: 'callback_error',
      });
    } catch {
      // The login response should still fail closed if audit persistence fails.
    }
    return errorRedirect(request, 'failed');
  }
}
