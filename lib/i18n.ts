export type Language = 'tr' | 'en';

export function localizedPath(path: string, language: Language) {
  if (!path.startsWith('/')) return path;

  if (language === 'en') {
    return path === '/' ? '/en' : `/en${path}`;
  }

  return path;
}

export function languageSwitchPath(pathname: string, language: Language) {
  if (language === 'en') {
    return pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  }

  return pathname === '/' ? '/en' : `/en${pathname}`;
}
