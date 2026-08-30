import type { Metadata } from 'next';
import Image from 'next/image';
import { BriefcaseBusiness, Calculator, Cog, Gauge, Infinity as InfinityIcon, Route, ShieldCheck, Zap } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Formula Student',
  description:
    'Formula Student yarışmasının yapısı, statik ve dinamik etapları, 2026 puan dağılımı ve SAUFormula’nın yarış deneyimi.',
};

const staticEvents = [
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

const dynamicEvents = [
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

const galleryImages = [
  {
    src: '/media/fs-romania-grid-wide.webp',
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

export default function FormulaStudentPage() {
  return (
    <main>
      <SiteHeader />
      <section className="relative overflow-hidden bg-ink px-5 pb-16 pt-32 text-white lg:px-10 lg:pb-20 lg:pt-36">
        <div className="tech-grid absolute inset-0 opacity-20" />
        <div className="mx-auto max-w-[1500px]">
          <div className="relative grid gap-8 border-b border-white/15 pb-9 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Tasarım · Üretim · Doğrulama · Yarış</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88] tracking-[0.01em]">Formula Student Nedir?</h1>
            </div>
            <div className="grid gap-7 text-base leading-8 text-white/60 sm:grid-cols-2">
              <p>
                Formula Student, üniversite öğrencilerinin tek kişilik bir yarış otomobilini sıfırdan araştırdığı, tasarladığı, ürettiği ve test ettiği uluslararası bir mühendislik yarışmasıdır.
              </p>
              <p>
                Takımlar teknik kararlarını, üretim planını, maliyetini ve iş modelini jüri karşısında savunur; hız, çeviklik, dayanıklılık ve enerji verimliliğini pistte kanıtlar.
              </p>
            </div>
          </div>

          <figure className="relative mt-8 overflow-hidden border border-white/10 bg-[#071b14]">
            <div className="relative aspect-[16/7] min-h-[300px]">
              <Image
                src="/media/fs-romania-grid-wide.webp"
                alt="Formula Student Romania yarış alanında farklı üniversitelerin araçları"
                fill
                sizes="100vw"
                className="object-cover object-[50%_82%]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
            </div>
            <figcaption className="flex flex-col gap-2 border-t border-white/10 px-6 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
              <span>Formula Student Romania yarış alanı</span>
              <span>SAUFormula takım arşivi</span>
            </figcaption>
          </figure>

          <div className="mt-8 grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['325', 'Statik etap puanı'],
              ['525', 'Sürücülü dinamik etap puanı'],
              ['150', 'Opsiyonel sürücüsüz etap puanı'],
              ['1000', 'Azami toplam puan'],
            ].map(([value, label]) => (
              <div key={label} className="border-b border-r border-white/15 p-7">
                <p className="font-heading text-5xl font-black text-racing-green">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-4xl text-xs leading-6 text-white/35">
            Puanlar 2026 uluslararası Formula Student kurallarındaki CV/EV dağılımını gösterir. Yarış organizasyonunun etkinlik el kitabı uygulama ayrıntılarını değiştirebilir.
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">01 · Pist öncesi değerlendirme</p>
              <h2 className="mt-4 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">Statik Etaplar</h2>
            </div>
            <div className="lg:text-right">
              <p className="font-heading text-6xl font-black text-racing-green">325</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Toplam puan</p>
            </div>
          </div>

          <div className="mt-9 grid gap-x-10 gap-y-10 lg:grid-cols-3">
            {staticEvents.map((event) => {
              const Icon = event.icon;

              return (
                <article key={event.title} className="border-t border-white/15 pt-8">
                  <div className="flex items-start justify-between gap-5">
                    <Icon className="size-14 stroke-[1.4] text-racing-green" aria-hidden="true" />
                    <span className="bg-racing-green px-4 py-2 font-heading text-2xl font-black text-ink">{event.points} Puan</span>
                  </div>
                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{event.english}</p>
                  <h3 className="mt-3 font-heading text-3xl font-bold uppercase leading-tight">{event.title}</h3>
                  <p className="mt-6 text-sm leading-7 text-white/60">{event.text}</p>
                  <div className="mt-7 border-l-2 border-racing-green/60 pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Jürinin odağı</p>
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
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">02 · Pist üzerindeki değerlendirme</p>
              <h2 className="mt-4 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">Dinamik Etaplar</h2>
            </div>
            <div className="lg:text-right">
              <p className="font-heading text-6xl font-black text-racing-green">525</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Sürücülü etap puanı</p>
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
                    <span className="bg-racing-green px-4 py-2 font-heading text-2xl font-black text-ink">{event.points} Puan</span>
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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">03 · Opsiyonel sürücüsüz etaplar</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">150 ek puan.</h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/50">
              2026 kurallarında CV ve EV takımları, otonom sistemi uygun olan araçlarla sürücüsüz Hızlanma ve Skidpad etaplarından ilave puan kazanabilir. Bu nedenle sürücülü beş dinamik etabın 525 puanına 150 puanlık opsiyonel bölüm eklenir.
            </p>
          </div>
          <div className="grid border-l border-t border-white/15 sm:grid-cols-2">
            {[
              ['Sürücüsüz Hızlanma', 'Driverless Acceleration', '75'],
              ['Sürücüsüz Skidpad', 'Driverless Skidpad', '75'],
            ].map(([title, english, points]) => (
              <article key={title} className="min-h-72 border-b border-r border-white/15 p-8 lg:p-10">
                <p className="font-heading text-5xl font-black text-racing-green">{points}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Puan</p>
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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Yarış haftasından</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">Formula Student Romania.</h2>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/50">
              Etap açıklamalarından bağımsız bu galeri, ADA-02’nin yarış alanındaki hazırlıklarını, takım çalışmasını ve Formula Student atmosferini gösteriyor.
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">0{index + 1} · Formula Student Romania</p>
                  <h3 className="mt-4 font-heading text-3xl font-bold uppercase">{image.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/50">{image.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
