import type { Metadata } from 'next';
import Link from 'next/link';
import { BriefcaseBusiness, Camera, MapPin } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'SAUFormula iletişim, sosyal medya ve kampüs bilgileri.',
};

const socialLinks = [
  ['Instagram', '@sau.formula', 'https://www.instagram.com/sau.formula/', Camera],
  ['Instagram', '@sauenerjiteknolojileri', 'https://www.instagram.com/sauenerjiteknolojileri/', Camera],
  ['LinkedIn', 'Enerji Teknolojileri', 'https://www.linkedin.com/company/enerjiteknolojileri/posts/?feedView=all', BriefcaseBusiness],
] as const;

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />

      <section className="bg-ink px-5 pb-16 pt-32 text-white lg:px-10 lg:pb-20 lg:pt-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-white/15 pb-9 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Bağlantıda kalın</p>
              <h1 className="mt-4 font-heading text-[clamp(3.8rem,7vw,6.8rem)] font-black uppercase leading-[0.88]">İletişim</h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/60">Takım, iş birliği, sponsorluk ve medya görüşmeleri için sosyal kanallarımızdan bize ulaşabilir veya laboratuvarımızı haritada görüntüleyebilirsiniz.</p>
          </div>

          <div className="mt-8 grid border border-white/15 bg-[#071b14] lg:grid-cols-[1fr_1.25fr]">
            <article className="border-b border-white/15 p-7 lg:border-b-0 lg:border-r lg:p-9">
              <MapPin className="size-7 text-racing-green" aria-hidden="true" />
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-racing-green">Konum</p>
              <h2 className="mt-2 font-heading text-3xl font-bold uppercase">Enerji Teknolojileri Laboratuvarı</h2>
              <address className="mt-4 max-w-xl not-italic text-sm leading-7 text-white/50">Sakarya Üniversitesi Enerji Teknolojileri Laboratuvarı, Kemalpaşa Mahallesi, Sakarya Üniversitesi Esentepe Kampüsü, 54050 Serdivan/Sakarya, Türkiye</address>
              <Link href="https://www.google.com/maps/search/?api=1&query=Sakarya+Universitesi+Enerji+Teknolojileri+Laboratuvari+Esentepe+Kampusu+Serdivan+Sakarya" target="_blank" rel="noreferrer" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-racing-green hover:text-white">Haritada aç</Link>
            </article>

            <div className="grid sm:grid-cols-3">
              {socialLinks.map(([network, label, href, Icon]) => (
                <Link key={label} href={href} target="_blank" rel="noreferrer" className="flex min-h-56 flex-col justify-between border-b border-white/12 p-7 transition-colors hover:bg-white/[0.03] sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <Icon className="size-7 text-racing-green" aria-hidden="true" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{network}</span>
                    <span className="mt-2 block font-heading text-xl font-bold uppercase">{label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
