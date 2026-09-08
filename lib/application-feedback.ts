import type { Language } from './i18n';

const messages = {
  tr: {
    validation_failed:
      'Lütfen işaretlenen alanları kontrol edin. Bilgileriniz formda korunuyor.',
    verification_required:
      'Güvenlik doğrulaması henüz tamamlanmadı veya süresi doldu. Doğrulama tamamlandıktan sonra yeniden gönderin.',
    verification_failed:
      'Güvenlik doğrulaması geçersiz veya süresi dolmuş. Yeni doğrulama tamamlandıktan sonra yeniden gönderin.',
    verification_unavailable:
      'Güvenlik doğrulama hizmetine ulaşılamadı. Biraz sonra yeniden deneyin.',
    service_unavailable:
      'Başvuru hizmeti şu anda kullanılamıyor. Biraz sonra yeniden deneyin veya info@sauformula.org adresine yazın.',
    storage_failed:
      'Başvurunuz kaydedilemedi. Bilgileriniz formda korunuyor; biraz sonra yeniden deneyin.',
    invalid_origin:
      'Bu sayfadan başvuru gönderimine izin verilmiyor. sauformula.org üzerindeki başvuru formunu kullanın.',
    payload_too_large:
      'Başvuru metni izin verilen boyutu aşıyor. Uzun yanıtlarınızı kısaltıp yeniden deneyin.',
    invalid_request: 'Başvuru bilgileri okunamadı. Lütfen yeniden gönderin.',
    network_error:
      'Sunucudan yanıt alınamadı. İnternet bağlantınızı kontrol edin. Kayıt sonucunu doğrulayamıyoruz; tekrar denemeden önce bağlantının düzelmesini bekleyin.',
    request_failed:
      'Başvuru sunucusu beklenmeyen bir yanıt verdi. Biraz sonra yeniden deneyin veya info@sauformula.org adresine yazın.',
  },
  en: {
    validation_failed:
      'Please check the highlighted fields. Your answers have been kept in the form.',
    verification_required:
      'The security check is incomplete or has expired. Submit again once the check is complete.',
    verification_failed:
      'The security check is invalid or has expired. Complete a new check and submit again.',
    verification_unavailable:
      'The security verification service could not be reached. Please try again shortly.',
    service_unavailable:
      'The application service is currently unavailable. Please try again shortly or email info@sauformula.org.',
    storage_failed:
      'Your application could not be saved. Your answers have been kept in the form; please try again shortly.',
    invalid_origin:
      'Applications cannot be submitted from this page. Please use the application form on sauformula.org.',
    payload_too_large:
      'Your application exceeds the size limit. Shorten your longer answers and try again.',
    invalid_request:
      'Your application data could not be read. Please submit it again.',
    network_error:
      'No response was received from the server. Check your internet connection. We cannot confirm whether your application was saved; wait for your connection to recover before trying again.',
    request_failed:
      'The application server returned an unexpected response. Please try again shortly or email info@sauformula.org.',
  },
};

export function applicationErrorMessage(code: string, language: Language) {
  const copy = messages[language];
  return Object.hasOwn(copy, code)
    ? copy[code as keyof typeof copy]
    : copy.request_failed;
}

export function applicationFieldError(
  field: {
    value: string;
    required: boolean;
    type: string;
    minLength?: number;
    maxLength?: number;
    checked?: boolean;
  },
  language: Language,
) {
  const value = field.value.trim();
  const english = language === 'en';
  if (field.required && (field.type === 'checkbox' ? !field.checked : !value)) {
    return english ? 'This field is required.' : 'Bu alan zorunludur.';
  }
  if (!value) return '';
  if (
    field.minLength &&
    field.minLength > 0 &&
    value.length < field.minLength
  ) {
    return english
      ? `Enter at least ${field.minLength} characters.`
      : `En az ${field.minLength} karakter yazın.`;
  }
  if (
    field.maxLength &&
    field.maxLength > 0 &&
    value.length > field.maxLength
  ) {
    return english
      ? `Use no more than ${field.maxLength} characters.`
      : `En fazla ${field.maxLength} karakter yazın.`;
  }
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return english
      ? 'Enter a valid email address.'
      : 'Geçerli bir e-posta adresi yazın.';
  }
  if (field.type === 'url') {
    try {
      if (!['http:', 'https:'].includes(new URL(value).protocol))
        throw new Error('protocol');
    } catch {
      return english
        ? 'Enter a link starting with https:// or http://.'
        : 'https:// veya http:// ile başlayan geçerli bir bağlantı yazın.';
    }
  }
  return '';
}
