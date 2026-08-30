import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Haberler',
  description: 'SAUFormula atölyesinden, testlerden ve yarışlardan güncel gelişmeler.',
};

export default function NewsPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="Atölyeden piste" title="Haberler" description="Tasarım kararlarından üretim kilometre taşlarına, testlerden yarış günlerine kadar takımın günlüğü." />
      <section className="px-5 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-10 border border-border bg-[#071b14] p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#008d4e]">İlk yayın hazırlanıyor</p>
            <h2 className="mt-4 max-w-3xl font-heading text-5xl font-black uppercase leading-[0.88] sm:text-7xl">Hikâyeyi kaynağından anlatacağız.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              Bu alan yönetim paneli ve veritabanına bağlı çalışacak. Doğrulanmış takım haberleri eklendiğinde burada kronolojik olarak yayınlanacak.
            </p>
          </div>
          <Link href="/medya" className="inline-flex h-14 items-center gap-3 bg-ink px-6 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-racing-green hover:text-ink">
            Medyayı keşfet <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
