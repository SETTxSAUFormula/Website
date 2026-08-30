import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Biz Kimiz?',
  description: 'SAUFormula’nın çalışma kültürü, SETT ile güç birliği, vizyonu ve misyonu.',
};

const principles = [
  ['01', 'Öğrenerek geliştir', 'Teoriyi tasarım, üretim, test ve yarış döngüsünde gerçek mühendislik kararlarına dönüştürürüz.'],
  ['02', 'Bilgiyi aktar', 'Her sezon edinilen deneyimi kayıt altına alır, yeni takım üyelerine aktarır ve kalıcı bir teknik kültür kurarız.'],
  ['03', 'Birlikte temsil et', 'Farklı disiplinleri ortak hedefte buluşturur; Sakarya Üniversitesini pistte ve teknik sunumlarda temsil ederiz.'],
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="bg-ink px-5 pb-16 pt-32 text-white lg:px-10 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-white/15 pb-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">2007’den bugüne</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88]">Biz Kimiz?</h1>
            </div>
            <div className="grid gap-5 text-base leading-7 text-white/60 md:grid-cols-2">
              <p>SAUFormula; farklı bölümlerden öğrencilerin tek bir yarış otomobili etrafında araştırma, tasarım, analiz, üretim, test ve yarış operasyonlarını birlikte yönettiği disiplinler arası bir geliştirme ortamıdır.</p>
              <p>Her sistemi süre, bütçe, üretilebilirlik ve güvenilirlik sınırları içinde ele alır; test sonuçlarını ve teknik kararları yeni sezona aktararak kalıcı bir mühendislik kültürü oluştururuz.</p>
            </div>
          </div>

          <figure className="mt-8 grid overflow-hidden border border-white/12 bg-[#071b14] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[360px] lg:min-h-[500px]">
              <Image src="/media/team-2026.jpg" alt="SAUFormula takım üyeleri yarış alanında" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">Öğrenci liderliğinde</p>
              <p className="mt-5 text-lg leading-8 text-white/70">Aracın mühendislik kararlarından üretim partnerleriyle iletişime, maliyet yönetiminden yarış haftası operasyonuna kadar bütün süreç takım üyelerinin ortak sorumluluğunda ilerler.</p>
              <p className="mt-5 text-sm leading-7 text-white/45">Amacımız yalnızca bir otomobil üretmek değil; ölçebilen, kararlarını savunabilen ve bilgisini sonraki kuşağa aktarabilen mühendisler yetiştiren bir çalışma ortamı kurmaktır.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-racing-green/25 bg-[#061811] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="border border-white/12 bg-[#0a241b] p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-racing-green">2025 · Güçlerin birleşmesi</p>
            <div className="mt-7 flex items-center justify-center gap-6 sm:gap-9">
              <Image src="/brand/sett-logo.png" alt="SETT logosu" width={500} height={600} className="h-24 w-auto object-contain sm:h-28" />
              <span aria-hidden="true" className="font-heading text-4xl font-black text-racing-green">×</span>
              <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula logosu" width={2400} height={1510} className="h-20 w-auto object-contain sm:h-24" />
            </div>
          </div>
          <div>
            <h2 className="font-heading text-4xl font-black uppercase leading-none sm:text-5xl">SETT × SAUFormula</h2>
            <div className="mt-6 grid gap-5 text-sm leading-7 text-white/55 md:grid-cols-2">
              <p>SETT’in 2007’de hidrojen enerjili araçlarla başlayan enerji teknolojileri birikimi, 2025’te SAUFormula’nın Formula Student hedefiyle aynı yapı altında buluştu.</p>
              <p>Motor, aerodinamik, kompozit ve elektrik–elektronik ekipleri bugün ADA-02 ve onu izleyecek araçlar için ortak teknik hafızayla çalışıyor.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="vizyon-misyon" className="scroll-mt-24 px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid border-l border-t border-white/15 lg:grid-cols-2">
            <article className="border-b border-r border-white/15 p-7 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Vizyonumuz</p>
              <h2 className="mt-5 font-heading text-3xl font-black uppercase sm:text-4xl">Nereye gidiyoruz?</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">Öğrencilerin geliştirdiği yarış araçları ve kuşaktan kuşağa aktarılan mühendislik kültürüyle Formula Student arenasında Türkiye’yi sürdürülebilir başarıyla temsil eden bir takım olmak.</p>
            </article>
            <article className="border-b border-r border-white/15 p-7 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Misyonumuz</p>
              <h2 className="mt-5 font-heading text-3xl font-black uppercase sm:text-4xl">Nasıl çalışıyoruz?</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">Farklı disiplinlerden öğrencileri gerçek bir ürün geliştirme döngüsünde buluşturuyor; araştırma, üretim, doğrulama ve yarış süreçlerini öğrenci sorumluluğunda yürütüyoruz.</p>
            </article>
          </div>

          <div className="mt-8 grid border-l border-t border-white/15 md:grid-cols-3">
            {principles.map(([number, title, text]) => (
              <article key={number} className="border-b border-r border-white/15 p-7">
                <p className="font-heading text-2xl font-black text-racing-green">{number}</p>
                <h3 className="mt-8 font-heading text-2xl font-bold uppercase">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
