import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Takımımız',
  description: 'SAUFormula 2026 takımı, departmanları ve ekip üyeleri.',
  alternates: { canonical: '/takimlar', languages: { 'tr-TR': '/takimlar', 'en-US': '/en/takimlar' } },
};

const pageCopy = {
  tr: {
    season: '2026 sezonu', title: 'Takımımız', intro: 'Farklı disiplinlerden öğrenciler, ADA-02’nin tasarımından yarış operasyonuna kadar aynı ürün geliştirme planında çalışır; teknik bilgi ve sorumluluk her sezon yeni kuşağa aktarılır.', current: 'Güncel takım', currentText: 'Takım üyeleri; motor, aerodinamik, kompozit ve elektrik–elektronik departmanlarında ortak teknik hedeflere göre çalışıyor.', departmentsTitle: 'Departmanlar', departmentsHeadline: 'Farklı disiplinler, tek araç.', members: 'Ekip üyeleri', rosters: 'Departman kadroları', rosterNote: 'Doğrulanmış üye fotoğrafları, adları ve görevleri geldiğinde aşağıdaki kartlar doğrudan doldurulacak.', memberPhoto: 'Üye fotoğrafı', fullName: 'Ad Soyad', role: 'Rol / Sorumluluk',
    departments: [
      ['Motor', 'Motor, emme–egzoz, soğutma, yakıt ve güç aktarımı sistemlerinin performans ve güvenilirlik hedefleriyle geliştirilmesi.'],
      ['Aerodinamik', 'Kanatlar, taban ve gövde akışının hesaplamalı analiz, üretim ve pist verileriyle geliştirilmesi.'],
      ['Kompozit', 'Karbon fiber parçaların hafiflik, dayanım, kalıp tasarımı ve tekrarlanabilir üretim hedefleriyle hazırlanması.'],
      ['Elektrik & Elektronik', 'Araç elektrik mimarisi, kablolama, sensörler, veri toplama ve kontrol sistemlerinin tasarımı ve doğrulanması.'],
    ],
  },
  en: {
    season: '2026 season', title: 'Our Team', intro: 'Students from different disciplines work within one product-development plan, from the design of ADA-02 to race operations. Technical knowledge and responsibility pass to a new generation every season.', current: 'Current team', currentText: 'Team members work toward shared technical goals across powertrain, aerodynamics, composites and electrical-electronics departments.', departmentsTitle: 'Departments', departmentsHeadline: 'Different disciplines, one car.', members: 'Team members', rosters: 'Department rosters', rosterNote: 'Verified member photographs, names and roles will be added directly to the cards below when they are available.', memberPhoto: 'Member photo', fullName: 'Full Name', role: 'Role / Responsibility',
    departments: [
      ['Powertrain', 'Developing the engine, intake and exhaust, cooling, fuel and drivetrain systems around performance and reliability targets.'],
      ['Aerodynamics', 'Developing wings, floor and body airflow through computational analysis, manufacturing and track data.'],
      ['Composites', 'Producing carbon-fibre parts with targets for low weight, strength, mould design and repeatable manufacturing.'],
      ['Electrical & Electronics', 'Designing and validating the car’s electrical architecture, wiring, sensors, data acquisition and control systems.'],
    ],
  },
};

export function TeamsPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];
  const isEnglish = language === 'en';

  return (
    <main>
      <SiteHeader language={language} />

      <section className="bg-ink px-5 py-12 text-white lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-white/15 pb-9 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.season}</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88]">{copy.title}</h1>
            </div>
            <p className="max-w-3xl text-base leading-7 text-white/60">{copy.intro}</p>
          </div>

          <div className="mt-8 grid overflow-hidden border border-white/12 bg-[#071b14] lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
            <div className="relative min-h-[360px] lg:min-h-[500px]">
              <Image src="/media/fs-team-romania.webp" alt={isEnglish ? 'SAUFormula 2026 team with ADA-02' : 'SAUFormula 2026 takımı ADA-02 ile'} fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.current}</p>
              <p className="mt-3 font-heading text-6xl font-black">2026</p>
              <p className="mt-5 text-sm leading-7 text-white/55">{copy.currentText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.departmentsTitle}</p>
          <h2 className="mt-3 font-heading text-4xl font-black uppercase sm:text-5xl">{copy.departmentsHeadline}</h2>
          <div className="mt-8 grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-4">
            {copy.departments.map(([title, text], index) => (
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
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.members}</p>
              <h2 className="mt-3 font-heading text-4xl font-black uppercase sm:text-5xl">{copy.rosters}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/45">{copy.rosterNote}</p>
          </div>

          <div className="mt-8 space-y-10">
            {copy.departments.map(([department], departmentIndex) => (
              <section key={department} aria-labelledby={`department-${departmentIndex}`}>
                <div className="flex items-center gap-4">
                  <span className="font-heading text-2xl font-black text-racing-green">0{departmentIndex + 1}</span>
                  <h3 id={`department-${departmentIndex}`} className="font-heading text-3xl font-bold uppercase">{department}</h3>
                  <span className="h-px flex-1 bg-white/12" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((slot) => (
                    <article key={slot} className="overflow-hidden border border-white/12 bg-[#071b14]">
                      <div className="grid aspect-[4/3] place-items-center bg-white/[0.025] text-[10px] font-bold uppercase tracking-[0.18em] text-white/20">{copy.memberPhoto}</div>
                      <div className="border-t border-white/10 p-5">
                        <p className="font-heading text-2xl font-bold uppercase text-white/75">{copy.fullName}</p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-racing-green">{copy.role}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function TeamsPage() {
  return <TeamsPageContent />;
}
