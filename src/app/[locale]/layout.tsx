import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, localeDir } from '@/i18n/routing';
import { Providers } from '@/components/providers';
import { fontVariables } from '../fonts';
import '../tokens.css';
import '@/components/zw/styles/zw-components.css';
import '@/components/zw/styles/zw-overrides.css';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : 'ar',
    namespace: 'meta',
  });
  return {
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('description'),
    icons: { icon: '/favicon.svg' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0a110f' },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeDir(locale);

  return (
    <html lang={locale} dir={dir} className={fontVariables} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Riyadh">
          <Providers dir={dir}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
