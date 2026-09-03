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
      ['Veri işleme yaklaşımı', 'İletişim ve takım başvuru formlarına girdiğiniz bilgiler; talebinizi veya başvurunuzu almak, değerlendirmek, başvuru sürecini yönetmek ve sizinle iletişim kurmak amacıyla işlenir. Takım başvuruları Cloudflare D1 veritabanında güvenli biçimde kaydedilir ve yetkili SAUFormula ekip üyelerinin erişimine sunulur. Başvuru bildirimi ayrıca Resend aracılığıyla info@sauformula.org adresine iletilir.'],
      ['Saklama ve erişim', 'Başvuru kayıtlarına yalnızca başvuru sürecini yürütmekle görevli yetkili ekip üyeleri erişebilir. Veriler, başvuru ve ekip oluşturma süreçleri için gerekli olduğu sürece saklanır; işleme amacı sona erdiğinde veya geçerli bir saklama yükümlülüğü bulunmadığında silinir.'],
      ['Güvenlik doğrulaması', 'Formun otomatik ve kötüye kullanım amaçlı gönderimlere karşı korunması için Cloudflare Turnstile kullanılır. Turnstile, form içeriğini değil doğrulama için gerekli sınırlı teknik sinyalleri işler.'],
      ['Çerezler ve ölçümleme', 'Site performansını ve toplu ziyaret istatistiklerini anlamak için çerez veya yerel depolama kullanmadan çalışan Cloudflare Web Analytics kullanılmaktadır. Pazarlama amaçlı izleme yapılmamaktadır.'],
      ['Yayın öncesi inceleme', 'Bu metin hukuki danışmanlık değildir. Nihai altyapı, analiz araçları ve iletişim süreçleri belli olduğunda takım tarafından gözden geçirilip güncellenecektir.'],
    ],
  },
  en: {
    eyebrow: 'Legal', title: 'Privacy', description: 'This page is the pre-launch privacy policy framework for sauformula.org.',
    sections: [
      ['How we handle data', 'Information submitted through the contact and team application forms is processed to receive and evaluate your enquiry or application, manage the application process and contact you. Team applications are securely stored in a Cloudflare D1 database and made available to authorised SAUFormula team members. An application notification is also delivered to info@sauformula.org through Resend.'],
      ['Retention and access', 'Only authorised team members responsible for the application process may access application records. Data is retained while needed for application and team selection processes, and is deleted when the processing purpose ends unless a valid retention obligation applies.'],
      ['Security verification', 'Cloudflare Turnstile protects the form against automated and abusive submissions. Turnstile processes limited technical signals required for verification, not the contents of the form.'],
      ['Cookies and analytics', 'Cloudflare Web Analytics is used to understand aggregate visits and site performance without cookies or local storage. The website does not use analytics for marketing tracking.'],
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
