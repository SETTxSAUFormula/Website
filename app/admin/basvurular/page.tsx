import type { Metadata } from 'next';

import { ApplicationAdmin } from '@/components/application-admin';

export const metadata: Metadata = {
  title: 'Takım Başvuruları Yönetimi',
  robots: { index: false, follow: false, nocache: true },
};

export default function ApplicationAdminPage() {
  return <ApplicationAdmin />;
}
