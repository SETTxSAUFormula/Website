import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    'SAUFormula’nın hikâyesi, SETT ile güç birliği, çalışma kültürü, vizyonu ve misyonu.',
};

const principles = [
  {
    number: '01',
    title: 'Öğrenerek geliştir',
    text: 'Teoriyi; tasarım, üretim, test ve yarış döngüsünde gerçek mühendislik kararlarına dönüştürürüz.',
  },
  {
    number: '02',
    title: 'Bilgiyi aktar',
    text: 'Her sezon edinilen deneyimi kayıt altına alır, yeni takım üyelerine aktarır ve kalıcı bir teknik kültür kurarız.',
  },
  {
    number: '03',
    title: 'Birlikte temsil et',
    text: 'Farklı disiplinleri ortak hedefte buluşturur; Sakarya Üniversitesini pistte ve mühendislik sunumlarında temsil ederiz.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="Sakarya Üniversitesi · 2007’den bugüne"
        title="Hakkımızda"
        description="Öğrencilerin yönettiği; araştırma, tasarım, üretim, test ve organizasyon süreçlerini tek bir yarış otomobilinde buluşturan disiplinler arası bir mühendislik takımıyız."
      />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden border border-white/10 bg-[#071b14] lg:min-h-[620px]">
            <Image
              src="/media/team-2026.jpg"
              alt="SAUFormula takım üyeleri yarış alanında"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent px-7 pb-7 pt-28">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-racing-green">Biz kimiz?</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                Mühendisliği yalnızca sınıfta değil; atölyede, bilgisayar başında ve pistte öğrenen bir öğrenci takımıyız.
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Biz kimiz?</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
              Öğrencilerin yönettiği gerçek bir mühendislik takımı.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-white/60">
              <p>
                SAUFormula; farklı bölümlerden öğrencilerin tek bir yarış otomobili etrafında araştırma, tasarım, analiz, üretim, test ve yarış operasyonlarını birlikte yönettiği disiplinler arası bir geliştirme ortamıdır. Aracın her sistemi teknik hedeflerin yanı sıra süre, bütçe, üretilebilirlik ve güvenilirlik sınırları içinde ele alınır.
              </p>
              <p>
                Takımın çalışması pistte görünen otomobilden daha geniştir. Mühendislik kararlarının kayıt altına alınması, üretim partnerleriyle iletişim, maliyet yönetimi, teknik sunumlar ve yarış haftasındaki operasyon da aynı ürün geliştirme sürecinin parçalarıdır.
              </p>
              <p>
                Üyeler yalnızca mevcut aracı geliştirmekle kalmaz; yaptıkları testleri, aldıkları kararları ve elde ettikleri sonuçları bir sonraki sezona aktarır. Böylece her araç, önceki kuşakların tecrübesi üzerine kurulan yeni bir mühendislik adımı olur.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-racing-green/25 bg-[#061811] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="border border-white/12 bg-[#0a241b] p-8 sm:p-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-racing-green">2025 · Güçlerin birleşmesi</p>
              <div className="mt-10 flex items-center justify-center gap-6 sm:gap-10">
                <Image src="/brand/sett-logo.png" alt="SETT logosu" width={500} height={600} className="h-32 w-auto object-contain sm:h-40" />
                <span aria-hidden="true" className="font-heading text-5xl font-black text-racing-green">×</span>
                <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula logosu" width={2400} height={1510} className="h-28 w-auto object-contain sm:h-36" />
              </div>
              <div className="mt-12 border-t border-white/12 pt-8">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Sakarya Üniversitesi çatısı altında</p>
                <div className="bg-white px-6 py-5">
                  <Image src="/brand/sakarya-universitesi-wordmark.webp" alt="Sakarya Üniversitesi" width={1200} height={309} className="h-auto w-full object-contain" />
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Ortak mühendislik kültürü</p>
              <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">İki birikim, tek hedef.</h2>
              <div className="mt-8 space-y-5 text-base leading-8 text-white/60">
                <p>SETT, 2007’de hidrojen enerjili araçlarla başlayan yolculuğunda enerji verimliliği, alternatif güç sistemleri ve öğrenci mühendisliği alanında yıllara yayılan bir teknik kültür oluşturdu.</p>
                <p>2025’te SAUFormula ile birleşen bu birikim, Formula Student’ın tasarım, üretim, doğrulama ve yarış hedefleriyle aynı çatı altında buluştu. Bugün motor, aerodinamik, kompozit ve elektrik–elektronik ekipleri ADA-02 ve onu izleyecek araçlar için ortak sorumluluk alıyor.</p>
                <p>Bu birliktelik bir logo ortaklığından ibaret değil; geçmiş projelerde edinilen üretim disipliniyle modern yarış otomobili geliştirme yöntemlerinin aynı takım kültüründe devam etmesi anlamına geliyor.</p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid border-l border-t border-white/15 md:grid-cols-3">
            {[
              ['2007', 'SETT’in başlangıcı', 'Hidrojen enerjili araçlarla başlayan yolculuk, alternatif enerji ve verimlilik odaklı öğrenci projeleriyle büyüdü.'],
              ['2025', 'Güçlerin birleşmesi', 'SETT ile SAUFormula; teknik hafızayı, ekip kültürünü ve Formula Student hedefini ortak bir yapı altında birleştirdi.'],
              ['Bugün', 'ADA-02 ve sonrası', 'Her sezon öğrenilenleri kayıt altına alan ekip, Sakarya Üniversitesini uluslararası mühendislik yarışmalarında temsil etmek için çalışıyor.'],
            ].map(([year, title, text]) => (
              <article key={year} className="min-h-72 border-b border-r border-white/15 p-8 lg:p-10">
                <p className="font-heading text-4xl font-black text-racing-green">{year}</p>
                <h3 className="mt-12 font-heading text-3xl font-bold uppercase">{title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="vizyon-misyon" className="scroll-mt-24 border-y border-white/10 bg-[#071b14] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid border-l border-t border-white/15 lg:grid-cols-2">
            <article className="border-b border-r border-white/15 p-8 sm:p-12 lg:p-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">01 · Vizyonumuz</p>
              <h2 className="mt-7 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">Nereye gidiyoruz?</h2>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/60">
                Öğrencilerin geliştirdiği yarış araçları ve kuşaktan kuşağa aktarılan mühendislik kültürüyle Formula Student arenasında Türkiye’yi sürdürülebilir başarıyla temsil eden; yenilikçi, güvenilir ve ilham veren bir takım olmak.
              </p>
            </article>
            <article className="border-b border-r border-white/15 p-8 sm:p-12 lg:p-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">02 · Misyonumuz</p>
              <h2 className="mt-7 font-heading text-5xl font-black uppercase leading-none sm:text-6xl">Bunu nasıl yapıyoruz?</h2>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/60">
                Farklı disiplinlerden öğrencileri gerçek bir ürün geliştirme döngüsünde buluşturmak; araştırma, tasarım, üretim, doğrulama ve yarış süreçlerini öğrencilerin sorumluluğunda yürütmek; teknik birikimi yeni kuşaklara aktarmak ve üniversite–sanayi iş birlikleriyle yetkin mühendisler yetiştirmek.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Çalışma ilkelerimiz</p>
          <h2 className="mt-5 max-w-4xl font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">Aracın ötesinde bir takım.</h2>
          <div className="mt-14 grid border-l border-t border-white/15 md:grid-cols-3">
            {principles.map((principle) => (
              <article key={principle.number} className="min-h-80 border-b border-r border-white/15 p-8 lg:p-10">
                <p className="font-heading text-3xl font-black text-racing-green">{principle.number}</p>
                <h3 className="mt-20 font-heading text-3xl font-bold uppercase">{principle.title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/50">{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
