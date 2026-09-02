import type { Metadata } from 'next';

import { TeamsPageContent } from '@/app/takimlar/page';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'The SAUFormula 2026 team, departments and team members.',
  alternates: { canonical: '/en/takimlar', languages: { 'tr-TR': '/takimlar', 'en-US': '/en/takimlar' } },
};

export default function EnglishTeamsPage() {
  return <TeamsPageContent language="en" />;
}
