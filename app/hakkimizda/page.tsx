import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Biz Kimiz?',
  description: 'SAUFormula’nın çalışma kültürü, SETT ile güç birliği, vizyonu ve misyonu.',
  alternates: { canonical: '/hakkimizda', languages: { 'tr-TR': '/hakkimizda', 'en-US': '/en/hakkimizda' } },
};

const pageCopy = {
  tr: {
    since: '2007’den bugüne', title: 'Biz Kimiz?',
    intro1: 'SAUFormula; farklı bölümlerden öğrencilerin tek bir yarış otomobili etrafında araştırma, tasarım, analiz, üretim, test ve yarış operasyonlarını birlikte yönettiği disiplinler arası bir geliştirme ortamıdır.',
    intro2: 'Her sistemi süre, bütçe, üretilebilirlik ve güvenilirlik sınırları içinde ele alır; test sonuçlarını ve teknik kararları yeni sezona aktararak kalıcı bir mühendislik kültürü oluştururuz.',
    studentLed: 'Öğrenci liderliğinde',
    responsibility: 'Aracın mühendislik kararlarından üretim partnerleriyle iletişime, maliyet yönetiminden yarış haftası operasyonuna kadar bütün süreç takım üyelerinin ortak sorumluluğunda ilerler.',
    purpose: 'Amacımız yalnızca bir otomobil üretmek değil; ölçebilen, kararlarını savunabilen ve bilgisini sonraki kuşağa aktarabilen mühendisler yetiştiren bir çalışma ortamı kurmaktır.',
    merger: '2025 · Güçlerin birleşmesi',
    sett1: 'SETT’in 2007’de hidrojen enerjili araçlarla başlayan enerji teknolojileri birikimi, 2025’te SAUFormula’nın Formula Student hedefiyle aynı yapı altında buluştu.',
    sett2: 'Motor, aerodinamik, kompozit ve elektrik–elektronik ekipleri bugün ADA-02 ve onu izleyecek araçlar için ortak teknik hafızayla çalışıyor.',
    visionTitle: 'Vizyonumuz',
    vision: 'Öğrencilerin geliştirdiği yarış araçları ve kuşaktan kuşağa aktarılan mühendislik kültürüyle Formula Student arenasında Türkiye’yi sürdürülebilir başarıyla temsil eden bir takım olmak.',
    missionTitle: 'Misyonumuz',
    mission: 'Farklı disiplinlerden öğrencileri gerçek bir ürün geliştirme döngüsünde buluşturuyor; araştırma, üretim, doğrulama ve yarış süreçlerini öğrenci sorumluluğunda yürütüyoruz.',
    principles: [
      ['01', 'Öğrenerek geliştir', 'Teoriyi tasarım, üretim, test ve yarış döngüsünde gerçek mühendislik kararlarına dönüştürürüz.'],
      ['02', 'Bilgiyi aktar', 'Her sezon edinilen deneyimi kayıt altına alır, yeni takım üyelerine aktarır ve kalıcı bir teknik kültür kurarız.'],
      ['03', 'Birlikte temsil et', 'Farklı disiplinleri ortak hedefte buluşturur; Sakarya Üniversitesini pistte ve teknik sunumlarda temsil ederiz.'],
    ],
  },
  en: {
    since: 'Engineering since 2007', title: 'Who Are We?',
    intro1: 'SAUFormula is an interdisciplinary development environment where students from different fields manage research, design, analysis, manufacturing, testing and race operations around one race car.',
    intro2: 'We develop every system within time, budget, manufacturability and reliability constraints, carrying test results and technical decisions into each new season to build a lasting engineering culture.',
    studentLed: 'Student-led',
    responsibility: 'From engineering decisions and communication with manufacturing partners to cost management and race-week operations, every process advances through the shared responsibility of the team.',
    purpose: 'Our goal is not only to build a car, but to create an environment that develops engineers who can measure, defend their decisions and pass their knowledge to the next generation.',
    merger: '2025 · Joining forces',
    sett1: 'SETT’s energy-technology experience, which began with hydrogen-powered vehicles in 2007, joined SAUFormula’s Formula Student goal under one structure in 2025.',
    sett2: 'Today, the powertrain, aerodynamics, composites and electrical-electronics teams work from a shared technical memory for ADA-02 and the cars that will follow it.',
    visionTitle: 'Our Vision',
    vision: 'To represent Türkiye with lasting success in Formula Student through student-developed race cars and an engineering culture passed from one generation to the next.',
    missionTitle: 'Our Mission',
    mission: 'We bring students from different disciplines together in a real product-development cycle, with research, manufacturing, validation and racing led by students.',
    principles: [
      ['01', 'Develop by learning', 'We turn theory into real engineering decisions through the design, manufacturing, testing and racing cycle.'],
      ['02', 'Pass knowledge forward', 'We document each season’s experience, transfer it to new members and build a lasting technical culture.'],
      ['03', 'Represent together', 'We unite different disciplines around one goal and represent Sakarya University on track and in technical presentations.'],
    ],
  },
} satisfies Record<Language, Record<string, string | string[][]>>;

export function AboutPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];
  const isEnglish = language === 'en';

  return (
    <main>
      <SiteHeader language={language} />

      <section className="bg-ink px-5 py-9 text-white sm:py-12 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-white/15 pb-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.since}</p>
              <h1 className="mt-4 font-heading text-[clamp(3rem,14vw,6.8rem)] font-black uppercase leading-[0.88]">{copy.title}</h1>
            </div>
            <div className="grid gap-5 text-base leading-7 text-white/60 md:grid-cols-2">
              <p>{copy.intro1}</p>
              <p>{copy.intro2}</p>
            </div>
          </div>

          <figure className="mt-8 grid overflow-hidden border border-white/12 bg-[#071b14] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[500px]">
              <Image src="/media/team-2026.jpg" alt={isEnglish ? 'SAUFormula team members at the competition' : 'SAUFormula takım üyeleri yarış alanında'} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">{copy.studentLed}</p>
              <p className="mt-5 text-lg leading-8 text-white/70">{copy.responsibility}</p>
              <p className="mt-5 text-sm leading-7 text-white/45">{copy.purpose}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-racing-green/25 bg-[#061811] px-5 py-12 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="border border-white/12 bg-[#0a241b] p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.merger}</p>
            <div className="mt-7 flex items-center justify-center gap-6 sm:gap-9">
              <Image src="/brand/sett-logo.png" alt="SETT logosu" width={500} height={600} className="h-24 w-auto object-contain sm:h-28" />
              <span aria-hidden="true" className="font-heading text-4xl font-black text-racing-green">×</span>
              <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula logosu" width={2400} height={1510} className="h-20 w-auto object-contain sm:h-24" />
            </div>
          </div>
          <div>
            <h2 className="font-heading text-4xl font-black uppercase leading-none sm:text-5xl">SETT × SAUFormula</h2>
            <div className="mt-6 grid gap-5 text-sm leading-7 text-white/55 md:grid-cols-2">
              <p>{copy.sett1}</p>
              <p>{copy.sett2}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="vizyon-misyon" className="scroll-mt-24 px-5 py-12 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid border-l border-t border-white/15 lg:grid-cols-2">
            <article className="border-b border-r border-white/15 p-7 sm:p-10">
              <h2 className="font-heading text-3xl font-black uppercase sm:text-4xl">{copy.visionTitle}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">{copy.vision}</p>
            </article>
            <article className="border-b border-r border-white/15 p-7 sm:p-10">
              <h2 className="font-heading text-3xl font-black uppercase sm:text-4xl">{copy.missionTitle}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">{copy.mission}</p>
            </article>
          </div>

          <div className="mt-8 grid border-l border-t border-white/15 md:grid-cols-3">
            {(copy.principles as string[][]).map(([number, title, text]) => (
              <article key={number} className="border-b border-r border-white/15 p-7">
                <p className="font-heading text-2xl font-black text-racing-green">{number}</p>
                <h3 className="mt-8 font-heading text-2xl font-bold uppercase">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function AboutPage() {
  return <AboutPageContent />;
}
