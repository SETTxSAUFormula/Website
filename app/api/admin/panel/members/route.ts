import { env } from 'cloudflare:workers';

import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import {
  hasPanelPermission,
  systemAdminEmails,
  type PanelDepartment,
  type PanelRole,
  type PanelSpecialRole,
  type PanelUser,
} from '@/lib/panel-authorization';
import {
  createMemberAuditStatement,
  getPanelMemberRow,
  listPanelMemberDirectory,
  memberStateFromRow,
  type PanelMemberState,
} from '@/lib/panel-members';
import {
  createActivityStatement,
  panelDepartmentCatalogue,
} from '@/lib/panel-operations';

type RuntimeEnv = PanelAccessEnv;

const runtimeEnv = env as unknown as RuntimeEnv;
const departmentIds = new Set<string>(
  panelDepartmentCatalogue.map((department) => department.id),
);

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
  return authorizePanelRequest(request, runtimeEnv);
}

function stringValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

async function requestBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isSystemAdminEmail(email: string) {
  return systemAdminEmails.includes(
    email as (typeof systemAdminEmails)[number],
  );
}

function memberInput(
  payload: Record<string, unknown>,
  email: string,
  active: boolean,
): { state?: PanelMemberState; error?: string } {
  const name = stringValue(payload.name, 160);
  if (!name) return { error: 'Ad soyad gerekli.' };

  const systemAdmin = isSystemAdminEmail(email);
  const requestedRole = stringValue(payload.role, 40);
  if (requestedRole === 'admin' && !systemAdmin)
    return {
      error:
        'Sistem yöneticisi rolü yalnız önceden tanımlı yönetici hesaplarına aittir.',
    };
  const role: PanelRole = systemAdmin
    ? 'admin'
    : requestedRole === 'chief' ||
        requestedRole === 'advisor' ||
        requestedRole === 'team_lead'
      ? requestedRole
      : 'member';
  const departmentValue = stringValue(payload.department, 80);
  const department = departmentIds.has(departmentValue)
    ? (departmentValue as PanelDepartment)
    : null;
  if (!systemAdmin && !department)
    return { error: 'Üye için geçerli bir departman seçin.' };

  const specialRoles: PanelSpecialRole[] =
    payload.sponsorshipDelegate === true ? ['sponsorship_delegate'] : [];
  return {
    state: {
      name,
      role,
      department,
      specialRoles,
      active: systemAdmin || active,
    },
  };
}

function canManage(user: PanelUser) {
  return hasPanelPermission(user, 'permissions.manage');
}

export async function GET(request: Request) {
  const user = await authorize(request);
  if (!user || !hasPanelPermission(user, 'members.read'))
    return json({ ok: false, error: 'Üye dizini erişimi bulunmuyor.' }, 403);
  if (!runtimeEnv.APPLICATIONS_DB)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  try {
    return json({
      ok: true,
      snapshot: await listPanelMemberDirectory(
        runtimeEnv.APPLICATIONS_DB,
        user,
      ),
    });
  } catch (error) {
    console.error('Member directory load failed', error);
    return json({ ok: false, error: 'Üye kayıtları yüklenemedi.' }, 503);
  }
}

export async function POST(request: Request) {
  const user = await authorize(request);
  if (!user || !canManage(user))
    return json(
      {
        ok: false,
        error:
          'Üye ve yetki değişikliklerini yalnız takım lideri veya sistem yöneticisi yapabilir.',
      },
      403,
    );
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  const payload = await requestBody(request);
  if (!payload) return json({ ok: false, error: 'Geçersiz istek.' }, 400);

  const email = stringValue(payload.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ ok: false, error: 'Geçerli bir e-posta girin.' }, 400);
  if (user.role === 'team_lead' && isSystemAdminEmail(email))
    return json(
      {
        ok: false,
        error: 'Sistem yöneticisi kaydını yalnız yönetici düzenleyebilir.',
      },
      403,
    );
  try {
    const existing = await getPanelMemberRow(database, email);
    if (existing)
      return json(
        {
          ok: false,
          error:
            'Bu e-posta zaten kayıtlı. Pasif üyeyi filtrelerden açıp yeniden etkinleştirebilirsiniz.',
        },
        409,
      );
    const parsed = memberInput(payload, email, true);
    if (!parsed.state)
      return json({ ok: false, error: parsed.error || 'Geçersiz üye.' }, 400);
    const now = Date.now();
    const state = parsed.state;
    await database.batch([
      database
        .prepare(
          `INSERT INTO panel_members (email, name, role, department, special_roles, active, updated_at, updated_by)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        )
        .bind(
          email,
          state.name,
          state.role,
          state.department,
          JSON.stringify(state.specialRoles),
          now,
          user.email,
        ),
      createMemberAuditStatement(database, {
        memberEmail: email,
        action: 'created',
        before: null,
        after: state,
        actorEmail: user.email,
        createdAt: now,
      }),
      createActivityStatement(database, {
        department: state.department ?? 'team',
        actorEmail: user.email,
        action: 'Üye kaydı oluşturdu',
        subjectType: 'member',
        subjectId: email,
        detail: state.name,
      }),
    ]);
    return json({ ok: true, email }, 201);
  } catch (error) {
    console.error('Member create failed', error);
    return json({ ok: false, error: 'Üye kaydı oluşturulamadı.' }, 500);
  }
}

export async function PATCH(request: Request) {
  const user = await authorize(request);
  if (!user || !canManage(user))
    return json(
      {
        ok: false,
        error:
          'Üye ve yetki değişikliklerini yalnız takım lideri veya sistem yöneticisi yapabilir.',
      },
      403,
    );
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  const payload = await requestBody(request);
  if (!payload) return json({ ok: false, error: 'Geçersiz istek.' }, 400);

  const email = stringValue(payload.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ ok: false, error: 'Geçerli bir e-posta gerekli.' }, 400);
  if (user.role === 'team_lead' && isSystemAdminEmail(email))
    return json(
      {
        ok: false,
        error: 'Sistem yöneticisi kaydını yalnız yönetici düzenleyebilir.',
      },
      403,
    );
  if (isSystemAdminEmail(email) && payload.active === false)
    return json(
      { ok: false, error: 'Sistem yöneticisi hesabı pasifleştirilemez.' },
      400,
    );

  try {
    const existing = await getPanelMemberRow(database, email);
    if (!existing && !isSystemAdminEmail(email))
      return json({ ok: false, error: 'Üye kaydı bulunamadı.' }, 404);
    const before = existing ? memberStateFromRow(existing) : null;
    const requestedActive = payload.active !== false;
    const parsed = memberInput(payload, email, requestedActive);
    if (!parsed.state)
      return json({ ok: false, error: parsed.error || 'Geçersiz üye.' }, 400);
    const state = parsed.state;

    if (email === user.email) {
      if (!state.active)
        return json(
          { ok: false, error: 'Kendi hesabınızı pasifleştiremezsiniz.' },
          400,
        );
      if (before && state.role !== before.role)
        return json(
          { ok: false, error: 'Kendi rolünüzü değiştiremezsiniz.' },
          400,
        );
    }
    const action = !before
      ? 'created'
      : before.active && !state.active
        ? 'deactivated'
        : !before.active && state.active
          ? 'reactivated'
          : 'updated';
    const now = Date.now();
    await database.batch([
      database
        .prepare(
          `INSERT INTO panel_members (email, name, role, department, special_roles, active, updated_at, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET name = excluded.name, role = excluded.role, department = excluded.department, special_roles = excluded.special_roles, active = excluded.active, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
        )
        .bind(
          email,
          state.name,
          state.role,
          state.department,
          JSON.stringify(state.specialRoles),
          state.active ? 1 : 0,
          now,
          user.email,
        ),
      createMemberAuditStatement(database, {
        memberEmail: email,
        action,
        before,
        after: state,
        actorEmail: user.email,
        createdAt: now,
      }),
      createActivityStatement(database, {
        department: state.department ?? before?.department ?? 'team',
        actorEmail: user.email,
        action:
          action === 'deactivated'
            ? 'Üyeyi pasifleştirdi'
            : action === 'reactivated'
              ? 'Üyeyi yeniden etkinleştirdi'
              : action === 'created'
                ? 'Üye kaydı oluşturdu'
                : 'Üye ve yetkileri güncelledi',
        subjectType: 'member',
        subjectId: email,
        detail: state.name,
      }),
    ]);
    return json({ ok: true, email });
  } catch (error) {
    console.error('Member update failed', error);
    return json({ ok: false, error: 'Üye kaydı güncellenemedi.' }, 500);
  }
}
