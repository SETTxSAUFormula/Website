import {
  getPanelPermissions,
  resolvePanelUser,
  systemAdminEmails,
  type PanelDepartment,
  type PanelPermission,
  type PanelRole,
  type PanelSpecialRole,
  type PanelUser,
} from '@/lib/panel-authorization';
import { panelDepartmentCatalogue } from '@/lib/panel-operations';

export type PanelMemberState = {
  name: string;
  role: PanelRole;
  department: PanelDepartment | null;
  specialRoles: PanelSpecialRole[];
  active: boolean;
};

export type PanelMemberDirectoryRecord = PanelMemberState & {
  email: string;
  isSystemAdmin: boolean;
  permissions: PanelPermission[];
  updatedAt: number;
  updatedBy: string;
};

export type PanelMemberAuditRecord = {
  id: string;
  memberEmail: string;
  action: 'created' | 'updated' | 'deactivated' | 'reactivated';
  before: PanelMemberState | null;
  after: PanelMemberState | null;
  actorEmail: string;
  createdAt: number;
};

export type PanelMemberDirectorySnapshot = {
  viewer: {
    email: string;
    role: PanelRole;
    canManage: boolean;
  };
  departments: Array<{ id: PanelDepartment; name: string }>;
  members: PanelMemberDirectoryRecord[];
  audit: PanelMemberAuditRecord[];
};

type MemberRow = {
  email: string;
  name: string;
  role: string;
  department: string | null;
  special_roles: string;
  active: number;
  updated_at: number;
  updated_by: string;
};

type AuditRow = {
  id: string;
  member_email: string;
  action: string;
  before_state: string;
  after_state: string;
  actor_email: string;
  created_at: number;
};

const departmentIds = new Set<string>(
  panelDepartmentCatalogue.map((department) => department.id),
);

function normalizeRole(value: string): PanelRole {
  return value === 'chief' ||
    value === 'advisor' ||
    value === 'team_lead' ||
    value === 'admin'
    ? value
    : 'member';
}

function normalizeDepartment(value: unknown): PanelDepartment | null {
  return typeof value === 'string' && departmentIds.has(value)
    ? (value as PanelDepartment)
    : null;
}

function parseSpecialRoles(value: unknown): PanelSpecialRole[] {
  let candidate = value;
  if (typeof value === 'string') {
    try {
      candidate = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(candidate)) return [];
  return candidate.includes('sponsorship_delegate')
    ? ['sponsorship_delegate']
    : [];
}

export function memberStateFromRow(row: MemberRow): PanelMemberState {
  const isSystemAdmin = systemAdminEmails.includes(
    row.email.trim().toLowerCase() as (typeof systemAdminEmails)[number],
  );
  const storedRole = normalizeRole(row.role);
  return {
    name: row.name,
    role: isSystemAdmin
      ? 'admin'
      : storedRole === 'admin'
        ? 'member'
        : storedRole,
    department: normalizeDepartment(row.department),
    specialRoles: parseSpecialRoles(row.special_roles),
    active: isSystemAdmin || Boolean(row.active),
  };
}

function parseAuditState(value: string): PanelMemberState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      role: normalizeRole(typeof parsed.role === 'string' ? parsed.role : ''),
      department: normalizeDepartment(parsed.department),
      specialRoles: parseSpecialRoles(parsed.specialRoles),
      active: parsed.active === true,
    };
  } catch {
    return null;
  }
}

function directoryRecord(row: MemberRow): PanelMemberDirectoryRecord {
  const email = row.email.trim().toLowerCase();
  const state = memberStateFromRow(row);
  const resolved = resolvePanelUser(email, state);
  return {
    email,
    ...state,
    isSystemAdmin: resolved.isSystemAdmin,
    permissions: getPanelPermissions(resolved),
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getPanelMemberRow(database: D1Database, email: string) {
  return database
    .prepare(
      'SELECT email, name, role, department, special_roles, active, updated_at, updated_by FROM panel_members WHERE email = ? LIMIT 1',
    )
    .bind(email.trim().toLowerCase())
    .first<MemberRow>();
}

export function createMemberAuditStatement(
  database: D1Database,
  input: {
    memberEmail: string;
    action: PanelMemberAuditRecord['action'];
    before: PanelMemberState | null;
    after: PanelMemberState | null;
    actorEmail: string;
    createdAt: number;
  },
) {
  return database
    .prepare(
      'INSERT INTO panel_member_audit (id, member_email, action, before_state, after_state, actor_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      crypto.randomUUID(),
      input.memberEmail,
      input.action,
      input.before ? JSON.stringify(input.before) : '',
      input.after ? JSON.stringify(input.after) : '',
      input.actorEmail,
      input.createdAt,
    );
}

export async function listPanelMemberDirectory(
  database: D1Database,
  user: PanelUser,
): Promise<PanelMemberDirectorySnapshot> {
  const [membersResult, auditResult] = await Promise.all([
    database
      .prepare(
        'SELECT email, name, role, department, special_roles, active, updated_at, updated_by FROM panel_members ORDER BY active DESC, name, email LIMIT 1000',
      )
      .all<MemberRow>(),
    database
      .prepare(
        'SELECT id, member_email, action, before_state, after_state, actor_email, created_at FROM panel_member_audit ORDER BY created_at DESC LIMIT 500',
      )
      .all<AuditRow>(),
  ]);

  const members = (membersResult.results ?? []).map(directoryRecord);
  for (const email of systemAdminEmails) {
    const existing = members.find((member) => member.email === email);
    if (existing) {
      existing.role = 'admin';
      existing.active = true;
      existing.isSystemAdmin = true;
      existing.permissions = getPanelPermissions(resolvePanelUser(email));
      continue;
    }
    members.push({
      email,
      name: '',
      role: 'admin',
      department: null,
      specialRoles: [],
      active: true,
      isSystemAdmin: true,
      permissions: getPanelPermissions(resolvePanelUser(email)),
      updatedAt: 0,
      updatedBy: 'Sistem tanımı',
    });
  }

  members.sort((left, right) => {
    if (left.active !== right.active) return left.active ? -1 : 1;
    if (left.role === 'admin' && right.role !== 'admin') return -1;
    if (right.role === 'admin' && left.role !== 'admin') return 1;
    return (left.name || left.email).localeCompare(
      right.name || right.email,
      'tr',
    );
  });

  return {
    viewer: {
      email: user.email,
      role: user.role,
      canManage: user.role === 'team_lead' || user.role === 'admin',
    },
    departments: panelDepartmentCatalogue.map((department) => ({
      id: department.id,
      name: department.name,
    })),
    members,
    audit: (auditResult.results ?? []).map((entry) => ({
      id: entry.id,
      memberEmail: entry.member_email,
      action:
        entry.action === 'created' ||
        entry.action === 'deactivated' ||
        entry.action === 'reactivated'
          ? entry.action
          : 'updated',
      before: parseAuditState(entry.before_state),
      after: parseAuditState(entry.after_state),
      actorEmail: entry.actor_email,
      createdAt: entry.created_at,
    })),
  };
}
