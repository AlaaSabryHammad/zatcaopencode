import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { loadMessages } from '@/i18n/request';
import type { Locale } from '@/i18n/routing';
import { Gallery } from './gallery';

export const metadata: Metadata = { title: 'Components', robots: { index: false, follow: false } };

/** Dev-only gallery mirroring design/design-system/previews (light/dark × ar/en). */
export default async function ComponentsPage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_GALLERY !== 'true') notFound();
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const [ar, en] = await Promise.all([loadMessages('ar'), loadMessages('en')]);
  return <Gallery messages={{ ar, en }} />;
}
