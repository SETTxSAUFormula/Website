'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type {
  PanelAnnouncementLevel,
  PanelDepartmentRecord,
  PanelMemberRecord,
  PanelOperationsSnapshot,
  PanelTaskRecord,
  PanelTaskStatus,
} from '@/lib/panel-operations';

type WorkspaceMode = 'home' | 'departments' | 'tasks';
type EditorState =
  | { kind: 'department'; department: PanelDepartmentRecord }
  | { kind: 'task'; department: PanelDepartmentRecord; task?: PanelTaskRecord }
  | { kind: 'announcement'; department: PanelDepartmentRecord }
  | { kind: 'request'; department: PanelDepartmentRecord }
  | { kind: 'decision'; department: PanelDepartmentRecord }
  | { kind: 'template'; department: PanelDepartmentRecord }
  | {
      kind: 'member';
      department: PanelDepartmentRecord;
      member?: PanelMemberRecord;
    };

const statusLabels: Record<PanelTaskStatus, string> = {
  todo: 'Bekliyor',
  in_progress: 'Devam ediyor',
  blocked: 'Engellendi',
  review: 'Şef onayı',
  done: 'Tamamlandı',
};

const priorityLabels = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
  critical: 'Kritik',
};

const taskFilterLabels = {
  mine: 'Bana atananlar',
  active: 'Aktif görevler',
  todo: 'Bekleyen',
  in_progress: 'Devam eden',
  blocked: 'Engellenen',
  review: 'Onay bekleyen',
  done: 'Tamamlanan',
};

const announcementLevelLabels = {
  normal: 'Normal — yalnız panel',
  important: 'Önemli — panel + e-posta',
  urgent: 'Acil — sabit + e-posta',
};

const memberRoleLabels = {
  member: 'Üye',
  chief: 'Departman şefi',
  advisor: 'Danışman',
  team_lead: 'Takım lideri',
  admin: 'Sistem yöneticisi',
};

function formatDate(value: number | null, withTime = false) {
  if (!value) return 'Tarih yok';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(value));
}

function formatDateInput(value: number | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function parseDateInput(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const timestamp = Date.parse(`${year}-${month}-${day}T18:00:00+03:00`);
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

function formatDateTyping(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join('/');
}

function initials(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function taskCompletion(task: PanelTaskRecord) {
  if (!task.checklist.length) return task.progress;
  return Math.round(
    (task.checklist.filter((item) => item.done).length /
      task.checklist.length) *
      100,
  );
}

function departmentHealth(
  department: PanelDepartmentRecord,
  tasks: PanelTaskRecord[],
) {
  const relevant = tasks.filter((task) => task.department === department.id);
  const active = relevant.filter((task) => task.status !== 'done');
  const done = relevant.filter((task) => task.status === 'done').length;
  const blocked = active.filter((task) => task.status === 'blocked').length;
  const overdue = active.filter(
    (task) => task.dueAt !== null && task.dueAt < Date.now(),
  ).length;
  const completion = relevant.length
    ? Math.round((done / relevant.length) * 100)
    : 0;
  return { active: active.length, blocked, overdue, completion };
}

function levelStyles(level: PanelAnnouncementLevel) {
  if (level === 'urgent')
    return {
      badge: 'bg-[#b42318] text-white',
      border: 'border-l-[#b42318]',
      label: 'Acil',
    };
  if (level === 'important')
    return {
      badge: 'bg-[#fff0c2] text-[#795500]',
      border: 'border-l-[#e0a700]',
      label: 'Önemli',
    };
  return {
    badge: 'bg-[#dff8eb] text-[#087244]',
    border: 'border-l-[#00a85d]',
    label: 'Normal',
  };
}

function useOperations() {
  const [snapshot, setSnapshot] = useState<PanelOperationsSnapshot | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/panel/operations', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        snapshot?: PanelOperationsSnapshot;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.snapshot)
        throw new Error(payload.error || 'Departman verileri yüklenemedi.');
      setSnapshot(payload.snapshot);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Departman verileri yüklenemedi.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const mutate = useCallback(
    async (
      method: 'POST' | 'PATCH' | 'DELETE',
      body: Record<string, unknown>,
    ) => {
      setSaving(true);
      setError('');
      try {
        const response = await fetch(
          body.type === 'member'
            ? '/api/admin/panel/members'
            : '/api/admin/panel/operations',
          {
            method,
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(body),
          },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!response.ok || !payload.ok)
          throw new Error(payload.error || 'İşlem tamamlanamadı.');
        await load();
        return true;
      } catch (mutationError) {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : 'İşlem tamamlanamadı.',
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

function LoadingState() {
  return (
    <div className="grid min-h-80 place-items-center border border-[#dbe6e0] bg-white">
      <div className="text-center text-[#617169]">
        <Loader2 className="mx-auto size-6 animate-spin text-[#00a85d]" />
        <p className="mt-3 text-sm font-semibold">
          Departman verileri yükleniyor
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border border-[#efc7c3] bg-white text-[#071a13] shadow-sm ring-0">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="grid size-10 place-items-center bg-[#fff0ee] text-[#b42318]">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Departman alanı açılamadı</p>
          <p className="mt-1 text-sm leading-6 text-[#6b5753]">{message}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          onClick={onRetry}
        >
          <RefreshCw aria-hidden="true" />
          Yeniden dene
        </Button>
      </CardContent>
    </Card>
  );
}

function AnnouncementList({ snapshot }: { snapshot: PanelOperationsSnapshot }) {
  if (!snapshot.announcements.length)
    return (
      <p className="border border-dashed border-[#cedbd5] px-4 py-7 text-center text-sm text-[#718078]">
        Aktif duyuru bulunmuyor.
      </p>
    );
  return (
    <div className="space-y-3">
      {snapshot.announcements.slice(0, 6).map((announcement) => {
        const style = levelStyles(announcement.level);
        const department = snapshot.departments.find(
          (item) => item.id === announcement.department,
        );
        return (
          <article
            key={announcement.id}
            className={`border border-[#dbe6e0] border-l-4 bg-white p-4 ${style.border}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`rounded-none ${style.badge}`}>
                {style.label}
              </Badge>
              <span className="text-xs font-semibold text-[#6a7a72]">
                {department?.name ?? 'Tüm takım'} ·{' '}
                {formatDate(announcement.createdAt, true)}
              </span>
            </div>
            <h3 className="mt-3 font-heading text-base font-extrabold text-[#17382b]">
              {announcement.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#53655c]">
              {announcement.body}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function HomeWorkspace({
  snapshot,
  onOpen,
}: {
  snapshot: PanelOperationsSnapshot;
  onOpen: (editor: EditorState) => void;
}) {
  const [now] = useState(() => Date.now());
  const viewerEmail = snapshot.viewer.email;
  const activeTasks = snapshot.tasks.filter((task) => task.status !== 'done');
  const myTasks = activeTasks.filter((task) =>
    task.assigneeEmails.includes(viewerEmail),
  );
  const visibleTasks = myTasks.length
    ? myTasks
    : activeTasks.filter(
        (task) => task.priority === 'critical' || task.status === 'blocked',
      );
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
  const announcementDepartment =
    snapshot.departments.find(
      (department) => department.id === snapshot.viewer.department,
    ) ?? snapshot.departments[0];
  const stats = [
    {
      label: 'Açık görev',
      value: activeTasks.length,
      note: myTasks.length
        ? `${myTasks.length} görev sana atanmış`
        : 'Görünen departmanlarda',
      icon: ClipboardCheck,
    },
    {
      label: '7 gün içindeki işler',
      value: activeTasks.filter(
        (task) => task.dueAt && task.dueAt <= weekEnd && task.dueAt >= now,
      ).length,
      note: 'Yaklaşan deadline',
      icon: CalendarClock,
    },
    {
      label: 'Engellenen',
      value: activeTasks.filter((task) => task.status === 'blocked').length,
      note: 'Müdahale bekleyen görev',
      icon: AlertTriangle,
    },
    {
      label: 'Şef onayı',
      value: activeTasks.filter((task) => task.status === 'review').length,
      note: 'Kontrol bekleyen iş',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
            2027 sezon merkezi
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-[#071a13] sm:text-4xl">
            Bugün neye odaklanıyoruz?
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#5a6962]">
            Görevlerin, kritik tarihler ve departmanlardan gelen güncel durum
            tek görünümde.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {snapshot.viewer.canViewAllDepartments && announcementDepartment ? (
            <Button
              type="button"
              className="rounded-none bg-[#00a85d] text-[#061c14] hover:bg-[#12bd70]"
              onClick={() =>
                onOpen({
                  kind: 'announcement',
                  department: announcementDepartment,
                })
              }
            >
              <Megaphone aria-hidden="true" /> Hızlı duyuru
            </Button>
          ) : null}
          <div className="flex items-center gap-3 border border-[#cfe0d8] bg-white px-4 py-3 text-sm text-[#315446] shadow-sm">
            <Sparkles className="size-4 text-[#00a85d]" aria-hidden="true" />
            <span className="font-semibold">
              {snapshot.viewer.canViewAllDepartments
                ? `${snapshot.departments.length} departman görünür`
                : `${snapshot.departments[0]?.name ?? 'Departman ataması bekleniyor'}`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <Card
            key={label}
            className="border border-[#dce6e1] bg-white text-[#071a13] shadow-sm ring-0"
          >
            <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-4 pb-2">
              <div>
                <CardDescription className="font-semibold text-[#617169]">
                  {label}
                </CardDescription>
                <CardTitle className="mt-2 text-3xl font-extrabold">
                  {value}
                </CardTitle>
              </div>
              <div className="grid size-9 place-items-center bg-[#e6f8ef] text-[#07864f]">
                <Icon className="size-4" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-[#728078]">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border border-[#dce6e1] bg-white text-[#071a13] shadow-sm ring-0">
          <CardHeader className="border-b border-[#e5ece8]">
            <CardTitle className="font-heading text-xl font-extrabold">
              {myTasks.length
                ? 'Benim görevlerim'
                : 'Takımın dikkat bekleyen işleri'}
            </CardTitle>
            <CardDescription className="text-[#64736c]">
              Deadline ve engel durumuna göre sıralandı.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {visibleTasks.length ? (
              <ol className="divide-y divide-[#e7eeea]">
                {visibleTasks.slice(0, 7).map((task) => {
                  const department = snapshot.departments.find(
                    (item) => item.id === task.department,
                  );
                  return (
                    <li
                      key={task.id}
                      className="flex items-start gap-4 px-5 py-4"
                    >
                      <span
                        className={`mt-1 size-2 shrink-0 ${task.status === 'blocked' ? 'bg-[#b42318]' : task.priority === 'critical' ? 'bg-[#e0a700]' : 'bg-[#00a85d]'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#17382b]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-[#6d7d75]">
                          {department?.name} · {statusLabels[task.status]} ·{' '}
                          {formatDate(task.dueAt)}
                        </p>
                        <Progress
                          value={taskCompletion(task)}
                          className="mt-3 [&_[data-slot=progress-indicator]]:bg-[#00a85d]"
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-[#4d655a]">
                        %{taskCompletion(task)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-[#718078]">
                Aktif görev bulunmuyor.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#dce6e1] bg-white text-[#071a13] shadow-sm ring-0">
          <CardHeader className="border-b border-[#e5ece8]">
            <CardTitle className="font-heading text-xl font-extrabold">
              Hızlı duyurular
            </CardTitle>
            <CardDescription className="text-[#64736c]">
              Önemli ve acil duyurular e-postayla da iletilebilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <AnnouncementList snapshot={snapshot} />
          </CardContent>
        </Card>
      </div>

      {snapshot.viewer.canViewAllDepartments ? (
        <div className="mt-6">
          <h2 className="font-heading text-xl font-extrabold text-[#17382b]">
            Departman durumu
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.departments.map((department) => {
              const health = departmentHealth(department, snapshot.tasks);
              return (
                <Card
                  key={department.id}
                  className="border border-[#dce6e1] bg-white text-[#071a13] shadow-sm ring-0"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="font-heading text-lg font-extrabold">
                        {department.name}
                      </CardTitle>
                      <span className="text-sm font-extrabold text-[#087347]">
                        %{health.completion}
                      </span>
                    </div>
                    <Progress
                      value={health.completion}
                      className="[&_[data-slot=progress-indicator]]:bg-[#00a85d]"
                    />
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#f4f8f6] px-2 py-3">
                      <p className="text-lg font-extrabold">{health.active}</p>
                      <p className="text-xs text-[#6c7b74]">Açık</p>
                    </div>
                    <div className="bg-[#fff8e8] px-2 py-3">
                      <p className="text-lg font-extrabold text-[#8a6300]">
                        {health.overdue}
                      </p>
                      <p className="text-xs text-[#796947]">Geciken</p>
                    </div>
                    <div className="bg-[#fff0ee] px-2 py-3">
                      <p className="text-lg font-extrabold text-[#b42318]">
                        {health.blocked}
                      </p>
                      <p className="text-xs text-[#80514c]">Engel</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TaskCard({
  task,
  snapshot,
  canManage,
  onEdit,
  onPatch,
}: {
  task: PanelTaskRecord;
  snapshot: PanelOperationsSnapshot;
  canManage: boolean;
  onEdit: () => void;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const canUpdate =
    canManage || task.assigneeEmails.includes(snapshot.viewer.email);
  const completion = taskCompletion(task);
  return (
    <article className="border border-[#dbe6e0] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`rounded-none ${task.priority === 'critical' ? 'border-[#efb7b1] bg-[#fff0ee] text-[#b42318]' : task.priority === 'high' ? 'border-[#ecd48a] bg-[#fff8e8] text-[#7b5900]' : 'border-[#cfdcd6] bg-[#f5f8f6] text-[#4f6259]'}`}
            >
              {priorityLabels[task.priority]}
            </Badge>
            <Badge
              className={`rounded-none ${task.status === 'blocked' ? 'bg-[#b42318] text-white' : task.status === 'done' ? 'bg-[#dff8eb] text-[#087244]' : 'bg-[#e9f0ed] text-[#3d554a]'}`}
            >
              {statusLabels[task.status]}
            </Badge>
            {task.requiresApproval ? (
              <span className="text-xs font-semibold text-[#6b7a73]">
                Şef onaylı
              </span>
            ) : null}
          </div>
          <h4 className="mt-3 font-heading text-base font-extrabold text-[#17382b]">
            {task.title}
          </h4>
          {task.description ? (
            <p className="mt-2 text-sm leading-6 text-[#5b6b63]">
              {task.description}
            </p>
          ) : null}
        </div>
        {canUpdate ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-none"
            onClick={onEdit}
            aria-label={`${task.title} görevini düzenle`}
          >
            <Pencil aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#65756d]">
        <span>{formatDate(task.dueAt)}</span>
        <span>
          {task.assigneeEmails.length
            ? task.assigneeEmails.join(', ')
            : 'Sorumlu atanmamış'}
        </span>
        {task.calendarUrl ? (
          <a
            href={task.calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#087347] hover:underline"
          >
            Takvim <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Progress
          value={completion}
          className="flex-1 [&_[data-slot=progress-indicator]]:bg-[#00a85d]"
        />
        <span className="text-xs font-bold tabular-nums text-[#486056]">
          %{completion}
        </span>
      </div>

      {task.checklist.length ? (
        <div className="mt-4 space-y-2 border-t border-[#e7eeea] pt-4">
          {task.checklist.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 text-sm text-[#405249]"
            >
              <Checkbox
                checked={item.done}
                disabled={!canUpdate}
                onCheckedChange={(checked) => {
                  const checklist = task.checklist.map((current) =>
                    current.id === item.id
                      ? { ...current, done: checked === true }
                      : current,
                  );
                  const progress = Math.round(
                    (checklist.filter((current) => current.done).length /
                      checklist.length) *
                      100,
                  );
                  onPatch({ checklist, progress });
                }}
              />
              <span className={item.done ? 'text-[#7c8982] line-through' : ''}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      ) : null}

      {task.blockerNote ? (
        <div className="mt-4 border-l-4 border-[#b42318] bg-[#fff4f2] px-4 py-3 text-sm text-[#7c3129]">
          <strong>Engel:</strong> {task.blockerNote}
        </div>
      ) : null}
      {task.dependencyNote ? (
        <p className="mt-3 text-sm text-[#5f6f67]">
          <strong>Bağımlılık:</strong> {task.dependencyNote}
        </p>
      ) : null}

      {canUpdate && task.status !== 'done' ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e7eeea] pt-4">
          {task.status === 'todo' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => onPatch({ status: 'in_progress' })}
            >
              Başla
            </Button>
          ) : null}
          {task.status !== 'blocked' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-none border-[#efc7c3] text-[#9d2d23]"
              onClick={() => onPatch({ status: 'blocked' })}
            >
              Engellendi
            </Button>
          ) : null}
          {task.status === 'review' && canManage ? (
            <Button
              type="button"
              size="sm"
              className="rounded-none bg-[#00a85d] text-[#061c14]"
              onClick={() => onPatch({ approve: true })}
            >
              <ShieldCheck aria-hidden="true" /> Onayla
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="rounded-none bg-[#00a85d] text-[#061c14]"
              onClick={() => onPatch({ status: 'done', progress: 100 })}
            >
              <CheckCircle2 aria-hidden="true" /> Tamamla
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}

function DepartmentContent({
  department,
  snapshot,
  canManage,
  onOpen,
  onMutate,
}: {
  department: PanelDepartmentRecord;
  snapshot: PanelOperationsSnapshot;
  canManage: boolean;
  onOpen: (editor: EditorState) => void;
  onMutate: (
    method: 'POST' | 'PATCH' | 'DELETE',
    body: Record<string, unknown>,
  ) => Promise<boolean>;
}) {
  const tasks = snapshot.tasks.filter(
    (task) => task.department === department.id,
  );
  const requests = snapshot.requests.filter(
    (request) =>
      request.fromDepartment === department.id ||
      request.toDepartment === department.id,
  );
  const decisions = snapshot.decisions.filter(
    (decision) => decision.department === department.id,
  );
  const templates = snapshot.templates.filter(
    (template) => !template.department || template.department === department.id,
  );
  const activity = snapshot.activity.filter(
    (item) => item.department === department.id,
  );
  const members = snapshot.members.filter(
    (member) => member.department === department.id,
  );
  const announcements = snapshot.announcements.filter(
    (announcement) => announcement.department === department.id,
  );
  return (
    <div className="border-x border-b border-[#d6e2dc] bg-[#f8fbf9] p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm leading-6 text-[#5d6d65]">
            {department.description}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-[#dce6e1] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6d7d75]">
                Sezon hedefi
              </p>
              <p className="mt-2 text-sm leading-6 text-[#284238]">
                {department.seasonGoal || 'Henüz hedef girilmedi.'}
              </p>
            </div>
            <div className="border border-[#dce6e1] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6d7d75]">
                Haftalık durum
              </p>
              <p className="mt-2 text-sm leading-6 text-[#284238]">
                {department.weeklyNote || 'Bu hafta için durum notu girilmedi.'}
              </p>
            </div>
          </div>
        </div>
        {canManage ? (
          <div className="flex flex-wrap content-start gap-2 lg:max-w-64 lg:justify-end">
            <Button
              type="button"
              size="sm"
              className="rounded-none bg-[#00a85d] text-[#061c14]"
              onClick={() => onOpen({ kind: 'task', department })}
            >
              <Plus aria-hidden="true" /> Görev
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpen({ kind: 'announcement', department })}
            >
              <Megaphone aria-hidden="true" /> Duyuru
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpen({ kind: 'department', department })}
            >
              <Pencil aria-hidden="true" /> Özeti düzenle
            </Button>
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="tasks" className="mt-5">
        <TabsList
          variant="line"
          className="max-w-full overflow-x-auto overflow-y-hidden rounded-none border-b border-[#dbe6e0]"
        >
          <TabsTrigger value="tasks" className="rounded-none px-3 py-2">
            Görevler ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="coordination" className="rounded-none px-3 py-2">
            Koordinasyon
          </TabsTrigger>
          <TabsTrigger value="decisions" className="rounded-none px-3 py-2">
            Kararlar
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-none px-3 py-2">
            Şablonlar
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-none px-3 py-2">
            Geçmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  snapshot={snapshot}
                  canManage={canManage}
                  onEdit={() => onOpen({ kind: 'task', department, task })}
                  onPatch={(body) =>
                    void onMutate('PATCH', {
                      type: 'task',
                      id: task.id,
                      ...body,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-[#cedbd5] bg-white px-4 py-9 text-center text-sm text-[#718078]">
              Bu departmanda henüz görev yok.
            </p>
          )}
        </TabsContent>

        <TabsContent value="coordination" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border border-[#dce6e1] bg-white shadow-none ring-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#e7eeea]">
                <div>
                  <CardTitle className="text-base">
                    Departmanlar arası talepler
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Bağımlılık ve destek ihtiyaçları.
                  </CardDescription>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    onClick={() => onOpen({ kind: 'request', department })}
                  >
                    <Plus aria-hidden="true" /> Talep
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="p-0">
                {requests.length ? (
                  <ol className="divide-y divide-[#e7eeea]">
                    {requests.map((request) => (
                      <li key={request.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#17382b]">
                              {request.title}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-xs text-[#6c7b74]">
                              {
                                snapshot.departments.find(
                                  (item) => item.id === request.fromDepartment,
                                )?.name
                              }
                              <ArrowRight className="size-3" />
                              {
                                snapshot.departments.find(
                                  (item) => item.id === request.toDepartment,
                                )?.name
                              }
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-none">
                            {request.status === 'resolved'
                              ? 'Çözüldü'
                              : request.status === 'in_progress'
                                ? 'İşleniyor'
                                : 'Açık'}
                          </Badge>
                        </div>
                        {request.description ? (
                          <p className="mt-2 text-sm leading-6 text-[#5d6d65]">
                            {request.description}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="mr-auto text-xs text-[#718078]">
                            {formatDate(request.dueAt)}
                          </span>
                          {canManage && request.status !== 'resolved' ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="rounded-none"
                              onClick={() =>
                                void onMutate('PATCH', {
                                  type: 'request',
                                  id: request.id,
                                  status:
                                    request.status === 'open'
                                      ? 'in_progress'
                                      : 'resolved',
                                })
                              }
                            >
                              {request.status === 'open'
                                ? 'İşleme al'
                                : 'Çözüldü yap'}
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="p-6 text-center text-sm text-[#718078]">
                    Açık talep bulunmuyor.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[#dce6e1] bg-white shadow-none ring-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#e7eeea]">
                <CardTitle className="text-base">
                  Departman ekibi ve duyurular
                </CardTitle>
                {viewerCanManageMembers(snapshot) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    onClick={() => onOpen({ kind: 'member', department })}
                  >
                    <Plus aria-hidden="true" /> Üye ata
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-5 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6d7d75]">
                    Üyeler
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.length ? (
                      members.map((member) => (
                        <button
                          type="button"
                          key={member.email}
                          disabled={!viewerCanManageMembers(snapshot)}
                          onClick={() =>
                            onOpen({ kind: 'member', department, member })
                          }
                          className="inline-flex items-center gap-2 border border-[#dbe6e0] bg-[#f5f8f6] px-3 py-2 text-left text-xs font-semibold text-[#405249] enabled:hover:border-[#00a85d] disabled:cursor-default"
                        >
                          <span className="grid size-6 place-items-center bg-[#dff8eb] text-[10px] font-extrabold text-[#087244]">
                            {initials(member.name || member.email)}
                          </span>
                          {member.name || member.email}
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-[#718078]">
                        Henüz üye atanmadı.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6d7d75]">
                    Son duyurular
                  </p>
                  <div className="mt-3 space-y-2">
                    {announcements.slice(0, 3).map((announcement) => (
                      <div
                        key={announcement.id}
                        className="border-l-4 border-[#00a85d] bg-[#f5f8f6] px-3 py-2"
                      >
                        <p className="text-sm font-semibold">
                          {announcement.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#6d7d75]">
                          {announcement.body}
                        </p>
                      </div>
                    ))}
                    {!announcements.length ? (
                      <p className="text-sm text-[#718078]">
                        Duyuru bulunmuyor.
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="mt-4">
          <div className="mb-3 flex justify-end">
            {canManage ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-none"
                onClick={() => onOpen({ kind: 'decision', department })}
              >
                <Plus aria-hidden="true" /> Karar kaydı
              </Button>
            ) : null}
          </div>
          {decisions.length ? (
            <ol className="grid gap-3 md:grid-cols-2">
              {decisions.map((decision) => (
                <li
                  key={decision.id}
                  className="border border-[#dce6e1] bg-white p-4"
                >
                  <p className="font-semibold text-[#17382b]">
                    {decision.title}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5d6d65]">
                    {decision.summary}
                  </p>
                  <p className="mt-3 text-xs text-[#718078]">
                    {decision.createdBy} ·{' '}
                    {formatDate(decision.createdAt, true)}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="border border-dashed border-[#cedbd5] bg-white p-8 text-center text-sm text-[#718078]">
              Karar kaydı bulunmuyor.
            </p>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="mb-3 flex justify-end">
            {canManage ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-none"
                onClick={() => onOpen({ kind: 'template', department })}
              >
                <Plus aria-hidden="true" /> Şablon oluştur
              </Button>
            ) : null}
          </div>
          {templates.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-[#dce6e1] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#17382b]">
                        {template.name}
                      </p>
                      <p className="mt-1 text-xs text-[#718078]">
                        {template.tasks.length} görev
                      </p>
                    </div>
                    {canManage ? (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-none bg-[#00a85d] text-[#061c14]"
                        onClick={() =>
                          void onMutate('POST', {
                            type: 'template_apply',
                            templateId: template.id,
                            department: department.id,
                          })
                        }
                      >
                        Uygula
                      </Button>
                    ) : null}
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-[#5d6d65]">
                    {template.tasks.slice(0, 5).map((task) => (
                      <li key={task}>• {task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-[#cedbd5] bg-white p-8 text-center text-sm text-[#718078]">
              Görev şablonu bulunmuyor.
            </p>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          {activity.length ? (
            <ol className="divide-y divide-[#e5ece8] border border-[#dce6e1] bg-white">
              {activity.slice(0, 30).map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <Activity className="mt-0.5 size-4 shrink-0 text-[#00a85d]" />
                  <div>
                    <p className="text-sm">
                      <strong>{item.actorEmail}</strong>{' '}
                      {item.action.toLocaleLowerCase('tr-TR')}
                    </p>
                    <p className="mt-1 text-xs text-[#718078]">
                      {item.detail} · {formatDate(item.createdAt, true)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="border border-dashed border-[#cedbd5] bg-white p-8 text-center text-sm text-[#718078]">
              Henüz aktivite kaydı yok.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function departmentCanManage(
  snapshot: PanelOperationsSnapshot,
  departmentId: string,
) {
  return (
    snapshot.viewer.canManageAllDepartments ||
    (snapshot.viewer.role === 'chief' &&
      snapshot.viewer.department === departmentId)
  );
}

function viewerCanManageMembers(snapshot: PanelOperationsSnapshot) {
  return (
    snapshot.viewer.role === 'team_lead' || snapshot.viewer.role === 'admin'
  );
}

function DepartmentsWorkspace({
  snapshot,
  onOpen,
  onMutate,
}: {
  snapshot: PanelOperationsSnapshot;
  onOpen: (editor: EditorState) => void;
  onMutate: (
    method: 'POST' | 'PATCH' | 'DELETE',
    body: Record<string, unknown>,
  ) => Promise<boolean>;
}) {
  if (!snapshot.departments.length)
    return (
      <div className="mx-auto max-w-3xl border border-[#dbe6e0] bg-white p-8 text-center">
        <Users className="mx-auto size-8 text-[#829188]" />
        <h1 className="mt-4 font-heading text-2xl font-extrabold">
          Departman ataması bekleniyor
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#65756d]">
          Profiline departman atandığında çalışma alanın burada açılacak.
        </p>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div>
        <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
          Departman merkezi
        </Badge>
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          {snapshot.viewer.canViewAllDepartments
            ? 'Takımın çalışma durumu'
            : snapshot.departments[0].name}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-[#5a6962]">
          Hedefler, görevler, deadline’lar, engeller ve departmanlar arası
          ihtiyaçlar tek yerde.
        </p>
      </div>

      {snapshot.viewer.canViewAllDepartments ? (
        <Accordion
          defaultValue={[
            snapshot.viewer.department ?? snapshot.departments[0].id,
          ]}
          className="mt-7 gap-3"
        >
          {snapshot.departments.map((department) => {
            const health = departmentHealth(department, snapshot.tasks);
            const isOwn = department.id === snapshot.viewer.department;
            return (
              <AccordionItem
                key={department.id}
                value={department.id}
                className="border-0"
              >
                <AccordionTrigger
                  className={`rounded-none border border-[#d6e2dc] bg-white px-5 py-4 hover:no-underline ${isOwn ? 'border-l-4 border-l-[#00a85d]' : ''}`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2 pr-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-base font-extrabold text-[#17382b]">
                          {department.name}
                        </span>
                        {isOwn ? (
                          <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
                            Senin departmanın
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-xs text-[#718078]">
                        {department.weeklyNote ||
                          'Haftalık durum notu bekleniyor'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#607169]">
                      <span>%{health.completion} tamamlandı</span>
                      <span>{health.active} açık</span>
                      {health.overdue ? (
                        <span className="text-[#986e00]">
                          {health.overdue} geciken
                        </span>
                      ) : null}
                      {health.blocked ? (
                        <span className="text-[#b42318]">
                          {health.blocked} engel
                        </span>
                      ) : null}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <DepartmentContent
                    department={department}
                    snapshot={snapshot}
                    canManage={departmentCanManage(snapshot, department.id)}
                    onOpen={onOpen}
                    onMutate={onMutate}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="mt-7">
          <DepartmentContent
            department={snapshot.departments[0]}
            snapshot={snapshot}
            canManage={departmentCanManage(
              snapshot,
              snapshot.departments[0].id,
            )}
            onOpen={onOpen}
            onMutate={onMutate}
          />
        </div>
      )}
    </div>
  );
}

function TasksWorkspace({
  snapshot,
  onOpen,
  onMutate,
}: {
  snapshot: PanelOperationsSnapshot;
  onOpen: (editor: EditorState) => void;
  onMutate: (
    method: 'POST' | 'PATCH' | 'DELETE',
    body: Record<string, unknown>,
  ) => Promise<boolean>;
}) {
  const [filter, setFilter] = useState<'mine' | 'active' | PanelTaskStatus>(
    snapshot.viewer.canViewAllDepartments ? 'active' : 'mine',
  );
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [createDepartmentId, setCreateDepartmentId] = useState(
    snapshot.viewer.department ?? '',
  );
  const [now] = useState(() => Date.now());
  const manageableDepartments = snapshot.departments.filter((department) =>
    departmentCanManage(snapshot, department.id),
  );
  const createDepartment =
    manageableDepartments.find(
      (department) => department.id === createDepartmentId,
    ) ?? manageableDepartments[0];
  const scopedTasks = snapshot.tasks.filter((task) => {
    if (
      !snapshot.viewer.canViewAllDepartments &&
      !task.assigneeEmails.includes(snapshot.viewer.email)
    )
      return false;
    return departmentFilter === 'all' || task.department === departmentFilter;
  });
  const visible = scopedTasks.filter((task) => {
    if (filter === 'mine')
      return (
        task.status !== 'done' &&
        task.assigneeEmails.includes(snapshot.viewer.email)
      );
    return filter === 'active'
      ? task.status !== 'done'
      : task.status === filter;
  });
  const activeTasks = scopedTasks.filter((task) => task.status !== 'done');
  const stats = [
    { label: 'Açık', value: activeTasks.length, tone: 'text-[#17382b]' },
    {
      label: 'Geciken',
      value: activeTasks.filter((task) => task.dueAt && task.dueAt < now)
        .length,
      tone: 'text-[#986e00]',
    },
    {
      label: 'Engellenen',
      value: activeTasks.filter((task) => task.status === 'blocked').length,
      tone: 'text-[#b42318]',
    },
    {
      label: 'Onay bekleyen',
      value: activeTasks.filter((task) => task.status === 'review').length,
      tone: 'text-[#087347]',
    },
  ];
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
            Görev merkezi
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Görevler ve deadline’lar
          </h1>
          <p className="mt-2 text-base text-[#5a6962]">
            Sorumlular, ilerleme, kontrol listeleri ve engeller.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          {createDepartment ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {manageableDepartments.length > 1 ? (
                <Select
                  value={createDepartment.id}
                  onValueChange={(value) =>
                    value && setCreateDepartmentId(value)
                  }
                >
                  <SelectTrigger className="min-w-0 flex-1 rounded-none bg-white sm:w-56">
                    <SelectValue>
                      {(value) =>
                        manageableDepartments.find(
                          (department) => department.id === value,
                        )?.name ?? 'Departman seç'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                    {manageableDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <Button
                type="button"
                className="rounded-none bg-[#00e27b] font-bold text-[#061c14] hover:bg-[#14ef8b]"
                onClick={() =>
                  onOpen({ kind: 'task', department: createDepartment })
                }
              >
                <Plus aria-hidden="true" /> Yeni görev
              </Button>
            </div>
          ) : null}
          <div className="flex w-full gap-2 sm:w-auto">
            {snapshot.viewer.canViewAllDepartments ? (
              <Select
                value={departmentFilter}
                onValueChange={(value) => value && setDepartmentFilter(value)}
              >
                <SelectTrigger className="min-w-0 flex-1 rounded-none bg-white sm:w-56">
                  <SelectValue>
                    {(value) =>
                      value === 'all'
                        ? 'Tüm departmanlar'
                        : snapshot.departments.find(
                            (department) => department.id === value,
                          )?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                  <SelectItem value="all">Tüm departmanlar</SelectItem>
                  {snapshot.departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as typeof filter)}
            >
              <SelectTrigger className="min-w-0 flex-1 rounded-none bg-white sm:w-48">
                <SelectValue>
                  {(value) =>
                    taskFilterLabels[value as keyof typeof taskFilterLabels] ??
                    taskFilterLabels.active
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                <SelectItem value="mine">Bana atananlar</SelectItem>
                <SelectItem value="active">Aktif görevler</SelectItem>
                <SelectItem value="todo">Bekleyen</SelectItem>
                <SelectItem value="in_progress">Devam eden</SelectItem>
                <SelectItem value="blocked">Engellenen</SelectItem>
                <SelectItem value="review">Onay bekleyen</SelectItem>
                <SelectItem value="done">Tamamlanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-[#dbe6e0] bg-white px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#718078]">
              {stat.label}
            </p>
            <p className={`mt-1 text-2xl font-extrabold ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-4 xl:grid-cols-2">
        {visible.map((task) => {
          const department = snapshot.departments.find(
            (item) => item.id === task.department,
          );
          if (!department) return null;
          return (
            <div key={task.id}>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#607169]">
                {department.name}
              </p>
              <TaskCard
                task={task}
                snapshot={snapshot}
                canManage={departmentCanManage(snapshot, department.id)}
                onEdit={() => onOpen({ kind: 'task', department, task })}
                onPatch={(body) =>
                  void onMutate('PATCH', { type: 'task', id: task.id, ...body })
                }
              />
            </div>
          );
        })}
      </div>
      {!visible.length ? (
        <div className="mt-7 border border-dashed border-[#cedbd5] bg-white p-10 text-center text-sm text-[#718078]">
          <p>Bu filtrede görev bulunmuyor.</p>
          {createDepartment ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-none"
              onClick={() =>
                onOpen({ kind: 'task', department: createDepartment })
              }
            >
              <Plus aria-hidden="true" /> İlk görevi oluştur
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function OperationEditor({
  editor,
  snapshot,
  saving,
  onClose,
  onSubmit,
  onDelete,
}: {
  editor: EditorState | null;
  snapshot: PanelOperationsSnapshot;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
  onDelete: (type: 'task', id: string, label: string) => void;
}) {
  if (!editor) return null;
  const task = editor.kind === 'task' ? editor.task : undefined;
  const member = editor.kind === 'member' ? editor.member : undefined;
  const managesDepartment = departmentCanManage(snapshot, editor.department.id);
  const titleByKind = {
    department: 'Departman özetini düzenle',
    task: task ? 'Görevi düzenle' : 'Yeni görev',
    announcement: 'Hızlı duyuru yayınla',
    request: 'Departmanlar arası talep',
    decision: 'Karar kaydı oluştur',
    template: 'Görev şablonu oluştur',
    member: member ? 'Üye ve yetkiyi düzenle' : 'Departmana üye ata',
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="panel-light-theme max-h-[calc(100vh-2rem)] overflow-y-auto rounded-none bg-white text-[#071a13] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-extrabold">
            {titleByKind[editor.kind]}
          </DialogTitle>
          <DialogDescription className="text-[#5d6d65]">
            {editor.department.name} çalışma alanı
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
            if (editor.kind === 'department') {
              void onSubmit({
                type: 'department',
                department: editor.department.id,
                description: get('description'),
                seasonGoal: get('seasonGoal'),
                weeklyNote: get('weeklyNote'),
                chiefEmail: get('chiefEmail'),
              });
            } else if (editor.kind === 'task') {
              const checklistLabels = get('checklist')
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean);
              const checklist = checklistLabels.map((label) => {
                const current = task?.checklist.find(
                  (item) => item.label === label,
                );
                return (
                  current ?? { id: crypto.randomUUID(), label, done: false }
                );
              });
              const dueText = get('dueAt');
              const dueAt = dueText ? parseDateInput(dueText) : null;
              void onSubmit({
                type: 'task',
                ...(task
                  ? { id: task.id }
                  : { department: editor.department.id }),
                title: get('title'),
                description: get('description'),
                assigneeEmails: form
                  .getAll('assigneeEmails')
                  .filter((email): email is string => typeof email === 'string')
                  .map((email) => email.trim())
                  .filter(Boolean),
                priority: get('priority'),
                status: get('status') || 'todo',
                progress: Number(get('progress') || 0),
                dueAt,
                requiresApproval: form.get('requiresApproval') === 'on',
                checklist,
                blockerNote: get('blockerNote'),
                dependencyNote: get('dependencyNote'),
                calendarUrl: get('calendarUrl'),
                purchaseReference: get('purchaseReference'),
              });
            } else if (editor.kind === 'announcement') {
              const level = get('level') as PanelAnnouncementLevel;
              void onSubmit({
                type: 'announcement',
                department: get('scope') === 'team' ? '' : editor.department.id,
                title: get('title'),
                body: get('body'),
                level,
              });
            } else if (editor.kind === 'request') {
              const dueText = get('dueAt');
              void onSubmit({
                type: 'request',
                department: editor.department.id,
                toDepartment: get('toDepartment'),
                title: get('title'),
                description: get('description'),
                dueAt: dueText ? parseDateInput(dueText) : null,
              });
            } else if (editor.kind === 'decision') {
              void onSubmit({
                type: 'decision',
                department: editor.department.id,
                title: get('title'),
                summary: get('summary'),
              });
            } else if (editor.kind === 'template') {
              void onSubmit({
                type: 'template',
                department: editor.department.id,
                name: get('name'),
                tasks: get('tasks')
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean),
              });
            } else if (editor.kind === 'member') {
              void onSubmit({
                type: 'member',
                email: get('email'),
                name: get('name'),
                role: get('role'),
                department: get('memberDepartment'),
                sponsorshipDelegate: form.get('sponsorshipDelegate') === 'on',
                active: member?.active ?? true,
              });
            }
          }}
        >
          {editor.kind === 'department' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="department-description">
                  Departman açıklaması
                </Label>
                <Textarea
                  id="department-description"
                  name="description"
                  defaultValue={editor.department.description}
                  className="min-h-24 rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="season-goal">Sezon hedefi</Label>
                <Textarea
                  id="season-goal"
                  name="seasonGoal"
                  defaultValue={editor.department.seasonGoal}
                  className="min-h-28 rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weekly-note">Haftalık durum notu</Label>
                <Textarea
                  id="weekly-note"
                  name="weeklyNote"
                  defaultValue={editor.department.weeklyNote}
                  className="min-h-28 rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chief-email">Departman şefi e-postası</Label>
                <Input
                  id="chief-email"
                  name="chiefEmail"
                  type="email"
                  defaultValue={editor.department.chiefEmail}
                  className="rounded-none"
                />
              </div>
            </>
          ) : null}

          {editor.kind === 'task' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="task-title">Görev adı</Label>
                <Input
                  id="task-title"
                  name="title"
                  required
                  defaultValue={task?.title}
                  disabled={!managesDepartment}
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-description">Açıklama</Label>
                <Textarea
                  id="task-description"
                  name="description"
                  defaultValue={task?.description}
                  disabled={!managesDepartment}
                  className="min-h-24 rounded-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Durum</Label>
                  <Select name="status" defaultValue={task?.status ?? 'todo'}>
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          statusLabels[value as PanelTaskStatus] ??
                          statusLabels.todo
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="todo">Bekliyor</SelectItem>
                      <SelectItem value="in_progress">Devam ediyor</SelectItem>
                      <SelectItem value="blocked">Engellendi</SelectItem>
                      <SelectItem value="review">Şef onayı</SelectItem>
                      <SelectItem value="done">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Öncelik</Label>
                  <Select
                    name="priority"
                    defaultValue={task?.priority ?? 'normal'}
                    disabled={!managesDepartment}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          priorityLabels[
                            value as keyof typeof priorityLabels
                          ] ?? priorityLabels.normal
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="task-due">Deadline</Label>
                  <Input
                    id="task-due"
                    name="dueAt"
                    placeholder="GG/AA/YYYY"
                    maxLength={10}
                    defaultValue={formatDateInput(task?.dueAt ?? null)}
                    disabled={!managesDepartment}
                    onInput={(event) => {
                      event.currentTarget.value = formatDateTyping(
                        event.currentTarget.value,
                      );
                    }}
                    className="rounded-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-progress">İlerleme (%)</Label>
                  <Input
                    id="task-progress"
                    name="progress"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={task?.progress ?? 0}
                    className="rounded-none"
                  />
                </div>
              </div>
              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Sorumlular</legend>
                {snapshot.members.filter(
                  (candidate) =>
                    candidate.active &&
                    (candidate.department === editor.department.id ||
                      task?.assigneeEmails.includes(candidate.email)),
                ).length ? (
                  <div className="grid max-h-44 gap-2 overflow-y-auto border border-[#d7e1dc] bg-[#f8fbf9] p-3 sm:grid-cols-2">
                    {snapshot.members
                      .filter(
                        (candidate) =>
                          candidate.active &&
                          (candidate.department === editor.department.id ||
                            task?.assigneeEmails.includes(candidate.email)),
                      )
                      .map((candidate) => (
                        <label
                          key={candidate.email}
                          htmlFor={`task-assignee-${candidate.email}`}
                          className="flex cursor-pointer items-start gap-3 border border-[#dde7e2] bg-white p-3 text-sm"
                        >
                          <Checkbox
                            id={`task-assignee-${candidate.email}`}
                            name="assigneeEmails"
                            value={candidate.email}
                            defaultChecked={task?.assigneeEmails.includes(
                              candidate.email,
                            )}
                            disabled={!managesDepartment}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-[#263d33]">
                              {candidate.name || candidate.email}
                            </span>
                            <span className="block truncate text-xs text-[#718078]">
                              {candidate.email}
                            </span>
                          </span>
                        </label>
                      ))}
                  </div>
                ) : (
                  <p className="border border-dashed border-[#cedbd5] bg-[#f8fbf9] p-4 text-sm text-[#718078]">
                    Bu departmanda atanabilecek aktif üye bulunmuyor.
                  </p>
                )}
              </fieldset>
              <div className="grid gap-2">
                <Label htmlFor="task-checklist">Kontrol listesi</Label>
                <Textarea
                  id="task-checklist"
                  name="checklist"
                  defaultValue={task?.checklist
                    .map((item) => item.label)
                    .join('\n')}
                  placeholder={
                    'Her satıra bir adım\nParça ölçülerini kontrol et\nMontajı doğrula'
                  }
                  className="min-h-28 rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blocker-note">Engel notu</Label>
                <Textarea
                  id="blocker-note"
                  name="blockerNote"
                  defaultValue={task?.blockerNote}
                  className="min-h-20 rounded-none"
                />
              </div>
              {managesDepartment ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="dependency-note">
                      Bağımlılık / beklenen iş
                    </Label>
                    <Input
                      id="dependency-note"
                      name="dependencyNote"
                      defaultValue={task?.dependencyNote}
                      className="rounded-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="calendar-url">Takvim bağlantısı</Label>
                      <Input
                        id="calendar-url"
                        name="calendarUrl"
                        type="url"
                        defaultValue={task?.calendarUrl}
                        className="rounded-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purchase-reference">
                        Satın alma / envanter referansı
                      </Label>
                      <Input
                        id="purchase-reference"
                        name="purchaseReference"
                        defaultValue={task?.purchaseReference}
                        className="rounded-none"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <Checkbox
                      name="requiresApproval"
                      defaultChecked={task?.requiresApproval}
                    />{' '}
                    Tamamlanınca şef onayı iste
                  </label>
                </>
              ) : null}
            </>
          ) : null}

          {editor.kind === 'announcement' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="announcement-title">Başlık</Label>
                <Input
                  id="announcement-title"
                  name="title"
                  required
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="announcement-body">Duyuru</Label>
                <Textarea
                  id="announcement-body"
                  name="body"
                  required
                  className="min-h-36 rounded-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Seviye</Label>
                  <Select name="level" defaultValue="normal">
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          announcementLevelLabels[
                            value as keyof typeof announcementLevelLabels
                          ] ?? announcementLevelLabels.normal
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="normal">
                        Normal — yalnız panel
                      </SelectItem>
                      <SelectItem value="important">
                        Önemli — panel + e-posta
                      </SelectItem>
                      <SelectItem value="urgent">
                        Acil — sabit + e-posta
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Kapsam</Label>
                  <Select name="scope" defaultValue="department">
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          value === 'team'
                            ? 'Tüm takım'
                            : editor.department.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="department">
                        {editor.department.name}
                      </SelectItem>
                      {snapshot.viewer.canManageAllDepartments ? (
                        <SelectItem value="team">Tüm takım</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-l-4 border-[#e0a700] bg-[#fff8e8] p-4 text-sm leading-6 text-[#6f571b]">
                Önemli ve acil duyurular aktif üyelere e-posta olarak da
                gönderilir. Normal duyurular yalnız panelde görünür.
              </div>
            </>
          ) : null}

          {editor.kind === 'request' ? (
            <>
              <div className="grid gap-2">
                <Label>Hedef departman</Label>
                <Select name="toDepartment" required>
                  <SelectTrigger className="w-full rounded-none">
                    <SelectValue placeholder="Departman seç">
                      {(value) =>
                        snapshot.departments.find(
                          (department) => department.id === value,
                        )?.name ?? 'Departman seç'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                    {snapshot.departments
                      .filter(
                        (department) => department.id !== editor.department.id,
                      )
                      .map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-title">Talep adı</Label>
                <Input
                  id="request-title"
                  name="title"
                  required
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-description">
                  İhtiyaç ve teslim koşulu
                </Label>
                <Textarea
                  id="request-description"
                  name="description"
                  className="min-h-28 rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="request-due">Beklenen tarih</Label>
                <Input
                  id="request-due"
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
            </>
          ) : null}

          {editor.kind === 'decision' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="decision-title">Karar başlığı</Label>
                <Input
                  id="decision-title"
                  name="title"
                  required
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="decision-summary">
                  Karar, gerekçe ve etkisi
                </Label>
                <Textarea
                  id="decision-summary"
                  name="summary"
                  required
                  className="min-h-40 rounded-none"
                />
              </div>
            </>
          ) : null}

          {editor.kind === 'template' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="template-name">Şablon adı</Label>
                <Input
                  id="template-name"
                  name="name"
                  required
                  placeholder="Araç testi öncesi kontrol"
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-tasks">Oluşturulacak görevler</Label>
                <Textarea
                  id="template-tasks"
                  name="tasks"
                  required
                  placeholder={
                    'Her satıra bir görev\nAraç kontrolü\nEkipman listesi\nTest alanı hazırlığı'
                  }
                  className="min-h-40 rounded-none"
                />
              </div>
            </>
          ) : null}

          {editor.kind === 'member' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="member-email">E-posta</Label>
                <Input
                  id="member-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={member?.email}
                  readOnly={Boolean(member)}
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member-name">Ad soyad</Label>
                <Input
                  id="member-name"
                  name="name"
                  required
                  defaultValue={member?.name}
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Rol</Label>
                  <Select name="role" defaultValue={member?.role ?? 'member'}>
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          memberRoleLabels[
                            value as keyof typeof memberRoleLabels
                          ] ?? memberRoleLabels.member
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      <SelectItem value="member">Üye</SelectItem>
                      <SelectItem value="chief">Departman şefi</SelectItem>
                      <SelectItem value="advisor">Danışman</SelectItem>
                      <SelectItem value="team_lead">Takım lideri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Departman</Label>
                  <Select
                    name="memberDepartment"
                    defaultValue={member?.department ?? editor.department.id}
                  >
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue>
                        {(value) =>
                          snapshot.departments.find(
                            (department) => department.id === value,
                          )?.name ?? editor.department.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                      {snapshot.departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label
                htmlFor="member-sponsorship-delegate"
                className="flex items-center gap-3 text-sm font-semibold"
              >
                <Checkbox
                  id="member-sponsorship-delegate"
                  name="sponsorshipDelegate"
                  defaultChecked={member?.specialRoles.includes(
                    'sponsorship_delegate',
                  )}
                />
                Sponsorluk modülü özel yetkisi
              </label>
              <div className="border-l-4 border-[#00a85d] bg-[#eefaf4] p-4 text-sm leading-6 text-[#286046]">
                Üye, rol ve departman değişiklikleri yalnız takım lideri ve
                sistem yöneticileri tarafından yapılabilir.
              </div>
            </>
          ) : null}

          <DialogFooter className="border-t border-[#e5ece8] pt-5">
            {task && managesDepartment ? (
              <Button
                type="button"
                variant="outline"
                className="mr-auto rounded-none border-[#efc7c3] text-[#a33429]"
                onClick={() => onDelete('task', task.id, task.title)}
              >
                <Trash2 aria-hidden="true" /> Sil
              </Button>
            ) : null}
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
              className="rounded-none bg-[#00a85d] text-[#061c14] hover:bg-[#12bd70]"
            >
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OperationsWorkspace({ mode }: { mode: WorkspaceMode }) {
  const { snapshot, loading, saving, error, load, mutate } = useOperations();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'task';
    id: string;
    label: string;
  } | null>(null);

  const mutationMethod: 'POST' | 'PATCH' =
    editor?.kind === 'department' ||
    (editor?.kind === 'task' && Boolean(editor.task)) ||
    (editor?.kind === 'member' && Boolean(editor.member))
      ? 'PATCH'
      : 'POST';

  if (loading && !snapshot) return <LoadingState />;
  if (!snapshot)
    return <ErrorState message={error} onRetry={() => void load()} />;

  async function submit(body: Record<string, unknown>) {
    const ok = await mutate(mutationMethod, body);
    if (ok) setEditor(null);
  }

  return (
    <>
      {error ? (
        <div className="mx-auto mb-5 flex max-w-7xl items-center gap-3 border-l-4 border-[#b42318] bg-[#fff0ee] px-4 py-3 text-sm text-[#812d25]">
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </div>
      ) : null}
      {mode === 'home' ? (
        <HomeWorkspace snapshot={snapshot} onOpen={setEditor} />
      ) : null}
      {mode === 'departments' ? (
        <DepartmentsWorkspace
          snapshot={snapshot}
          onOpen={setEditor}
          onMutate={mutate}
        />
      ) : null}
      {mode === 'tasks' ? (
        <TasksWorkspace
          snapshot={snapshot}
          onOpen={setEditor}
          onMutate={mutate}
        />
      ) : null}

      <OperationEditor
        editor={editor}
        snapshot={snapshot}
        saving={saving}
        onClose={() => setEditor(null)}
        onSubmit={submit}
        onDelete={(type, id, label) => setDeleteTarget({ type, id, label })}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="panel-light-theme rounded-none bg-white text-[#071a13]">
          <AlertDialogHeader>
            <AlertDialogTitle>Görev silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.label}” kalıcı olarak silinecek. İşlem aktivite
              geçmişine kaydedilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-[#b42318] text-white hover:bg-[#8f1d14]"
              onClick={() => {
                if (!deleteTarget) return;
                void mutate('DELETE', {
                  type: deleteTarget.type,
                  id: deleteTarget.id,
                }).then((ok) => {
                  if (ok) {
                    setDeleteTarget(null);
                    setEditor(null);
                  }
                });
              }}
            >
              <Trash2 aria-hidden="true" /> Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
