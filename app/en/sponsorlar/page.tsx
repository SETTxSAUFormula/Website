import type { Metadata } from 'next';

import { SponsorsPageContent } from '@/app/sponsorlar/page';

export const metadata: Metadata = {
  title: 'Sponsors',
  description: 'SAUFormula supporters and long-term sponsorship opportunities.',
  alternates: { canonical: '/en/sponsorlar', languages: { 'tr-TR': '/sponsorlar', 'en-US': '/en/sponsorlar' } },
};

export default function EnglishSponsorsPage() {
  return <SponsorsPageContent language="en" />;
}
