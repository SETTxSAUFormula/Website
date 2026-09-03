import type { Metadata } from 'next';
import { Cog, Handshake } from 'lucide-react';

import { ApplicationForm } from '@/components/application-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Bize Katıl',
  description: 'SAUFormula takım başvuru formu ve departman çalışma alanları.',
  alternates: { canonical: '/bize-katil', languages: { 'tr-TR': '/bize-katil', 'en-US': '/en/bize-katil' } },
};

const pageCopy = {
  tr: {
    eyebrow: 'Takım başvurusu',
    title: 'Bize Katıl',
    intro: 'Formula Student aracının tasarımından üretimine, iletişimden yarış operasyonuna kadar gerçek sorumluluklar üstlenmek istiyorsanız başvurunuzu bize iletin.',
    process: 'Başvuru süreci',
    heroSteps: [['01', 'Bilgilerinizi paylaşın'], ['02', 'Departman tercihinizi belirtin'], ['03', 'Değerlendirme sonrası sizinle iletişime geçelim']],
    structureEyebrow: 'Çalışma alanları',
    structureTitle: 'Hangi departmanda katkı sağlayabilirsiniz?',
    structureText: 'Teknik ve organizasyonel departmanlar, aracın geliştirilmesinden takımın sürdürülebilir işleyişine kadar birbirini tamamlayan sorumluluklar üstlenir. Başvuruda ilginize ve yetkinliklerinize en yakın iki alanı seçebilirsiniz.',
    technical: 'Teknik Departmanlar',
    organizational: 'Organizasyonel Departmanlar',
    technicalTeams: [
      ['Vehicle Dynamics', 'Süspansiyon, direksiyon, fren ve araç davranışı'],
      ['Chassis & Structures', 'Şasi, yapısal tasarım, güvenlik ve ergonomi'],
      ['Powertrain', 'Güç aktarımı, motor sistemleri ve soğutma'],
      ['Aerodynamics', 'Aerodinamik tasarım, analiz ve gövde geliştirme'],
      ['Composites & Manufacturing', 'Kompozit tasarımı, kalıp ve üretim süreçleri'],
      ['Electrical & Electronics', 'Elektrik mimarisi, elektronik, veri ve kontrol sistemleri'],
    ],
    organizationalTeams: [
      ['Sponsorship & Partnerships', 'Sponsor ilişkileri, iş birlikleri ve kaynak geliştirme'],
      ['Media & Communications', 'İçerik, görsel iletişim, sosyal medya ve etkinlikler'],
      ['Finance & Operations', 'Bütçe, satın alma, lojistik ve operasyon planlama'],
    ],
    formEyebrow: 'Başvuru formu',
    formTitle: 'Sizi daha yakından tanıyalım.',
    formText: 'Yanıtlarınızı somut örneklerle ve açık biçimde paylaşmanız, başvurunuzu doğru departmanın değerlendirmesine yardımcı olur.',
  },
  en: {
    eyebrow: 'Team application',
    title: 'Join Us',
    intro: 'Apply to take on real responsibilities across the design, manufacturing, communications and race operations of a Formula Student car.',
    process: 'Application process',
    heroSteps: [['01', 'Share your details'], ['02', 'Choose your departments'], ['03', 'We will contact you after reviewing your application']],
    structureEyebrow: 'Areas of work',
    structureTitle: 'Where can you contribute?',
    structureText: 'Technical and organisational departments take on complementary responsibilities, from developing the car to sustaining the team’s operations. You may select the two areas closest to your interests and skills.',
    technical: 'Technical Departments',
    organizational: 'Organisational Departments',
    technicalTeams: [
      ['Vehicle Dynamics', 'Suspension, steering, braking and vehicle behaviour'],
      ['Chassis & Structures', 'Chassis, structural design, safety and ergonomics'],
      ['Powertrain', 'Power delivery, motor systems and cooling'],
      ['Aerodynamics', 'Aerodynamic design, analysis and body development'],
      ['Composites & Manufacturing', 'Composite design, tooling and manufacturing processes'],
      ['Electrical & Electronics', 'Electrical architecture, electronics, data and control systems'],
    ],
    organizationalTeams: [
      ['Sponsorship & Partnerships', 'Sponsor relations, partnerships and resource development'],
      ['Media & Communications', 'Content, visual communication, social media and events'],
      ['Finance & Operations', 'Budgeting, procurement, logistics and operations planning'],
    ],
    formEyebrow: 'Application form',
    formTitle: 'Let us get to know you.',
    formText: 'Clear answers supported by concrete examples help us route your application to the right department.',
  },
} satisfies Record<Language, Record<string, string | string[][]>>;

function DepartmentGroup({
  icon: Icon,
  title,
  teams,
}: {
  icon: typeof Cog;
  title: string;
  teams: string[][];
}) {
  return (
    <section className="border border-white/15 bg-[#071b14] p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-white/12 pb-5">
        <Icon className="size-5 text-racing-green" aria-hidden="true" />
        <h3 className="font-heading text-xl font-bold uppercase text-white sm:text-2xl">{title}</h3>
      </div>
      <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {teams.map(([name, description]) => (
          <div key={name}>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="mt-1 text-sm leading-6 text-white/50">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function JoinPageContent({ language = 'tr' }: { language?: Language }) {
  const content = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <section className="bg-ink px-5 py-10 text-white sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1500px]">
          <header className="grid gap-7 border-b border-white/15 pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-racing-green">{content.eyebrow as string}</p>
              <h1 className="mt-4 font-heading text-[clamp(3.5rem,10vw,7.5rem)] font-black uppercase leading-[0.86]">{content.title as string}</h1>
            </div>
            <div className="flex flex-col justify-between border border-white/15 bg-[#071b14] p-6 sm:p-8 lg:min-h-[18rem]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-racing-green">{content.process as string}</p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">{content.intro as string}</p>
              </div>
              <div className="mt-8 grid border-l border-t border-white/12 sm:grid-cols-3">
                {(content.heroSteps as string[][]).map(([number, label]) => (
                  <div key={number} className="border-b border-r border-white/12 p-4 sm:min-h-28">
                    <span className="font-heading text-sm font-black text-racing-green">{number}</span>
                    <p className="mt-3 text-sm font-semibold leading-6 text-white/80">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <section className="py-10 sm:py-14">
            <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-racing-green">{content.structureEyebrow as string}</p>
                <h2 className="mt-4 max-w-xl font-heading text-3xl font-black uppercase leading-[0.95] sm:text-5xl">{content.structureTitle as string}</h2>
              </div>
              <div className="border-l-2 border-racing-green/60 pl-5 sm:pl-7">
                <p className="max-w-3xl text-base leading-8 text-white/60">{content.structureText as string}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
              <DepartmentGroup icon={Cog} title={content.technical as string} teams={content.technicalTeams as string[][]} />
              <DepartmentGroup icon={Handshake} title={content.organizational as string} teams={content.organizationalTeams as string[][]} />
            </div>
          </section>

          <section className="grid gap-8 border-t border-racing-green/30 pt-10 sm:pt-14 lg:grid-cols-[0.55fr_1.45fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-racing-green">{content.formEyebrow as string}</p>
              <h2 className="mt-4 max-w-lg font-heading text-4xl font-black uppercase leading-[0.92] sm:text-6xl">{content.formTitle as string}</h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/50">{content.formText as string}</p>
            </div>
            <ApplicationForm language={language} />
          </section>
        </div>
      </section>
      <SiteFooter language={language} />
    </main>
  );
}

export default function JoinPage() {
  return <JoinPageContent />;
}
