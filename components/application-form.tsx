'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';

import Link from '@/components/site-link';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { localizedPath, type Language } from '@/lib/i18n';
import {
  applicationErrorMessage,
  applicationFieldError,
} from '@/lib/application-feedback';

const teams = {
  tr: [
    ['vehicle-dynamics', 'Araç Dinamiği'],
    ['chassis-structures', 'Şasi ve Yapısal Sistemler'],
    ['powertrain', 'Güç Aktarma Sistemleri'],
    ['aerodynamics', 'Aerodinamik'],
    ['composites-manufacturing', 'Kompozitler ve Üretim'],
    ['electrical-electronics', 'Elektrik ve Elektronik'],
    ['sponsorship-partnerships', 'Sponsorluk ve İş Birlikleri'],
    ['media-communications', 'Medya ve İletişim'],
    ['finance-operations', 'Finans ve Operasyon'],
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
    sections: [
      'Kişisel ve eğitim bilgileri',
      'Departman tercihi ve zaman',
      'Takım deneyimi',
      'Motivasyon ve takım uyumu',
    ],
    name: 'Ad Soyad',
    email: 'E-posta adresi',
    phone: 'Telefon numarası',
    university: 'Üniversite',
    academicDepartment: 'Bölüm / Program',
    classLevel: 'Sınıf',
    linkedin: 'LinkedIn profili (varsa)',
    portfolio: 'Portföy / GitHub / proje bağlantısı (varsa)',
    primaryTeam: 'Katılmak istediğiniz departman',
    secondaryTeam: 'İkinci departman tercihiniz (isteğe bağlı)',
    weeklyHours: 'Takıma haftada ortalama kaç saat ayırabilirsiniz?',
    summer: 'Yaz dönemindeki atölye çalışmalarına katılabilir misiniz?',
    busy: 'Yarış ve üretim gibi yoğun dönemlerde aktif rol alabilir misiniz?',
    community:
      'Daha önce bir öğrenci topluluğunda veya takımda yer aldınız mı?',
    communityDetails:
      'Yer aldığınız topluluğu, departmanınızı ve üstlendiğiniz işleri anlatın.',
    motivation: 'SAUFormula’ya neden katılmak istiyorsunuz?',
    responsibility:
      'Takım içindeki bir sorumluluğu zamanında yerine getiremeyeceğinizi fark ederseniz nasıl bir yol izlersiniz?',
    motivationFactor: 'Takımda sizi en çok motive eden unsur hangisidir?',
    additional:
      'Eklemek istediğiniz bir şey var mı? (Beklenti, hedef veya bizim bilmemizi istediğiniz bir durum)',
    select: 'Seçiniz',
    none: 'İkinci tercihim yok',
    yes: 'Evet',
    no: 'Hayır',
    depends: 'Koşullara göre / Henüz emin değilim',
    consent:
      'Başvuru bilgilerimin başvuru sürecinin yürütülmesi, değerlendirilmesi ve benimle iletişim kurulması amacıyla güvenli biçimde kaydedilip işlenmesini kabul ediyorum.',
    privacy: 'Gizlilik Politikası',
    security: 'Güvenli başvuru',
    note: 'Başvurunuz güvenli biçimde kaydedilir ve yetkili SAUFormula ekibi tarafından başvuru panelinden değerlendirilir.',
    send: 'Başvuruyu gönder',
    sending: 'Gönderiliyor',
    success:
      'Başvurunuz başarıyla gönderildi. Ekibimiz değerlendirme sonrasında sizinle iletişime geçecektir.',
    error:
      'Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edip yeniden deneyin veya info@sauformula.org adresine yazın.',
    verify: 'Göndermeden önce güvenlik doğrulamasını tamamlayın.',
  },
  en: {
    sections: [
      'Personal and education details',
      'Department preference and availability',
      'Team experience',
      'Motivation and team fit',
    ],
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    university: 'University',
    academicDepartment: 'Degree programme / Department',
    classLevel: 'Year of study',
    linkedin: 'LinkedIn profile (if available)',
    portfolio: 'Portfolio / GitHub / project link (if available)',
    primaryTeam: 'Department you would like to join',
    secondaryTeam: 'Second department preference (optional)',
    weeklyHours:
      'How many hours can you dedicate to the team each week on average?',
    summer: 'Can you attend workshop activities during the summer?',
    busy: 'Can you take an active role during intensive periods such as manufacturing and competitions?',
    community: 'Have you previously taken part in a student club or team?',
    communityDetails:
      'Describe the community, your department and the work you were responsible for.',
    motivation: 'Why would you like to join SAUFormula?',
    responsibility:
      'What would you do if you realised you could not complete a team responsibility on time?',
    motivationFactor: 'What would motivate you most as part of the team?',
    additional:
      'Is there anything else you would like to add? (Expectations, goals or something you would like us to know)',
    select: 'Select',
    none: 'No second preference',
    yes: 'Yes',
    no: 'No',
    depends: 'It depends / I am not sure yet',
    consent:
      'I consent to my application data being securely stored and processed to manage and evaluate my application and contact me.',
    privacy: 'Privacy Policy',
    security: 'Secure application',
    note: 'Your application is securely saved and reviewed by authorised SAUFormula team members in the application panel.',
    send: 'Submit application',
    sending: 'Submitting',
    success:
      'Your application was submitted successfully. Our team will contact you after reviewing it.',
    error:
      'We could not submit your application. Please review your details and try again, or email info@sauformula.org.',
    verify: 'Please complete the security verification before submitting.',
  },
} satisfies Record<Language, Record<string, string | string[]>>;

const inputClass =
  'h-14 rounded-none border-white/15 bg-ink/35 px-4 text-base text-white placeholder:text-white/25';
const textareaClass =
  'min-h-36 resize-y rounded-none border-white/15 bg-ink/35 px-4 py-4 text-base leading-7 text-white placeholder:text-white/25';
const selectClass =
  'w-full [&_[data-slot=native-select]]:h-14 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-white/15 [&_[data-slot=native-select]]:bg-ink/35 [&_[data-slot=native-select]]:px-4 [&_[data-slot=native-select]]:pr-10 [&_[data-slot=native-select]]:text-base [&_[data-slot=native-select]]:text-white';
const labelClass = 'text-sm font-bold leading-6 text-white/85';

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/12 pt-8 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center border border-racing-green/50 font-heading text-sm font-black text-racing-green">
          {number}
        </span>
        <h2 className="font-heading text-xl font-bold uppercase tracking-[0.03em] text-white sm:text-2xl">
          {title}
        </h2>
      </div>
      <FieldGroup className="gap-6">{children}</FieldGroup>
    </section>
  );
}

const applicationFieldIds: Record<string, string> = {
  name: 'application-name',
  email: 'application-email',
  phone: 'application-phone',
  university: 'application-university',
  academicDepartment: 'application-academic-department',
  classLevel: 'application-class',
  linkedin: 'application-linkedin',
  portfolio: 'application-portfolio',
  primaryTeam: 'application-primary-team',
  secondaryTeam: 'application-secondary-team',
  weeklyHours: 'application-weekly-hours',
  summerParticipation: 'application-summer',
  busyPeriods: 'application-busy',
  communityExperience: 'application-community',
  communityDetails: 'application-community-details',
  motivation: 'application-motivation',
  responsibilityScenario: 'application-responsibility',
  motivationFactor: 'application-motivation-factor',
  additionalNotes: 'application-additional',
  consent: 'application-consent',
};

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-racing-green">
      *
    </span>
  );
}

function ApplicationField({
  name,
  error,
  children,
}: {
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      {children}
      {error ? (
        <p
          id={`application-error-${name}`}
          className="text-sm leading-6 text-red-200"
        >
          {error}
        </p>
      ) : null}
    </Field>
  );
}

export function ApplicationForm({ language = 'tr' }: { language?: Language }) {
  const content = copy[language];
  const sectionTitles = content.sections as string[];
  const fieldLabels: Record<string, string> = {
    name: content.name as string,
    email: content.email as string,
    phone: content.phone as string,
    university: content.university as string,
    academicDepartment: content.academicDepartment as string,
    classLevel: content.classLevel as string,
    linkedin: content.linkedin as string,
    portfolio: content.portfolio as string,
    primaryTeam: content.primaryTeam as string,
    secondaryTeam: content.secondaryTeam as string,
    weeklyHours: content.weeklyHours as string,
    summerParticipation: content.summer as string,
    busyPeriods: content.busy as string,
    communityExperience: content.community as string,
    communityDetails: content.communityDetails as string,
    motivation: content.motivation as string,
    responsibilityScenario:
      language === 'tr' ? 'Sorumluluk senaryosu' : 'Responsibility scenario',
    motivationFactor:
      language === 'tr' ? 'Motivasyon kaynağı' : 'Motivation factor',
    additionalNotes: content.additional as string,
    consent:
      language === 'tr' ? 'Veri işleme onayı' : 'Data processing consent',
  };
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [errorCode, setErrorCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [configurationVersion, setConfigurationVersion] = useState(0);
  const [siteKey, setSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [communityExperience, setCommunityExperience] = useState('no');
  const [primaryTeam, setPrimaryTeam] = useState('');
  const [secondaryTeam, setSecondaryTeam] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/application', { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok)
          throw new Error('Application configuration could not be loaded.');
        return response.json() as Promise<{ siteKey?: unknown }>;
      })
      .then((data: { siteKey?: unknown }) => {
        if (typeof data.siteKey !== 'string' || !data.siteKey)
          throw new Error('Missing site key');
        setSiteKey(data.siteKey);
        setStatus('idle');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setErrorCode('service_unavailable');
        setStatus('error');
      });
    return () => controller.abort();
  }, [configurationVersion]);

  useEffect(() => {
    if (status === 'error') feedbackRef.current?.focus();
  }, [status, errorCode, fieldErrors]);

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    const formElement = event.currentTarget;

    if (status === 'sending') return;
    const errors: Record<string, string> = {};
    for (const element of Array.from(formElement.elements)) {
      if (
        !(
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        ) ||
        !element.name ||
        element.disabled
      )
        continue;
      const error = applicationFieldError(
        {
          value: element.value,
          required: element.required,
          type: element.type,
          minLength: 'minLength' in element ? element.minLength : undefined,
          maxLength: 'maxLength' in element ? element.maxLength : undefined,
          checked: 'checked' in element ? element.checked : undefined,
        },
        language,
      );
      if (error) errors[element.name] = error;
    }
    if (!new FormData(formElement).has('consent'))
      errors.consent =
        language === 'tr'
          ? 'Başvuruyu göndermek için veri işleme bilgilendirmesini kabul edin.'
          : 'Accept the data processing notice to submit your application.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setErrorCode('validation_failed');
      setStatus('error');
      return;
    }
    if (!siteKey || !turnstileToken) {
      setErrorCode(!siteKey ? 'service_unavailable' : 'verification_required');
      setStatus('error');
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
          name: getText('name'),
          email: getText('email'),
          phone: getText('phone'),
          university: getText('university'),
          academicDepartment: getText('academicDepartment'),
          classLevel: getText('classLevel'),
          linkedin: getText('linkedin'),
          portfolio: getText('portfolio'),
          primaryTeam: getText('primaryTeam'),
          secondaryTeam: getText('secondaryTeam'),
          weeklyHours: getText('weeklyHours'),
          summerParticipation: getText('summerParticipation'),
          busyPeriods: getText('busyPeriods'),
          communityExperience: getText('communityExperience'),
          communityDetails: getText('communityDetails'),
          motivation: getText('motivation'),
          responsibilityScenario: getText('responsibilityScenario'),
          motivationFactor: getText('motivationFactor'),
          additionalNotes: getText('additionalNotes'),
          consent: form.has('consent'),
          language,
          turnstileToken,
        }),
      });

      let result: {
        ok?: boolean;
        stored?: boolean;
        code?: string;
        fields?: unknown;
      };
      try {
        const parsed: unknown = await response.json();
        result =
          parsed && typeof parsed === 'object' ? (parsed as typeof result) : {};
      } catch {
        result = {};
      }
      if (!response.ok || result.ok !== true || result.stored !== true) {
        setErrorCode(
          typeof result.code === 'string'
            ? result.code
            : response.status === 413
              ? 'payload_too_large'
              : 'request_failed',
        );
        const errors: Record<string, string> = {};
        if (Array.isArray(result.fields)) {
          for (const field of result.fields) {
            if (
              typeof field === 'string' &&
              formElement.elements.namedItem(field)
            )
              errors[field] =
                language === 'tr'
                  ? 'Bu alanın değerini ve uzunluğunu kontrol edin.'
                  : 'Check the value and length of this field.';
          }
        }
        setFieldErrors(errors);
        setTurnstileToken('');
        setWidgetVersion((version) => version + 1);
        setStatus('error');
        return;
      }
      formElement.reset();
      setCommunityExperience('no');
      setPrimaryTeam('');
      setSecondaryTeam('');
      setTurnstileToken('');
      setWidgetVersion((version) => version + 1);
      setFieldErrors({});
      setErrorCode('');
      setStatus('success');
    } catch {
      setErrorCode('network_error');
      setTurnstileToken('');
      setWidgetVersion((version) => version + 1);
      setStatus('error');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-white/15 bg-[#071b14] p-6 sm:p-8 lg:p-10"
      aria-busy={status === 'sending'}
    >
      <p className="mb-6 text-sm leading-6 text-white/75">
        <RequiredMark />{' '}
        {language === 'tr'
          ? 'işaretli alanlar zorunludur.'
          : 'marks required fields.'}
      </p>
      {status === 'error' ? (
        <div
          ref={feedbackRef}
          role="alert"
          tabIndex={-1}
          className="mb-8 scroll-mt-6 border border-red-400/50 bg-red-400/10 p-5 text-base leading-7 text-red-100 outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <p className="flex items-start gap-3">
            <AlertCircle className="mt-1 size-5 shrink-0" aria-hidden="true" />
            {applicationErrorMessage(errorCode, language)}
          </p>
          {Object.keys(fieldErrors).length ? (
            <ul className="mt-3 space-y-2 pl-8">
              {Object.entries(fieldErrors).map(([name, message]) => (
                <li key={name}>
                  <a
                    href={`#${applicationFieldIds[name]}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document
                        .getElementById(applicationFieldIds[name])
                        ?.focus();
                    }}
                    className="underline underline-offset-4"
                  >
                    {fieldLabels[name] ?? name}: {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {!siteKey ? (
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setConfigurationVersion((value) => value + 1);
              }}
              className="mt-4 border border-red-200/50 px-4 py-2 font-semibold"
            >
              {language === 'tr' ? 'Yeniden bağlan' : 'Reconnect'}
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-10">
        <FormSection number="01" title={sectionTitles[0]}>
          <div className="grid gap-6 sm:grid-cols-2">
            <ApplicationField name="name" error={fieldErrors.name}>
              <FieldLabel htmlFor="application-name" className={labelClass}>
                {content.name} <RequiredMark />
              </FieldLabel>
              <Input
                id="application-name"
                name="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={
                  fieldErrors.name ? 'application-error-name' : undefined
                }
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                className={inputClass}
              />
            </ApplicationField>
            <ApplicationField name="email" error={fieldErrors.email}>
              <FieldLabel htmlFor="application-email" className={labelClass}>
                {content.email} <RequiredMark />
              </FieldLabel>
              <Input
                id="application-email"
                name="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? 'application-error-email' : undefined
                }
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                className={inputClass}
              />
            </ApplicationField>
            <ApplicationField name="phone" error={fieldErrors.phone}>
              <FieldLabel htmlFor="application-phone" className={labelClass}>
                {content.phone} <RequiredMark />
              </FieldLabel>
              <Input
                id="application-phone"
                name="phone"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={
                  fieldErrors.phone ? 'application-error-phone' : undefined
                }
                type="tel"
                autoComplete="tel"
                required
                minLength={7}
                maxLength={30}
                placeholder="05xx xxx xx xx"
                className={inputClass}
              />
            </ApplicationField>
            <ApplicationField name="university" error={fieldErrors.university}>
              <FieldLabel
                htmlFor="application-university"
                className={labelClass}
              >
                {content.university} <RequiredMark />
              </FieldLabel>
              <NativeSelect
                id="application-university"
                name="university"
                aria-invalid={Boolean(fieldErrors.university)}
                aria-describedby={
                  fieldErrors.university
                    ? 'application-error-university'
                    : undefined
                }
                required
                defaultValue=""
                className={selectClass}
              >
                <NativeSelectOption value="" disabled>
                  {content.select}
                </NativeSelectOption>
                <NativeSelectOption value="sau">
                  Sakarya Üniversitesi
                </NativeSelectOption>
                <NativeSelectOption value="subu">
                  Sakarya Uygulamalı Bilimler Üniversitesi
                </NativeSelectOption>
              </NativeSelect>
            </ApplicationField>
            <ApplicationField
              name="academicDepartment"
              error={fieldErrors.academicDepartment}
            >
              <FieldLabel
                htmlFor="application-academic-department"
                className={labelClass}
              >
                {content.academicDepartment} <RequiredMark />
              </FieldLabel>
              <Input
                id="application-academic-department"
                name="academicDepartment"
                aria-invalid={Boolean(fieldErrors.academicDepartment)}
                aria-describedby={
                  fieldErrors.academicDepartment
                    ? 'application-error-academicDepartment'
                    : undefined
                }
                required
                minLength={2}
                maxLength={120}
                placeholder={
                  language === 'tr'
                    ? 'Örn. Makine Mühendisliği'
                    : 'e.g. Mechanical Engineering'
                }
                className={inputClass}
              />
            </ApplicationField>
            <ApplicationField name="classLevel" error={fieldErrors.classLevel}>
              <FieldLabel htmlFor="application-class" className={labelClass}>
                {content.classLevel} <RequiredMark />
              </FieldLabel>
              <NativeSelect
                id="application-class"
                name="classLevel"
                aria-invalid={Boolean(fieldErrors.classLevel)}
                aria-describedby={
                  fieldErrors.classLevel
                    ? 'application-error-classLevel'
                    : undefined
                }
                required
                defaultValue=""
                className={selectClass}
              >
                <NativeSelectOption value="" disabled>
                  {content.select}
                </NativeSelectOption>
                <NativeSelectOption value="preparation">
                  {language === 'tr' ? 'Hazırlık' : 'Preparation year'}
                </NativeSelectOption>
                {['1', '2', '3', '4'].map((year) => (
                  <NativeSelectOption key={year} value={year}>
                    {language === 'tr' ? `${year}. sınıf` : `Year ${year}`}
                  </NativeSelectOption>
                ))}
                <NativeSelectOption value="graduate">
                  {language === 'tr' ? 'Lisansüstü' : 'Graduate'}
                </NativeSelectOption>
              </NativeSelect>
            </ApplicationField>
            <ApplicationField name="linkedin" error={fieldErrors.linkedin}>
              <FieldLabel htmlFor="application-linkedin" className={labelClass}>
                {content.linkedin}
              </FieldLabel>
              <Input
                id="application-linkedin"
                name="linkedin"
                aria-invalid={Boolean(fieldErrors.linkedin)}
                aria-describedby={
                  fieldErrors.linkedin
                    ? 'application-error-linkedin'
                    : undefined
                }
                type="url"
                inputMode="url"
                maxLength={300}
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </ApplicationField>
            <ApplicationField name="portfolio" error={fieldErrors.portfolio}>
              <FieldLabel
                htmlFor="application-portfolio"
                className={labelClass}
              >
                {content.portfolio}
              </FieldLabel>
              <Input
                id="application-portfolio"
                name="portfolio"
                aria-invalid={Boolean(fieldErrors.portfolio)}
                aria-describedby={
                  fieldErrors.portfolio
                    ? 'application-error-portfolio'
                    : undefined
                }
                type="url"
                inputMode="url"
                maxLength={300}
                placeholder="https://..."
                className={inputClass}
              />
            </ApplicationField>
          </div>
        </FormSection>

        <FormSection number="02" title={sectionTitles[1]}>
          <div className="grid gap-6 sm:grid-cols-2">
            <ApplicationField
              name="primaryTeam"
              error={fieldErrors.primaryTeam}
            >
              <FieldLabel
                htmlFor="application-primary-team"
                className={labelClass}
              >
                {content.primaryTeam} <RequiredMark />
              </FieldLabel>
              <NativeSelect
                id="application-primary-team"
                name="primaryTeam"
                aria-invalid={Boolean(fieldErrors.primaryTeam)}
                aria-describedby={
                  fieldErrors.primaryTeam
                    ? 'application-error-primaryTeam'
                    : undefined
                }
                required
                value={primaryTeam}
                onChange={(event) => {
                  const nextTeam = event.target.value;
                  setPrimaryTeam(nextTeam);
                  if (secondaryTeam === nextTeam) setSecondaryTeam('');
                }}
                className={selectClass}
              >
                <NativeSelectOption value="" disabled>
                  {content.select}
                </NativeSelectOption>
                {teams[language].map(([value, label]) => (
                  <NativeSelectOption key={value} value={value}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </ApplicationField>
            <ApplicationField
              name="secondaryTeam"
              error={fieldErrors.secondaryTeam}
            >
              <FieldLabel
                htmlFor="application-secondary-team"
                className={labelClass}
              >
                {content.secondaryTeam}
              </FieldLabel>
              <NativeSelect
                id="application-secondary-team"
                name="secondaryTeam"
                aria-invalid={Boolean(fieldErrors.secondaryTeam)}
                aria-describedby={
                  fieldErrors.secondaryTeam
                    ? 'application-error-secondaryTeam'
                    : undefined
                }
                value={secondaryTeam}
                onChange={(event) => setSecondaryTeam(event.target.value)}
                className={selectClass}
              >
                <NativeSelectOption value="">{content.none}</NativeSelectOption>
                {teams[language].map(([value, label]) => (
                  <NativeSelectOption
                    key={value}
                    value={value}
                    disabled={value === primaryTeam}
                  >
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </ApplicationField>
            <ApplicationField
              name="weeklyHours"
              error={fieldErrors.weeklyHours}
            >
              <FieldLabel
                htmlFor="application-weekly-hours"
                className={labelClass}
              >
                {content.weeklyHours} <RequiredMark />
              </FieldLabel>
              <NativeSelect
                id="application-weekly-hours"
                name="weeklyHours"
                aria-invalid={Boolean(fieldErrors.weeklyHours)}
                aria-describedby={
                  fieldErrors.weeklyHours
                    ? 'application-error-weeklyHours'
                    : undefined
                }
                required
                defaultValue=""
                className={selectClass}
              >
                <NativeSelectOption value="" disabled>
                  {content.select}
                </NativeSelectOption>
                {[
                  ['0-4', '0–4'],
                  ['5-8', '5–8'],
                  ['9-12', '9–12'],
                  ['13-20', '13–20'],
                  ['20+', '20+'],
                ].map(([value, label]) => (
                  <NativeSelectOption key={value} value={value}>
                    {label} {language === 'tr' ? 'saat' : 'hours'}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </ApplicationField>
            <ApplicationField
              name="summerParticipation"
              error={fieldErrors.summerParticipation}
            >
              <FieldLabel htmlFor="application-summer" className={labelClass}>
                {content.summer} <RequiredMark />
              </FieldLabel>
              <NativeSelect
                id="application-summer"
                name="summerParticipation"
                aria-invalid={Boolean(fieldErrors.summerParticipation)}
                aria-describedby={
                  fieldErrors.summerParticipation
                    ? 'application-error-summerParticipation'
                    : undefined
                }
                required
                defaultValue=""
                className={selectClass}
              >
                <NativeSelectOption value="" disabled>
                  {content.select}
                </NativeSelectOption>
                <NativeSelectOption value="yes">
                  {content.yes}
                </NativeSelectOption>
                <NativeSelectOption value="no">{content.no}</NativeSelectOption>
                <NativeSelectOption value="depends">
                  {content.depends}
                </NativeSelectOption>
              </NativeSelect>
            </ApplicationField>
          </div>
          <ApplicationField name="busyPeriods" error={fieldErrors.busyPeriods}>
            <FieldLabel htmlFor="application-busy" className={labelClass}>
              {content.busy} <RequiredMark />
            </FieldLabel>
            <NativeSelect
              id="application-busy"
              name="busyPeriods"
              aria-invalid={Boolean(fieldErrors.busyPeriods)}
              aria-describedby={
                fieldErrors.busyPeriods
                  ? 'application-error-busyPeriods'
                  : undefined
              }
              required
              defaultValue=""
              className={selectClass}
            >
              <NativeSelectOption value="" disabled>
                {content.select}
              </NativeSelectOption>
              <NativeSelectOption value="yes">{content.yes}</NativeSelectOption>
              <NativeSelectOption value="no">{content.no}</NativeSelectOption>
              <NativeSelectOption value="depends">
                {content.depends}
              </NativeSelectOption>
            </NativeSelect>
          </ApplicationField>
        </FormSection>

        <FormSection number="03" title={sectionTitles[2]}>
          <ApplicationField
            name="communityExperience"
            error={fieldErrors.communityExperience}
          >
            <FieldLabel htmlFor="application-community" className={labelClass}>
              {content.community} <RequiredMark />
            </FieldLabel>
            <NativeSelect
              id="application-community"
              name="communityExperience"
              aria-invalid={Boolean(fieldErrors.communityExperience)}
              aria-describedby={
                fieldErrors.communityExperience
                  ? 'application-error-communityExperience'
                  : undefined
              }
              required
              value={communityExperience}
              onChange={(event) => setCommunityExperience(event.target.value)}
              className={selectClass}
            >
              <NativeSelectOption value="no">{content.no}</NativeSelectOption>
              <NativeSelectOption value="yes">{content.yes}</NativeSelectOption>
            </NativeSelect>
          </ApplicationField>
          {communityExperience === 'yes' ? (
            <ApplicationField
              name="communityDetails"
              error={fieldErrors.communityDetails}
            >
              <FieldLabel
                htmlFor="application-community-details"
                className={labelClass}
              >
                {content.communityDetails} <RequiredMark />
              </FieldLabel>
              <Textarea
                id="application-community-details"
                name="communityDetails"
                aria-invalid={Boolean(fieldErrors.communityDetails)}
                aria-describedby={
                  fieldErrors.communityDetails
                    ? 'application-error-communityDetails'
                    : undefined
                }
                required
                minLength={10}
                maxLength={2000}
                className={textareaClass}
              />
            </ApplicationField>
          ) : null}
        </FormSection>

        <FormSection number="04" title={sectionTitles[3]}>
          <ApplicationField name="motivation" error={fieldErrors.motivation}>
            <FieldLabel htmlFor="application-motivation" className={labelClass}>
              {content.motivation} <RequiredMark />
            </FieldLabel>
            <Textarea
              id="application-motivation"
              name="motivation"
              aria-invalid={Boolean(fieldErrors.motivation)}
              aria-describedby={
                fieldErrors.motivation
                  ? 'application-error-motivation'
                  : undefined
              }
              required
              minLength={20}
              maxLength={2500}
              className={textareaClass}
            />
          </ApplicationField>
          <ApplicationField
            name="responsibilityScenario"
            error={fieldErrors.responsibilityScenario}
          >
            <FieldLabel
              htmlFor="application-responsibility"
              className={labelClass}
            >
              {content.responsibility} <RequiredMark />
            </FieldLabel>
            <Textarea
              id="application-responsibility"
              name="responsibilityScenario"
              aria-invalid={Boolean(fieldErrors.responsibilityScenario)}
              aria-describedby={
                fieldErrors.responsibilityScenario
                  ? 'application-error-responsibilityScenario'
                  : undefined
              }
              required
              minLength={20}
              maxLength={2500}
              className={textareaClass}
            />
          </ApplicationField>
          <ApplicationField
            name="motivationFactor"
            error={fieldErrors.motivationFactor}
          >
            <FieldLabel
              htmlFor="application-motivation-factor"
              className={labelClass}
            >
              {content.motivationFactor} <RequiredMark />
            </FieldLabel>
            <Textarea
              id="application-motivation-factor"
              name="motivationFactor"
              aria-invalid={Boolean(fieldErrors.motivationFactor)}
              aria-describedby={
                fieldErrors.motivationFactor
                  ? 'application-error-motivationFactor'
                  : undefined
              }
              required
              minLength={10}
              maxLength={1500}
              placeholder={
                language === 'tr'
                  ? 'Sizi motive eden unsuru ve bunun sizin için neden önemli olduğunu kısaca anlatın.'
                  : 'Briefly describe what motivates you and why it matters to you.'
              }
              className={textareaClass}
            />
          </ApplicationField>
          <ApplicationField
            name="additionalNotes"
            error={fieldErrors.additionalNotes}
          >
            <FieldLabel htmlFor="application-additional" className={labelClass}>
              {content.additional}
            </FieldLabel>
            <Textarea
              id="application-additional"
              name="additionalNotes"
              aria-invalid={Boolean(fieldErrors.additionalNotes)}
              aria-describedby={
                fieldErrors.additionalNotes
                  ? 'application-error-additionalNotes'
                  : undefined
              }
              maxLength={2000}
              className={textareaClass}
            />
          </ApplicationField>
        </FormSection>

        <div className="border-t border-white/12 pt-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55">
            <ShieldCheck
              className="size-4 text-racing-green"
              aria-hidden="true"
            />
            {content.security}
          </div>
          {siteKey ? (
            <TurnstileWidget
              key={widgetVersion}
              siteKey={siteKey}
              language={language}
              action="application"
              onToken={setTurnstileToken}
            />
          ) : null}
        </div>

        <Field
          orientation="horizontal"
          className="items-start border-t border-white/12 pt-7"
        >
          <Checkbox
            id="application-consent"
            name="consent"
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={
              fieldErrors.consent ? 'application-error-consent' : undefined
            }
            required
            className="mt-1 size-5 rounded-none border-white/35 data-checked:border-racing-green data-checked:bg-racing-green data-checked:text-ink"
          />
          <FieldLabel
            htmlFor="application-consent"
            className="max-w-3xl text-sm font-normal leading-7 text-white/65"
          >
            <RequiredMark /> {content.consent}{' '}
            <Link
              href={localizedPath('/gizlilik', language)}
              target="_blank"
              className="font-semibold text-racing-green underline underline-offset-4"
            >
              {content.privacy}
            </Link>
          </FieldLabel>
        </Field>

        {fieldErrors.consent ? (
          <p id="application-error-consent" className="text-sm text-red-200">
            {fieldErrors.consent}
          </p>
        ) : null}

        <div className="flex flex-col gap-5 border-t border-white/12 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-white/45">
            {content.note}
          </p>
          <Button
            type="submit"
            disabled={status === 'sending'}
            className="h-14 shrink-0 rounded-none bg-racing-green px-7 text-xs font-black uppercase tracking-[0.15em] text-ink hover:bg-[#bff9d9]"
          >
            {status === 'sending' ? content.sending : content.send}
            {status === 'sending' ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ArrowUpRight className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {status === 'success' ? (
          <output
            aria-live="polite"
            className="flex items-start gap-3 border border-racing-green/40 bg-racing-green/10 px-4 py-3 text-base leading-7 text-[#bff9d9]"
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
            {content.success}
          </output>
        ) : null}
      </div>
    </form>
  );
}
