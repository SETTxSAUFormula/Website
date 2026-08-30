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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Ortak mühendislik kültürü</p>
            <h2 className="mt-5 font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">
              İki birikim, tek hedef.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-white/60">
              <p>
                Sakarya Enerji Teknolojileri Takımı SETT, 2007’de Türkiye’nin ilk hidrojen enerjili aracıyla başlayan yolculuğunda enerji teknolojileri ve öğrenci mühendisliği alanında güçlü bir deneyim oluşturdu.
              </p>
              <p>
                2025 yılında SETT ile SAUFormula güçlerini birleştirdi. Bu birliktelik; yıllar içinde oluşan teknik birikimi Formula Student’ın tasarım, üretim, doğrulama ve yarış hedefleriyle aynı yapı altında buluşturdu.
              </p>
              <p>
                Bugün farklı bölümlerden öğrenciler, ADA-02 ve onu izleyecek araçları geliştirmek için ortak sorumluluk alıyor; kararlarını veriye dayandırıyor ve her sezon öğrendiklerini bir sonraki kuşağa aktarıyor.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8 border-t border-white/12 pt-8">
              <Image src="/brand/sett-logo.png" alt="SETT" width={420} height={420} className="h-20 w-auto object-contain" />
              <span aria-hidden="true" className="font-heading text-3xl font-black text-racing-green">×</span>
              <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula" width={2400} height={1510} className="h-20 w-auto object-contain" />
              <Image src="/brand/sakarya-universitesi-logo.png" alt="Sakarya Üniversitesi" width={700} height={700} className="ml-auto h-16 w-auto object-contain" />
            </div>
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
