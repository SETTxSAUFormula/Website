import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Takım',
  description: 'SAUFormula takımının hikâyesi, SETT ile güç birliği ve mühendislik yaklaşımı.',
};

const pageCopy = {
  tr: {
    eyebrow: 'Sakarya Üniversitesi', title: 'Takım', description: 'Öğrencilerin karar aldığı, sorumluluk üstlendiği ve birlikte ürettiği disiplinler arası bir mühendislik takımıyız.', since: 'Başlangıçtan bugüne', headline: 'Aynı merak, yeni hedef.', story1: '2007’de Türkiye’nin ilk hidrojen enerjili aracıyla yola çıkan Sakarya Üniversitesi Enerji Teknolojileri Topluluğu, yıllar içinde disiplinler arası bir mühendislik kültürü oluşturdu.', story2: '2025 yılında Sakarya Üniversitesi Formula Student Takımı SAUFormula ile Sakarya Enerji Teknolojileri Takımı SETT güçlerini birleştirerek daha güçlü, yenilikçi ve kararlı bir ekip oluşturdu. Ortak hedefimiz; mühendislikte, tasarımda ve yarış pistlerinde en iyisini ortaya koymak, üniversitemizi uluslararası arenada temsil etmek.', how: 'Nasıl çalışıyoruz?', system: 'Bir araç, ortak bir sistem.', note: 'İsim, görev ve departman bazındaki güncel ekip listesi takım tarafından doğrulandıktan sonra burada yayınlanacaktır.',
    areas: [['Tasarım', 'Her parçayı; işlev, üretilebilirlik ve araç bütünlüğüyle birlikte ele alıyoruz.'], ['Üretim', 'Dijital modeli atölyede gerçek bir yarış otomobiline dönüştürüyoruz.'], ['Test', 'Ölçüyor, doğruluyor, sorunları kaynağında buluyor ve yeniden deniyoruz.'], ['Organizasyon', 'Takvimden iş birliklerine kadar takımın sürdürülebilirliğini birlikte yönetiyoruz.']],
  },
  en: {
    eyebrow: 'Sakarya University', title: 'Team', description: 'We are an interdisciplinary engineering team where students make decisions, take responsibility and build together.', since: 'From the beginning to today', headline: 'The same curiosity, a new goal.', story1: 'The Sakarya University Energy Technologies Society began its journey in 2007 with Türkiye’s first hydrogen-powered vehicle and built an interdisciplinary engineering culture over the years.', story2: 'In 2025, SAUFormula and the Sakarya Energy Technologies Team, SETT, joined forces to create a stronger, more innovative and determined team. Our shared goal is to deliver our best in engineering, design and on the racetrack while representing our university internationally.', how: 'How do we work?', system: 'One car, one shared system.', note: 'The current team list, including names, roles and departments, will be published after it has been verified by the team.',
    areas: [['Design', 'We consider every part together with its function, manufacturability and role in the complete car.'], ['Manufacturing', 'We turn the digital model into a real race car in the workshop.'], ['Testing', 'We measure, validate, find problems at their source and test again.'], ['Organisation', 'We manage the team’s continuity together, from schedules to partnerships.']],
  },
};

export function TeamPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        language={language}
      />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[430px] overflow-hidden bg-ink lg:min-h-[620px]">
            <Image src="/media/team-2026.jpg" alt="SAUFormula takım fotoğrafı" fill sizes="(min-width:1024px) 52vw,100vw" className="object-cover" priority />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#008d4e]">{copy.since}</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.9] sm:text-7xl">{copy.headline}</h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-muted-foreground">
              <p>{copy.story1}</p>
              <p>{copy.story2}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="ekip" className="bg-ink px-5 py-20 text-white lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.how}</p>
          <h2 className="mt-4 max-w-4xl font-heading text-5xl font-black uppercase leading-[0.88] sm:text-7xl">{copy.system}</h2>
          <div className="mt-14 grid border-l border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {copy.areas.map(([title, text], index) => (
              <article key={title} className="min-h-72 border-b border-r border-white/15 p-7">
                <p className="font-heading text-3xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-16 font-heading text-3xl font-bold uppercase">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-7 text-white/45">
            {copy.note}
          </p>
        </div>
      </section>
      <SiteFooter language={language} />
    </main>
  );
}

export default function TeamPage() {
  return <TeamPageContent />;
}
