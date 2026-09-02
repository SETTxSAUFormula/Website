import type { MetadataRoute } from 'next';

const turkishRoutes = ['', '/hakkimizda', '/formula-student', '/araclar', '/takimlar', '/medya', '/sponsorlar', '/iletisim', '/gizlilik'];
const englishRoutes = turkishRoutes.map((route) => `/en${route}`);
const routes = [...turkishRoutes, ...englishRoutes];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-30');

  return routes.map((route) => ({
    url: `https://sauformula.org${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : route === '/en' ? 0.9 : route.startsWith('/en/') ? 0.75 : 0.8,
  }));
}
