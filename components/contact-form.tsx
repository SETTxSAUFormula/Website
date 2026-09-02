'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import type { Language } from '@/lib/i18n';

const formCopy = {
  tr: {
    name: 'Ad Soyad', namePlaceholder: 'Adınız ve soyadınız', email: 'E-posta', emailPlaceholder: 'ornek@eposta.com', subject: 'Konu', message: 'Mesaj', messagePlaceholder: 'Bize kısaca nasıl yardımcı olabileceğinizi veya ne hakkında görüşmek istediğinizi anlatın.', send: 'Mesajı hazırla', note: 'Gönder düğmesi mesajınızı cihazınızdaki e-posta uygulamasında hazırlar; bilgiler bu site üzerinde saklanmaz.', status: 'Mesajınız e-posta uygulamanızda hazırlandı.', options: ['Genel iletişim', 'Sponsorluk ve iş birliği', 'Takıma katılım', 'Medya ve etkinlik', 'Teknik iş birliği'],
  },
  en: {
    name: 'Full Name', namePlaceholder: 'Your full name', email: 'Email', emailPlaceholder: 'name@example.com', subject: 'Subject', message: 'Message', messagePlaceholder: 'Briefly tell us how you would like to help or what you would like to discuss.', send: 'Prepare message', note: 'The send button prepares your message in your device’s email app; your information is not stored on this website.', status: 'Your message has been prepared in your email app.', options: ['General enquiry', 'Sponsorship and partnership', 'Join the team', 'Media and events', 'Technical collaboration'],
  },
};

export function ContactForm({ language = 'tr' }: { language?: Language }) {
  const [prepared, setPrepared] = useState(false);
  const copy = formCopy[language];

  function handleSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const getText = (key: string) => {
      const value = form.get(key);
      return typeof value === 'string' ? value : '';
    };
    const name = getText('name');
    const email = getText('email');
    const subject = getText('subject');
    const message = getText('message');
    const body = language === 'en'
      ? `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
      : `Ad Soyad: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\n${message}`;

    setPrepared(true);
    window.location.href = `mailto:info@sauformula.com?subject=${encodeURIComponent(`[SAUFormula] ${subject}`)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/15 bg-[#071b14] p-6 sm:p-8 lg:p-10">
      <FieldGroup className="gap-6">
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

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-6 text-white/40">{copy.note}</p>
          <Button type="submit" className="h-14 shrink-0 rounded-none bg-racing-green px-6 text-xs font-black uppercase tracking-[0.15em] text-ink hover:bg-[#bff9d9]">
            {copy.send} <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <output className="sr-only" aria-live="polite">{prepared ? copy.status : ''}</output>
      </FieldGroup>
    </form>
  );
}
