import type { Metadata } from 'next';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext'],
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sauformula.org'),
  title: {
    default: 'SAUFormula | Sakarya Üniversitesi Formula Student Takımı',
    template: '%s | SAUFormula',
  },
  description:
    'SAUFormula; Sakarya Üniversitesi öğrencilerinin tasarladığı, ürettiği ve yarışlara hazırladığı Formula Student araçlarının mühendislik hikâyesidir.',
  applicationName: 'SAUFormula',
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    url: '/',
    siteName: 'SAUFormula',
    title: 'SAUFormula | Race Beyond the Limits',
    description: 'Sakarya Üniversitesi Formula Student Takımı ve 54 numaralı ADA-02 yarış aracı.',
    images: [{ url: '/media/ada-02-car.jpg', alt: 'SAUFormula ADA-02 Formula Student aracı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAUFormula | Race Beyond the Limits',
    description: 'Sakarya Üniversitesi Formula Student Takımı ve ADA-02.',
    images: ['/media/ada-02-car.jpg'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SAUFormula',
  alternateName: 'SETT × SAUFormula',
  url: 'https://sauformula.org',
  logo: 'https://sauformula.org/brand/sauformula-logo-light.png',
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'Sakarya Üniversitesi',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} ${barlowCondensed.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
