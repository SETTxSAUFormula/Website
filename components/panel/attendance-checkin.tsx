'use client';

import {
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  QrCode,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Link from '@/components/site-link';
import { Button } from '@/components/ui/button';

type CheckinState =
  | { kind: 'loading'; message: string }
  | {
      kind: 'success';
      message: string;
      eventTitle: string;
      checkedInAt: number;
      attendanceStatus: 'present' | 'late';
    }
  | { kind: 'login'; message: string }
  | { kind: 'error'; message: string };

function formatCheckinTime(value: number) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AttendanceCheckin({ token }: { token: string }) {
  const requested = useRef(false);
  const [state, setState] = useState<CheckinState>(() =>
    token
      ? { kind: 'loading', message: 'QR kodu doğrulanıyor…' }
      : { kind: 'error', message: 'QR kodu eksik veya geçersiz.' },
  );

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    if (!token) return;

    const checkIn = async () => {
      try {
        const response = await fetch('/api/panel/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ type: 'checkin', token }),
        });
        const result = (await response.json()) as {
          ok?: boolean;
          error?: string;
          event?: { title?: string };
          attendance?: {
            status?: 'present' | 'late';
            checkedInAt?: number;
            alreadyRecorded?: boolean;
          };
        };
        if (response.status === 401) {
          setState({
            kind: 'login',
            message:
              'Oturumun kapalı. Google ile giriş yaptıktan sonra güncel QR kodunu yeniden tara.',
          });
          return;
        }
        if (!response.ok || !result.ok) {
          setState({
            kind: 'error',
            message: result.error ?? 'Katılım kaydedilemedi.',
          });
          return;
        }
        const attendanceStatus =
          result.attendance?.status === 'late' ? 'late' : 'present';
        setState({
          kind: 'success',
          message: result.attendance?.alreadyRecorded
            ? 'Katılımın daha önce kaydedilmiş.'
            : attendanceStatus === 'late'
              ? 'Katılımın geç katılım olarak kaydedildi.'
              : 'Katılımın başarıyla kaydedildi.',
          eventTitle: result.event?.title ?? 'Etkinlik',
          checkedInAt: result.attendance?.checkedInAt ?? Date.now(),
          attendanceStatus,
        });
      } catch {
        setState({
          kind: 'error',
          message: 'Bağlantı kurulamadı. Güncel QR kodunu yeniden tara.',
        });
      }
    };

    void checkIn();
  }, [token]);

  const Icon =
    state.kind === 'success'
      ? CheckCircle2
      : state.kind === 'loading'
        ? Loader2
        : state.kind === 'login'
          ? LogIn
          : TriangleAlert;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#03110d] px-5 py-12 text-[#eef5f1]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,226,123,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,226,123,0.05)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <section className="relative w-full max-w-lg border border-[#214237] bg-[#071b14] p-7 shadow-2xl shadow-black/35 sm:p-10">
        <div
          className={`flex size-12 items-center justify-center border ${
            state.kind === 'error'
              ? 'border-[#d13b39]/50 bg-[#d13b39]/10 text-[#ffaaa5]'
              : 'border-[#00e27b]/35 bg-[#00e27b]/10 text-[#00e27b]'
          }`}
        >
          <Icon
            className={`size-6 ${state.kind === 'loading' ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </div>
        <p className="mt-7 font-heading text-sm font-extrabold uppercase tracking-[0.16em] text-[#00e27b]">
          SAUFormula · QR Yoklama
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          {state.kind === 'success'
            ? state.eventTitle
            : state.kind === 'loading'
              ? 'Katılım doğrulanıyor'
              : 'Katılım kaydedilemedi'}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#b7c6be]">
          {state.message}
        </p>

        {state.kind === 'success' ? (
          <div className="mt-6 grid gap-3 border border-[#214237] bg-[#03110d]/45 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#73867c]">
                Durum
              </p>
              <p className="mt-2 font-bold text-[#bff9d9]">
                {state.attendanceStatus === 'late' ? 'Geç katıldı' : 'Katıldı'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#73867c]">
                Kayıt zamanı
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {formatCheckinTime(state.checkedInAt)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {state.kind === 'login' ? (
            <Button
              render={<Link href="/panel/giris" />}
              className="h-11 rounded-none bg-[#00e27b] px-5 font-bold text-[#03110d] hover:bg-[#14ef8b]"
            >
              <LogIn className="size-4" aria-hidden="true" />
              Google ile giriş yap
            </Button>
          ) : null}
          <Button
            render={<Link href="/panel" />}
            variant="outline"
            className="h-11 rounded-none border-[#3c5b4f] bg-transparent px-5 text-[#bff9d9] hover:bg-white/5 hover:text-white"
          >
            <QrCode className="size-4" aria-hidden="true" />
            Üye paneline dön
          </Button>
        </div>
        {state.kind !== 'success' ? (
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#73867c]">
            <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Güvenlik nedeniyle QR kodları kısa sürede yenilenir. Eski ekran
            görüntüleriyle katılım verilemez.
          </p>
        ) : null}
      </section>
    </main>
  );
}
