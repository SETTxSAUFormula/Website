import type { PanelDepartment, PanelUser } from '@/lib/panel-authorization';

export type SponsorStage =
  | 'prospect'
  | 'contacted'
  | 'meeting'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';
export type SponsorPriority = 'low' | 'normal' | 'high';
export type PanelSponsorDepartment = PanelDepartment | 'team';
export type SponsorActivityKind =
  | 'note'
  | 'email'
  | 'call'
  | 'meeting'
  | 'proposal'
  | 'status';
export type SponsorObligationStatus = 'open' | 'completed' | 'cancelled';

export type PanelSponsorRecord = {
  id: string;
  companyName: string;
  sector: string;
  department: PanelSponsorDepartment;
  website: string;
  stage: SponsorStage;
  priority: SponsorPriority;
  packageName: string;
  estimatedValue: number;
  confirmedValue: number;
  currency: 'TRY' | 'EUR' | 'USD';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  ownerEmail: string;
  source: string;
  nextAction: string;
  nextActionAt: number | null;
  notes: string;
  archived: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
};

export type PanelSponsorActivityRecord = {
  id: string;
  sponsorId: string;
  kind: SponsorActivityKind;
  summary: string;
  occurredAt: number;
  createdAt: number;
  createdBy: string;
};

export type PanelSponsorObligationRecord = {
  id: string;
  sponsorId: string;
  title: string;
  status: SponsorObligationStatus;
  dueAt: number | null;
  ownerEmail: string;
  note: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
};

export type PanelSponsorSnapshot = {
  viewer: {
    email: string;
    role: PanelUser['role'];
  };
  sponsors: PanelSponsorRecord[];
  activities: PanelSponsorActivityRecord[];
  obligations: PanelSponsorObligationRecord[];
};

function normalizeStage(value: string): SponsorStage {
  return value === 'contacted' ||
    value === 'meeting' ||
    value === 'proposal' ||
    value === 'negotiation' ||
    value === 'won' ||
    value === 'lost'
    ? value
    : 'prospect';
}

function normalizePriority(value: string): SponsorPriority {
  return value === 'low' || value === 'high' ? value : 'normal';
}

function normalizeCurrency(value: string): 'TRY' | 'EUR' | 'USD' {
  return value === 'EUR' || value === 'USD' ? value : 'TRY';
}

function normalizeDepartment(value: string): PanelSponsorDepartment {
  return value === 'vehicle-dynamics' ||
    value === 'chassis-structures' ||
    value === 'powertrain' ||
    value === 'aerodynamics' ||
    value === 'composites-manufacturing' ||
    value === 'electrical-electronics' ||
    value === 'sponsorship-partnerships' ||
    value === 'media-communications' ||
    value === 'finance-operations'
    ? value
    : 'team';
}

function normalizeActivityKind(value: string): SponsorActivityKind {
  return value === 'email' ||
    value === 'call' ||
    value === 'meeting' ||
    value === 'proposal' ||
    value === 'status'
    ? value
    : 'note';
}

function normalizeObligationStatus(value: string): SponsorObligationStatus {
  return value === 'completed' || value === 'cancelled' ? value : 'open';
}

export async function listPanelSponsors(
  database: D1Database,
  user: PanelUser,
): Promise<PanelSponsorSnapshot> {
  const [sponsorsResult, activitiesResult, obligationsResult] =
    await Promise.all([
      database
        .prepare(
          `SELECT id, company_name, sector, department, website, stage, priority, package_name, estimated_value, confirmed_value, currency, contact_name, contact_email, contact_phone, owner_email, source, next_action, next_action_at, notes, archived, created_at, created_by, updated_at, updated_by
           FROM panel_sponsors
           ORDER BY archived, CASE stage WHEN 'negotiation' THEN 0 WHEN 'proposal' THEN 1 WHEN 'meeting' THEN 2 WHEN 'contacted' THEN 3 WHEN 'prospect' THEN 4 WHEN 'won' THEN 5 ELSE 6 END, next_action_at IS NULL, next_action_at, updated_at DESC
           LIMIT 1000`,
        )
        .all<{
          id: string;
          company_name: string;
          sector: string;
          department: string;
          website: string;
          stage: string;
          priority: string;
          package_name: string;
          estimated_value: number;
          confirmed_value: number;
          currency: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          owner_email: string;
          source: string;
          next_action: string;
          next_action_at: number | null;
          notes: string;
          archived: number;
          created_at: number;
          created_by: string;
          updated_at: number;
          updated_by: string;
        }>(),
      database
        .prepare(
          `SELECT id, sponsor_id, kind, summary, occurred_at, created_at, created_by
           FROM panel_sponsor_activities
           ORDER BY occurred_at DESC, created_at DESC
           LIMIT 2000`,
        )
        .all<{
          id: string;
          sponsor_id: string;
          kind: string;
          summary: string;
          occurred_at: number;
          created_at: number;
          created_by: string;
        }>(),
      database
        .prepare(
          `SELECT id, sponsor_id, title, status, due_at, owner_email, note, created_at, created_by, updated_at
           FROM panel_sponsor_obligations
           ORDER BY status = 'completed', status = 'cancelled', due_at IS NULL, due_at, updated_at DESC
           LIMIT 1000`,
        )
        .all<{
          id: string;
          sponsor_id: string;
          title: string;
          status: string;
          due_at: number | null;
          owner_email: string;
          note: string;
          created_at: number;
          created_by: string;
          updated_at: number;
        }>(),
    ]);

  return {
    viewer: { email: user.email, role: user.role },
    sponsors: (sponsorsResult.results ?? []).map((sponsor) => ({
      id: sponsor.id,
      companyName: sponsor.company_name,
      sector: sponsor.sector,
      department: normalizeDepartment(sponsor.department),
      website: sponsor.website,
      stage: normalizeStage(sponsor.stage),
      priority: normalizePriority(sponsor.priority),
      packageName: sponsor.package_name,
      estimatedValue: sponsor.estimated_value,
      confirmedValue: sponsor.confirmed_value,
      currency: normalizeCurrency(sponsor.currency),
      contactName: sponsor.contact_name,
      contactEmail: sponsor.contact_email,
      contactPhone: sponsor.contact_phone,
      ownerEmail: sponsor.owner_email,
      source: sponsor.source,
      nextAction: sponsor.next_action,
      nextActionAt: sponsor.next_action_at,
      notes: sponsor.notes,
      archived: Boolean(sponsor.archived),
      createdAt: sponsor.created_at,
      createdBy: sponsor.created_by,
      updatedAt: sponsor.updated_at,
      updatedBy: sponsor.updated_by,
    })),
    activities: (activitiesResult.results ?? []).map((activity) => ({
      id: activity.id,
      sponsorId: activity.sponsor_id,
      kind: normalizeActivityKind(activity.kind),
      summary: activity.summary,
      occurredAt: activity.occurred_at,
      createdAt: activity.created_at,
      createdBy: activity.created_by,
    })),
    obligations: (obligationsResult.results ?? []).map((obligation) => ({
      id: obligation.id,
      sponsorId: obligation.sponsor_id,
      title: obligation.title,
      status: normalizeObligationStatus(obligation.status),
      dueAt: obligation.due_at,
      ownerEmail: obligation.owner_email,
      note: obligation.note,
      createdAt: obligation.created_at,
      createdBy: obligation.created_by,
      updatedAt: obligation.updated_at,
    })),
  };
}
