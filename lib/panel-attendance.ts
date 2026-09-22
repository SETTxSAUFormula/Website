import type { PanelUser } from '@/lib/panel-authorization';

export const attendanceQrSlotSeconds = 15;

export type AttendanceEventStatus = 'scheduled' | 'open' | 'closed';
export type AttendanceRecordStatus = 'present' | 'late';

export type AttendanceRecordView = {
  memberEmail: string;
  memberName: string;
  status: AttendanceRecordStatus;
  checkedInAt: number;
};

export type AttendanceEventView = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: number;
  endsAt: number;
  lateAfterMinutes: number;
  status: AttendanceEventStatus;
  checkinOpenedAt: number | null;
  checkinClosedAt: number | null;
  createdAt: number;
  createdBy: string;
  attendanceCount: number;
  totalMembers: number;
  viewerAttendance: AttendanceRecordView | null;
  attendees?: AttendanceRecordView[];
};

export type AttendanceSnapshot = {
  viewer: {
    email: string;
    canManage: boolean;
  };
  summary: {
    attended: number;
    total: number;
    late: number;
  };
  events: AttendanceEventView[];
};

type AttendanceEventRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: number;
  ends_at: number;
  late_after_minutes: number;
  status: string;
  checkin_opened_at: number | null;
  checkin_closed_at: number | null;
  created_at: number;
  created_by: string;
};

type AttendanceRecordRow = {
  event_id: string;
  member_email: string;
  member_name: string | null;
  status: string;
  checked_in_at: number;
};

function normalizeEventStatus(value: string): AttendanceEventStatus {
  if (value === 'open' || value === 'closed') return value;
  return 'scheduled';
}

function normalizeRecordStatus(value: string): AttendanceRecordStatus {
  return value === 'late' ? 'late' : 'present';
}

function base64Url(bytes: Uint8Array) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function signQrPayload(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return base64Url(new Uint8Array(signature));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1)
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export function attendanceQrSlot(now = Date.now()) {
  return Math.floor(now / (attendanceQrSlotSeconds * 1_000));
}

export async function createAttendanceQrToken(
  eventId: string,
  secret: string,
  now = Date.now(),
) {
  const slot = attendanceQrSlot(now);
  const payload = `${eventId}.${slot}`;
  return `${payload}.${await signQrPayload(secret, payload)}`;
}

export async function verifyAttendanceQrToken(
  token: string,
  eventId: string,
  secret: string,
  now = Date.now(),
) {
  if (!token || token.length > 300 || !eventId || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== eventId) return null;
  const slot = Number(parts[1]);
  if (!Number.isSafeInteger(slot)) return null;
  const currentSlot = attendanceQrSlot(now);
  if (slot < currentSlot - 1 || slot > currentSlot) return null;
  const payload = `${eventId}.${slot}`;
  const expected = await signQrPayload(secret, payload);
  return safeEqual(expected, parts[2]) ? { eventId, slot } : null;
}

export function attendanceEventIdFromToken(token: string) {
  const eventId = token.split('.')[0]?.trim() ?? '';
  return eventId.length > 0 && eventId.length <= 80 ? eventId : '';
}

export async function listAttendanceSnapshot(
  database: D1Database,
  user: PanelUser,
  canManage: boolean,
): Promise<AttendanceSnapshot> {
  const [eventsResult, ownRecordsResult, memberCountRow, allRecordsResult] =
    await Promise.all([
      database
        .prepare(
          `SELECT id, title, description, location, starts_at, ends_at,
                  late_after_minutes, status, checkin_opened_at,
                  checkin_closed_at, created_at, created_by
           FROM panel_attendance_events
           ORDER BY starts_at DESC
           LIMIT 250`,
        )
        .all<AttendanceEventRow>(),
      database
        .prepare(
          `SELECT r.event_id, r.member_email, m.name AS member_name,
                  r.status, r.checked_in_at
           FROM panel_attendance_records r
           LEFT JOIN panel_members m ON m.email = r.member_email
           WHERE r.member_email = ?`,
        )
        .bind(user.email)
        .all<AttendanceRecordRow>(),
      database
        .prepare('SELECT COUNT(*) AS count FROM panel_members WHERE active = 1')
        .first<{ count: number }>(),
      canManage
        ? database
            .prepare(
              `SELECT r.event_id, r.member_email, m.name AS member_name,
                      r.status, r.checked_in_at
               FROM panel_attendance_records r
               LEFT JOIN panel_members m ON m.email = r.member_email
               ORDER BY r.checked_in_at`,
            )
            .all<AttendanceRecordRow>()
        : Promise.resolve({ results: [] as AttendanceRecordRow[] }),
    ]);

  const mapRecord = (record: AttendanceRecordRow): AttendanceRecordView => ({
    memberEmail: record.member_email,
    memberName: record.member_name?.trim() || record.member_email,
    status: normalizeRecordStatus(record.status),
    checkedInAt: record.checked_in_at,
  });
  const ownRecords = new Map(
    (ownRecordsResult.results ?? []).map((record) => [
      record.event_id,
      mapRecord(record),
    ]),
  );
  const recordsByEvent = new Map<string, AttendanceRecordView[]>();
  for (const record of allRecordsResult.results ?? []) {
    const records = recordsByEvent.get(record.event_id) ?? [];
    records.push(mapRecord(record));
    recordsByEvent.set(record.event_id, records);
  }
  const totalMembers = Number(memberCountRow?.count ?? 0);
  const events = (eventsResult.results ?? [])
    .map<AttendanceEventView>((event) => {
      const attendees = recordsByEvent.get(event.id) ?? [];
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.starts_at,
        endsAt: event.ends_at,
        lateAfterMinutes: event.late_after_minutes,
        status: normalizeEventStatus(event.status),
        checkinOpenedAt: event.checkin_opened_at,
        checkinClosedAt: event.checkin_closed_at,
        createdAt: event.created_at,
        createdBy: event.created_by,
        attendanceCount: canManage ? attendees.length : 0,
        totalMembers: canManage ? totalMembers : 0,
        viewerAttendance: ownRecords.get(event.id) ?? null,
        ...(canManage ? { attendees } : {}),
      };
    })
    .sort((left, right) => {
      const order = { open: 0, scheduled: 1, closed: 2 } as const;
      const statusDifference = order[left.status] - order[right.status];
      if (statusDifference) return statusDifference;
      return left.status === 'scheduled'
        ? left.startsAt - right.startsAt
        : right.startsAt - left.startsAt;
    });
  const completed = events.filter((event) => event.status === 'closed');
  const attended = completed.filter((event) => event.viewerAttendance);

  return {
    viewer: { email: user.email, canManage },
    summary: {
      attended: attended.length,
      total: completed.length,
      late: attended.filter(
        (event) => event.viewerAttendance?.status === 'late',
      ).length,
    },
    events,
  };
}
