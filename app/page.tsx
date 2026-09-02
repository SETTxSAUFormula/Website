import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { localizedPath, type Language } from '@/lib/i18n';

const homeCopy = {
  tr: {
    heroEyebrow: 'Formula Student · Türkiye',
    intro: 'Öğrencilerin yönettiği gerçek bir mühendislik ortamında, Türkiye’yi Formula Student pistlerinde temsil edecek yarış otomobilleri geliştiriyoruz.',
    exploreCar: 'Aracı keşfet',
    carNumber: 'Araç No',
    season: 'Sezon',
    base: 'Merkez',
    currentCar: 'Güncel araç',
    carThought: 'Pistteki her tur, atölyedeki binlerce kararın sonucu.',
    since: '2007’den bugüne',
    team: 'SAUFormula · Takım',
    who: 'Biz Kimiz?',
    whoText: 'Tasarım, üretim, test ve yarış operasyonlarını öğrencilerin yönettiği disiplinler arası bir Formula Student takımıyız.',
    heritage: '2007 → 2025',
    mergeTitle: 'İki birikim, tek yarış hedefi',
    mergeText: 'SETT’in enerji teknolojileri mirası, 2025’te SAUFormula ile birleşerek ADA-02’nin ortak mühendislik kültürüne dönüştü.',
    story: 'Hikâyemizi keşfet',
    currentGeneration: '2026 yarış aracı · 54',
    carDescription: 'ADA-02 yalnızca ortaya çıkan otomobil değil; tasarım kararlarımızın, üretim kabiliyetimizin ve pistte doğruladığımız binlerce mühendislik detayının birleşimi. Her tur, öğrendiğimiz bir sonraki iyileştirmenin başlangıcı.',
    inspectCar: 'ADA-02’yi incele',
    fsEyebrow: 'Tasarla · üret · savun · yarış',
    fsDescription: 'Formula Student, üniversite öğrencilerinin tek kişilik bir yarış otomobilini sıfırdan tasarladığı, ürettiği ve pistte doğruladığı uluslararası bir mühendislik yarışmasıdır. Takımlar yalnızca hızla değil; tasarım, maliyet, iş planı, dayanıklılık ve enerji verimliliğiyle de değerlendirilir.',
    discoverFs: 'Formula Student’ı keşfet',
    together: 'Birlikte daha ileri',
    sponsorTitle: 'Geleceğin mühendislerine güç verin.',
    becomeSponsor: 'Sponsor olun',
  },
  en: {
    heroEyebrow: 'Formula Student · Türkiye',
    intro: 'In a student-led, real-world engineering environment, we develop race cars that represent Türkiye on Formula Student tracks.',
    exploreCar: 'Explore the car',
    carNumber: 'Car No.',
    season: 'Season',
    base: 'Base',
    currentCar: 'Current car',
    carThought: 'Every lap on track is the result of thousands of decisions in the workshop.',
    since: 'Engineering since 2007',
    team: 'SAUFormula · Team',
    who: 'Who Are We?',
    whoText: 'We are an interdisciplinary Formula Student team where students lead design, manufacturing, testing and race operations.',
    heritage: '2007 → 2025',
    mergeTitle: 'Two legacies, one racing goal',
    mergeText: 'SETT’s energy-technology heritage joined SAUFormula in 2025, becoming the shared engineering culture behind ADA-02.',
    story: 'Discover our story',
    currentGeneration: '2026 race car · 54',
    carDescription: 'ADA-02 is more than the finished car: it brings together our design decisions, manufacturing capability and thousands of engineering details validated on track. Every lap begins the next improvement.',
    inspectCar: 'Explore ADA-02',
    fsEyebrow: 'Design · build · defend · race',
    fsDescription: 'Formula Student is an international engineering competition in which university students design, build and validate a single-seat race car from the ground up. Teams are judged not only on speed, but also on design, cost, business planning, endurance and energy efficiency.',
    discoverFs: 'Discover Formula Student',
    together: 'Go further together',
    sponsorTitle: 'Power the engineers of tomorrow.',
    becomeSponsor: 'Become a sponsor',
  },
} satisfies Record<Language, Record<string, string>>;

export function HomePageContent({ language = 'tr' }: { language?: Language }) {
  const copy = homeCopy[language];
  const isEnglish = language === 'en';

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader overlay language={language} />

      <section className="relative isolate min-h-[780px] bg-ink pt-24 text-white lg:min-h-screen">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_70%,rgba(0,226,123,0.17),transparent_30%),linear-gradient(120deg,#03110d_0%,#071b14_48%,#04100c_100%)]" />
        <div className="tech-grid absolute inset-0 -z-10 opacity-35" />
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[49%] bg-racing-green/5 lg:block" />

        <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1500px] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-5 py-16 lg:px-10 lg:py-20 xl:pr-20">
            <div className="mb-8 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">
              <span className="h-px w-12 bg-racing-green" />
              {copy.heroEyebrow}
            </div>

            <h1 className="max-w-4xl font-heading text-[clamp(4rem,8vw,8.8rem)] font-black uppercase leading-[0.86] tracking-[0.01em]">
              <span className="block text-white">Race</span>
              <span className="block text-outline">Beyond</span>
              <span className="block text-racing-green">THE LIMITS.</span>
            </h1>

            <div className="mt-10 grid max-w-2xl gap-8 border-t border-white/15 pt-7 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-lg text-base leading-7 text-white/65 sm:text-lg">
                {copy.intro}
              </p>
              <Link
                href={localizedPath('/araclar', language)}
                className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                {copy.exploreCar}
                <span className="grid size-11 place-items-center border border-white/25 transition-colors group-hover:border-racing-green group-hover:bg-racing-green group-hover:text-ink">
                  <ArrowDownRight aria-hidden="true" />
                </span>
              </Link>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-3 border-y border-white/15">
              <div className="py-5 pr-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{copy.carNumber}</dt>
                <dd className="mt-1 font-heading text-3xl font-bold">54</dd>
              </div>
              <div className="border-x border-white/15 px-4 py-5">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{copy.season}</dt>
                <dd className="mt-1 font-heading text-3xl font-bold">2026</dd>
              </div>
              <div className="py-5 pl-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{copy.base}</dt>
                <dd className="mt-1 font-heading text-3xl font-bold">SAÜ</dd>
              </div>
            </dl>
          </div>

          <div className="relative min-h-[560px] overflow-hidden border-l border-white/10 lg:min-h-0">
            <Image
              src="/media/fs-ada02-front.webp"
              alt={isEnglish ? 'Front view of SAUFormula ADA-02, Formula Student car number 54' : 'SAUFormula ADA-02, 54 numaralı Formula Student yarış aracı önden görünüm'}
              fill
              priority
              sizes="(min-width: 1024px) 49vw, 100vw"
              className="object-cover object-[50%_58%] contrast-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ink/80 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between border-t border-white/15 bg-ink/65 p-6 backdrop-blur-md lg:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">{copy.currentCar}</p>
                <p className="mt-2 font-heading text-4xl font-bold uppercase">ADA-02</p>
              </div>
              <p className="max-w-[210px] text-right text-xs leading-5 text-white/55">
                {copy.carThought}
              </p>
            </div>

            <div className="absolute right-0 top-20 bg-racing-green px-3 py-8 text-[10px] font-black uppercase tracking-[0.24em] text-ink [writing-mode:vertical-rl]">
              ADA-02 · 54
            </div>
          </div>
        </div>
      </section>

      <section id="takim" className="border-y border-racing-green/25 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1500px] overflow-hidden border border-white/12 bg-[#061811] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[420px] overflow-hidden bg-ink lg:min-h-[660px]">
            <Image
              src="/media/fs-team-romania.webp"
              alt={isEnglish ? 'SAUFormula team members at the track' : 'SAUFormula takım üyeleri pist alanında'}
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute left-6 top-6 border border-white/25 bg-ink/55 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {copy.since}
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{copy.team}</span>
              <span className="font-heading text-5xl font-black text-racing-green">54</span>
            </div>
          </div>

          <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-14 xl:p-16">
            <div className="tech-grid absolute inset-0 opacity-25" />
            <h2 className="max-w-3xl font-heading text-[clamp(4rem,7vw,7rem)] font-extrabold uppercase leading-[0.9] tracking-[0.01em] text-white">
              {copy.who}
            </h2>
            <p className="relative mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {copy.whoText}
            </p>

            <div className="relative mt-9 grid gap-7 border-y border-white/12 py-7 sm:grid-cols-[0.72fr_1.28fr] sm:items-center">
              <div className="flex items-center justify-center gap-5 border-white/12 sm:border-r sm:pr-7">
                <Image src="/brand/sett-logo.png" alt="SETT logosu" width={500} height={600} className="h-20 w-auto object-contain" />
                <span className="font-heading text-3xl font-medium text-racing-green">×</span>
                <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula logosu" width={2400} height={1510} className="h-16 w-auto object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">{copy.heritage}</p>
                <h3 className="mt-3 font-heading text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">{copy.mergeTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  {copy.mergeText}
                </p>
              </div>
            </div>

            <Link href={localizedPath('/hakkimizda', language)} className="relative mt-8 inline-flex w-fit items-center gap-3 border-b border-racing-green pb-2 text-xs font-black uppercase tracking-[0.16em] text-white">
              {copy.story} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="araclar" className="bg-ink px-5 py-16 text-white lg:px-10 lg:py-20">
        <div className="relative mx-auto min-h-[560px] max-w-[1500px] overflow-hidden border border-racing-green/30 sm:min-h-[620px]">
          <Image
            src="/media/fs-ada02-front.webp"
            alt={isEnglish ? 'SAUFormula ADA-02 race car in the Formula Student Romania paddock' : 'SAUFormula ADA-02 yarış aracı Formula Student Romania paddock alanında'}
            fill
            sizes="(min-width: 1540px) 1500px, 100vw"
            className="object-cover object-[50%_64%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />

          <div className="relative flex min-h-[560px] items-center p-8 sm:min-h-[620px] sm:p-12 lg:p-16 xl:p-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.22em] text-racing-green">
                <span className="h-px w-12 bg-racing-green" aria-hidden="true" />
                {copy.currentGeneration}
              </div>
              <h2 className="mt-7 font-heading text-[clamp(4.4rem,8vw,8.5rem)] font-black uppercase leading-[0.84] tracking-[0.01em]">
                ADA-02
              </h2>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                {copy.carDescription}
              </p>
              <Link
                href={localizedPath('/araclar', language)}
                className="mt-9 inline-flex items-center gap-3 bg-racing-green px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-[#bff9d9]"
              >
                {copy.inspectCar} <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <p className="absolute bottom-5 right-6 hidden text-[9px] font-bold uppercase tracking-[0.18em] text-white/55 sm:block">
            ADA-02 · Formula Student Romania
          </p>
        </div>
      </section>

      <section id="yarismalar" className="bg-ink px-5 py-16 lg:px-10 lg:py-20">
        <div className="relative mx-auto min-h-[560px] max-w-[1500px] overflow-hidden border border-racing-green/30 text-white sm:min-h-[620px]">
          <Image
            src="/media/fs-romania-grid-wide.webp"
            alt={isEnglish ? 'Race cars from different universities at Formula Student Romania' : 'Formula Student Romania yarış alanında farklı üniversitelerin yarış araçları'}
            fill
            sizes="(min-width: 1540px) 1500px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/20" />

          <div className="relative flex min-h-[560px] items-center p-8 sm:min-h-[620px] sm:p-12 lg:p-16 xl:p-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.22em] text-racing-green">
                <span className="h-px w-12 bg-racing-green" aria-hidden="true" />
                {copy.fsEyebrow}
              </div>
              <h2 className="mt-7 font-heading text-[clamp(4rem,7.5vw,7.8rem)] font-black uppercase leading-[0.84] tracking-[0.01em]">
                Formula Student
              </h2>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                {copy.fsDescription}
              </p>
              <Link
                href={localizedPath('/formula-student', language)}
                className="mt-9 inline-flex items-center gap-3 bg-racing-green px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-[#bff9d9]"
              >
                {copy.discoverFs} <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <p className="absolute bottom-5 right-6 hidden text-[9px] font-bold uppercase tracking-[0.18em] text-white/55 sm:block">
            Formula Student Romania · Yarış alanı
          </p>
        </div>
      </section>

      <section className="border-t border-racing-green/30 bg-[#082119] px-5 py-14 text-white lg:px-10 lg:py-16">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-racing-green">{copy.together}</p>
            <h2 className="mt-4 max-w-5xl font-heading text-[clamp(3.2rem,7vw,7rem)] font-extrabold uppercase leading-[0.95] tracking-[0.01em]">
              {copy.sponsorTitle}
            </h2>
          </div>
          <Link href={localizedPath('/sponsorlar#sponsor-ol', language)} className="inline-flex h-16 shrink-0 items-center gap-4 bg-racing-green px-7 text-xs font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-[#bff9d9]">
            {copy.becomeSponsor} <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function Home() {
  return <HomePageContent />;
}
