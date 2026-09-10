'use client';

import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  History,
  Loader2,
  Mail,
  MessageSquarePlus,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Undo2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { panelDepartmentCatalogue } from '@/lib/panel-operations';
import type {
  PanelSponsorRecord,
  PanelSponsorSnapshot,
  PanelSponsorDepartment,
  SponsorActivityKind,
  SponsorPriority,
  SponsorStage,
} from '@/lib/panel-sponsors';

type SponsorEditor =
  | { kind: 'sponsor'; sponsor?: PanelSponsorRecord }
  | { kind: 'activity'; sponsor: PanelSponsorRecord }
  | { kind: 'obligation'; sponsor: PanelSponsorRecord };

const stageLabels: Record<SponsorStage, string> = {
  prospect: 'Araştırma',
  contacted: 'İlk temas',
  meeting: 'Görüşme',
  proposal: 'Teklif gönderildi',
  negotiation: 'Müzakere',
  won: 'Anlaşıldı',
  lost: 'Olumsuz',
};

const priorityLabels: Record<SponsorPriority, string> = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
};

const sponsorDepartmentOptions: Array<{
  id: PanelSponsorDepartment;
  name: string;
}> = [
  { id: 'team', name: 'Takım geneli' },
  ...panelDepartmentCatalogue.map(({ id, name }) => ({ id, name })),
];

function sponsorDepartmentLabel(department: PanelSponsorDepartment) {
  return (
    sponsorDepartmentOptions.find((option) => option.id === department)?.name ??
    'Takım geneli'
  );
}

const activityLabels: Record<SponsorActivityKind, string> = {
  note: 'Not',
  email: 'E-posta',
  call: 'Telefon',
  meeting: 'Toplantı',
  proposal: 'Teklif',
  status: 'Durum değişikliği',
};

const stageStyles: Record<SponsorStage, string> = {
  prospect: 'border-[#cbd8d2] bg-[#f4f7f5] text-[#53655c]',
  contacted: 'border-[#b8d4e5] bg-[#edf7fc] text-[#285c79]',
  meeting: 'border-[#d7c7ed] bg-[#f7f1ff] text-[#65458d]',
  proposal: 'border-[#f0d293] bg-[#fff8e8] text-[#7c5d16]',
  negotiation: 'border-[#f0ba93] bg-[#fff2e8] text-[#8b4f22]',
  won: 'border-[#9ad7b8] bg-[#eaf9f1] text-[#087347]',
  lost: 'border-[#e8bbb7] bg-[#fff0ee] text-[#9a342a]',
};

function formatDate(value: number | null, withTime = false) {
  if (!value) return 'Tarih girilmedi';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(value));
}

function formatDateInput(value: number | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
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
  const timestamp = Date.parse(`${year}-${month}-${day}T12:00:00+03:00`);
  const date = new Date(timestamp);
  if (
    !Number.isFinite(timestamp) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  )
    return null;
  return timestamp;
}

function formatMoney(value: number, currency: PanelSponsorRecord['currency']) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function fetchSponsorSnapshot() {
  const response = await fetch('/api/admin/panel/sponsors', {
    cache: 'no-store',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  const result = (await response.json()) as {
    ok?: boolean;
    error?: string;
    snapshot?: PanelSponsorSnapshot;
  };
  if (!response.ok || !result.ok || !result.snapshot)
    throw new Error(result.error || 'Sponsor kayıtları yüklenemedi.');
  return result.snapshot;
}

function useSponsors() {
  const [snapshot, setSnapshot] = useState<PanelSponsorSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setSnapshot(await fetchSponsorSnapshot());
      setError('');
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Sponsor kayıtları yüklenemedi.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchSponsorSnapshot()
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
              : 'Sponsor kayıtları yüklenemedi.',
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
        const response = await fetch('/api/admin/panel/sponsors', {
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

function StageBadge({ stage }: { stage: SponsorStage }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-none font-bold ${stageStyles[stage]}`}
    >
      {stageLabels[stage]}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Building2;
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
        <span className="grid size-9 place-items-center bg-[#e6f8ef] text-[#07864f]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-[#728078]">{note}</CardContent>
    </Card>
  );
}

function SponsorTable({
  sponsors,
  onSelect,
}: {
  sponsors: PanelSponsorRecord[];
  onSelect: (sponsor: PanelSponsorRecord) => void;
}) {
  if (!sponsors.length)
    return (
      <div className="border border-dashed border-[#cbd8d2] bg-white px-5 py-12 text-center">
        <Building2 className="mx-auto size-8 text-[#8b9a92]" />
        <p className="mt-3 font-semibold text-[#31473d]">Firma bulunamadı</p>
        <p className="mt-1 text-sm text-[#718078]">
          Filtreyi değiştirin veya yeni firma ekleyin.
        </p>
      </div>
    );

  return (
    <div className="border border-[#d8e4de] bg-white">
      <Table>
        <TableHeader className="bg-[#f1f6f3]">
          <TableRow>
            <TableHead className="px-4 text-[#405249]">Firma</TableHead>
            <TableHead className="text-[#405249]">İlgili departman</TableHead>
            <TableHead className="text-[#405249]">Aşama</TableHead>
            <TableHead className="text-[#405249]">İrtibat sorumlusu</TableHead>
            <TableHead className="text-[#405249]">Sonraki aksiyon</TableHead>
            <TableHead className="text-right text-[#405249]">Değer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors.map((sponsor) => (
            <TableRow
              key={sponsor.id}
              className="cursor-pointer"
              tabIndex={0}
              onClick={() => onSelect(sponsor)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(sponsor);
                }
              }}
            >
              <TableCell className="px-4 py-4">
                <p className="font-bold text-[#17382b]">
                  {sponsor.companyName}
                </p>
                <p className="mt-1 text-xs text-[#718078]">
                  {sponsor.sector || 'Sektör girilmedi'}
                  {sponsor.priority === 'high' ? ' · Yüksek öncelik' : ''}
                </p>
              </TableCell>
              <TableCell className="max-w-48 text-sm font-semibold text-[#52635b]">
                {sponsorDepartmentLabel(sponsor.department)}
              </TableCell>
              <TableCell>
                <StageBadge stage={sponsor.stage} />
              </TableCell>
              <TableCell className="text-sm text-[#52635b]">
                {sponsor.ownerEmail || 'Atanmadı'}
              </TableCell>
              <TableCell>
                <p className="max-w-64 truncate text-sm font-semibold text-[#31473d]">
                  {sponsor.nextAction || 'Aksiyon girilmedi'}
                </p>
                <p className="mt-1 text-xs text-[#718078]">
                  {formatDate(sponsor.nextActionAt)}
                </p>
              </TableCell>
              <TableCell className="text-right font-bold text-[#17382b]">
                {formatMoney(
                  sponsor.stage === 'won'
                    ? sponsor.confirmedValue
                    : sponsor.estimatedValue,
                  sponsor.currency,
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SponsorDetail({
  sponsor,
  snapshot,
  saving,
  onClose,
  onEdit,
  onAddActivity,
  onAddObligation,
  onMutate,
}: {
  sponsor: PanelSponsorRecord | null;
  snapshot: PanelSponsorSnapshot;
  saving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddActivity: () => void;
  onAddObligation: () => void;
  onMutate: (
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
  ) => Promise<boolean>;
}) {
  if (!sponsor) return null;
  const activities = snapshot.activities.filter(
    (activity) => activity.sponsorId === sponsor.id,
  );
  const obligations = snapshot.obligations.filter(
    (obligation) => obligation.sponsorId === sponsor.id,
  );

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="panel-light-theme w-full overflow-y-auto bg-white text-[#071a13] sm:max-w-xl">
        <SheetHeader className="border-b border-[#dce6e1] pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <StageBadge stage={sponsor.stage} />
            {sponsor.priority === 'high' ? (
              <Badge className="rounded-none bg-[#fff0ee] text-[#9a342a]">
                Yüksek öncelik
              </Badge>
            ) : null}
          </div>
          <SheetTitle className="mt-3 font-heading text-2xl font-extrabold">
            {sponsor.companyName}
          </SheetTitle>
          <SheetDescription>
            {sponsor.sector || 'Sektör bilgisi girilmedi'} ·{' '}
            {sponsorDepartmentLabel(sponsor.department)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#eef7f2] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#687970]">
                Tahmini değer
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#17382b]">
                {formatMoney(sponsor.estimatedValue, sponsor.currency)}
              </p>
            </div>
            <div className="bg-[#e4f9ee] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#587064]">
                Kesinleşen
              </p>
              <p className="mt-2 text-lg font-extrabold text-[#087347]">
                {formatMoney(sponsor.confirmedValue, sponsor.currency)}
              </p>
            </div>
          </div>

          <section>
            <h3 className="font-heading text-base font-extrabold">
              Sonraki aksiyon
            </h3>
            <div className="mt-3 border-l-4 border-[#00a85d] bg-[#f3f8f5] p-4">
              <p className="font-semibold text-[#273f34]">
                {sponsor.nextAction || 'Henüz aksiyon girilmedi.'}
              </p>
              <p className="mt-1 text-sm text-[#65756d]">
                {formatDate(sponsor.nextActionAt)}
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-heading text-base font-extrabold">İletişim</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-semibold text-[#31473d]">
                {sponsor.contactName || 'İletişim kişisi girilmedi'}
              </p>
              {sponsor.contactEmail ? (
                <a
                  className="flex items-center gap-2 text-[#087347]"
                  href={`mailto:${sponsor.contactEmail}`}
                >
                  <Mail className="size-4" /> {sponsor.contactEmail}
                </a>
              ) : null}
              {sponsor.contactPhone ? (
                <a
                  className="flex items-center gap-2 text-[#087347]"
                  href={`tel:${sponsor.contactPhone}`}
                >
                  <Phone className="size-4" /> {sponsor.contactPhone}
                </a>
              ) : null}
              {sponsor.website ? (
                <a
                  className="flex items-center gap-2 text-[#087347]"
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowUpRight className="size-4" /> Firma sitesi
                </a>
              ) : null}
              <p className="text-[#65756d]">
                Sponsor irtibat sorumlusu: {sponsor.ownerEmail || 'Atanmadı'}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-base font-extrabold">
                Yükümlülükler
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="rounded-none"
                onClick={onAddObligation}
              >
                <Plus /> Ekle
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {obligations.map((obligation) => (
                <div
                  key={obligation.id}
                  className="border border-[#dce6e1] p-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 size-2 shrink-0 ${obligation.status === 'completed' ? 'bg-[#00a85d]' : obligation.status === 'cancelled' ? 'bg-[#9aa79f]' : 'bg-[#e0a700]'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-semibold ${obligation.status === 'completed' ? 'text-[#728078] line-through' : 'text-[#273f34]'}`}
                      >
                        {obligation.title}
                      </p>
                      <p className="mt-1 text-xs text-[#718078]">
                        {formatDate(obligation.dueAt)} ·{' '}
                        {obligation.ownerEmail || 'Sorumlu yok'}
                      </p>
                    </div>
                    {obligation.status === 'open' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={saving}
                        onClick={() =>
                          void onMutate('PATCH', {
                            type: 'obligation',
                            id: obligation.id,
                            status: 'completed',
                          })
                        }
                      >
                        <CheckCircle2 /> Tamamla
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
              {!obligations.length ? (
                <p className="border border-dashed border-[#cbd8d2] p-5 text-center text-sm text-[#718078]">
                  Yükümlülük eklenmedi.
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-base font-extrabold">
                Görüşme geçmişi
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="rounded-none"
                onClick={onAddActivity}
              >
                <MessageSquarePlus /> Görüşme ekle
              </Button>
            </div>
            <ol className="mt-3 space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="grid grid-cols-[auto_1fr] gap-3"
                >
                  <span className="mt-1 grid size-7 place-items-center bg-[#e4f9ee] text-[#087347]">
                    <History className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#607169]">
                      {activityLabels[activity.kind]} ·{' '}
                      {formatDate(activity.occurredAt, true)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#405249]">
                      {activity.summary}
                    </p>
                    <p className="mt-1 text-xs text-[#829188]">
                      {activity.createdBy}
                    </p>
                  </div>
                </li>
              ))}
              {!activities.length ? (
                <li className="border border-dashed border-[#cbd8d2] p-5 text-center text-sm text-[#718078]">
                  Görüşme kaydı bulunmuyor.
                </li>
              ) : null}
            </ol>
          </section>

          {sponsor.notes ? (
            <section>
              <h3 className="font-heading text-base font-extrabold">Notlar</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#52635b]">
                {sponsor.notes}
              </p>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-[#dce6e1] pt-5">
            <Button
              className="rounded-none bg-[#00a85d] text-[#061c14]"
              onClick={onEdit}
            >
              <Pencil /> Düzenle
            </Button>
            <Button
              variant="outline"
              className="rounded-none"
              disabled={saving}
              onClick={() =>
                void onMutate('PATCH', {
                  type: 'archive',
                  id: sponsor.id,
                  archived: !sponsor.archived,
                }).then((ok) => ok && onClose())
              }
            >
              {sponsor.archived ? <Undo2 /> : <Archive />}
              {sponsor.archived ? 'Arşivden çıkar' : 'Arşivle'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SponsorEditorDialog({
  editor,
  saving,
  onClose,
  onSubmit,
}: {
  editor: SponsorEditor | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
  ) => Promise<void>;
}) {
  const [activityDefaultDate] = useState(() => formatDateInput(Date.now()));
  if (!editor) return null;
  const sponsor = editor.sponsor;
  const title =
    editor.kind === 'sponsor'
      ? sponsor
        ? 'Firma kaydını düzenle'
        : 'Yeni firma ekle'
      : editor.kind === 'activity'
        ? 'Görüşme kaydı ekle'
        : 'Yükümlülük ekle';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="panel-light-theme max-h-[calc(100vh-2rem)] overflow-y-auto rounded-none bg-white text-[#071a13] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-extrabold">
            {title}
          </DialogTitle>
          <DialogDescription>
            {sponsor?.companyName ?? 'Sponsor adayı'}
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
            if (editor.kind === 'sponsor') {
              const nextActionText = get('nextActionAt');
              void onSubmit(editor.sponsor ? 'PATCH' : 'POST', {
                type: 'sponsor',
                ...(editor.sponsor ? { id: editor.sponsor.id } : {}),
                companyName: get('companyName'),
                sector: get('sector'),
                department: get('department'),
                website: get('website'),
                stage: get('stage'),
                priority: get('priority'),
                packageName: get('packageName'),
                estimatedValue: Number(get('estimatedValue') || 0),
                confirmedValue: Number(get('confirmedValue') || 0),
                currency: get('currency'),
                contactName: get('contactName'),
                contactEmail: get('contactEmail'),
                contactPhone: get('contactPhone'),
                ownerEmail: get('ownerEmail'),
                source: get('source'),
                nextAction: get('nextAction'),
                nextActionAt: nextActionText
                  ? parseDateInput(nextActionText)
                  : null,
                notes: get('notes'),
              });
            } else if (editor.kind === 'activity') {
              const occurredText = get('occurredAt');
              void onSubmit('POST', {
                type: 'activity',
                sponsorId: editor.sponsor.id,
                kind: get('kind'),
                summary: get('summary'),
                occurredAt: occurredText
                  ? parseDateInput(occurredText)
                  : Date.now(),
              });
            } else {
              const dueText = get('dueAt');
              void onSubmit('POST', {
                type: 'obligation',
                sponsorId: editor.sponsor.id,
                title: get('title'),
                dueAt: dueText ? parseDateInput(dueText) : null,
                ownerEmail: get('ownerEmail'),
                note: get('note'),
              });
            }
          }}
        >
          {editor.kind === 'sponsor' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-company">Firma adı</Label>
                  <Input
                    id="sponsor-company"
                    name="companyName"
                    required
                    defaultValue={sponsor?.companyName}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-sector">Sektör</Label>
                  <Input
                    id="sponsor-sector"
                    name="sector"
                    defaultValue={sponsor?.sector}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>İlgili departman</Label>
                  <Select
                    name="department"
                    defaultValue={sponsor?.department ?? 'team'}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          sponsorDepartmentLabel(
                            typeof value === 'string'
                              ? (value as PanelSponsorDepartment)
                              : 'team',
                          )
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {sponsorDepartmentOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Aşama</Label>
                  <Select
                    name="stage"
                    defaultValue={sponsor?.stage ?? 'prospect'}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          stageLabels[value as SponsorStage] ??
                          stageLabels.prospect
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {Object.entries(stageLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Öncelik</Label>
                  <Select
                    name="priority"
                    defaultValue={sponsor?.priority ?? 'normal'}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          priorityLabels[value as SponsorPriority] ??
                          priorityLabels.normal
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Para birimi</Label>
                  <Select
                    name="currency"
                    defaultValue={sponsor?.currency ?? 'TRY'}
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-package">Paket / karşılık</Label>
                  <Input
                    id="sponsor-package"
                    name="packageName"
                    defaultValue={sponsor?.packageName}
                    placeholder="Altın paket, ürün desteği..."
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-estimated">Tahmini değer</Label>
                  <Input
                    id="sponsor-estimated"
                    name="estimatedValue"
                    type="number"
                    min={0}
                    defaultValue={sponsor?.estimatedValue ?? 0}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-confirmed">Kesinleşen değer</Label>
                  <Input
                    id="sponsor-confirmed"
                    name="confirmedValue"
                    type="number"
                    min={0}
                    defaultValue={sponsor?.confirmedValue ?? 0}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-contact">İletişim kişisi</Label>
                  <Input
                    id="sponsor-contact"
                    name="contactName"
                    defaultValue={sponsor?.contactName}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-email">E-posta</Label>
                  <Input
                    id="sponsor-email"
                    name="contactEmail"
                    type="email"
                    defaultValue={sponsor?.contactEmail}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-phone">Telefon</Label>
                  <Input
                    id="sponsor-phone"
                    name="contactPhone"
                    defaultValue={sponsor?.contactPhone}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-owner">
                    Sponsor irtibat sorumlusu
                  </Label>
                  <Input
                    id="sponsor-owner"
                    name="ownerEmail"
                    type="email"
                    defaultValue={sponsor?.ownerEmail}
                    placeholder="uye@sauformula.org"
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-source">Kaynak / bağlantı</Label>
                  <Input
                    id="sponsor-source"
                    name="source"
                    defaultValue={sponsor?.source}
                    placeholder="Referans, fuar, LinkedIn..."
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-next-action">Sonraki aksiyon</Label>
                  <Input
                    id="sponsor-next-action"
                    name="nextAction"
                    defaultValue={sponsor?.nextAction}
                    placeholder="Teklif dosyasını gönder"
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-next-date">Aksiyon tarihi</Label>
                  <Input
                    id="sponsor-next-date"
                    name="nextActionAt"
                    defaultValue={formatDateInput(
                      sponsor?.nextActionAt ?? null,
                    )}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-website">Firma sitesi</Label>
                  <Input
                    id="sponsor-website"
                    name="website"
                    type="url"
                    defaultValue={sponsor?.website}
                    placeholder="https://"
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-notes">Genel not</Label>
                  <Textarea
                    id="sponsor-notes"
                    name="notes"
                    defaultValue={sponsor?.notes}
                    className="min-h-24 rounded-none"
                  />
                </div>
              </div>
            </>
          ) : null}

          {editor.kind === 'activity' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Görüşme türü</Label>
                  <Select name="kind" defaultValue="meeting">
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          activityLabels[value as SponsorActivityKind] ??
                          activityLabels.note
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {Object.entries(activityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-activity-date">Tarih</Label>
                  <Input
                    id="sponsor-activity-date"
                    name="occurredAt"
                    defaultValue={activityDefaultDate}
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
              <div className="grid gap-2">
                <Label htmlFor="sponsor-activity-summary">
                  Görüşme sonucu ve sonraki adım
                </Label>
                <Textarea
                  id="sponsor-activity-summary"
                  name="summary"
                  required
                  className="min-h-40 rounded-none"
                />
              </div>
            </>
          ) : null}

          {editor.kind === 'obligation' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="sponsor-obligation-title">Yükümlülük</Label>
                <Input
                  id="sponsor-obligation-title"
                  name="title"
                  required
                  placeholder="Logo yerleşimi, sosyal medya paylaşımı..."
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-obligation-date">Teslim tarihi</Label>
                  <Input
                    id="sponsor-obligation-date"
                    name="dueAt"
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
                <div className="grid gap-2">
                  <Label htmlFor="sponsor-obligation-owner">Sorumlu</Label>
                  <Input
                    id="sponsor-obligation-owner"
                    name="ownerEmail"
                    type="email"
                    placeholder="uye@sauformula.org"
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sponsor-obligation-note">
                  Teslim koşulu / not
                </Label>
                <Textarea
                  id="sponsor-obligation-note"
                  name="note"
                  className="min-h-28 rounded-none"
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

export function SponsorWorkspace() {
  const { snapshot, loading, saving, error, load, mutate } = useSponsors();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<'all' | SponsorStage>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<SponsorEditor | null>(null);
  const [now] = useState(() => Date.now());

  const sponsors = useMemo(() => {
    if (!snapshot) return [];
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');
    return snapshot.sponsors.filter((sponsor) => {
      if (sponsor.archived !== showArchived) return false;
      if (stage !== 'all' && sponsor.stage !== stage) return false;
      if (!normalizedQuery) return true;
      return [
        sponsor.companyName,
        sponsor.sector,
        sponsorDepartmentLabel(sponsor.department),
        sponsor.contactName,
        sponsor.ownerEmail,
        sponsor.nextAction,
      ].some((value) =>
        value.toLocaleLowerCase('tr-TR').includes(normalizedQuery),
      );
    });
  }, [query, showArchived, snapshot, stage]);

  if (loading && !snapshot)
    return (
      <div className="grid min-h-80 place-items-center text-[#53655c]">
        <div className="text-center">
          <Loader2 className="mx-auto size-7 animate-spin text-[#00a85d]" />
          <p className="mt-3 text-sm font-semibold">
            Sponsor kayıtları yükleniyor
          </p>
        </div>
      </div>
    );

  if (!snapshot)
    return (
      <div className="mx-auto max-w-xl border border-[#efc7c3] bg-white p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-[#b42318]" />
        <h1 className="mt-4 font-heading text-2xl font-extrabold">
          Sponsor takibi açılamadı
        </h1>
        <p className="mt-2 text-sm text-[#6c7b74]">{error}</p>
        <Button className="mt-5 rounded-none" onClick={() => void load()}>
          <Loader2 /> Yeniden dene
        </Button>
      </div>
    );

  const activeSponsors = snapshot.sponsors.filter(
    (sponsor) => !sponsor.archived,
  );
  const activePipeline = activeSponsors.filter(
    (sponsor) => sponsor.stage !== 'won' && sponsor.stage !== 'lost',
  );
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
  const upcoming = activeSponsors.filter(
    (sponsor) =>
      sponsor.nextActionAt &&
      sponsor.nextActionAt >= now &&
      sponsor.nextActionAt <= weekEnd,
  );
  const openObligations = snapshot.obligations.filter(
    (obligation) => obligation.status === 'open',
  );
  const selectedSponsor = selectedId
    ? (snapshot.sponsors.find((sponsor) => sponsor.id === selectedId) ?? null)
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
            Sponsor ilişkileri
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Firma ve anlaşma takibi
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#5a6962]">
            İlk temastan anlaşmaya; görüşmeler, teklifler, aksiyonlar ve
            yükümlülükler.
          </p>
        </div>
        <Button
          className="rounded-none bg-[#00a85d] text-[#061c14]"
          onClick={() => setEditor({ kind: 'sponsor' })}
        >
          <Plus /> Yeni firma
        </Button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Aktif firma"
          value={activePipeline.length}
          note="Süreç devam ediyor"
          icon={Building2}
        />
        <SummaryCard
          label="Teklif / müzakere"
          value={
            activeSponsors.filter(
              (sponsor) =>
                sponsor.stage === 'proposal' || sponsor.stage === 'negotiation',
            ).length
          }
          note="Karar aşamasına yakın"
          icon={CircleDollarSign}
        />
        <SummaryCard
          label="7 günlük aksiyon"
          value={upcoming.length}
          note="Yaklaşan temaslar"
          icon={CalendarClock}
        />
        <SummaryCard
          label="Açık yükümlülük"
          value={openObligations.length}
          note="Teslim bekleyen karşılık"
          icon={ShieldCheck}
        />
      </div>

      <Tabs defaultValue="companies" className="mt-7">
        <TabsList
          variant="line"
          className="max-w-full overflow-x-auto overflow-y-hidden rounded-none border-b border-[#dbe6e0]"
        >
          <TabsTrigger value="companies" className="rounded-none px-4 py-2">
            Firma havuzu
          </TabsTrigger>
          <TabsTrigger value="actions" className="rounded-none px-4 py-2">
            Yaklaşan aksiyonlar
          </TabsTrigger>
          <TabsTrigger value="obligations" className="rounded-none px-4 py-2">
            Yükümlülükler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-5">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_14rem_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#73827a]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Firma, kişi veya irtibat sorumlusu ara"
                className="rounded-none bg-white pl-10"
              />
            </div>
            <Select
              value={stage}
              onValueChange={(value) => setStage(value as typeof stage)}
            >
              <SelectTrigger className="w-full rounded-none bg-white">
                <SelectValue>
                  {(value) =>
                    value === 'all'
                      ? 'Tüm aşamalar'
                      : stageLabels[value as SponsorStage]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                <SelectItem value="all">Tüm aşamalar</SelectItem>
                {Object.entries(stageLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
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
          <SponsorTable
            sponsors={sponsors}
            onSelect={(sponsor) => setSelectedId(sponsor.id)}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-5">
          <div className="grid gap-3 lg:grid-cols-2">
            {activeSponsors
              .filter((sponsor) => sponsor.nextActionAt || sponsor.nextAction)
              .sort(
                (left, right) =>
                  (left.nextActionAt ?? Number.MAX_SAFE_INTEGER) -
                  (right.nextActionAt ?? Number.MAX_SAFE_INTEGER),
              )
              .map((sponsor) => (
                <button
                  key={sponsor.id}
                  type="button"
                  onClick={() => setSelectedId(sponsor.id)}
                  className="border border-[#dce6e1] bg-white p-4 text-left hover:border-[#00a85d]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#17382b]">
                        {sponsor.companyName}
                      </p>
                      <p className="mt-1 text-sm text-[#52635b]">
                        {sponsor.nextAction || 'Aksiyon açıklaması girilmedi'}
                      </p>
                    </div>
                    <Clock3 className="size-4 shrink-0 text-[#00a85d]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StageBadge stage={sponsor.stage} />
                    <span className="text-sm font-semibold text-[#65756d]">
                      {formatDate(sponsor.nextActionAt)}
                    </span>
                  </div>
                </button>
              ))}
          </div>
          {!activeSponsors.some(
            (sponsor) => sponsor.nextActionAt || sponsor.nextAction,
          ) ? (
            <p className="border border-dashed border-[#cbd8d2] bg-white p-10 text-center text-sm text-[#718078]">
              Planlanmış aksiyon bulunmuyor.
            </p>
          ) : null}
        </TabsContent>

        <TabsContent value="obligations" className="mt-5">
          <div className="border border-[#d8e4de] bg-white">
            <Table>
              <TableHeader className="bg-[#f1f6f3]">
                <TableRow>
                  <TableHead className="px-4">Yükümlülük</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Sorumlu</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.obligations.map((obligation) => {
                  const sponsor = snapshot.sponsors.find(
                    (item) => item.id === obligation.sponsorId,
                  );
                  return (
                    <TableRow
                      key={obligation.id}
                      className="cursor-pointer"
                      onClick={() => sponsor && setSelectedId(sponsor.id)}
                    >
                      <TableCell className="px-4 py-4 font-semibold text-[#273f34]">
                        {obligation.title}
                      </TableCell>
                      <TableCell>
                        {sponsor?.companyName ?? 'Firma bulunamadı'}
                      </TableCell>
                      <TableCell>
                        {obligation.ownerEmail || 'Atanmadı'}
                      </TableCell>
                      <TableCell>{formatDate(obligation.dueAt)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="rounded-none">
                          {obligation.status === 'completed'
                            ? 'Tamamlandı'
                            : obligation.status === 'cancelled'
                              ? 'İptal'
                              : 'Açık'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {!snapshot.obligations.length ? (
              <p className="p-10 text-center text-sm text-[#718078]">
                Yükümlülük kaydı bulunmuyor.
              </p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      <SponsorDetail
        sponsor={selectedSponsor}
        snapshot={snapshot}
        saving={saving}
        onClose={() => setSelectedId(null)}
        onEdit={() =>
          selectedSponsor &&
          setEditor({ kind: 'sponsor', sponsor: selectedSponsor })
        }
        onAddActivity={() =>
          selectedSponsor &&
          setEditor({ kind: 'activity', sponsor: selectedSponsor })
        }
        onAddObligation={() =>
          selectedSponsor &&
          setEditor({ kind: 'obligation', sponsor: selectedSponsor })
        }
        onMutate={mutate}
      />
      <SponsorEditorDialog
        editor={editor}
        saving={saving}
        onClose={() => setEditor(null)}
        onSubmit={submit}
      />
    </div>
  );
}
