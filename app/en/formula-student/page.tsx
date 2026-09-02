import type { Metadata } from 'next';

import { FormulaStudentPageContent } from '@/app/formula-student/page';

export const metadata: Metadata = {
  title: 'Formula Student',
  description: 'Formula Student events, 2026 scoring and SAUFormula’s competition experience.',
  alternates: { canonical: '/en/formula-student', languages: { 'tr-TR': '/formula-student', 'en-US': '/en/formula-student' } },
};

export default function EnglishFormulaStudentPage() {
  return <FormulaStudentPageContent language="en" />;
}
