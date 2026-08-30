import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Takımlar',
  description: 'SAUFormula sezon takımları, çalışma alanları ve ekip arşivi.',
};

const workAreas = [
  ['Mekanik', 'Şasi, süspansiyon, güç aktarımı, fren ve araç dinamiği sistemlerinin tasarım ve doğrulaması.'],
  ['Elektronik', 'Araç üzerindeki elektrik mimarisi, sensörler, veri toplama ve kontrol sistemleri.'],
  ['Kompozit', 'Hafif, dayanıklı ve üretilebilir kompozit parçaların tasarımı ve üretimi.'],
  ['Yazılım', 'Araç verisinin işlenmesi, mühendislik araçları, gömülü sistemler ve takımın dijital altyapısı.'],
  ['Organizasyon', 'Proje planlama, iletişim, sponsorluk, finans, etkinlik ve takım sürdürülebilirliği.'],
];

export default function TeamsPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="Sezonlar boyunca aynı hedef"
        title="Takımlar"
        description="Her sezon farklı disiplinlerden öğrenciler aynı araç etrafında buluşur. Ekipler değişir; teknik hafıza, sorumluluk ve yarışma hedefi yeni kuşağa aktarılır."
      />

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="relative min-h-[430px] overflow-hidden border border-white/10 bg-[#071b14] lg:min-h-[660px]">
            <Image
              src="/media/team-2026.jpg"
              alt="SAUFormula 2026 sezon takımı"
              fill
              sizes="(min-width: 1024px) 65vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="border-l border-racing-green/60 pl-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Güncel sezon</p>
            <h2 className="mt-5 font-heading text-7xl font-black uppercase leading-none sm:text-8xl">2026</h2>
            <p className="mt-7 text-base leading-8 text-white/60">
              ADA-02 etrafında çalışan güncel takım; tasarım, üretim, test ve organizasyon süreçlerini ortak bir ürün geliştirme planında yürütüyor.
            </p>
            <p className="mt-6 text-sm leading-7 text-white/40">
              Üye adları, görevler ve departman dağılımı takım yönetimi tarafından doğrulandıktan sonra yönetim panelinden yayınlanacak. Bu aşamada doğrulanmamış kişi bilgisi kullanmıyoruz.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071b14] px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Çalışma alanları</p>
          <h2 className="mt-5 max-w-4xl font-heading text-5xl font-black uppercase leading-[0.92] sm:text-7xl">Farklı disiplinler, tek araç.</h2>
          <div className="mt-14 grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-5">
            {workAreas.map(([title, text], index) => (
              <article key={title} className="min-h-80 border-b border-r border-white/15 p-7">
                <p className="font-heading text-3xl font-black text-racing-green">0{index + 1}</p>
                <h3 className="mt-16 font-heading text-3xl font-bold uppercase">{title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1500px] border border-white/15 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:p-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-green">Sezon arşivi</p>
            <h2 className="mt-5 font-heading text-4xl font-black uppercase sm:text-6xl">Teknik hafıza burada büyüyecek.</h2>
          </div>
          <p className="mt-7 max-w-xl text-sm leading-7 text-white/50 lg:mt-0">
            Geçmiş ve gelecek sezonların ekipleri; görev, departman, araç ve yarışma bilgileriyle birlikte veritabanından yönetilecek. Doğrulanan ilk arşiv kayıtları hazır olduğunda bu bölüm otomatik olarak genişleyecek.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
