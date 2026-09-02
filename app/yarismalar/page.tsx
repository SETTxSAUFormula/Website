import type { Metadata } from 'next';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Yarışmalar',
  description: 'Formula Student yarışma yapısı ve SAUFormula yarış takvimi.',
};

const pageCopy = {
  tr: { title: 'Yarışmalar', description: 'Formula Student yalnızca en hızlı otomobili değil; en iyi gerekçelendirilmiş, üretilmiş ve yönetilmiş mühendislik projesini arar.', schedule: 'Takvim ve sonuçlar', scheduleText: 'Katılımı kesinleşen organizasyonlar, tarihleri ve doğrulanmış sonuçlar takım veritabanından bu alanda yayınlanacaktır.', events: [['Mühendislik tasarımı', 'Aracın teknik kararları, analizleri ve doğrulama yaklaşımı jüri karşısında savunulur.'], ['Maliyet ve üretim', 'Bir yarış otomobilinin nasıl üretildiği, maliyet ve süreç bakışıyla değerlendirilir.'], ['İş planı sunumu', 'Takımın fikri, sürdürülebilir ve ikna edici bir iş yaklaşımına dönüştürülür.'], ['Dinamik etaplar', 'Araç; hızlanma, yol tutuş, autocross ve dayanıklılık gibi pist görevlerinde sınanır.']] },
  en: { title: 'Competitions', description: 'Formula Student looks beyond the fastest car to find the best-justified, best-built and best-managed engineering project.', schedule: 'Calendar and results', scheduleText: 'Confirmed competitions, dates and verified results will be published here from the team database.', events: [['Engineering design', 'The car’s technical decisions, analysis and validation approach are defended before the judges.'], ['Cost and manufacturing', 'How a race car is manufactured is evaluated from cost and process perspectives.'], ['Business plan presentation', 'The team’s idea is developed into a sustainable and persuasive business approach.'], ['Dynamic events', 'The car is tested in track events including acceleration, handling, autocross and endurance.']] },
};

export function CompetitionsPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero eyebrow="Formula Student" title={copy.title} description={copy.description} language={language} />
      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid border-l border-t border-border md:grid-cols-2">
            {copy.events.map(([title, text], index) => (
              <article key={title} className="min-h-72 border-b border-r border-border bg-[#071b14] p-8 lg:p-12">
                <p className="font-heading text-3xl font-black text-[#008d4e]">0{index + 1}</p>
                <h2 className="mt-14 font-heading text-4xl font-bold uppercase">{title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 border-l-4 border-racing-green bg-ink p-8 text-white lg:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.schedule}</p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">
              {copy.scheduleText}
            </p>
          </div>
        </div>
      </section>
      <SiteFooter language={language} />
    </main>
  );
}

export default function CompetitionsPage() {
  return <CompetitionsPageContent />;
}
