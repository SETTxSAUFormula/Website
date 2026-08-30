import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Takımımız',
  description: 'SAUFormula 2026 takımı, departmanları ve ekip üyeleri.',
};

const departments = [
  ['Motor', 'Motor, emme–egzoz, soğutma, yakıt ve güç aktarımı sistemlerinin performans ve güvenilirlik hedefleriyle geliştirilmesi.'],
  ['Aerodinamik', 'Kanatlar, taban ve gövde akışının hesaplamalı analiz, üretim ve pist verileriyle geliştirilmesi.'],
  ['Kompozit', 'Karbon fiber parçaların hafiflik, dayanım, kalıp tasarımı ve tekrarlanabilir üretim hedefleriyle hazırlanması.'],
  ['Elektrik & Elektronik', 'Araç elektrik mimarisi, kablolama, sensörler, veri toplama ve kontrol sistemlerinin tasarımı ve doğrulanması.'],
];

export default function TeamsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="bg-ink px-5 pb-16 pt-32 text-white lg:px-10 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-white/15 pb-9 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">2026 sezonu</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88]">Takımımız</h1>
            </div>
            <p className="max-w-3xl text-base leading-7 text-white/60">Farklı disiplinlerden öğrenciler, ADA-02’nin tasarımından yarış operasyonuna kadar aynı ürün geliştirme planında çalışır; teknik bilgi ve sorumluluk her sezon yeni kuşağa aktarılır.</p>
          </div>

          <div className="mt-8 grid overflow-hidden border border-white/12 bg-[#071b14] lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
            <div className="relative min-h-[360px] lg:min-h-[500px]">
              <Image src="/media/fs-team-romania.webp" alt="SAUFormula 2026 takımı ADA-02 ile" fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Güncel takım</p>
              <p className="mt-3 font-heading text-6xl font-black">2026</p>
              <p className="mt-5 text-sm leading-7 text-white/55">Takım üyeleri; motor, aerodinamik, kompozit ve elektrik–elektronik departmanlarında ortak teknik hedeflere göre çalışıyor.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Departmanlar</p>
          <h2 className="mt-3 font-heading text-4xl font-black uppercase sm:text-5xl">Farklı disiplinler, tek araç.</h2>
          <div className="mt-8 grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-4">
            {departments.map(([title, text], index) => (
              <article key={title} className="border-b border-r border-white/15 p-6">
                <p className="font-heading text-2xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-8 font-heading text-2xl font-bold uppercase">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 border-b border-white/15 pb-7 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Ekip üyeleri</p>
              <h2 className="mt-3 font-heading text-4xl font-black uppercase sm:text-5xl">Departman kadroları</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/45">Doğrulanmış üye fotoğrafları, adları ve görevleri geldiğinde aşağıdaki kartlar doğrudan doldurulacak.</p>
          </div>

          <div className="mt-8 space-y-10">
            {departments.map(([department], departmentIndex) => (
              <section key={department} aria-labelledby={`department-${departmentIndex}`}>
                <div className="flex items-center gap-4">
                  <span className="font-heading text-2xl font-black text-racing-green">0{departmentIndex + 1}</span>
                  <h3 id={`department-${departmentIndex}`} className="font-heading text-3xl font-bold uppercase">{department}</h3>
                  <span className="h-px flex-1 bg-white/12" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((slot) => (
                    <article key={slot} className="overflow-hidden border border-white/12 bg-[#071b14]">
                      <div className="grid aspect-[4/3] place-items-center bg-white/[0.025] text-[10px] font-bold uppercase tracking-[0.18em] text-white/20">Üye fotoğrafı</div>
                      <div className="border-t border-white/10 p-5">
                        <p className="font-heading text-2xl font-bold uppercase text-white/75">Ad Soyad</p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-racing-green">Rol / Sorumluluk</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
