import { env } from 'cloudflare:workers';

import { listAcceptedApplications } from '@/lib/applications-db';
import { buildAcceptedApplicationsWorkbook } from '@/lib/applications-export';
import { requireCloudflareAccess } from '@/lib/cloudflare-access';

type RuntimeEnv = {
  APPLICATIONS_DB?: D1Database;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};

const runtimeEnv = env as unknown as RuntimeEnv;

export async function GET(request: Request) {
  const identity = await requireCloudflareAccess(request, runtimeEnv);
  if (!identity) return Response.json({ ok: false }, { status: 401 });
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
