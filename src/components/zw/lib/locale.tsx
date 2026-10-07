'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cx } from './cx';

export type Lang = 'ar' | 'en';

/** Current UI language. Honors nested NextIntlClientProvider scopes (see IntlScope). */
export function useLang(): Lang {
  return useLocale() === 'ar' ? 'ar' : 'en';
}

/** Built-in component strings live in messages/{ar,en}.json under the `zw` namespace. */
export function useZwT() {
  return useTranslations('zw');
}

export interface LocaleProviderProps {
  lang: Lang;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Sets `dir`/`lang` (and Arabic type metrics) for a subtree. Built-in strings follow the
 * surrounding next-intl locale — wrap with `IntlScope` to switch both at once.
 */
export function LocaleProvider({ lang, children, className, style }: LocaleProviderProps) {
  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      lang={lang}
      className={cx('zw-locale', lang === 'ar' && 'zw-ar', className)}
      style={style}
    >
      {children}
    </div>
  );
}
