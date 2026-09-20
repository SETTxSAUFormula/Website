import type { Metadata } from 'next';

import { ApplicationAdmin } from '@/components/application-admin';
import { MemberPanelPage } from '@/components/panel/member-panel-page';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Takım Başvuruları Yönetimi',
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelApplicationsPage() {
  return (
    <MemberPanelPage
      authentication="session"
      requiredPermission="applications.manage"
    >
      <ApplicationAdmin authentication="session" />
    </MemberPanelPage>
  );
}
