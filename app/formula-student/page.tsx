import type { Metadata } from 'next';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Formula Student',
  description:
    'Formula Student yarışmasının amacı, statik ve dinamik disiplinleri ile SAUFormula’nın mühendislik yaklaşımı.',
};

const staticEvents = [
  ['Engineering Design', 'Tasarım kararları, analizler, test sonuçları ve aracın mühendislik gerekçeleri uzman jüri karşısında savunulur.'],
  ['Cost & Manufacturing', 'Aracın parça, malzeme, üretim yöntemi ve maliyet yaklaşımı gerçek bir üretim projesi gibi değerlendirilir.'],
  ['Business Plan Presentation', 'Takım, geliştirdiği fikri uygulanabilir ve ikna edici bir iş modeline dönüştürerek jüriye sunar.'],
];

const dynamicEvents = [
  ['Acceleration', 'Aracın düz hatta ivmelenme yeteneği ölçülür.'],
  ['Skidpad', 'Sekiz biçimli parkurda yanal tutunma ve denge sınanır.'],
  ['Autocross', 'Dar ve teknik parkurda hız, çeviklik ve sürüş hassasiyeti değerlendirilir.'],
  ['Endurance', 'Araç uzun yarış mesafesinde hız, dayanıklılık ve güvenilirliğini kanıtlar.'],
  ['Efficiency', 'Endurance boyunca harcanan enerji, performansla birlikte değerlendirilir.'],
];

export default function FormulaStudentPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="Bir yarıştan daha fazlası"
        title="Formula Student"
        description="Üniversite öğrencilerinin tek kişilik bir yarış otomobilini araştırdığı, tasarladığı, ürettiği, test ettiği ve uzman jüriler karşısında savunduğu uluslararası mühendislik organizasyonudur."
      />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Yarışın yaklaşımı</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">Yalnızca en hızlı araç kazanmaz.</h2>
          </div>
          <div className="grid gap-7 text-base leading-8 text-white/60 sm:grid-cols-2">
            <p>
              Formula Student, pist performansını tek başına yeterli görmez. Takımlar araçlarının neden bu şekilde tasarlandığını, nasıl üretildiğini ve projenin nasıl yönetildiğini de kanıtlar.
            </p>
            <p>
              Böylece yarış; mekanikten elektroniğe, kompozitten yazılıma, finansmandan takım yönetimine kadar gerçek bir ürün geliştirme sürecini öğrencilerin sorumluluğuna verir.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">01 · Statik disiplinler</p>
              <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-none sm:text-7xl">Mühendisliğini savun.</h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-white/50">Araç piste çıkmadan önce takımın teknik, mali ve ticari kararları jüri karşısında sınanır.</p>
          </div>
          <div className="mt-14 grid border-l border-t border-white/15 lg:grid-cols-3">
            {staticEvents.map(([title, text], index) => (
              <article key={title} className="min-h-80 border-b border-r border-white/15 p-8 lg:p-10">
                <p className="font-heading text-3xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-20 font-heading text-3xl font-bold uppercase leading-tight">{title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">02 · Dinamik disiplinler</p>
              <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-none sm:text-7xl">Pistte doğrula.</h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-white/50">Teknik kontrolden geçen araç, farklı görevlerde hızını, dengesini, verimliliğini ve dayanıklılığını gösterir.</p>
          </div>
          <div className="mt-14 grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-5">
            {dynamicEvents.map(([title, text], index) => (
              <article key={title} className="min-h-72 border-b border-r border-white/15 p-7">
                <p className="font-heading text-3xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-16 font-heading text-2xl font-bold uppercase">{title}</h3>
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
