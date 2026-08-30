import type { Metadata } from 'next';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'SAUFormula web sitesi gizlilik politikası taslağı.',
};

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="Yasal" title="Gizlilik" description="Bu sayfa, sauformula.org için yayın öncesi hazırlanmış gizlilik politikası iskeletidir." />
      <article className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-4xl space-y-10 border border-border bg-[#071b14] p-8 sm:p-12">
          <section>
            <h2 className="font-heading text-3xl font-bold uppercase">Veri işleme yaklaşımı</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Site ilk sürümünde kullanıcı hesabı veya iletişim formu üzerinden kişisel veri toplamayı hedeflememektedir. Teknik işletim sırasında güvenlik ve performans amacıyla sınırlı sunucu kayıtları oluşabilir.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-bold uppercase">Çerezler ve ölçümleme</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Zorunlu olmayan analiz veya pazarlama çerezleri kullanıma alınırsa, kapsamı ve tercih seçenekleri bu metinde açıkça belirtilecektir.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-bold uppercase">Yayın öncesi inceleme</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Bu metin hukuki danışmanlık değildir. Nihai altyapı, analiz araçları ve iletişim süreçleri belli olduğunda takım tarafından gözden geçirilip güncellenecektir.
            </p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
