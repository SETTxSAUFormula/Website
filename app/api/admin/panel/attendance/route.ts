import { env } from 'cloudflare:workers';

import {
  attendanceEventIdFromToken,
  createAttendanceQrToken,
  listAttendanceSnapshot,
  verifyAttendanceQrToken,
} from '@/lib/panel-attendance';
import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import { hasPanelPermission, type PanelUser } from '@/lib/panel-authorization';
import { randomUrlSafeValue } from '@/lib/panel-session';

type RuntimeEnv = PanelAccessEnv & {
  PANEL_AUTH_ORIGIN?: string;
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

async function authorize(
  request: Request,
  permission: 'attendance.read' | 'attendance.manage',
) {
  const user = await authorizePanelRequest(request, runtimeEnv);
  return user && hasPanelPermission(user, permission) ? user : null;
}

function textValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.trunc(value)
    : NaN;
}

function activityStatement(
  database: D1Database,
  user: PanelUser,
  input: { action: string; subjectId: string; detail: string },
) {
  return database
    .prepare(
      `INSERT INTO panel_activity
       (id, department, actor_email, action, subject_type, subject_id, detail, created_at)
       VALUES (?, 'team', ?, ?, 'attendance_event', ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      user.email,
      input.action,
      input.subjectId,
      input.detail.slice(0, 500),
      Date.now(),
    );
}

function attendanceOrigin(request: Request) {
  const configured = runtimeEnv.PANEL_AUTH_ORIGIN?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:')
        return parsed.origin;
    } catch {
      // Fall back to the current request origin.
    }
  }
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const user = await authorize(request, 'attendance.read');
  if (!user) return json({ ok: false, error: 'Oturum doğrulanamadı.' }, 401);
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);

  try {
    const canManage = hasPanelPermission(user, 'attendance.manage');
    const snapshot = await listAttendanceSnapshot(database, user, canManage);
    return json({ ok: true, snapshot });
  } catch (error) {
    console.error('Attendance list failed', error);
    return json({ ok: false, error: 'Devamsızlık kayıtları alınamadı.' }, 500);
  }
}

export async function POST(request: Request) {
  const user = await authorize(request, 'attendance.read');
  if (!user) return json({ ok: false, error: 'Oturum doğrulanamadı.' }, 401);
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  }

  const type = textValue(payload.type, 40);
  const now = Date.now();

  try {
    if (type === 'checkin') {
      const token = textValue(payload.token, 300);
      const eventId = attendanceEventIdFromToken(token);
      if (!eventId) return json({ ok: false, error: 'Geçersiz QR kodu.' }, 400);
      const event = await database
        .prepare(
          `SELECT id, title, starts_at, late_after_minutes, status, qr_secret,
                  checkin_opened_at
           FROM panel_attendance_events WHERE id = ? LIMIT 1`,
        )
        .bind(eventId)
        .first<{
          id: string;
          title: string;
          starts_at: number;
          late_after_minutes: number;
          status: string;
          qr_secret: string;
          checkin_opened_at: number | null;
        }>();
      if (!event || event.status !== 'open' || !event.qr_secret)
        return json(
          { ok: false, error: 'Bu etkinliğin yoklaması açık değil.' },
          409,
        );
      if (
        !event.checkin_opened_at ||
        now - event.checkin_opened_at > 8 * 60 * 60 * 1_000
      )
        return json({ ok: false, error: 'Yoklama süresi sona erdi.' }, 410);
      const verified = await verifyAttendanceQrToken(
        token,
        event.id,
        event.qr_secret,
        now,
      );
      if (!verified)
        return json(
          {
            ok: false,
            error: 'QR kodunun süresi doldu. Güncel kodu yeniden tara.',
          },
          410,
        );
      const attendanceStatus =
        now > event.starts_at + event.late_after_minutes * 60_000
          ? 'late'
          : 'present';
      const insert = await database
        .prepare(
          `INSERT OR IGNORE INTO panel_attendance_records
           (id, event_id, member_email, status, checked_in_at, qr_slot, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          event.id,
          user.email,
          attendanceStatus,
          now,
          verified.slot,
          (request.headers.get('user-agent') ?? '').slice(0, 300),
        )
        .run();
      const record = await database
        .prepare(
          `SELECT status, checked_in_at FROM panel_attendance_records
           WHERE event_id = ? AND member_email = ? LIMIT 1`,
        )
        .bind(event.id, user.email)
        .first<{ status: string; checked_in_at: number }>();
      if (insert.meta.changes > 0) {
        await activityStatement(database, user, {
          action: 'QR ile katılım verdi',
          subjectId: event.id,
          detail: event.title,
        }).run();
      }
      return json({
        ok: true,
        event: { id: event.id, title: event.title },
        attendance: {
          status: record?.status ?? attendanceStatus,
          checkedInAt: record?.checked_in_at ?? now,
          alreadyRecorded: insert.meta.changes === 0,
        },
      });
    }

    if (!hasPanelPermission(user, 'attendance.manage'))
      return json({ ok: false, error: 'Bu işlem için yetkiniz yok.' }, 403);

    if (type === 'create') {
      const title = textValue(payload.title, 160);
      const description = textValue(payload.description, 2_000);
      const location = textValue(payload.location, 300);
      const startsAt = numberValue(payload.startsAt);
      const endsAt = numberValue(payload.endsAt);
      const lateAfterMinutes = numberValue(payload.lateAfterMinutes);
      if (
        !title ||
        !Number.isFinite(startsAt) ||
        !Number.isFinite(endsAt) ||
        endsAt <= startsAt ||
        endsAt - startsAt > 12 * 60 * 60 * 1_000 ||
        !Number.isFinite(lateAfterMinutes) ||
        lateAfterMinutes < 0 ||
        lateAfterMinutes > 180
      )
        return json(
          {
            ok: false,
            error:
              'Etkinlik adı, geçerli tarih aralığı ve geç kalma sınırı gereklidir.',
          },
          400,
        );
      const id = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            `INSERT INTO panel_attendance_events
             (id, title, description, location, starts_at, ends_at,
              late_after_minutes, status, qr_secret, created_at, created_by,
              updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', '', ?, ?, ?, ?)`,
          )
          .bind(
            id,
            title,
            description,
            location,
            startsAt,
            endsAt,
            lateAfterMinutes,
            now,
            user.email,
            now,
            user.email,
          ),
        activityStatement(database, user, {
          action: 'Yoklama etkinliği oluşturdu',
          subjectId: id,
          detail: title,
        }),
      ]);
      return json({ ok: true, eventId: id }, 201);
    }

    const eventId = textValue(payload.eventId, 80);
    if (!eventId)
      return json({ ok: false, error: 'Etkinlik bulunamadı.' }, 400);
    const event = await database
      .prepare(
        `SELECT id, title, status, qr_secret FROM panel_attendance_events
         WHERE id = ? LIMIT 1`,
      )
      .bind(eventId)
      .first<{
        id: string;
        title: string;
        status: string;
        qr_secret: string;
      }>();
    if (!event) return json({ ok: false, error: 'Etkinlik bulunamadı.' }, 404);

    if (type === 'open') {
      if (event.status === 'closed')
        return json(
          { ok: false, error: 'Kapatılan yoklama yeniden açılamaz.' },
          409,
        );
      if (event.status !== 'open') {
        await database.batch([
          database
            .prepare(
              `UPDATE panel_attendance_events
               SET status = 'open', qr_secret = ?, checkin_opened_at = ?,
                   checkin_closed_at = NULL, updated_at = ?, updated_by = ?
               WHERE id = ? AND status = 'scheduled'`,
            )
            .bind(randomUrlSafeValue(32), now, now, user.email, event.id),
          activityStatement(database, user, {
            action: 'QR yoklamasını açtı',
            subjectId: event.id,
            detail: event.title,
          }),
        ]);
      }
      return json({ ok: true, eventId: event.id });
    }

    if (type === 'close') {
      if (event.status !== 'open')
        return json({ ok: false, error: 'Yoklama zaten kapalı.' }, 409);
      await database.batch([
        database
          .prepare(
            `UPDATE panel_attendance_events
             SET status = 'closed', qr_secret = '', checkin_closed_at = ?,
                 updated_at = ?, updated_by = ?
             WHERE id = ? AND status = 'open'`,
          )
          .bind(now, now, user.email, event.id),
        activityStatement(database, user, {
          action: 'QR yoklamasını kapattı',
          subjectId: event.id,
          detail: event.title,
        }),
      ]);
      return json({ ok: true, eventId: event.id });
    }

    if (type === 'delete') {
      await database.batch([
        database
          .prepare('DELETE FROM panel_attendance_records WHERE event_id = ?')
          .bind(event.id),
        database
          .prepare('DELETE FROM panel_attendance_events WHERE id = ?')
          .bind(event.id),
        activityStatement(database, user, {
          action: 'Yoklama etkinliğini sildi',
          subjectId: event.id,
          detail: event.title,
        }),
      ]);
      return json({ ok: true, eventId: event.id });
    }

    if (type === 'qr_token') {
      if (event.status !== 'open' || !event.qr_secret)
        return json({ ok: false, error: 'Yoklama açık değil.' }, 409);
      const token = await createAttendanceQrToken(
        event.id,
        event.qr_secret,
        now,
      );
      const checkInUrl = new URL(
        '/panel/devamsizlik/yoklama',
        attendanceOrigin(request),
      );
      checkInUrl.searchParams.set('t', token);
      return json({
        ok: true,
        token,
        checkInUrl: checkInUrl.toString(),
        expiresInSeconds: 30,
      });
    }

    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Attendance operation failed', error);
    return json({ ok: false, error: 'Devamsızlık işlemi tamamlanamadı.' }, 500);
  }
}
