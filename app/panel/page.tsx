import type { Metadata } from 'next';

import { MemberPanelPage } from '@/components/panel/member-panel-page';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Üye Paneli',
  description: 'SAUFormula takım operasyonları için korumalı üye paneli.',
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelPage() {
  return <MemberPanelPage authentication="session" />;
}
