'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Crown,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
import type {
  PanelMemberAuditRecord,
  PanelMemberDirectoryRecord,
  PanelMemberDirectorySnapshot,
  PanelMemberState,
} from '@/lib/panel-members';
import type { PanelPermission, PanelRole } from '@/lib/panel-authorization';

const roleLabels: Record<PanelRole, string> = {
  member: 'Üye',
  chief: 'Departman şefi',
  advisor: 'Danışman',
  team_lead: 'Takım lideri',
  admin: 'Sistem yöneticisi',
};

const permissionLabels: Record<PanelPermission, string> = {
  'calendar.read': 'Takvimi görüntüleme',
  'calendar.manage': 'Takvim etkinliklerini yönetme',
  'departments.read': 'Departman alanını görüntüleme',
  'departments.manage': 'Departman içeriğini yönetme',
  'tasks.read': 'Görevleri görüntüleme',
  'tasks.manage': 'Görevleri yönetme',
  'sponsorship.manage': 'Sponsor takibini yönetme',
  'inventory.manage': 'Envanteri yönetme',
  'purchases.manage': 'Satın almayı yönetme',
  'applications.manage': 'Başvuruları yönetme',
  'members.read': 'Üye dizinini görüntüleme',
  'members.manage': 'Üye kayıtlarını değiştirme',
  'permissions.manage': 'Rol ve özel yetki değiştirme',
};

const auditLabels: Record<PanelMemberAuditRecord['action'], string> = {
  created: 'Üye oluşturuldu',
  updated: 'Üye güncellendi',
  deactivated: 'Üye pasifleştirildi',
  reactivated: 'Üye yeniden etkinleştirildi',
};

function formatDate(value: number) {
  if (!value) return 'Sistem tanımı';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function initials(value: string) {
  const clean = value.trim();
  if (!clean) return '?';
  const words = clean.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase('tr-TR'))
    .join('');
}

function roleBadgeClass(role: PanelRole) {
  if (role === 'admin') return 'bg-[#092e23] text-white';
  if (role === 'team_lead') return 'bg-[#dff8eb] text-[#087244]';
  if (role === 'advisor') return 'bg-[#f0eaff] text-[#65449b]';
  if (role === 'chief') return 'bg-[#e9f1ff] text-[#28568a]';
  return 'bg-[#edf2ef] text-[#53645c]';
}

function useMemberDirectory() {
  const [snapshot, setSnapshot] = useState<PanelMemberDirectorySnapshot | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/panel/members', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        snapshot?: PanelMemberDirectorySnapshot;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.snapshot)
        throw new Error(payload.error || 'Üye kayıtları yüklenemedi.');
      setSnapshot(payload.snapshot);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Üye kayıtları yüklenemedi.',
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
    async (method: 'POST' | 'PATCH', body: Record<string, unknown>) => {
      setSaving(true);
      setError('');
      try {
        const response = await fetch('/api/admin/panel/members', {
          method,
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!response.ok || !payload.ok)
          throw new Error(payload.error || 'İşlem tamamlanamadı.');
        await load();
        return true;
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
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

function MemberStatus({ member }: { member: PanelMemberDirectoryRecord }) {
  return member.active ? (
    <Badge className="rounded-none bg-[#e1f7eb] text-[#087244]">
      <UserCheck className="size-3.5" /> Aktif
    </Badge>
  ) : (
    <Badge className="rounded-none bg-[#f0f2f1] text-[#6b756f]">
      <UserMinus className="size-3.5" /> Pasif
    </Badge>
  );
}

function MemberEditor({
  member,
  snapshot,
  saving,
  onClose,
  onSave,
}: {
  member: PanelMemberDirectoryRecord | null;
  snapshot: PanelMemberDirectorySnapshot;
  saving: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const systemAdmin = member?.isSystemAdmin === true;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="panel-light-theme max-h-[92vh] overflow-y-auto rounded-none border-[#b9cbc2] bg-white text-[#071a13] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-extrabold">
            {member ? 'Üye ve yetkileri düzenle' : 'Yeni üye ekle'}
          </DialogTitle>
          <DialogDescription className="leading-6 text-[#617169]">
            Departman üyeliği erişilecek çalışma alanını; rol ve özel yetki ise
            yapılabilecek işlemleri belirler.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const get = (name: string) => {
              const value = formData.get(name);
              return typeof value === 'string' ? value.trim() : '';
            };
            void onSave({
              email: member?.email ?? get('email'),
              name: get('name'),
              role: systemAdmin ? 'admin' : get('role'),
              department: get('department') === 'none' ? '' : get('department'),
              sponsorshipDelegate: formData.get('sponsorshipDelegate') === 'on',
              active: member?.active ?? true,
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="directory-member-name">Ad soyad</Label>
              <Input
                id="directory-member-name"
                name="name"
                required
                defaultValue={member?.name}
                placeholder="Ad Soyad"
                className="rounded-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="directory-member-email">E-posta</Label>
              <Input
                id="directory-member-email"
                name="email"
                type="email"
                required
                readOnly={Boolean(member)}
                defaultValue={member?.email}
                placeholder="uye@sauformula.org"
                className="rounded-none"
              />
              {member ? (
                <p className="text-xs leading-5 text-[#718078]">
                  Kimlik eşleşmesi için kayıtlı e-posta değiştirilemez.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Rol</Label>
              {systemAdmin ? (
                <div className="flex h-9 items-center border border-[#cbd8d2] bg-[#f3f7f5] px-3 text-sm font-semibold">
                  Sistem yöneticisi — korumalı rol
                </div>
              ) : (
                <Select name="role" defaultValue={member?.role ?? 'member'}>
                  <SelectTrigger className="w-full rounded-none">
                    <SelectValue>
                      {(value) =>
                        roleLabels[value as PanelRole] ?? roleLabels.member
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
              )}
            </div>
            <div className="grid gap-2">
              <Label>Departman</Label>
              <Select
                name="department"
                defaultValue={member?.department ?? 'none'}
              >
                <SelectTrigger className="w-full rounded-none">
                  <SelectValue>
                    {(value) =>
                      value === 'none'
                        ? 'Departman seçilmedi'
                        : (snapshot.departments.find(
                            (department) => department.id === value,
                          )?.name ?? 'Departman seç')
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                  {systemAdmin ? (
                    <SelectItem value="none">Departman seçilmedi</SelectItem>
                  ) : null}
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
            htmlFor="directory-sponsorship-delegate"
            className="flex items-start gap-3 border border-[#d8e4de] bg-[#f7faf8] p-4 text-sm"
          >
            <Checkbox
              id="directory-sponsorship-delegate"
              name="sponsorshipDelegate"
              defaultChecked={member?.specialRoles.includes(
                'sponsorship_delegate',
              )}
            />
            <span>
              <strong className="block text-[#17382b]">
                Sponsorluk özel yetkisi
              </strong>
              <span className="mt-1 block leading-5 text-[#66766e]">
                Departmanı farklı olsa bile sponsor kayıtlarını görme ve yönetme
                yetkisi verir.
              </span>
            </span>
          </label>

          <div className="border-l-4 border-[#00a85d] bg-[#eefaf4] p-4 text-sm leading-6 text-[#286046]">
            Sistem yöneticisi rolü yalnız tanımlı iki yönetici hesabına aittir.
            Üyeler silinmez; geçmişin korunması için ayrıca pasifleştirilir.
          </div>

          <DialogFooter className="border-t border-[#e1e9e5] pt-5">
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

function MemberDetail({
  member,
  snapshot,
  onClose,
  onEdit,
  onStatus,
}: {
  member: PanelMemberDirectoryRecord | null;
  snapshot: PanelMemberDirectorySnapshot;
  onClose: () => void;
  onEdit: () => void;
  onStatus: () => void;
}) {
  if (!member) return null;
  const department = snapshot.departments.find(
    (option) => option.id === member.department,
  );
  const editable =
    snapshot.viewer.canManage &&
    (snapshot.viewer.role === 'admin' || !member.isSystemAdmin);
  const canChangeStatus =
    editable && !member.isSystemAdmin && member.email !== snapshot.viewer.email;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="panel-light-theme w-full overflow-y-auto bg-white text-[#071a13] sm:max-w-xl">
        <SheetHeader className="border-b border-[#dce6e1] pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <MemberStatus member={member} />
            <Badge className={`rounded-none ${roleBadgeClass(member.role)}`}>
              {member.role === 'admin' ? <Crown className="size-3.5" /> : null}
              {roleLabels[member.role]}
            </Badge>
          </div>
          <SheetTitle className="mt-3 font-heading text-2xl font-extrabold">
            {member.name || 'İsimsiz üye'}
          </SheetTitle>
          <SheetDescription>{member.email}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-8">
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="bg-[#eef7f2] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#687970]">
                Departman
              </p>
              <p className="mt-2 font-bold text-[#17382b]">
                {department?.name ?? 'Atanmamış'}
              </p>
            </div>
            <div className="bg-[#eef7f2] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#687970]">
                Son güncelleme
              </p>
              <p className="mt-2 font-bold text-[#17382b]">
                {formatDate(member.updatedAt)}
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-heading text-base font-extrabold">
              Özel yetkiler
            </h3>
            <div className="mt-3">
              {member.specialRoles.includes('sponsorship_delegate') ? (
                <Badge className="rounded-none bg-[#e1f7eb] text-[#087244]">
                  Sponsorluk özel yetkisi
                </Badge>
              ) : (
                <p className="text-sm text-[#687870]">Özel yetki bulunmuyor.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-heading text-base font-extrabold">
              Etkin modül yetkileri
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {member.permissions.map((permission) => (
                <li
                  key={permission}
                  className="flex items-start gap-2 border border-[#e1e9e5] bg-[#fafcfb] p-3 text-sm text-[#4f6158]"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#00a85d]" />
                  {permissionLabels[permission]}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-[#dce6e1] pt-5 text-sm text-[#66766e]">
            <p>Son değiştiren: {member.updatedBy || 'Sistem tanımı'}</p>
            {member.isSystemAdmin ? (
              <p className="mt-2 font-semibold text-[#286046]">
                Bu hesap sistem yöneticisi listesinde korumalıdır.
              </p>
            ) : null}
          </section>

          {editable ? (
            <div className="flex flex-wrap gap-2 border-t border-[#dce6e1] pt-5">
              <Button className="rounded-none" onClick={onEdit}>
                <Pencil /> Üyeyi düzenle
              </Button>
              {canChangeStatus ? (
                <Button
                  variant="outline"
                  className={`rounded-none ${
                    member.active
                      ? 'border-[#efc7c3] text-[#a33429]'
                      : 'border-[#b9ddca] text-[#087244]'
                  }`}
                  onClick={onStatus}
                >
                  {member.active ? <UserMinus /> : <UserCheck />}
                  {member.active ? 'Pasifleştir' : 'Yeniden etkinleştir'}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="border-l-4 border-[#d5a21b] bg-[#fff8e8] p-4 text-sm leading-6 text-[#6f571b]">
              Bu kayıt salt okunur. Üye ve yetki değişiklikleri yalnız takım
              lideri veya sistem yöneticisi tarafından yapılabilir.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StateSummary({
  title,
  state,
  snapshot,
}: {
  title: string;
  state: PanelMemberState | null;
  snapshot: PanelMemberDirectorySnapshot;
}) {
  const department = snapshot.departments.find(
    (option) => option.id === state?.department,
  );
  return (
    <div className="border border-[#dce6e1] bg-[#fafcfb] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#687970]">
        {title}
      </p>
      {state ? (
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#718078]">Ad</dt>
            <dd className="text-right font-semibold">{state.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#718078]">Rol</dt>
            <dd className="text-right font-semibold">
              {roleLabels[state.role]}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#718078]">Departman</dt>
            <dd className="text-right font-semibold">
              {department?.name ?? 'Atanmamış'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#718078]">Durum</dt>
            <dd className="text-right font-semibold">
              {state.active ? 'Aktif' : 'Pasif'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#718078]">Sponsor özel yetkisi</dt>
            <dd className="text-right font-semibold">
              {state.specialRoles.includes('sponsorship_delegate')
                ? 'Var'
                : 'Yok'}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-[#718078]">Kayıt bulunmuyor.</p>
      )}
    </div>
  );
}

function AuditDetail({
  audit,
  snapshot,
  onClose,
}: {
  audit: PanelMemberAuditRecord | null;
  snapshot: PanelMemberDirectorySnapshot;
  onClose: () => void;
}) {
  if (!audit) return null;
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="panel-light-theme w-full overflow-y-auto bg-white text-[#071a13] sm:max-w-xl">
        <SheetHeader className="border-b border-[#dce6e1] pr-10">
          <Badge className="w-fit rounded-none bg-[#edf2ef] text-[#53645c]">
            <Activity className="size-3.5" /> Denetim kaydı
          </Badge>
          <SheetTitle className="mt-3 font-heading text-2xl font-extrabold">
            {auditLabels[audit.action]}
          </SheetTitle>
          <SheetDescription>{audit.memberEmail}</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">
          <div className="grid gap-4">
            <StateSummary
              title="Önce"
              state={audit.before}
              snapshot={snapshot}
            />
            <StateSummary
              title="Sonra"
              state={audit.after}
              snapshot={snapshot}
            />
          </div>
          <div className="border-t border-[#dce6e1] pt-5 text-sm leading-6 text-[#66766e]">
            <p>İşlemi yapan: {audit.actorEmail}</p>
            <p>Tarih: {formatDate(audit.createdAt)}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MemberWorkspace() {
  const { snapshot, loading, saving, error, load, mutate } =
    useMemberDirectory();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [editor, setEditor] = useState<
    PanelMemberDirectoryRecord | 'new' | null
  >(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] =
    useState<PanelMemberDirectoryRecord | null>(null);

  const filteredMembers = useMemo(() => {
    if (!snapshot) return [];
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    return snapshot.members.filter((member) => {
      if (statusFilter !== 'all') {
        const wantsActive = statusFilter === 'active';
        if (member.active !== wantsActive) return false;
      }
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;
      if (
        departmentFilter !== 'all' &&
        (departmentFilter === 'none'
          ? member.department !== null
          : member.department !== departmentFilter)
      )
        return false;
      if (!needle) return true;
      const departmentName = snapshot.departments.find(
        (department) => department.id === member.department,
      )?.name;
      return [
        member.name,
        member.email,
        departmentName ?? '',
        roleLabels[member.role],
      ].some((value) => value.toLocaleLowerCase('tr-TR').includes(needle));
    });
  }, [departmentFilter, query, roleFilter, snapshot, statusFilter]);

  if (loading && !snapshot)
    return (
      <div className="grid min-h-80 place-items-center text-[#53655c]">
        <div className="text-center">
          <Loader2 className="mx-auto size-7 animate-spin text-[#00a85d]" />
          <p className="mt-3 text-sm font-semibold">Üye dizini yükleniyor</p>
        </div>
      </div>
    );

  if (!snapshot)
    return (
      <div className="mx-auto max-w-xl border border-[#efc7c3] bg-white p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-[#b42318]" />
        <h1 className="mt-4 font-heading text-2xl font-extrabold">
          Üye dizini açılamadı
        </h1>
        <p className="mt-2 text-sm text-[#6c7b74]">{error}</p>
        <Button className="mt-5 rounded-none" onClick={() => void load()}>
          <RefreshCw /> Yeniden dene
        </Button>
      </div>
    );

  const active = snapshot.members.filter((member) => member.active);
  const selectedMember = selectedEmail
    ? (snapshot.members.find((member) => member.email === selectedEmail) ??
      null)
    : null;
  const selectedAudit = selectedAuditId
    ? (snapshot.audit.find((audit) => audit.id === selectedAuditId) ?? null)
    : null;
  const editMember = editor && editor !== 'new' ? editor : null;
  const stats = [
    {
      label: 'Aktif üye',
      value: active.length,
      icon: Users,
      tone: 'bg-[#e1f7eb] text-[#087244]',
    },
    {
      label: 'Departman şefi',
      value: active.filter((member) => member.role === 'chief').length,
      icon: UserRoundCog,
      tone: 'bg-[#e9f1ff] text-[#28568a]',
    },
    {
      label: 'Danışman',
      value: active.filter((member) => member.role === 'advisor').length,
      icon: Crown,
      tone: 'bg-[#f0eaff] text-[#65449b]',
    },
    {
      label: 'Takım lideri',
      value: active.filter((member) => member.role === 'team_lead').length,
      icon: ShieldCheck,
      tone: 'bg-[#fff3d6] text-[#755500]',
    },
    {
      label: 'Sponsor özel yetkisi',
      value: active.filter((member) =>
        member.specialRoles.includes('sponsorship_delegate'),
      ).length,
      icon: UserCheck,
      tone: 'bg-[#e1f7eb] text-[#087244]',
    },
    {
      label: 'Pasif kayıt',
      value: snapshot.members.filter((member) => !member.active).length,
      icon: UserMinus,
      tone: 'bg-[#f0f2f1] text-[#6b756f]',
    },
  ];

  async function saveMember(body: Record<string, unknown>) {
    const ok = await mutate(editMember ? 'PATCH' : 'POST', body);
    if (ok) {
      setEditor(null);
      if (typeof body.email === 'string') setSelectedEmail(body.email);
    }
    return ok;
  }

  async function changeStatus(member: PanelMemberDirectoryRecord) {
    const ok = await mutate('PATCH', {
      email: member.email,
      name: member.name,
      role: member.role,
      department: member.department ?? '',
      sponsorshipDelegate: member.specialRoles.includes('sponsorship_delegate'),
      active: !member.active,
    });
    if (ok) setStatusTarget(null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {error ? (
        <div className="mb-5 flex items-center gap-3 border-l-4 border-[#b42318] bg-[#fff0ee] px-4 py-3 text-sm text-[#812d25]">
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
            Erişim ve organizasyon
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Üyeler ve yetkiler
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-[#5a6962]">
            Takım üyelerini, bağlı oldukları departmanı, görev rollerini ve özel
            modül erişimlerini tek yerden takip edin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-none bg-white"
            disabled={loading}
            onClick={() => void load()}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} /> Güncelle
          </Button>
          {snapshot.viewer.canManage ? (
            <Button
              className="rounded-none bg-[#00a85d] text-[#061c14]"
              onClick={() => setEditor('new')}
            >
              <Plus /> Yeni üye
            </Button>
          ) : null}
        </div>
      </div>

      {!snapshot.viewer.canManage ? (
        <div className="mt-5 border-l-4 border-[#d5a21b] bg-[#fff8e8] p-4 text-sm leading-6 text-[#6f571b]">
          Şef görünümündesiniz. Tüm üyeleri ve etkin yetkileri
          inceleyebilirsiniz; değişiklik yetkisi takım lideri ve sistem
          yöneticilerindedir.
        </div>
      ) : null}

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6"
        aria-label="Üye özeti"
      >
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-none border-[#dbe6e0] bg-white shadow-none"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6b7b73]">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#17382b]">
                  {stat.value}
                </p>
              </div>
              <div className={`grid size-10 place-items-center ${stat.tone}`}>
                <stat.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-none border-[#dbe6e0] bg-white shadow-none">
          <CardHeader className="border-b border-[#e4ece8]">
            <CardTitle className="font-heading text-xl font-extrabold">
              Üye dizini
            </CardTitle>
            <CardDescription className="leading-6 text-[#617169]">
              Pasifleştirilen kayıtlar korunur ve durum filtresinden yeniden
              etkinleştirilebilir.
            </CardDescription>
            <div className="grid gap-2 pt-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative md:col-span-2 xl:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#738078]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ad, e-posta veya departman ara"
                  aria-label="Üye ara"
                  className="rounded-none pl-9"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value ?? 'all')}
              >
                <SelectTrigger className="w-full rounded-none bg-white">
                  <SelectValue>
                    {(value) =>
                      value === 'all'
                        ? 'Tüm roller'
                        : roleLabels[value as PanelRole]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                  <SelectItem value="all">Tüm roller</SelectItem>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={(value) => setDepartmentFilter(value ?? 'all')}
              >
                <SelectTrigger className="w-full rounded-none bg-white">
                  <SelectValue>
                    {(value) =>
                      value === 'all'
                        ? 'Tüm departmanlar'
                        : value === 'none'
                          ? 'Departmanı olmayanlar'
                          : (snapshot.departments.find(
                              (department) => department.id === value,
                            )?.name ?? 'Departman')
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                  <SelectItem value="all">Tüm departmanlar</SelectItem>
                  <SelectItem value="none">Departmanı olmayanlar</SelectItem>
                  {snapshot.departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value ?? 'active')}
              >
                <SelectTrigger className="w-full rounded-none bg-white">
                  <SelectValue>
                    {(value) =>
                      value === 'active'
                        ? 'Aktif üyeler'
                        : value === 'inactive'
                          ? 'Pasif üyeler'
                          : 'Tüm durumlar'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="panel-light-theme rounded-none bg-white text-[#17382b]">
                  <SelectItem value="active">Aktif üyeler</SelectItem>
                  <SelectItem value="inactive">Pasif üyeler</SelectItem>
                  <SelectItem value="all">Tüm durumlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader className="bg-[#f1f6f3]">
                  <TableRow>
                    <TableHead className="px-5">Üye</TableHead>
                    <TableHead>Departman</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Özel yetki</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Son değişiklik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const department = snapshot.departments.find(
                      (option) => option.id === member.department,
                    );
                    return (
                      <TableRow
                        key={member.email}
                        className="cursor-pointer"
                        tabIndex={0}
                        onClick={() => setSelectedEmail(member.email)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedEmail(member.email);
                          }
                        }}
                      >
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-9 shrink-0 place-items-center bg-[#e5f5ed] text-xs font-extrabold text-[#087244]">
                              {initials(member.name || member.email)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#17382b]">
                                {member.name || 'İsimsiz üye'}
                              </p>
                              <p className="mt-1 text-xs text-[#718078]">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{department?.name ?? 'Atanmamış'}</TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-none ${roleBadgeClass(member.role)}`}
                          >
                            {roleLabels[member.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.specialRoles.includes(
                            'sponsorship_delegate',
                          ) ? (
                            <span className="font-semibold text-[#087244]">
                              Sponsorluk
                            </span>
                          ) : (
                            <span className="text-[#89958f]">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <MemberStatus member={member} />
                        </TableCell>
                        <TableCell className="text-right text-xs text-[#718078]">
                          {formatDate(member.updatedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {!filteredMembers.length ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto size-8 text-[#9aaba2]" />
                <p className="mt-3 font-semibold text-[#40554b]">
                  Bu filtrede üye bulunamadı.
                </p>
                <p className="mt-1 text-sm text-[#718078]">
                  Arama veya filtreleri değiştirin.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="h-fit rounded-none border-[#dbe6e0] bg-white shadow-none">
          <CardHeader className="border-b border-[#e4ece8]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-xl font-extrabold">
                  Son yetki işlemleri
                </CardTitle>
                <CardDescription className="mt-1 leading-5 text-[#617169]">
                  Önce ve sonra kayıtlarıyla denetim geçmişi.
                </CardDescription>
              </div>
              <Activity className="size-5 text-[#00a85d]" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {snapshot.audit.length ? (
              <ol className="divide-y divide-[#e6ece9]">
                {snapshot.audit.slice(0, 15).map((audit) => (
                  <li key={audit.id}>
                    <button
                      type="button"
                      aria-label={`${auditLabels[audit.action]}: ${audit.memberEmail}`}
                      className="w-full px-5 py-4 text-left hover:bg-[#f5f9f7]"
                      onClick={() => setSelectedAuditId(audit.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid size-8 shrink-0 place-items-center bg-[#edf5f1] text-[#087244]">
                          <Clock3 className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#17382b]">
                            {auditLabels[audit.action]}
                          </p>
                          <p className="mt-1 truncate text-xs text-[#617169]">
                            {audit.memberEmail}
                          </p>
                          <p className="mt-1 text-xs text-[#89958f]">
                            {formatDate(audit.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-[#718078]">
                Henüz yetki değişikliği kaydı yok.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MemberDetail
        member={selectedMember}
        snapshot={snapshot}
        onClose={() => setSelectedEmail(null)}
        onEdit={() => selectedMember && setEditor(selectedMember)}
        onStatus={() => selectedMember && setStatusTarget(selectedMember)}
      />
      <AuditDetail
        audit={selectedAudit}
        snapshot={snapshot}
        onClose={() => setSelectedAuditId(null)}
      />
      {editor ? (
        <MemberEditor
          member={editMember}
          snapshot={snapshot}
          saving={saving}
          onClose={() => setEditor(null)}
          onSave={saveMember}
        />
      ) : null}
      <AlertDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
      >
        <AlertDialogContent className="panel-light-theme rounded-none bg-white text-[#071a13]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-extrabold">
              {statusTarget?.active
                ? 'Üyeyi pasifleştir?'
                : 'Üyeyi yeniden etkinleştir?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6 text-[#617169]">
              {statusTarget?.active
                ? `${statusTarget.name || statusTarget.email} panel erişimini kaybeder; geçmiş kayıtları silinmez.`
                : `${statusTarget?.name || statusTarget?.email} mevcut rolü ve departmanıyla yeniden erişim kazanır.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              className={`rounded-none ${
                statusTarget?.active
                  ? 'bg-[#b42318] text-white hover:bg-[#941f15]'
                  : 'bg-[#00a85d] text-[#061c14] hover:bg-[#12bd70]'
              }`}
              onClick={(event) => {
                event.preventDefault();
                if (statusTarget) void changeStatus(statusTarget);
              }}
            >
              {saving ? <Loader2 className="animate-spin" /> : null}
              {statusTarget?.active ? 'Pasifleştir' : 'Etkinleştir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
