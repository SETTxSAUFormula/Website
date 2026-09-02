import type { ReactNode } from 'react';
import Link from '@/components/site-link';
import { localizedPath, type Language } from '@/lib/i18n';

export function PageHero({
  eyebrow,
  title,
  description,
  aside,
  language = 'tr',
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  language?: Language;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink px-5 py-9 text-white sm:py-12 lg:px-10 lg:py-14">
      <div className="tech-grid absolute inset-0 -z-10 opacity-25" />
      <div className="mx-auto grid max-w-[1500px] gap-5 sm:gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
        <div>
          <nav aria-label={language === 'en' ? 'Breadcrumb' : 'Sayfa işaret yolu'} className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35 sm:mb-6 sm:text-[10px] sm:tracking-[0.18em]">
            <Link href={localizedPath('/', language)} className="transition-colors hover:text-racing-green">{language === 'en' ? 'Home' : 'Ana sayfa'}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/65">{title}</span>
          </nav>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">{eyebrow}</p>
          <h1 className="mt-3 max-w-5xl font-heading text-[clamp(2.75rem,13vw,6.5rem)] font-extrabold uppercase leading-[0.92] tracking-[0.01em] sm:mt-4">
            {title}
          </h1>
        </div>
        <div className="border-l border-racing-green/50 pl-4 sm:pl-6">
          <p className="max-w-xl text-sm leading-6 text-white/60 sm:text-lg sm:leading-7">{description}</p>
          {aside}
        </div>
      </div>
    </section>
  );
}
