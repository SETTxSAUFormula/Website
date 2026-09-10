'use client';

import {
  AlertTriangle,
  Archive,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  Loader2,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  TriangleAlert,
  Undo2,
  UserRoundCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { panelDepartmentCatalogue } from '@/lib/panel-operations';
import type {
  InventoryCondition,
  InventoryItemRecord,
  InventoryMovementType,
  PanelResourceSnapshot,
  PurchaseRequestRecord,
  PurchaseStatus,
  ResourceDepartment,
} from '@/lib/panel-resources';

type ResourceMode = 'inventory' | 'purchases';
type ResourceEditor =
  | { kind: 'item'; item?: InventoryItemRecord }
  | { kind: 'movement'; item: InventoryItemRecord }
  | { kind: 'purchase'; purchase?: PurchaseRequestRecord };

const departmentOptions: Array<{ id: ResourceDepartment; name: string }> = [
  { id: 'team', name: 'Takım geneli' },
  ...panelDepartmentCatalogue.map(({ id, name }) => ({ id, name })),
];
const conditionLabels: Record<InventoryCondition, string> = {
  good: 'Kullanıma hazır',
  maintenance: 'Bakım gerekli',
  out_of_service: 'Kullanım dışı',
};
const movementLabels: Record<InventoryMovementType, string> = {
  in: 'Stok girişi',
  out: 'Stok çıkışı',
  adjustment: 'Sayım düzeltmesi',
  assignment: 'Zimmet',
  return: 'Zimmet iadesi',
  purchase: 'Satın alma teslimatı',
};
const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  requested: 'Onay bekliyor',
  approved: 'Onaylandı',
  ordered: 'Sipariş verildi',
  delivered: 'Teslim edildi',
  rejected: 'Reddedildi',
  cancelled: 'İptal edildi',
};
const purchaseStatusStyles: Record<PurchaseStatus, string> = {
  requested: 'border-[#efd48e] bg-[#fff8e7] text-[#785a16]',
  approved: 'border-[#9dd5b9] bg-[#eaf8f1] text-[#087347]',
  ordered: 'border-[#9fc6e0] bg-[#edf7fc] text-[#285c79]',
  delivered: 'border-[#7fcda6] bg-[#ddf7e9] text-[#05683e]',
  rejected: 'border-[#e6b6b2] bg-[#fff0ee] text-[#95362d]',
  cancelled: 'border-[#cbd4cf] bg-[#f2f5f3] text-[#68766f]',
};

function departmentLabel(department: ResourceDepartment) {
  return (
    departmentOptions.find((option) => option.id === department)?.name ??
    'Takım geneli'
  );
}

function formatDate(value: number | null) {
  return value
    ? new Intl.DateTimeFormat('tr-TR', {
        timeZone: 'Europe/Istanbul',
        dateStyle: 'medium',
      }).format(new Date(value))
    : 'Tarih girilmedi';
}

function formatMoney(value: number, currency: 'TRY' | 'EUR' | 'USD') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateInput(value: number | null) {
  if (!value) return '';
  const date = new Date(value);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function formatDateTyping(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join('/');
}

function parseDateInput(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day), 9);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  )
    return null;
  return timestamp;
}

async function fetchResourceSnapshot() {
  const response = await fetch('/api/admin/panel/resources', {
    cache: 'no-store',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  const result = (await response.json()) as {
    ok?: boolean;
    error?: string;
    snapshot?: PanelResourceSnapshot;
  };
  if (!response.ok || !result.ok || !result.snapshot)
    throw new Error(result.error || 'Operasyon kayıtları yüklenemedi.');
  return result.snapshot;
}

function useResources() {
  const [snapshot, setSnapshot] = useState<PanelResourceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setSnapshot(await fetchResourceSnapshot());
      setError('');
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Operasyon kayıtları yüklenemedi.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchResourceSnapshot()
      .then((result) => {
        if (!cancelled) {
          setSnapshot(result);
          setError('');
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Operasyon kayıtları yüklenemedi.',
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = useCallback(
    async (method: 'POST' | 'PATCH', body: Record<string, unknown>) => {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/panel/resources', {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
        });
        const result = (await response.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!response.ok || !result.ok)
          throw new Error(result.error || 'Kayıt güncellenemedi.');
        await load();
        return true;
      } catch (mutationError) {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : 'Kayıt güncellenemedi.',
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [load],
  );

  return { snapshot, loading, saving, error, load, mutate };
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  warning = false,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Boxes;
  warning?: boolean;
}) {
  return (
    <Card className="border border-[#dce6e1] bg-white shadow-sm ring-0">
      <CardHeader className="grid grid-cols-[1fr_auto] gap-4 pb-2">
        <div>
          <CardDescription className="font-semibold text-[#617169]">
            {label}
          </CardDescription>
          <CardTitle className="mt-2 text-2xl font-extrabold text-[#071a13]">
            {value}
          </CardTitle>
        </div>
        <span
          className={`grid size-9 place-items-center ${warning ? 'bg-[#fff3e5] text-[#b05c08]' : 'bg-[#e6f8ef] text-[#07864f]'}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-[#728078]">{note}</CardContent>
    </Card>
  );
}

function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-none ${purchaseStatusStyles[status]}`}
    >
      {purchaseStatusLabels[status]}
    </Badge>
  );
}

function ItemDetail({
  item,
  snapshot,
  saving,
  onClose,
  onEdit,
  onMovement,
  onMutate,
}: {
  item: InventoryItemRecord | null;
  snapshot: PanelResourceSnapshot;
  saving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onMovement: () => void;
  onMutate: (
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
  ) => Promise<boolean>;
}) {
  if (!item) return null;
  const movements = snapshot.movements.filter(
    (movement) => movement.itemId === item.id,
  );
  const sponsor = snapshot.sponsors.find(
    (option) => option.id === item.sponsorId,
  );
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="panel-light-theme w-full overflow-y-auto bg-white text-[#071a13] sm:max-w-xl">
        <SheetHeader className="border-b border-[#dce6e1] pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-none">
              {departmentLabel(item.department)}
            </Badge>
            <Badge
              variant="outline"
              className={`rounded-none ${item.condition === 'good' ? 'border-[#9dd5b9] bg-[#eaf8f1] text-[#087347]' : item.condition === 'maintenance' ? 'border-[#efd48e] bg-[#fff8e7] text-[#785a16]' : 'border-[#e6b6b2] bg-[#fff0ee] text-[#95362d]'}`}
            >
              {conditionLabels[item.condition]}
            </Badge>
          </div>
          <SheetTitle className="mt-3 font-heading text-2xl font-extrabold">
            {item.name}
          </SheetTitle>
          <SheetDescription>
            {[item.code, item.category].filter(Boolean).join(' · ') ||
              'Kod ve kategori girilmedi'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#e4f9ee] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#587064]">
                Mevcut stok
              </p>
              <p className="mt-2 text-xl font-extrabold text-[#087347]">
                {item.quantity} {item.unit}
              </p>
            </div>
            <div className="bg-[#eef7f2] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#687970]">
                Minimum stok
              </p>
              <p className="mt-2 text-xl font-extrabold text-[#17382b]">
                {item.minQuantity} {item.unit}
              </p>
            </div>
          </div>
          <section className="grid gap-3 text-sm">
            <p className="flex items-center gap-2 text-[#405249]">
              <MapPin className="size-4 text-[#07864f]" />
              Konum: {item.location || 'Girilmedi'}
            </p>
            <p className="flex items-center gap-2 text-[#405249]">
              <UserRoundCheck className="size-4 text-[#07864f]" />
              Zimmet: {item.custodianEmail || 'Zimmetli değil'}
            </p>
            <p className="flex items-center gap-2 text-[#405249]">
              <ShieldCheck className="size-4 text-[#07864f]" />
              Kaynak: {sponsor?.companyName ?? 'Takım kaynağı'}
            </p>
          </section>
          {item.notes ? (
            <section>
              <h3 className="font-heading text-base font-extrabold">Not</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#596a61]">
                {item.notes}
              </p>
            </section>
          ) : null}
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-base font-extrabold">
                Hareket geçmişi
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="rounded-none"
                onClick={onMovement}
              >
                <Plus /> İşlem ekle
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {movements.slice(0, 20).map((movement) => (
                <div key={movement.id} className="border border-[#dce6e1] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#273f34]">
                        {movementLabels[movement.type]}
                      </p>
                      <p className="mt-1 text-xs text-[#718078]">
                        {movement.previousQuantity} → {movement.newQuantity}{' '}
                        {item.unit} · {formatDate(movement.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${movement.quantityDelta > 0 ? 'text-[#087347]' : movement.quantityDelta < 0 ? 'text-[#b42318]' : 'text-[#65756d]'}`}
                    >
                      {movement.quantityDelta > 0 ? '+' : ''}
                      {movement.quantityDelta}
                    </span>
                  </div>
                  {movement.note ? (
                    <p className="mt-2 text-sm text-[#596a61]">
                      {movement.note}
                    </p>
                  ) : null}
                </div>
              ))}
              {!movements.length ? (
                <p className="border border-dashed border-[#cad8d1] p-5 text-center text-sm text-[#718078]">
                  Henüz hareket kaydı yok.
                </p>
              ) : null}
            </div>
          </section>
          <div className="flex flex-wrap gap-2 border-t border-[#dce6e1] pt-5">
            <Button className="rounded-none" onClick={onEdit}>
              <Pencil /> Düzenle
            </Button>
            <Button
              variant="outline"
              className="rounded-none"
              disabled={saving}
              onClick={() =>
                void onMutate('PATCH', {
                  type: 'archive_item',
                  id: item.id,
                  archived: !item.archived,
                }).then((ok) => ok && onClose())
              }
            >
              {item.archived ? <Undo2 /> : <Archive />}
              {item.archived ? 'Arşivden çıkar' : 'Arşivle'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PurchaseDetail({
  purchase,
  snapshot,
  onClose,
  onEdit,
}: {
  purchase: PurchaseRequestRecord | null;
  snapshot: PanelResourceSnapshot;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!purchase) return null;
  const item = snapshot.items.find((option) => option.id === purchase.itemId);
  const sponsor = snapshot.sponsors.find(
    (option) => option.id === purchase.sponsorId,
  );
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="panel-light-theme w-full overflow-y-auto bg-white text-[#071a13] sm:max-w-xl">
        <SheetHeader className="border-b border-[#dce6e1] pr-10">
          <PurchaseStatusBadge status={purchase.status} />
          <SheetTitle className="mt-3 font-heading text-2xl font-extrabold">
            {purchase.title}
          </SheetTitle>
          <SheetDescription>
            {departmentLabel(purchase.department)} · {purchase.quantity}{' '}
            {purchase.unit}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#eef7f2] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#687970]">
                Tahmini maliyet
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#17382b]">
                {formatMoney(purchase.estimatedCost, purchase.currency)}
              </p>
            </div>
            <div className="bg-[#e4f9ee] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#587064]">
                Gerçek maliyet
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#087347]">
                {formatMoney(purchase.actualCost, purchase.currency)}
              </p>
            </div>
          </div>
          <section>
            <h3 className="font-heading text-base font-extrabold">
              Talep özeti
            </h3>
            <div className="mt-3 space-y-2 text-sm text-[#506158]">
              <p>Gereken tarih: {formatDate(purchase.neededAt)}</p>
              <p>Tedarikçi: {purchase.vendor || 'Belirlenmedi'}</p>
              {purchase.productUrl ? (
                <a
                  href={purchase.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-[#087347] hover:underline"
                >
                  <ExternalLink className="size-4" />
                  Ürün / teklif bağlantısını aç
                </a>
              ) : (
                <p>Ürün / teklif bağlantısı: Girilmedi</p>
              )}
              <p>
                Sipariş / teklif no: {purchase.orderReference || 'Girilmedi'}
              </p>
              <p>Envanter bağlantısı: {item?.name ?? 'Bağlı değil'}</p>
              <p>Sponsor desteği: {sponsor?.companyName ?? 'Yok'}</p>
              <p>Talep eden: {purchase.requestedBy}</p>
              <p>Onaylayan: {purchase.approvedBy || 'Henüz onaylanmadı'}</p>
            </div>
          </section>
          {purchase.justification ? (
            <section>
              <h3 className="font-heading text-base font-extrabold">Gerekçe</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#596a61]">
                {purchase.justification}
              </p>
            </section>
          ) : null}
          {purchase.stockApplied ? (
            <div className="border-l-4 border-[#00a85d] bg-[#eaf8f1] p-4 text-sm font-semibold text-[#087347]">
              Teslimat bağlı envanter kaydının stoğuna işlendi.
            </div>
          ) : null}
          <div className="border-t border-[#dce6e1] pt-5">
            <Button className="rounded-none" onClick={onEdit}>
              <Pencil /> Talebi düzenle
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ResourceEditorDialog({
  editor,
  snapshot,
  saving,
  onClose,
  onSubmit,
}: {
  editor: ResourceEditor | null;
  snapshot: PanelResourceSnapshot;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
  ) => Promise<void>;
}) {
  if (!editor) return null;
  const item = editor.kind === 'item' ? editor.item : undefined;
  const purchase = editor.kind === 'purchase' ? editor.purchase : undefined;
  const title =
    editor.kind === 'item'
      ? item
        ? 'Envanter kaydını düzenle'
        : 'Yeni envanter kaydı'
      : editor.kind === 'movement'
        ? 'Envanter işlemi ekle'
        : purchase
          ? 'Satın alma talebini düzenle'
          : 'Yeni satın alma talebi';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="panel-light-theme max-h-[calc(100vh-2rem)] overflow-y-auto rounded-none bg-white text-[#071a13] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-extrabold">
            {title}
          </DialogTitle>
          <DialogDescription>
            {editor.kind === 'movement'
              ? editor.item.name
              : 'Takım operasyon kaydı'}
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-2 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const get = (name: string) => {
              const value = form.get(name);
              return typeof value === 'string' ? value.trim() : '';
            };
            if (editor.kind === 'item') {
              void onSubmit(item ? 'PATCH' : 'POST', {
                type: 'item',
                ...(item ? { id: item.id } : {}),
                name: get('name'),
                code: get('code'),
                category: get('category'),
                department: get('department'),
                unit: get('unit'),
                ...(!item ? { quantity: Number(get('quantity') || 0) } : {}),
                minQuantity: Number(get('minQuantity') || 0),
                location: get('location'),
                condition: get('condition'),
                custodianEmail: get('custodianEmail'),
                sponsorId: get('sponsorId') === 'none' ? '' : get('sponsorId'),
                notes: get('notes'),
              });
            } else if (editor.kind === 'movement') {
              void onSubmit('POST', {
                type: 'movement',
                itemId: editor.item.id,
                movementType: get('movementType'),
                quantity: Number(get('quantity') || 0),
                custodianEmail: get('custodianEmail'),
                note: get('note'),
              });
            } else {
              const neededAt = get('neededAt');
              void onSubmit(purchase ? 'PATCH' : 'POST', {
                type: 'purchase',
                ...(purchase ? { id: purchase.id } : {}),
                title: get('title'),
                department: get('department'),
                itemId: get('itemId') === 'none' ? '' : get('itemId'),
                sponsorId: get('sponsorId') === 'none' ? '' : get('sponsorId'),
                quantity: Number(get('quantity') || 1),
                unit: get('unit'),
                justification: get('justification'),
                vendor: get('vendor'),
                productUrl: get('productUrl'),
                estimatedCost: Number(get('estimatedCost') || 0),
                actualCost: Number(get('actualCost') || 0),
                currency: get('currency'),
                status: get('status'),
                neededAt: neededAt ? parseDateInput(neededAt) : null,
                orderReference: get('orderReference'),
                notes: get('notes'),
              });
            }
          }}
        >
          {editor.kind === 'item' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="resource-item-name">Ad</Label>
                  <Input
                    id="resource-item-name"
                    name="name"
                    required
                    defaultValue={item?.name}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-item-code">Kod / seri no</Label>
                  <Input
                    id="resource-item-code"
                    name="code"
                    defaultValue={item?.code}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="resource-item-category">Kategori</Label>
                  <Input
                    id="resource-item-category"
                    name="category"
                    defaultValue={item?.category}
                    placeholder="Elektronik, takım, sarf..."
                    className="rounded-none"
                  />
                </div>
                <DepartmentSelect
                  name="department"
                  value={item?.department ?? 'team'}
                />
                <div className="grid gap-2">
                  <Label>Durum</Label>
                  <Select
                    name="condition"
                    defaultValue={item?.condition ?? 'good'}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          conditionLabels[value as InventoryCondition] ??
                          conditionLabels.good
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {Object.entries(conditionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div
                className={`grid gap-4 ${item ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}
              >
                {!item ? (
                  <div className="grid gap-2">
                    <Label htmlFor="resource-item-quantity">İlk stok</Label>
                    <Input
                      id="resource-item-quantity"
                      name="quantity"
                      type="number"
                      min={0}
                      defaultValue={0}
                      className="rounded-none"
                    />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="resource-item-unit">Birim</Label>
                  <Input
                    id="resource-item-unit"
                    name="unit"
                    defaultValue={item?.unit ?? 'adet'}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-item-min">Minimum stok</Label>
                  <Input
                    id="resource-item-min"
                    name="minQuantity"
                    type="number"
                    min={0}
                    defaultValue={item?.minQuantity ?? 0}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-item-location">Konum</Label>
                <Input
                  id="resource-item-location"
                  name="location"
                  defaultValue={item?.location}
                  placeholder="Atölye, raf A3..."
                  className="rounded-none"
                />
              </div>
              <SponsorSelect
                snapshot={snapshot}
                value={item?.sponsorId ?? 'none'}
              />
              <div className="grid gap-2">
                <Label htmlFor="resource-item-notes">Not</Label>
                <Textarea
                  id="resource-item-notes"
                  name="notes"
                  defaultValue={item?.notes}
                  className="min-h-24 rounded-none"
                />
              </div>
            </>
          ) : null}

          {editor.kind === 'movement' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>İşlem</Label>
                  <Select name="movementType" defaultValue="in">
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          movementLabels[value as InventoryMovementType] ??
                          movementLabels.in
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="in">Stok girişi</SelectItem>
                      <SelectItem value="out">Stok çıkışı</SelectItem>
                      <SelectItem value="adjustment">
                        Sayım düzeltmesi
                      </SelectItem>
                      <SelectItem value="assignment">Zimmetle</SelectItem>
                      <SelectItem value="return">Zimmeti kaldır</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-movement-quantity">
                    Miktar / yeni stok
                  </Label>
                  <Input
                    id="resource-movement-quantity"
                    name="quantity"
                    type="number"
                    min={0}
                    defaultValue={1}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-movement-custodian">
                  Zimmetlenecek üye
                </Label>
                <Input
                  id="resource-movement-custodian"
                  name="custodianEmail"
                  type="email"
                  placeholder="Yalnızca zimmet işleminde gerekli"
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-movement-note">İşlem notu</Label>
                <Textarea
                  id="resource-movement-note"
                  name="note"
                  placeholder="Neden, teslim alan kişi veya sayım açıklaması"
                  className="min-h-28 rounded-none"
                />
              </div>
            </>
          ) : null}

          {editor.kind === 'purchase' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-title">Talep</Label>
                  <Input
                    id="resource-purchase-title"
                    name="title"
                    required
                    defaultValue={purchase?.title}
                    placeholder="Satın alınacak ürün veya hizmet"
                    className="rounded-none"
                  />
                </div>
                <DepartmentSelect
                  name="department"
                  value={purchase?.department ?? 'team'}
                  label="Talep eden departman"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-quantity">Miktar</Label>
                  <Input
                    id="resource-purchase-quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={purchase?.quantity ?? 1}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-unit">Birim</Label>
                  <Input
                    id="resource-purchase-unit"
                    name="unit"
                    defaultValue={purchase?.unit ?? 'adet'}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-needed">
                    Gereken tarih
                  </Label>
                  <Input
                    id="resource-purchase-needed"
                    name="neededAt"
                    defaultValue={formatDateInput(purchase?.neededAt ?? null)}
                    placeholder="GG/AA/YYYY"
                    maxLength={10}
                    onInput={(event) => {
                      event.currentTarget.value = formatDateTyping(
                        event.currentTarget.value,
                      );
                    }}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Bağlı envanter kalemi</Label>
                  <Select
                    name="itemId"
                    defaultValue={purchase?.itemId || 'none'}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          value === 'none'
                            ? 'Bağlama'
                            : (snapshot.items.find(
                                (option) => option.id === value,
                              )?.name ?? 'Envanter kalemi')
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="none">Bağlama</SelectItem>
                      {snapshot.items
                        .filter((option) => !option.archived)
                        .map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <SponsorSelect
                  snapshot={snapshot}
                  value={purchase?.sponsorId || 'none'}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-estimated">
                    Tahmini maliyet
                  </Label>
                  <Input
                    id="resource-purchase-estimated"
                    name="estimatedCost"
                    type="number"
                    min={0}
                    defaultValue={purchase?.estimatedCost ?? 0}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-url">
                    Ürün / teklif bağlantısı
                  </Label>
                  <Input
                    id="resource-purchase-url"
                    name="productUrl"
                    type="url"
                    defaultValue={purchase?.productUrl}
                    placeholder="https://..."
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-actual">
                    Gerçek maliyet
                  </Label>
                  <Input
                    id="resource-purchase-actual"
                    name="actualCost"
                    type="number"
                    min={0}
                    defaultValue={purchase?.actualCost ?? 0}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Para birimi</Label>
                  <Select
                    name="currency"
                    defaultValue={purchase?.currency ?? 'TRY'}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) => (typeof value === 'string' ? value : 'TRY')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-vendor">Tedarikçi</Label>
                  <Input
                    id="resource-purchase-vendor"
                    name="vendor"
                    defaultValue={purchase?.vendor}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-purchase-reference">
                    Teklif / sipariş no
                  </Label>
                  <Input
                    id="resource-purchase-reference"
                    name="orderReference"
                    defaultValue={purchase?.orderReference}
                    className="rounded-none"
                  />
                </div>
              </div>
              {purchase ? (
                <div className="grid gap-2">
                  <Label>Durum</Label>
                  <Select name="status" defaultValue={purchase.status}>
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          purchaseStatusLabels[value as PurchaseStatus] ??
                          purchaseStatusLabels.requested
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {Object.entries(purchaseStatusLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#718078]">
                    Teslim edildiğinde bağlı envanterin stoğu yalnızca bir kez
                    artar.
                  </p>
                </div>
              ) : (
                <input type="hidden" name="status" value="requested" />
              )}
              <div className="grid gap-2">
                <Label htmlFor="resource-purchase-justification">Gerekçe</Label>
                <Textarea
                  id="resource-purchase-justification"
                  name="justification"
                  defaultValue={purchase?.justification}
                  className="min-h-28 rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-purchase-notes">Not</Label>
                <Textarea
                  id="resource-purchase-notes"
                  name="notes"
                  defaultValue={purchase?.notes}
                  className="min-h-20 rounded-none"
                />
              </div>
            </>
          ) : null}

          <DialogFooter className="border-t border-[#dce6e1] pt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={onClose}
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-none bg-[#00a85d] text-[#061c14]"
            >
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}{' '}
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentSelect({
  name,
  value,
  label = 'İlgili departman',
}: {
  name: string;
  value: ResourceDepartment;
  label?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select name={name} defaultValue={value}>
        <SelectTrigger className="w-full rounded-none">
          <SelectValue>
            {(selected) =>
              departmentLabel(
                typeof selected === 'string'
                  ? (selected as ResourceDepartment)
                  : 'team',
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
          {departmentOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SponsorSelect({
  snapshot,
  value,
}: {
  snapshot: PanelResourceSnapshot;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>Sponsor kaynağı</Label>
      <Select name="sponsorId" defaultValue={value}>
        <SelectTrigger className="w-full rounded-none">
          <SelectValue>
            {(selected) =>
              selected === 'none'
                ? 'Sponsor bağlantısı yok'
                : (snapshot.sponsors.find((option) => option.id === selected)
                    ?.companyName ?? 'Sponsor')
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
          <SelectItem value="none">Sponsor bağlantısı yok</SelectItem>
          {snapshot.sponsors.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.companyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ResourceWorkspace({ mode }: { mode: ResourceMode }) {
  const { snapshot, loading, saving, error, load, mutate } = useResources();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null,
  );
  const [editor, setEditor] = useState<ResourceEditor | null>(null);

  const filteredItems = useMemo(() => {
    if (!snapshot) return [];
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    return snapshot.items.filter((item) => {
      if (item.archived !== showArchived) return false;
      if (filter === 'low' && item.quantity > item.minQuantity) return false;
      if (filter !== 'all' && filter !== 'low' && item.department !== filter)
        return false;
      if (!needle) return true;
      return [
        item.name,
        item.code,
        item.category,
        item.location,
        item.custodianEmail,
      ].some((value) => value.toLocaleLowerCase('tr-TR').includes(needle));
    });
  }, [filter, query, showArchived, snapshot]);

  const filteredPurchases = useMemo(() => {
    if (!snapshot) return [];
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    return snapshot.purchases.filter((purchase) => {
      if (filter !== 'all' && purchase.status !== filter) return false;
      if (!needle) return true;
      return [
        purchase.title,
        purchase.vendor,
        purchase.productUrl,
        purchase.requestedBy,
        departmentLabel(purchase.department),
      ].some((value) => value.toLocaleLowerCase('tr-TR').includes(needle));
    });
  }, [filter, query, snapshot]);

  if (loading && !snapshot)
    return (
      <div className="grid min-h-80 place-items-center text-[#53655c]">
        <div className="text-center">
          <Loader2 className="mx-auto size-7 animate-spin text-[#00a85d]" />
          <p className="mt-3 text-sm font-semibold">
            Operasyon kayıtları yükleniyor
          </p>
        </div>
      </div>
    );
  if (!snapshot)
    return (
      <div className="mx-auto max-w-xl border border-[#efc7c3] bg-white p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-[#b42318]" />
        <h1 className="mt-4 font-heading text-2xl font-extrabold">
          Çalışma alanı açılamadı
        </h1>
        <p className="mt-2 text-sm text-[#6c7b74]">{error}</p>
        <Button className="mt-5 rounded-none" onClick={() => void load()}>
          <Loader2 /> Yeniden dene
        </Button>
      </div>
    );

  const activeItems = snapshot.items.filter((item) => !item.archived);
  const lowStock = activeItems.filter(
    (item) => item.quantity <= item.minQuantity,
  );
  const assigned = activeItems.filter((item) => item.custodianEmail);
  const pending = snapshot.purchases.filter(
    (purchase) => purchase.status === 'requested',
  );
  const inProgress = snapshot.purchases.filter(
    (purchase) =>
      purchase.status === 'approved' || purchase.status === 'ordered',
  );
  const delivered = snapshot.purchases.filter(
    (purchase) => purchase.status === 'delivered',
  );
  const selectedItem = selectedItemId
    ? (snapshot.items.find((item) => item.id === selectedItemId) ?? null)
    : null;
  const selectedPurchase = selectedPurchaseId
    ? (snapshot.purchases.find(
        (purchase) => purchase.id === selectedPurchaseId,
      ) ?? null)
    : null;

  async function submit(
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
  ) {
    const ok = await mutate(method, body);
    if (ok) setEditor(null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {error ? (
        <div className="mb-5 flex items-center gap-3 border-l-4 border-[#b42318] bg-[#fff0ee] px-4 py-3 text-sm text-[#812d25]">
          <AlertTriangle className="size-4" /> {error}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
            {mode === 'inventory' ? 'Varlık ve stok' : 'Talep ve tedarik'}
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            {mode === 'inventory' ? 'Envanter yönetimi' : 'Satın alma takibi'}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#5a6962]">
            {mode === 'inventory'
              ? 'Takım ekipmanı, sarf stokları, konum, zimmet ve hareket geçmişi.'
              : 'Departman taleplerini onaydan siparişe ve teslimata kadar yönetin.'}
          </p>
        </div>
        <Button
          className="rounded-none bg-[#00a85d] text-[#061c14]"
          onClick={() =>
            setEditor(
              mode === 'inventory' ? { kind: 'item' } : { kind: 'purchase' },
            )
          }
        >
          <Plus /> {mode === 'inventory' ? 'Yeni envanter' : 'Yeni talep'}
        </Button>
      </div>

      {mode === 'inventory' ? (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Aktif kalem"
              value={activeItems.length}
              note="Kayıtlı ürün ve ekipman"
              icon={Boxes}
            />
            <SummaryCard
              label="Toplam stok"
              value={activeItems.reduce((sum, item) => sum + item.quantity, 0)}
              note="Tüm birimlerin toplamı"
              icon={PackageCheck}
            />
            <SummaryCard
              label="Düşük stok"
              value={lowStock.length}
              note="Minimum seviyede veya altında"
              icon={TriangleAlert}
              warning={lowStock.length > 0}
            />
            <SummaryCard
              label="Zimmetli"
              value={assigned.length}
              note="Üye sorumluluğundaki kalem"
              icon={UserRoundCheck}
            />
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-[1fr_16rem_auto]">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Ürün, kod, konum veya üye ara"
            />
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value ?? 'all')}
            >
              <SelectTrigger className="w-full rounded-none bg-white">
                <SelectValue>
                  {(value) =>
                    value === 'all'
                      ? 'Tüm departmanlar'
                      : value === 'low'
                        ? 'Yalnız düşük stok'
                        : departmentLabel(value as ResourceDepartment)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                <SelectItem value="all">Tüm departmanlar</SelectItem>
                <SelectItem value="low">Yalnız düşük stok</SelectItem>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="rounded-none bg-white"
              onClick={() => setShowArchived((value) => !value)}
            >
              {showArchived ? <Undo2 /> : <Archive />}{' '}
              {showArchived ? 'Aktifleri göster' : 'Arşiv'}
            </Button>
          </div>
          <div className="mt-4 border border-[#d8e4de] bg-white">
            <Table>
              <TableHeader className="bg-[#f1f6f3]">
                <TableRow>
                  <TableHead className="px-4">Envanter</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Zimmet</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => setSelectedItemId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedItemId(item.id);
                      }
                    }}
                  >
                    <TableCell className="px-4 py-4">
                      <p className="font-bold text-[#17382b]">{item.name}</p>
                      <p className="mt-1 text-xs text-[#718078]">
                        {[item.code, item.category]
                          .filter(Boolean)
                          .join(' · ') || 'Kod ve kategori yok'}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {departmentLabel(item.department)}
                    </TableCell>
                    <TableCell>
                      <p
                        className={`font-bold ${item.quantity <= item.minQuantity ? 'text-[#b05c08]' : 'text-[#17382b]'}`}
                      >
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-[#718078]">
                        Min. {item.minQuantity}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.location || 'Girilmedi'}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-sm">
                      {item.custodianEmail || 'Zimmetli değil'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="rounded-none">
                        {conditionLabels[item.condition]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filteredItems.length ? (
              <p className="p-10 text-center text-sm text-[#718078]">
                Bu filtrede envanter kaydı yok.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Onay bekleyen"
              value={pending.length}
              note="Karar verilmesi gereken talep"
              icon={ClipboardList}
              warning={pending.length > 0}
            />
            <SummaryCard
              label="Tedarik sürecinde"
              value={inProgress.length}
              note="Onaylanan veya sipariş edilen"
              icon={ReceiptText}
            />
            <SummaryCard
              label="Teslim edilen"
              value={delivered.length}
              note="Tamamlanan satın alma"
              icon={PackageCheck}
            />
            <SummaryCard
              label="Gerçekleşen maliyet"
              value={formatMoney(
                delivered.reduce(
                  (sum, purchase) =>
                    purchase.currency === 'TRY'
                      ? sum + purchase.actualCost
                      : sum,
                  0,
                ),
                'TRY',
              )}
              note="Yalnız TRY teslimatları"
              icon={CircleDollarSign}
            />
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-[1fr_16rem]">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Talep, tedarikçi veya talep eden ara"
            />
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value ?? 'all')}
            >
              <SelectTrigger className="w-full rounded-none bg-white">
                <SelectValue>
                  {(value) =>
                    value === 'all'
                      ? 'Tüm durumlar'
                      : purchaseStatusLabels[value as PurchaseStatus]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                <SelectItem value="all">Tüm durumlar</SelectItem>
                {Object.entries(purchaseStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 border border-[#d8e4de] bg-white">
            <Table>
              <TableHeader className="bg-[#f1f6f3]">
                <TableRow>
                  <TableHead className="px-4">Talep</TableHead>
                  <TableHead>Talep eden departman</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Gereken tarih</TableHead>
                  <TableHead>Maliyet</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow
                    key={purchase.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => setSelectedPurchaseId(purchase.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedPurchaseId(purchase.id);
                      }
                    }}
                  >
                    <TableCell className="px-4 py-4">
                      <p className="font-bold text-[#17382b]">
                        {purchase.title}
                      </p>
                      <p className="mt-1 text-xs text-[#718078]">
                        {purchase.vendor || purchase.requestedBy}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {departmentLabel(purchase.department)}
                    </TableCell>
                    <TableCell>
                      {purchase.quantity} {purchase.unit}
                    </TableCell>
                    <TableCell>{formatDate(purchase.neededAt)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatMoney(
                        purchase.actualCost || purchase.estimatedCost,
                        purchase.currency,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <PurchaseStatusBadge status={purchase.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filteredPurchases.length ? (
              <p className="p-10 text-center text-sm text-[#718078]">
                Bu filtrede satın alma talebi yok.
              </p>
            ) : null}
          </div>
        </>
      )}

      <ItemDetail
        item={selectedItem}
        snapshot={snapshot}
        saving={saving}
        onClose={() => setSelectedItemId(null)}
        onEdit={() =>
          selectedItem && setEditor({ kind: 'item', item: selectedItem })
        }
        onMovement={() =>
          selectedItem && setEditor({ kind: 'movement', item: selectedItem })
        }
        onMutate={mutate}
      />
      <PurchaseDetail
        purchase={selectedPurchase}
        snapshot={snapshot}
        onClose={() => setSelectedPurchaseId(null)}
        onEdit={() =>
          selectedPurchase &&
          setEditor({ kind: 'purchase', purchase: selectedPurchase })
        }
      />
      <ResourceEditorDialog
        editor={editor}
        snapshot={snapshot}
        saving={saving}
        onClose={() => setEditor(null)}
        onSubmit={submit}
      />
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#73827a]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-none bg-white pl-10"
      />
    </div>
  );
}
