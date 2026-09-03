'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import type { Language } from '@/lib/i18n';

const formCopy = {
  tr: {
    name: 'Ad Soyad', namePlaceholder: 'Adınız ve soyadınız', email: 'E-posta', emailPlaceholder: 'ornek@eposta.com', subject: 'Konu', message: 'Mesaj', messagePlaceholder: 'Bize kısaca nasıl yardımcı olabileceğinizi veya ne hakkında görüşmek istediğinizi anlatın.', send: 'Mesajı gönder', sending: 'Gönderiliyor', note: 'Bilgileriniz yalnızca talebinizi yanıtlamak için ekibimize e-posta yoluyla iletilir; sitede bir veritabanına kaydedilmez.', success: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.', error: 'Mesaj gönderilemedi. Lütfen biraz sonra yeniden deneyin veya doğrudan info@sauformula.org adresine yazın.', verify: 'Göndermeden önce güvenlik doğrulamasının tamamlanmasını bekleyin.', security: 'Güvenli gönderim', options: ['Genel iletişim', 'Sponsorluk ve iş birliği', 'Takıma katılım', 'Medya ve etkinlik', 'Teknik iş birliği'],
  },
  en: {
    name: 'Full Name', namePlaceholder: 'Your full name', email: 'Email', emailPlaceholder: 'name@example.com', subject: 'Subject', message: 'Message', messagePlaceholder: 'Briefly tell us how you would like to help or what you would like to discuss.', send: 'Send message', sending: 'Sending', note: 'Your information is emailed to our team only to respond to your enquiry; it is not stored in a website database.', success: 'Your message was sent successfully. We will get back to you as soon as possible.', error: 'We could not send your message. Please try again shortly or email info@sauformula.org directly.', verify: 'Please wait for the security check to finish before sending.', security: 'Secure submission', options: ['General enquiry', 'Sponsorship and partnership', 'Join the team', 'Media and events', 'Technical collaboration'],
  },
};

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function TurnstileWidget({
  siteKey,
  language,
  onToken,
}: {
  siteKey: string;
  language: Language;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(Boolean(globalThis.window?.turnstile));

  useEffect(() => {
    if (!scriptReady || !window.turnstile || !containerRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: 'contact',
      size: 'flexible',
      theme: 'dark',
      language,
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [language, onToken, scriptReady, siteKey]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="min-h-[1px] w-full" />
    </>
  );
}

export function ContactForm({ language = 'tr' }: { language?: Language }) {
  const [siteKey, setSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'verify'>('idle');
  const copy = formCopy[language];

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/contact', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { siteKey?: unknown }) => {
        if (typeof data.siteKey === 'string') setSiteKey(data.siteKey);
      })
      .catch(() => setStatus('error'));
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    if (!turnstileToken) {
      setStatus('verify');
      return;
    }

    setStatus('sending');
    const form = new FormData(formElement);
    const getText = (key: string) => {
      const value = form.get(key);
      return typeof value === 'string' ? value.trim() : '';
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: getText('name'),
          email: getText('email'),
          subject: getText('subject'),
          message: getText('message'),
          company: getText('company'),
          language,
          turnstileToken,
        }),
      });

      if (!response.ok) throw new Error('Contact form request failed');
      formElement.reset();
      setTurnstileToken('');
      setWidgetVersion((version) => version + 1);
      setStatus('success');
    } catch {
      setTurnstileToken('');
      setWidgetVersion((version) => version + 1);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/15 bg-[#071b14] p-6 sm:p-8 lg:p-10" aria-busy={status === 'sending'}>
      <FieldGroup className="gap-6">
        <div className="pointer-events-none absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="contact-company">Company</label>
          <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{copy.name}</FieldLabel>
            <Input id="contact-name" name="name" autoComplete="name" required placeholder={copy.namePlaceholder} className="h-14 rounded-none border-white/15 bg-ink/35 px-4 text-white placeholder:text-white/25" />
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{copy.email}</FieldLabel>
            <Input id="contact-email" name="email" type="email" autoComplete="email" required placeholder={copy.emailPlaceholder} className="h-14 rounded-none border-white/15 bg-ink/35 px-4 text-white placeholder:text-white/25" />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="contact-subject" className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{copy.subject}</FieldLabel>
          <NativeSelect className="w-full [&_[data-slot=native-select]]:h-14 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-white/15 [&_[data-slot=native-select]]:bg-ink/35 [&_[data-slot=native-select]]:px-4 [&_[data-slot=native-select]]:pr-10 [&_[data-slot=native-select]]:text-white" id="contact-subject" name="subject" required defaultValue={copy.options[0]}>
            {copy.options.map((option) => <NativeSelectOption key={option} value={option}>{option}</NativeSelectOption>)}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing-green">{copy.message}</FieldLabel>
          <Textarea id="contact-message" name="message" required minLength={10} placeholder={copy.messagePlaceholder} className="min-h-44 resize-y rounded-none border-white/15 bg-ink/35 px-4 py-4 text-white placeholder:text-white/25" />
        </Field>

        <div className="border-t border-white/10 pt-6">
          <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
            <ShieldCheck className="size-4 text-racing-green" aria-hidden="true" />
            {copy.security}
          </div>
          {siteKey ? (
            <TurnstileWidget key={widgetVersion} siteKey={siteKey} language={language} onToken={setTurnstileToken} />
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-6 text-white/40">{copy.note}</p>
          <Button type="submit" disabled={status === 'sending' || !siteKey} className="h-14 shrink-0 rounded-none bg-racing-green px-6 text-xs font-black uppercase tracking-[0.15em] text-ink hover:bg-[#bff9d9]">
            {status === 'sending' ? copy.sending : copy.send}
            {status === 'sending' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>

        <output aria-live="polite" className={status === 'idle' || status === 'sending' ? 'sr-only' : `flex items-start gap-3 border px-4 py-3 text-sm leading-6 ${status === 'success' ? 'border-racing-green/40 bg-racing-green/10 text-[#bff9d9]' : 'border-red-400/35 bg-red-400/10 text-red-100'}`}>
          {status === 'success' ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />}
          {status === 'success' ? copy.success : status === 'verify' ? copy.verify : status === 'error' ? copy.error : ''}
        </output>
      </FieldGroup>
    </form>
  );
}
