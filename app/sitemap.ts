import type { MetadataRoute } from 'next';

const routes = ['', '/hakkimizda', '/formula-student', '/araclar', '/takimlar', '/haberler', '/medya', '/sponsorlar', '/iletisim', '/gizlilik', '/en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-30');

  return routes.map((route) => ({
    url: `https://sauformula.org${route}`,
    lastModified,
    changeFrequency: route === '/haberler' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/en' ? 0.7 : 0.8,
  }));
}
