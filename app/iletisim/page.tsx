import type { Metadata } from 'next';
import { Building2, Mail, MapPin } from 'lucide-react';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'SAUFormula iletişim ve kampüs bilgileri.',
};

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="Bağlantıda kalın" title="İletişim" description="Takım, iş birliği ve medya talepleri için doğrulanmış iletişim kanallarımızı burada bir araya getireceğiz." />
      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] border-l border-t border-border md:grid-cols-3">
          <article className="min-h-72 border-b border-r border-border bg-white p-8">
            <Building2 className="size-8 text-[#008d4e]" aria-hidden="true" />
            <p className="mt-16 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Takım</p>
            <h2 className="mt-2 font-heading text-3xl font-bold uppercase">SETT × SAUFormula</h2>
          </article>
          <article className="min-h-72 border-b border-r border-border bg-white p-8">
            <MapPin className="size-8 text-[#008d4e]" aria-hidden="true" />
            <p className="mt-16 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Konum</p>
            <h2 className="mt-2 font-heading text-3xl font-bold uppercase">Sakarya Üniversitesi</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Serdivan, Sakarya</p>
          </article>
          <article className="min-h-72 border-b border-r border-border bg-ink p-8 text-white">
            <Mail className="size-8 text-racing-green" aria-hidden="true" />
            <p className="mt-16 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Kurumsal e-posta</p>
            <h2 className="mt-2 font-heading text-3xl font-bold uppercase">Kurulum bekleniyor</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">@sauformula.org adresi etkinleştirildiğinde burada yayınlanacaktır.</p>
          </article>
        </div>
        <div className="mx-auto mt-10 max-w-[1500px] border-l-4 border-racing-green bg-white p-7">
          <p className="text-sm leading-7 text-muted-foreground">
            İletişim formu bu aşamada bilinçli olarak eklenmedi. Sosyal medya bağlantıları, harita ve açık adres takım tarafından doğrulandıktan sonra yayına alınacak.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
