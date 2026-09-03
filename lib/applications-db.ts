export const applicationStatuses = ['new', 'reviewing', 'interview', 'accepted', 'rejected'] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export type NewApplicationRecord = {
  id: string;
  submittedAt: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  academicDepartment: string;
  classLevel: string;
  linkedin: string;
  portfolio: string;
  primaryTeam: string;
  secondaryTeam: string;
  programs: string;
  weeklyHours: string;
  summerParticipation: string;
  busyPeriods: string;
  communityExperience: string;
  communityDetails: string;
  projects: string;
  motivation: string;
  responsibilityScenario: string;
  motivationFactor: string;
  additionalNotes: string;
  language: string;
};

export type ApplicationRecord = NewApplicationRecord & {
  updatedAt: number;
  status: ApplicationStatus;
  assignedDepartment: string;
  reviewerNote: string;
  reviewedBy: string;
  reviewedAt: number | null;
  emailDeliveryStatus: string;
  resendEmailId: string;
};

type ApplicationRow = {
  id: string;
  submitted_at: number;
  updated_at: number;
  status: ApplicationStatus;
  assigned_department: string | null;
  reviewer_note: string;
  reviewed_by: string | null;
  reviewed_at: number | null;
  email_delivery_status: string;
  resend_email_id: string | null;
  name: string;
  email: string;
  phone: string;
  university: string;
  academic_department: string;
  class_level: string;
  linkedin: string;
  portfolio: string;
  primary_team: string;
  secondary_team: string;
  programs: string;
  weekly_hours: string;
  summer_participation: string;
  busy_periods: string;
  community_experience: string;
  community_details: string;
  projects: string;
  motivation: string;
  responsibility_scenario: string;
  motivation_factor: string;
  additional_notes: string;
  language: string;
};

function mapApplication(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    status: row.status,
    assignedDepartment: row.assigned_department ?? '',
    reviewerNote: row.reviewer_note,
    reviewedBy: row.reviewed_by ?? '',
    reviewedAt: row.reviewed_at,
    emailDeliveryStatus: row.email_delivery_status,
    resendEmailId: row.resend_email_id ?? '',
    name: row.name,
    email: row.email,
    phone: row.phone,
    university: row.university,
    academicDepartment: row.academic_department,
    classLevel: row.class_level,
    linkedin: row.linkedin,
    portfolio: row.portfolio,
    primaryTeam: row.primary_team,
    secondaryTeam: row.secondary_team,
    programs: row.programs,
    weeklyHours: row.weekly_hours,
    summerParticipation: row.summer_participation,
    busyPeriods: row.busy_periods,
    communityExperience: row.community_experience,
    communityDetails: row.community_details,
    projects: row.projects,
    motivation: row.motivation,
    responsibilityScenario: row.responsibility_scenario,
    motivationFactor: row.motivation_factor,
    additionalNotes: row.additional_notes,
    language: row.language,
  };
}

export async function insertApplication(database: D1Database, record: NewApplicationRecord) {
  return database
    .prepare(`
      INSERT INTO applications (
        id, submitted_at, updated_at, status, email_delivery_status,
        name, email, phone, university, academic_department, class_level,
        linkedin, portfolio, primary_team, secondary_team, programs,
        weekly_hours, summer_participation, busy_periods, community_experience,
        community_details, projects, motivation, responsibility_scenario,
        motivation_factor, additional_notes, language
      ) VALUES (
        ?, ?, ?, 'new', 'pending',
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `)
    .bind(
      record.id,
      record.submittedAt,
      record.submittedAt,
      record.name,
      record.email,
      record.phone,
      record.university,
      record.academicDepartment,
      record.classLevel,
      record.linkedin,
      record.portfolio,
      record.primaryTeam,
      record.secondaryTeam,
      record.programs,
      record.weeklyHours,
      record.summerParticipation,
      record.busyPeriods,
      record.communityExperience,
      record.communityDetails,
      record.projects,
      record.motivation,
      record.responsibilityScenario,
      record.motivationFactor,
      record.additionalNotes,
      record.language,
    )
    .run();
}

export async function setApplicationEmailStatus(
  database: D1Database,
  id: string,
  status: 'sent' | 'failed',
  resendEmailId = '',
) {
  return database
    .prepare('UPDATE applications SET email_delivery_status = ?, resend_email_id = ?, updated_at = ? WHERE id = ?')
    .bind(status, resendEmailId || null, Date.now(), id)
    .run();
}

export async function listApplications(
  database: D1Database,
  filters: { status?: string; team?: string; search?: string; limit?: number },
) {
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.status && applicationStatuses.includes(filters.status as ApplicationStatus)) {
    conditions.push('status = ?');
    values.push(filters.status);
  }
  if (filters.team) {
    conditions.push('(primary_team = ? OR secondary_team = ? OR assigned_department = ?)');
    values.push(filters.team, filters.team, filters.team);
  }
  if (filters.search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR academic_department LIKE ?)');
    const search = `%${filters.search.slice(0, 100)}%`;
    values.push(search, search, search);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 100);
  const result = await database
    .prepare(`SELECT * FROM applications ${where} ORDER BY submitted_at DESC LIMIT ?`)
    .bind(...values, limit)
    .all<ApplicationRow>();

  return (result.results ?? []).map(mapApplication);
}

export async function updateApplicationReview(
  database: D1Database,
  input: {
    id: string;
    status?: ApplicationStatus;
    assignedDepartment?: string;
    reviewerNote?: string;
    reviewedBy: string;
  },
) {
  const assignments = ['updated_at = ?', 'reviewed_at = ?', 'reviewed_by = ?'];
  const now = Date.now();
  const values: Array<string | number | null> = [now, now, input.reviewedBy];

  if (input.status) {
    assignments.push('status = ?');
    values.push(input.status);
  }
  if (input.assignedDepartment !== undefined) {
    assignments.push('assigned_department = ?');
    values.push(input.assignedDepartment || null);
  }
  if (input.reviewerNote !== undefined) {
    assignments.push('reviewer_note = ?');
    values.push(input.reviewerNote);
  }

  values.push(input.id);
  const result = await database
    .prepare(`UPDATE applications SET ${assignments.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return result.meta.changes > 0;
}
