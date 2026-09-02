import type { Metadata } from 'next';

import { VehiclesPageContent } from '@/app/araclar/page';

export const metadata: Metadata = {
  title: 'Our Cars · From 2007 to ADA-02',
  description: 'The engineering heritage of SETT and SAUFormula, from Hidrokartal to ADA-02.',
  alternates: { canonical: '/en/araclar', languages: { 'tr-TR': '/araclar', 'en-US': '/en/araclar' } },
};

export default function EnglishVehiclesPage() {
  return <VehiclesPageContent language="en" />;
}
