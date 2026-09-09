// C6 — điểm vào duy nhất của khung đa ngữ. Trang chỉ cần:
//   import { useT } from '../i18n';
//   const { t } = useT();
//   t('upload.addToQueueBtn')
//
// `TranslationKey` suy ra từ `vi.ts` bằng kiểu đường-dẫn-khoá đệ quy — gõ
// sai khoá (vd. `t('uplaod.addToQueueBtn')`) là lỗi biên dịch, không phải
// lỗi runtime im lặng.
import { vi } from './vi';
import { en } from './en';
import { fr } from './fr';

export type Locale = 'vi' | 'en' | 'fr';

const DICTS: Record<Locale, unknown> = { vi, en, fr };

/** Mọi khoá dạng "a.b.c" trỏ tới một giá trị chuỗi trong `vi.ts`. */
type Paths<T> = T extends string
  ? never
  : { [K in Extract<keyof T, string>]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[Extract<keyof T, string>];

export type TranslationKey = Paths<typeof vi>;

// Chỗ cắm sẵn cho việc đổi ngôn ngữ sau này (chưa có UI switcher — ngoài
// phạm vi C6, xem ghi chú "kiến trúc sẵn sàng, chưa dịch xong" ở en.ts/fr.ts).
// Module-level thay vì React context để `t()` dùng được cả ngoài component
// (vd. trong data/service) mà không cần bọc <Provider>.
let currentLocale: Locale = 'vi';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

function lookup(dict: unknown, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

/**
 * Dịch `key` theo ngôn ngữ hiện tại; tự fallback về `vi` khi ngôn ngữ đích
 * chưa có chuỗi đó (đây là cách `en`/`fr` — rỗng có cấu trúc, TODO dịch —
 * không làm UI hiện chuỗi trống). `vars` thay thế token dạng `{ten}`.
 */
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  const hit = lookup(DICTS[currentLocale], key);
  const raw = hit && hit.length > 0 ? hit : (lookup(vi, key) ?? key);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
}

/** Dạng hook — chỗ cắm sẵn để sau này đọc locale từ context/store thay vì biến module. */
export function useT(): { t: typeof t; locale: Locale } {
  return { t, locale: currentLocale };
}

/** Danh sách ngôn ngữ cho hộp thoại Cài đặt. Chỉ `vi` có bản dịch đầy đủ ở giai đoạn 1. */
export const LOCALES: ReadonlyArray<{ code: Locale; label: string }> = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];
