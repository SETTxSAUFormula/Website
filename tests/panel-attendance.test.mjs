import assert from 'node:assert/strict';
import test from 'node:test';

import {
  attendanceEventIdFromToken,
  attendanceQrSlotSeconds,
  createAttendanceQrToken,
  verifyAttendanceQrToken,
} from '../lib/panel-attendance.ts';

const eventId = '8f61c9aa-3d85-4dc0-8a04-60f50fd444ef';
const secret = 'test-only-attendance-secret';

test('attendance QR token is bound to its event and current time slot', async () => {
  const now = Date.UTC(2026, 8, 22, 9, 0, 7);
  const token = await createAttendanceQrToken(eventId, secret, now);

  assert.equal(attendanceEventIdFromToken(token), eventId);
  assert.deepEqual(await verifyAttendanceQrToken(token, eventId, secret, now), {
    eventId,
    slot: Math.floor(now / (attendanceQrSlotSeconds * 1_000)),
  });
  assert.equal(
    await verifyAttendanceQrToken(token, 'another-event', secret, now),
    null,
  );
});

test('the previous QR slot has a short scan grace period', async () => {
  const issuedAt = Date.UTC(2026, 8, 22, 9, 0, 14);
  const token = await createAttendanceQrToken(eventId, secret, issuedAt);

  assert.ok(
    await verifyAttendanceQrToken(
      token,
      eventId,
      secret,
      issuedAt + attendanceQrSlotSeconds * 1_000,
    ),
  );
  assert.equal(
    await verifyAttendanceQrToken(
      token,
      eventId,
      secret,
      issuedAt + attendanceQrSlotSeconds * 2_000,
    ),
    null,
  );
});

test('tampered attendance QR tokens are rejected', async () => {
  const now = Date.UTC(2026, 8, 22, 9, 0, 7);
  const token = await createAttendanceQrToken(eventId, secret, now);
  const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

  assert.equal(
    await verifyAttendanceQrToken(tampered, eventId, secret, now),
    null,
  );
});
