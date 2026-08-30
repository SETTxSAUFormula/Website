import type { Metadata } from 'next';
import Link from 'next/link';
import { BriefcaseBusiness, Building2, Camera, Mail, MapPin } from 'lucide-react';

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
          <article className="min-h-72 border-b border-r border-border bg-[#071b14] p-8">
            <Building2 className="size-8 text-[#008d4e]" aria-hidden="true" />
            <p className="mt-16 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Takım</p>
            <h2 className="mt-2 font-heading text-3xl font-bold uppercase">SAUFormula</h2>
          </article>
          <article className="min-h-72 border-b border-r border-border bg-[#071b14] p-8">
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
        <div className="mx-auto mt-10 grid max-w-[1500px] gap-3 sm:grid-cols-3">
          <Link href="https://www.instagram.com/sau.formula/" target="_blank" rel="noreferrer" className="flex items-center justify-between border border-border bg-[#071b14] p-6 transition-colors hover:border-racing-green">
            <span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">Instagram</span><span className="mt-2 block font-semibold">@sau.formula</span></span><Camera aria-hidden="true" />
          </Link>
          <Link href="https://www.instagram.com/sauenerjiteknolojileri/" target="_blank" rel="noreferrer" className="flex items-center justify-between border border-border bg-[#071b14] p-6 transition-colors hover:border-racing-green">
            <span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">Instagram</span><span className="mt-2 block font-semibold">@sauenerjiteknolojileri</span></span><Camera aria-hidden="true" />
          </Link>
          <Link href="https://www.linkedin.com/company/enerjiteknolojileri/posts/?feedView=all" target="_blank" rel="noreferrer" className="flex items-center justify-between border border-border bg-[#071b14] p-6 transition-colors hover:border-racing-green">
            <span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">LinkedIn</span><span className="mt-2 block font-semibold">Enerji Teknolojileri</span></span><BriefcaseBusiness aria-hidden="true" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
