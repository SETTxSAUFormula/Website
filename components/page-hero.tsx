import type { ReactNode } from 'react';
import Link from 'next/link';

export function PageHero({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink px-5 py-20 text-white lg:px-10 lg:py-28">
      <div className="tech-grid absolute inset-0 -z-10 opacity-25" />
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1fr_0.55fr] lg:items-end">
        <div>
          <nav aria-label="Sayfa işaret yolu" className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            <Link href="/" className="transition-colors hover:text-racing-green">Ana sayfa</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/65">{title}</span>
          </nav>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl font-heading text-[clamp(4rem,9vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.045em]">
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
