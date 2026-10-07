import { defineRouting } from 'next-intl/routing';

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'ar',
  localePrefix: 'always',
  localeCookie: { name: 'ZW_LOCALE', maxAge: 60 * 60 * 24 * 365 },
});

export const localeDir = (locale: string): 'rtl' | 'ltr' => (locale === 'ar' ? 'rtl' : 'ltr');

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
