'use client';

import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Language } from '@/lib/i18n';

export type VehicleDetail = {
  year: string;
  name: string;
  result: string;
  category: string;
  image: string;
  description: string;
  technology: string;
  competition: string;
  sourceUrl: string;
  scale?: number;
  origin?: string;
};

export type VehicleHistoryCopy = {
  vehicleAlt: string;
  inspect: string;
  dialogEyebrow: string;
  story: string;
  technology: string;
  competition: string;
  achievement: string;
  source: string;
  previous: string;
  next: string;
  close: string;
};

function VehicleCopy({ vehicle, inspect }: { vehicle: VehicleDetail; inspect: string }) {
  return (
    <div className="min-w-0">
      <p className="font-heading text-2xl font-black text-racing-green">{vehicle.year}</p>
      <h3 className="mt-1 break-words font-heading text-xl font-bold uppercase leading-none 2xl:text-2xl">{vehicle.name}</h3>
      <p className="mt-3 text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-white/70 2xl:text-[10px]">{vehicle.result}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{vehicle.category}</p>
      <span className="mt-4 inline-flex min-h-8 items-center gap-2 border border-racing-green bg-racing-green px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-ink shadow-[0_0_0_rgba(0,226,123,0)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:shadow-[0_0_24px_rgba(0,226,123,0.28)] group-focus-visible:-translate-y-0.5 group-focus-visible:shadow-[0_0_24px_rgba(0,226,123,0.28)]">
        {inspect}
        <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
      </span>
    </div>
  );
}

function VehicleVisual({
  vehicle,
  className = 'h-52',
  language,
}: {
  vehicle: VehicleDetail;
  className?: string;
  language: Language;
}) {
  return (
    <div className={`relative flex w-full items-center justify-center overflow-visible transition duration-300 ease-out group-hover:scale-[1.035] group-focus-visible:scale-[1.035] ${className}`}>
      <img
        src={vehicle.image}
        alt={`${vehicle.name} ${language === 'tr' ? 'aracının tamamı' : 'race car in full view'}`}
        draggable={false}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ transform: `scale(${vehicle.scale ?? 1})`, transformOrigin: vehicle.origin ?? 'center' }}
      />
    </div>
  );
}

export function VehicleHistory({
  vehicles,
  language,
  copy,
}: {
  vehicles: VehicleDetail[];
  language: Language;
  copy: VehicleHistoryCopy;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<-1 | 0 | 1>(0);
  const selected = selectedIndex === null ? null : vehicles[selectedIndex];
  const transitionClass = transitionDirection === 1
    ? 'vehicle-enter-next'
    : transitionDirection === -1
      ? 'vehicle-enter-previous'
      : 'vehicle-enter-open';

  useEffect(() => {
    if (selectedIndex === null) return;

    const adjacentIndexes = [
      (selectedIndex - 1 + vehicles.length) % vehicles.length,
      (selectedIndex + 1) % vehicles.length,
    ];

    adjacentIndexes.forEach((index) => {
      const preload = new window.Image();
      preload.src = vehicles[index].image;
      void preload.decode?.().catch(() => undefined);
    });
  }, [selectedIndex, vehicles]);

  const move = (direction: -1 | 1) => {
    setTransitionDirection(direction);
    setSelectedIndex((current) => {
      if (current === null) return 0;
      return (current + direction + vehicles.length) % vehicles.length;
    });
  };

  const openVehicle = (index: number) => {
    setTransitionDirection(0);
    setSelectedIndex(index);
  };

  return (
    <>
      <div className="mt-8 grid snap-x snap-mandatory grid-flow-col auto-cols-[88%] gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-10 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:pb-0 xl:hidden">
        {vehicles.map((vehicle, index) => (
          <button
            key={vehicle.name}
            type="button"
            onClick={() => openVehicle(index)}
            className="group grid min-h-60 snap-start grid-cols-[1.08fr_0.92fr] items-center border border-white/15 px-3 py-4 text-left outline-none transition-colors duration-300 ease-out hover:border-racing-green/60 focus-visible:border-racing-green focus-visible:ring-1 focus-visible:ring-racing-green sm:min-h-64 sm:border-x-0 sm:border-b-0 sm:px-0 sm:py-5"
            aria-label={`${vehicle.name}: ${copy.inspect}`}
          >
            <VehicleVisual vehicle={vehicle} className="h-48 sm:h-56" language={language} />
            <div className="border-l border-white/10 pl-5">
              <VehicleCopy vehicle={vehicle} inspect={copy.inspect} />
            </div>
          </button>
        ))}
      </div>

      <div className="relative mt-12 hidden xl:block">
        <div className="absolute left-[7.14%] right-[7.14%] top-[7px] h-px bg-racing-green/70" />
        <div className="relative grid grid-cols-7 gap-3">
          {vehicles.map((vehicle, index) => (
            <button
              key={vehicle.name}
              type="button"
              onClick={() => openVehicle(index)}
              className="group min-w-0 text-center outline-none"
              aria-label={`${vehicle.name}: ${copy.inspect}`}
            >
              <div className="grid h-4 place-items-center">
                <span className="z-10 size-4 rounded-full border-4 border-ink bg-racing-green transition-shadow group-hover:shadow-[0_0_18px_rgba(0,226,123,0.85)] group-focus-visible:shadow-[0_0_18px_rgba(0,226,123,0.85)]" />
              </div>
              <div className="mt-6 rounded-sm transition-colors group-hover:bg-white/[0.025] group-focus-visible:bg-white/[0.025] group-focus-visible:ring-1 group-focus-visible:ring-racing-green">
                <VehicleVisual vehicle={vehicle} className="mx-auto h-[220px] max-w-[235px] 2xl:h-[240px] 2xl:max-w-[260px]" language={language} />
                <div className="mx-auto mt-4 max-w-[230px] border-t border-white/15 px-2 pb-4 pt-4 transition-colors group-hover:border-racing-green/60">
                  <VehicleCopy vehicle={vehicle} inspect={copy.inspect} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIndex(null);
          }
        }}
      >
        {selected && (
          <DialogContent
            showCloseButton={false}
            overlayClassName="bg-black/80 duration-300"
            className="bottom-0 left-0 top-auto max-h-[94vh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-x-hidden overflow-y-auto rounded-none border border-white/15 bg-[#061811] p-0 text-white shadow-[0_-24px_80px_rgba(0,0,0,0.55)] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-open:slide-in-from-bottom-3 data-closed:slide-out-to-bottom-2 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-[1380px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-sm"
          >
            <div className="relative grid min-h-0 sm:min-h-[620px] lg:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.65fr)]">
              <DialogClose className="absolute right-4 top-4 z-20 grid size-11 place-items-center border border-white/20 bg-ink/75 text-white/70 backdrop-blur-sm transition hover:border-racing-green hover:text-racing-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-green" aria-label={copy.close}>
                <X className="size-5" />
              </DialogClose>

              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden border-b border-ink/20 bg-[#93a098] p-5 sm:min-h-[460px] sm:p-10 lg:min-h-[620px] lg:border-b-0 lg:border-r lg:p-14">
                <div aria-hidden="true" className="absolute inset-x-0 bottom-[15%] h-px bg-ink/15" />
                <div aria-hidden="true" className="absolute bottom-[11%] left-1/2 h-8 w-[52%] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-lg" />
                <span className="absolute left-6 top-6 border-l-2 border-ink/70 pl-3 text-[10px] font-black uppercase tracking-[0.24em] text-ink/70">{selected.year}</span>
                <span className="absolute bottom-6 right-6 text-[8px] font-bold uppercase tracking-[0.2em] text-ink/45">SAU FORMULA · ENGINEERING ARCHIVE</span>
                <img
                  key={selected.name}
                  src={selected.image}
                  alt={`${selected.name} ${copy.vehicleAlt}`}
                  className={`relative z-10 h-[240px] w-full object-contain sm:h-[390px] lg:h-[520px] ${transitionClass}`}
                  onAnimationEnd={(event) => event.currentTarget.classList.remove(transitionClass)}
                />
              </div>

              <div key={selected.name} className="vehicle-copy-enter relative flex flex-col p-6 sm:p-9 lg:p-10 xl:p-12">
                <div className="pr-12">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-racing-green">{copy.dialogEyebrow}</p>
                  <DialogTitle className="mt-3 font-heading text-5xl font-black uppercase leading-none sm:text-6xl lg:text-5xl xl:text-6xl">{selected.name}</DialogTitle>
                  <DialogDescription className="sr-only">{selected.description}</DialogDescription>
                </div>

                <div className="mt-6 flex items-center gap-3 border-y border-white/10 py-3">
                  <button type="button" onClick={() => move(-1)} className="grid size-10 place-items-center border border-white/15 text-white/70 transition hover:border-racing-green hover:text-racing-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-green" aria-label={`${copy.previous}: ${vehicles[(selectedIndex! - 1 + vehicles.length) % vehicles.length].name}`}>
                    <ArrowLeft className="size-4" />
                  </button>
                  <span className="min-w-12 text-center font-heading text-sm font-bold tracking-[0.16em] text-white/45">{selectedIndex! + 1} / {vehicles.length}</span>
                  <button type="button" onClick={() => move(1)} className="grid size-10 place-items-center border border-white/15 text-white/70 transition hover:border-racing-green hover:text-racing-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-green" aria-label={`${copy.next}: ${vehicles[(selectedIndex! + 1) % vehicles.length].name}`}>
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <div className="mt-7">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{copy.story}</p>
                  <p className="mt-3 text-sm leading-7 text-white/65 sm:text-base">{selected.description}</p>
                </div>

                <dl className="mt-7 grid border-y border-white/15 sm:grid-cols-3">
                  {[
                    [copy.technology, selected.technology],
                    [copy.competition, selected.competition],
                    [copy.achievement, selected.result],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-white/10 px-0 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0">
                      <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">{label}</dt>
                      <dd className="mt-2 text-xs font-bold uppercase leading-5 text-white/80">{value}</dd>
                    </div>
                  ))}
                </dl>

                <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-green">
                  {copy.source}
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

    </>
  );
}
