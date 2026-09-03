'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';

import Link from '@/components/site-link';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { localizedPath, type Language } from '@/lib/i18n';

const teams = {
  tr: [
    ['vehicle-dynamics', 'Vehicle Dynamics — Araç Dinamiği'],
    ['chassis-structures', 'Chassis & Structures — Şasi ve Yapısal Sistemler'],
    ['powertrain', 'Powertrain — Güç Aktarma Sistemi'],
    ['aerodynamics', 'Aerodynamics — Aerodinamik'],
    ['composites-manufacturing', 'Composites & Manufacturing — Kompozitler ve Üretim'],
    ['electrical-electronics', 'Electrical & Electronics — Elektrik ve Elektronik'],
    ['sponsorship-partnerships', 'Sponsorship & Partnerships — Sponsorluk ve İş Birlikleri'],
    ['media-communications', 'Media & Communications — Medya ve İletişim'],
    ['finance-operations', 'Finance & Operations — Finans ve Operasyon'],
  ],
  en: [
    ['vehicle-dynamics', 'Vehicle Dynamics'],
    ['chassis-structures', 'Chassis & Structures'],
    ['powertrain', 'Powertrain'],
    ['aerodynamics', 'Aerodynamics'],
    ['composites-manufacturing', 'Composites & Manufacturing'],
    ['electrical-electronics', 'Electrical & Electronics'],
    ['sponsorship-partnerships', 'Sponsorship & Partnerships'],
    ['media-communications', 'Media & Communications'],
    ['finance-operations', 'Finance & Operations'],
  ],
} satisfies Record<Language, string[][]>;

const copy = {
  tr: {
    sections: ['Kişisel ve eğitim bilgileri', 'Departman tercihi ve zaman', 'Deneyim ve yetkinlikler', 'Motivasyon ve takım uyumu'],
    name: 'Ad Soyad', email: 'E-posta adresi', phone: 'Telefon numarası', university: 'Üniversite', academicDepartment: 'Bölüm / Program', classLevel: 'Sınıf', linkedin: 'LinkedIn profili (varsa)', portfolio: 'Portföy / GitHub / proje bağlantısı (varsa)',
    primaryTeam: 'Katılmak istediğiniz departman', secondaryTeam: 'İkinci departman tercihiniz (isteğe bağlı)', weeklyHours: 'Takıma haftada ortalama kaç saat ayırabilirsiniz?', summer: 'Yaz dönemindeki atölye çalışmalarına katılabilir misiniz?', busy: 'Yarış ve üretim gibi yoğun dönemlerde aktif rol alabilir misiniz?',
    programs: 'Hangi programları, yazılımları veya teknik araçları kullanabiliyorsunuz?', community: 'Daha önce bir öğrenci topluluğunda veya takımda yer aldınız mı?', communityDetails: 'Yer aldığınız topluluğu, departmanınızı ve üstlendiğiniz işleri anlatın.', projects: 'Alanınızla ilgili daha önce yaptığınız projeleri anlatın.',
    motivation: 'SAUFormula’ya neden katılmak istiyorsunuz?', responsibility: 'Takım içindeki bir sorumluluğu zamanında yerine getiremeyeceğinizi fark ederseniz nasıl bir yol izlersiniz?', motivationFactor: 'Takımda sizi en çok motive eden unsur hangisidir?', additional: 'Eklemek istediğiniz bir şey var mı? (Beklenti, hedef veya bizim bilmemizi istediğiniz bir durum)',
    select: 'Seçiniz', none: 'İkinci tercihim yok', yes: 'Evet', no: 'Hayır', depends: 'Koşullara göre / Henüz emin değilim',
    consent: 'Başvuru bilgilerimin değerlendirme ve benimle iletişim kurulması amacıyla işlenmesini kabul ediyorum.', privacy: 'Gizlilik Politikası',
    security: 'Güvenli başvuru', note: 'Başvurunuz doğrudan SAUFormula ekibine e-posta yoluyla iletilir; sitede bir veritabanına kaydedilmez.', send: 'Başvuruyu gönder', sending: 'Gönderiliyor', success: 'Başvurunuz başarıyla gönderildi. Ekibimiz değerlendirme sonrasında sizinle iletişime geçecektir.', error: 'Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edip yeniden deneyin veya info@sauformula.org adresine yazın.', verify: 'Göndermeden önce güvenlik doğrulamasını tamamlayın.',
  },
  en: {
    sections: ['Personal and education details', 'Department preference and availability', 'Experience and skills', 'Motivation and team fit'],
    name: 'Full name', email: 'Email address', phone: 'Phone number', university: 'University', academicDepartment: 'Degree programme / Department', classLevel: 'Year of study', linkedin: 'LinkedIn profile (if available)', portfolio: 'Portfolio / GitHub / project link (if available)',
    primaryTeam: 'Department you would like to join', secondaryTeam: 'Second department preference (optional)', weeklyHours: 'How many hours can you dedicate to the team each week on average?', summer: 'Can you attend workshop activities during the summer?', busy: 'Can you take an active role during intensive periods such as manufacturing and competitions?',
    programs: 'Which software, programmes or technical tools can you use?', community: 'Have you previously taken part in a student club or team?', communityDetails: 'Describe the community, your department and the work you were responsible for.', projects: 'Tell us about projects you have previously completed in your field.',
    motivation: 'Why would you like to join SAUFormula?', responsibility: 'What would you do if you realised you could not complete a team responsibility on time?', motivationFactor: 'What would motivate you most as part of the team?', additional: 'Is there anything else you would like to add? (Expectations, goals or something you would like us to know)',
    select: 'Select', none: 'No second preference', yes: 'Yes', no: 'No', depends: 'It depends / I am not sure yet',
    consent: 'I consent to my application data being processed to evaluate my application and contact me.', privacy: 'Privacy Policy',
    security: 'Secure application', note: 'Your application is emailed directly to the SAUFormula team and is not stored in a website database.', send: 'Submit application', sending: 'Submitting', success: 'Your application was submitted successfully. Our team will contact you after reviewing it.', error: 'We could not submit your application. Please review your details and try again, or email info@sauformula.org.', verify: 'Please complete the security verification before submitting.',
  },
} satisfies Record<Language, Record<string, string | string[]>>;

const inputClass = 'h-14 rounded-none border-white/15 bg-ink/35 px-4 text-base text-white placeholder:text-white/25';
const textareaClass = 'min-h-36 resize-y rounded-none border-white/15 bg-ink/35 px-4 py-4 text-base leading-7 text-white placeholder:text-white/25';
const selectClass = 'w-full [&_[data-slot=native-select]]:h-14 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-white/15 [&_[data-slot=native-select]]:bg-ink/35 [&_[data-slot=native-select]]:px-4 [&_[data-slot=native-select]]:pr-10 [&_[data-slot=native-select]]:text-base [&_[data-slot=native-select]]:text-white';
const labelClass = 'text-sm font-bold leading-6 text-white/85';

function FormSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/12 pt-8 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center border border-racing-green/50 font-heading text-sm font-black text-racing-green">{number}</span>
        <h2 className="font-heading text-xl font-bold uppercase tracking-[0.03em] text-white sm:text-2xl">{title}</h2>
      </div>
      <FieldGroup className="gap-6">{children}</FieldGroup>
    </section>
  );
}

export function ApplicationForm({ language = 'tr' }: { language?: Language }) {
  const content = copy[language];
  const sectionTitles = content.sections as string[];
  const [siteKey, setSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [communityExperience, setCommunityExperience] = useState('no');
  const [primaryTeam, setPrimaryTeam] = useState('');
  const [secondaryTeam, setSecondaryTeam] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'verify'>('idle');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/application', { signal: controller.signal, cache: 'no-store' })
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
      const response = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: getText('name'), email: getText('email'), phone: getText('phone'), university: getText('university'), academicDepartment: getText('academicDepartment'), classLevel: getText('classLevel'), linkedin: getText('linkedin'), portfolio: getText('portfolio'), primaryTeam: getText('primaryTeam'), secondaryTeam: getText('secondaryTeam'), programs: getText('programs'), weeklyHours: getText('weeklyHours'), summerParticipation: getText('summerParticipation'), busyPeriods: getText('busyPeriods'), communityExperience: getText('communityExperience'), communityDetails: getText('communityDetails'), projects: getText('projects'), motivation: getText('motivation'), responsibilityScenario: getText('responsibilityScenario'), motivationFactor: getText('motivationFactor'), additionalNotes: getText('additionalNotes'), consent: form.has('consent'), language, turnstileToken,
        }),
      });

      if (!response.ok) throw new Error('Application request failed');
      formElement.reset();
      setCommunityExperience('no');
      setPrimaryTeam('');
      setSecondaryTeam('');
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
      <div className="space-y-10">
        <FormSection number="01" title={sectionTitles[0]}>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field><FieldLabel htmlFor="application-name" className={labelClass}>{content.name}</FieldLabel><Input id="application-name" name="name" autoComplete="name" required minLength={2} maxLength={100} className={inputClass} /></Field>
            <Field><FieldLabel htmlFor="application-email" className={labelClass}>{content.email}</FieldLabel><Input id="application-email" name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} /></Field>
            <Field><FieldLabel htmlFor="application-phone" className={labelClass}>{content.phone}</FieldLabel><Input id="application-phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} placeholder="05xx xxx xx xx" className={inputClass} /></Field>
            <Field><FieldLabel htmlFor="application-university" className={labelClass}>{content.university}</FieldLabel><NativeSelect id="application-university" name="university" required defaultValue="" className={selectClass}><NativeSelectOption value="" disabled>{content.select}</NativeSelectOption><NativeSelectOption value="sau">Sakarya Üniversitesi</NativeSelectOption><NativeSelectOption value="subu">Sakarya Uygulamalı Bilimler Üniversitesi</NativeSelectOption></NativeSelect></Field>
            <Field><FieldLabel htmlFor="application-academic-department" className={labelClass}>{content.academicDepartment}</FieldLabel><Input id="application-academic-department" name="academicDepartment" required minLength={2} maxLength={120} placeholder={language === 'tr' ? 'Örn. Makine Mühendisliği' : 'e.g. Mechanical Engineering'} className={inputClass} /></Field>
            <Field><FieldLabel htmlFor="application-class" className={labelClass}>{content.classLevel}</FieldLabel><NativeSelect id="application-class" name="classLevel" required defaultValue="" className={selectClass}><NativeSelectOption value="" disabled>{content.select}</NativeSelectOption><NativeSelectOption value="preparation">{language === 'tr' ? 'Hazırlık' : 'Preparation year'}</NativeSelectOption>{['1','2','3','4'].map((year) => <NativeSelectOption key={year} value={year}>{language === 'tr' ? `${year}. sınıf` : `Year ${year}`}</NativeSelectOption>)}<NativeSelectOption value="graduate">{language === 'tr' ? 'Lisansüstü' : 'Graduate'}</NativeSelectOption></NativeSelect></Field>
            <Field><FieldLabel htmlFor="application-linkedin" className={labelClass}>{content.linkedin}</FieldLabel><Input id="application-linkedin" name="linkedin" type="url" inputMode="url" maxLength={300} placeholder="https://linkedin.com/in/..." className={inputClass} /></Field>
            <Field><FieldLabel htmlFor="application-portfolio" className={labelClass}>{content.portfolio}</FieldLabel><Input id="application-portfolio" name="portfolio" type="url" inputMode="url" maxLength={300} placeholder="https://..." className={inputClass} /></Field>
          </div>
        </FormSection>

        <FormSection number="02" title={sectionTitles[1]}>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field><FieldLabel htmlFor="application-primary-team" className={labelClass}>{content.primaryTeam}</FieldLabel><NativeSelect id="application-primary-team" name="primaryTeam" required value={primaryTeam} onChange={(event) => { const nextTeam = event.target.value; setPrimaryTeam(nextTeam); if (secondaryTeam === nextTeam) setSecondaryTeam(''); }} className={selectClass}><NativeSelectOption value="" disabled>{content.select}</NativeSelectOption>{teams[language].map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}</NativeSelect></Field>
            <Field><FieldLabel htmlFor="application-secondary-team" className={labelClass}>{content.secondaryTeam}</FieldLabel><NativeSelect id="application-secondary-team" name="secondaryTeam" value={secondaryTeam} onChange={(event) => setSecondaryTeam(event.target.value)} className={selectClass}><NativeSelectOption value="">{content.none}</NativeSelectOption>{teams[language].map(([value, label]) => <NativeSelectOption key={value} value={value} disabled={value === primaryTeam}>{label}</NativeSelectOption>)}</NativeSelect></Field>
            <Field><FieldLabel htmlFor="application-weekly-hours" className={labelClass}>{content.weeklyHours}</FieldLabel><NativeSelect id="application-weekly-hours" name="weeklyHours" required defaultValue="" className={selectClass}><NativeSelectOption value="" disabled>{content.select}</NativeSelectOption>{[['0-4','0–4'],['5-8','5–8'],['9-12','9–12'],['13-20','13–20'],['20+','20+']].map(([value, label]) => <NativeSelectOption key={value} value={value}>{label} {language === 'tr' ? 'saat' : 'hours'}</NativeSelectOption>)}</NativeSelect></Field>
            <Field><FieldLabel htmlFor="application-summer" className={labelClass}>{content.summer}</FieldLabel><NativeSelect id="application-summer" name="summerParticipation" required defaultValue="" className={selectClass}><NativeSelectOption value="" disabled>{content.select}</NativeSelectOption><NativeSelectOption value="yes">{content.yes}</NativeSelectOption><NativeSelectOption value="no">{content.no}</NativeSelectOption><NativeSelectOption value="depends">{content.depends}</NativeSelectOption></NativeSelect></Field>
          </div>
          <Field><FieldLabel htmlFor="application-busy" className={labelClass}>{content.busy}</FieldLabel><NativeSelect id="application-busy" name="busyPeriods" required defaultValue="" className={selectClass}><NativeSelectOption value="" disabled>{content.select}</NativeSelectOption><NativeSelectOption value="yes">{content.yes}</NativeSelectOption><NativeSelectOption value="no">{content.no}</NativeSelectOption><NativeSelectOption value="depends">{content.depends}</NativeSelectOption></NativeSelect></Field>
        </FormSection>

        <FormSection number="03" title={sectionTitles[2]}>
          <Field><FieldLabel htmlFor="application-programs" className={labelClass}>{content.programs}</FieldLabel><Textarea id="application-programs" name="programs" required minLength={2} maxLength={1500} placeholder={language === 'tr' ? 'Örn. SolidWorks, CATIA, ANSYS, MATLAB, Altium, Adobe Premiere, Excel… Seviyenizi de belirtebilirsiniz.' : 'e.g. SolidWorks, CATIA, ANSYS, MATLAB, Altium, Adobe Premiere, Excel… You may also indicate your level.'} className={textareaClass} /></Field>
          <Field><FieldLabel htmlFor="application-community" className={labelClass}>{content.community}</FieldLabel><NativeSelect id="application-community" name="communityExperience" required value={communityExperience} onChange={(event) => setCommunityExperience(event.target.value)} className={selectClass}><NativeSelectOption value="no">{content.no}</NativeSelectOption><NativeSelectOption value="yes">{content.yes}</NativeSelectOption></NativeSelect></Field>
          {communityExperience === 'yes' ? <Field><FieldLabel htmlFor="application-community-details" className={labelClass}>{content.communityDetails}</FieldLabel><Textarea id="application-community-details" name="communityDetails" required minLength={10} maxLength={2000} className={textareaClass} /></Field> : null}
          <Field><FieldLabel htmlFor="application-projects" className={labelClass}>{content.projects}</FieldLabel><Textarea id="application-projects" name="projects" required minLength={10} maxLength={2500} placeholder={language === 'tr' ? 'Ders, kişisel çalışma, yarışma veya ekip projesi olabilir. Rolünüzü ve ortaya çıkan sonucu belirtin.' : 'This may be a course, personal, competition or team project. Describe your role and the outcome.'} className={textareaClass} /></Field>
        </FormSection>

        <FormSection number="04" title={sectionTitles[3]}>
          <Field><FieldLabel htmlFor="application-motivation" className={labelClass}>{content.motivation}</FieldLabel><Textarea id="application-motivation" name="motivation" required minLength={20} maxLength={2500} className={textareaClass} /></Field>
          <Field><FieldLabel htmlFor="application-responsibility" className={labelClass}>{content.responsibility}</FieldLabel><Textarea id="application-responsibility" name="responsibilityScenario" required minLength={20} maxLength={2500} className={textareaClass} /></Field>
          <Field><FieldLabel htmlFor="application-motivation-factor" className={labelClass}>{content.motivationFactor}</FieldLabel><Textarea id="application-motivation-factor" name="motivationFactor" required minLength={10} maxLength={1500} placeholder={language === 'tr' ? 'Sizi motive eden unsuru ve bunun sizin için neden önemli olduğunu kısaca anlatın.' : 'Briefly describe what motivates you and why it matters to you.'} className={textareaClass} /></Field>
          <Field><FieldLabel htmlFor="application-additional" className={labelClass}>{content.additional}</FieldLabel><Textarea id="application-additional" name="additionalNotes" maxLength={2000} className={textareaClass} /></Field>
        </FormSection>

        <div className="border-t border-white/12 pt-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55"><ShieldCheck className="size-4 text-racing-green" aria-hidden="true" />{content.security}</div>
          {siteKey ? <TurnstileWidget key={widgetVersion} siteKey={siteKey} language={language} action="application" onToken={setTurnstileToken} /> : null}
        </div>

        <Field orientation="horizontal" className="items-start border-t border-white/12 pt-7">
          <Checkbox id="application-consent" name="consent" required className="mt-1 size-5 rounded-none border-white/35 data-checked:border-racing-green data-checked:bg-racing-green data-checked:text-ink" />
          <FieldLabel htmlFor="application-consent" className="max-w-3xl text-sm font-normal leading-7 text-white/65">{content.consent} <Link href={localizedPath('/gizlilik', language)} target="_blank" className="font-semibold text-racing-green underline underline-offset-4">{content.privacy}</Link></FieldLabel>
        </Field>

        <div className="flex flex-col gap-5 border-t border-white/12 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-white/45">{content.note}</p>
          <Button type="submit" disabled={status === 'sending' || !siteKey} className="h-14 shrink-0 rounded-none bg-racing-green px-7 text-xs font-black uppercase tracking-[0.15em] text-ink hover:bg-[#bff9d9]">{status === 'sending' ? content.sending : content.send}{status === 'sending' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}</Button>
        </div>

        <output aria-live="polite" className={status === 'idle' || status === 'sending' ? 'sr-only' : `flex items-start gap-3 border px-4 py-3 text-sm leading-6 ${status === 'success' ? 'border-racing-green/40 bg-racing-green/10 text-[#bff9d9]' : 'border-red-400/35 bg-red-400/10 text-red-100'}`}>{status === 'success' ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />}{status === 'success' ? content.success : status === 'verify' ? content.verify : status === 'error' ? content.error : ''}</output>
      </div>
    </form>
  );
}
