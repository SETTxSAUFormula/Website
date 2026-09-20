import type { Metadata } from 'next';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';

import Link from '@/components/site-link';

export const metadata: Metadata = {
  title: 'Üye Girişi',
  description: 'SAUFormula üye paneline güvenli Google hesabıyla giriş.',
  robots: { index: false, follow: false, nocache: true },
};

const errorMessages: Record<string, string> = {
  not_authorized:
    'Bu Google hesabı aktif üye listesinde bulunmuyor. Takım liderinle iletişime geç.',
  cancelled: 'Google ile giriş işlemi tamamlanmadı.',
  invalid_flow: 'Giriş isteğinin süresi doldu. Lütfen yeniden dene.',
  invalid_identity: 'Google hesabının kimliği doğrulanamadı.',
  failed: 'Giriş sırasında güvenli şekilde tamamlanamayan bir hata oluştu.',
  config: 'Üye girişi henüz yapılandırılmadı. Sistem yöneticisiyle iletişime geç.',
};

export default async function PanelLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = errorCode ? errorMessages[errorCode] : '';

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#03110d] px-5 py-12 text-[#eef5f1]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,226,123,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,226,123,0.05)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <section className="relative w-full max-w-lg border border-[#214237] bg-[#071b14] p-7 shadow-2xl shadow-black/35 sm:p-10">
        <div className="flex size-12 items-center justify-center border border-[#00e27b]/35 bg-[#00e27b]/10 text-[#00e27b]">
          <LockKeyhole className="size-6" aria-hidden="true" />
        </div>
        <p className="mt-7 font-heading text-sm font-extrabold uppercase tracking-[0.16em] text-[#00e27b]">
          SAUFormula · Üye Paneli
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Takım hesabınla giriş yap
        </h1>
        <p className="mt-4 text-base leading-7 text-[#9caea4]">
          Google hesabın yalnızca kimliğini doğrulamak için kullanılır. Panele
          sadece aktif üye listesinde bulunan e-posta adresleri erişebilir.
        </p>

        {errorMessage ? (
          <div
            className="mt-6 border border-[#d13b39]/45 bg-[#d13b39]/10 px-4 py-3 text-sm leading-6 text-[#ffd7d6]"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}

        <Link
          href="/api/auth/google"
          className="mt-7 flex h-12 w-full items-center justify-center gap-3 border border-[#00e27b] bg-[#00e27b] px-5 text-sm font-extrabold text-[#03110d] transition-colors hover:bg-[#14ef8b]"
        >
          <ShieldCheck className="size-5" aria-hidden="true" />
          Google ile güvenli giriş
        </Link>
        <p className="mt-4 text-center text-xs leading-5 text-[#73867c]">
          Hesabın listede yoksa Google doğrulaması başarılı olsa bile panel
          oturumu oluşturulmaz.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#bff9d9] transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Siteye dön
        </Link>
      </section>
    </main>
  );
}
