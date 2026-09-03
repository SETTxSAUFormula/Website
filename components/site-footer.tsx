import Image from 'next/image';
import Link from '@/components/site-link';

import { localizedPath, type Language } from '@/lib/i18n';

const columns = {
  tr: [
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
        ['Medya', '/medya'],
        ['Sponsorlar', '/sponsorlar'],
        ['Bize Katıl', '/bize-katil'],
        ['İletişim', '/iletisim'],
      ],
    },
  ],
  en: [
    {
      title: 'Team',
      links: [
        ['About Us', '/hakkimizda'],
        ['Vision and Mission', '/hakkimizda#vizyon-misyon'],
        ['Our Team', '/takimlar'],
        ['Our Cars', '/araclar'],
        ['Formula Student', '/formula-student'],
      ],
    },
    {
      title: 'Explore',
      links: [
        ['Media', '/medya'],
        ['Sponsors', '/sponsorlar'],
        ['Join Us', '/bize-katil'],
        ['Contact', '/iletisim'],
      ],
    },
  ],
} satisfies Record<Language, Array<{ title: string; links: string[][] }>>;

export function SiteFooter({ language = 'tr' }: { language?: Language }) {
  const isEnglish = language === 'en';

  return (
    <footer id="iletisim" className="bg-ink px-5 pb-6 pt-12 text-white sm:pt-16 lg:px-10 lg:pt-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-9 border-b border-white/15 pb-12 sm:grid-cols-2 sm:gap-12 sm:pb-16 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/brand/sauformula-logo-light.png"
              alt="SAUFormula"
              width={2400}
              height={1510}
              className="h-20 w-auto max-w-none object-contain sm:h-24"
            />
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
              {isEnglish
                ? 'The engineering story of Formula Student cars designed, built and prepared for competition by Sakarya University students.'
                : 'Sakarya Üniversitesi öğrencilerinin tasarladığı, ürettiği ve yarışlara hazırladığı Formula Student araçlarının mühendislik hikâyesi.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="https://www.instagram.com/sau.formula/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:border-racing-green hover:text-racing-green">
                <Image src="/brand/instagram-logo.png" alt="" width={1024} height={1024} aria-hidden="true" className="size-[18px] rounded object-contain" /> SAUFormula
              </Link>
              <Link href="https://www.instagram.com/sauenerjiteknolojileri/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:border-racing-green hover:text-racing-green">
                <Image src="/brand/instagram-logo.png" alt="" width={1024} height={1024} aria-hidden="true" className="size-[18px] rounded object-contain" /> SETT
              </Link>
              <Link href="https://www.linkedin.com/company/enerjiteknolojileri/posts/?feedView=all" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:border-racing-green hover:text-racing-green">
                <Image src="/brand/linkedin-logo.png" alt="" width={1024} height={1024} aria-hidden="true" className="size-[18px] rounded object-contain" /> LinkedIn
              </Link>
            </div>
          </div>

          {columns[language].map((column) => (
            <div key={column.title}>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-racing-green">{column.title}</p>
              <ul className="mt-6 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={localizedPath(href, language)} className="text-sm text-white/60 transition-colors hover:text-white">
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
          <Link href={localizedPath('/iletisim', language)} className="text-xs font-bold uppercase tracking-[0.16em] text-racing-green hover:text-white">
            {isEnglish ? 'Contact information' : 'İletişim bilgileri'}
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SAUFormula. {isEnglish ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}</p>
          <div className="flex gap-5">
            <Link href={localizedPath('/gizlilik', language)}>{isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}</Link>
            <Link href={localizedPath('/iletisim', language)}>{isEnglish ? 'Contact' : 'İletişim'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
