import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Gauge,
  MapPin,
} from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

const disciplines = [
  {
    no: '01',
    title: 'Konsept',
    text: 'Fikirleri; hesaplanabilir, üretilebilir ve pistte doğrulanabilir mühendislik çözümlerine dönüştürüyoruz.',
  },
  {
    no: '02',
    title: 'Geliştirme',
    text: 'Aracın parçalarını atölyede, takım arkadaşlarımız ve üretim partnerlerimizle gerçeğe taşıyoruz.',
  },
  {
    no: '03',
    title: 'Doğrulama',
    text: 'Her sistemi ölçüyor, sonuçlardan öğreniyor ve ADA-02’yi tur tur daha ileriye hazırlıyoruz.',
  },
  {
    no: '04',
    title: 'Pist',
    text: 'Mühendislik kararlarımızı Formula Student’ın statik ve dinamik disiplinlerinde savunuyoruz.',
  },
];

const sponsors = [
  { name: 'SolidWorks', src: '/sponsors/solidworks.png' },
  { name: 'Kordsa', src: '/sponsors/kordsa.png' },
  { name: 'Schmersal', src: '/sponsors/schmersal.png' },
  { name: 'ASAŞ', src: '/sponsors/asas.png' },
  { name: 'Armacell', src: '/sponsors/armacell.png' },
  { name: 'Altium', src: '/sponsors/altium.png' },
  { name: 'Ünelsis', src: '/sponsors/unelsis.png' },
  { name: 'Sarıgözoğlu', src: '/sponsors/sarigozoglu.png' },
];

const faqs = [
  ['SAUFormula nedir?', 'SAUFormula, Sakarya Üniversitesi öğrencilerinin Formula Student yarışları için araç geliştirdiği öğrenci mühendislik takımıdır.'],
  ['SETT ile SAUFormula arasındaki ilişki nedir?', 'Sakarya Üniversitesi Formula Student Takımı SAUFormula ile Sakarya Enerji Teknolojileri Takımı SETT, 2025 yılında güçlerini birleştirerek daha güçlü ve disiplinler arası bir ekip oluşturdu.'],
  ['Güncel aracın adı nedir?', 'Takımın güncel aracı ADA-02’dir ve araç numarası 54’tür.'],
  ['Takıma kimler katılabilir?', 'Güncel başvuru koşulları ve açık ekip rolleri takım tarafından doğrulandıktan sonra duyurulacaktır.'],
  ['SAUFormula’ya nasıl sponsor olabilirim?', 'Malzeme, üretim, teknoloji, eğitim veya finansal destek başlıklarında iş birliği kurulabilir. Kurumsal iletişim kanalı yayın öncesi eklenecektir.'],
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteHeader overlay />

      <section className="relative isolate min-h-[780px] bg-ink pt-24 text-white lg:min-h-screen">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_70%,rgba(0,226,123,0.17),transparent_30%),linear-gradient(120deg,#03110d_0%,#071b14_48%,#04100c_100%)]" />
        <div className="tech-grid absolute inset-0 -z-10 opacity-35" />
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[49%] bg-racing-green/5 lg:block" />

        <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1500px] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-5 py-16 lg:px-10 lg:py-20 xl:pr-20">
            <div className="mb-8 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">
              <span className="h-px w-12 bg-racing-green" />
              Formula Student · Türkiye
            </div>

            <h1 className="max-w-4xl font-heading text-[clamp(4rem,8vw,8.8rem)] font-black uppercase leading-[0.86] tracking-[0.01em]">
              <span className="block text-white">Race</span>
              <span className="block text-outline">Beyond</span>
              <span className="block text-racing-green">The Limits.</span>
            </h1>

            <div className="mt-10 grid max-w-2xl gap-8 border-t border-white/15 pt-7 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-lg text-base leading-7 text-white/65 sm:text-lg">
                Öğrencilerin yönettiği gerçek bir mühendislik ortamında, Türkiye’yi Formula Student
                pistlerinde temsil edecek yarış otomobilleri geliştiriyoruz.
              </p>
              <Link
                href="/araclar"
                className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                Aracı keşfet
                <span className="grid size-11 place-items-center border border-white/25 transition-colors group-hover:border-racing-green group-hover:bg-racing-green group-hover:text-ink">
                  <ArrowDownRight aria-hidden="true" />
                </span>
              </Link>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-3 border-y border-white/15">
              <div className="py-5 pr-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Araç No</dt>
                <dd className="mt-1 font-heading text-3xl font-bold">54</dd>
              </div>
              <div className="border-x border-white/15 px-4 py-5">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Sezon</dt>
                <dd className="mt-1 font-heading text-3xl font-bold">2026</dd>
              </div>
              <div className="py-5 pl-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Merkez</dt>
                <dd className="mt-1 font-heading text-3xl font-bold">SAÜ</dd>
              </div>
            </dl>
          </div>

          <div className="relative min-h-[560px] overflow-hidden border-l border-white/10 lg:min-h-0">
            <Image
              src="/media/ada-02-car.jpg"
              alt="SAUFormula ADA-02, 54 numaralı Formula Student yarış aracı"
              fill
              priority
              sizes="(min-width: 1024px) 49vw, 100vw"
              className="object-cover object-[50%_62%] grayscale-[18%] contrast-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ink/80 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between border-t border-white/15 bg-ink/65 p-6 backdrop-blur-md lg:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">Güncel araç</p>
                <p className="mt-2 font-heading text-4xl font-bold uppercase">ADA-02</p>
              </div>
              <p className="max-w-[210px] text-right text-xs leading-5 text-white/55">
                Pistteki her tur, atölyedeki binlerce kararın sonucu.
              </p>
            </div>

            <div className="absolute right-0 top-20 bg-racing-green px-3 py-8 text-[10px] font-black uppercase tracking-[0.24em] text-ink [writing-mode:vertical-rl]">
              ADA-02 · 54
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-racing-green/25 bg-[#071b14] px-5 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="flex items-center gap-6">
              <Image src="/brand/sett-logo.png" alt="SETT logosu" width={500} height={600} className="h-28 w-auto object-contain" />
              <span className="font-heading text-4xl font-medium text-white/30">×</span>
              <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula logosu" width={2400} height={1510} className="h-24 w-auto object-contain" />
            </div>
            <div className="mt-9 border-t border-white/10 pt-7">
              <div className="w-fit max-w-full bg-[#ced8d2] px-5 py-3">
                <Image src="/brand/sakarya-universitesi-logo.png" alt="Sakarya Üniversitesi logosu" width={600} height={600} className="h-12 w-auto max-w-full object-contain object-left" />
              </div>
            </div>
          </div>
          <div className="lg:border-l lg:border-white/15 lg:pl-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-racing-green">2025 · Güçlerin birleşmesi</p>
            <h2 className="mt-5 font-heading text-5xl font-extrabold uppercase leading-[0.96] tracking-[0.01em] sm:text-7xl">Daha güçlü, daha yenilikçi, daha kararlı.</h2>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/60">
              Sakarya Üniversitesi Formula Student Takımı SAUFormula ile Sakarya Enerji Teknolojileri
              Takımı SETT güçlerini birleştirerek ortak bir ekip oluşturdu. Mekanikten elektroniğe,
              kompozitten yazılıma uzanan bu yapı; yarış aracı tasarlayıp üretmek, mühendislikte ve
              pistte en iyisini ortaya koymak ve üniversitemizi uluslararası arenada temsil etmek için çalışıyor.
            </p>
          </div>
        </div>
      </section>

      <section id="takim" className="px-5 py-20 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden bg-ink lg:min-h-[620px]">
            <Image
              src="/media/team-2026.jpg"
              alt="SAUFormula takım üyeleri pist alanında"
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">SAUFormula · Takım</span>
              <span className="font-heading text-5xl font-black text-racing-green">54</span>
            </div>
          </div>

          <div className="lg:pl-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-racing-green">Biz kimiz?</p>
            <h2 className="mt-5 max-w-3xl font-heading text-[clamp(3.2rem,6.5vw,6.5rem)] font-extrabold uppercase leading-[0.95] tracking-[0.01em] text-white">
              Mühendisliği sahada öğreniyoruz.
            </h2>
            <div className="mt-9 max-w-2xl space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                2007’de Türkiye’nin ilk hidrojen enerjili aracıyla yola çıkan Sakarya Üniversitesi
                Enerji Teknolojileri Topluluğu, bugün disiplinler arası mühendislik çalışmalarını
                Formula Student hedefleriyle ileri taşıyor.
              </p>
              <p>
                Tasarım, üretim, test ve organizasyon süreçlerini öğrencilerin yönettiği gerçek bir
                geliştirme ortamında bir araya getiriyoruz. Mühendisliği yalnızca teoride değil,
                sahada öğreniyoruz.
              </p>
            </div>
            <Link href="/takim" className="mt-9 inline-flex items-center gap-3 border-b border-racing-green pb-2 text-xs font-black uppercase tracking-[0.16em] text-white">
              Hikâyemizi keşfet <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="araclar" className="bg-ink px-5 py-20 text-white lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">Mühendislik döngüsü</p>
              <h2 className="mt-4 font-heading text-[clamp(3.2rem,6.5vw,6.5rem)] font-extrabold uppercase leading-[0.95] tracking-[0.01em]">
                Bir araçtan fazlası.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              ADA-02, yalnızca ortaya çıkan otomobil değil; karar alma, üretme, hata yapma ve yeniden
              deneme kültürümüzün pistteki karşılığı.
            </p>
          </div>

          <div className="grid lg:grid-cols-4">
            {disciplines.map((item) => (
              <article key={item.no} className="border-b border-white/15 py-10 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0">
                <p className="font-heading text-4xl font-black text-racing-green">{item.no}</p>
                <h3 className="mt-10 font-heading text-4xl font-bold uppercase">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{item.text}</p>
              </article>
            ))}
          </div>

          <Link href="/araclar" className="mt-12 inline-flex items-center gap-3 bg-racing-green px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-[#bff9d9]">
            ADA-02’yi incele <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="yarismalar" className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] overflow-hidden border border-border bg-[#071b14] lg:grid-cols-[0.75fr_1.25fr]">
          <div className="flex flex-col justify-between border-r border-racing-green/20 bg-[#0b281e] p-8 text-white lg:p-12">
            <div>
              <Gauge className="size-10 text-racing-green" aria-hidden="true" />
              <p className="mt-16 text-[11px] font-black uppercase tracking-[0.22em]">Formula Student</p>
              <h2 className="mt-3 font-heading text-6xl font-black uppercase leading-[0.85]">Pistte kanıtla.</h2>
            </div>
            <Link href="/yarismalar" className="mt-12 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
              Yarışmaları tanı <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <article className="bg-[#071b14] p-8 lg:p-12">
              <CalendarDays className="size-7 text-racing-green" aria-hidden="true" />
              <h3 className="mt-12 font-heading text-4xl font-bold uppercase">Statik disiplinler</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Tasarım kararları, maliyet yaklaşımı ve iş planı; yalnızca anlatılmaz, jüri karşısında savunulur.
              </p>
            </article>
            <article className="bg-[#071b14] p-8 lg:p-12">
              <MapPin className="size-7 text-racing-green" aria-hidden="true" />
              <h3 className="mt-12 font-heading text-4xl font-bold uppercase">Dinamik disiplinler</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Hızlanma, yol tutuş, autocross ve dayanıklılık etapları; aracın bütününü pistte sınar.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="sponsorlar" className="border-y border-border bg-[#061811] px-5 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-racing-green">Birlikte geliştiriyoruz</p>
              <h2 className="mt-4 font-heading text-5xl font-black uppercase tracking-tight sm:text-7xl">Destekçilerimiz</h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground">
              Bilgi, malzeme, üretim ve teknoloji desteğiyle mühendislik yolculuğumuza güç veren paydaşlarımız.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 border-l border-t border-border md:grid-cols-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.name} className="relative flex min-h-36 items-center justify-center border-b border-r border-border bg-[#ced8d2] p-6">
                <Image
                  src={sponsor.src}
                  alt={`${sponsor.name} logosu`}
                  width={280}
                  height={130}
                  className="max-h-16 w-auto max-w-[80%] object-contain"
                />
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Sponsor listesi ve kademeleri güncel kurumsal dosyalar geldikçe yenilenecektir. Logolar özgün marka renkleriyle kullanılır.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-racing-green">Merak edilenler</p>
            <h2 className="mt-4 font-heading text-6xl font-black uppercase leading-[0.86] sm:text-8xl">Sıkça sorulanlar.</h2>
          </div>
          <div className="border-t border-white/15">
            {faqs.map(([question, answer], index) => (
              <details key={question} className="group border-b border-white/15 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-2xl font-bold uppercase sm:text-3xl">
                  <span><span className="mr-4 text-racing-green">0{index + 1}</span>{question}</span>
                  <span className="text-racing-green transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-2 pl-11 pt-5 text-sm leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-racing-green/30 bg-[#082119] px-5 py-16 text-white lg:px-10 lg:py-24">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-racing-green">Birlikte daha ileri</p>
            <h2 className="mt-4 max-w-5xl font-heading text-[clamp(3.2rem,7vw,7rem)] font-extrabold uppercase leading-[0.95] tracking-[0.01em]">
              Geleceğin mühendislerine güç verin.
            </h2>
          </div>
          <Link href="/sponsorlar#sponsor-ol" className="inline-flex h-16 shrink-0 items-center gap-4 bg-racing-green px-7 text-xs font-black uppercase tracking-[0.16em] text-ink transition-colors hover:bg-[#bff9d9]">
            Sponsor olun <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
