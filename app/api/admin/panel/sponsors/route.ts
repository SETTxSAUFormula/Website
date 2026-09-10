import { env } from 'cloudflare:workers';

import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import { createActivityStatement } from '@/lib/panel-operations';
import {
  listPanelSponsors,
  type PanelSponsorDepartment,
  type SponsorActivityKind,
  type SponsorObligationStatus,
  type SponsorPriority,
  type SponsorStage,
} from '@/lib/panel-sponsors';
import { hasPanelPermission, type PanelUser } from '@/lib/panel-authorization';

type RuntimeEnv = PanelAccessEnv;

const runtimeEnv = env as unknown as RuntimeEnv;
const sponsorStages = new Set<SponsorStage>([
  'prospect',
  'contacted',
  'meeting',
  'proposal',
  'negotiation',
  'won',
  'lost',
]);
const sponsorPriorities = new Set<SponsorPriority>(['low', 'normal', 'high']);
const sponsorDepartments = new Set<PanelSponsorDepartment>([
  'team',
  'vehicle-dynamics',
  'chassis-structures',
  'powertrain',
  'aerodynamics',
  'composites-manufacturing',
  'electrical-electronics',
  'sponsorship-partnerships',
  'media-communications',
  'finance-operations',
]);
const activityKinds = new Set<SponsorActivityKind>([
  'note',
  'email',
  'call',
  'meeting',
  'proposal',
  'status',
]);
const obligationStatuses = new Set<SponsorObligationStatus>([
  'open',
  'completed',
  'cancelled',
]);

function json(data: Record<string, unknown>, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function authorize(request: Request): Promise<PanelUser | null> {
  const user = await authorizePanelRequest(request, runtimeEnv);
  if (!user) return null;
  return hasPanelPermission(user, 'sponsorship.manage') ? user : null;
}

function stringValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function websiteValue(value: unknown) {
  const candidate = stringValue(value, 500);
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : '';
  } catch {
    return '';
  }
}

function timestampValue(value: unknown) {
  if (value === null || value === '' || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function moneyValue(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(1_000_000_000, Math.round(parsed));
}

async function requestBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function sponsorExists(database: D1Database, id: string) {
  const row = await database
    .prepare('SELECT id FROM panel_sponsors WHERE id = ? LIMIT 1')
    .bind(id)
    .first<{ id: string }>();
  return Boolean(row);
}

export async function GET(request: Request) {
  const user = await authorize(request);
  if (!user)
    return json({ ok: false, error: 'Sponsorluk erişimi bulunmuyor.' }, 403);
  if (!runtimeEnv.APPLICATIONS_DB)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  try {
    return json({
      ok: true,
      snapshot: await listPanelSponsors(runtimeEnv.APPLICATIONS_DB, user),
    });
  } catch (error) {
    console.error('Sponsor tracking load failed', error);
    return json({ ok: false, error: 'Sponsor kayıtları yüklenemedi.' }, 503);
  }
}

export async function POST(request: Request) {
  const user = await authorize(request);
  if (!user)
    return json({ ok: false, error: 'Sponsorluk erişimi bulunmuyor.' }, 403);
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  const payload = await requestBody(request);
  if (!payload) return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  const type = stringValue(payload.type, 40);
  const now = Date.now();

  try {
    if (type === 'sponsor') {
      const companyName = stringValue(payload.companyName, 180);
      if (!companyName)
        return json({ ok: false, error: 'Firma adı gerekli.' }, 400);
      const id = crypto.randomUUID();
      const stage = sponsorStages.has(payload.stage as SponsorStage)
        ? (payload.stage as SponsorStage)
        : 'prospect';
      const priority = sponsorPriorities.has(
        payload.priority as SponsorPriority,
      )
        ? (payload.priority as SponsorPriority)
        : 'normal';
      const department = sponsorDepartments.has(
        payload.department as PanelSponsorDepartment,
      )
        ? (payload.department as PanelSponsorDepartment)
        : 'team';
      const currency =
        payload.currency === 'EUR' || payload.currency === 'USD'
          ? payload.currency
          : 'TRY';
      await database.batch([
        database
          .prepare(
            `INSERT INTO panel_sponsors (id, company_name, sector, department, website, stage, priority, package_name, estimated_value, confirmed_value, currency, contact_name, contact_email, contact_phone, owner_email, source, next_action, next_action_at, notes, archived, created_at, created_by, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
          )
          .bind(
            id,
            companyName,
            stringValue(payload.sector, 160),
            department,
            websiteValue(payload.website),
            stage,
            priority,
            stringValue(payload.packageName, 120),
            moneyValue(payload.estimatedValue),
            moneyValue(payload.confirmedValue),
            currency,
            stringValue(payload.contactName, 160),
            stringValue(payload.contactEmail, 200).toLowerCase(),
            stringValue(payload.contactPhone, 80),
            stringValue(payload.ownerEmail, 200).toLowerCase(),
            stringValue(payload.source, 160),
            stringValue(payload.nextAction, 500),
            timestampValue(payload.nextActionAt),
            stringValue(payload.notes, 5000),
            now,
            user.email,
            now,
            user.email,
          ),
        createActivityStatement(database, {
          department: 'sponsorship-partnerships',
          actorEmail: user.email,
          action: 'Sponsor adayı ekledi',
          subjectType: 'sponsor',
          subjectId: id,
          detail: companyName,
        }),
      ]);
      return json({ ok: true, id }, 201);
    }

    const sponsorId = stringValue(payload.sponsorId, 80);
    if (!sponsorId || !(await sponsorExists(database, sponsorId)))
      return json({ ok: false, error: 'Firma kaydı bulunamadı.' }, 404);

    if (type === 'activity') {
      const summary = stringValue(payload.summary, 3000);
      if (!summary)
        return json({ ok: false, error: 'Görüşme notu gerekli.' }, 400);
      const kind = activityKinds.has(payload.kind as SponsorActivityKind)
        ? (payload.kind as SponsorActivityKind)
        : 'note';
      const id = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            'INSERT INTO panel_sponsor_activities (id, sponsor_id, kind, summary, occurred_at, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            id,
            sponsorId,
            kind,
            summary,
            timestampValue(payload.occurredAt) ?? now,
            now,
            user.email,
          ),
        database
          .prepare(
            'UPDATE panel_sponsors SET updated_at = ?, updated_by = ? WHERE id = ?',
          )
          .bind(now, user.email, sponsorId),
        createActivityStatement(database, {
          department: 'sponsorship-partnerships',
          actorEmail: user.email,
          action: 'Sponsor görüşmesi ekledi',
          subjectType: 'sponsor',
          subjectId: sponsorId,
          detail: summary.slice(0, 180),
        }),
      ]);
      return json({ ok: true, id }, 201);
    }

    if (type === 'obligation') {
      const title = stringValue(payload.title, 240);
      if (!title)
        return json({ ok: false, error: 'Yükümlülük adı gerekli.' }, 400);
      const id = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            'INSERT INTO panel_sponsor_obligations (id, sponsor_id, title, status, due_at, owner_email, note, created_at, created_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            id,
            sponsorId,
            title,
            'open',
            timestampValue(payload.dueAt),
            stringValue(payload.ownerEmail, 200).toLowerCase(),
            stringValue(payload.note, 2000),
            now,
            user.email,
            now,
          ),
        database
          .prepare(
            'UPDATE panel_sponsors SET updated_at = ?, updated_by = ? WHERE id = ?',
          )
          .bind(now, user.email, sponsorId),
      ]);
      return json({ ok: true, id }, 201);
    }

    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Sponsor tracking create failed', error);
    return json({ ok: false, error: 'Sponsor kaydı oluşturulamadı.' }, 500);
  }
}

export async function PATCH(request: Request) {
  const user = await authorize(request);
  if (!user)
    return json({ ok: false, error: 'Sponsorluk erişimi bulunmuyor.' }, 403);
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  const payload = await requestBody(request);
  if (!payload) return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  const type = stringValue(payload.type, 40);
  const id = stringValue(payload.id, 80);
  const now = Date.now();

  try {
    if (type === 'sponsor') {
      const existing = await database
        .prepare('SELECT company_name FROM panel_sponsors WHERE id = ? LIMIT 1')
        .bind(id)
        .first<{ company_name: string }>();
      if (!existing)
        return json({ ok: false, error: 'Firma kaydı bulunamadı.' }, 404);
      const companyName = stringValue(payload.companyName, 180);
      if (!companyName)
        return json({ ok: false, error: 'Firma adı gerekli.' }, 400);
      const stage = sponsorStages.has(payload.stage as SponsorStage)
        ? (payload.stage as SponsorStage)
        : 'prospect';
      const priority = sponsorPriorities.has(
        payload.priority as SponsorPriority,
      )
        ? (payload.priority as SponsorPriority)
        : 'normal';
      const department = sponsorDepartments.has(
        payload.department as PanelSponsorDepartment,
      )
        ? (payload.department as PanelSponsorDepartment)
        : 'team';
      const currency =
        payload.currency === 'EUR' || payload.currency === 'USD'
          ? payload.currency
          : 'TRY';
      await database.batch([
        database
          .prepare(
            `UPDATE panel_sponsors SET company_name = ?, sector = ?, department = ?, website = ?, stage = ?, priority = ?, package_name = ?, estimated_value = ?, confirmed_value = ?, currency = ?, contact_name = ?, contact_email = ?, contact_phone = ?, owner_email = ?, source = ?, next_action = ?, next_action_at = ?, notes = ?, updated_at = ?, updated_by = ? WHERE id = ?`,
          )
          .bind(
            companyName,
            stringValue(payload.sector, 160),
            department,
            websiteValue(payload.website),
            stage,
            priority,
            stringValue(payload.packageName, 120),
            moneyValue(payload.estimatedValue),
            moneyValue(payload.confirmedValue),
            currency,
            stringValue(payload.contactName, 160),
            stringValue(payload.contactEmail, 200).toLowerCase(),
            stringValue(payload.contactPhone, 80),
            stringValue(payload.ownerEmail, 200).toLowerCase(),
            stringValue(payload.source, 160),
            stringValue(payload.nextAction, 500),
            timestampValue(payload.nextActionAt),
            stringValue(payload.notes, 5000),
            now,
            user.email,
            id,
          ),
        createActivityStatement(database, {
          department: 'sponsorship-partnerships',
          actorEmail: user.email,
          action: 'Sponsor kaydını güncelledi',
          subjectType: 'sponsor',
          subjectId: id,
          detail: companyName,
        }),
      ]);
      return json({ ok: true });
    }

    if (type === 'archive') {
      if (!(await sponsorExists(database, id)))
        return json({ ok: false, error: 'Firma kaydı bulunamadı.' }, 404);
      await database
        .prepare(
          'UPDATE panel_sponsors SET archived = ?, updated_at = ?, updated_by = ? WHERE id = ?',
        )
        .bind(payload.archived === true ? 1 : 0, now, user.email, id)
        .run();
      return json({ ok: true });
    }

    if (type === 'obligation') {
      const status = obligationStatuses.has(
        payload.status as SponsorObligationStatus,
      )
        ? (payload.status as SponsorObligationStatus)
        : null;
      if (!status)
        return json({ ok: false, error: 'Geçersiz yükümlülük durumu.' }, 400);
      const result = await database
        .prepare(
          'UPDATE panel_sponsor_obligations SET status = ?, updated_at = ? WHERE id = ?',
        )
        .bind(status, now, id)
        .run();
      if (!result.meta.changes)
        return json({ ok: false, error: 'Yükümlülük bulunamadı.' }, 404);
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Sponsor tracking update failed', error);
    return json({ ok: false, error: 'Sponsor kaydı güncellenemedi.' }, 500);
  }
}
