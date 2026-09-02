import type { Metadata } from 'next';

import { CompetitionsPageContent } from '@/app/yarismalar/page';

export const metadata: Metadata = {
  title: 'Competitions',
  description: 'Formula Student competition structure and the SAUFormula race calendar.',
};

export default function EnglishCompetitionsPage() {
  return <CompetitionsPageContent language="en" />;
}
