import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Medya',
  description: 'SAUFormula takımından, ADA-02 aracından ve pist çalışmalarından fotoğraflar.',
};

const images = [
  { src: '/media/ada-02-car.jpg', alt: 'SAUFormula ADA-02 aracı pist alanında', label: 'ADA-02 / Pist' },
  { src: '/media/team-2026.jpg', alt: 'SAUFormula takım üyeleri', label: 'Takım / 2026' },
];

export default function MediaPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="Fotoğraf ve video" title="Medya" description="Atölyedeki emeği, takım ruhunu ve ADA-02’nin pistteki hikâyesini kayıt altına alıyoruz." />
      <section className="bg-ink px-5 py-20 text-white lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-2">
          {images.map((item, index) => (
            <figure key={item.src} className={`group relative overflow-hidden border border-white/15 ${index === 0 ? 'min-h-[620px]' : 'min-h-[480px] lg:mt-28'}`}>
              <Image src={item.src} alt={item.alt} fill sizes="(min-width:1024px) 50vw,100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" priority={index === 0} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <figcaption className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-racing-green">{item.label}</span>
                <span className="font-heading text-4xl font-black">0{index + 1}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-[1500px] text-sm leading-7 text-white/45">
          Medya arşivindeki seçili kareler optimize edilerek galeriye aşamalı biçimde eklenecektir.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
