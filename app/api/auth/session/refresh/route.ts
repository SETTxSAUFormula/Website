import { env } from 'cloudflare:workers';

import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import {
  hasTrustedMutationOrigin,
  refreshPanelSession,
  sessionCookie,
} from '@/lib/panel-session';

const runtimeEnv = env as unknown as PanelAccessEnv;

function json(data: Record<string, unknown>, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(request: Request) {
  if (!hasTrustedMutationOrigin(request))
    return json({ ok: false, error: 'Geçersiz istek.' }, 403);
  if (!runtimeEnv.APPLICATIONS_DB)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);

  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user) return json({ ok: false, error: 'Oturum doğrulanamadı.' }, 401);

  const session = await refreshPanelSession(
    request,
    runtimeEnv.APPLICATIONS_DB,
  );
  if (!session) return json({ ok: false, error: 'Oturum yenilenemedi.' }, 401);

  const response = json({ ok: true, expiresAt: session.expiresAt });
  response.headers.append(
    'Set-Cookie',
    sessionCookie(session.token, request.url),
  );
  return response;
}
