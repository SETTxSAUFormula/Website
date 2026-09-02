import type { Metadata } from 'next';
import { ArrowUpRight, Boxes, GraduationCap, HandCoins, Rocket } from 'lucide-react';

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

const collaboration = {
  tr: [
    [Boxes, 'Üretim desteği', 'Malzeme, parça, işleme ve üretim kabiliyetleriyle tasarımları gerçeğe dönüştürmek.'],
    [Rocket, 'Teknoloji desteği', 'Yazılım, donanım ve mühendislik araçlarıyla geliştirme sürecini ileri taşımak.'],
    [GraduationCap, 'Bilgi paylaşımı', 'Eğitim, mentorluk ve teknik deneyim aktarımıyla öğrencilerin gelişimini hızlandırmak.'],
    [HandCoins, 'Finansal destek', 'Malzeme, test, lojistik ve yarış bütçesine doğrudan katkıyla projenin sürdürülebilirliğini güçlendirmek.'],
  ],
  en: [
    [Boxes, 'Manufacturing support', 'Turning designs into reality through materials, parts, machining and manufacturing capabilities.'],
    [Rocket, 'Technology support', 'Advancing development with software, hardware and engineering tools.'],
    [GraduationCap, 'Knowledge sharing', 'Accelerating student development through training, mentoring and technical experience.'],
    [HandCoins, 'Financial support', 'Strengthening the project through direct contributions to materials, testing, logistics and race operations.'],
  ],
};

const pageCopy = {
  tr: { eyebrow: 'Birlikte geliştiriyoruz', title: 'Sponsorlar', description: 'ADA-02’yi ve gelecek araçlarımızı; tasarımdan üretime, yazılımdan yarış operasyonuna kadar üniversite, sanayi ve teknoloji ekosistemiyle kurduğumuz uzun soluklu iş birlikleriyle geliştiriyoruz.', partner: 'partner', logo: 'logosu', visit: 'web sitesini ziyaret et', note: 'Sponsorlarımız destek kademelerine göre sıralanmış, logolar özgün marka renkleriyle kullanılmıştır. Kurumsal sayfayı açmak için logoya tıklayabilirsiniz.', collaboration: 'İş birliği', headline: 'Birlikte piste çıkalım.', collaborationText: 'Bir Formula Student aracının arkasında yalnızca mühendislik değil; üretim, teknoloji, deneyim ve güçlü bir bütçe ortaklığı vardır.', contactBefore: 'ADA-02’nin gelişimine ortak olmak için', contactAfter: 'adresinden bize ulaşın.', cta: 'Sponsorluk görüşmesi başlat' },
  en: { eyebrow: 'Developing together', title: 'Sponsors', description: 'We develop ADA-02 and our future cars through long-term partnerships across universities, industry and technology—from design and manufacturing to software and race operations.', partner: 'partners', logo: 'logo', visit: 'visit website', note: 'Our sponsors are grouped by support tier, with logos shown in their original brand colours. Click a logo to visit the organisation’s website.', collaboration: 'Partnership', headline: 'Let’s reach the grid together.', collaborationText: 'Behind a Formula Student car is more than engineering: it takes manufacturing, technology, experience and a strong financial partnership.', contactBefore: 'To become part of ADA-02’s development, contact us at', contactAfter: '.', cta: 'Start a sponsorship conversation' },
};

export function SponsorsPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} language={language} />

      <section className="px-5 py-9 sm:py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1500px]">
          <div className="space-y-10 sm:space-y-14">
            {sponsorTiers.map((tier) => (
              <section key={tier.name} aria-labelledby={`tier-${tier.name.toLocaleLowerCase('tr-TR')}`}>
                <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-1" style={{ backgroundColor: tier.color }} aria-hidden="true" />
                    <h3 id={`tier-${tier.name.toLocaleLowerCase('tr-TR')}`} className="font-heading text-3xl font-black uppercase sm:text-4xl" style={{ color: tier.color }}>{language === 'en' ? tier.nameEn : tier.name}</h3>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{tier.sponsors.length} {copy.partner}</p>
                </div>

                <div className={`mt-4 grid border-l border-t border-white/25 ${tier.gridClass}`}>
                  {tier.sponsors.map((sponsor) => (
                    <a key={sponsor.name} href={sponsor.website} target="_blank" rel="noreferrer" aria-label={`${sponsor.name}: ${copy.visit}`} className={`group relative flex items-center justify-center overflow-hidden border-b border-r border-white/25 bg-[#73867c] p-3 outline-none transition-colors duration-300 hover:bg-[#82988d] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-racing-green sm:p-6 ${tier.cardClass}`}>
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
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-white/10 pt-5 text-xs leading-6 text-white/35">{copy.note}</p>
        </div>
      </section>

      <section id="sponsor-ol" className="relative overflow-hidden border-y border-racing-green/45 bg-[#0a2b20] px-5 py-20 text-white lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-racing-green" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-28 -top-40 size-[520px] rounded-full bg-racing-green/10 blur-3xl" aria-hidden="true" />
        <div className="mx-auto max-w-[1500px]">
          <div className="relative grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-racing-green">{copy.collaboration}</p>
              <h2 className="mt-4 max-w-2xl font-heading text-6xl font-black uppercase leading-[0.84] sm:text-8xl">{copy.headline}</h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/72">{copy.collaborationText}</p>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
                {copy.contactBefore}{' '}
                <a href="mailto:info@sauformula.com" className="font-bold text-white underline decoration-racing-green/70 underline-offset-4 transition-colors hover:text-racing-green">
                  info@sauformula.com
                </a>{' '}
                {copy.contactAfter}
              </p>
              <a href="mailto:info@sauformula.com?subject=SAUFormula%20Sponsorluk%20Görüşmesi" className="mt-8 inline-flex min-h-14 items-center gap-4 bg-racing-green px-6 font-heading text-lg font-black uppercase text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {copy.cta}
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </a>
            </div>
            <div className="grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-4">
              {collaboration[language].map(([Icon, title, text]) => (
                <article key={String(title)} className="min-h-80 border-b border-r border-white/15 bg-[#0c3326] p-7 transition-colors hover:bg-[#10402f]">
                  <div className="flex size-12 items-center justify-center border border-racing-green/40 text-racing-green">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-14 font-heading text-[1.65rem] font-bold uppercase leading-none">{String(title)}</h3>
                  <p className="mt-5 text-sm leading-7 text-white/62">{String(text)}</p>
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
