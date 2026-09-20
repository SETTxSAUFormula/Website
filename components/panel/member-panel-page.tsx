import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

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
  type GoogleCalendarEnv,
  type TeamCalendarEvent,
} from '@/lib/google-calendar';
import {
  authorizePanelRequest,
  isLocalPanelHostname,
  resolveActivePanelUser,
  type PanelAccessEnv,
} from '@/lib/panel-access';
import {
  getPanelPermissions,
  getPanelRoleLabel,
  hasPanelPermission,
  type PanelPermission,
} from '@/lib/panel-authorization';
import { listTurkeyHolidayEvents } from '@/lib/turkey-holidays';

type PanelAuthentication = 'access' | 'session';

function MissingPanelAccess({ authentication }: { authentication: PanelAuthentication }) {
  const sessionLogin = authentication === 'session';
  return (
    <main className="grid min-h-screen place-items-center bg-[#eef3f0] px-5 text-[#071a13]">
      <section className="w-full max-w-xl border border-[#cbd9d2] bg-white p-8 shadow-sm sm:p-10">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-[#087347]">
          SAUFormula Üye Paneli
        </p>
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
          {sessionLogin ? 'Oturum açman gerekiyor' : 'Panel erişimi bulunamadı'}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#5b6b63]">
          {sessionLogin
            ? 'Yalnızca aktif üye listesinde bulunan Google hesapları panele erişebilir.'
            : 'Giriş yaptığın e-posta aktif üye listesinde bulunmuyor veya üyeliğin pasif durumda. Takım lideri ya da sistem yöneticisiyle iletişime geç.'}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {sessionLogin ? (
            <Link
              href="/panel/giris"
              className="inline-flex h-11 items-center border border-[#0a7d4b] bg-[#00e27b] px-5 text-sm font-bold text-[#061c14] transition-colors hover:bg-[#14ef8b]"
            >
              Google ile giriş yap
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-flex h-11 items-center border border-[#9eb2a8] px-5 text-sm font-bold text-[#183d30] transition-colors hover:bg-[#edf4f0]"
          >
            Siteye dön
          </Link>
        </div>
      </section>
    </main>
  );
}

export async function MemberPanelPage({
  authentication,
  children,
  requiredPermission,
}: {
  authentication: PanelAuthentication;
  children?: ReactNode;
  requiredPermission?: PanelPermission;
}) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const hostname = host.split(':')[0];
  const runtimeEnv = env as unknown as GoogleCalendarEnv & PanelAccessEnv;

  const viewer =
    authentication === 'access'
      ? await resolveActivePanelUser(
          requestHeaders
            .get('cf-access-authenticated-user-email')
            ?.trim()
            .toLowerCase() ||
            (isLocalPanelHostname(hostname) ? 'admin@sauformula.org' : ''),
          runtimeEnv,
        )
      : await authorizePanelRequest(
          new Request(
            `${requestHeaders.get('x-forwarded-proto') ?? (isLocalPanelHostname(hostname) ? 'http' : 'https')}://${host || 'localhost'}/panel`,
            { headers: requestHeaders },
          ),
          runtimeEnv,
        );

  if (
    !viewer ||
    (requiredPermission && !hasPanelPermission(viewer, requiredPermission))
  )
    return <MissingPanelAccess authentication={authentication} />;

  if (children) return children;

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
      authentication={authentication}
    />
  );
}
