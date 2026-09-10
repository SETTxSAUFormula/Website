export const systemAdminEmails = [
  'admin@sauformula.org',
  'kaanfurkankaya.sett@gmail.com',
] as const;

export type PanelRole = 'member' | 'chief' | 'advisor' | 'team_lead' | 'admin';
export type PanelDepartment =
  | 'vehicle-dynamics'
  | 'chassis-structures'
  | 'powertrain'
  | 'aerodynamics'
  | 'composites-manufacturing'
  | 'electrical-electronics'
  | 'sponsorship-partnerships'
  | 'media-communications'
  | 'finance-operations';
export type PanelSpecialRole = 'sponsorship_delegate';

export type PanelPermission =
  | 'calendar.read'
  | 'calendar.manage'
  | 'departments.read'
  | 'departments.manage'
  | 'tasks.read'
  | 'tasks.manage'
  | 'sponsorship.manage'
  | 'inventory.manage'
  | 'purchases.manage'
  | 'applications.manage'
  | 'members.read'
  | 'members.manage'
  | 'permissions.manage';

export type PanelUser = {
  email: string;
  role: PanelRole;
  department: PanelDepartment | null;
  specialRoles: PanelSpecialRole[];
  isSystemAdmin: boolean;
};

const roleLabels: Record<PanelRole, string> = {
  member: 'Üye',
  chief: 'Departman şefi',
  advisor: 'Danışman',
  team_lead: 'Takım lideri',
  admin: 'Sistem yöneticisi',
};

const operationalManagers: PanelRole[] = [
  'chief',
  'advisor',
  'team_lead',
  'admin',
];

export function resolvePanelUser(
  email: string,
  profile?: Partial<Pick<PanelUser, 'role' | 'department' | 'specialRoles'>>,
): PanelUser {
  const normalizedEmail = email.trim().toLowerCase();
  const isSystemAdmin = systemAdminEmails.includes(
    normalizedEmail as (typeof systemAdminEmails)[number],
  );

  return {
    email: normalizedEmail,
    role: isSystemAdmin
      ? 'admin'
      : profile?.role === 'admin'
        ? 'member'
        : (profile?.role ?? 'member'),
    department: profile?.department ?? null,
    specialRoles: profile?.specialRoles ?? [],
    isSystemAdmin,
  };
}

export function hasPanelPermission(
  user: PanelUser,
  permission: PanelPermission,
) {
  if (
    permission === 'calendar.read' ||
    permission === 'departments.read' ||
    permission === 'tasks.read'
  )
    return true;

  if (permission === 'permissions.manage' || permission === 'members.manage') {
    return user.role === 'team_lead' || user.role === 'admin';
  }

  if (permission === 'sponsorship.manage') {
    return (
      operationalManagers.includes(user.role) ||
      user.department === 'sponsorship-partnerships' ||
      user.specialRoles.includes('sponsorship_delegate')
    );
  }

  if (permission === 'inventory.manage' || permission === 'purchases.manage') {
    return (
      operationalManagers.includes(user.role) ||
      user.department === 'finance-operations'
    );
  }

  return operationalManagers.includes(user.role);
}

export function getPanelPermissions(user: PanelUser): PanelPermission[] {
  const permissions: PanelPermission[] = [
    'calendar.read',
    'calendar.manage',
    'departments.read',
    'departments.manage',
    'tasks.read',
    'tasks.manage',
    'sponsorship.manage',
    'inventory.manage',
    'purchases.manage',
    'applications.manage',
    'members.read',
    'members.manage',
    'permissions.manage',
  ];

  return permissions.filter((permission) =>
    hasPanelPermission(user, permission),
  );
}

export function getPanelRoleLabel(role: PanelRole) {
  return roleLabels[role];
}
