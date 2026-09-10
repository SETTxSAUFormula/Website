import { env } from 'cloudflare:workers';

import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import {
  canManageDepartment,
  createActivityStatement,
  listPanelOperations,
  panelDepartmentCatalogue,
  type PanelAnnouncementLevel,
  type PanelChecklistItem,
  type PanelRequestStatus,
  type PanelTaskPriority,
  type PanelTaskStatus,
} from '@/lib/panel-operations';
import type { PanelUser } from '@/lib/panel-authorization';

type RuntimeEnv = PanelAccessEnv & {
  RESEND_API_KEY?: string;
};

const runtimeEnv = env as unknown as RuntimeEnv;
const departmentIds = new Set<string>(
  panelDepartmentCatalogue.map((department) => department.id),
);
const taskStatuses = new Set<PanelTaskStatus>([
  'todo',
  'in_progress',
  'blocked',
  'review',
  'done',
]);
const taskPriorities = new Set<PanelTaskPriority>([
  'low',
  'normal',
  'high',
  'critical',
]);
const requestStatuses = new Set<PanelRequestStatus>([
  'open',
  'in_progress',
  'resolved',
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

async function authorize(request: Request) {
  return authorizePanelRequest(request, runtimeEnv);
}

function isManager(user: PanelUser, department: string) {
  return (
    departmentIds.has(
      department as (typeof panelDepartmentCatalogue)[number]['id'],
    ) && canManageDepartment(user, department)
  );
}

function stringValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function nullableTimestamp(value: unknown) {
  if (value === null || value === '' || value === undefined) return null;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : null;
}

function normalizeEmails(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((email): email is string => typeof email === 'string')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    ),
  ].slice(0, 20);
}

async function activeDepartmentAssignees(
  database: D1Database,
  department: string,
  value: unknown,
) {
  const requested = normalizeEmails(value);
  if (!requested.length) return [];
  const placeholders = requested.map(() => '?').join(', ');
  const result = await database
    .prepare(
      `SELECT email FROM panel_members WHERE active = 1 AND department = ? AND email IN (${placeholders})`,
    )
    .bind(department, ...requested)
    .all<{ email: string }>();
  const allowed = new Set(
    (result.results ?? []).map((member) => member.email.toLowerCase()),
  );
  return requested.filter((email) => allowed.has(email));
}

function normalizeChecklist(value: unknown): PanelChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const label =
      'label' in item && typeof item.label === 'string'
        ? item.label.trim().slice(0, 180)
        : '';
    if (!label) return [];
    return [
      {
        id:
          'id' in item && typeof item.id === 'string'
            ? item.id.slice(0, 80)
            : crypto.randomUUID(),
        label,
        done: 'done' in item && item.done === true,
      },
    ];
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendAnnouncementEmails(
  database: D1Database,
  announcement: {
    id: string;
    department: string | null;
    title: string;
    body: string;
    level: PanelAnnouncementLevel;
  },
) {
  const result = announcement.department
    ? await database
        .prepare(
          'SELECT email, name FROM panel_members WHERE active = 1 AND department = ? ORDER BY email LIMIT 100',
        )
        .bind(announcement.department)
        .all<{ email: string; name: string }>()
    : await database
        .prepare(
          'SELECT email, name FROM panel_members WHERE active = 1 ORDER BY email LIMIT 100',
        )
        .all<{ email: string; name: string }>();
  const recipients = result.results ?? [];
  if (!recipients.length) return { status: 'no_recipients', count: 0 };
  if (!runtimeEnv.RESEND_API_KEY)
    return { status: 'not_configured', count: recipients.length };

  const levelLabel = announcement.level === 'urgent' ? 'ACİL' : 'ÖNEMLİ DUYURU';
  const safeTitle = escapeHtml(announcement.title);
  const safeBody = escapeHtml(announcement.body).replaceAll('\n', '<br>');
  try {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${runtimeEnv.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `panel-announcement-${announcement.id}`,
        'User-Agent': 'SAUFormula-Panel/1.0',
      },
      body: JSON.stringify(
        recipients.map((recipient) => ({
          from: 'SAUFormula Panel <website@forms.sauformula.org>',
          to: [recipient.email],
          subject: `[SAUFormula] ${levelLabel}: ${announcement.title}`,
          text: `${recipient.name ? `${recipient.name},\n\n` : ''}${announcement.body}\n\nSAUFormula Üye Paneli`,
          html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10281e"><div style="display:inline-block;background:${announcement.level === 'urgent' ? '#b42318' : '#087347'};color:white;padding:6px 10px;font-weight:700;font-size:12px">${levelLabel}</div><h2 style="margin:18px 0 10px">${safeTitle}</h2><p>${safeBody}</p><hr style="border:0;border-top:1px solid #dbe6e0;margin:24px 0"><p style="color:#66756e;font-size:13px">SAUFormula Üye Paneli</p></div>`,
          tags: [
            { name: 'source', value: 'panel-announcement' },
            { name: 'level', value: announcement.level },
          ],
        })),
      ),
      signal: AbortSignal.timeout(15_000),
    });
    return {
      status: response.ok ? 'sent' : 'failed',
      count: recipients.length,
    };
  } catch (error) {
    console.error('Panel announcement email failed', error);
    return { status: 'failed', count: recipients.length };
  }
}

export async function GET(request: Request) {
  const user = await authorize(request);
  if (!user) return json({ ok: false, error: 'Oturum doğrulanamadı.' }, 401);
  if (!runtimeEnv.APPLICATIONS_DB)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  try {
    const snapshot = await listPanelOperations(
      runtimeEnv.APPLICATIONS_DB,
      user,
    );
    return json({ ok: true, snapshot });
  } catch (error) {
    console.error('Panel operations load failed', error);
    return json(
      {
        ok: false,
        error: 'Departman verileri henüz hazırlanmadı veya yüklenemedi.',
      },
      503,
    );
  }
}

export async function POST(request: Request) {
  const user = await authorize(request);
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
  const type = stringValue(payload.type, 40);
  const department = stringValue(payload.department, 80);
  const now = Date.now();

  try {
    if (type === 'task') {
      if (!isManager(user, department))
        return json({ ok: false, error: 'Bu departmanı yönetemezsiniz.' }, 403);
      const title = stringValue(payload.title, 180);
      if (!title) return json({ ok: false, error: 'Görev adı gerekli.' }, 400);
      const id = crypto.randomUUID();
      const priority = taskPriorities.has(payload.priority as PanelTaskPriority)
        ? (payload.priority as PanelTaskPriority)
        : 'normal';
      const assigneeEmails = await activeDepartmentAssignees(
        database,
        department,
        payload.assigneeEmails,
      );
      const statement = database
        .prepare(
          'INSERT INTO panel_tasks (id, department, title, description, assignee_emails, priority, status, due_at, progress, requires_approval, checklist, blocker_note, dependency_note, calendar_url, purchase_reference, created_at, created_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          id,
          department,
          title,
          stringValue(payload.description, 4000),
          JSON.stringify(assigneeEmails),
          priority,
          'todo',
          nullableTimestamp(payload.dueAt),
          0,
          payload.requiresApproval === true ? 1 : 0,
          JSON.stringify(normalizeChecklist(payload.checklist)),
          '',
          stringValue(payload.dependencyNote, 1000),
          stringValue(payload.calendarUrl, 500),
          stringValue(payload.purchaseReference, 300),
          now,
          user.email,
          now,
        );
      await database.batch([
        statement,
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Görev oluşturdu',
          subjectType: 'task',
          subjectId: id,
          detail: title,
        }),
      ]);
      return json({ ok: true, id }, 201);
    }

    if (type === 'announcement') {
      const targetDepartment = department || null;
      if (
        targetDepartment
          ? !isManager(user, targetDepartment)
          : user.role !== 'admin' &&
            user.role !== 'team_lead' &&
            user.role !== 'advisor'
      )
        return json(
          { ok: false, error: 'Bu duyuruyu yayınlayamazsınız.' },
          403,
        );
      const title = stringValue(payload.title, 180);
      const body = stringValue(payload.body, 5000);
      if (!title || !body)
        return json(
          { ok: false, error: 'Duyuru başlığı ve metni gerekli.' },
          400,
        );
      const level: PanelAnnouncementLevel =
        payload.level === 'urgent' || payload.level === 'important'
          ? payload.level
          : 'normal';
      const id = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            'INSERT INTO panel_announcements (id, department, title, body, level, pinned, email_status, recipient_count, expires_at, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)',
          )
          .bind(
            id,
            targetDepartment,
            title,
            body,
            level,
            level === 'normal' ? 0 : 1,
            level === 'normal' ? 'not_requested' : 'pending',
            nullableTimestamp(payload.expiresAt),
            now,
            user.email,
          ),
        createActivityStatement(database, {
          department:
            targetDepartment ??
            user.department ??
            panelDepartmentCatalogue[0].id,
          actorEmail: user.email,
          action: 'Duyuru yayınladı',
          subjectType: 'announcement',
          subjectId: id,
          detail: title,
        }),
      ]);
      if (level !== 'normal') {
        const delivery = await sendAnnouncementEmails(database, {
          id,
          department: targetDepartment,
          title,
          body,
          level,
        });
        await database
          .prepare(
            'UPDATE panel_announcements SET email_status = ?, recipient_count = ? WHERE id = ?',
          )
          .bind(delivery.status, delivery.count, id)
          .run();
      }
      return json({ ok: true, id }, 201);
    }

    if (type === 'request') {
      const toDepartment = stringValue(payload.toDepartment, 80);
      if (!isManager(user, department) || !departmentIds.has(toDepartment))
        return json(
          { ok: false, error: 'Departman talebi oluşturulamadı.' },
          403,
        );
      const title = stringValue(payload.title, 180);
      if (!title) return json({ ok: false, error: 'Talep adı gerekli.' }, 400);
      const id = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            'INSERT INTO panel_department_requests (id, from_department, to_department, title, description, status, due_at, created_at, created_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            id,
            department,
            toDepartment,
            title,
            stringValue(payload.description, 3000),
            'open',
            nullableTimestamp(payload.dueAt),
            now,
            user.email,
            now,
          ),
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Departmanlar arası talep açtı',
          subjectType: 'request',
          subjectId: id,
          detail: title,
        }),
      ]);
      return json({ ok: true, id }, 201);
    }

    if (type === 'decision') {
      if (!isManager(user, department))
        return json({ ok: false, error: 'Bu departmanı yönetemezsiniz.' }, 403);
      const title = stringValue(payload.title, 180);
      const summary = stringValue(payload.summary, 4000);
      if (!title || !summary)
        return json(
          { ok: false, error: 'Karar başlığı ve özeti gerekli.' },
          400,
        );
      const id = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            'INSERT INTO panel_decisions (id, department, title, summary, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)',
          )
          .bind(id, department, title, summary, now, user.email),
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Karar kaydı ekledi',
          subjectType: 'decision',
          subjectId: id,
          detail: title,
        }),
      ]);
      return json({ ok: true, id }, 201);
    }

    if (type === 'template') {
      if (!isManager(user, department))
        return json({ ok: false, error: 'Bu departmanı yönetemezsiniz.' }, 403);
      const name = stringValue(payload.name, 160);
      const tasks = Array.isArray(payload.tasks)
        ? payload.tasks
            .filter((task): task is string => typeof task === 'string')
            .map((task) => task.trim().slice(0, 180))
            .filter(Boolean)
            .slice(0, 30)
        : [];
      if (!name || !tasks.length)
        return json(
          { ok: false, error: 'Şablon adı ve görevleri gerekli.' },
          400,
        );
      const id = crypto.randomUUID();
      await database
        .prepare(
          'INSERT INTO panel_task_templates (id, department, name, tasks, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(id, department, name, JSON.stringify(tasks), now, user.email)
        .run();
      return json({ ok: true, id }, 201);
    }

    if (type === 'template_apply') {
      const templateId = stringValue(payload.templateId, 80);
      const template = await database
        .prepare(
          'SELECT id, department, name, tasks FROM panel_task_templates WHERE id = ? LIMIT 1',
        )
        .bind(templateId)
        .first<{
          id: string;
          department: string | null;
          name: string;
          tasks: string;
        }>();
      if (!template || !isManager(user, department))
        return json({ ok: false, error: 'Şablon uygulanamadı.' }, 403);
      let tasks: string[] = [];
      try {
        const parsed = JSON.parse(template.tasks) as unknown;
        tasks = Array.isArray(parsed)
          ? parsed
              .filter((task): task is string => typeof task === 'string')
              .slice(0, 30)
          : [];
      } catch {
        tasks = [];
      }
      const statements = tasks.map((title) => {
        const id = crypto.randomUUID();
        return database
          .prepare(
            'INSERT INTO panel_tasks (id, department, title, description, assignee_emails, priority, status, progress, requires_approval, checklist, blocker_note, dependency_note, calendar_url, purchase_reference, created_at, created_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            id,
            department,
            title,
            '',
            '[]',
            'normal',
            'todo',
            0,
            0,
            '[]',
            '',
            '',
            '',
            '',
            now,
            user.email,
            now,
          );
      });
      if (!statements.length)
        return json({ ok: false, error: 'Şablonda görev bulunmuyor.' }, 400);
      await database.batch([
        ...statements,
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Görev şablonu uyguladı',
          subjectType: 'template',
          subjectId: template.id,
          detail: template.name,
        }),
      ]);
      return json({ ok: true, created: statements.length }, 201);
    }

    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Panel operation create failed', error);
    return json({ ok: false, error: 'Kayıt oluşturulamadı.' }, 500);
  }
}

export async function PATCH(request: Request) {
  const user = await authorize(request);
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
  const type = stringValue(payload.type, 40);
  const id = stringValue(payload.id, 80);
  const now = Date.now();

  try {
    if (type === 'department') {
      const department = stringValue(payload.department, 80);
      if (!isManager(user, department))
        return json({ ok: false, error: 'Bu departmanı yönetemezsiniz.' }, 403);
      const catalogue = panelDepartmentCatalogue.find(
        (item) => item.id === department,
      );
      if (!catalogue)
        return json({ ok: false, error: 'Departman bulunamadı.' }, 404);
      await database.batch([
        database
          .prepare(
            `INSERT INTO panel_department_settings (department, display_name, description, season_goal, weekly_note, chief_email, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(department) DO UPDATE SET description = excluded.description, season_goal = excluded.season_goal, weekly_note = excluded.weekly_note, chief_email = excluded.chief_email, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
          )
          .bind(
            department,
            catalogue.name,
            stringValue(payload.description, 2000) || catalogue.description,
            stringValue(payload.seasonGoal, 3000),
            stringValue(payload.weeklyNote, 3000),
            stringValue(payload.chiefEmail, 200).toLowerCase(),
            now,
            user.email,
          ),
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Departman özetini güncelledi',
          subjectType: 'department',
          subjectId: department,
          detail: catalogue.name,
        }),
      ]);
      return json({ ok: true });
    }

    if (type === 'task') {
      const existing = await database
        .prepare(
          'SELECT id, department, title, assignee_emails, requires_approval FROM panel_tasks WHERE id = ? LIMIT 1',
        )
        .bind(id)
        .first<{
          id: string;
          department: string;
          title: string;
          assignee_emails: string;
          requires_approval: number;
        }>();
      if (!existing)
        return json({ ok: false, error: 'Görev bulunamadı.' }, 404);
      const manages = isManager(user, existing.department);
      let assignees: string[] = [];
      try {
        const parsed = JSON.parse(existing.assignee_emails) as unknown;
        assignees = Array.isArray(parsed)
          ? parsed.filter((email): email is string => typeof email === 'string')
          : [];
      } catch {
        assignees = [];
      }
      if (!manages && !assignees.includes(user.email))
        return json({ ok: false, error: 'Bu görevi güncelleyemezsiniz.' }, 403);

      const requestedStatus = taskStatuses.has(
        payload.status as PanelTaskStatus,
      )
        ? (payload.status as PanelTaskStatus)
        : undefined;
      const effectiveStatus =
        !manages && requestedStatus === 'done' && existing.requires_approval
          ? 'review'
          : requestedStatus;
      const assignments = ['updated_at = ?'];
      const values: Array<string | number | null> = [now];
      if (effectiveStatus) {
        assignments.push('status = ?', 'completed_at = ?');
        values.push(effectiveStatus, effectiveStatus === 'done' ? now : null);
      }
      if (typeof payload.progress === 'number') {
        assignments.push('progress = ?');
        values.push(Math.min(100, Math.max(0, Math.trunc(payload.progress))));
      }
      if (payload.checklist !== undefined) {
        assignments.push('checklist = ?');
        values.push(JSON.stringify(normalizeChecklist(payload.checklist)));
      }
      if (payload.blockerNote !== undefined) {
        assignments.push('blocker_note = ?');
        values.push(stringValue(payload.blockerNote, 2000));
      }
      if (manages) {
        const managerFields: Array<[string, unknown, number]> = [
          ['title', payload.title, 180],
          ['description', payload.description, 4000],
          ['dependency_note', payload.dependencyNote, 1000],
          ['calendar_url', payload.calendarUrl, 500],
          ['purchase_reference', payload.purchaseReference, 300],
        ];
        for (const [column, value, maxLength] of managerFields) {
          if (value !== undefined) {
            assignments.push(`${column} = ?`);
            values.push(stringValue(value, maxLength));
          }
        }
        if (payload.assigneeEmails !== undefined) {
          const assigneeEmails = await activeDepartmentAssignees(
            database,
            existing.department,
            payload.assigneeEmails,
          );
          assignments.push('assignee_emails = ?');
          values.push(JSON.stringify(assigneeEmails));
        }
        if (taskPriorities.has(payload.priority as PanelTaskPriority)) {
          assignments.push('priority = ?');
          values.push(payload.priority as string);
        }
        if (payload.dueAt !== undefined) {
          assignments.push('due_at = ?');
          values.push(nullableTimestamp(payload.dueAt));
        }
        if (typeof payload.requiresApproval === 'boolean') {
          assignments.push('requires_approval = ?');
          values.push(payload.requiresApproval ? 1 : 0);
        }
        if (payload.approve === true) {
          assignments.push(
            'status = ?',
            'approved_at = ?',
            'approved_by = ?',
            'completed_at = ?',
            'progress = ?',
          );
          values.push('done', now, user.email, now, 100);
        }
      }
      values.push(id);
      await database.batch([
        database
          .prepare(
            `UPDATE panel_tasks SET ${assignments.join(', ')} WHERE id = ?`,
          )
          .bind(...values),
        createActivityStatement(database, {
          department: existing.department,
          actorEmail: user.email,
          action:
            payload.approve === true ? 'Görevi onayladı' : 'Görevi güncelledi',
          subjectType: 'task',
          subjectId: id,
          detail: existing.title,
        }),
      ]);
      return json({ ok: true });
    }

    if (type === 'request') {
      const existing = await database
        .prepare(
          'SELECT id, from_department, to_department, title FROM panel_department_requests WHERE id = ? LIMIT 1',
        )
        .bind(id)
        .first<{
          id: string;
          from_department: string;
          to_department: string;
          title: string;
        }>();
      if (!existing)
        return json({ ok: false, error: 'Talep bulunamadı.' }, 404);
      if (
        !isManager(user, existing.from_department) &&
        !isManager(user, existing.to_department)
      )
        return json({ ok: false, error: 'Bu talebi güncelleyemezsiniz.' }, 403);
      const status = requestStatuses.has(payload.status as PanelRequestStatus)
        ? (payload.status as PanelRequestStatus)
        : null;
      if (!status) return json({ ok: false, error: 'Geçersiz durum.' }, 400);
      await database.batch([
        database
          .prepare(
            'UPDATE panel_department_requests SET status = ?, updated_at = ? WHERE id = ?',
          )
          .bind(status, now, id),
        createActivityStatement(database, {
          department: existing.from_department,
          actorEmail: user.email,
          action: 'Departman talebini güncelledi',
          subjectType: 'request',
          subjectId: id,
          detail: existing.title,
        }),
      ]);
      return json({ ok: true });
    }
    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Panel operation update failed', error);
    return json({ ok: false, error: 'Kayıt güncellenemedi.' }, 500);
  }
}

export async function DELETE(request: Request) {
  const user = await authorize(request);
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
  const type = stringValue(payload.type, 40);
  const id = stringValue(payload.id, 80);
  const tableByType = {
    task: 'panel_tasks',
    announcement: 'panel_announcements',
    template: 'panel_task_templates',
  } as const;
  if (!(type in tableByType) || !id)
    return json({ ok: false, error: 'Geçersiz silme işlemi.' }, 400);

  try {
    let existing: { department: string | null; title: string } | null = null;
    if (type === 'task') {
      existing = await database
        .prepare(
          'SELECT department, title FROM panel_tasks WHERE id = ? LIMIT 1',
        )
        .bind(id)
        .first<{ department: string; title: string }>();
    } else if (type === 'announcement') {
      existing = await database
        .prepare(
          'SELECT department, title FROM panel_announcements WHERE id = ? LIMIT 1',
        )
        .bind(id)
        .first<{ department: string | null; title: string }>();
    } else {
      existing = await database
        .prepare(
          'SELECT department, name AS title FROM panel_task_templates WHERE id = ? LIMIT 1',
        )
        .bind(id)
        .first<{ department: string | null; title: string }>();
    }
    if (!existing) return json({ ok: false, error: 'Kayıt bulunamadı.' }, 404);
    const department =
      existing.department ?? user.department ?? panelDepartmentCatalogue[0].id;
    const canDeleteTeamRecord =
      existing.department === null &&
      (user.role === 'admin' ||
        user.role === 'team_lead' ||
        user.role === 'advisor');
    if (!canDeleteTeamRecord && !isManager(user, department))
      return json({ ok: false, error: 'Bu kaydı silemezsiniz.' }, 403);

    const table = tableByType[type as keyof typeof tableByType];
    await database.batch([
      database.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id),
      createActivityStatement(database, {
        department,
        actorEmail: user.email,
        action: 'Kayıt sildi',
        subjectType: type,
        subjectId: id,
        detail: existing.title,
      }),
    ]);
    return json({ ok: true });
  } catch (error) {
    console.error('Panel operation delete failed', error);
    return json({ ok: false, error: 'Kayıt silinemedi.' }, 500);
  }
}
