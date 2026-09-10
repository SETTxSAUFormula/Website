'use client';

import Image from 'next/image';
import {
  Boxes,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileUser,
  Gauge,
  Home,
  Loader2,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Trophy,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { OperationsWorkspace } from '@/components/panel/operations-workspace';
import { MemberWorkspace } from '@/components/panel/member-workspace';
import { ResourceWorkspace } from '@/components/panel/resource-workspace';
import { SponsorWorkspace } from '@/components/panel/sponsor-workspace';
import Link from '@/components/site-link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { getUpcomingIstanbulCalendarRange } from '@/lib/calendar-range';
import {
  formulaStudentCompetitions2027,
  type FormulaStudentCompetition,
} from '@/lib/formula-student-competitions';
import type { TeamCalendarEvent } from '@/lib/google-calendar';
import type { PanelPermission } from '@/lib/panel-authorization';

type PanelView =
  | 'home'
  | 'departments'
  | 'tasks'
  | 'calendar'
  | 'sponsors'
  | 'inventory'
  | 'purchases'
  | 'applications'
  | 'members';

type MenuEntry = {
  key: PanelView;
  label: string;
  icon: typeof Home;
  permission?: PanelPermission;
  href?: string;
};

const menuGroups: Array<{ label: string; items: MenuEntry[] }> = [
  {
    label: 'Genel',
    items: [
      { key: 'home', label: 'Ana sayfa', icon: Home },
      {
        key: 'calendar',
        label: 'Takvim',
        icon: CalendarDays,
        permission: 'calendar.read',
      },
    ],
  },
  {
    label: 'Takım çalışması',
    items: [
      {
        key: 'departments',
        label: 'Departmanlar',
        icon: Building2,
        permission: 'departments.read',
      },
      {
        key: 'tasks',
        label: 'Görevler',
        icon: ClipboardCheck,
        permission: 'tasks.read',
      },
    ],
  },
  {
    label: 'Operasyon',
    items: [
      {
        key: 'sponsors',
        label: 'Sponsorlar',
        icon: Gauge,
        permission: 'sponsorship.manage',
      },
      {
        key: 'inventory',
        label: 'Envanter',
        icon: Boxes,
        permission: 'inventory.manage',
      },
      {
        key: 'purchases',
        label: 'Satın alma',
        icon: ReceiptText,
        permission: 'purchases.manage',
      },
      {
        key: 'applications',
        label: 'Başvurular',
        icon: FileUser,
        permission: 'applications.manage',
        href: 'https://sauformula.org/admin/basvurular',
      },
    ],
  },
  {
    label: 'Yönetim',
    items: [
      {
        key: 'members',
        label: 'Üyeler ve yetkiler',
        icon: Users,
        permission: 'members.read',
      },
    ],
  },
];

const teamCalendarEmbedUrl =
  'https://calendar.google.com/calendar/embed?hl=tr&wkst=2&ctz=Europe%2FIstanbul&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&src=c_d90b1f75a976b1aaee38ca1e4aa138bb4870f42fcf4be61fa3e83da011814e1e%40group.calendar.google.com&color=%2300a85d&src=tr.turkish%23holiday%40group.v.calendar.google.com&color=%23d9574f';

const moduleDetails: Record<
  Exclude<PanelView, 'home'>,
  { title: string; description: string; points: string[] }
> = {
  departments: {
    title: 'Departmanlar',
    description:
      'Departman hedefleri, sorumlular ve dönem planı için ayrılmış çalışma alanı.',
    points: [
      'Departman sorumluları',
      'Dönem hedefleri',
      'Departmanlar arası bağımlılıklar',
    ],
  },
  tasks: {
    title: 'Görevler',
    description:
      'Takımın günlük işlerini, teslim tarihlerini ve blokajlarını yönetecek alan.',
    points: [
      'Sorumlu ve yardımcılar',
      'Öncelik ve teslim tarihi',
      'Alt görevler ve kontrol adımları',
    ],
  },
  calendar: {
    title: 'Takvim',
    description:
      'Yarışma, üretim, test, toplantı ve sponsor tarihlerinin ortak görünümü.',
    points: [
      'Takım takvimi',
      'Departman takvimleri',
      'Yaklaşan son tarih uyarıları',
    ],
  },
  sponsors: {
    title: 'Sponsorluk takibi',
    description:
      'Firma görüşmelerini ve sponsorluk yükümlülüklerini takip edecek çalışma alanı.',
    points: [
      'Görüşme aşamaları',
      'Son ve sonraki temas',
      'Sponsor teslimatları ve yenileme',
    ],
  },
  inventory: {
    title: 'Envanter',
    description:
      'Parça, ekipman, stok hareketi ve zimmet işlemleri için hazırlanan alan.',
    points: [
      'Stok ve konum',
      'Giriş-çıkış geçmişi',
      'Zimmet, bakım ve kalibrasyon',
    ],
  },
  purchases: {
    title: 'Satın alma',
    description:
      'Departman taleplerini onaydan teslimata kadar izlemek için ayrılan alan.',
    points: [
      'Talep ve gerekçe',
      'Teklif ve onay akışı',
      'Teslim ve envanter bağlantısı',
    ],
  },
  applications: {
    title: 'Başvurular',
    description:
      'Bu alan yalnızca yer tutucudur. Aktif başvuru sistemi bağımsız çalışmaya devam ediyor.',
    points: [
      'Mevcut veritabanına dokunulmadı',
      'Mevcut API ve yönetim ekranı değiştirilmedi',
      'Geçiş yalnızca açık onay sonrasında yapılacak',
    ],
  },
  members: {
    title: 'Üyeler ve yetkiler',
    description:
      'Şef ve üstü üye süreçlerini yönetir; rol, departman ve yetki değişiklikleri yalnız takım lideri ve sistem yöneticisine açıktır.',
    points: [
      'Aktif ve pasif üyeler',
      'Takım lideri ve admin onaylı rol ataması',
      'Merkezi modül yetkileri',
    ],
  },
};

function EmptyModule({ view }: { view: Exclude<PanelView, 'home'> }) {
  const detail = moduleDetails[view];
  const isApplications = view === 'applications';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-[#dff8eb] text-[#087244]">Panel taslağı</Badge>
        {isApplications ? (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-800"
          >
            Aktif sistemden ayrı
          </Badge>
        ) : null}
      </div>
      <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-[#071a13] sm:text-5xl">
        {detail.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-[#51615a] sm:text-lg">
        {detail.description}
      </p>

      <Card className="mt-8 border border-[#dbe6e0] bg-white text-[#071a13] shadow-sm ring-0">
        <CardHeader className="border-b border-[#e4ece8] pb-5">
          <CardTitle className="text-xl font-bold">Planlanan kapsam</CardTitle>
          <CardDescription className="text-[#64736c]">
            Bu ekranda henüz canlı kayıt oluşturulmaz veya değiştirilmez.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-1 sm:grid-cols-3">
          {detail.points.map((point, index) => (
            <div
              key={point}
              className="border border-[#dfe8e3] bg-[#f7faf8] p-5"
            >
              <span className="font-heading text-sm font-extrabold text-[#0b8751]">
                0{index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#23352d]">
                {point}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {isApplications ? (
        <div className="mt-6 flex gap-4 border-l-4 border-amber-400 bg-amber-50 p-5 text-amber-950">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">Başvuru alımı kesintisiz devam ediyor</p>
            <p className="mt-1 text-sm leading-6 text-amber-900/80">
              Mevcut başvuru sayfası, yönetim ekranı, API rotaları ve D1
              veritabanı bu panel çalışmasından tamamen ayrı tutuluyor.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatEventDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'UTC',
      dateStyle: 'long',
    }).format(new Date(`${value}T12:00:00Z`));
  }
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function UpcomingCalendarCard({
  title,
  emptyText,
  events,
  icon: Icon,
  canManage,
  onEdit,
  actionLabel,
  onAdd,
}: {
  title: string;
  emptyText: string;
  events: TeamCalendarEvent[];
  icon: typeof CalendarDays;
  canManage: boolean;
  onEdit: (event: TeamCalendarEvent) => void;
  actionLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <Card className="border border-[#dbe6e0] bg-white text-[#071a13] shadow-sm ring-0">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-[#e4ece8] py-4">
        <div className="grid size-9 shrink-0 place-items-center bg-[#e8f8f0] text-[#087347]">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <CardTitle className="min-w-0 flex-1 font-heading text-lg font-extrabold">
          {title}
        </CardTitle>
        {canManage && actionLabel && onAdd ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-none border-[#b7c8c0] bg-white text-[#17382b]"
            onClick={onAdd}
          >
            <Plus aria-hidden="true" />
            {actionLabel}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {events.length === 0 ? (
          <p className="px-5 py-8 text-sm leading-6 text-[#6b7b73]">
            {emptyText}
          </p>
        ) : (
          <ol className="divide-y divide-[#e6ece9]">
            {events.slice(0, 5).map((event) => (
              <li key={event.id} className="flex items-start gap-3 px-5 py-4">
                <span
                  className={`mt-1 size-2 shrink-0 ${event.source === 'holiday' ? 'bg-[#d9574f]' : 'bg-[#00a85d]'}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <time
                    dateTime={event.start}
                    className="text-xs font-bold text-[#687870]"
                  >
                    {formatEventDate(event.start)}
                  </time>
                  <p className="mt-1 font-semibold text-[#17382b]">
                    {event.title}
                  </p>
                  {event.location ? (
                    <p className="mt-1 truncate text-xs text-[#72827a]">
                      {event.location}
                    </p>
                  ) : null}
                </div>
                {canManage && event.source === 'team' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-none text-[#396052] hover:bg-[#eef6f2]"
                    onClick={() => onEdit(event)}
                    aria-label={`${event.title} etkinliğini düzenle`}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function CompetitionResearchCard({
  canManage,
  onAdd,
}: {
  canManage: boolean;
  onAdd: (competition: FormulaStudentCompetition) => void;
}) {
  const groups = [
    {
      title: 'Dünya sıralamasına dahil yarışmalar',
      note: 'FSG dünya yarışmaları dizininde WRL işareti bulunan organizasyonlar.',
      worldRanking: true,
    },
    {
      title: 'Dünya sıralaması dışındaki yarışmalar',
      note: 'Aktif organizasyonlar; FSG dizininde WRL işareti bulunmuyor.',
      worldRanking: false,
    },
  ];

  return (
    <Card className="mt-5 border border-[#dbe6e0] bg-white text-[#071a13] shadow-sm ring-0">
      <CardHeader className="border-b border-[#e4ece8]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-xl font-extrabold">
              2027 Avrupa ve Türkiye yarışma araştırması
            </CardTitle>
            <CardDescription className="mt-2 max-w-3xl leading-6 text-[#617169]">
              Organizatör sayfaları ve FSG aktif yarışmalar dizini 9 Eylül 2026
              tarihinde kontrol edildi. Açıklanmayan tarihler önceki yıldan
              tahmin edilmedi. Formula Student için tek bir merkezî “resmîlik”
              etiketi olmadığından ayrım, FSG dünya sıralaması (WRL) işaretine
              göre yapıldı.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="rounded-none border-[#b9cbc2] bg-[#f5faf7] text-[#315446]"
          >
            {formulaStudentCompetitions2027.length} yarışma
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-5 lg:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.title}
            aria-labelledby={`competition-${group.worldRanking ? 'wrl' : 'other'}`}
          >
            <h3
              id={`competition-${group.worldRanking ? 'wrl' : 'other'}`}
              className="font-heading text-base font-extrabold text-[#17382b]"
            >
              {group.title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#6a7a72]">
              {group.note}
            </p>
            <ol className="mt-3 divide-y divide-[#e6ece9] border-y border-[#e6ece9]">
              {formulaStudentCompetitions2027
                .filter(
                  (competition) =>
                    competition.worldRanking === group.worldRanking,
                )
                .map((competition) => (
                  <li
                    key={competition.name}
                    className="grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#17382b]">
                          {competition.name}
                        </p>
                        {competition.dateConfirmed ? (
                          <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
                            Tarih doğrulandı
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-[#65756d]">
                        {competition.country} · {competition.venue}
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${competition.dateConfirmed ? 'text-[#087347]' : 'text-[#7a6750]'}`}
                      >
                        {competition.dateLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={competition.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex size-8 items-center justify-center text-[#08794a] hover:bg-[#eef6f2]"
                        aria-label={`${competition.name} organizatör sayfasını aç`}
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                      {canManage ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-none text-[#315446] hover:bg-[#eef6f2]"
                          onClick={() => onAdd(competition)}
                        >
                          <Plus aria-hidden="true" />
                          Takvime ekle
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function getFormString(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' ? value : '';
}

type VisibleMonth = { year: number; month: number };

const weekdayLabels = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];
const istanbulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function getIstanbulDateKey(value: Date | string) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;
  const date = typeof value === 'string' ? new Date(value) : value;
  const parts = Object.fromEntries(
    istanbulDateFormatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getInitialVisibleMonth(): VisibleMonth {
  const [year, month] = getIstanbulDateKey(new Date()).split('-').map(Number);
  return { year, month: month - 1 };
}

function getMonthGrid({ year, month }: VisibleMonth) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const leadingDays = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const gridLength = leadingDays + daysInMonth <= 35 ? 35 : 42;
  return Array.from({ length: gridLength }, (_, index) => {
    const date = new Date(Date.UTC(year, month, 1 - leadingDays + index));
    const dateYear = date.getUTCFullYear();
    const dateMonth = date.getUTCMonth();
    const day = date.getUTCDate();
    const key = `${dateYear}-${String(dateMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { date, key, day, inCurrentMonth: dateMonth === month };
  });
}

function shiftVisibleMonth(
  current: VisibleMonth,
  amount: number,
): VisibleMonth {
  const date = new Date(Date.UTC(current.year, current.month + amount, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function getCalendarRange(days: ReturnType<typeof getMonthGrid>) {
  const dayAfterGrid = new Date(days.at(-1)?.date ?? new Date());
  dayAfterGrid.setUTCDate(dayAfterGrid.getUTCDate() + 1);
  const endKey = `${dayAfterGrid.getUTCFullYear()}-${String(dayAfterGrid.getUTCMonth() + 1).padStart(2, '0')}-${String(dayAfterGrid.getUTCDate()).padStart(2, '0')}`;
  return {
    start: `${days[0].key}T00:00:00+03:00`,
    end: `${endKey}T00:00:00+03:00`,
  };
}

function formatMonthLabel({ year, month }: VisibleMonth) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month, 1)));
}

function formatEventTime(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Tüm gün';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatTurkishDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join('/');
}

function parseTurkishDateTime(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue.trim());
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(
    timeValue.trim(),
  );
  if (!dateMatch || !timeMatch) return null;

  const [, day, month, year] = dateMatch;
  const candidate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  if (
    candidate.getUTCFullYear() !== Number(year) ||
    candidate.getUTCMonth() !== Number(month) - 1 ||
    candidate.getUTCDate() !== Number(day)
  )
    return null;

  return `${year}-${month}-${day}T${timeMatch[1]}:${timeMatch[2]}:00+03:00`;
}

function getDateFormValue(value: string) {
  const [year, month, day] = getIstanbulDateKey(value).split('-');
  return `${day}/${month}/${year}`;
}

function getTimeFormValue(value: string, fallback: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(value))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return `${parts.hour}:${parts.minute}`;
}

function getMonthKey({ year, month }: VisibleMonth) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function CalendarModule({
  canManage,
  configured,
  initialEvents,
  initialLoaded,
  initialUpcomingEvents,
}: {
  canManage: boolean;
  configured: boolean;
  initialEvents: TeamCalendarEvent[];
  initialLoaded: boolean;
  initialUpcomingEvents: TeamCalendarEvent[];
}) {
  const [events, setEvents] = useState<TeamCalendarEvent[]>(initialEvents);
  const [loading, setLoading] = useState(configured && !initialLoaded);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeamCalendarEvent | null>(
    null,
  );
  const [createPreset, setCreatePreset] = useState<{
    category: 'event' | 'competition';
    title: string;
    location: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  }>({ category: 'event', title: '', location: '' });
  const [formVersion, setFormVersion] = useState(0);
  const [deletingEvent, setDeletingEvent] = useState<TeamCalendarEvent | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [embedVersion, setEmbedVersion] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<TeamCalendarEvent[]>(
    initialUpcomingEvents,
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(
    getInitialVisibleMonth,
  );
  const [loadedMonthKey, setLoadedMonthKey] = useState(
    initialLoaded ? getMonthKey(getInitialVisibleMonth()) : '',
  );
  const calendarDays = getMonthGrid(visibleMonth);
  const todayKey = getIstanbulDateKey(new Date());
  const eventsByDay = events.reduce<Record<string, TeamCalendarEvent[]>>(
    (groups, event) => {
      const key = getIstanbulDateKey(event.start);
      (groups[key] ??= []).push(event);
      return groups;
    },
    {},
  );

  const loadEvents = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError('');
    try {
      const range = getCalendarRange(getMonthGrid(visibleMonth));
      const query = new URLSearchParams(range);
      const response = await fetch(`/api/admin/panel/calendar?${query}`, {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        events?: TeamCalendarEvent[];
        error?: string;
      };
      if (!response.ok || !payload.ok)
        throw new Error(payload.error || 'Takvim yüklenemedi.');
      setEvents(payload.events ?? []);
      setLoadedMonthKey(getMonthKey(visibleMonth));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Takvim yüklenemedi.',
      );
    } finally {
      setLoading(false);
    }
  }, [configured, visibleMonth]);

  const loadUpcomingEvents = useCallback(async () => {
    if (!configured) return;
    const query = new URLSearchParams(getUpcomingIstanbulCalendarRange());
    const response = await fetch(`/api/admin/panel/calendar?${query}`, {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      events?: TeamCalendarEvent[];
      error?: string;
    };
    if (!response.ok || !payload.ok)
      throw new Error(payload.error || 'Yaklaşan etkinlikler yüklenemedi.');
    setUpcomingEvents(
      (payload.events ?? []).filter((event) => event.source === 'team'),
    );
  }, [configured]);

  async function refreshCalendarData() {
    await Promise.all([
      loadEvents(),
      loadUpcomingEvents().catch((upcomingError) => {
        setError(
          upcomingError instanceof Error
            ? upcomingError.message
            : 'Yaklaşan etkinlikler yüklenemedi.',
        );
      }),
    ]);
    setEmbedVersion((version) => version + 1);
  }

  useEffect(() => {
    if (loadedMonthKey === getMonthKey(visibleMonth)) return;
    const timeoutId = window.setTimeout(() => void loadEvents(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadEvents, loadedMonthKey, visibleMonth]);

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingEvent(null);
      setFormError('');
    }
  }

  function openCreateDialog(
    category: 'event' | 'competition' = 'event',
    preset?: {
      title?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    setEditingEvent(null);
    setCreatePreset({
      category,
      title: preset?.title ?? '',
      location: preset?.location ?? '',
      startDate: preset?.startDate,
      endDate: preset?.endDate,
      startTime: preset?.startTime,
      endTime: preset?.endTime,
    });
    setFormVersion((version) => version + 1);
    setFormError('');
    setDialogOpen(true);
  }

  function openEditDialog(event: TeamCalendarEvent) {
    if (event.source !== 'team') return;
    setEditingEvent(event);
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave(event: {
    preventDefault(): void;
    currentTarget: HTMLFormElement;
  }) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const form = new FormData(event.currentTarget);
    const title = getFormString(form, 'title').trim();
    const startDate = getFormString(form, 'startDate');
    const startTime = getFormString(form, 'startTime');
    const endDate = getFormString(form, 'endDate');
    const endTime = getFormString(form, 'endTime');
    const category =
      getFormString(form, 'category') === 'competition'
        ? 'competition'
        : 'event';
    const start = parseTurkishDateTime(startDate, startTime);
    const end = parseTurkishDateTime(endDate, endTime);

    if (!title) {
      setFormError('Etkinlik adını girin.');
      setSaving(false);
      return;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      setFormError('Başlangıç ve bitiş tarihiyle saatini eksiksiz girin.');
      setSaving(false);
      return;
    }
    if (!start || !end) {
      setFormError('Tarihleri GG/AA/YYYY, saatleri SS:DD biçiminde girin.');
      setSaving(false);
      return;
    }
    if (Date.parse(end) <= Date.parse(start)) {
      setFormError('Bitiş zamanı başlangıçtan sonra olmalıdır.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/panel/calendar', {
        method: editingEvent ? 'PATCH' : 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          id: editingEvent?.id,
          title,
          description: getFormString(form, 'description'),
          location: getFormString(form, 'location'),
          start,
          end,
          category,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        event?: TeamCalendarEvent;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.event) {
        throw new Error(
          payload.error ||
            (editingEvent
              ? 'Etkinlik güncellenemedi.'
              : 'Etkinlik eklenemedi.'),
        );
      }
      handleDialogOpenChange(false);
      await refreshCalendarData();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : editingEvent
            ? 'Etkinlik güncellenemedi.'
            : 'Etkinlik eklenemedi.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingEvent || deletingEvent.source !== 'team') return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch('/api/admin/panel/calendar', {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ id: deletingEvent.id }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.ok)
        throw new Error(payload.error || 'Etkinlik kaldırılamadı.');
      setDeletingEvent(null);
      await refreshCalendarData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Etkinlik kaldırılamadı.',
      );
    } finally {
      setDeleting(false);
    }
  }

  const defaultDateKey =
    getMonthKey(visibleMonth) === todayKey.slice(0, 7)
      ? todayKey
      : `${visibleMonth.year}-${String(visibleMonth.month + 1).padStart(2, '0')}-01`;
  const formDefaults = editingEvent
    ? {
        title: editingEvent.title,
        startDate: getDateFormValue(editingEvent.start),
        startTime: getTimeFormValue(editingEvent.start, '09:00'),
        endDate: getDateFormValue(editingEvent.end),
        endTime: getTimeFormValue(editingEvent.end, '10:00'),
        location: editingEvent.location,
        description: editingEvent.description,
        category:
          editingEvent.category === 'competition' ? 'competition' : 'event',
      }
    : {
        title: createPreset.title,
        startDate:
          createPreset.startDate === undefined
            ? getDateFormValue(defaultDateKey)
            : createPreset.startDate,
        startTime: createPreset.startTime ?? '09:00',
        endDate:
          createPreset.endDate === undefined
            ? getDateFormValue(defaultDateKey)
            : createPreset.endDate,
        endTime: createPreset.endTime ?? '10:00',
        location: createPreset.location,
        description: '',
        category: createPreset.category,
      };
  const upcomingTeamEvents = upcomingEvents.filter(
    (event) => event.source === 'team' && event.category !== 'competition',
  );
  const upcomingCompetitions = upcomingEvents.filter(
    (event) => event.category === 'competition',
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#071a13] sm:text-4xl">
            Takvim
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5a6962]">
            Toplantı, üretim, test ve teslim tarihleri Google Takvim üzerinden
            bütün yetkili üyelerde güncel kalır.
          </p>
        </div>

        {canManage && configured ? (
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <Button
              type="button"
              onClick={() => openCreateDialog()}
              className="h-11 rounded-none bg-[#00a85d] px-5 font-bold text-[#061c14] hover:bg-[#12bd70]"
            >
              <Plus aria-hidden="true" />
              Etkinlik ekle
            </Button>
            <DialogContent className="panel-light-theme max-h-[calc(100vh-2rem)] overflow-y-auto rounded-none bg-white p-6 text-[#071a13] ring-[#b9cbc2] dark:bg-white dark:text-[#071a13] sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold text-[#071a13]">
                  {editingEvent ? 'Etkinliği düzenle' : 'Yeni etkinlik'}
                </DialogTitle>
                <DialogDescription className="text-base leading-6 text-[#5a6962] dark:text-[#5a6962]">
                  {editingEvent
                    ? 'Değişiklikler SAUFormula takım takvimine kaydedilir.'
                    : 'Etkinlik doğrudan SAUFormula takım takvimine kaydedilir.'}{' '}
                  Saatler Europe/Istanbul olarak işlenir.
                </DialogDescription>
              </DialogHeader>
              <form
                className="mt-2 grid gap-5"
                noValidate
                key={editingEvent?.id ?? `new-event-${formVersion}`}
                onSubmit={handleSave}
              >
                <div className="grid gap-2">
                  <Label htmlFor="calendar-title">Etkinlik adı</Label>
                  <Input
                    id="calendar-title"
                    name="title"
                    required
                    maxLength={160}
                    defaultValue={formDefaults.title}
                    className="h-11 border-[#cbd8d2] bg-white text-[#071a13] dark:bg-white dark:text-[#071a13]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="calendar-category">Etkinlik türü</Label>
                  <Select name="category" defaultValue={formDefaults.category}>
                    <SelectTrigger
                      id="calendar-category"
                      className="h-11 w-full rounded-none border-[#cbd8d2] bg-white text-[#071a13] dark:bg-white dark:text-[#071a13]"
                    >
                      <SelectValue>
                        {(value) =>
                          value === 'competition'
                            ? 'Yarışma'
                            : 'Takım etkinliği'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#071a13]">
                      <SelectItem value="event">Takım etkinliği</SelectItem>
                      <SelectItem value="competition">Yarışma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="calendar-start-date">Başlangıç</Label>
                    <div className="grid grid-cols-[1fr_7rem] gap-2">
                      <Input
                        id="calendar-start-date"
                        name="startDate"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="GG/AA/YYYY"
                        maxLength={10}
                        defaultValue={formDefaults.startDate}
                        onInput={(inputEvent) => {
                          inputEvent.currentTarget.value =
                            formatTurkishDateInput(
                              inputEvent.currentTarget.value,
                            );
                        }}
                        className="h-11 border-[#cbd8d2] bg-white text-[#071a13] placeholder:text-[#7a8b83] dark:bg-white dark:text-[#071a13]"
                      />
                      <Input
                        name="startTime"
                        type="time"
                        step={60}
                        defaultValue={formDefaults.startTime}
                        aria-label="Başlangıç saati"
                        className="h-11 border-[#cbd8d2] bg-white text-[#071a13] dark:bg-white dark:text-[#071a13] dark:[color-scheme:light]"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="calendar-end-date">Bitiş</Label>
                    <div className="grid grid-cols-[1fr_7rem] gap-2">
                      <Input
                        id="calendar-end-date"
                        name="endDate"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="GG/AA/YYYY"
                        maxLength={10}
                        defaultValue={formDefaults.endDate}
                        onInput={(inputEvent) => {
                          inputEvent.currentTarget.value =
                            formatTurkishDateInput(
                              inputEvent.currentTarget.value,
                            );
                        }}
                        className="h-11 border-[#cbd8d2] bg-white text-[#071a13] placeholder:text-[#7a8b83] dark:bg-white dark:text-[#071a13]"
                      />
                      <Input
                        name="endTime"
                        type="time"
                        step={60}
                        defaultValue={formDefaults.endTime}
                        aria-label="Bitiş saati"
                        className="h-11 border-[#cbd8d2] bg-white text-[#071a13] dark:bg-white dark:text-[#071a13] dark:[color-scheme:light]"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="calendar-location">Konum</Label>
                  <Input
                    id="calendar-location"
                    name="location"
                    maxLength={300}
                    defaultValue={formDefaults.location}
                    className="h-11 border-[#cbd8d2] bg-white text-[#071a13] dark:bg-white dark:text-[#071a13]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="calendar-description">Açıklama</Label>
                  <Textarea
                    id="calendar-description"
                    name="description"
                    maxLength={4000}
                    defaultValue={formDefaults.description}
                    className="min-h-24 border-[#cbd8d2] bg-white text-[#071a13] dark:bg-white dark:text-[#071a13]"
                  />
                </div>
                {formError ? (
                  <p
                    role="alert"
                    className="border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-800"
                  >
                    {formError}
                  </p>
                ) : null}
                <DialogFooter className="mx-0 mb-0 rounded-none bg-transparent px-0 pb-0">
                  {editingEvent ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-none border-red-300 bg-white text-red-700 hover:bg-red-50 hover:text-red-800 sm:mr-auto"
                      onClick={() => {
                        const eventToDelete = editingEvent;
                        handleDialogOpenChange(false);
                        setDeletingEvent(eventToDelete);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                      Kaldır
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-none border-[#b7c8c0] bg-white text-[#17382b] hover:bg-[#eef6f2] dark:bg-white dark:text-[#17382b]"
                    onClick={() => handleDialogOpenChange(false)}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-10 rounded-none bg-[#00a85d] font-bold text-[#061c14] hover:bg-[#12bd70]"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : editingEvent ? (
                      <Pencil aria-hidden="true" />
                    ) : (
                      <Plus aria-hidden="true" />
                    )}
                    {saving
                      ? 'Kaydediliyor'
                      : editingEvent
                        ? 'Değişiklikleri kaydet'
                        : 'Takvime ekle'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <AlertDialog
        open={Boolean(deletingEvent)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingEvent(null);
        }}
      >
        <AlertDialogContent className="panel-light-theme rounded-none bg-white text-[#071a13] ring-[#b9cbc2] dark:bg-white dark:text-[#071a13]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-lg font-extrabold">
              Etkinlik kaldırılsın mı?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#5a6962] dark:text-[#5a6962]">
              “{deletingEvent?.title}” Google Takvim’den ve bütün üyelerin
              takvim görünümünden kaldırılacak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-none bg-[#f7faf8]">
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-none border-[#b7c8c0] bg-white text-[#17382b]"
            >
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="rounded-none bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 aria-hidden="true" />
              )}
              {deleting ? 'Kaldırılıyor' : 'Etkinliği kaldır'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!configured ? (
        <Card className="mt-8 border border-amber-300 bg-amber-50 text-amber-950 shadow-sm ring-0">
          <CardHeader className="grid grid-cols-[auto_1fr] items-start gap-4">
            <div className="grid size-11 place-items-center bg-amber-200/70">
              <CalendarClock className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Google Takvim bağlantısı hazır bekliyor
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-6 text-amber-900/75">
                Takvim ve Google OAuth bilgileri Cloudflare’a şifreli
                değişkenler olarak eklendiğinde bu ekran otomatik açılacak.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              'Takvim herkese görünür',
              'Düzenleme şef ve üstü',
              'Google hesabı herkese açılmaz',
            ].map((item) => (
              <div
                key={item}
                className="border border-amber-300/70 bg-white/55 p-4 text-sm font-semibold"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mt-6 overflow-hidden border border-[#dbe6e0] bg-white text-[#071a13] shadow-sm ring-0">
            <CardContent className="p-0">
              <iframe
                key={embedVersion}
                src={teamCalendarEmbedUrl}
                title="SAUFormula takım takvimi"
                className="h-[640px] w-full border-0 sm:h-[680px]"
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </CardContent>
          </Card>
          <Card
            hidden
            aria-hidden="true"
            className="mt-6 border border-[#dbe6e0] bg-white text-[#071a13] shadow-sm ring-0"
          >
            <CardHeader className="flex flex-col gap-4 border-b border-[#e4ece8] py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-heading text-2xl font-extrabold capitalize">
                  {formatMonthLabel(visibleMonth)}
                </CardTitle>
                <CardDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[#64736c]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 bg-[#00a85d]" aria-hidden="true" />
                    Takım etkinlikleri
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 bg-[#d9574f]" aria-hidden="true" />
                    Türkiye tatilleri
                  </span>
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-none border-[#b7c8c0] bg-white px-4 font-bold text-[#17382b] hover:bg-[#eef6f2] dark:bg-white dark:text-[#17382b]"
                  onClick={() => setVisibleMonth(getInitialVisibleMonth())}
                >
                  Bugün
                </Button>
                <div className="flex border border-[#d7e1dc]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-none border-r border-[#d7e1dc] bg-white text-[#17382b] hover:bg-[#eef6f2] dark:bg-white dark:text-[#17382b]"
                    onClick={() =>
                      setVisibleMonth((current) =>
                        shiftVisibleMonth(current, -1),
                      )
                    }
                    aria-label="Önceki ay"
                  >
                    <ChevronLeft aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-none bg-white text-[#17382b] hover:bg-[#eef6f2] dark:bg-white dark:text-[#17382b]"
                    onClick={() =>
                      setVisibleMonth((current) =>
                        shiftVisibleMonth(current, 1),
                      )
                    }
                    aria-label="Sonraki ay"
                  >
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="rounded-none border-[#b7c8c0] bg-white text-[#17382b] hover:bg-[#eef6f2] dark:bg-white dark:text-[#17382b]"
                  onClick={() => void refreshCalendarData()}
                  disabled={loading}
                  aria-label="Takvimi yenile"
                >
                  <RefreshCw
                    className={loading ? 'animate-spin' : ''}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {error ? (
                <div
                  className="m-5 flex gap-3 border-l-4 border-red-500 bg-red-50 p-4 text-red-900"
                  role="alert"
                >
                  <TriangleAlert
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold">Takvim şu anda yüklenemedi</p>
                    <p className="mt-1 text-sm leading-6">{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <div className="grid grid-cols-7 border-b border-[#dfe7e3] bg-[#f4f8f6]">
                      {weekdayLabels.map((day) => (
                        <div
                          key={day}
                          className="border-r border-[#dfe7e3] px-2 py-2 text-center text-xs font-bold text-[#52645b] last:border-r-0 lg:text-sm"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <section
                      className="grid grid-cols-7"
                      aria-label={`${formatMonthLabel(visibleMonth)} takım takvimi`}
                    >
                      {calendarDays.map((day) => {
                        const dayEvents = eventsByDay[day.key] ?? [];
                        const isToday = day.key === todayKey;
                        return (
                          <div
                            key={day.key}
                            aria-label={`${day.day} ${formatMonthLabel({ year: day.date.getUTCFullYear(), month: day.date.getUTCMonth() })}`}
                            className={`min-h-20 border-r border-b border-[#e4ebe7] p-1.5 last:border-r-0 lg:min-h-24 ${
                              day.inCurrentMonth
                                ? 'bg-white'
                                : 'bg-[#f7f9f8] text-[#94a099]'
                            }`}
                          >
                            <time
                              dateTime={day.key}
                              className={`inline-grid size-6 place-items-center text-xs font-bold ${
                                isToday
                                  ? 'bg-[#00a85d] text-[#061c14]'
                                  : day.inCurrentMonth
                                    ? 'text-[#24382f]'
                                    : 'text-[#98a39d]'
                              }`}
                            >
                              {day.day}
                            </time>
                            <div className="mt-1 space-y-1">
                              {dayEvents.slice(0, 3).map((event) => {
                                const isHoliday = event.source === 'holiday';
                                const content = (
                                  <>
                                    <span
                                      className={`shrink-0 font-bold ${isHoliday ? 'text-[#a23832]' : 'text-[#087347]'}`}
                                    >
                                      {formatEventTime(event.start)}
                                    </span>
                                    <span
                                      className={`truncate font-semibold ${isHoliday ? 'text-[#792823]' : 'text-[#17382b]'}`}
                                    >
                                      {event.title}
                                    </span>
                                  </>
                                );
                                return canManage && !isHoliday ? (
                                  <button
                                    key={event.id}
                                    type="button"
                                    onClick={() => openEditDialog(event)}
                                    className="flex w-full min-w-0 items-center gap-1 border-l-2 border-[#00a85d] bg-[#e8f8f0] px-1.5 py-1 text-left text-[11px] hover:bg-[#d8f3e6]"
                                    title={`${event.title} etkinliğini düzenle`}
                                  >
                                    {content}
                                    <Pencil
                                      className="ml-auto size-3 shrink-0 text-[#087347]"
                                      aria-hidden="true"
                                    />
                                  </button>
                                ) : event.htmlLink ? (
                                  <a
                                    key={event.id}
                                    href={event.htmlLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex min-w-0 items-center gap-1 border-l-2 px-1.5 py-1 text-[11px] ${
                                      isHoliday
                                        ? 'border-[#d9574f] bg-[#fff0ee] hover:bg-[#ffe5e2]'
                                        : 'border-[#00a85d] bg-[#e8f8f0] hover:bg-[#d8f3e6]'
                                    }`}
                                    title={event.title}
                                  >
                                    {content}
                                  </a>
                                ) : (
                                  <div
                                    key={event.id}
                                    className={`flex min-w-0 items-center gap-1 border-l-2 px-1.5 py-1 text-[11px] ${
                                      isHoliday
                                        ? 'border-[#d9574f] bg-[#fff0ee]'
                                        : 'border-[#00a85d] bg-[#e8f8f0]'
                                    }`}
                                  >
                                    {content}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 3 ? (
                                <p className="px-2 text-xs font-bold text-[#607168]">
                                  +{dayEvents.length - 3} etkinlik
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </section>
                  </div>

                  <div className="md:hidden">
                    {events.length === 0 ? (
                      <div className="grid min-h-52 place-items-center px-6 text-center">
                        <div>
                          <CalendarDays
                            className="mx-auto size-8 text-[#8ca098]"
                            aria-hidden="true"
                          />
                          <p className="mt-3 font-bold">Bu ay etkinlik yok</p>
                          <p className="mt-1 text-sm text-[#718078]">
                            Yeni bir tarih eklendiğinde burada görünecek.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ol className="divide-y divide-[#e6ece9] px-4">
                        {events.map((event) => (
                          <li key={event.id} className="py-5">
                            <div
                              className={`flex items-start gap-3 text-sm font-semibold ${event.source === 'holiday' ? 'text-[#9b3b35]' : 'text-[#436054]'}`}
                            >
                              <Clock3
                                className={`mt-0.5 size-4 shrink-0 ${event.source === 'holiday' ? 'text-[#d9574f]' : 'text-[#00a85d]'}`}
                                aria-hidden="true"
                              />
                              <time dateTime={event.start}>
                                {formatEventDate(event.start)}
                              </time>
                            </div>
                            <p className="mt-2 font-heading text-lg font-extrabold text-[#10281e]">
                              {event.title}
                            </p>
                            {event.source === 'holiday' ? (
                              <Badge className="mt-2 bg-[#fff0ee] text-[#9b3b35]">
                                Türkiye tatili
                              </Badge>
                            ) : null}
                            <div className="mt-2 flex flex-wrap items-center gap-4">
                              {event.location ? (
                                <p className="flex items-center gap-2 text-sm text-[#65756d]">
                                  <MapPin
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                  {event.location}
                                </p>
                              ) : null}
                              {event.htmlLink ? (
                                <a
                                  href={event.htmlLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-bold text-[#08794a] hover:underline"
                                >
                                  Google Takvim
                                  <ExternalLink
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                </a>
                              ) : null}
                              {canManage && event.source === 'team' ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-none border-[#b7c8c0] bg-white text-[#17382b]"
                                  onClick={() => openEditDialog(event)}
                                >
                                  <Pencil aria-hidden="true" />
                                  Düzenle
                                </Button>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <UpcomingCalendarCard
              title="Yaklaşan etkinlikler"
              emptyText="Önümüzdeki 365 gün içinde takım tarafından eklenmiş etkinlik bulunmuyor. Türkiye tatilleri bu listede gösterilmez."
              events={upcomingTeamEvents}
              icon={CalendarClock}
              canManage={canManage && configured}
              onEdit={openEditDialog}
            />
            <UpcomingCalendarCard
              title="Yaklaşan yarışmalar"
              emptyText="Henüz yaklaşan yarışma kaydı yok. Aşağıdaki araştırma listesinden veya Yarışma ekle düğmesinden oluşturabilirsin."
              events={upcomingCompetitions}
              icon={Trophy}
              canManage={canManage && configured}
              onEdit={openEditDialog}
              actionLabel="Yarışma ekle"
              onAdd={() => openCreateDialog('competition')}
            />
          </div>
          <CompetitionResearchCard
            canManage={canManage && configured}
            onAdd={(competition) =>
              openCreateDialog('competition', {
                title: competition.name,
                location: `${competition.venue}, ${competition.country}`,
                startDate: competition.startDate
                  ? getDateFormValue(competition.startDate)
                  : '',
                endDate: competition.endDate
                  ? getDateFormValue(competition.endDate)
                  : '',
                startTime: competition.dateConfirmed ? '09:00' : undefined,
                endTime: competition.dateConfirmed ? '18:00' : undefined,
              })
            }
          />
        </>
      )}
    </div>
  );
}

export function MemberPanelShell({
  viewerEmail,
  viewerRole,
  permissions,
  calendarConfigured,
  initialCalendarEvents,
  initialCalendarLoaded,
  initialUpcomingEvents,
}: {
  viewerEmail: string;
  viewerRole: string;
  permissions: PanelPermission[];
  calendarConfigured: boolean;
  initialCalendarEvents: TeamCalendarEvent[];
  initialCalendarLoaded: boolean;
  initialUpcomingEvents: TeamCalendarEvent[];
}) {
  const [activeView, setActiveView] = useState<PanelView>('home');
  const permissionSet = new Set(permissions);
  const visibleMenuGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || permissionSet.has(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <SidebarProvider className="panel-light-theme bg-[#eef3f0]">
      <Sidebar collapsible="icon" className="border-[#18382d]">
        <SidebarHeader className="border-b border-white/10 p-4">
          <div className="flex min-h-12 items-center gap-3 overflow-hidden">
            <Image
              src="/brand/sauformula-logo-light.png"
              alt="SAUFormula"
              width={2400}
              height={1510}
              priority
              className="h-11 w-14 shrink-0 object-contain object-left"
            />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="font-heading text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Üye Paneli
              </p>
              <p className="mt-1 text-xs text-white/45">Takım operasyonları</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-3">
          {visibleMenuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        data-panel-view={item.key}
                        render={
                          item.href ? (
                            <a href={item.href} aria-label={item.label} />
                          ) : undefined
                        }
                        isActive={!item.href && activeView === item.key}
                        tooltip={item.label}
                        onClick={
                          item.href ? undefined : () => setActiveView(item.key)
                        }
                        className="h-10 rounded-none px-3 font-semibold text-white/70 hover:bg-white/8 hover:text-white data-active:bg-racing-green data-active:text-ink"
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator className="bg-white/10" />
        <SidebarFooter className="p-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="grid size-9 shrink-0 place-items-center bg-white/10 text-sm font-extrabold text-racing-green">
                {viewerEmail.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs font-semibold text-white">
                  {viewerRole}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/45">
                  {viewerEmail}
                </p>
              </div>
            </div>
            <Link
              href="/cdn-cgi/access/logout"
              className="flex h-9 items-center gap-2 border border-white/15 px-3 text-xs font-bold text-white/65 transition-colors hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              aria-label="Üye panelinden çıkış yap"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              <span className="group-data-[collapsible=icon]:hidden">
                Çıkış yap
              </span>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#eef3f0] text-[#071a13]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#d9e4de] bg-[#f8fbf9]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-[#173e30] hover:bg-[#e3ede8]" />
            <div className="h-5 w-px bg-[#d0ddd6]" aria-hidden="true" />
            <p className="text-sm font-bold text-[#2c4439]">
              {activeView === 'home'
                ? 'Ana sayfa'
                : moduleDetails[activeView].title}
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-[0.12em] text-[#0a7d4b] transition-colors hover:text-[#064c2f]"
          >
            Siteye dön
          </Link>
        </header>

        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {activeView === 'home' ? (
            <OperationsWorkspace mode="home" />
          ) : activeView === 'departments' ? (
            <OperationsWorkspace mode="departments" />
          ) : activeView === 'tasks' ? (
            <OperationsWorkspace mode="tasks" />
          ) : activeView === 'sponsors' ? (
            <SponsorWorkspace />
          ) : activeView === 'inventory' ? (
            <ResourceWorkspace key="inventory" mode="inventory" />
          ) : activeView === 'purchases' ? (
            <ResourceWorkspace key="purchases" mode="purchases" />
          ) : activeView === 'members' ? (
            <MemberWorkspace />
          ) : activeView === 'calendar' ? (
            <CalendarModule
              canManage={permissionSet.has('calendar.manage')}
              configured={calendarConfigured}
              initialEvents={initialCalendarEvents}
              initialLoaded={initialCalendarLoaded}
              initialUpcomingEvents={initialUpcomingEvents}
            />
          ) : (
            <EmptyModule view={activeView} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
