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

export default function VehiclesPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="2007’den bugüne · Mühendislik mirası"
        title="Araçlarımız"
        description="Hidrojen ve güneş enerjili verimlilik araçlarından Formula Student otomobillerine uzanan bu çizgi, her kuşağın öğrendiğini bir sonraki araca aktardığı ortak mühendislik hafızamızdır."
        aside={<p className="mt-6 font-heading text-3xl font-bold uppercase tracking-[0.04em] text-racing-green">7 araç · 19 yıllık birikim</p>}
      />

      <section className="bg-ink px-5 pb-20 text-white lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="border-t border-white/15 pt-10">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Bu yolda başardıklarımız</p>
                <h2 className="mt-4 font-heading text-5xl font-black uppercase leading-[0.9] sm:text-7xl">Bir araçtan diğerine.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/50">Her proje farklı bir enerji yaklaşımını ve yarış hedefini temsil ediyor. Ortak nokta ise tasarımın, üretimin ve pistte doğrulamanın öğrenciler tarafından yürütülmesi.</p>
            </div>

            <div className="relative mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-7 xl:gap-0">
              <div className="absolute left-0 right-0 top-[15.5rem] hidden h-px bg-racing-green/60 xl:block" />
              {vehicleHistory.map((vehicle, index) => (
                <article key={vehicle.name} className="relative grid min-h-[420px] grid-rows-[220px_auto] border border-white/12 bg-[#071b14] p-5 xl:min-h-[500px] xl:border-r-0 xl:last:border-r">
                  <div className="relative flex items-center justify-center">
                    <Image src={vehicle.image} alt={`${vehicle.name} aracı`} fill sizes="(min-width: 1280px) 14vw, (min-width: 768px) 50vw, 100vw" className="object-contain p-2" />
                  </div>
                  <div className="relative border-t border-white/12 pt-8 xl:border-t-0">
                    <span className="absolute -top-[9px] left-0 size-4 rounded-full border-4 border-[#071b14] bg-racing-green xl:-top-[14px]" />
                    <p className="font-heading text-3xl font-black text-racing-green">{vehicle.year}</p>
                    <h3 className="mt-2 font-heading text-3xl font-bold uppercase leading-none">{vehicle.name}</h3>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-white/70">{vehicle.result}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{vehicle.category}</p>
                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/20">0{index + 1} / 07</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden border border-white/12 bg-[radial-gradient(circle_at_55%_55%,rgba(0,226,123,0.12),transparent_45%),#061811] sm:min-h-[580px]">
            <div className="tech-grid absolute inset-0 opacity-25" />
            <Image src="/vehicles/ada-02.webp" alt="54 numaralı SAUFormula ADA-02 yarış aracı" fill priority sizes="(min-width: 1024px) 56vw, 100vw" className="object-contain p-5 sm:p-10" />
            <span className="absolute right-5 top-5 border border-racing-green/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">Araç no · 54</span>
          </div>

          <div className="lg:pl-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Güncel nesil · 2026</p>
            <h2 className="mt-5 font-heading text-7xl font-black uppercase leading-[0.84] sm:text-8xl">ADA-02</h2>
            <p className="mt-8 text-lg leading-8 text-white/65">ADA-02, SETT’in enerji teknolojileri mirasını SAUFormula’nın Formula Student hedefiyle buluşturan güncel yarış otomobilidir. Araç; tasarım kararlarının üretilebilirlik, güvenilirlik ve pist performansıyla birlikte ele alındığı öğrenci liderliğinde bir geliştirme sürecinin ürünüdür.</p>
            <p className="mt-5 text-sm leading-7 text-white/45">Formula Student Romania sürecinde takım; teknik kontroller, statik sunumlar, paddock hazırlıkları ve pist operasyonlarını aynı hafta içinde yönetti. Bu deneyim, araç kadar takımın çalışma sistemini de bir sonraki seviyeye taşıdı.</p>

            <dl className="mt-10 grid grid-cols-3 border-y border-white/15">
              {[
                ['Araç', 'ADA-02'], ['Numara', '54'], ['Sezon', '2026'],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-white/15 px-3 py-5 first:pl-0 last:border-r-0">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">{label}</dt>
                  <dd className="mt-2 font-heading text-2xl font-black uppercase sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid border-l border-t border-white/15 md:grid-cols-3">
            {[
              ['Teknik bütünlük', 'Motor, aerodinamik, kompozit ve elektronik sistemleri tek bir araç mimarisinde birlikte geliştiriyoruz.'],
              ['Üretim kültürü', 'Hesap ve simülasyonları atölyedeki üretim kararlarıyla buluşturuyor, parçaları ölçüm ve test sonuçlarıyla doğruluyoruz.'],
              ['Yarış deneyimi', 'Statik sunumlardan dinamik etaplara kadar bütün yarış haftasını, aracın ve ekibin ortak performansı olarak ele alıyoruz.'],
            ].map(([title, text], index) => (
              <article key={title} className="min-h-72 border-b border-r border-white/15 p-8 lg:p-10">
                <p className="font-heading text-3xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-14 font-heading text-3xl font-bold uppercase">{title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
