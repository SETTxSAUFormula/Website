import type { Metadata } from 'next';
import Image from 'next/image';
import { BriefcaseBusiness, Calculator, Cog, Gauge, Infinity as InfinityIcon, Route, ShieldCheck, Zap } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Formula Student',
  description:
    'Formula Student yarışmasının yapısı, statik ve dinamik etapları, 2026 puan dağılımı ve SAUFormula’nın yarış deneyimi.',
  alternates: { canonical: '/formula-student', languages: { 'tr-TR': '/formula-student', 'en-US': '/en/formula-student' } },
};

const staticEventsTr = [
  {
    number: '01',
    title: 'İş Planı Sunumu',
    english: 'Business Plan Presentation',
    points: 75,
    icon: BriefcaseBusiness,
    text: 'Takım, aracını ya da araçla ilişkili bir fikri sürdürülebilir bir iş modeline dönüştürür ve yatırımcı rolündeki jüriye sunar. Teknik ürünün yanında hedef kitle, gelir modeli, pazar yaklaşımı, finansal plan ve büyüme stratejisi de bütünlüklü biçimde ele alınır.',
    focus: 'İş fikrinin uygulanabilirliği, finansal tutarlılık, ikna gücü ve soru–cevap performansı.',
  },
  {
    number: '02',
    title: 'Maliyet ve Üretim',
    english: 'Cost & Manufacturing',
    points: 100,
    icon: Calculator,
    text: 'Aracın malzeme, parça, işçilik ve üretim adımları ayrıntılı bir maliyet raporuna dönüştürülür. Jüri; seçilen üretim yöntemlerinin gerçekçiliğini, maliyet etkinliğini ve takımın bütçe–performans dengesini nasıl yönettiğini sorgular.',
    focus: 'Maliyet doğruluğu, üretim bilgisi, süreç planlama ve değişen bir senaryoya verilen mühendislik tepkisi.',
  },
  {
    number: '03',
    title: 'Mühendislik Tasarım',
    english: 'Engineering Design',
    points: 150,
    icon: Cog,
    text: 'Takım; aracın mimarisini, tasarım hedeflerini, yaptığı hesapları, simülasyonları ve fiziksel test sonuçlarını otomotiv ve motor sporları uzmanlarından oluşan jüriye sunar. Yalnızca ortaya çıkan parça değil, o parçaya götüren karar süreci ve sistemlerin birbiriyle uyumu değerlendirilir.',
    focus: 'Teknik derinlik, yenilik, doğrulama, üretilebilirlik ve takımın kararlarını savunabilmesi.',
  },
];

const staticEventsEn = staticEventsTr.map((event, index) => ({
  ...event,
  title: ['Business Plan Presentation', 'Cost & Manufacturing', 'Engineering Design'][index],
  english: ['Business Plan Presentation', 'Cost & Manufacturing', 'Engineering Design'][index],
  text: [
    'The team turns its car, or a related idea, into a sustainable business model and presents it to judges acting as investors. Alongside the technical product, the target audience, revenue model, market approach, financial plan and growth strategy are evaluated as one coherent proposal.',
    'The car’s materials, parts, labour and manufacturing steps are developed into a detailed cost report. Judges examine whether the chosen manufacturing methods are realistic and cost-effective, and how the team manages the balance between budget and performance.',
    'The team presents the car’s architecture, design targets, calculations, simulations and physical test results to experts from the automotive and motorsport industries. Evaluation covers not only the final part, but also the decisions behind it and how the systems work together.',
  ][index],
  focus: [
    'Feasibility of the business idea, financial consistency, persuasive delivery and question-and-answer performance.',
    'Cost accuracy, manufacturing knowledge, process planning and the engineering response to a changing scenario.',
    'Technical depth, innovation, validation, manufacturability and the team’s ability to defend its decisions.',
  ][index],
}));

const dynamicEventsTr = [
  {
    number: '01',
    title: 'Hızlanma',
    english: 'Acceleration',
    points: 50,
    icon: Zap,
    text: 'Araç durur konumdan başlayarak 75 metrelik düz parkuru mümkün olan en kısa sürede tamamlar. Etap yalnızca motor gücünü değil; güç aktarımını, lastiğin zemine tutunmasını, ağırlık transferini ve sürücünün kalkış tutarlılığını birlikte sınar. Geçerli denemeler arasındaki en iyi süre puanlamada kullanılır.',
  },
  {
    number: '02',
    title: 'Autocross',
    english: 'Autocross',
    points: 100,
    icon: Route,
    text: 'Yaklaşık 1,5 kilometreden kısa, dar ve teknik bir parkur tek tur üzerinden zamana karşı geçilir. Slalomlar, farklı yarıçaplı virajlar ve kısa düzlükler aracın çevikliğini, fren dengesini ve sürücünün çizgi hassasiyetini ortaya çıkarır. En iyi geçerli tur süresi puanı belirler.',
  },
  {
    number: '03',
    title: 'Skidpad',
    english: 'Skidpad',
    points: 50,
    icon: InfinityIcon,
    text: 'Araç, iki daireden oluşan sekiz biçimli parkurda sağ ve sol virajları tamamlar. Yanal tutunma kapasitesi, süspansiyon dengesi, direksiyon tepkisi ve lastiklerin çalışma karakteri bu etapta görünür hale gelir. Koni devirmek veya parkur sınırını ihlal etmek süre cezasına yol açar.',
  },
  {
    number: '04',
    title: 'Dayanıklılık',
    english: 'Endurance',
    points: 250,
    icon: ShieldCheck,
    text: 'Yaklaşık 22 kilometrelik yarış, iki sürücünün araç değişimi yapmadan yaklaşık 11’er kilometre kullanmasıyla tamamlanır. Bu en uzun ve en yüksek puanlı sürücülü etapta hız kadar güvenilirlik, termal yönetim, frenler, süspansiyon, güç aktarımı ve takımın yarış boyunca hata yapmaması belirleyicidir.',
  },
  {
    number: '05',
    title: 'Verimlilik',
    english: 'Efficiency',
    points: 75,
    icon: Gauge,
    text: 'Verimlilik puanı, Dayanıklılık etabında kullanılan yakıt veya elektrik enerjisi ile pist performansını birlikte ele alır. Amaç parkuru yalnızca az enerjiyle değil, rekabetçi bir tempoyu koruyarak tamamlamaktır. Böylece güç yönetimi, mekanik kayıplar ve sürüş stratejisi aynı değerlendirmede birleşir.',
  },
];

const dynamicEventsEn = dynamicEventsTr.map((event, index) => ({
  ...event,
  title: ['Acceleration', 'Autocross', 'Skidpad', 'Endurance', 'Efficiency'][index],
  english: ['Acceleration', 'Autocross', 'Skidpad', 'Endurance', 'Efficiency'][index],
  text: [
    'Starting from rest, the car covers a 75-metre straight in the shortest possible time. The event tests not only engine power, but also drivetrain performance, tyre grip, weight transfer and the driver’s launch consistency. The best valid run determines the score.',
    'A narrow, technical course of less than roughly 1.5 kilometres is completed as a single timed lap. Slaloms, corners of different radii and short straights reveal the car’s agility, braking balance and the driver’s precision. The best valid lap determines the score.',
    'The car completes right- and left-hand turns on a figure-eight course formed by two circles. Lateral grip, suspension balance, steering response and tyre behaviour become visible in this event. Hitting cones or leaving the course adds time penalties.',
    'The roughly 22-kilometre race is completed by two drivers, each covering around 11 kilometres without changing cars. In the longest and highest-scoring driven event, reliability, thermal management, brakes, suspension, drivetrain and error-free team operation matter as much as speed.',
    'Efficiency combines the fuel or electrical energy used during Endurance with the car’s track performance. The goal is not merely to use less energy, but to maintain a competitive pace, bringing power management, mechanical losses and driving strategy into one assessment.',
  ][index],
}));

const galleryImagesTr = [
  {
    src: '/media/fs-romania-track-wide.jpg',
    alt: 'Formula Student Romania pist alanında üniversite takımlarının yarış araçları',
    title: 'Yarış alanı',
    text: 'Farklı ülkelerden öğrenci takımları aynı pistte buluşur; her araç, bir sezon boyunca verilen binlerce mühendislik kararını temsil eder.',
  },
  {
    src: '/media/fs-team-romania.webp',
    alt: 'SAUFormula takımı ADA-02 ile yarış garajının önünde',
    title: 'Takım çalışması',
    text: 'Teknik kontrollerden piste çıkışa kadar her adım; sürücü, mühendislik ekipleri ve operasyon sorumlularının eş zamanlı çalışmasını gerektirir.',
  },
  {
    src: '/media/fs-pit.webp',
    alt: 'SAUFormula ekibi ADA-02 üzerinde pit çalışması yaparken',
    title: 'Hazırlık ve doğrulama',
    text: 'Paddock alanı yalnızca bakım noktası değildir; ölçümlerin kontrol edildiği, sorunların çözüldüğü ve aracın bir sonraki etaba hazırlandığı çalışma alanıdır.',
  },
];

const galleryImagesEn = galleryImagesTr.map((image, index) => ({
  ...image,
  alt: [
    'University race cars in the Formula Student Romania track area',
    'The SAUFormula team with ADA-02 in front of the race garage',
    'The SAUFormula team working on ADA-02 in the pit',
  ][index],
  title: ['Competition grounds', 'Teamwork', 'Preparation and validation'][index],
  text: [
    'Student teams from different countries meet on the same track; every car represents thousands of engineering decisions made over an entire season.',
    'Every step, from technical inspection to going on track, requires drivers, engineering departments and operations leads to work at the same time.',
    'The paddock is more than a service area: it is where measurements are checked, problems are solved and the car is prepared for the next event.',
  ][index],
}));

const pageCopy = {
  tr: {
    eyebrow: 'Tasarım · Üretim · Doğrulama · Yarış', title: 'Formula Student Nedir?', intro: 'Formula Student, üniversite öğrencilerinin tek kişilik bir yarış otomobilini sıfırdan tasarladığı, ürettiği, doğruladığı ve yarıştırdığı uluslararası bir mühendislik yarışmasıdır. Kökeni 1981’de ABD’de başlayan Formula SAE’ye dayanır; Formula Student adıyla Birleşik Krallık’taki ilk gösteri organizasyonu 1998’de düzenlendi. Ana sınıflardan CV, içten yanmalı ve hibrit araçları; EV ise elektrikli araçları tanımlar. DV olarak anılan sürücüsüz ve otonom sistemler, güncel kurallarda CV veya EV araçların katılabildiği Driverless Cup ve otonom disiplinler kapsamında değerlendirilir. Araçlar piste çıkmadan önce teknik kontrolden geçer; takımlar tasarım, maliyet, üretim yaklaşımı ve iş planını statik etaplarda savunurken hızlanma, skidpad, autocross ve dayanıklılık performansını dinamik etaplarda gösterir. Böylece yarışı yalnızca en hızlı otomobil değil, güvenilirlik, verimlilik ve teknik kararlarıyla en güçlü toplam paketi sunan takım kazanır.',
    heroAlt: 'Formula Student Romania yarış alanında farklı üniversitelerin araçları', caption: 'Formula Student Romania yarış alanı', archive: 'SAUFormula takım arşivi', scoreLabel: 'Formula Student puanları', scores: [['325', 'Statik etap'], ['525', 'Sürücülü dinamik'], ['150', 'Opsiyonel sürücüsüz'], ['1000', 'Azami toplam']], scoreNote: 'Puanlar 2026 uluslararası Formula Student kurallarındaki CV/EV dağılımını gösterir. Yarış organizasyonunun etkinlik el kitabı uygulama ayrıntılarını değiştirebilir.',
    staticEyebrow: '01 · Pist öncesi değerlendirme', staticTitle: 'Statik Etaplar', totalPoints: 'Toplam puan', points: 'Puan', judgeFocus: 'Jürinin odağı', dynamicEyebrow: '02 · Pist üzerindeki değerlendirme', dynamicTitle: 'Dinamik Etaplar', drivenPoints: 'Sürücülü etap puanı', driverlessEyebrow: '03 · Opsiyonel sürücüsüz etaplar', driverlessTitle: '150 ek puan.', driverlessText: '2026 kurallarında CV ve EV takımları, otonom sistemi uygun olan araçlarla sürücüsüz Hızlanma ve Skidpad etaplarından ilave puan kazanabilir. Bu nedenle sürücülü beş dinamik etabın 525 puanına 150 puanlık opsiyonel bölüm eklenir.', driverlessEvents: [['Sürücüsüz Hızlanma', 'Driverless Acceleration', '75'], ['Sürücüsüz Skidpad', 'Driverless Skidpad', '75']], galleryEyebrow: 'Yarış haftasından', galleryTitle: 'FORMULA STUDENT ROMANIA.', galleryText: 'Etap açıklamalarından bağımsız bu galeri, ADA-02’nin yarış alanındaki hazırlıklarını, takım çalışmasını ve Formula Student atmosferini gösteriyor.',
  },
  en: {
    eyebrow: 'Design · Build · Validate · Race', title: 'What Is Formula Student?', intro: 'Formula Student is an international engineering competition in which university students design, build, validate and race a single-seat car from the ground up. Its roots go back to Formula SAE, founded in the United States in 1981, while the first UK demonstration event under the Formula Student name took place in 1998. CV covers combustion and hybrid vehicles, while EV refers to electric vehicles. Driverless and autonomous systems compete through the Driverless Cup and autonomous disciplines available to eligible CV or EV cars. Before reaching the track, cars must pass technical inspection. Teams defend their design, cost, manufacturing approach and business plan in static events, then demonstrate acceleration, skidpad, autocross and endurance performance in dynamic events. The strongest overall package wins—not simply the fastest car, but the team that combines reliability, efficiency and well-founded engineering decisions.',
    heroAlt: 'Cars from different universities at Formula Student Romania', caption: 'Formula Student Romania competition grounds', archive: 'SAUFormula team archive', scoreLabel: 'Formula Student scores', scores: [['325', 'Static events'], ['525', 'Driven dynamics'], ['150', 'Optional driverless'], ['1000', 'Maximum total']], scoreNote: 'Scores reflect the CV/EV distribution in the 2026 international Formula Student rules. Event handbooks may change implementation details.',
    staticEyebrow: '01 · Pre-track assessment', staticTitle: 'Static Events', totalPoints: 'Total points', points: 'Points', judgeFocus: 'Judges focus on', dynamicEyebrow: '02 · On-track assessment', dynamicTitle: 'Dynamic Events', drivenPoints: 'Driven-event points', driverlessEyebrow: '03 · Optional driverless events', driverlessTitle: '150 additional points.', driverlessText: 'Under the 2026 rules, eligible CV and EV teams can earn additional points in Driverless Acceleration and Driverless Skidpad. This optional 150-point section is added to the 525 points available across the five driven dynamic events.', driverlessEvents: [['Driverless Acceleration', 'Autonomous straight-line performance', '75'], ['Driverless Skidpad', 'Autonomous lateral performance', '75']], galleryEyebrow: 'From race week', galleryTitle: 'FORMULA STUDENT ROMANIA.', galleryText: 'Beyond the event descriptions, this gallery shows ADA-02’s preparation at the competition, the team’s work and the Formula Student atmosphere.',
  },
};

export function FormulaStudentPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];
  const staticEvents = language === 'en' ? staticEventsEn : staticEventsTr;
  const dynamicEvents = language === 'en' ? dynamicEventsEn : dynamicEventsTr;
  const galleryImages = language === 'en' ? galleryImagesEn : galleryImagesTr;

  return (
    <main>
      <SiteHeader language={language} />
      <section className="relative overflow-hidden bg-ink px-5 py-12 text-white lg:px-10 lg:py-14">
        <div className="tech-grid absolute inset-0 opacity-20" />
        <div className="mx-auto max-w-[1500px]">
          <div className="relative grid gap-8 border-b border-white/15 pb-9 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.eyebrow}</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88] tracking-[0.01em]">{copy.title}</h1>
            </div>
            <p className="max-w-4xl text-base leading-8 text-white/60">
              {copy.intro}
            </p>
          </div>

          <div className="mt-8 grid overflow-hidden border border-white/15 bg-[#071b14] lg:grid-cols-[1.25fr_0.75fr]">
            <figure className="relative min-w-0 overflow-hidden">
              <div className="relative aspect-video sm:aspect-[16/8] lg:h-full lg:min-h-[460px]">
                <Image
                  src="/media/fs-romania-track-wide.jpg"
                  alt={copy.heroAlt}
                  fill
                  sizes="(min-width: 1024px) 63vw, 100vw"
                  className="object-cover object-[50%_38%]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-white/70 sm:flex-row sm:items-center sm:justify-between">
                <span>{copy.caption}</span>
                <span className="text-white/40">{copy.archive}</span>
              </figcaption>
            </figure>

            <aside aria-label={copy.scoreLabel} className="border-t border-white/15 lg:border-l lg:border-t-0">
              <div className="grid h-full grid-cols-2">
                {copy.scores.map(([value, label], index) => (
                  <div key={label} className={`flex min-h-40 flex-col justify-center p-5 sm:p-7 ${index % 2 === 0 ? 'border-r border-white/15' : ''} ${index < 2 ? 'border-b border-white/15' : ''}`}>
                    <p className="font-heading text-5xl font-black text-racing-green">{value}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
          <p className="mt-4 max-w-4xl text-xs leading-6 text-white/35">
            {copy.scoreNote}
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.staticEyebrow}</p>
              <h2 className="mt-4 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">{copy.staticTitle}</h2>
            </div>
            <div className="lg:text-right">
              <p className="font-heading text-6xl font-black text-racing-green">325</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{copy.totalPoints}</p>
            </div>
          </div>

          <div className="mt-9 grid gap-x-10 gap-y-10 lg:grid-cols-3">
            {staticEvents.map((event) => {
              const Icon = event.icon;

              return (
                <article key={event.title} className="border-t border-white/15 pt-8">
                  <div className="flex items-start justify-between gap-5">
                    <Icon className="size-14 stroke-[1.4] text-racing-green" aria-hidden="true" />
                    <span className="bg-racing-green px-4 py-2 font-heading text-2xl font-black text-ink">{event.points} {copy.points}</span>
                  </div>
                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{event.english}</p>
                  <h3 className="mt-3 font-heading text-3xl font-bold uppercase leading-tight">{event.title}</h3>
                  <p className="mt-6 text-sm leading-7 text-white/60">{event.text}</p>
                  <div className="mt-7 border-l-2 border-racing-green/60 pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{copy.judgeFocus}</p>
                    <p className="mt-2 text-sm leading-6 text-white/50">{event.focus}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.dynamicEyebrow}</p>
              <h2 className="mt-4 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">{copy.dynamicTitle}</h2>
            </div>
            <div className="lg:text-right">
              <p className="font-heading text-6xl font-black text-racing-green">525</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{copy.drivenPoints}</p>
            </div>
          </div>

          <div className="mt-9 grid gap-x-10 gap-y-10 md:grid-cols-6">
            {dynamicEvents.map((event, index) => {
              const Icon = event.icon;

              return (
                <article
                  key={event.title}
                  className={`border-t border-white/15 pt-8 md:col-span-2 ${index === 3 ? 'md:col-start-2' : ''}`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <Icon className="size-14 stroke-[1.4] text-racing-green" aria-hidden="true" />
                    <span className="bg-racing-green px-4 py-2 font-heading text-2xl font-black text-ink">{event.points} {copy.points}</span>
                  </div>
                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{event.english}</p>
                  <h3 className="mt-3 font-heading text-3xl font-bold uppercase">{event.title}</h3>
                  <p className="mt-6 text-sm leading-7 text-white/60">{event.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.driverlessEyebrow}</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">{copy.driverlessTitle}</h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/50">
              {copy.driverlessText}
            </p>
          </div>
          <div className="grid border-l border-t border-white/15 sm:grid-cols-2">
            {copy.driverlessEvents.map(([title, english, points]) => (
              <article key={title} className="min-h-72 border-b border-r border-white/15 p-8 lg:p-10">
                <p className="font-heading text-5xl font-black text-racing-green">{points}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{copy.points}</p>
                <p className="mt-14 text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{english}</p>
                <h3 className="mt-3 font-heading text-3xl font-bold uppercase">{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.galleryEyebrow}</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">{copy.galleryTitle}</h2>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/50">
              {copy.galleryText}
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden border border-white/15 bg-white/15 lg:grid-cols-3">
            {galleryImages.map((image, index) => (
              <figure key={image.src} className="bg-[#071b14]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className={`object-cover transition-transform duration-500 hover:scale-[1.02] ${index === 0 ? 'object-[50%_64%]' : ''}`}
                  />
                </div>
                <figcaption className="min-h-60 border-t border-white/10 p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">0{index + 1} · FORMULA STUDENT ROMANIA</p>
                  <h3 className="mt-4 font-heading text-3xl font-bold uppercase">{image.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/50">{image.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function FormulaStudentPage() {
  return <FormulaStudentPageContent />;
}
