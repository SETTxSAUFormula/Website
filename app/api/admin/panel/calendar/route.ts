import { env } from 'cloudflare:workers';

import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import {
  createTeamCalendarEvent,
  deleteTeamCalendarEvent,
  isGoogleCalendarConfigured,
  listTeamCalendarEvents,
  updateTeamCalendarEvent,
  type GoogleCalendarEnv,
} from '@/lib/google-calendar';
import { hasPanelPermission } from '@/lib/panel-authorization';
import { listTurkeyHolidayEvents } from '@/lib/turkey-holidays';

type RuntimeEnv = GoogleCalendarEnv & PanelAccessEnv;

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

async function authorize(
  request: Request,
  permission: 'calendar.read' | 'calendar.manage',
) {
  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user) return null;
  return hasPanelPermission(user, permission) ? user : null;
}

export async function GET(request: Request) {
  const user = await authorize(request, 'calendar.read');
  if (!user)
    return json({ ok: false, error: 'Bu işlem için yetkiniz yok.' }, 403);
  if (!isGoogleCalendarConfigured(runtimeEnv)) {
    return json(
      { ok: false, error: 'Takvim bağlantısı henüz yapılandırılmadı.' },
      503,
    );
  }

  const url = new URL(request.url);
  const start = url.searchParams.get('start')?.trim() ?? '';
  const end = url.searchParams.get('end')?.trim() ?? '';
  const startTime = Date.parse(start);
  const endTime = Date.parse(end);
  const hasRange = start.length > 0 || end.length > 0;

  if (
    hasRange &&
    (!Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      endTime <= startTime ||
      endTime - startTime > 370 * 24 * 60 * 60 * 1_000)
  ) {
    return json({ ok: false, error: 'Geçersiz takvim tarih aralığı.' }, 400);
  }

  try {
    const range = hasRange ? { start, end } : undefined;
    const holidaysRequest = listTurkeyHolidayEvents(range).catch((error) => {
      console.error('Turkey holiday calendar list failed', error);
      return [];
    });
    const teamEvents = await listTeamCalendarEvents(runtimeEnv, range);
    const holidays = await holidaysRequest;
    const events = [...teamEvents, ...holidays].sort(
      (left, right) => Date.parse(left.start) - Date.parse(right.start),
    );
    return json({ ok: true, events, viewer: user.email });
  } catch (error) {
    console.error('Calendar list failed', error);
    return json({ ok: false, error: 'Takvim etkinlikleri alınamadı.' }, 502);
  }
}

export async function POST(request: Request) {
  const user = await authorize(request, 'calendar.manage');
  if (!user)
    return json({ ok: false, error: 'Bu işlem için yetkiniz yok.' }, 403);
  if (!isGoogleCalendarConfigured(runtimeEnv)) {
    return json(
      { ok: false, error: 'Takvim bağlantısı henüz yapılandırılmadı.' },
      503,
    );
  }

  let payload: {
    title?: unknown;
    description?: unknown;
    location?: unknown;
    start?: unknown;
    end?: unknown;
    category?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  }

  const title =
    typeof payload.title === 'string' ? payload.title.trim().slice(0, 160) : '';
  const description =
    typeof payload.description === 'string'
      ? payload.description.trim().slice(0, 4_000)
      : '';
  const location =
    typeof payload.location === 'string'
      ? payload.location.trim().slice(0, 300)
      : '';
  const start = typeof payload.start === 'string' ? payload.start.trim() : '';
  const end = typeof payload.end === 'string' ? payload.end.trim() : '';
  const category = payload.category === 'competition' ? 'competition' : 'event';
  const startTime = Date.parse(start);
  const endTime = Date.parse(end);

  if (
    !title ||
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    endTime <= startTime
  ) {
    return json(
      { ok: false, error: 'Başlık ve geçerli bir tarih aralığı gereklidir.' },
      400,
    );
  }

  try {
    const event = await createTeamCalendarEvent(runtimeEnv, {
      title,
      description,
      location,
      start,
      end,
      createdBy: user.email,
      category,
    });
    return json({ ok: true, event, createdBy: user.email }, 201);
  } catch (error) {
    console.error('Calendar create failed', error);
    return json(
      { ok: false, error: 'Etkinlik Google Takvim’e eklenemedi.' },
      502,
    );
  }
}

export async function PATCH(request: Request) {
  const user = await authorize(request, 'calendar.manage');
  if (!user)
    return json({ ok: false, error: 'Bu işlem için yetkiniz yok.' }, 403);
  if (!isGoogleCalendarConfigured(runtimeEnv)) {
    return json(
      { ok: false, error: 'Takvim bağlantısı henüz yapılandırılmadı.' },
      503,
    );
  }

  let payload: {
    id?: unknown;
    title?: unknown;
    description?: unknown;
    location?: unknown;
    start?: unknown;
    end?: unknown;
    category?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  }

  const id = typeof payload.id === 'string' ? payload.id.trim() : '';
  const title =
    typeof payload.title === 'string' ? payload.title.trim().slice(0, 160) : '';
  const description =
    typeof payload.description === 'string'
      ? payload.description.trim().slice(0, 4_000)
      : '';
  const location =
    typeof payload.location === 'string'
      ? payload.location.trim().slice(0, 300)
      : '';
  const start = typeof payload.start === 'string' ? payload.start.trim() : '';
  const end = typeof payload.end === 'string' ? payload.end.trim() : '';
  const category = payload.category === 'competition' ? 'competition' : 'event';
  const startTime = Date.parse(start);
  const endTime = Date.parse(end);

  if (
    !id ||
    id.startsWith('turkey-holiday-') ||
    !title ||
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    endTime <= startTime
  ) {
    return json(
      { ok: false, error: 'Etkinlik ve geçerli bir tarih aralığı gereklidir.' },
      400,
    );
  }

  try {
    const event = await updateTeamCalendarEvent(runtimeEnv, id, {
      title,
      description,
      location,
      start,
      end,
      category,
    });
    return json({ ok: true, event, updatedBy: user.email });
  } catch (error) {
    console.error('Calendar update failed', error);
    return json(
      { ok: false, error: 'Etkinlik Google Takvim’de güncellenemedi.' },
      502,
    );
  }
}

export async function DELETE(request: Request) {
  const user = await authorize(request, 'calendar.manage');
  if (!user)
    return json({ ok: false, error: 'Bu işlem için yetkiniz yok.' }, 403);
  if (!isGoogleCalendarConfigured(runtimeEnv)) {
    return json(
      { ok: false, error: 'Takvim bağlantısı henüz yapılandırılmadı.' },
      503,
    );
  }

  let payload: { id?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  }
  const id = typeof payload.id === 'string' ? payload.id.trim() : '';
  if (!id || id.startsWith('turkey-holiday-'))
    return json({ ok: false, error: 'Bu etkinlik kaldırılamaz.' }, 400);

  try {
    await deleteTeamCalendarEvent(runtimeEnv, id);
    return json({ ok: true, deletedId: id, deletedBy: user.email });
  } catch (error) {
    console.error('Calendar delete failed', error);
    return json(
      { ok: false, error: 'Etkinlik Google Takvim’den kaldırılamadı.' },
      502,
    );
  }
}
