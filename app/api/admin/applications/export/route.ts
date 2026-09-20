import { env } from 'cloudflare:workers';

import { listAcceptedApplications } from '@/lib/applications-db';
import { buildAcceptedApplicationsWorkbook } from '@/lib/applications-export';
import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import { hasPanelPermission } from '@/lib/panel-authorization';

type RuntimeEnv = PanelAccessEnv;

const runtimeEnv = env as unknown as RuntimeEnv;

export async function GET(request: Request) {
  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user || !hasPanelPermission(user, 'applications.manage'))
    return Response.json({ ok: false }, { status: 403 });
  if (!runtimeEnv.APPLICATIONS_DB)
    return Response.json({ ok: false }, { status: 503 });

  try {
    const applications = await listAcceptedApplications(
      runtimeEnv.APPLICATIONS_DB,
    );
    const workbook = buildAcceptedApplicationsWorkbook(applications);
    const body = workbook.buffer.slice(
      workbook.byteOffset,
      workbook.byteOffset + workbook.byteLength,
    ) as ArrayBuffer;
    const date = new Date().toISOString().slice(0, 10);

    return new Response(body, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="SAUFormula-Kabul-Edilenler-${date}.xlsx"`,
        'Cache-Control': 'no-store, private',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
