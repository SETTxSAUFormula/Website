import type { Metadata } from 'next';
import Image from 'next/image';
import { Boxes, GraduationCap, Rocket } from 'lucide-react';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Sponsorlar',
  description: 'SAUFormula destekçileri ve sponsorluk iş birliği olanakları.',
};

const sponsors = [
  { name: 'SolidWorks', src: '/sponsors/solidworks.png' },
  { name: 'Kordsa', src: '/sponsors/kordsa.png' },
  { name: 'Schmersal', src: '/sponsors/schmersal.png' },
  { name: 'ASAŞ', src: '/sponsors/asas.png' },
  { name: 'Armacell', src: '/sponsors/armacell.png' },
  { name: 'Altium', src: '/sponsors/altium.png' },
  { name: 'Ünelsis', src: '/sponsors/unelsis.png' },
  { name: 'Sarıgözoğlu', src: '/sponsors/sarigozoglu.png' },
];

const collaboration = [
  [Boxes, 'Üretim desteği', 'Malzeme, parça, işleme ve üretim kabiliyetleriyle tasarımları gerçeğe dönüştürmek.'],
  [Rocket, 'Teknoloji desteği', 'Yazılım, donanım ve mühendislik araçlarıyla geliştirme sürecini ileri taşımak.'],
  [GraduationCap, 'Bilgi paylaşımı', 'Eğitim, mentorluk ve teknik deneyim aktarımıyla öğrencilerin gelişimini hızlandırmak.'],
];

export default function SponsorsPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="Birlikte geliştiriyoruz" title="Sponsorlar" description="ADA-02’yi ve gelecek araçlarımızı; üniversite, sanayi ve teknoloji ekosistemiyle kurduğumuz uzun soluklu iş birlikleriyle geliştiriyoruz." />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#008d4e]">Destekçilerimiz</p>
          <h2 className="mt-4 font-heading text-5xl font-black uppercase sm:text-7xl">Pistin görünmeyen gücü.</h2>
          <div className="mt-12 grid grid-cols-2 border-l border-t border-border md:grid-cols-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.name} className="flex min-h-40 items-center justify-center border-b border-r border-border bg-[#ced8d2] p-7">
                <Image src={sponsor.src} alt={`${sponsor.name} logosu`} width={300} height={140} className="max-h-20 w-auto max-w-[82%] object-contain" />
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            Bu logolar yerleşim ve arayüz testi için mevcut dosyalardan alınmıştır. Nihai sponsor listesi takım tarafından doğrulandıktan sonra güncellenecek; her marka kendi özgün renkleriyle gösterilecektir.
          </p>
        </div>
      </section>

      <section id="sponsor-ol" className="border-t border-racing-green/30 bg-[#082119] px-5 py-20 text-white lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-racing-green">İş birliği</p>
              <h2 className="mt-4 font-heading text-6xl font-black uppercase leading-[0.84] sm:text-8xl">Aynı hedefte buluşalım.</h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
                Sponsorluk iletişim formunu şimdilik devre dışı bırakıyoruz. Doğrulanmış kurumsal e-posta adresi ve güncel sponsorluk dosyası yayın öncesi bu alana eklenecek.
              </p>
            </div>
            <div className="grid gap-px bg-ink/20 sm:grid-cols-3">
              {collaboration.map(([Icon, title, text]) => (
                <article key={String(title)} className="bg-[#0b281e] p-7">
                  <Icon className="size-8" aria-hidden="true" />
                  <h3 className="mt-16 font-heading text-3xl font-bold uppercase">{String(title)}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/55">{String(text)}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
