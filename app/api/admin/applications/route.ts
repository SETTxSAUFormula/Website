import { env } from 'cloudflare:workers';

import {
  applicationStatuses,
  deleteApplications,
  listApplications,
  updateApplicationReview,
  type ApplicationStatus,
} from '@/lib/applications-db';
import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import { hasPanelPermission } from '@/lib/panel-authorization';

type RuntimeEnv = PanelAccessEnv;

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
  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user || !hasPanelPermission(user, 'applications.manage'))
    return json({ ok: false }, 403);
  if (!runtimeEnv.APPLICATIONS_DB) return json({ ok: false }, 503);

  const url = new URL(request.url);
  try {
    const applications = await listApplications(runtimeEnv.APPLICATIONS_DB, {
      status: url.searchParams.get('status') ?? '',
      team: url.searchParams.get('team') ?? '',
      search: url.searchParams.get('search') ?? '',
      limit: Number(url.searchParams.get('limit') ?? 100),
    });
    return json({ ok: true, applications, viewer: user.email });
  } catch {
    return json({ ok: false }, 500);
  }
}

export async function PATCH(request: Request) {
  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user || !hasPanelPermission(user, 'applications.manage'))
    return json({ ok: false }, 403);
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
      reviewedBy: user.email,
    });
    return json({ ok: updated }, updated ? 200 : 404);
  } catch {
    return json({ ok: false }, 500);
  }
}

export async function DELETE(request: Request) {
  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user || !hasPanelPermission(user, 'applications.manage'))
    return json({ ok: false }, 403);
  if (!runtimeEnv.APPLICATIONS_DB) return json({ ok: false }, 503);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const rawIds =
    payload && typeof payload === 'object' && 'ids' in payload
      ? (payload as { ids?: unknown }).ids
      : undefined;
  if (
    !Array.isArray(rawIds) ||
    rawIds.length === 0 ||
    rawIds.length > 100 ||
    rawIds.some(
      (id) =>
        typeof id !== 'string' ||
        id.trim().length === 0 ||
        id.trim().length > 128,
    )
  ) {
    return json({ ok: false }, 400);
  }

  const ids = [...new Set(rawIds.map((id) => (id as string).trim()))];

  try {
    const deleted = await deleteApplications(runtimeEnv.APPLICATIONS_DB, ids);
    return json({ ok: true, deleted });
  } catch {
    return json({ ok: false }, 500);
  }
}
