import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'ADA-02 ve Araçlarımız',
  description: 'SAUFormula takımının 54 numaralı Formula Student aracı ADA-02.',
};

export default function VehiclesPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="Araçlarımız / 2026"
        title="ADA-02"
        description="Tasarım, üretim ve test kararlarımızın pistteki karşılığı: 54 numaralı Formula Student aracımız."
        aside={<p className="mt-6 font-heading text-3xl font-bold uppercase tracking-[0.04em] text-racing-green">54 · 2026 sezonu</p>}
      />

      <section className="bg-ink px-5 pb-20 text-white lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative min-h-[520px] overflow-hidden border border-white/15 lg:min-h-[760px]">
            <Image src="/media/ada-02-car.jpg" alt="SAUFormula ADA-02 yarış aracı" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <dl className="absolute bottom-0 left-0 right-0 grid grid-cols-3 border-t border-white/15 bg-ink/70 backdrop-blur-md">
              {[
                ['Araç adı', 'ADA-02'],
                ['Araç no', '54'],
                ['Sezon', '2026'],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-white/15 p-5 last:border-r-0 sm:p-8">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">{label}</dt>
                  <dd className="mt-2 font-heading text-2xl font-black uppercase sm:text-4xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <h2 className="font-heading text-5xl font-black uppercase leading-[0.88] sm:text-7xl">Kararların toplamı.</h2>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {['Şasi ve mekanik', 'Elektrik ve elektronik', 'Araç dinamiği', 'Üretim ve doğrulama'].map((title) => (
              <article key={title} className="bg-[#071b14] p-8">
                <h3 className="font-heading text-3xl font-bold uppercase">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Bu alana, takım tarafından doğrulanmış ADA-02 teknik verileri ve geliştirme notları eklenecektir.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
