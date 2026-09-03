import { env } from 'cloudflare:workers';

import {
  applicationStatuses,
  listApplications,
  updateApplicationReview,
  type ApplicationStatus,
} from '@/lib/applications-db';
import { requireCloudflareAccess } from '@/lib/cloudflare-access';

type RuntimeEnv = {
  APPLICATIONS_DB?: D1Database;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};

const runtimeEnv = env as unknown as RuntimeEnv;

function json(data: Record<string, unknown>, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET(request: Request) {
  const identity = await requireCloudflareAccess(request, runtimeEnv);
  if (!identity) return json({ ok: false }, 401);
  if (!runtimeEnv.APPLICATIONS_DB) return json({ ok: false }, 503);

  const url = new URL(request.url);
  try {
    const applications = await listApplications(runtimeEnv.APPLICATIONS_DB, {
      status: url.searchParams.get('status') ?? '',
      team: url.searchParams.get('team') ?? '',
      search: url.searchParams.get('search') ?? '',
      limit: Number(url.searchParams.get('limit') ?? 100),
    });
    return json({ ok: true, applications, viewer: identity.email });
  } catch {
    return json({ ok: false }, 500);
  }
}

export async function PATCH(request: Request) {
  const identity = await requireCloudflareAccess(request, runtimeEnv);
  if (!identity) return json({ ok: false }, 401);
  if (!runtimeEnv.APPLICATIONS_DB) return json({ ok: false }, 503);

  let payload: {
    id?: unknown;
    status?: unknown;
    assignedDepartment?: unknown;
    reviewerNote?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false }, 400);
  }

  const id = typeof payload.id === 'string' ? payload.id.trim() : '';
  const status = typeof payload.status === 'string' ? payload.status : undefined;
  const assignedDepartment =
    typeof payload.assignedDepartment === 'string' ? payload.assignedDepartment.trim().slice(0, 100) : undefined;
  const reviewerNote =
    typeof payload.reviewerNote === 'string' ? payload.reviewerNote.trim().slice(0, 4_000) : undefined;

  if (!id || (status !== undefined && !applicationStatuses.includes(status as ApplicationStatus))) {
    return json({ ok: false }, 400);
  }
  if (status === undefined && assignedDepartment === undefined && reviewerNote === undefined) {
    return json({ ok: false }, 400);
  }

  try {
    const updated = await updateApplicationReview(runtimeEnv.APPLICATIONS_DB, {
      id,
      status: status as ApplicationStatus | undefined,
      assignedDepartment,
      reviewerNote,
      reviewedBy: identity.email,
    });
    return json({ ok: updated }, updated ? 200 : 404);
  } catch {
    return json({ ok: false }, 500);
  }
}
