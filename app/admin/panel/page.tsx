import type { Metadata } from 'next';
import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';

import { MemberPanelShell } from '@/components/member-panel-shell';
import Link from '@/components/site-link';
import {
  eventOverlapsRange,
  getCurrentIstanbulCalendarGridRange,
  getUpcomingIstanbulCalendarRange,
} from '@/lib/calendar-range';
import {
  isGoogleCalendarConfigured,
  listTeamCalendarEvents,
  type TeamCalendarEvent,
  type GoogleCalendarEnv,
} from '@/lib/google-calendar';
import {
  isLocalPanelHostname,
  resolveActivePanelUser,
  type PanelAccessEnv,
} from '@/lib/panel-access';
import {
  getPanelPermissions,
  getPanelRoleLabel,
} from '@/lib/panel-authorization';
import { listTurkeyHolidayEvents } from '@/lib/turkey-holidays';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Üye Paneli',
  description: 'SAUFormula takım operasyonları için korumalı üye paneli.',
  robots: { index: false, follow: false, nocache: true },
};

export default async function MemberPanelPage() {
  const requestHeaders = await headers();
  const hostname = (requestHeaders.get('host') ?? '').split(':')[0];
  const accessEmail = requestHeaders
    .get('cf-access-authenticated-user-email')
    ?.trim()
    .toLowerCase();
  const viewerEmail =
    accessEmail ||
    (isLocalPanelHostname(hostname) ? 'admin@sauformula.org' : '');
  const runtimeEnv = env as unknown as GoogleCalendarEnv & PanelAccessEnv;
  const viewer = await resolveActivePanelUser(viewerEmail, runtimeEnv);

  if (!viewer) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef3f0] px-5 text-[#071a13]">
        <section className="w-full max-w-xl border border-[#cbd9d2] bg-white p-8 shadow-sm sm:p-10">
          <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-[#087347]">
            SAUFormula Üye Paneli
          </p>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
            Panel erişimi bulunamadı
          </h1>
          <p className="mt-4 text-base leading-7 text-[#5b6b63]">
            Giriş yaptığın e-posta aktif üye listesinde bulunmuyor veya üyeliğin
            pasif durumda. Takım lideri ya da sistem yöneticisiyle iletişime
            geç.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center border border-[#0a7d4b] bg-[#00e27b] px-5 text-sm font-bold text-[#061c14] transition-colors hover:bg-[#14ef8b]"
          >
            Siteye dön
          </Link>
        </section>
      </main>
    );
  }
  const calendarConfigured = isGoogleCalendarConfigured(runtimeEnv);
  let initialCalendarEvents: TeamCalendarEvent[] = [];
  let initialUpcomingEvents: TeamCalendarEvent[] = [];
  let initialCalendarLoaded = false;

  if (calendarConfigured) {
    try {
      const range = getCurrentIstanbulCalendarGridRange();
      const upcomingRange = getUpcomingIstanbulCalendarRange();
      const preloadRange = { start: range.start, end: upcomingRange.end };
      const [teamEvents, holidays] = await Promise.all([
        listTeamCalendarEvents(runtimeEnv, preloadRange),
        listTurkeyHolidayEvents(preloadRange),
      ]);
      const events = [...teamEvents, ...holidays].sort(
        (left, right) => Date.parse(left.start) - Date.parse(right.start),
      );
      initialCalendarEvents = events.filter((event) =>
        eventOverlapsRange(event, range),
      );
      initialUpcomingEvents = events.filter(
        (event) =>
          event.source === 'team' && eventOverlapsRange(event, upcomingRange),
      );
      initialCalendarLoaded = true;
    } catch (error) {
      console.error('Initial calendar load failed', error);
    }
  }

  return (
    <MemberPanelShell
      viewerEmail={viewer.email}
      viewerRole={getPanelRoleLabel(viewer.role)}
      permissions={getPanelPermissions(viewer)}
      calendarConfigured={calendarConfigured}
      initialCalendarEvents={initialCalendarEvents}
      initialCalendarLoaded={initialCalendarLoaded}
      initialUpcomingEvents={initialUpcomingEvents}
    />
  );
}
