import type { Metadata } from 'next';

import { TeamPageContent } from '@/app/takim/page';

export const metadata: Metadata = {
  title: 'Team',
  description: 'The SAUFormula team story, partnership with SETT and engineering approach.',
};

export default function EnglishTeamPage() {
  return <TeamPageContent language="en" />;
}
