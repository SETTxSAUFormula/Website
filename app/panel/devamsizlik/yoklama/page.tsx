import type { Metadata } from 'next';

import { AttendanceCheckin } from '@/components/panel/attendance-checkin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'QR Yoklama',
  description: 'SAUFormula etkinlik katılım doğrulaması.',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AttendanceCheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.t) ? params.t[0] : (params.t ?? '');
  return <AttendanceCheckin token={token.slice(0, 300)} />;
}
