import Link from '@/components/site-link';
import { ArrowLeft } from 'lucide-react';

import { SiteHeader } from '@/components/site-header';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <section className="relative isolate grid min-h-[calc(100vh-132px)] place-items-center overflow-hidden px-5 py-20 text-center">
        <div className="tech-grid absolute inset-0 -z-10 opacity-30" />
        <div>
          <p className="font-heading text-[clamp(8rem,25vw,20rem)] font-black leading-[0.7] text-racing-green">404</p>
          <h1 className="mt-10 font-heading text-5xl font-black uppercase sm:text-7xl">Bu viraj rotada yok.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/55">Aradığınız sayfa taşınmış, silinmiş veya henüz piste çıkmamış olabilir.</p>
          <Link href="/" className="mt-9 inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] hover:border-racing-green hover:text-racing-green">
            <ArrowLeft className="size-4" aria-hidden="true" /> Ana sayfaya dön
          </Link>
        </div>
      </section>
    </main>
  );
}
