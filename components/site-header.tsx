'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { languageSwitchPath, localizedPath, type Language } from '@/lib/i18n';

const navigation = {
  tr: [
    { label: 'Anasayfa', href: '/' },
    { label: 'Biz Kimiz?', href: '/hakkimizda' },
    { label: 'Formula Student', href: '/formula-student' },
    { label: 'Araçlar', href: '/araclar' },
    { label: 'Takımımız', href: '/takimlar' },
    { label: 'Sponsorlar', href: '/sponsorlar' },
    { label: 'İletişim', href: '/iletisim' },
  ],
  en: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/hakkimizda' },
    { label: 'Formula Student', href: '/formula-student' },
    { label: 'Cars', href: '/araclar' },
    { label: 'Our Team', href: '/takimlar' },
    { label: 'Sponsors', href: '/sponsorlar' },
    { label: 'Contact', href: '/iletisim' },
  ],
} satisfies Record<Language, Array<{ label: string; href: string }>>;

export function SiteHeader({ overlay = false, language = 'tr' }: { overlay?: boolean; language?: Language }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const items = navigation[language];
  const switchPath = languageSwitchPath(pathname, language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const isActive = (href: string) => {
    const localizedHref = localizedPath(href, language);
    return localizedHref === (language === 'en' ? '/en' : '/')
      ? pathname === localizedHref
      : pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
  };

  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-40 text-white' : 'relative z-40 bg-ink text-white'}>
      <div className="border-b border-white/10 bg-[#03110d]/92 px-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex h-24 max-w-[1500px] items-center justify-between gap-6">
          <Link href={localizedPath('/', language)} aria-label={language === 'en' ? 'SAUFormula home' : 'SAUFormula ana sayfa'} className="shrink-0">
            <Image
              src="/brand/sauformula-logo-light.png"
              alt="SAUFormula"
              width={2400}
              height={1510}
              priority
              className="h-20 w-auto max-w-none origin-left scale-125 object-contain"
            />
          </Link>

          <nav aria-label={language === 'en' ? 'Main menu' : 'Ana menü'} className="hidden h-24 items-stretch border-x border-white/12 xl:flex">
            {items.map((item) => (
              <Link
                key={item.label}
                href={localizedPath(item.href, language)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`flex items-center border-r border-white/12 px-4 text-[11px] font-extrabold uppercase tracking-[0.04em] transition-colors 2xl:px-5 ${
                  isActive(item.href)
                    ? 'bg-white/[0.07] text-white shadow-[inset_0_-2px_0_#00e27b]'
                    : 'text-white/65 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={switchPath}
              hrefLang={language === 'en' ? 'tr' : 'en'}
              className="hidden h-10 items-center border-l border-white/15 pl-5 text-xs font-semibold tracking-[0.15em] text-white/70 lg:flex"
            >
              <span className={language === 'tr' ? 'text-white' : undefined}>TR</span>
              <span className="mx-2 text-white/25">/</span>
              <span className={language === 'en' ? 'text-white' : undefined}>EN</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid size-11 place-items-center border border-white/15 text-white xl:hidden"
              aria-label={mobileOpen ? (language === 'en' ? 'Close menu' : 'Menüyü kapat') : language === 'en' ? 'Open menu' : 'Menüyü aç'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-white/10 bg-ink px-5 py-5 shadow-2xl xl:hidden">
          <nav aria-label={language === 'en' ? 'Mobile menu' : 'Mobil menü'} className="mx-auto grid max-w-[1500px] gap-1">
            {items.map((item, index) => (
              <Link
                key={item.label}
                href={localizedPath(item.href, language)}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`flex items-center justify-between border-b border-white/10 py-4 font-heading text-2xl font-bold uppercase ${
                  isActive(item.href) ? 'text-racing-green' : 'text-white'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs text-racing-green">0{index + 1}</span>
              </Link>
            ))}
            <div className="mt-4 flex gap-3">
              <Link href={switchPath} hrefLang={language === 'en' ? 'tr' : 'en'} className="flex h-12 flex-1 items-center justify-center border border-white/15 text-xs font-bold tracking-[0.16em]">
                TR / EN
              </Link>
              <Link href={localizedPath('/sponsorlar', language)} className="flex h-12 flex-1 items-center justify-center bg-racing-green text-xs font-bold uppercase tracking-[0.12em] text-ink">
                {language === 'en' ? 'Sponsors' : 'Sponsorlar'}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
