import type {
  PanelDepartment,
  PanelRole,
  PanelUser,
} from '@/lib/panel-authorization';

export const panelDepartmentCatalogue = [
  {
    id: 'vehicle-dynamics',
    name: 'Araç Dinamiği',
    description: 'Süspansiyon, direksiyon, fren ve araç davranışı çalışmaları.',
  },
  {
    id: 'chassis-structures',
    name: 'Şasi ve Yapısal Sistemler',
    description: 'Şasi, yapısal tasarım, güvenlik ve ergonomi çalışmaları.',
  },
  {
    id: 'powertrain',
    name: 'Güç Aktarma Sistemleri',
    description: 'Güç aktarımı, motor sistemleri ve soğutma çalışmaları.',
  },
  {
    id: 'aerodynamics',
    name: 'Aerodinamik',
    description: 'Aerodinamik tasarım, analiz ve gövde geliştirme çalışmaları.',
  },
  {
    id: 'composites-manufacturing',
    name: 'Kompozitler ve Üretim',
    description: 'Kompozit tasarımı, kalıp ve üretim süreçleri.',
  },
  {
    id: 'electrical-electronics',
    name: 'Elektrik ve Elektronik',
    description: 'Elektrik mimarisi, elektronik, veri ve kontrol sistemleri.',
  },
  {
    id: 'sponsorship-partnerships',
    name: 'Sponsorluk ve İş Birlikleri',
    description: 'Sponsor ilişkileri, iş birlikleri ve kaynak geliştirme.',
  },
  {
    id: 'media-communications',
    name: 'Medya ve İletişim',
    description: 'İçerik, görsel iletişim, sosyal medya ve etkinlikler.',
  },
  {
    id: 'finance-operations',
    name: 'Finans ve Operasyon',
    description: 'Bütçe, satın alma, lojistik ve operasyon planlama.',
  },
] as const;

export type PanelDepartmentId = (typeof panelDepartmentCatalogue)[number]['id'];
export type PanelTaskStatus =
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'review'
  | 'done';
export type PanelTaskPriority = 'low' | 'normal' | 'high' | 'critical';
export type PanelAnnouncementLevel = 'normal' | 'important' | 'urgent';
export type PanelRequestStatus = 'open' | 'in_progress' | 'resolved';

export type PanelChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type PanelMemberRecord = {
  email: string;
  name: string;
  role: PanelRole;
  department: PanelDepartment | null;
  specialRoles: string[];
  active: boolean;
};

export type PanelTaskRecord = {
  id: string;
  department: string;
  title: string;
  description: string;
  assigneeEmails: string[];
  priority: PanelTaskPriority;
  status: PanelTaskStatus;
  dueAt: number | null;
  progress: number;
  requiresApproval: boolean;
  approvedAt: number | null;
  approvedBy: string;
  checklist: PanelChecklistItem[];
  blockerNote: string;
  dependencyNote: string;
  calendarUrl: string;
  purchaseReference: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  completedAt: number | null;
};

export type PanelAnnouncementRecord = {
  id: string;
  department: string | null;
  title: string;
  body: string;
  level: PanelAnnouncementLevel;
  pinned: boolean;
  emailStatus: string;
  recipientCount: number;
  expiresAt: number | null;
  createdAt: number;
  createdBy: string;
};

export type PanelDepartmentRequestRecord = {
  id: string;
  fromDepartment: string;
  toDepartment: string;
  title: string;
  description: string;
  status: PanelRequestStatus;
  dueAt: number | null;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
};

export type PanelDecisionRecord = {
  id: string;
  department: string;
  title: string;
  summary: string;
  createdAt: number;
  createdBy: string;
};

export type PanelTaskTemplateRecord = {
  id: string;
  department: string | null;
  name: string;
  tasks: string[];
  createdAt: number;
  createdBy: string;
};

export type PanelActivityRecord = {
  id: string;
  department: string;
  actorEmail: string;
  action: string;
  subjectType: string;
  subjectId: string;
  detail: string;
  createdAt: number;
};

export type PanelDepartmentRecord = {
  id: string;
  name: string;
  description: string;
  seasonGoal: string;
  weeklyNote: string;
  chiefEmail: string;
  updatedAt: number | null;
};

export type PanelOperationsSnapshot = {
  viewer: {
    email: string;
    role: PanelRole;
    department: string | null;
    canViewAllDepartments: boolean;
    canManageAllDepartments: boolean;
  };
  departments: PanelDepartmentRecord[];
  members: PanelMemberRecord[];
  tasks: PanelTaskRecord[];
  announcements: PanelAnnouncementRecord[];
  requests: PanelDepartmentRequestRecord[];
  decisions: PanelDecisionRecord[];
  templates: PanelTaskTemplateRecord[];
  activity: PanelActivityRecord[];
};

type PanelMemberRow = {
  email: string;
  name: string;
  role: string;
  department: string | null;
  special_roles: string;
  active: number;
};

type PanelTaskRow = {
  id: string;
  department: string;
  title: string;
  description: string;
  assignee_emails: string;
  priority: string;
  status: string;
  due_at: number | null;
  progress: number;
  requires_approval: number;
  approved_at: number | null;
  approved_by: string;
  checklist: string;
  blocker_note: string;
  dependency_note: string;
  calendar_url: string;
  purchase_reference: string;
  created_at: number;
  created_by: string;
  updated_at: number;
  completed_at: number | null;
};

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function parseChecklist(value: string): PanelChecklistItem[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (
        !item ||
        typeof item !== 'object' ||
        !('label' in item) ||
        typeof item.label !== 'string'
      )
        return [];
      return [
        {
          id:
            'id' in item && typeof item.id === 'string'
              ? item.id
              : crypto.randomUUID(),
          label: item.label,
          done: 'done' in item && item.done === true,
        },
      ];
    });
  } catch {
    return [];
  }
}

function normalizeRole(value: string): PanelRole {
  return value === 'chief' ||
    value === 'advisor' ||
    value === 'team_lead' ||
    value === 'admin'
    ? value
    : 'member';
}

function normalizeTaskStatus(value: string): PanelTaskStatus {
  return value === 'in_progress' ||
    value === 'blocked' ||
    value === 'review' ||
    value === 'done'
    ? value
    : 'todo';
}

function normalizePriority(value: string): PanelTaskPriority {
  return value === 'low' || value === 'high' || value === 'critical'
    ? value
    : 'normal';
}

export async function getPanelMemberProfile(
  database: D1Database,
  email: string,
) {
  const row = await database
    .prepare(
      'SELECT email, name, role, department, special_roles, active FROM panel_members WHERE email = ? LIMIT 1',
    )
    .bind(email.trim().toLowerCase())
    .first<PanelMemberRow>();
  if (!row || !row.active) return null;
  return {
    role: normalizeRole(row.role),
    department: row.department as PanelDepartment | null,
    specialRoles: parseStringArray(row.special_roles).filter(
      (role) => role === 'sponsorship_delegate',
    ) as PanelUser['specialRoles'],
  };
}

export function canViewAllDepartments(user: PanelUser) {
  return (
    user.role === 'chief' ||
    user.role === 'advisor' ||
    user.role === 'team_lead' ||
    user.role === 'admin'
  );
}

export function canManageDepartment(user: PanelUser, department: string) {
  if (
    user.role === 'admin' ||
    user.role === 'team_lead' ||
    user.role === 'advisor'
  )
    return true;
  return user.role === 'chief' && user.department === department;
}

export async function listPanelOperations(
  database: D1Database,
  user: PanelUser,
): Promise<PanelOperationsSnapshot> {
  const viewAll = canViewAllDepartments(user);
  const visibleDepartments = viewAll
    ? panelDepartmentCatalogue.map((department) => department.id)
    : user.department
      ? [user.department]
      : [];
  const placeholders = visibleDepartments.map(() => '?').join(', ');
  const departmentWhere = visibleDepartments.length
    ? `WHERE department IN (${placeholders})`
    : 'WHERE 1 = 0';
  const announcementWhere = visibleDepartments.length
    ? `WHERE (department IS NULL OR department IN (${placeholders})) AND (expires_at IS NULL OR expires_at > ?)`
    : 'WHERE 1 = 0';
  const requestWhere = visibleDepartments.length
    ? `WHERE from_department IN (${placeholders}) OR to_department IN (${placeholders})`
    : 'WHERE 1 = 0';

  const [
    settingsResult,
    membersResult,
    tasksResult,
    announcementsResult,
    requestsResult,
    decisionsResult,
    templatesResult,
    activityResult,
  ] = await Promise.all([
    database
      .prepare(
        'SELECT department, display_name, description, season_goal, weekly_note, chief_email, updated_at FROM panel_department_settings',
      )
      .all<{
        department: string;
        display_name: string;
        description: string;
        season_goal: string;
        weekly_note: string;
        chief_email: string;
        updated_at: number;
      }>(),
    database
      .prepare(
        visibleDepartments.length
          ? `SELECT email, name, role, department, special_roles, active FROM panel_members WHERE active = 1 AND department IN (${placeholders}) ORDER BY name, email`
          : 'SELECT email, name, role, department, special_roles, active FROM panel_members WHERE 1 = 0',
      )
      .bind(...visibleDepartments)
      .all<PanelMemberRow>(),
    database
      .prepare(
        `SELECT id, department, title, description, assignee_emails, priority, status, due_at, progress, requires_approval, approved_at, approved_by, checklist, blocker_note, dependency_note, calendar_url, purchase_reference, created_at, created_by, updated_at, completed_at FROM panel_tasks ${departmentWhere} ORDER BY CASE status WHEN 'blocked' THEN 0 WHEN 'todo' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'review' THEN 3 ELSE 4 END, due_at IS NULL, due_at, updated_at DESC LIMIT 1000`,
      )
      .bind(...visibleDepartments)
      .all<PanelTaskRow>(),
    database
      .prepare(
        `SELECT id, department, title, body, level, pinned, email_status, recipient_count, expires_at, created_at, created_by FROM panel_announcements ${announcementWhere} ORDER BY pinned DESC, created_at DESC LIMIT 100`,
      )
      .bind(...visibleDepartments, Date.now())
      .all<{
        id: string;
        department: string | null;
        title: string;
        body: string;
        level: string;
        pinned: number;
        email_status: string;
        recipient_count: number;
        expires_at: number | null;
        created_at: number;
        created_by: string;
      }>(),
    database
      .prepare(
        `SELECT id, from_department, to_department, title, description, status, due_at, created_at, created_by, updated_at FROM panel_department_requests ${requestWhere} ORDER BY status = 'resolved', due_at IS NULL, due_at, updated_at DESC LIMIT 300`,
      )
      .bind(...visibleDepartments, ...visibleDepartments)
      .all<{
        id: string;
        from_department: string;
        to_department: string;
        title: string;
        description: string;
        status: string;
        due_at: number | null;
        created_at: number;
        created_by: string;
        updated_at: number;
      }>(),
    database
      .prepare(
        `SELECT id, department, title, summary, created_at, created_by FROM panel_decisions ${departmentWhere} ORDER BY created_at DESC LIMIT 200`,
      )
      .bind(...visibleDepartments)
      .all<{
        id: string;
        department: string;
        title: string;
        summary: string;
        created_at: number;
        created_by: string;
      }>(),
    database
      .prepare(
        visibleDepartments.length
          ? `SELECT id, department, name, tasks, created_at, created_by FROM panel_task_templates WHERE department IS NULL OR department IN (${placeholders}) ORDER BY created_at DESC LIMIT 100`
          : 'SELECT id, department, name, tasks, created_at, created_by FROM panel_task_templates WHERE 1 = 0',
      )
      .bind(...visibleDepartments)
      .all<{
        id: string;
        department: string | null;
        name: string;
        tasks: string;
        created_at: number;
        created_by: string;
      }>(),
    database
      .prepare(
        `SELECT id, department, actor_email, action, subject_type, subject_id, detail, created_at FROM panel_activity ${departmentWhere} ORDER BY created_at DESC LIMIT 200`,
      )
      .bind(...visibleDepartments)
      .all<{
        id: string;
        department: string;
        actor_email: string;
        action: string;
        subject_type: string;
        subject_id: string;
        detail: string;
        created_at: number;
      }>(),
  ]);

  const settings = new Map(
    (settingsResult.results ?? []).map((setting) => [
      setting.department,
      setting,
    ]),
  );
  const departments = panelDepartmentCatalogue
    .filter((department) => visibleDepartments.includes(department.id))
    .map((department) => {
      const setting = settings.get(department.id);
      return {
        id: department.id,
        name: setting?.display_name ?? department.name,
        description: setting?.description || department.description,
        seasonGoal: setting?.season_goal ?? '',
        weeklyNote: setting?.weekly_note ?? '',
        chiefEmail: setting?.chief_email ?? '',
        updatedAt: setting?.updated_at ?? null,
      };
    })
    .sort((left, right) => {
      if (left.id === user.department) return -1;
      if (right.id === user.department) return 1;
      return (
        panelDepartmentCatalogue.findIndex(
          (department) => department.id === left.id,
        ) -
        panelDepartmentCatalogue.findIndex(
          (department) => department.id === right.id,
        )
      );
    });

  return {
    viewer: {
      email: user.email,
      role: user.role,
      department: user.department,
      canViewAllDepartments: viewAll,
      canManageAllDepartments:
        user.role === 'advisor' ||
        user.role === 'team_lead' ||
        user.role === 'admin',
    },
    departments,
    members: (membersResult.results ?? []).map((member) => ({
      email: member.email,
      name: member.name,
      role: normalizeRole(member.role),
      department: member.department as PanelDepartment | null,
      specialRoles: parseStringArray(member.special_roles).filter(
        (role) => role === 'sponsorship_delegate',
      ),
      active: Boolean(member.active),
    })),
    tasks: (tasksResult.results ?? []).map((task) => ({
      id: task.id,
      department: task.department,
      title: task.title,
      description: task.description,
      assigneeEmails: parseStringArray(task.assignee_emails),
      priority: normalizePriority(task.priority),
      status: normalizeTaskStatus(task.status),
      dueAt: task.due_at,
      progress: Math.min(100, Math.max(0, task.progress)),
      requiresApproval: Boolean(task.requires_approval),
      approvedAt: task.approved_at,
      approvedBy: task.approved_by,
      checklist: parseChecklist(task.checklist),
      blockerNote: task.blocker_note,
      dependencyNote: task.dependency_note,
      calendarUrl: task.calendar_url,
      purchaseReference: task.purchase_reference,
      createdAt: task.created_at,
      createdBy: task.created_by,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
    })),
    announcements: (announcementsResult.results ?? []).map((announcement) => ({
      id: announcement.id,
      department: announcement.department,
      title: announcement.title,
      body: announcement.body,
      level:
        announcement.level === 'urgent' || announcement.level === 'important'
          ? announcement.level
          : 'normal',
      pinned: Boolean(announcement.pinned),
      emailStatus: announcement.email_status,
      recipientCount: announcement.recipient_count,
      expiresAt: announcement.expires_at,
      createdAt: announcement.created_at,
      createdBy: announcement.created_by,
    })),
    requests: (requestsResult.results ?? []).map((request) => ({
      id: request.id,
      fromDepartment: request.from_department,
      toDepartment: request.to_department,
      title: request.title,
      description: request.description,
      status:
        request.status === 'in_progress' || request.status === 'resolved'
          ? request.status
          : 'open',
      dueAt: request.due_at,
      createdAt: request.created_at,
      createdBy: request.created_by,
      updatedAt: request.updated_at,
    })),
    decisions: (decisionsResult.results ?? []).map((decision) => ({
      id: decision.id,
      department: decision.department,
      title: decision.title,
      summary: decision.summary,
      createdAt: decision.created_at,
      createdBy: decision.created_by,
    })),
    templates: (templatesResult.results ?? []).map((template) => ({
      id: template.id,
      department: template.department,
      name: template.name,
      tasks: parseStringArray(template.tasks),
      createdAt: template.created_at,
      createdBy: template.created_by,
    })),
    activity: (activityResult.results ?? []).map((activity) => ({
      id: activity.id,
      department: activity.department,
      actorEmail: activity.actor_email,
      action: activity.action,
      subjectType: activity.subject_type,
      subjectId: activity.subject_id,
      detail: activity.detail,
      createdAt: activity.created_at,
    })),
  };
}

export function createActivityStatement(
  database: D1Database,
  input: {
    department: string;
    actorEmail: string;
    action: string;
    subjectType: string;
    subjectId: string;
    detail: string;
  },
) {
  return database
    .prepare(
      'INSERT INTO panel_activity (id, department, actor_email, action, subject_type, subject_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      crypto.randomUUID(),
      input.department,
      input.actorEmail,
      input.action,
      input.subjectType,
      input.subjectId,
      input.detail,
      Date.now(),
    );
}
