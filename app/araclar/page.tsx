import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { VehicleHistory, type VehicleDetail } from '@/components/vehicle-history';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Araçlarımız · 2007’den ADA-02’ye',
  description: 'SETT ve SAUFormula mühendislik mirası: Hidrokartal’dan ADA-02’ye uzanan yarış araçları.',
  alternates: { canonical: '/araclar', languages: { 'tr-TR': '/araclar', 'en-US': '/en/araclar' } },
};

const vehicleHistory: Record<Language, VehicleDetail[]> = {
  tr: [
    { year: '2007', name: 'Hidrokartal', result: 'Türkiye 2.si', category: 'TÜBİTAK Hidromobil Yarışması', image: '/vehicles/hidrokartal.webp', technology: 'Hidrojen yakıt hücresi', competition: 'TÜBİTAK Hidromobil 2007', description: 'SETT’in hidrojen yakıt hücreli mobilite çalışmalarının ilk güçlü kilometre taşlarından biri olan Hidrokartal, TÜBİTAK Hidromobil Yarışması için geliştirildi. Türkiye ikinciliği; tasarım, üretim ve takım çalışmasında sonraki araçlara aktarılan temel deneyimi oluşturdu.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2008', name: 'HidroSETT-2', result: 'Türkiye 6.sı', category: 'Hidrojen enerjili', image: '/vehicles/hidrosett-2.webp', technology: 'Hidrojen enerjisi', competition: 'Hidrojen Enerjili Otomobil Yarışması 2008', description: 'HidroSETT-2, ekibin hidrojen enerjili araç geliştirme çizgisini ikinci sezona taşıdı. 2008’de düzenlenen Hidrojen Enerjili Otomobil Yarışması’nı Türkiye altıncısı olarak tamamlayarak yakıt hücresi, araç entegrasyonu ve yarış operasyonu bilgisini büyüttü.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2009', name: 'TUAR', result: 'Türkiye 3.sü', category: 'TÜBİTAK Hidromobil Yarışları', image: '/vehicles/tuar.webp', technology: 'Hidrojen yakıt hücresi', competition: 'TÜBİTAK Hidromobil 2009', description: 'TUAR, 2009 TÜBİTAK Hidromobil yarışları için geliştirilen hidrojen yakıt hücreli bir araçtı. Temiz enerjiyle hareket hedefini aerodinamik gövde, düşük tüketim ve yarış güvenilirliğiyle bir araya getiren proje Türkiye üçüncülüğüne ulaştı.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2010', name: 'SETTAR', result: 'Türkiye 1.si · Avrupa 7.si', category: 'Shell Eco-marathon', image: '/vehicles/settar.webp', technology: 'Hidrojen yakıt hücresi', competition: 'Shell Eco-marathon Europe 2010', description: 'SETTAR, depolanan hidrojeni yakıt hücresinde elektrik enerjisine dönüştürerek elektrik motorunu besleyen şehir konseptli bir verimlilik aracıydı. Shell Eco-marathon Europe 2010’da kendi kategorisinde Avrupa yedincisi ve Türkiye birincisi oldu.', sourceUrl: 'https://www.shell.com.tr/media/_jcr_content/root/main/section_1073788075/promo_copy_164329186_1100663819/links/item0.stream/1721053140325/7687b5722a02d2a72f92e2db29f9515d96c4b06f/2011-pr-turkey.pdf' },
    { year: '2013', name: 'SUNSETT', result: 'Türkiye 2.si', category: 'Formula-G Olympia', image: '/vehicles/formula-g.webp', technology: 'Güneş enerjisi', competition: 'Formula-G Olympia', description: 'SUNSETT, SETT’in hidrojen çalışmalarından güneş enerjili mobiliteye uzanan mühendislik çeşitliliğini temsil etti. Güneşten elde edilen enerjiyi yarış performansına dönüştüren araç, Formula-G Olympia’da Türkiye ikinciliği kazandı.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2024–25', name: 'ADA-01', result: 'Avrupa 2.si · Türkiye 1.si', category: 'Formula Student', image: '/vehicles/ada-01.webp', technology: 'İçten yanmalı Formula Student', competition: 'Formula Student', description: 'ADA-01, SAUFormula’nın ilk Formula Student otomobili ve takımın yarış aracı geliştirme altyapısının başlangıcı oldu. İçten yanmalı sınıfta geliştirilen projede hafif gövde yaklaşımı ve paslanmaz çelik şasi öne çıktı; ekip, Formula Student Russia’nın Project Work kategorisinde ikincilik elde etti.', sourceUrl: 'https://uticdergisi.sakarya.edu.tr/hayallerin-hizla-bulustugu-nokta-sau-formula/', scale: 0.78 },
    { year: '2026', name: 'ADA-02', result: 'FORMULA STUDENT ROMANIA', category: 'Formula Student', image: '/vehicles/ada-02.webp', technology: 'Formula Student yarış otomobili', competition: 'Formula Student Romania 2026', description: 'ADA-02, yaklaşık bir yıllık tasarım, analiz ve üretim sürecinde baştan geliştirildi. On yedi kişilik SAUFormula ekibi aracı Formula Student Romania 2026’ya taşıdı; teknik incelemelerin yanı sıra statik ve dinamik etaplarda uluslararası mühendislik deneyimi kazandı.', sourceUrl: 'https://haber.sakarya.edu.tr/saul-renciler-ada02-ile-uluslararas-arenada', scale: 1.14 },
  ],
  en: [
    { year: '2007', name: 'Hidrokartal', result: '2nd in Türkiye', category: 'TÜBİTAK Hydromobile Competition', image: '/vehicles/hidrokartal.webp', technology: 'Hydrogen fuel cell', competition: 'TÜBİTAK Hydromobile 2007', description: 'Hidrokartal was one of the first major milestones in SETT’s hydrogen fuel-cell mobility work. Developed for the TÜBİTAK Hydromobile Competition, its second-place finish in Türkiye established design, manufacturing and teamwork experience that carried into later cars.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2008', name: 'HidroSETT-2', result: '6th in Türkiye', category: 'Hydrogen-powered', image: '/vehicles/hidrosett-2.webp', technology: 'Hydrogen energy', competition: 'Hydrogen Car Competition 2008', description: 'HidroSETT-2 carried the team’s hydrogen-powered vehicle programme into a second season. It finished sixth in Türkiye at the 2008 Hydrogen-Powered Automobile Competition, expanding the team’s knowledge of fuel cells, vehicle integration and race operations.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2009', name: 'TUAR', result: '3rd in Türkiye', category: 'TÜBİTAK Hydromobile Competition', image: '/vehicles/tuar.webp', technology: 'Hydrogen fuel cell', competition: 'TÜBİTAK Hydromobile 2009', description: 'TUAR was a hydrogen fuel-cell vehicle developed for the 2009 TÜBİTAK Hydromobile competition. The project combined clean-energy propulsion with an aerodynamic body, low consumption and race reliability, earning third place in Türkiye.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2010', name: 'SETTAR', result: '1st in Türkiye · 7th in Europe', category: 'Shell Eco-marathon', image: '/vehicles/settar.webp', technology: 'Hydrogen fuel cell', competition: 'Shell Eco-marathon Europe 2010', description: 'SETTAR was an urban-concept efficiency car whose fuel cell converted stored hydrogen into electricity for its motor. At Shell Eco-marathon Europe 2010, it finished seventh in Europe and first among the Turkish entrants in its category.', sourceUrl: 'https://www.shell.com.tr/media/_jcr_content/root/main/section_1073788075/promo_copy_164329186_1100663819/links/item0.stream/1721053140325/7687b5722a02d2a72f92e2db29f9515d96c4b06f/2011-pr-turkey.pdf' },
    { year: '2013', name: 'SUNSETT', result: '2nd in Türkiye', category: 'Formula-G Olympia', image: '/vehicles/formula-g.webp', technology: 'Solar energy', competition: 'Formula-G Olympia', description: 'SUNSETT represents the breadth of SETT’s engineering journey from hydrogen research to solar mobility. Transforming solar energy into race performance, the car secured second place in Türkiye at Formula-G Olympia.', sourceUrl: 'https://enerjiteknolojileri.org/projeler/projeler.html' },
    { year: '2024–25', name: 'ADA-01', result: '2nd in Europe · 1st in Türkiye', category: 'Formula Student', image: '/vehicles/ada-01.webp', technology: 'Combustion Formula Student', competition: 'Formula Student', description: 'ADA-01 became SAUFormula’s first Formula Student car and the foundation of its race-car development programme. Developed for the combustion class, it featured a lightweight body approach and a stainless-steel chassis; the team placed second in Formula Student Russia’s Project Work category.', sourceUrl: 'https://uticdergisi.sakarya.edu.tr/hayallerin-hizla-bulustugu-nokta-sau-formula/', scale: 0.78 },
    { year: '2026', name: 'ADA-02', result: 'FORMULA STUDENT ROMANIA', category: 'Formula Student', image: '/vehicles/ada-02.webp', technology: 'Formula Student race car', competition: 'Formula Student Romania 2026', description: 'ADA-02 was redesigned and built through roughly a year of design, analysis and manufacturing work. A 17-member SAUFormula team took the car to Formula Student Romania 2026, gaining international engineering experience through technical inspection and the static and dynamic events.', sourceUrl: 'https://haber.sakarya.edu.tr/saul-renciler-ada02-ile-uluslararas-arenada', scale: 1.14 },
  ],
};

const pageCopy = {
  tr: {
    eyebrow: '2007’den bugüne · Mühendislik mirası', title: 'Araçlarımız', description: 'Hidrojen ve güneş enerjili verimlilik araçlarından Formula Student otomobillerine uzanan ortak mühendislik hafızamız.', aside: '7 araç · 19 yıllık birikim',
    frontAlt: 'ADA-02 ön görünümü', frontLabel: 'Ön görünüm', rearAlt: 'ADA-02 arka görünümü', rearLabel: 'Arka görünüm',
    current: 'Güncel nesil · 2026', currentText: 'ADA-02, SETT’in enerji teknolojileri mirasını SAUFormula’nın Formula Student hedefiyle buluşturan güncel yarış otomobilidir. Üretilebilirlik, güvenilirlik ve pist performansı aynı geliştirme döngüsünde ele alınır.', currentNote: 'Formula Student Romania’da teknik kontroller, statik sunumlar, paddock hazırlıkları ve pist operasyonları takım tarafından birlikte yönetildi.',
    car: 'Araç', number: 'Numara', season: 'Sezon', achievements: 'Bu yolda başardıklarımız', heritage: 'Mühendislik mirası', heritageText: 'Her proje farklı bir enerji yaklaşımını temsil eder; tasarım ve üretim deneyimi aynı çizgide bir sonraki araca aktarılır.', vehicleAlt: 'aracının tamamı', inspect: 'Araç dosyasını aç', dialogEyebrow: 'Mühendislik arşivi', story: 'Proje hikâyesi', technology: 'Teknoloji', competition: 'Yarışma', achievement: 'Derece', source: 'Kaynağı incele', previous: 'Önceki araç', next: 'Sonraki araç', close: 'Pencereyi kapat',
  },
  en: {
    eyebrow: 'Engineering heritage · Since 2007', title: 'Our Cars', description: 'Our shared engineering memory, from hydrogen and solar-efficiency vehicles to Formula Student race cars.', aside: '7 cars · 19 years of experience',
    frontAlt: 'Front view of ADA-02', frontLabel: 'Front view', rearAlt: 'Rear view of ADA-02', rearLabel: 'Rear view',
    current: 'Current generation · 2026', currentText: 'ADA-02 is our current race car, bringing SETT’s energy-technology heritage together with SAUFormula’s Formula Student ambition. Manufacturability, reliability and track performance are developed in the same cycle.', currentNote: 'At Formula Student Romania, the team managed technical inspections, static presentations, paddock preparation and track operations together.',
    car: 'Car', number: 'Number', season: 'Season', achievements: 'What we achieved along the way', heritage: 'Engineering heritage', heritageText: 'Each project represents a different approach to energy, while its design and manufacturing experience carries forward into the next car.', vehicleAlt: 'race car in full view', inspect: 'Open vehicle file', dialogEyebrow: 'Engineering archive', story: 'Project story', technology: 'Technology', competition: 'Competition', achievement: 'Result', source: 'View source', previous: 'Previous car', next: 'Next car', close: 'Close window',
  },
};

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

          <VehicleHistory vehicles={vehicles} language={language} copy={copy} />
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function VehiclesPage() {
  return <VehiclesPageContent />;
}
