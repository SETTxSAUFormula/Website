import type { Metadata } from 'next';
import { UserRound } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Takımımız',
  description: 'SAUFormula 2026 takım liderliği ve departman kadroları.',
  alternates: { canonical: '/takimlar', languages: { 'tr-TR': '/takimlar', 'en-US': '/en/takimlar' } },
};

const pageCopy = {
  tr: {
    season: '2026 kadrosu',
    title: 'Takımımız',
    intro: 'Takım liderinden departman şeflerine, ardından her departmanın üyelerine uzanan güncel organizasyon yapımız.',
    leaderKicker: 'Takım yönetimi',
    leaderTitle: 'Takım lideri',
    leadsKicker: 'Teknik liderlik',
    leadsTitle: 'Departman şefleri',
    membersKicker: 'Departman kadroları',
    membersTitle: 'Ekibimiz',
    memberPhoto: 'Üye fotoğrafı',
    fullName: 'Ad Soyad',
    departmentLead: 'Departman şefi',
    teamLeader: 'Takım lideri',
    member: 'Takım üyesi',
    rosterNote: 'Doğrulanmış isimler, görevler ve portreler geldiğinde kartlar bu hiyerarşi korunarak doldurulacak.',
    departments: ['Motor', 'Aerodinamik', 'Kompozit', 'Elektrik & Elektronik'],
  },
  en: {
    season: '2026 roster',
    title: 'Our Team',
    intro: 'Our current organisation, from the team leader to department leads and every member within each technical department.',
    leaderKicker: 'Team management',
    leaderTitle: 'Team leader',
    leadsKicker: 'Technical leadership',
    leadsTitle: 'Department leads',
    membersKicker: 'Department rosters',
    membersTitle: 'Our crew',
    memberPhoto: 'Member photo',
    fullName: 'Full Name',
    departmentLead: 'Department lead',
    teamLeader: 'Team leader',
    member: 'Team member',
    rosterNote: 'Verified names, roles and portraits will be added while preserving this hierarchy.',
    departments: ['Powertrain', 'Aerodynamics', 'Composites', 'Electrical & Electronics'],
  },
};

function PersonCard({
  name,
  role,
  photoLabel,
  featured = false,
}: {
  name: string;
  role: string;
  photoLabel: string;
  featured?: boolean;
}) {
  return (
    <article className={`group overflow-hidden border border-white/15 bg-[#071b14] ${featured ? 'grid sm:grid-cols-[0.8fr_1.2fr]' : ''}`}>
      <div className={`relative grid place-items-center overflow-hidden bg-white/[0.035] ${featured ? 'min-h-72' : 'aspect-[4/3]'}`}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-racing-green/30" aria-hidden="true" />
        <div className="grid size-16 place-items-center rounded-full border border-white/15 text-white/25 transition-colors group-hover:border-racing-green/50 group-hover:text-racing-green">
          <UserRound className="size-7" aria-hidden="true" />
        </div>
        <span className="absolute bottom-5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">{photoLabel}</span>
      </div>
      <div className={`flex flex-col justify-end ${featured ? 'p-8 sm:p-10' : 'p-5'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-racing-green">{role}</p>
        <h3 className={`mt-3 font-heading font-black uppercase ${featured ? 'text-4xl sm:text-5xl' : 'text-2xl'}`}>{name}</h3>
      </div>
    </article>
  );
}

export function TeamsPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />

      <section className="bg-ink px-5 pb-16 pt-12 text-white lg:px-10 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-[1500px]">
          <header className="grid gap-7 border-b border-white/15 pb-9 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.season}</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88]">{copy.title}</h1>
            </div>
            <p className="max-w-3xl text-base leading-7 text-white/60">{copy.intro}</p>
          </header>

          <section className="mt-12" aria-labelledby="team-leader-title">
            <div className="mb-5 border-b border-white/12 pb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-racing-green">01 / {copy.leaderKicker}</p>
              <h2 id="team-leader-title" className="mt-2 font-heading text-4xl font-black uppercase">{copy.leaderTitle}</h2>
            </div>
            <div className="max-w-3xl">
              <PersonCard name={copy.fullName} role={copy.teamLeader} photoLabel={copy.memberPhoto} featured />
            </div>
          </section>

          <section className="mt-16" aria-labelledby="department-leads-title">
            <div className="mb-5 border-b border-white/12 pb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-racing-green">02 / {copy.leadsKicker}</p>
              <h2 id="department-leads-title" className="mt-2 font-heading text-4xl font-black uppercase">{copy.leadsTitle}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {copy.departments.map((department) => (
                <PersonCard key={department} name={copy.fullName} role={`${department} · ${copy.departmentLead}`} photoLabel={copy.memberPhoto} />
              ))}
            </div>
          </section>

          <section className="mt-20" aria-labelledby="department-members-title">
            <div className="flex flex-col justify-between gap-5 border-b border-white/12 pb-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-racing-green">03 / {copy.membersKicker}</p>
                <h2 id="department-members-title" className="mt-2 font-heading text-4xl font-black uppercase sm:text-5xl">{copy.membersTitle}</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/45">{copy.rosterNote}</p>
            </div>

            <div className="mt-10 space-y-14">
              {copy.departments.map((department, departmentIndex) => (
                <section key={department} aria-labelledby={`department-${departmentIndex}`}>
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-2xl font-black text-racing-green">0{departmentIndex + 1}</span>
                    <h3 id={`department-${departmentIndex}`} className="font-heading text-3xl font-bold uppercase">{department}</h3>
                    <span className="h-px flex-1 bg-white/12" aria-hidden="true" />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((slot) => (
                      <PersonCard key={slot} name={copy.fullName} role={copy.member} photoLabel={copy.memberPhoto} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function TeamsPage() {
  return <TeamsPageContent />;
}
