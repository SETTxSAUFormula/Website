import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Formula Student Team',
  description: 'SAUFormula is Sakarya University’s student-led Formula Student engineering team.',
};

export default function EnglishHomePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <header className="border-b border-white/15 px-5 lg:px-10">
        <div className="mx-auto flex h-28 max-w-[1500px] items-center justify-between">
          <Link href="/en" aria-label="SAUFormula English home">
            <Image src="/brand/sauformula-logo-light.png" alt="SAUFormula" width={2400} height={1510} priority className="h-24 w-auto origin-left scale-125 object-contain" />
          </Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.18em] text-white/60 hover:text-racing-green">TR / EN</Link>
        </div>
      </header>
      <section className="relative isolate overflow-hidden px-5 py-24 lg:px-10 lg:py-36">
        <div className="tech-grid absolute inset-0 -z-10 opacity-35" />
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-racing-green">Sakarya University Formula Student Team</p>
            <h1 className="mt-7 font-heading text-[clamp(4.5rem,10vw,9rem)] font-extrabold uppercase leading-[0.9] tracking-[0.01em]">
              Race beyond<br /><span className="text-racing-green">the limits.</span>
            </h1>
            <p className="mt-10 max-w-2xl text-lg leading-8 text-white/55">
              A student-led engineering team designing, building and testing Formula Student race cars. Our current car is ADA-02, number 54.
            </p>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/40">
              The complete English site is being prepared. The Turkish version remains the primary source during development.
            </p>
            <Link href="/" className="mt-10 inline-flex items-center gap-3 bg-racing-green px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-ink">
              View Turkish site <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative min-h-[500px] overflow-hidden border border-white/15">
            <Image src="/media/ada-02-car.jpg" alt="SAUFormula ADA-02 Formula Student car" fill sizes="(min-width:1024px) 45vw,100vw" className="object-cover object-[50%_60%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <p className="absolute bottom-7 left-7 font-heading text-5xl font-black uppercase">ADA-02</p>
          </div>
        </div>
      </section>
    </main>
  );
}
