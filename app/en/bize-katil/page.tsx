import type { Metadata } from 'next';

import { JoinPageContent } from '@/app/bize-katil/page';

export const metadata: Metadata = {
  title: 'Join Us',
  description: 'Apply to join SAUFormula and explore the team’s technical and organisational departments.',
  alternates: { canonical: '/en/bize-katil', languages: { 'tr-TR': '/bize-katil', 'en-US': '/en/bize-katil' } },
};

export default function EnglishJoinPage() {
  return <JoinPageContent language="en" />;
}
