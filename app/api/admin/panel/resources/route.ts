import { env } from 'cloudflare:workers';

import { authorizePanelRequest, type PanelAccessEnv } from '@/lib/panel-access';
import { createActivityStatement } from '@/lib/panel-operations';
import {
  hasPanelPermission,
  type PanelPermission,
  type PanelUser,
} from '@/lib/panel-authorization';
import {
  listPanelResources,
  normalizeResourceDepartment,
  type InventoryCondition,
  type InventoryMovementType,
  type PurchaseStatus,
} from '@/lib/panel-resources';

type RuntimeEnv = PanelAccessEnv;

const runtimeEnv = env as unknown as RuntimeEnv;
const conditions = new Set<InventoryCondition>([
  'good',
  'maintenance',
  'out_of_service',
]);
const movementTypes = new Set<InventoryMovementType>([
  'in',
  'out',
  'adjustment',
  'assignment',
  'return',
]);
const purchaseStatuses = new Set<PurchaseStatus>([
  'requested',
  'approved',
  'ordered',
  'delivered',
  'rejected',
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
  return authorizePanelRequest(request, runtimeEnv);
}

function allowed(user: PanelUser, permission: PanelPermission) {
  return hasPanelPermission(user, permission);
}

function stringValue(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function integerValue(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.min(1_000_000_000, Math.round(parsed))
    : fallback;
}

function timestampValue(value: unknown) {
  if (value === null || value === '' || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function currencyValue(value: unknown): 'TRY' | 'EUR' | 'USD' {
  return value === 'EUR' || value === 'USD' ? value : 'TRY';
}

function urlValue(value: unknown) {
  const candidate = stringValue(value, 1000);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.toString()
      : '';
  } catch {
    return '';
  }
}

async function requestBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function linkedRecordExists(
  database: D1Database,
  table: 'panel_inventory_items' | 'panel_sponsors',
  id: string,
) {
  if (!id) return true;
  const row = await database
    .prepare(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<{ id: string }>();
  return Boolean(row);
}

export async function GET(request: Request) {
  const user = await authorize(request);
  if (
    !user ||
    (!allowed(user, 'inventory.manage') && !allowed(user, 'purchases.manage'))
  )
    return json({ ok: false, error: 'Operasyon erişimi bulunmuyor.' }, 403);
  if (!runtimeEnv.APPLICATIONS_DB)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  try {
    return json({
      ok: true,
      snapshot: await listPanelResources(runtimeEnv.APPLICATIONS_DB, user),
    });
  } catch (error) {
    console.error('Resources load failed', error);
    return json({ ok: false, error: 'Operasyon kayıtları yüklenemedi.' }, 503);
  }
}

export async function POST(request: Request) {
  const user = await authorize(request);
  if (!user) return json({ ok: false, error: 'Oturum doğrulanamadı.' }, 403);
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  const payload = await requestBody(request);
  if (!payload) return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  const type = stringValue(payload.type, 40);
  const now = Date.now();

  try {
    if (type === 'item') {
      if (!allowed(user, 'inventory.manage'))
        return json({ ok: false, error: 'Envanter yetkisi gerekli.' }, 403);
      const name = stringValue(payload.name, 200);
      if (!name)
        return json({ ok: false, error: 'Envanter adı gerekli.' }, 400);
      const id = crypto.randomUUID();
      const quantity = integerValue(payload.quantity);
      const condition = conditions.has(payload.condition as InventoryCondition)
        ? (payload.condition as InventoryCondition)
        : 'good';
      const sponsorId = stringValue(payload.sponsorId, 80);
      if (!(await linkedRecordExists(database, 'panel_sponsors', sponsorId)))
        return json({ ok: false, error: 'Sponsor kaydı bulunamadı.' }, 400);
      const statements = [
        database
          .prepare(
            `INSERT INTO panel_inventory_items (id, name, code, category, department, unit, quantity, min_quantity, location, condition, custodian_email, sponsor_id, notes, archived, created_at, created_by, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
          )
          .bind(
            id,
            name,
            stringValue(payload.code, 100),
            stringValue(payload.category, 120),
            normalizeResourceDepartment(stringValue(payload.department, 80)),
            stringValue(payload.unit, 40) || 'adet',
            quantity,
            integerValue(payload.minQuantity),
            stringValue(payload.location, 200),
            condition,
            stringValue(payload.custodianEmail, 200).toLowerCase(),
            sponsorId,
            stringValue(payload.notes, 3000),
            now,
            user.email,
            now,
            user.email,
          ),
        createActivityStatement(database, {
          department: normalizeResourceDepartment(
            stringValue(payload.department, 80),
          ),
          actorEmail: user.email,
          action: 'Envanter kaydı ekledi',
          subjectType: 'inventory',
          subjectId: id,
          detail: name,
        }),
      ];
      if (quantity > 0)
        statements.splice(
          1,
          0,
          database
            .prepare(
              `INSERT INTO panel_inventory_movements (id, item_id, type, quantity_delta, previous_quantity, new_quantity, custodian_email, note, created_at, created_by)
               VALUES (?, ?, 'adjustment', ?, 0, ?, ?, 'İlk stok', ?, ?)`,
            )
            .bind(
              crypto.randomUUID(),
              id,
              quantity,
              quantity,
              stringValue(payload.custodianEmail, 200).toLowerCase(),
              now,
              user.email,
            ),
        );
      await database.batch(statements);
      return json({ ok: true, id }, 201);
    }

    if (type === 'movement') {
      if (!allowed(user, 'inventory.manage'))
        return json({ ok: false, error: 'Envanter yetkisi gerekli.' }, 403);
      const itemId = stringValue(payload.itemId, 80);
      const item = await database
        .prepare(
          'SELECT name, department, quantity, custodian_email, archived FROM panel_inventory_items WHERE id = ? LIMIT 1',
        )
        .bind(itemId)
        .first<{
          name: string;
          department: string;
          quantity: number;
          custodian_email: string;
          archived: number;
        }>();
      if (!item || item.archived)
        return json(
          { ok: false, error: 'Aktif envanter kaydı bulunamadı.' },
          404,
        );
      const movementType = movementTypes.has(
        payload.movementType as InventoryMovementType,
      )
        ? (payload.movementType as InventoryMovementType)
        : 'in';
      let newQuantity = item.quantity;
      let custodianEmail = item.custodian_email;
      if (movementType === 'assignment') {
        custodianEmail = stringValue(payload.custodianEmail, 200).toLowerCase();
        if (!custodianEmail)
          return json({ ok: false, error: 'Zimmetlenecek kişi gerekli.' }, 400);
      } else if (movementType === 'return') {
        custodianEmail = '';
      } else if (movementType === 'adjustment') {
        newQuantity = integerValue(payload.quantity, item.quantity);
      } else {
        const quantity = integerValue(payload.quantity);
        if (quantity < 1)
          return json({ ok: false, error: 'Miktar en az 1 olmalı.' }, 400);
        newQuantity =
          movementType === 'out'
            ? item.quantity - quantity
            : item.quantity + quantity;
        if (newQuantity < 0)
          return json(
            { ok: false, error: 'Stok miktarı eksiye düşemez.' },
            400,
          );
      }
      const delta = newQuantity - item.quantity;
      const movementId = crypto.randomUUID();
      await database.batch([
        database
          .prepare(
            'UPDATE panel_inventory_items SET quantity = ?, custodian_email = ?, updated_at = ?, updated_by = ? WHERE id = ?',
          )
          .bind(newQuantity, custodianEmail, now, user.email, itemId),
        database
          .prepare(
            `INSERT INTO panel_inventory_movements (id, item_id, type, quantity_delta, previous_quantity, new_quantity, custodian_email, note, created_at, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            movementId,
            itemId,
            movementType,
            delta,
            item.quantity,
            newQuantity,
            custodianEmail,
            stringValue(payload.note, 1000),
            now,
            user.email,
          ),
        createActivityStatement(database, {
          department: item.department,
          actorEmail: user.email,
          action:
            movementType === 'assignment'
              ? 'Envanteri zimmetledi'
              : movementType === 'return'
                ? 'Envanter zimmetini kaldırdı'
                : 'Stok hareketi ekledi',
          subjectType: 'inventory',
          subjectId: itemId,
          detail: item.name,
        }),
      ]);
      return json({ ok: true, id: movementId }, 201);
    }

    if (type === 'purchase') {
      if (!allowed(user, 'purchases.manage'))
        return json({ ok: false, error: 'Satın alma yetkisi gerekli.' }, 403);
      const title = stringValue(payload.title, 240);
      if (!title)
        return json({ ok: false, error: 'Talep başlığı gerekli.' }, 400);
      const quantity = integerValue(payload.quantity, 1);
      if (quantity < 1)
        return json({ ok: false, error: 'Miktar en az 1 olmalı.' }, 400);
      const itemId = stringValue(payload.itemId, 80);
      const sponsorId = stringValue(payload.sponsorId, 80);
      if (
        !(await linkedRecordExists(database, 'panel_inventory_items', itemId))
      )
        return json({ ok: false, error: 'Envanter kaydı bulunamadı.' }, 400);
      if (!(await linkedRecordExists(database, 'panel_sponsors', sponsorId)))
        return json({ ok: false, error: 'Sponsor kaydı bulunamadı.' }, 400);
      const id = crypto.randomUUID();
      const department = normalizeResourceDepartment(
        stringValue(payload.department, 80),
      );
      await database.batch([
        database
          .prepare(
            `INSERT INTO panel_purchase_requests (id, title, department, item_id, sponsor_id, quantity, unit, justification, vendor, product_url, estimated_cost, actual_cost, currency, status, needed_at, order_reference, requested_by, approved_by, approved_at, ordered_at, delivered_at, stock_applied, notes, created_at, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'requested', ?, '', ?, '', NULL, NULL, NULL, 0, ?, ?, ?, ?)`,
          )
          .bind(
            id,
            title,
            department,
            itemId,
            sponsorId,
            quantity,
            stringValue(payload.unit, 40) || 'adet',
            stringValue(payload.justification, 3000),
            stringValue(payload.vendor, 200),
            urlValue(payload.productUrl),
            integerValue(payload.estimatedCost),
            currencyValue(payload.currency),
            timestampValue(payload.neededAt),
            user.email,
            stringValue(payload.notes, 3000),
            now,
            now,
            user.email,
          ),
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Satın alma talebi oluşturdu',
          subjectType: 'purchase',
          subjectId: id,
          detail: title,
        }),
      ]);
      return json({ ok: true, id }, 201);
    }

    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Resource create failed', error);
    return json({ ok: false, error: 'Kayıt oluşturulamadı.' }, 500);
  }
}

export async function PATCH(request: Request) {
  const user = await authorize(request);
  if (!user) return json({ ok: false, error: 'Oturum doğrulanamadı.' }, 403);
  const database = runtimeEnv.APPLICATIONS_DB;
  if (!database)
    return json({ ok: false, error: 'Panel veritabanı bağlı değil.' }, 503);
  const payload = await requestBody(request);
  if (!payload) return json({ ok: false, error: 'Geçersiz istek.' }, 400);
  const type = stringValue(payload.type, 40);
  const id = stringValue(payload.id, 80);
  const now = Date.now();

  try {
    if (type === 'item') {
      if (!allowed(user, 'inventory.manage'))
        return json({ ok: false, error: 'Envanter yetkisi gerekli.' }, 403);
      const existing = await database
        .prepare('SELECT id FROM panel_inventory_items WHERE id = ? LIMIT 1')
        .bind(id)
        .first<{ id: string }>();
      if (!existing)
        return json({ ok: false, error: 'Envanter kaydı bulunamadı.' }, 404);
      const name = stringValue(payload.name, 200);
      if (!name)
        return json({ ok: false, error: 'Envanter adı gerekli.' }, 400);
      const condition = conditions.has(payload.condition as InventoryCondition)
        ? (payload.condition as InventoryCondition)
        : 'good';
      const sponsorId = stringValue(payload.sponsorId, 80);
      if (!(await linkedRecordExists(database, 'panel_sponsors', sponsorId)))
        return json({ ok: false, error: 'Sponsor kaydı bulunamadı.' }, 400);
      const department = normalizeResourceDepartment(
        stringValue(payload.department, 80),
      );
      await database.batch([
        database
          .prepare(
            `UPDATE panel_inventory_items SET name = ?, code = ?, category = ?, department = ?, unit = ?, min_quantity = ?, location = ?, condition = ?, sponsor_id = ?, notes = ?, updated_at = ?, updated_by = ? WHERE id = ?`,
          )
          .bind(
            name,
            stringValue(payload.code, 100),
            stringValue(payload.category, 120),
            department,
            stringValue(payload.unit, 40) || 'adet',
            integerValue(payload.minQuantity),
            stringValue(payload.location, 200),
            condition,
            sponsorId,
            stringValue(payload.notes, 3000),
            now,
            user.email,
            id,
          ),
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: 'Envanter kaydını güncelledi',
          subjectType: 'inventory',
          subjectId: id,
          detail: name,
        }),
      ]);
      return json({ ok: true });
    }

    if (type === 'archive_item') {
      if (!allowed(user, 'inventory.manage'))
        return json({ ok: false, error: 'Envanter yetkisi gerekli.' }, 403);
      const result = await database
        .prepare(
          'UPDATE panel_inventory_items SET archived = ?, updated_at = ?, updated_by = ? WHERE id = ?',
        )
        .bind(payload.archived === true ? 1 : 0, now, user.email, id)
        .run();
      if (!result.meta.changes)
        return json({ ok: false, error: 'Envanter kaydı bulunamadı.' }, 404);
      return json({ ok: true });
    }

    if (type === 'purchase') {
      if (!allowed(user, 'purchases.manage'))
        return json({ ok: false, error: 'Satın alma yetkisi gerekli.' }, 403);
      const existing = await database
        .prepare(
          `SELECT title, department, item_id, quantity, status, stock_applied, approved_by, approved_at, ordered_at, delivered_at
           FROM panel_purchase_requests WHERE id = ? LIMIT 1`,
        )
        .bind(id)
        .first<{
          title: string;
          department: string;
          item_id: string;
          quantity: number;
          status: string;
          stock_applied: number;
          approved_by: string;
          approved_at: number | null;
          ordered_at: number | null;
          delivered_at: number | null;
        }>();
      if (!existing)
        return json({ ok: false, error: 'Satın alma talebi bulunamadı.' }, 404);
      const title = stringValue(payload.title, 240);
      if (!title)
        return json({ ok: false, error: 'Talep başlığı gerekli.' }, 400);
      const quantity = integerValue(payload.quantity, 1);
      if (quantity < 1)
        return json({ ok: false, error: 'Miktar en az 1 olmalı.' }, 400);
      const itemId = stringValue(payload.itemId, 80);
      const sponsorId = stringValue(payload.sponsorId, 80);
      if (
        !(await linkedRecordExists(database, 'panel_inventory_items', itemId))
      )
        return json({ ok: false, error: 'Envanter kaydı bulunamadı.' }, 400);
      if (!(await linkedRecordExists(database, 'panel_sponsors', sponsorId)))
        return json({ ok: false, error: 'Sponsor kaydı bulunamadı.' }, 400);
      if (
        existing.stock_applied &&
        (existing.item_id !== itemId || existing.quantity !== quantity)
      )
        return json(
          {
            ok: false,
            error:
              'Stoğa işlenmiş teslimatta ürün veya miktar değiştirilemez. Stok hareketiyle düzeltin.',
          },
          400,
        );
      const status = purchaseStatuses.has(payload.status as PurchaseStatus)
        ? (payload.status as PurchaseStatus)
        : 'requested';
      const department = normalizeResourceDepartment(
        stringValue(payload.department, 80),
      );
      const approvedBy =
        existing.approved_by ||
        (status === 'approved' || status === 'ordered' || status === 'delivered'
          ? user.email
          : '');
      const approvedAt =
        existing.approved_at ??
        (status === 'approved' || status === 'ordered' || status === 'delivered'
          ? now
          : null);
      const orderedAt =
        existing.ordered_at ??
        (status === 'ordered' || status === 'delivered' ? now : null);
      const deliveredAt =
        existing.delivered_at ?? (status === 'delivered' ? now : null);
      let stockApplied = Boolean(existing.stock_applied);
      const statements: D1PreparedStatement[] = [];
      let inventoryItem: {
        name: string;
        department: string;
        quantity: number;
        archived: number;
      } | null = null;
      if (status === 'delivered' && itemId && !stockApplied) {
        inventoryItem = await database
          .prepare(
            'SELECT name, department, quantity, archived FROM panel_inventory_items WHERE id = ? LIMIT 1',
          )
          .bind(itemId)
          .first<{
            name: string;
            department: string;
            quantity: number;
            archived: number;
          }>();
        if (!inventoryItem || inventoryItem.archived)
          return json(
            { ok: false, error: 'Teslimat için aktif envanter kaydı gerekli.' },
            400,
          );
        stockApplied = true;
      }
      statements.push(
        database
          .prepare(
            `UPDATE panel_purchase_requests SET title = ?, department = ?, item_id = ?, sponsor_id = ?, quantity = ?, unit = ?, justification = ?, vendor = ?, product_url = ?, estimated_cost = ?, actual_cost = ?, currency = ?, status = ?, needed_at = ?, order_reference = ?, approved_by = ?, approved_at = ?, ordered_at = ?, delivered_at = ?, stock_applied = ?, notes = ?, updated_at = ?, updated_by = ? WHERE id = ?`,
          )
          .bind(
            title,
            department,
            itemId,
            sponsorId,
            quantity,
            stringValue(payload.unit, 40) || 'adet',
            stringValue(payload.justification, 3000),
            stringValue(payload.vendor, 200),
            urlValue(payload.productUrl),
            integerValue(payload.estimatedCost),
            integerValue(payload.actualCost),
            currencyValue(payload.currency),
            status,
            timestampValue(payload.neededAt),
            stringValue(payload.orderReference, 160),
            approvedBy,
            approvedAt,
            orderedAt,
            deliveredAt,
            stockApplied ? 1 : 0,
            stringValue(payload.notes, 3000),
            now,
            user.email,
            id,
          ),
      );
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + quantity;
        statements.push(
          database
            .prepare(
              'UPDATE panel_inventory_items SET quantity = ?, updated_at = ?, updated_by = ? WHERE id = ?',
            )
            .bind(newQuantity, now, user.email, itemId),
          database
            .prepare(
              `INSERT INTO panel_inventory_movements (id, item_id, type, quantity_delta, previous_quantity, new_quantity, custodian_email, note, created_at, created_by)
               VALUES (?, ?, 'purchase', ?, ?, ?, '', ?, ?, ?)`,
            )
            .bind(
              crypto.randomUUID(),
              itemId,
              quantity,
              inventoryItem.quantity,
              newQuantity,
              `Satın alma teslimatı: ${title}`.slice(0, 1000),
              now,
              user.email,
            ),
        );
      }
      statements.push(
        createActivityStatement(database, {
          department,
          actorEmail: user.email,
          action: `Satın alma durumunu güncelledi: ${status}`,
          subjectType: 'purchase',
          subjectId: id,
          detail: title,
        }),
      );
      await database.batch(statements);
      return json({ ok: true, stockApplied });
    }

    return json({ ok: false, error: 'Desteklenmeyen işlem.' }, 400);
  } catch (error) {
    console.error('Resource update failed', error);
    return json({ ok: false, error: 'Kayıt güncellenemedi.' }, 500);
  }
}
