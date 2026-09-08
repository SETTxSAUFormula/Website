'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Language } from '@/lib/i18n';

type Sponsor = {
  name: string;
  src: string;
  website: string;
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
    gridClass: 'grid-cols-2',
    cardClass: 'min-h-40 sm:min-h-72',
    logoBoxClass: 'h-24 w-[82%] sm:h-40 sm:w-[78%]',
    sponsors: [
      { name: 'T.C. Sakarya Valiliği', src: '/sponsors/2026/sakarya-valiligi.png', website: 'https://www.sakarya.gov.tr/', scale: 1.2 },
      { name: 'SMS Sadıkoğlu', src: '/sponsors/2026/sms-sadikoglu.png', website: 'https://sadikoglumakine.com.tr/', scale: 1.1 },
    ],
  },
  {
    name: 'Altın',
    nameEn: 'Gold',
    color: '#e5b94f',
    gridClass: 'grid-cols-2 lg:grid-cols-4',
    cardClass: 'min-h-36 sm:min-h-52',
    logoBoxClass: 'h-20 w-[84%] sm:h-28 sm:w-[80%]',
    sponsors: [
      { name: 'Sevilmiş Rulman', src: '/sponsors/2026/sevilmis-rulman.png', website: 'https://www.sevilmisrulman.com.tr/', scale: 2.65 },
      { name: 'Bersse', src: '/sponsors/2026/bersse.svg', website: 'https://www.bersse.com.tr/' },
      { name: 'Ansys', src: '/sponsors/2026/ansys.png', website: 'https://www.ansys.com/', scale: 0.94 },
      { name: 'Altium', src: '/sponsors/2026/altium.svg', website: 'https://www.altium.com/', scale: 1.12 },
      { name: 'SolidWorks', src: '/sponsors/2026/solidworks.svg', website: 'https://www.solidworks.com/' },
      { name: 'Tarcanlar Expert', src: '/sponsors/2026/tarcanlar.png', website: 'https://www.tarcanlar.com.tr/', scale: 1.15 },
      { name: 'Kordsa', src: '/sponsors/2026/kordsa.png', website: 'https://www.kordsa.com/', scale: 1.8 },
      { name: 'Ünelsis', src: '/sponsors/2026/unelsis.jpg', website: 'https://www.unelsis.com/', scale: 1.18 },
    ],
  },
  {
    name: 'Gümüş',
    nameEn: 'Silver',
    color: '#b9c7c7',
    gridClass: 'grid-cols-2 lg:grid-cols-5',
    cardClass: 'min-h-36 sm:min-h-48',
    logoBoxClass: 'h-20 w-[84%] sm:h-24 sm:w-[82%]',
    sponsors: [
      { name: 'Cenk', src: '/sponsors/2026/cenk.png', website: 'https://www.cenk.com.tr/', scale: 2.2 },
      { name: 'Kartepe ATV', src: '/sponsors/2026/kartepe-atv.png', website: 'https://www.kartepeatv.com.tr/' },
      { name: 'Değer Taş Fırın Lezzetleri', src: '/sponsors/2026/deger-tas-firin.png', website: 'https://www.migros.com.tr/yemek/deger-tas-firin-lezzetleri-basaksehir-ikitelli-osb-mah-st-21c70', scale: 1.16 },
      { name: 'Sarıgözoğlu', src: '/sponsors/sarigozoglu.png', website: 'https://www.sarigozoglu.com/', scale: 1.14 },
      { name: 'Eğrekçi Demir Çelik', src: '/sponsors/2026/egrekci.png', website: 'http://www.egrekci.com/', scale: 1.15 },
    ],
  },
  {
    name: 'Bronz',
    nameEn: 'Bronze',
    color: '#b9794e',
    gridClass: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    cardClass: 'min-h-32 sm:min-h-44',
    logoBoxClass: 'h-16 w-[84%] sm:h-20 sm:w-[82%]',
    sponsors: [
      { name: 'ASAŞ', src: '/sponsors/2026/asas.svg', website: 'https://www.asastr.com/' },
      { name: 'Teknoplas', src: '/sponsors/2026/teknoplas.png', website: 'https://www.teknoplas.net/', scale: 2.3 },
      { name: 'Özgür Kablo', src: '/sponsors/2026/ozgur-kablo.png', website: 'https://www.ozgurkablo.com/', scale: 1.5 },
      { name: 'Schmersal', src: '/sponsors/2026/schmersal.svg', website: 'https://www.schmersal.com/' },
      { name: 'Barış Makina', src: '/sponsors/2026/baris-makina.png', website: 'https://barismak.com.tr/' },
      { name: 'Eka Lazer', src: '/sponsors/2026/eka-lazer.svg', website: 'https://www.ekalazer.com.tr/' },
    ],
  },
  {
    name: 'Destekçi',
    nameEn: 'Supporter',
    color: '#00e27b',
    gridClass: 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-7',
    cardClass: 'min-h-32 sm:min-h-40',
    logoBoxClass: 'h-14 w-[82%] sm:h-16 sm:w-[78%]',
    sponsors: [
      { name: 'Logilink', src: '/sponsors/2026/logilink.svg', website: 'https://www.logilink.com.tr/' },
      { name: 'Logitrans', src: '/sponsors/2026/logitrans.png', website: 'https://www.logitransport.com/', scale: 2.4 },
      { name: 'Özdisan', src: '/sponsors/2026/ozdisan.png', website: 'https://www.ozdisan.com/', scale: 4 },
      { name: 'Isılsan', src: '/sponsors/2026/isilsan.png', website: 'https://isilsanmakina.com.tr/', scale: 1.35 },
      { name: 'Konvo', src: '/sponsors/2026/konvo.png', website: 'https://konvotech.com/', scale: 1.5, blend: true },
      { name: 'Brother', src: '/sponsors/2026/brother.png', website: 'https://www.brother.com.tr/', scale: 1.2 },
      { name: 'EFI Analytics', src: '/sponsors/2026/efi-analytics.png', website: 'https://www.efianalytics.com/', scale: 1.15, blend: true },
    ],
  },
];

export function SponsorSeasons({ language }: { language: Language }) {
  // Keep the published season explicit; do not advance it with the calendar.
  const [season, setSeason] = useState<2026 | 2027>(2026);
  const copy = language === 'tr'
    ? { partner: 'partner', logo: 'logosu', visit: 'web sitesini ziyaret et', seasons: 'Sponsor sezonları', season: 'sezonu', empty: '2027 sezonu sponsorları henüz açıklanmadı.' }
    : { partner: 'partners', logo: 'logo', visit: 'visit website', seasons: 'Sponsorship seasons', season: 'season', empty: 'Sponsors for the 2027 season have not been announced yet.' };

  return (
    <section id="current-sponsors" className="scroll-mt-6 px-5 py-9 sm:py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/15 pb-6 sm:mb-14 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="sponsor-seasons-title" className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">{copy.seasons}</h2>
          <div role="group" aria-labelledby="sponsor-seasons-title" className="flex gap-3">
            {([2026, 2027] as const).map((year) => (
              <button key={year} type="button" onClick={() => setSeason(year)} aria-pressed={season === year} aria-controls="sponsor-season-panel" className={`inline-flex min-h-12 min-w-24 items-center justify-center border px-6 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-green focus-visible:ring-offset-4 focus-visible:ring-offset-ink ${season === year ? 'border-racing-green bg-racing-green text-ink' : 'border-white/25 text-white/70 hover:border-racing-green hover:text-racing-green'}`}>
                {year}
              </button>
            ))}
          </div>
        </div>
        <div id="sponsor-season-panel" role="region" aria-label={`${season} ${copy.season}`}>
          <p role="status" className={season === 2027 ? 'mb-8 border-l-2 border-racing-green/60 pl-4 text-sm leading-6 text-white/70' : 'sr-only'}>{season === 2027 ? copy.empty : `${season} ${copy.season}`}</p>
          <div className="space-y-10 sm:space-y-14">
            {sponsorTiers.map((tier) => (
              <section key={tier.name} aria-labelledby={`tier-${tier.name.toLocaleLowerCase('tr-TR')}`}>
                <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-1" style={{ backgroundColor: tier.color }} aria-hidden="true" />
                    <h3 id={`tier-${tier.name.toLocaleLowerCase('tr-TR')}`} className="font-heading text-3xl font-black uppercase sm:text-4xl" style={{ color: tier.color }}>{language === 'en' ? tier.nameEn : tier.name}</h3>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{season === 2026 ? tier.sponsors.length : 0} {copy.partner}</p>
                </div>

                <div className={`mt-4 grid border-l border-t border-white/25 ${tier.gridClass}`}>
                  {season === 2026 ? tier.sponsors.map((sponsor) => (
                    <a key={sponsor.name} href={sponsor.website} target="_blank" rel="noreferrer" aria-label={`${sponsor.name}: ${copy.visit}`} className={`sponsor-card-surface group relative flex items-center justify-center overflow-hidden border-b border-r border-white/25 p-3 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-racing-green sm:p-6 ${tier.cardClass}`}>
                      <div className={`relative ${tier.logoBoxClass}`}>
                        <img
                          src={sponsor.src}
                          alt={`${sponsor.name} ${copy.logo}`}
                          loading="lazy"
                          decoding="async"
                          className={`absolute inset-0 h-full w-full object-contain ${sponsor.blend ? 'mix-blend-multiply' : ''}`}
                          style={{ transform: `scale(${sponsor.scale ?? 1})` }}
                        />
                      </div>
                      <p className="absolute bottom-2 left-2 right-2 text-center text-[7px] font-bold uppercase tracking-[0.08em] text-[#071710]/65 sm:bottom-3 sm:left-4 sm:right-4 sm:text-[9px] sm:tracking-[0.12em]">
                        {sponsor.name}
                      </p>
                      <ArrowUpRight className="absolute right-4 top-4 size-4 text-[#071710]/0 transition-all duration-300 group-hover:text-[#071710]/60 group-focus-visible:text-[#071710]/60" aria-hidden="true" />
                    </a>
                  )) : tier.sponsors.map((_, index) => (
                    <div key={index} aria-hidden="true" className={`flex items-center justify-center border-b border-r border-white/25 bg-[#73867c]/15 p-3 sm:p-6 ${tier.cardClass}`}>
                      <span className="relative size-6 text-white/15">
                        <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                        <span className="absolute left-1/2 top-0 h-full w-px bg-current" />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
