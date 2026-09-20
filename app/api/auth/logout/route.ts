import { env } from 'cloudflare:workers';

import {
  clearSessionCookie,
  hasTrustedMutationOrigin,
  revokePanelSession,
  type PanelSessionEnv,
} from '@/lib/panel-session';

const runtimeEnv = env as unknown as PanelSessionEnv;

export async function POST(request: Request) {
  if (hasTrustedMutationOrigin(request) && runtimeEnv.APPLICATIONS_DB) {
    try {
      await revokePanelSession(request, runtimeEnv.APPLICATIONS_DB);
    } catch (error) {
      console.error('Panel session logout failed', error);
    }
  }

  const headers = new Headers({
    Location: new URL('/panel/giris', request.url).toString(),
    'Cache-Control': 'no-store, private',
  });
  headers.append('Set-Cookie', clearSessionCookie(request.url));
  return new Response(null, { status: 303, headers });
}
