import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Araçlarımız · 2007’den ADA-02’ye',
  description: 'SETT ve SAUFormula mühendislik mirası: Hidrokartal’dan ADA-02’ye uzanan yarış araçları.',
  alternates: { canonical: '/araclar', languages: { 'tr-TR': '/araclar', 'en-US': '/en/araclar' } },
};

type Vehicle = { year: string; name: string; result: string; category: string; image: string; scale: number };

const vehicleHistory: Record<Language, Vehicle[]> = {
  tr: [
    { year: '2007', name: 'Hidrokartal', result: 'Türkiye 2.si', category: 'TÜBİTAK Hidromobil Yarışması', image: '/vehicles/hidrokartal.png', scale: 1.04 },
    { year: '2008', name: 'HidroSETT-2', result: 'Türkiye 6.sı', category: 'Hidrojen enerjili', image: '/vehicles/hidrosett-2.png', scale: 0.9 },
    { year: '2009', name: 'TUAR', result: 'Türkiye 3.sü', category: 'TÜBİTAK Hidromobil Yarışları', image: '/vehicles/tuar.png', scale: 1.05 },
    { year: '2010', name: 'SETTAR', result: 'Türkiye 1.si · Avrupa 7.si', category: 'Shell Eco-marathon', image: '/vehicles/settar.png', scale: 1.04 },
    { year: '2013', name: 'SUNSETT', result: 'Türkiye 2.si', category: 'Formula-G Olympia', image: '/vehicles/formula-g.png', scale: 1 },
    { year: '2024–25', name: 'ADA-01', result: 'Avrupa 2.si · Türkiye 1.si', category: 'Formula Student', image: '/vehicles/ada-01.png', scale: 0.76 },
    { year: '2026', name: 'ADA-02', result: 'FORMULA STUDENT ROMANIA', category: 'Formula Student', image: '/vehicles/ada-02.png', scale: 1.28 },
  ],
  en: [
    { year: '2007', name: 'Hidrokartal', result: '2nd in Türkiye', category: 'TÜBİTAK Hydromobile Competition', image: '/vehicles/hidrokartal.png', scale: 1.04 },
    { year: '2008', name: 'HidroSETT-2', result: '6th in Türkiye', category: 'Hydrogen-powered', image: '/vehicles/hidrosett-2.png', scale: 0.9 },
    { year: '2009', name: 'TUAR', result: '3rd in Türkiye', category: 'TÜBİTAK Hydromobile Competition', image: '/vehicles/tuar.png', scale: 1.05 },
    { year: '2010', name: 'SETTAR', result: '1st in Türkiye · 7th in Europe', category: 'Shell Eco-marathon', image: '/vehicles/settar.png', scale: 1.04 },
    { year: '2013', name: 'SUNSETT', result: '2nd in Türkiye', category: 'Formula-G Olympia', image: '/vehicles/formula-g.png', scale: 1 },
    { year: '2024–25', name: 'ADA-01', result: '2nd in Europe · 1st in Türkiye', category: 'Formula Student', image: '/vehicles/ada-01.png', scale: 0.76 },
    { year: '2026', name: 'ADA-02', result: 'FORMULA STUDENT ROMANIA', category: 'Formula Student', image: '/vehicles/ada-02.png', scale: 1.28 },
  ],
};

const pageCopy = {
  tr: {
    eyebrow: '2007’den bugüne · Mühendislik mirası', title: 'Araçlarımız', description: 'Hidrojen ve güneş enerjili verimlilik araçlarından Formula Student otomobillerine uzanan ortak mühendislik hafızamız.', aside: '7 araç · 19 yıllık birikim',
    frontAlt: 'ADA-02 ön görünümü', frontLabel: 'Ön görünüm', rearAlt: 'ADA-02 arka görünümü', rearLabel: 'Arka görünüm',
    current: 'Güncel nesil · 2026', currentText: 'ADA-02, SETT’in enerji teknolojileri mirasını SAUFormula’nın Formula Student hedefiyle buluşturan güncel yarış otomobilidir. Üretilebilirlik, güvenilirlik ve pist performansı aynı geliştirme döngüsünde ele alınır.', currentNote: 'Formula Student Romania’da teknik kontroller, statik sunumlar, paddock hazırlıkları ve pist operasyonları takım tarafından birlikte yönetildi.',
    car: 'Araç', number: 'Numara', season: 'Sezon', achievements: 'Bu yolda başardıklarımız', heritage: 'Mühendislik mirası', heritageText: 'Her proje farklı bir enerji yaklaşımını temsil eder; tasarım ve üretim deneyimi aynı çizgide bir sonraki araca aktarılır.', vehicleAlt: 'aracının tamamı',
  },
  en: {
    eyebrow: 'Engineering heritage · Since 2007', title: 'Our Cars', description: 'Our shared engineering memory, from hydrogen and solar-efficiency vehicles to Formula Student race cars.', aside: '7 cars · 19 years of experience',
    frontAlt: 'Front view of ADA-02', frontLabel: 'Front view', rearAlt: 'Rear view of ADA-02', rearLabel: 'Rear view',
    current: 'Current generation · 2026', currentText: 'ADA-02 is our current race car, bringing SETT’s energy-technology heritage together with SAUFormula’s Formula Student ambition. Manufacturability, reliability and track performance are developed in the same cycle.', currentNote: 'At Formula Student Romania, the team managed technical inspections, static presentations, paddock preparation and track operations together.',
    car: 'Car', number: 'Number', season: 'Season', achievements: 'What we achieved along the way', heritage: 'Engineering heritage', heritageText: 'Each project represents a different approach to energy, while its design and manufacturing experience carries forward into the next car.', vehicleAlt: 'race car in full view',
  },
};

function VehicleCopy({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="min-w-0">
      <p className="font-heading text-2xl font-black text-racing-green">{vehicle.year}</p>
      <h3 className="mt-1 break-words font-heading text-xl font-bold uppercase leading-none 2xl:text-2xl">{vehicle.name}</h3>
      <p className="mt-3 text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-white/70 2xl:text-[10px]">{vehicle.result}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{vehicle.category}</p>
    </div>
  );
}

function VehicleVisual({
  vehicle,
  className = 'h-52',
  language,
}: {
  vehicle: Vehicle;
  className?: string;
  language: Language;
}) {
  return (
    <div className={`relative flex w-full items-center justify-center overflow-visible ${className}`}>
      <Image
        src={vehicle.image}
        alt={`${vehicle.name} ${pageCopy[language].vehicleAlt}`}
        draggable={false}
        fill
        sizes="(min-width: 1280px) 235px, (min-width: 640px) 45vw, 100vw"
        className="object-contain"
        style={{ transform: `scale(${vehicle.scale})`, transformOrigin: 'center' }}
      />
    </div>
  );
}

export function VehiclesPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];
  const vehicles = vehicleHistory[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        aside={<p className="mt-4 font-heading text-2xl font-bold uppercase text-racing-green">{copy.aside}</p>}
        language={language}
      />

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-14 lg:px-10 lg:py-18">
        <div className="mx-auto grid max-w-[1650px] gap-10 lg:grid-cols-[1.38fr_0.62fr] lg:items-center">
          <div className="grid gap-2 overflow-hidden border border-white/12 bg-[#071b14] sm:grid-cols-2">
            {[
              ['/media/ada02-front-square.jpg', copy.frontAlt, copy.frontLabel],
              ['/media/ada02-rear-square.jpg', copy.rearAlt, copy.rearLabel],
            ].map(([src, alt, label]) => (
              <figure key={src} className="relative aspect-square overflow-hidden bg-[#061811]">
                <Image src={src} alt={alt} fill priority sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw" className="object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                <figcaption className="absolute bottom-4 left-4 border border-white/20 bg-ink/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  {label}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="lg:pl-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.current}</p>
            <h2 className="mt-3 font-heading text-6xl font-black uppercase leading-none sm:text-7xl">ADA-02</h2>
            <p className="mt-6 text-base leading-8 text-white/60">{copy.currentText}</p>
            <p className="mt-4 text-sm leading-7 text-white/40">{copy.currentNote}</p>
            <dl className="mt-7 grid grid-cols-3 border-y border-white/15">
              {[
                [copy.car, 'ADA-02'], [copy.number, '54'], [copy.season, '2026'],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-white/15 px-3 py-4 first:pl-0 last:border-r-0">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">{label}</dt>
                  <dd className="mt-1 font-heading text-2xl font-black uppercase">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-16 text-white lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1650px] border-t border-white/15 pt-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.achievements}</p>
              <h2 className="mt-3 font-heading text-4xl font-black uppercase sm:text-5xl">{copy.heritage}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/45">{copy.heritageText}</p>
          </div>

          <div className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:hidden">
            {vehicles.map((vehicle) => (
              <article key={vehicle.name} className="grid min-h-64 grid-cols-[1.08fr_0.92fr] items-center border-t border-white/15 py-5">
                <VehicleVisual vehicle={vehicle} className="h-56" language={language} />
                <div className="border-l border-white/10 pl-5">
                  <VehicleCopy vehicle={vehicle} />
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-12 hidden xl:block">
            <div className="absolute left-[7.14%] right-[7.14%] top-[7px] h-px bg-racing-green/70" />
            <div className="relative grid grid-cols-7 gap-3">
              {vehicles.map((vehicle) => (
                <article key={vehicle.name} className="min-w-0 text-center">
                  <div className="grid h-4 place-items-center">
                    <span className="z-10 size-4 rounded-full border-4 border-ink bg-racing-green" />
                  </div>
                  <div className="mt-6">
                    <VehicleVisual vehicle={vehicle} className="mx-auto h-[220px] max-w-[235px] 2xl:h-[240px] 2xl:max-w-[260px]" language={language} />
                    <div className="mx-auto mt-4 max-w-[230px] border-t border-white/15 pt-4">
                      <VehicleCopy vehicle={vehicle} />
                    </div>
                  </div>
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

export default function VehiclesPage() {
  return <VehiclesPageContent />;
}
