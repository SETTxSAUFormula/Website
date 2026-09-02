import type { Metadata } from 'next';

import { AboutPageContent } from '@/app/hakkimizda/page';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'SAUFormula’s engineering culture, partnership with SETT, vision and mission.',
  alternates: { canonical: '/en/hakkimizda', languages: { 'tr-TR': '/hakkimizda', 'en-US': '/en/hakkimizda' } },
};

export default function EnglishAboutPage() {
  return <AboutPageContent language="en" />;
}
