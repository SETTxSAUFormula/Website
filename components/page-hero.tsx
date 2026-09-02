import type { ReactNode } from 'react';
import Link from 'next/link';
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
    <section className="relative isolate overflow-hidden bg-ink px-5 py-12 text-white lg:px-10 lg:py-14">
      <div className="tech-grid absolute inset-0 -z-10 opacity-25" />
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
        <div>
          <nav aria-label={language === 'en' ? 'Breadcrumb' : 'Sayfa işaret yolu'} className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            <Link href={localizedPath('/', language)} className="transition-colors hover:text-racing-green">{language === 'en' ? 'Home' : 'Ana sayfa'}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/65">{title}</span>
          </nav>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">{eyebrow}</p>
          <h1 className="mt-4 max-w-5xl font-heading text-[clamp(3.4rem,7vw,6.5rem)] font-extrabold uppercase leading-[0.95] tracking-[0.01em]">
            {title}
          </h1>
        </div>
        <div className="border-l border-racing-green/50 pl-6">
          <p className="max-w-xl text-base leading-7 text-white/60 sm:text-lg">{description}</p>
          {aside}
        </div>
      </div>
    </section>
  );
}
