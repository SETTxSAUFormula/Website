import type { Metadata } from 'next';

import { ContactPageContent } from '@/app/iletisim/page';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact details, social media and campus location for SAUFormula.',
  alternates: { canonical: '/en/iletisim', languages: { 'tr-TR': '/iletisim', 'en-US': '/en/iletisim' } },
};

export default function EnglishContactPage() {
  return <ContactPageContent language="en" />;
}
