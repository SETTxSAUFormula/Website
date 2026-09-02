import type { Metadata } from 'next';

import { HomePageContent } from '@/app/page';

export const metadata: Metadata = {
  title: 'Formula Student Team',
  description: 'SAUFormula is Sakarya University’s student-led Formula Student engineering team.',
  alternates: { canonical: '/en', languages: { 'tr-TR': '/', 'en-US': '/en' } },
};

export default function EnglishHomePage() {
  return <HomePageContent language="en" />;
}
