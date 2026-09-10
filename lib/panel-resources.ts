import type { PanelDepartment, PanelUser } from '@/lib/panel-authorization';

export type ResourceDepartment = PanelDepartment | 'team';
export type InventoryCondition = 'good' | 'maintenance' | 'out_of_service';
export type InventoryMovementType =
  | 'in'
  | 'out'
  | 'adjustment'
  | 'assignment'
  | 'return'
  | 'purchase';
export type PurchaseStatus =
  | 'requested'
  | 'approved'
  | 'ordered'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export type InventoryItemRecord = {
  id: string;
  name: string;
  code: string;
  category: string;
  department: ResourceDepartment;
  unit: string;
  quantity: number;
  minQuantity: number;
  location: string;
  condition: InventoryCondition;
  custodianEmail: string;
  sponsorId: string;
  notes: string;
  archived: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
};

export type InventoryMovementRecord = {
  id: string;
  itemId: string;
  type: InventoryMovementType;
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  custodianEmail: string;
  note: string;
  createdAt: number;
  createdBy: string;
};

export type PurchaseRequestRecord = {
  id: string;
  title: string;
  department: ResourceDepartment;
  itemId: string;
  sponsorId: string;
  quantity: number;
  unit: string;
  justification: string;
  vendor: string;
  productUrl: string;
  estimatedCost: number;
  actualCost: number;
  currency: 'TRY' | 'EUR' | 'USD';
  status: PurchaseStatus;
  neededAt: number | null;
  orderReference: string;
  requestedBy: string;
  approvedBy: string;
  approvedAt: number | null;
  orderedAt: number | null;
  deliveredAt: number | null;
  stockApplied: boolean;
  notes: string;
  createdAt: number;
  updatedAt: number;
  updatedBy: string;
};

export type ResourceSponsorOption = {
  id: string;
  companyName: string;
};

export type PanelResourceSnapshot = {
  viewer: { email: string; role: PanelUser['role'] };
  items: InventoryItemRecord[];
  movements: InventoryMovementRecord[];
  purchases: PurchaseRequestRecord[];
  sponsors: ResourceSponsorOption[];
};

export function normalizeResourceDepartment(value: string): ResourceDepartment {
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

function normalizeCondition(value: string): InventoryCondition {
  return value === 'maintenance' || value === 'out_of_service' ? value : 'good';
}

function normalizeMovementType(value: string): InventoryMovementType {
  return value === 'out' ||
    value === 'adjustment' ||
    value === 'assignment' ||
    value === 'return' ||
    value === 'purchase'
    ? value
    : 'in';
}

function normalizePurchaseStatus(value: string): PurchaseStatus {
  return value === 'approved' ||
    value === 'ordered' ||
    value === 'delivered' ||
    value === 'rejected' ||
    value === 'cancelled'
    ? value
    : 'requested';
}

function normalizeCurrency(value: string): 'TRY' | 'EUR' | 'USD' {
  return value === 'EUR' || value === 'USD' ? value : 'TRY';
}

export async function listPanelResources(
  database: D1Database,
  user: PanelUser,
): Promise<PanelResourceSnapshot> {
  const [itemsResult, movementsResult, purchasesResult, sponsorsResult] =
    await Promise.all([
      database
        .prepare(
          `SELECT id, name, code, category, department, unit, quantity, min_quantity, location, condition, custodian_email, sponsor_id, notes, archived, created_at, created_by, updated_at, updated_by
           FROM panel_inventory_items
           ORDER BY archived, quantity <= min_quantity DESC, department, category, name
           LIMIT 2000`,
        )
        .all<Record<string, string | number | null>>(),
      database
        .prepare(
          `SELECT id, item_id, type, quantity_delta, previous_quantity, new_quantity, custodian_email, note, created_at, created_by
           FROM panel_inventory_movements
           ORDER BY created_at DESC
           LIMIT 3000`,
        )
        .all<Record<string, string | number | null>>(),
      database
        .prepare(
          `SELECT id, title, department, item_id, sponsor_id, quantity, unit, justification, vendor, product_url, estimated_cost, actual_cost, currency, status, needed_at, order_reference, requested_by, approved_by, approved_at, ordered_at, delivered_at, stock_applied, notes, created_at, updated_at, updated_by
           FROM panel_purchase_requests
           ORDER BY CASE status WHEN 'requested' THEN 0 WHEN 'approved' THEN 1 WHEN 'ordered' THEN 2 WHEN 'delivered' THEN 3 ELSE 4 END, needed_at IS NULL, needed_at, updated_at DESC
           LIMIT 2000`,
        )
        .all<Record<string, string | number | null>>(),
      database
        .prepare(
          `SELECT id, company_name
           FROM panel_sponsors
           WHERE archived = 0
           ORDER BY company_name
           LIMIT 1000`,
        )
        .all<{ id: string; company_name: string }>(),
    ]);

  const text = (row: Record<string, string | number | null>, key: string) =>
    typeof row[key] === 'string' ? row[key] : '';
  const number = (row: Record<string, string | number | null>, key: string) =>
    typeof row[key] === 'number' ? row[key] : 0;
  const timestamp = (
    row: Record<string, string | number | null>,
    key: string,
  ) => (typeof row[key] === 'number' ? row[key] : null);

  return {
    viewer: { email: user.email, role: user.role },
    items: (itemsResult.results ?? []).map((row) => ({
      id: text(row, 'id'),
      name: text(row, 'name'),
      code: text(row, 'code'),
      category: text(row, 'category'),
      department: normalizeResourceDepartment(text(row, 'department')),
      unit: text(row, 'unit'),
      quantity: number(row, 'quantity'),
      minQuantity: number(row, 'min_quantity'),
      location: text(row, 'location'),
      condition: normalizeCondition(text(row, 'condition')),
      custodianEmail: text(row, 'custodian_email'),
      sponsorId: text(row, 'sponsor_id'),
      notes: text(row, 'notes'),
      archived: Boolean(number(row, 'archived')),
      createdAt: number(row, 'created_at'),
      createdBy: text(row, 'created_by'),
      updatedAt: number(row, 'updated_at'),
      updatedBy: text(row, 'updated_by'),
    })),
    movements: (movementsResult.results ?? []).map((row) => ({
      id: text(row, 'id'),
      itemId: text(row, 'item_id'),
      type: normalizeMovementType(text(row, 'type')),
      quantityDelta: number(row, 'quantity_delta'),
      previousQuantity: number(row, 'previous_quantity'),
      newQuantity: number(row, 'new_quantity'),
      custodianEmail: text(row, 'custodian_email'),
      note: text(row, 'note'),
      createdAt: number(row, 'created_at'),
      createdBy: text(row, 'created_by'),
    })),
    purchases: (purchasesResult.results ?? []).map((row) => ({
      id: text(row, 'id'),
      title: text(row, 'title'),
      department: normalizeResourceDepartment(text(row, 'department')),
      itemId: text(row, 'item_id'),
      sponsorId: text(row, 'sponsor_id'),
      quantity: number(row, 'quantity'),
      unit: text(row, 'unit'),
      justification: text(row, 'justification'),
      vendor: text(row, 'vendor'),
      productUrl: text(row, 'product_url'),
      estimatedCost: number(row, 'estimated_cost'),
      actualCost: number(row, 'actual_cost'),
      currency: normalizeCurrency(text(row, 'currency')),
      status: normalizePurchaseStatus(text(row, 'status')),
      neededAt: timestamp(row, 'needed_at'),
      orderReference: text(row, 'order_reference'),
      requestedBy: text(row, 'requested_by'),
      approvedBy: text(row, 'approved_by'),
      approvedAt: timestamp(row, 'approved_at'),
      orderedAt: timestamp(row, 'ordered_at'),
      deliveredAt: timestamp(row, 'delivered_at'),
      stockApplied: Boolean(number(row, 'stock_applied')),
      notes: text(row, 'notes'),
      createdAt: number(row, 'created_at'),
      updatedAt: number(row, 'updated_at'),
      updatedBy: text(row, 'updated_by'),
    })),
    sponsors: (sponsorsResult.results ?? []).map((row) => ({
      id: row.id,
      companyName: row.company_name,
    })),
  };
}
