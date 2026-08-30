import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
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
    title: 'Mühendislik Tasarım',
    english: 'Engineering Design',
    points: 150,
    text: 'Takım; aracın mimarisini, tasarım hedeflerini, yaptığı hesapları, simülasyonları ve fiziksel test sonuçlarını otomotiv ve motor sporları uzmanlarından oluşan jüriye sunar. Yalnızca ortaya çıkan parça değil, o parçaya götüren karar süreci ve sistemlerin birbiriyle uyumu değerlendirilir.',
    focus: 'Teknik derinlik, yenilik, doğrulama, üretilebilirlik ve takımın kararlarını savunabilmesi.',
  },
  {
    number: '02',
    title: 'Maliyet ve Üretim',
    english: 'Cost & Manufacturing',
    points: 100,
    text: 'Aracın malzeme, parça, işçilik ve üretim adımları ayrıntılı bir maliyet raporuna dönüştürülür. Jüri; seçilen üretim yöntemlerinin gerçekçiliğini, maliyet etkinliğini ve takımın bütçe–performans dengesini nasıl yönettiğini sorgular.',
    focus: 'Maliyet doğruluğu, üretim bilgisi, süreç planlama ve değişen bir senaryoya verilen mühendislik tepkisi.',
  },
  {
    number: '03',
    title: 'İş Planı Sunumu',
    english: 'Business Plan Presentation',
    points: 75,
    text: 'Takım, aracını ya da araçla ilişkili bir fikri sürdürülebilir bir iş modeline dönüştürür ve yatırımcı rolündeki jüriye sunar. Teknik ürünün yanında hedef kitle, gelir modeli, pazar yaklaşımı, finansal plan ve büyüme stratejisi de bütünlüklü biçimde ele alınır.',
    focus: 'İş fikrinin uygulanabilirliği, finansal tutarlılık, ikna gücü ve soru–cevap performansı.',
  },
];

const dynamicEvents = [
  {
    number: '01',
    title: 'Hızlanma',
    english: 'Acceleration',
    points: 50,
    image: '/media/fs-acceleration.webp',
    alt: 'ADA-02 yarış öncesinde start hazırlığında',
    text: 'Araç durur konumdan başlayarak 75 metrelik düz parkuru mümkün olan en kısa sürede tamamlar. Etap yalnızca motor gücünü değil; güç aktarımını, lastiğin zemine tutunmasını, ağırlık transferini ve sürücünün kalkış tutarlılığını birlikte sınar. Geçerli denemeler arasındaki en iyi süre puanlamada kullanılır.',
  },
  {
    number: '02',
    title: 'Skidpad',
    english: 'Skidpad',
    points: 50,
    image: '/media/fs-ada02-front.webp',
    alt: 'ADA-02 Formula Student yarış aracı önden görünüm',
    text: 'Araç, iki daireden oluşan sekiz biçimli parkurda sağ ve sol virajları tamamlar. Yanal tutunma kapasitesi, süspansiyon dengesi, direksiyon tepkisi ve lastiklerin çalışma karakteri bu etapta görünür hale gelir. Koni devirmek veya parkur sınırını ihlal etmek süre cezasına yol açar.',
  },
  {
    number: '03',
    title: 'Autocross',
    english: 'Autocross',
    points: 100,
    image: '/media/fs-romania-grid-wide.webp',
    alt: 'Formula Student Romania pist alanında yarış araçları',
    text: 'Yaklaşık 1,5 kilometreden kısa, dar ve teknik bir parkur tek tur üzerinden zamana karşı geçilir. Slalomlar, farklı yarıçaplı virajlar ve kısa düzlükler aracın çevikliğini, fren dengesini ve sürücünün çizgi hassasiyetini ortaya çıkarır. En iyi geçerli tur süresi puanı belirler.',
  },
  {
    number: '04',
    title: 'Dayanıklılık',
    english: 'Endurance',
    points: 250,
    image: '/media/fs-pit.webp',
    alt: 'SAUFormula ekibi ADA-02 üzerinde pit çalışması yaparken',
    text: 'Yaklaşık 22 kilometrelik yarış, iki sürücünün araç değişimi yapmadan yaklaşık 11’er kilometre kullanmasıyla tamamlanır. Bu en uzun ve en yüksek puanlı sürücülü etapta hız kadar güvenilirlik, termal yönetim, frenler, süspansiyon, güç aktarımı ve takımın yarış boyunca hata yapmaması belirleyicidir.',
  },
  {
    number: '05',
    title: 'Verimlilik',
    english: 'Efficiency',
    points: 75,
    image: '/media/fs-ada02-rear.webp',
    alt: 'ADA-02 yarış aracının arka ve güç aktarım sistemi görünümü',
    text: 'Verimlilik puanı, Dayanıklılık etabında kullanılan yakıt veya elektrik enerjisi ile pist performansını birlikte ele alır. Amaç parkuru yalnızca az enerjiyle değil, rekabetçi bir tempoyu koruyarak tamamlamaktır. Böylece güç yönetimi, mekanik kayıplar ve sürüş stratejisi aynı değerlendirmede birleşir.',
  },
];

export default function FormulaStudentPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="Tasarım · Üretim · Doğrulama · Yarış"
        title="Formula Student"
        description="Üniversite öğrencilerinin tek kişilik bir yarış otomobilini araştırdığı, tasarladığı, ürettiği, test ettiği ve uzman jüriler karşısında savunduğu uluslararası mühendislik yarışmasıdır."
      />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Formula Student nedir?</p>
              <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">Bir otomobilden daha büyük bir proje.</h2>
            </div>
            <div className="grid gap-7 text-base leading-8 text-white/60 sm:grid-cols-2">
              <p>
                Takımlar bir sezon boyunca gerçek bir ürün geliştirme döngüsünü yönetir: hedef belirler, tasarlar, analiz eder, üretir, test eder ve yarış alanında sonuçlarını savunur. Profesyoneller yol gösterebilir; ancak temel mühendislik kararları öğrenciler tarafından alınır.
              </p>
              <p>
                Şampiyonu yalnızca pist süresi belirlemez. Tasarım kalitesi, üretim ve maliyet bilgisi, iş planı, hız, çeviklik, dayanıklılık ve enerji verimliliği tek bir puan tablosunda birleşir.
              </p>
            </div>
          </div>

          <figure className="mt-14 overflow-hidden border border-white/10 bg-[#071b14]">
            <div className="relative min-h-[430px] lg:min-h-[680px]">
              <Image
                src="/media/fs-romania-grid.webp"
                alt="Formula Student Romania yarış alanında farklı üniversitelerin araçları"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
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

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">01 · Pist öncesi değerlendirme</p>
              <h2 className="mt-5 font-heading text-6xl font-black uppercase leading-none sm:text-8xl">Statik Etaplar</h2>
            </div>
            <div className="lg:text-right">
              <p className="font-heading text-6xl font-black text-racing-green">325</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Toplam puan</p>
            </div>
          </div>

          <div className="mt-12 grid border-l border-t border-white/15 lg:grid-cols-3">
            {staticEvents.map((event) => (
              <article key={event.title} className="flex min-h-[500px] flex-col border-b border-r border-white/15 p-8 lg:p-10">
                <div className="flex items-start justify-between gap-5">
                  <p className="font-heading text-3xl font-black text-white/25">{event.number}</p>
                  <div className="bg-racing-green px-4 py-3 text-right text-ink">
                    <p className="font-heading text-3xl font-black leading-none">{event.points}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]">Puan</p>
                  </div>
                </div>
                <div className="mt-16">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{event.english}</p>
                  <h3 className="mt-3 font-heading text-4xl font-bold uppercase leading-tight">{event.title}</h3>
                  <p className="mt-6 text-sm leading-7 text-white/60">{event.text}</p>
                </div>
                <div className="mt-auto border-t border-white/10 pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Jürinin odağı</p>
                  <p className="mt-3 text-sm leading-6 text-white/50">{event.focus}</p>
                </div>
              </article>
            ))}
          </div>

          <figure className="mt-12 overflow-hidden border border-white/10">
            <div className="relative min-h-[360px] lg:min-h-[600px]">
              <Image
                src="/media/fs-team-romania.webp"
                alt="SAUFormula takımı ADA-02 ile Formula Student Romania garaj alanında"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="border-t border-white/10 px-6 py-4 text-xs text-white/45">Takım, araç ve sunulan mühendislik aynı puan tablosunun parçalarıdır.</figcaption>
          </figure>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">02 · Pist üzerindeki değerlendirme</p>
              <h2 className="mt-5 font-heading text-6xl font-black uppercase leading-none sm:text-8xl">Dinamik Etaplar</h2>
            </div>
            <div className="lg:text-right">
              <p className="font-heading text-6xl font-black text-racing-green">525</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Sürücülü etap puanı</p>
            </div>
          </div>

          <div className="mt-12 space-y-8">
            {dynamicEvents.map((event, index) => (
              <article key={event.title} className="grid overflow-hidden border border-white/15 bg-[#071b14] lg:grid-cols-2">
                <div className={`relative min-h-[380px] lg:min-h-[560px] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image src={event.image} alt={event.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className={`flex flex-col p-8 sm:p-12 lg:p-16 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="flex items-start justify-between gap-6">
                    <p className="font-heading text-4xl font-black text-white/20">{event.number}</p>
                    <div className="bg-racing-green px-4 py-3 text-right text-ink">
                      <p className="font-heading text-3xl font-black leading-none">{event.points}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]">Puan</p>
                    </div>
                  </div>
                  <div className="my-auto py-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{event.english}</p>
                    <h3 className="mt-3 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">{event.title}</h3>
                    <p className="mt-8 max-w-xl text-base leading-8 text-white/60">{event.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-20 lg:px-10 lg:py-28">
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

      <SiteFooter />
    </main>
  );
}
