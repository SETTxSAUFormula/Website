import type { Metadata } from 'next';

import { PrivacyPageContent } from '@/app/gizlilik/page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SAUFormula website privacy policy: information about data processing, retention, security and analytics.',
  alternates: { canonical: '/en/gizlilik', languages: { 'tr-TR': '/gizlilik', 'en-US': '/en/gizlilik' } },
};

export default function EnglishPrivacyPage() {
  return <PrivacyPageContent language="en" />;
}
