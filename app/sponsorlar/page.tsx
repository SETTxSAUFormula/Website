import type { Metadata } from 'next';
import { ArrowUpRight, Boxes, GraduationCap, HandCoins, Rocket } from 'lucide-react';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SponsorSeasons } from '@/components/sponsor-seasons';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Sponsorlar',
  description: 'SAUFormula destekçileri ve sponsorluk iş birliği olanakları.',
  alternates: { canonical: '/sponsorlar', languages: { 'tr-TR': '/sponsorlar', 'en-US': '/en/sponsorlar' } },
};

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
  tr: { eyebrow: 'Birlikte geliştiriyoruz', title: 'Sponsorlar', description: 'ADA-02’yi ve gelecek araçlarımızı; tasarımdan üretime, yazılımdan yarış operasyonuna kadar üniversite, sanayi ve teknoloji ekosistemiyle kurduğumuz uzun soluklu iş birlikleriyle geliştiriyoruz.', collaboration: 'İş birliği', headline: 'Birlikte piste çıkalım.', collaborationText: 'Bir Formula Student aracının arkasında yalnızca mühendislik değil; üretim, teknoloji, deneyim ve güçlü bir bütçe ortaklığı vardır.', contactBefore: 'ADA-02’nin gelişimine ortak olmak için', contactAfter: 'adresinden bize ulaşın.', cta: 'Sponsorluk görüşmesi başlat' },
  en: { eyebrow: 'Developing together', title: 'Sponsors', description: 'We develop ADA-02 and our future cars through long-term partnerships across universities, industry and technology—from design and manufacturing to software and race operations.', collaboration: 'Partnership', headline: 'Let’s reach the grid together.', collaborationText: 'Behind a Formula Student car is more than engineering: it takes manufacturing, technology, experience and a strong financial partnership.', contactBefore: 'To become part of ADA-02’s development, contact us at', contactAfter: '.', cta: 'Start a sponsorship conversation' },
};

export function SponsorsPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} language={language} />

      <SponsorSeasons language={language} />

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
                <a href="mailto:info@sauformula.org" className="font-bold text-white underline decoration-racing-green/70 underline-offset-4 transition-colors hover:text-racing-green">
                  info@sauformula.org
                </a>{' '}
                {copy.contactAfter}
              </p>
              <a href="mailto:info@sauformula.org?subject=SAUFormula%20Sponsorluk%20Görüşmesi" className="mt-8 inline-flex min-h-14 items-center gap-4 bg-racing-green px-6 font-heading text-lg font-black uppercase text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
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
