import type { Metadata } from 'next';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Language } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'SAUFormula web sitesi gizlilik politikası taslağı.',
  alternates: { canonical: '/gizlilik', languages: { 'tr-TR': '/gizlilik', 'en-US': '/en/gizlilik' } },
};

const pageCopy = {
  tr: {
    eyebrow: 'Yasal', title: 'Gizlilik', description: 'Bu sayfa, sauformula.org için yayın öncesi hazırlanmış gizlilik politikası iskeletidir.',
    sections: [
      ['Veri işleme yaklaşımı', 'İletişim formu, girdiğiniz bilgileri bu web sitesinde kaydetmez; mesajı cihazınızdaki e-posta uygulamasında hazırlar. Mesajı göndermeyi seçerseniz bilgiler e-posta sağlayıcıları ve SAUFormula iletişim ekibi tarafından iletişim talebinizi yanıtlamak amacıyla işlenebilir. Teknik işletim sırasında güvenlik ve performans amacıyla sınırlı sunucu kayıtları oluşabilir.'],
      ['Çerezler ve ölçümleme', 'Zorunlu olmayan analiz veya pazarlama çerezleri kullanıma alınırsa, kapsamı ve tercih seçenekleri bu metinde açıkça belirtilecektir.'],
      ['Yayın öncesi inceleme', 'Bu metin hukuki danışmanlık değildir. Nihai altyapı, analiz araçları ve iletişim süreçleri belli olduğunda takım tarafından gözden geçirilip güncellenecektir.'],
    ],
  },
  en: {
    eyebrow: 'Legal', title: 'Privacy', description: 'This page is the pre-launch privacy policy framework for sauformula.org.',
    sections: [
      ['How we handle data', 'The contact form does not store the information you enter on this website; it prepares the message in your device’s email application. If you choose to send it, email providers and the SAUFormula contact team may process the information to respond to your enquiry. Limited server logs may also be created for security and performance purposes.'],
      ['Cookies and analytics', 'If non-essential analytics or marketing cookies are introduced, their scope and preference controls will be explained clearly in this policy.'],
      ['Pre-launch review', 'This text is not legal advice. The team will review and update it once the final infrastructure, analytics tools and communication processes are confirmed.'],
    ],
  },
};

export function PrivacyPageContent({ language = 'tr' }: { language?: Language }) {
  const copy = pageCopy[language];

  return (
    <main>
      <SiteHeader language={language} />
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} language={language} />
      <article className="px-5 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-4xl space-y-10 border border-border bg-[#071b14] p-8 sm:p-12">
          {copy.sections.map(([title, text]) => (
            <section key={title}>
              <h2 className="font-heading text-3xl font-bold uppercase">{title}</h2>
              <p className="mt-4 leading-8 text-muted-foreground">{text}</p>
            </section>
          ))}
        </div>
      </article>
      <SiteFooter language={language} />
    </main>
  );
}

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
