import type { Metadata } from 'next';

import { MediaPageContent } from '@/app/medya/page';

export const metadata: Metadata = {
  title: 'Media',
  description: 'Photographs of the SAUFormula team, ADA-02 and our work on track.',
  alternates: { canonical: '/en/medya', languages: { 'tr-TR': '/medya', 'en-US': '/en/medya' } },
};

export default function EnglishMediaPage() {
  return <MediaPageContent language="en" />;
}
