import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAUFormula',
    short_name: 'SAUFormula',
    description: 'Sakarya Üniversitesi Formula Student Takımı',
    start_url: '/',
    display: 'standalone',
    background_color: '#03110d',
    theme_color: '#00e27b',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
