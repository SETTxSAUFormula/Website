import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Araçlarımız · 2007’den ADA-02’ye',
  description: 'SETT ve SAUFormula mühendislik mirası: Hidrokartal’dan ADA-02’ye uzanan yarış araçları.',
};

const vehicleHistory = [
  { year: '2007', name: 'Hidrokartal', result: 'Türkiye 2.si', category: 'Hidrojen enerjili', image: '/vehicles/hidrokartal.webp' },
  { year: '2008', name: 'HidroSETT-2', result: 'Türkiye 6.sı', category: 'Hidrojen enerjili', image: '/vehicles/hidrosett-2.webp' },
  { year: '2009', name: 'TUAR', result: 'Türkiye 3.sü', category: 'Hidrojen yakıt pilli', image: '/vehicles/tuar.webp' },
  { year: '2010', name: 'SETTAR', result: 'Türkiye 1.si · Avrupa 7.si', category: 'Enerji verimliliği', image: '/vehicles/settar.webp' },
  { year: '2013', name: 'Formula-G', result: 'Türkiye 2.si', category: 'Güneş enerjili', image: '/vehicles/formula-g.webp' },
  { year: '2024–25', name: 'ADA-01', result: 'Avrupa 2.si · Türkiye 1.si', category: 'Formula Student', image: '/vehicles/ada-01.webp' },
  { year: '2026', name: 'ADA-02', result: 'Formula Student Romania', category: 'Formula Student', image: '/vehicles/ada-02.webp' },
];

function VehicleCopy({ vehicle }: { vehicle: (typeof vehicleHistory)[number] }) {
  return (
    <div>
      <p className="font-heading text-2xl font-black text-racing-green">{vehicle.year}</p>
      <h3 className="mt-1 font-heading text-2xl font-bold uppercase leading-none">{vehicle.name}</h3>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">{vehicle.result}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{vehicle.category}</p>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="2007’den bugüne · Mühendislik mirası"
        title="Araçlarımız"
        description="Hidrojen ve güneş enerjili verimlilik araçlarından Formula Student otomobillerine uzanan ortak mühendislik hafızamız."
        aside={<p className="mt-4 font-heading text-2xl font-bold uppercase text-racing-green">7 araç · 19 yıllık birikim</p>}
      />

      <section className="bg-ink px-5 pb-16 text-white lg:px-10 lg:pb-20">
        <div className="mx-auto max-w-[1500px] border-t border-white/15 pt-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Bu yolda başardıklarımız</p>
              <h2 className="mt-3 font-heading text-4xl font-black uppercase sm:text-5xl">Mühendislik mirası</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/45">Her proje farklı bir enerji yaklaşımını temsil eder; tasarım ve üretim deneyimi aynı çizgide bir sonraki araca aktarılır.</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:hidden">
            {vehicleHistory.map((vehicle) => (
              <article key={vehicle.name} className="grid grid-cols-[0.95fr_1.05fr] items-center border border-white/12 bg-[#071b14] p-4">
                <div className="relative min-h-40 overflow-visible">
                  <Image src={vehicle.image} alt={`${vehicle.name} aracı`} fill sizes="45vw" className="scale-105 object-contain" />
                </div>
                <VehicleCopy vehicle={vehicle} />
              </article>
            ))}
          </div>

          <div className="relative mt-8 hidden min-h-[660px] grid-cols-7 xl:grid">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-racing-green/70" />
            {vehicleHistory.map((vehicle, index) => {
              const image = (
                <div className="relative mx-[-12%] min-h-[245px] overflow-visible">
                  <Image src={vehicle.image} alt={`${vehicle.name} aracı`} fill sizes="17vw" className="scale-110 object-contain" />
                </div>
              );
              const copy = <VehicleCopy vehicle={vehicle} />;

              return (
                <article key={vehicle.name} className="relative grid grid-rows-[1fr_42px_1fr] px-3">
                  <div className={`flex flex-col justify-end pb-5 ${index % 2 === 0 ? '' : 'pt-8'}`}>{index % 2 === 0 ? image : copy}</div>
                  <div className="relative grid place-items-center">
                    <span className="z-10 size-4 rounded-full border-4 border-ink bg-racing-green" />
                  </div>
                  <div className="flex flex-col justify-start pt-5">{index % 2 === 0 ? copy : image}</div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative flex min-h-[390px] items-center justify-center overflow-visible border border-white/12 bg-[radial-gradient(circle_at_50%_50%,rgba(0,226,123,0.12),transparent_52%),#061811] sm:min-h-[520px]">
            <div className="tech-grid absolute inset-0 opacity-20" />
            <Image src="/vehicles/ada-02.webp" alt="54 numaralı SAUFormula ADA-02 yarış aracı" width={1100} height={820} priority className="relative z-10 h-auto w-[112%] max-w-none object-contain sm:w-[118%]" />
            <span className="absolute right-4 top-4 z-20 border border-racing-green/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">Araç no · 54</span>
          </div>

          <div className="lg:pl-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Güncel nesil · 2026</p>
            <h2 className="mt-3 font-heading text-6xl font-black uppercase leading-none sm:text-7xl">ADA-02</h2>
            <p className="mt-6 text-base leading-8 text-white/60">ADA-02, SETT’in enerji teknolojileri mirasını SAUFormula’nın Formula Student hedefiyle buluşturan güncel yarış otomobilidir. Üretilebilirlik, güvenilirlik ve pist performansı aynı geliştirme döngüsünde ele alınır.</p>
            <p className="mt-4 text-sm leading-7 text-white/40">Formula Student Romania’da teknik kontroller, statik sunumlar, paddock hazırlıkları ve pist operasyonları takım tarafından birlikte yönetildi.</p>
            <dl className="mt-7 grid grid-cols-3 border-y border-white/15">
              {[
                ['Araç', 'ADA-02'], ['Numara', '54'], ['Sezon', '2026'],
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

      <SiteFooter />
    </main>
  );
}
