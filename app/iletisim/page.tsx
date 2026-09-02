import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { ContactForm } from '@/components/contact-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'SAUFormula iletişim, sosyal medya ve kampüs bilgileri.',
  alternates: { canonical: '/iletisim', languages: { 'tr-TR': '/iletisim', 'en-US': '/en/iletisim' } },
};

const pageCopy = {
  tr: { eyebrow: 'Bağlantıda kalın', title: 'İletişim', intro: 'Takım, iş birliği, sponsorluk ve medya görüşmeleri için sosyal kanallarımızdan bize ulaşabilir veya laboratuvarımızı haritada görüntüleyebilirsiniz.', location: 'Konum', lab: 'Enerji Teknolojileri Laboratuvarı', map: 'Haritada aç', mapTitle: 'Sakarya Üniversitesi Enerji Teknolojileri Laboratuvarı haritası', formEyebrow: 'Doğrudan iletişim', formTitle: 'Bize mesaj bırakın.', formText: 'Sponsorluk, teknik iş birliği, takım katılımı veya medya talepleriniz için konuyu seçip mesajınızı hazırlayabilirsiniz.' },
  en: { eyebrow: 'Stay connected', title: 'Contact', intro: 'For team, partnership, sponsorship and media enquiries, reach us through our social channels or view our laboratory on the map.', location: 'Location', lab: 'Energy Technologies Laboratory', map: 'Open in Maps', mapTitle: 'Map of Sakarya University Energy Technologies Laboratory', formEyebrow: 'Direct contact', formTitle: 'Leave us a message.', formText: 'Choose a subject and prepare your message for sponsorship, technical partnerships, joining the team or media requests.' },
};

const socialLinks = [
  ['Instagram', '@sau.formula', 'https://www.instagram.com/sau.formula/', '/brand/instagram-logo.png'],
  ['Instagram', '@sauenerjiteknolojileri', 'https://www.instagram.com/sauenerjiteknolojileri/', '/brand/instagram-logo.png'],
  ['LinkedIn', 'Enerji Teknolojileri', 'https://www.linkedin.com/company/enerjiteknolojileri/posts/?feedView=all', '/brand/linkedin-logo.png'],
] as const;

export function ContactPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />

      <section className="bg-ink px-5 py-12 text-white lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-white/15 pb-9 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.eyebrow}</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88]">{copy.title}</h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/60">{copy.intro}</p>
          </div>

          <div className="mt-8 grid border border-white/15 bg-[#071b14] lg:grid-cols-[1fr_1.25fr]">
            <article className="border-b border-white/15 p-7 lg:border-b-0 lg:border-r lg:p-9">
              <MapPin className="size-7 text-racing-green" aria-hidden="true" />
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">{copy.location}</p>
              <h2 className="mt-2 font-heading text-3xl font-bold uppercase">{copy.lab}</h2>
              <address className="mt-4 max-w-xl not-italic text-sm leading-7 text-white/50">Sakarya Üniversitesi Enerji Teknolojileri Laboratuvarı, Kemalpaşa Mahallesi, Sakarya Üniversitesi Esentepe Kampüsü, 54050 Serdivan/Sakarya, Türkiye</address>
              <Link href="https://maps.app.goo.gl/cPoDdCVKdTN2cdwV6" target="_blank" rel="noreferrer" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-racing-green hover:text-white">{copy.map}</Link>
            </article>

            <div className="grid sm:grid-cols-3">
              {socialLinks.map(([network, label, href, logo]) => (
                <Link key={label} href={href} target="_blank" rel="noreferrer" className="flex min-h-44 min-w-0 items-center gap-4 border-b border-white/12 p-6 transition-colors hover:bg-white/[0.03] sm:border-b-0 sm:border-r sm:last:border-r-0 xl:p-7">
                  <Image src={logo} alt="" width={1024} height={1024} aria-hidden="true" className="size-9 shrink-0 rounded-[8px] object-contain" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{network}</span>
                    <span className="mt-2 block min-w-0 font-heading text-sm font-bold leading-snug [overflow-wrap:anywhere] 2xl:text-base">{label}</span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="relative h-[300px] border-t border-white/15 lg:col-span-2 lg:h-[360px]">
              <iframe
                src="https://www.google.com/maps?q=40.7446995,30.3263661&z=17&output=embed"
                title={copy.mapTitle}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 grayscale-[0.25]"
              />
            </div>
          </div>

          <section className="mt-12 grid gap-8 border-t border-racing-green/30 pt-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">{copy.formEyebrow}</p>
              <h2 className="mt-4 max-w-xl font-heading text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{copy.formTitle}</h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">{copy.formText}</p>
            </div>
            <ContactForm language={language} />
          </section>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}

export default function ContactPage() {
  return <ContactPageContent />;
}
