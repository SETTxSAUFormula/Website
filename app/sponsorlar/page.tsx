import type { Metadata } from 'next';
import Image from 'next/image';
import { Boxes, GraduationCap, Rocket } from 'lucide-react';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Sponsorlar',
  description: 'SAUFormula destekçileri ve sponsorluk iş birliği olanakları.',
  alternates: { canonical: '/sponsorlar', languages: { 'tr-TR': '/sponsorlar', 'en-US': '/en/sponsorlar' } },
};

type Sponsor = {
  name: string;
  src: string;
  scale?: number;
  blend?: boolean;
};

const sponsorTiers: Array<{
  name: string;
  nameEn: string;
  color: string;
  gridClass: string;
  cardClass: string;
  logoBoxClass: string;
  sponsors: Sponsor[];
}> = [
  {
    name: 'Elmas',
    nameEn: 'Diamond',
    color: '#8ee8e1',
    gridClass: 'sm:grid-cols-2',
    cardClass: 'min-h-64 sm:min-h-72',
    logoBoxClass: 'h-40 w-[78%]',
    sponsors: [
      { name: 'T.C. Sakarya Valiliği', src: '/sponsors/2026/sakarya-valiligi.png', scale: 1.34 },
      { name: 'SMS Sadıkoğlu', src: '/sponsors/2026/sms-sadikoglu.png', scale: 1.28 },
    ],
  },
  {
    name: 'Altın',
    nameEn: 'Gold',
    color: '#e5b94f',
    gridClass: 'sm:grid-cols-2 lg:grid-cols-4',
    cardClass: 'min-h-52',
    logoBoxClass: 'h-28 w-[80%]',
    sponsors: [
      { name: 'Sevilmiş Rulman', src: '/sponsors/2026/sevilmis-rulman.png', scale: 2.2 },
      { name: 'Bersse', src: '/sponsors/2026/bersse.svg' },
      { name: 'Ansys', src: '/sponsors/2026/ansys.png', scale: 0.94 },
      { name: 'Altium', src: '/sponsors/2026/altium.svg', scale: 1.38 },
      { name: 'SolidWorks', src: '/sponsors/2026/solidworks.svg', scale: 1.52 },
      { name: 'Tarcanlar Expert', src: '/sponsors/2026/tarcanlar.png', scale: 1.08 },
      { name: 'Kordsa', src: '/sponsors/2026/kordsa.png', scale: 2.1 },
      { name: 'Ünelsis', src: '/sponsors/2026/unelsis.jpg', scale: 1.5 },
    ],
  },
  {
    name: 'Gümüş',
    nameEn: 'Silver',
    color: '#b9c7c7',
    gridClass: 'sm:grid-cols-2 lg:grid-cols-5',
    cardClass: 'min-h-48',
    logoBoxClass: 'h-24 w-[82%]',
    sponsors: [
      { name: 'Cenk', src: '/sponsors/2026/cenk.png', scale: 1.46 },
      { name: 'Kartepe ATV', src: '/sponsors/2026/kartepe-atv.png', scale: 1.08 },
      { name: 'Değer Taş Fırın Lezzetleri', src: '/sponsors/2026/deger-tas-firin.png', scale: 1.18 },
      { name: 'Sarıgözoğlu', src: '/sponsors/sarigozoglu.png', scale: 1.38 },
      { name: 'Eğrekçi Demir Çelik', src: '/sponsors/2026/egrekci.png', scale: 1.06 },
    ],
  },
  {
    name: 'Bronz',
    nameEn: 'Bronze',
    color: '#b9794e',
    gridClass: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    cardClass: 'min-h-44',
    logoBoxClass: 'h-20 w-[82%]',
    sponsors: [
      { name: 'ASAŞ', src: '/sponsors/2026/asas.svg' },
      { name: 'Teknoplas', src: '/sponsors/2026/teknoplas.png', scale: 2.15 },
      { name: 'Özgür Kablo', src: '/sponsors/2026/ozgur-kablo.png', scale: 1.24 },
      { name: 'Schmersal', src: '/sponsors/2026/schmersal.svg' },
      { name: 'Barış Makina', src: '/sponsors/2026/baris-makina.png' },
      { name: 'Eka Lazer', src: '/sponsors/2026/eka-lazer.svg' },
    ],
  },
  {
    name: 'Destekçi',
    nameEn: 'Supporter',
    color: '#00e27b',
    gridClass: 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7',
    cardClass: 'min-h-40',
    logoBoxClass: 'h-16 w-[78%]',
    sponsors: [
      { name: 'Logilink', src: '/sponsors/2026/logilink.svg', scale: 1.2 },
      { name: 'Logitrans', src: '/sponsors/2026/logitrans.png', scale: 1.65 },
      { name: 'Özdisan', src: '/sponsors/2026/ozdisan.png', scale: 3 },
      { name: 'Isılsan', src: '/sponsors/2026/isilsan.png', scale: 1.42 },
      { name: 'Konvo', src: '/sponsors/2026/konvo.png', scale: 1.78, blend: true },
      { name: 'Brother', src: '/sponsors/2026/brother.png', scale: 1.08 },
      { name: 'EFI Analytics', src: '/sponsors/2026/efi-analytics.png', scale: 1.2, blend: true },
    ],
  },
];

const collaboration = {
  tr: [
    [Boxes, 'Üretim desteği', 'Malzeme, parça, işleme ve üretim kabiliyetleriyle tasarımları gerçeğe dönüştürmek.'],
    [Rocket, 'Teknoloji desteği', 'Yazılım, donanım ve mühendislik araçlarıyla geliştirme sürecini ileri taşımak.'],
    [GraduationCap, 'Bilgi paylaşımı', 'Eğitim, mentorluk ve teknik deneyim aktarımıyla öğrencilerin gelişimini hızlandırmak.'],
  ],
  en: [
    [Boxes, 'Manufacturing support', 'Turning designs into reality through materials, parts, machining and manufacturing capabilities.'],
    [Rocket, 'Technology support', 'Advancing development with software, hardware and engineering tools.'],
    [GraduationCap, 'Knowledge sharing', 'Accelerating student development through training, mentoring and technical experience.'],
  ],
};

const pageCopy = {
  tr: { eyebrow: 'Birlikte geliştiriyoruz', title: 'Sponsorlar', description: 'ADA-02’yi ve gelecek araçlarımızı; tasarımdan üretime, yazılımdan yarış operasyonuna kadar üniversite, sanayi ve teknoloji ekosistemiyle kurduğumuz uzun soluklu iş birlikleriyle geliştiriyoruz.', partner: 'partner', logo: 'logosu', note: 'Sponsorlarımız destek kademelerine göre sıralanmış, logolar özgün marka renkleriyle kullanılmıştır.', collaboration: 'İş birliği', headline: 'Aynı hedefte buluşalım.', contactBefore: 'Sponsorluk ve iş birliği görüşmeleri için', contactAfter: 'adresinden bize ulaşabilirsiniz.' },
  en: { eyebrow: 'Developing together', title: 'Sponsors', description: 'We develop ADA-02 and our future cars through long-term partnerships across universities, industry and technology—from design and manufacturing to software and race operations.', partner: 'partners', logo: 'logo', note: 'Our sponsors are grouped by support tier, with logos shown in their original brand colours.', collaboration: 'Partnership', headline: 'Let’s meet at the same goal.', contactBefore: 'For sponsorship and partnership opportunities, contact us at', contactAfter: '.' },
};

export function SponsorsPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} language={language} />

      <section className="px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1500px]">
          <div className="space-y-14">
            {sponsorTiers.map((tier) => (
              <section key={tier.name} aria-labelledby={`tier-${tier.name.toLocaleLowerCase('tr-TR')}`}>
                <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-1" style={{ backgroundColor: tier.color }} aria-hidden="true" />
                    <h3 id={`tier-${tier.name.toLocaleLowerCase('tr-TR')}`} className="font-heading text-4xl font-black uppercase" style={{ color: tier.color }}>{language === 'en' ? tier.nameEn : tier.name}</h3>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{tier.sponsors.length} {copy.partner}</p>
                </div>

                <div className={`mt-4 grid gap-px border border-white/15 bg-white/15 ${tier.gridClass}`}>
                  {tier.sponsors.map((sponsor) => (
                    <article key={sponsor.name} className={`group relative flex items-center justify-center overflow-hidden bg-[#73867c] p-6 ${tier.cardClass}`}>
                      <div className={`relative ${tier.logoBoxClass}`} style={{ transform: `scale(${sponsor.scale ?? 1})` }}>
                        <Image
                          src={sponsor.src}
                          alt={`${sponsor.name} ${copy.logo}`}
                          fill
                          sizes="(min-width: 1280px) 13vw, (min-width: 1024px) 20vw, (min-width: 640px) 45vw, 80vw"
                          className={`object-contain ${sponsor.blend ? 'mix-blend-multiply' : ''}`}
                        />
                      </div>
                      <p className="absolute bottom-3 left-4 right-4 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-[#071710]/65">
                        {sponsor.name}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-white/10 pt-5 text-xs leading-6 text-white/35">{copy.note}</p>
        </div>
      </section>

      <section id="sponsor-ol" className="border-t border-racing-green/30 bg-[#082119] px-5 py-20 text-white lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-racing-green">{copy.collaboration}</p>
              <h2 className="mt-4 font-heading text-6xl font-black uppercase leading-[0.84] sm:text-8xl">{copy.headline}</h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/60">
                {copy.contactBefore}{' '}
                <a href="mailto:info@sauformula.com" className="font-bold text-racing-green underline decoration-racing-green/40 underline-offset-4 transition-colors hover:text-white">
                  info@sauformula.com
                </a>{' '}
                {copy.contactAfter}
              </p>
            </div>
            <div className="grid gap-px bg-ink/20 sm:grid-cols-3">
              {collaboration[language].map(([Icon, title, text]) => (
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
      <SiteFooter language={language} />
    </main>
  );
}

export default function SponsorsPage() {
  return <SponsorsPageContent />;
}
