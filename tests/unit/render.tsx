import * as React from 'react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import { LocaleProvider } from '@/components/zw';

export function renderWithIntl(ui: React.ReactElement, locale: 'ar' | 'en' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'ar' ? ar : en} timeZone="Asia/Riyadh">
      <LocaleProvider lang={locale}>{ui}</LocaleProvider>
    </NextIntlClientProvider>,
  );
}
