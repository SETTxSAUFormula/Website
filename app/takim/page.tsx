import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Takım',
  description: 'SAUFormula takımının hikâyesi, SETT ile güç birliği ve mühendislik yaklaşımı.',
};

const areas = [
  ['Tasarım', 'Her parçayı; işlev, üretilebilirlik ve araç bütünlüğüyle birlikte ele alıyoruz.'],
  ['Üretim', 'Dijital modeli atölyede gerçek bir yarış otomobiline dönüştürüyoruz.'],
  ['Test', 'Ölçüyor, doğruluyor, sorunları kaynağında buluyor ve yeniden deniyoruz.'],
  ['Organizasyon', 'Takvimden iş birliklerine kadar takımın sürdürülebilirliğini birlikte yönetiyoruz.'],
];

export default function TeamPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="Sakarya Üniversitesi"
        title="Takım"
        description="Öğrencilerin karar aldığı, sorumluluk üstlendiği ve birlikte ürettiği disiplinler arası bir mühendislik takımıyız."
      />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[430px] overflow-hidden bg-ink lg:min-h-[620px]">
            <Image src="/media/team-2026.jpg" alt="SAUFormula takım fotoğrafı" fill sizes="(min-width:1024px) 52vw,100vw" className="object-cover" priority />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#008d4e]">Başlangıçtan bugüne</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.9] sm:text-7xl">Aynı merak, yeni hedef.</h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                2007’de Türkiye’nin ilk hidrojen enerjili aracıyla yola çıkan Sakarya Üniversitesi
                Enerji Teknolojileri Topluluğu, yıllar içinde disiplinler arası bir mühendislik kültürü oluşturdu.
              </p>
              <p>
                2025 yılında Sakarya Üniversitesi Formula Student Takımı SAUFormula ile Sakarya Enerji
                Teknolojileri Takımı SETT güçlerini birleştirerek daha güçlü, yenilikçi ve kararlı bir ekip
                oluşturdu. Ortak hedefimiz; mühendislikte, tasarımda ve yarış pistlerinde en iyisini ortaya
                koymak, üniversitemizi uluslararası arenada temsil etmek.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="ekip" className="bg-ink px-5 py-20 text-white lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Nasıl çalışıyoruz?</p>
          <h2 className="mt-4 max-w-4xl font-heading text-5xl font-black uppercase leading-[0.88] sm:text-7xl">Bir araç, ortak bir sistem.</h2>
          <div className="mt-14 grid border-l border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map(([title, text], index) => (
              <article key={title} className="min-h-72 border-b border-r border-white/15 p-7">
                <p className="font-heading text-3xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-16 font-heading text-3xl font-bold uppercase">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-7 text-white/45">
            İsim, görev ve departman bazındaki güncel ekip listesi takım tarafından doğrulandıktan sonra burada yayınlanacaktır.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
