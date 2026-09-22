'use client';

import Image from 'next/image';
import QRCode from 'qrcode';
import {
  CalendarPlus,
  Clock3,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  ShieldCheck,
  TimerOff,
  Trash2,
  TriangleAlert,
  UserCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import type {
  AttendanceEventView,
  AttendanceSnapshot,
} from '@/lib/panel-attendance';
import { panelApiPath } from '@/lib/panel-client-routes';

type EventForm = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  durationMinutes: string;
  lateAfterMinutes: string;
};

function defaultStartValue() {
  const date = new Date(Date.now() + 30 * 60_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function emptyForm(): EventForm {
  return {
    title: '',
    description: '',
    location: '',
    startsAt: defaultStartValue(),
    durationMinutes: '60',
    lateAfterMinutes: '10',
  };
}

function formatDateTime(value: number) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

async function fetchAttendanceSnapshot() {
  const response = await fetch(panelApiPath('attendance'), {
    cache: 'no-store',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  const result = (await response.json()) as {
    ok?: boolean;
    error?: string;
    snapshot?: AttendanceSnapshot;
  };
  if (!response.ok || !result.ok || !result.snapshot)
    throw new Error(result.error ?? 'Devamsızlık kayıtları alınamadı.');
  return result.snapshot;
}

async function attendanceMutation(payload: Record<string, unknown>) {
  const response = await fetch(panelApiPath('attendance'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as {
    ok?: boolean;
    error?: string;
    checkInUrl?: string;
  };
  if (!response.ok || !result.ok)
    throw new Error(result.error ?? 'İşlem tamamlanamadı.');
  return result;
}

function eventStatus(event: AttendanceEventView) {
  if (event.viewerAttendance?.status === 'late')
    return {
      label: 'Geç katıldın',
      className: 'border-amber-300 bg-amber-50 text-amber-800',
    };
  if (event.viewerAttendance)
    return {
      label: 'Katıldın',
      className: 'border-[#8fd4b1] bg-[#e9f8f0] text-[#087347]',
    };
  if (event.status === 'closed')
    return {
      label: 'Katılmadın',
      className: 'border-[#e6b6b2] bg-[#fff0ee] text-[#95362d]',
    };
  if (event.status === 'open')
    return {
      label: 'Yoklama açık',
      className: 'border-[#8fd4b1] bg-[#e9f8f0] text-[#087347]',
    };
  return {
    label: 'Planlandı',
    className: 'border-[#cbd9d2] bg-[#f2f6f4] text-[#586961]',
  };
}

export function AttendanceWorkspace({ canManage }: { canManage: boolean }) {
  const [snapshot, setSnapshot] = useState<AttendanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] =
    useState<AttendanceEventView | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [qrEventId, setQrEventId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [clock, setClock] = useState(() => Date.now());

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const next = await fetchAttendanceSnapshot();
      setSnapshot(next);
      setError('');
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Devamsızlık kayıtları alınamadı.',
      );
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  const qrEvent = useMemo(
    () => snapshot?.events.find((event) => event.id === qrEventId) ?? null,
    [qrEventId, snapshot?.events],
  );

  const refreshQr = useCallback(async () => {
    if (!qrEventId) return;
    try {
      const result = await attendanceMutation({
        type: 'qr_token',
        eventId: qrEventId,
      });
      if (!result.checkInUrl) throw new Error('QR bağlantısı oluşturulamadı.');
      const image = await QRCode.toDataURL(result.checkInUrl, {
        width: 560,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#03110d', light: '#ffffff' },
      });
      setQrDataUrl(image);
      setQrError('');
    } catch (nextError) {
      setQrError(
        nextError instanceof Error
          ? nextError.message
          : 'QR kodu yenilenemedi.',
      );
    }
  }, [qrEventId]);

  useEffect(() => {
    if (!qrEventId) return;
    queueMicrotask(() => void refreshQr());
    const qrTimer = window.setInterval(() => void refreshQr(), 5_000);
    const dataTimer = window.setInterval(() => void refresh(true), 5_000);
    const clockTimer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      window.clearInterval(qrTimer);
      window.clearInterval(dataTimer);
      window.clearInterval(clockTimer);
    };
  }, [qrEventId, refresh, refreshQr]);

  const submitEvent = async () => {
    const startsAt = new Date(form.startsAt).getTime();
    const durationMinutes = Number(form.durationMinutes);
    const lateAfterMinutes = Number(form.lateAfterMinutes);
    if (
      !form.title.trim() ||
      !Number.isFinite(startsAt) ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 15
    ) {
      setError('Etkinlik adı, tarih ve en az 15 dakikalık süre gereklidir.');
      return;
    }
    setBusy(true);
    try {
      await attendanceMutation({
        type: 'create',
        title: form.title,
        description: form.description,
        location: form.location,
        startsAt,
        endsAt: startsAt + durationMinutes * 60_000,
        lateAfterMinutes,
      });
      setCreateOpen(false);
      setForm(emptyForm());
      await refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Etkinlik oluşturulamadı.',
      );
    } finally {
      setBusy(false);
    }
  };

  const openQr = async (event: AttendanceEventView) => {
    setBusy(true);
    try {
      if (event.status === 'scheduled')
        await attendanceMutation({ type: 'open', eventId: event.id });
      await refresh(true);
      setQrDataUrl('');
      setQrError('');
      setQrEventId(event.id);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Yoklama açılamadı.',
      );
    } finally {
      setBusy(false);
    }
  };

  const closeQr = async () => {
    if (!qrEventId) return;
    setBusy(true);
    try {
      await attendanceMutation({ type: 'close', eventId: qrEventId });
      setQrEventId(null);
      setQrDataUrl('');
      await refresh();
    } catch (nextError) {
      setQrError(
        nextError instanceof Error
          ? nextError.message
          : 'Yoklama kapatılamadı.',
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteEvent = async () => {
    if (!deleteCandidate) return;
    const eventId = deleteCandidate.id;
    setBusy(true);
    try {
      await attendanceMutation({ type: 'delete', eventId });
      if (qrEventId === eventId) {
        setQrEventId(null);
        setQrDataUrl('');
      }
      setDeleteCandidate(null);
      await refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : 'Etkinlik silinemedi.',
      );
    } finally {
      setBusy(false);
    }
  };

  const secondsToRefresh = 15 - (Math.floor(clock / 1_000) % 15);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-none bg-[#dff8eb] text-[#087244]">
              Dinamik QR
            </Badge>
            <Badge
              variant="outline"
              className="rounded-none border-[#cbd9d2] bg-white text-[#53655c]"
            >
              15 saniyede yenilenir
            </Badge>
          </div>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-[#071a13] sm:text-5xl">
            Devamsızlık
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5b6b63]">
            Etkinlik bazlı katılım durumunu ve toplam katılım oranını burada
            görebilirsin. Katılım yalnızca etkinlik sırasında gösterilen güncel
            QR koduyla kaydedilir.
          </p>
        </div>
        {canManage ? (
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-11 shrink-0 rounded-none bg-[#00e27b] px-5 font-extrabold text-[#03110d] hover:bg-[#14ef8b]"
          >
            <CalendarPlus className="size-5" aria-hidden="true" />
            Etkinlik oluştur
          </Button>
        ) : null}
      </div>

      {error ? (
        <div
          className="flex items-start gap-3 border border-[#e6b6b2] bg-[#fff0ee] p-4 text-sm text-[#8b3029]"
          role="alert"
        >
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-none border-[#dbe6e0] bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6a7a72]">
                Katılımın
              </p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-[#071a13]">
                {snapshot?.summary.attended ?? 0}/{snapshot?.summary.total ?? 0}
              </p>
            </div>
            <UserCheck className="size-8 text-[#0a8f56]" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card className="rounded-none border-[#dbe6e0] bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6a7a72]">
                Geç katılım
              </p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-[#071a13]">
                {snapshot?.summary.late ?? 0}
              </p>
            </div>
            <Clock3 className="size-8 text-[#b98516]" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card className="rounded-none border-[#dbe6e0] bg-[#071b14] text-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                Kayıt yöntemi
              </p>
              <p className="mt-2 font-heading text-lg font-extrabold text-[#bff9d9]">
                Yalnızca QR
              </p>
            </div>
            <QrCode className="size-8 text-[#00e27b]" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-[#dbe6e0] bg-white shadow-sm">
        <CardHeader className="border-b border-[#e4ece8]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-extrabold text-[#071a13]">
                Etkinlikler
              </CardTitle>
              <CardDescription className="mt-1 text-[#64736c]">
                Açık, planlanan ve tamamlanan yoklamalar
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded-none border-[#b8c9c0]"
            >
              <RefreshCw
                className={`size-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && !snapshot ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-[#617168]">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Kayıtlar yükleniyor…
            </div>
          ) : snapshot?.events.length ? (
            <div className="divide-y divide-[#e4ece8]">
              {snapshot.events.map((event) => {
                const status = eventStatus(event);
                return (
                  <article key={event.id} className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`rounded-none ${status.className}`}
                          >
                            {status.label}
                          </Badge>
                          {event.status === 'open' ? (
                            <Badge className="rounded-none bg-[#071b14] text-[#bff9d9]">
                              Canlı
                            </Badge>
                          ) : null}
                        </div>
                        <h2 className="mt-3 font-heading text-xl font-extrabold text-[#071a13]">
                          {event.title}
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c6d64]">
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="size-4" aria-hidden="true" />
                            {formatDateTime(event.startsAt)} –{' '}
                            {formatTime(event.endsAt)}
                          </span>
                          {event.location ? (
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="size-4" aria-hidden="true" />
                              {event.location}
                            </span>
                          ) : null}
                        </div>
                        {event.description ? (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64736c]">
                            {event.description}
                          </p>
                        ) : null}
                        {event.viewerAttendance ? (
                          <p className="mt-3 text-xs font-semibold text-[#4f665b]">
                            Kayıt:{' '}
                            {formatDateTime(event.viewerAttendance.checkedInAt)}
                          </p>
                        ) : null}
                      </div>

                      {canManage ? (
                        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
                          <div className="border border-[#dbe6e0] bg-[#f7faf8] px-4 py-3 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6a7a72]">
                              Katılım
                            </p>
                            <p className="mt-1 font-heading text-xl font-extrabold text-[#0a7d4b]">
                              {event.attendanceCount}/{event.totalMembers}
                            </p>
                          </div>
                          {event.status !== 'closed' ? (
                            <Button
                              onClick={() => void openQr(event)}
                              disabled={busy}
                              className="h-10 rounded-none bg-[#071b14] px-4 font-bold text-[#bff9d9] hover:bg-[#0d2a20]"
                            >
                              <QrCode className="size-4" aria-hidden="true" />
                              {event.status === 'open'
                                ? 'QR ekranını aç'
                                : 'QR yoklamayı aç'}
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            onClick={() => setDeleteCandidate(event)}
                            disabled={busy}
                            className="h-10 rounded-none border-[#d9a8a3] px-4 font-bold text-[#a3322b] hover:bg-[#fff0ee] hover:text-[#8d2923]"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Etkinliği sil
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    {canManage && event.attendees?.length ? (
                      <details className="mt-5 border-t border-[#e4ece8] pt-4">
                        <summary className="cursor-pointer text-sm font-bold text-[#0a7d4b]">
                          Katılanları göster ({event.attendees.length})
                        </summary>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {event.attendees.map((attendee) => (
                            <div
                              key={attendee.memberEmail}
                              className="flex items-center justify-between gap-3 border border-[#e0e9e4] bg-[#f8fbf9] px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#1a3329]">
                                  {attendee.memberName}
                                </p>
                                <p className="truncate text-xs text-[#75857d]">
                                  {formatTime(attendee.checkedInAt)}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`rounded-none ${
                                  attendee.status === 'late'
                                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                                    : 'border-[#8fd4b1] bg-[#e9f8f0] text-[#087347]'
                                }`}
                              >
                                {attendee.status === 'late' ? 'Geç' : 'Katıldı'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center px-6 text-center">
              <div>
                <QrCode
                  className="mx-auto size-9 text-[#7b8c83]"
                  aria-hidden="true"
                />
                <p className="mt-4 font-bold text-[#243a31]">
                  Henüz yoklama etkinliği yok
                </p>
                <p className="mt-2 text-sm text-[#6b7a72]">
                  {canManage
                    ? 'İlk etkinliği oluşturarak dinamik QR yoklamayı başlatabilirsin.'
                    : 'Oluşturulan etkinlikler burada görünecek.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleteCandidate(null);
        }}
      >
        <AlertDialogContent className="panel-light-theme rounded-none bg-white text-[#071a13] ring-[#d9a8a3]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-extrabold">
              Etkinlik silinsin mi?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6 text-[#617169]">
              <strong className="text-[#263b32]">
                {deleteCandidate?.title}
              </strong>{' '}
              etkinliği ve bu etkinliğe ait tüm katılım kayıtları kalıcı olarak
              silinecek.
              {deleteCandidate?.status === 'open'
                ? ' Açık QR kodu da hemen geçersiz olacak.'
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-none bg-[#f7faf8]">
            <AlertDialogCancel disabled={busy} className="rounded-none">
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void deleteEvent()}
              disabled={busy}
              className="rounded-none bg-[#d13b39] font-bold text-white hover:bg-[#b52f2d]"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Kalıcı olarak sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="panel-light-theme rounded-none border-[#cbd9d2] bg-white text-[#071a13] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-extrabold">
              Yoklama etkinliği oluştur
            </DialogTitle>
            <DialogDescription className="text-[#63736b]">
              Etkinlik takvime eklenmez; yalnızca devamsızlık sayfasında yer
              alır.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="attendance-title">Etkinlik adı</Label>
              <Input
                id="attendance-title"
                value={form.title}
                maxLength={160}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Örn. Haftalık takım toplantısı"
                className="rounded-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="attendance-start">Tarih ve saat</Label>
                <Input
                  id="attendance-start"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startsAt: event.target.value,
                    }))
                  }
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attendance-duration">Süre (dakika)</Label>
                <Input
                  id="attendance-duration"
                  type="number"
                  min={15}
                  max={720}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      durationMinutes: event.target.value,
                    }))
                  }
                  className="rounded-none"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="attendance-location">Konum</Label>
                <Input
                  id="attendance-location"
                  value={form.location}
                  maxLength={300}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Atölye, toplantı salonu…"
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attendance-late">Geç kalma sınırı (dk.)</Label>
                <Input
                  id="attendance-late"
                  type="number"
                  min={0}
                  max={180}
                  value={form.lateAfterMinutes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      lateAfterMinutes: event.target.value,
                    }))
                  }
                  className="rounded-none"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attendance-description">Açıklama</Label>
              <Textarea
                id="attendance-description"
                value={form.description}
                maxLength={2_000}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Toplantının amacı veya kısa not…"
                className="min-h-24 rounded-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={busy}
              className="rounded-none"
            >
              Vazgeç
            </Button>
            <Button
              onClick={() => void submitEvent()}
              disabled={busy}
              className="rounded-none bg-[#00e27b] font-bold text-[#03110d] hover:bg-[#14ef8b]"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Etkinliği oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(qrEventId)}
        onOpenChange={(open) => {
          if (!open) {
            setQrEventId(null);
            setQrDataUrl('');
          }
        }}
      >
        <DialogContent className="panel-light-theme rounded-none border-[#cbd9d2] bg-white text-[#071a13] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-extrabold">
              {qrEvent?.title ?? 'QR yoklama'}
            </DialogTitle>
            <DialogDescription className="text-[#63736b]">
              Üyeler telefon kamerasıyla ekrandaki güncel kodu tarar. Panelde
              ayrıca katılım düğmesi bulunmaz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2 md:grid-cols-[1fr_220px] md:items-center">
            <div className="grid min-h-80 place-items-center border-8 border-[#071b14] bg-white p-3">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`${qrEvent?.title ?? 'Etkinlik'} için dinamik yoklama QR kodu`}
                  width={560}
                  height={560}
                  unoptimized
                  className="aspect-square w-full max-w-80"
                />
              ) : qrError ? (
                <div className="px-4 text-center text-sm font-semibold text-[#95362d]">
                  <TriangleAlert
                    className="mx-auto mb-3 size-7"
                    aria-hidden="true"
                  />
                  {qrError}
                </div>
              ) : (
                <Loader2 className="size-8 animate-spin text-[#0a7d4b]" />
              )}
            </div>
            <div className="space-y-4">
              <div className="border border-[#dbe6e0] bg-[#f7faf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6a7a72]">
                  Canlı katılım
                </p>
                <p className="mt-2 font-heading text-3xl font-extrabold text-[#0a7d4b]">
                  {qrEvent?.attendanceCount ?? 0}/{qrEvent?.totalMembers ?? 0}
                </p>
              </div>
              <div className="border border-[#dbe6e0] bg-[#f7faf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6a7a72]">
                  QR yenileme
                </p>
                <p className="mt-2 flex items-center gap-2 font-bold text-[#243a31]">
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {secondsToRefresh} saniye
                </p>
              </div>
              <div className="flex gap-3 border border-[#b9dcca] bg-[#eefaf4] p-4 text-sm leading-6 text-[#245b43]">
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                Eski QR görüntüleri en geç 30 saniye içinde geçersiz olur.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => void refreshQr()}
              disabled={busy}
              className="rounded-none"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Şimdi yenile
            </Button>
            <Button
              onClick={() => void closeQr()}
              disabled={busy}
              className="rounded-none bg-[#d13b39] font-bold text-white hover:bg-[#b52f2d]"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <TimerOff className="size-4" aria-hidden="true" />
              )}
              Yoklamayı kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
