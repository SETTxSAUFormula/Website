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
      ['Veri işleme yaklaşımı', 'İletişim formuna girdiğiniz ad, e-posta adresi, konu ve mesaj; talebinizi SAUFormula iletişim ekibine ulaştırmak ve yanıtlamak amacıyla Cloudflare altyapısı üzerinden işlenir ve Resend aracılığıyla info@sauformula.org adresine iletilir. Bu bilgiler siteye ait bir veritabanına kaydedilmez; ancak hizmet sağlayıcıların güvenlik ve teslimat kayıtlarında sınırlı süreyle yer alabilir.'],
      ['Güvenlik doğrulaması', 'Formun otomatik ve kötüye kullanım amaçlı gönderimlere karşı korunması için Cloudflare Turnstile kullanılır. Turnstile, form içeriğini değil doğrulama için gerekli sınırlı teknik sinyalleri işler.'],
      ['Çerezler ve ölçümleme', 'Zorunlu olmayan analiz veya pazarlama çerezleri kullanıma alınırsa, kapsamı ve tercih seçenekleri bu metinde açıkça belirtilecektir.'],
      ['Yayın öncesi inceleme', 'Bu metin hukuki danışmanlık değildir. Nihai altyapı, analiz araçları ve iletişim süreçleri belli olduğunda takım tarafından gözden geçirilip güncellenecektir.'],
    ],
  },
  en: {
    eyebrow: 'Legal', title: 'Privacy', description: 'This page is the pre-launch privacy policy framework for sauformula.org.',
    sections: [
      ['How we handle data', 'Your name, email address, subject and message are processed through Cloudflare infrastructure and delivered to info@sauformula.org via Resend so the SAUFormula contact team can receive and respond to your enquiry. The website does not store this information in its own database, although service providers may retain limited security and delivery logs.'],
      ['Security verification', 'Cloudflare Turnstile protects the form against automated and abusive submissions. Turnstile processes limited technical signals required for verification, not the contents of the form.'],
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
