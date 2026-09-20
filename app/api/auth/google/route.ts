import { env } from 'cloudflare:workers';

import {
  createGoogleAuthorization,
  getPanelGoogleConfig,
  type PanelGoogleAuthEnv,
} from '@/lib/google-panel-auth';
import { flowCookie } from '@/lib/panel-session';

const runtimeEnv = env as unknown as PanelGoogleAuthEnv;

function loginError(request: Request) {
  const url = new URL('/panel/giris', request.url);
  url.searchParams.set('error', 'config');
  return Response.redirect(url, 303);
}

export async function GET(request: Request) {
  const config = getPanelGoogleConfig(request, runtimeEnv);
  if (config && new URL(request.url).origin !== config.origin)
    return Response.redirect(`${config.origin}/api/auth/google`, 302);

  const authorization = await createGoogleAuthorization(request, runtimeEnv);
  if (!authorization) return loginError(request);

  const headers = new Headers({
    Location: authorization.authorizationUrl.toString(),
    'Cache-Control': 'no-store, private',
    'Referrer-Policy': 'no-referrer',
  });
  headers.append(
    'Set-Cookie',
    flowCookie('state', authorization.state, request.url),
  );
  headers.append(
    'Set-Cookie',
    flowCookie('nonce', authorization.nonce, request.url),
  );
  headers.append(
    'Set-Cookie',
    flowCookie('verifier', authorization.verifier, request.url),
  );
  return new Response(null, { status: 302, headers });
}
