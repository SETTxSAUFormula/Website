import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const applications = sqliteTable(
  'applications',
  {
    id: text('id').primaryKey(),
    submittedAt: integer('submitted_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    status: text('status').notNull().default('new'),
    assignedDepartment: text('assigned_department'),
    reviewerNote: text('reviewer_note').notNull().default(''),
    reviewedBy: text('reviewed_by'),
    reviewedAt: integer('reviewed_at'),
    emailDeliveryStatus: text('email_delivery_status')
      .notNull()
      .default('pending'),
    resendEmailId: text('resend_email_id'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    university: text('university').notNull(),
    academicDepartment: text('academic_department').notNull(),
    classLevel: text('class_level').notNull(),
    linkedin: text('linkedin').notNull().default(''),
    portfolio: text('portfolio').notNull().default(''),
    primaryTeam: text('primary_team').notNull(),
    secondaryTeam: text('secondary_team').notNull().default(''),
    departmentMotivation: text('department_motivation').notNull().default(''),
    programs: text('programs').notNull(),
    weeklyHours: text('weekly_hours').notNull(),
    summerParticipation: text('summer_participation').notNull(),
    busyPeriods: text('busy_periods').notNull(),
    communityExperience: text('community_experience').notNull(),
    communityDetails: text('community_details').notNull().default(''),
    projects: text('projects').notNull(),
    motivation: text('motivation').notNull(),
    responsibilityScenario: text('responsibility_scenario').notNull(),
    motivationFactor: text('motivation_factor').notNull(),
    additionalNotes: text('additional_notes').notNull().default(''),
    language: text('language').notNull().default('tr'),
  },
  (table) => [
    index('idx_applications_status_submitted_at').on(
      table.status,
      table.submittedAt,
    ),
    index('idx_applications_primary_team_submitted_at').on(
      table.primaryTeam,
      table.submittedAt,
    ),
    index('idx_applications_email').on(table.email),
  ],
);

export const panelMembers = sqliteTable(
  'panel_members',
  {
    email: text('email').primaryKey(),
    name: text('name').notNull().default(''),
    role: text('role').notNull().default('member'),
    department: text('department'),
    specialRoles: text('special_roles').notNull().default('[]'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    updatedAt: integer('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [
    index('idx_panel_members_department_active').on(
      table.department,
      table.active,
    ),
  ],
);

export const panelMemberAudit = sqliteTable(
  'panel_member_audit',
  {
    id: text('id').primaryKey(),
    memberEmail: text('member_email').notNull(),
    action: text('action').notNull(),
    beforeState: text('before_state').notNull().default(''),
    afterState: text('after_state').notNull().default(''),
    actorEmail: text('actor_email').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('idx_panel_member_audit_member_created').on(
      table.memberEmail,
      table.createdAt,
    ),
    index('idx_panel_member_audit_actor_created').on(
      table.actorEmail,
      table.createdAt,
    ),
  ],
);

export const panelDepartmentSettings = sqliteTable(
  'panel_department_settings',
  {
    department: text('department').primaryKey(),
    displayName: text('display_name').notNull(),
    description: text('description').notNull().default(''),
    seasonGoal: text('season_goal').notNull().default(''),
    weeklyNote: text('weekly_note').notNull().default(''),
    chiefEmail: text('chief_email').notNull().default(''),
    updatedAt: integer('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [
    uniqueIndex('idx_panel_department_settings_display_name').on(
      table.displayName,
    ),
  ],
);

export const panelTasks = sqliteTable(
  'panel_tasks',
  {
    id: text('id').primaryKey(),
    department: text('department').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    assigneeEmails: text('assignee_emails').notNull().default('[]'),
    priority: text('priority').notNull().default('normal'),
    status: text('status').notNull().default('todo'),
    dueAt: integer('due_at'),
    progress: integer('progress').notNull().default(0),
    requiresApproval: integer('requires_approval', { mode: 'boolean' })
      .notNull()
      .default(false),
    approvedAt: integer('approved_at'),
    approvedBy: text('approved_by').notNull().default(''),
    checklist: text('checklist').notNull().default('[]'),
    blockerNote: text('blocker_note').notNull().default(''),
    dependencyNote: text('dependency_note').notNull().default(''),
    calendarUrl: text('calendar_url').notNull().default(''),
    purchaseReference: text('purchase_reference').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    updatedAt: integer('updated_at').notNull(),
    completedAt: integer('completed_at'),
  },
  (table) => [
    index('idx_panel_tasks_department_status_due_at').on(
      table.department,
      table.status,
      table.dueAt,
    ),
    index('idx_panel_tasks_updated_at').on(table.updatedAt),
  ],
);

export const panelAnnouncements = sqliteTable(
  'panel_announcements',
  {
    id: text('id').primaryKey(),
    department: text('department'),
    title: text('title').notNull(),
    body: text('body').notNull(),
    level: text('level').notNull().default('normal'),
    pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
    emailStatus: text('email_status').notNull().default('not_requested'),
    recipientCount: integer('recipient_count').notNull().default(0),
    expiresAt: integer('expires_at'),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
  },
  (table) => [
    index('idx_panel_announcements_department_created_at').on(
      table.department,
      table.createdAt,
    ),
    index('idx_panel_announcements_pinned_created_at').on(
      table.pinned,
      table.createdAt,
    ),
  ],
);

export const panelDepartmentRequests = sqliteTable(
  'panel_department_requests',
  {
    id: text('id').primaryKey(),
    fromDepartment: text('from_department').notNull(),
    toDepartment: text('to_department').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status').notNull().default('open'),
    dueAt: integer('due_at'),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('idx_panel_department_requests_target_status').on(
      table.toDepartment,
      table.status,
    ),
    index('idx_panel_department_requests_source_status').on(
      table.fromDepartment,
      table.status,
    ),
  ],
);

export const panelDecisions = sqliteTable(
  'panel_decisions',
  {
    id: text('id').primaryKey(),
    department: text('department').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
  },
  (table) => [
    index('idx_panel_decisions_department_created_at').on(
      table.department,
      table.createdAt,
    ),
  ],
);

export const panelTaskTemplates = sqliteTable(
  'panel_task_templates',
  {
    id: text('id').primaryKey(),
    department: text('department'),
    name: text('name').notNull(),
    tasks: text('tasks').notNull().default('[]'),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
  },
  (table) => [
    index('idx_panel_task_templates_department').on(table.department),
  ],
);

export const panelActivity = sqliteTable(
  'panel_activity',
  {
    id: text('id').primaryKey(),
    department: text('department').notNull(),
    actorEmail: text('actor_email').notNull(),
    action: text('action').notNull(),
    subjectType: text('subject_type').notNull(),
    subjectId: text('subject_id').notNull(),
    detail: text('detail').notNull().default(''),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('idx_panel_activity_department_created_at').on(
      table.department,
      table.createdAt,
    ),
  ],
);

export const panelSponsors = sqliteTable(
  'panel_sponsors',
  {
    id: text('id').primaryKey(),
    companyName: text('company_name').notNull(),
    sector: text('sector').notNull().default(''),
    department: text('department').notNull().default('team'),
    website: text('website').notNull().default(''),
    stage: text('stage').notNull().default('prospect'),
    priority: text('priority').notNull().default('normal'),
    packageName: text('package_name').notNull().default(''),
    estimatedValue: integer('estimated_value').notNull().default(0),
    confirmedValue: integer('confirmed_value').notNull().default(0),
    currency: text('currency').notNull().default('TRY'),
    contactName: text('contact_name').notNull().default(''),
    contactEmail: text('contact_email').notNull().default(''),
    contactPhone: text('contact_phone').notNull().default(''),
    ownerEmail: text('owner_email').notNull().default(''),
    source: text('source').notNull().default(''),
    nextAction: text('next_action').notNull().default(''),
    nextActionAt: integer('next_action_at'),
    notes: text('notes').notNull().default(''),
    archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    updatedAt: integer('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [
    index('idx_panel_sponsors_archived_stage_next_action').on(
      table.archived,
      table.stage,
      table.nextActionAt,
    ),
    index('idx_panel_sponsors_owner_updated').on(
      table.ownerEmail,
      table.updatedAt,
    ),
  ],
);

export const panelSponsorActivities = sqliteTable(
  'panel_sponsor_activities',
  {
    id: text('id').primaryKey(),
    sponsorId: text('sponsor_id').notNull(),
    kind: text('kind').notNull().default('note'),
    summary: text('summary').notNull(),
    occurredAt: integer('occurred_at').notNull(),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
  },
  (table) => [
    index('idx_panel_sponsor_activities_sponsor_occurred').on(
      table.sponsorId,
      table.occurredAt,
    ),
  ],
);

export const panelSponsorObligations = sqliteTable(
  'panel_sponsor_obligations',
  {
    id: text('id').primaryKey(),
    sponsorId: text('sponsor_id').notNull(),
    title: text('title').notNull(),
    status: text('status').notNull().default('open'),
    dueAt: integer('due_at'),
    ownerEmail: text('owner_email').notNull().default(''),
    note: text('note').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('idx_panel_sponsor_obligations_sponsor_status_due').on(
      table.sponsorId,
      table.status,
      table.dueAt,
    ),
  ],
);

export const panelInventoryItems = sqliteTable(
  'panel_inventory_items',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    code: text('code').notNull().default(''),
    category: text('category').notNull().default(''),
    department: text('department').notNull().default('team'),
    unit: text('unit').notNull().default('adet'),
    quantity: integer('quantity').notNull().default(0),
    minQuantity: integer('min_quantity').notNull().default(0),
    location: text('location').notNull().default(''),
    condition: text('condition').notNull().default('good'),
    custodianEmail: text('custodian_email').notNull().default(''),
    sponsorId: text('sponsor_id').notNull().default(''),
    notes: text('notes').notNull().default(''),
    archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    updatedAt: integer('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [
    index('idx_panel_inventory_archived_department_category').on(
      table.archived,
      table.department,
      table.category,
    ),
    index('idx_panel_inventory_custodian_updated').on(
      table.custodianEmail,
      table.updatedAt,
    ),
  ],
);

export const panelInventoryMovements = sqliteTable(
  'panel_inventory_movements',
  {
    id: text('id').primaryKey(),
    itemId: text('item_id').notNull(),
    type: text('type').notNull(),
    quantityDelta: integer('quantity_delta').notNull().default(0),
    previousQuantity: integer('previous_quantity').notNull().default(0),
    newQuantity: integer('new_quantity').notNull().default(0),
    custodianEmail: text('custodian_email').notNull().default(''),
    note: text('note').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    createdBy: text('created_by').notNull(),
  },
  (table) => [
    index('idx_panel_inventory_movements_item_created').on(
      table.itemId,
      table.createdAt,
    ),
  ],
);

export const panelPurchaseRequests = sqliteTable(
  'panel_purchase_requests',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    department: text('department').notNull().default('team'),
    itemId: text('item_id').notNull().default(''),
    sponsorId: text('sponsor_id').notNull().default(''),
    quantity: integer('quantity').notNull().default(1),
    unit: text('unit').notNull().default('adet'),
    justification: text('justification').notNull().default(''),
    vendor: text('vendor').notNull().default(''),
    productUrl: text('product_url').notNull().default(''),
    estimatedCost: integer('estimated_cost').notNull().default(0),
    actualCost: integer('actual_cost').notNull().default(0),
    currency: text('currency').notNull().default('TRY'),
    status: text('status').notNull().default('requested'),
    neededAt: integer('needed_at'),
    orderReference: text('order_reference').notNull().default(''),
    requestedBy: text('requested_by').notNull(),
    approvedBy: text('approved_by').notNull().default(''),
    approvedAt: integer('approved_at'),
    orderedAt: integer('ordered_at'),
    deliveredAt: integer('delivered_at'),
    stockApplied: integer('stock_applied', { mode: 'boolean' })
      .notNull()
      .default(false),
    notes: text('notes').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [
    index('idx_panel_purchases_status_department_needed').on(
      table.status,
      table.department,
      table.neededAt,
    ),
    index('idx_panel_purchases_item_updated').on(table.itemId, table.updatedAt),
  ],
);
