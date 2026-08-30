import Image from 'next/image';
import Link from 'next/link';
import { BriefcaseBusiness, Camera } from 'lucide-react';

const columns = [
  {
    title: 'Takım',
    links: [
      ['Biz Kimiz?', '/hakkimizda'],
      ['Vizyon ve Misyon', '/hakkimizda#vizyon-misyon'],
      ['Takımımız', '/takimlar'],
      ['Araçlarımız', '/araclar'],
      ['Formula Student', '/formula-student'],
    ],
  },
  {
    title: 'Keşfet',
    links: [
      ['Haberler', '/haberler'],
      ['Medya', '/medya'],
      ['Sponsorlar', '/sponsorlar'],
      ['İletişim', '/iletisim'],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="iletisim" className="bg-ink px-5 pb-6 pt-16 text-white lg:px-10 lg:pt-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-14 border-b border-white/15 pb-16 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div>
            <Image
              src="/brand/sauformula-logo-light.png"
              alt="SAUFormula"
              width={2400}
              height={1510}
              className="h-24 w-auto max-w-none object-contain"
            />
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
              Sakarya Üniversitesi öğrencilerinin tasarladığı, ürettiği ve yarışlara hazırladığı
              Formula Student araçlarının mühendislik hikâyesi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="https://www.instagram.com/sau.formula/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:border-racing-green hover:text-racing-green">
                <Camera className="size-4" aria-hidden="true" /> SAUFormula
              </Link>
              <Link href="https://www.instagram.com/sauenerjiteknolojileri/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:border-racing-green hover:text-racing-green">
                <Camera className="size-4" aria-hidden="true" /> SETT
              </Link>
              <Link href="https://www.linkedin.com/company/enerjiteknolojileri/posts/?feedView=all" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:border-racing-green hover:text-racing-green">
                <BriefcaseBusiness className="size-4" aria-hidden="true" /> LinkedIn
              </Link>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-racing-green">{column.title}</p>
              <ul className="mt-6 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/60 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <address className="max-w-3xl not-italic">
            <p className="text-sm font-semibold">Sakarya Üniversitesi Enerji Teknolojileri Laboratuvarı</p>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Kemalpaşa Mahallesi, Sakarya Üniversitesi Esentepe Kampüsü, 54050 Serdivan/Sakarya, Türkiye
            </p>
          </address>
          <Link href="/iletisim" className="text-xs font-bold uppercase tracking-[0.16em] text-racing-green hover:text-white">
            İletişim bilgileri
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SAUFormula. Tüm hakları saklıdır.</p>
          <div className="flex gap-5">
            <Link href="/gizlilik">Gizlilik Politikası</Link>
            <Link href="/iletisim">İletişim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
