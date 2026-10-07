import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Logo, Button, Badge } from '@/components/zw';
import { LocaleThemeControls } from '@/components/app/locale-theme-controls';

/** Placeholder home until the public site lands in Phase 13. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('home');
  const c = await getTranslations('common');
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-topbar items-center justify-between border-b border-border-subtle bg-surface px-4 sm:px-8">
        <Logo variant={locale === 'ar' ? 'arabic' : 'full'} size={28} />
        <LocaleThemeControls />
      </header>
      <main
        id="main"
        className="mx-auto flex w-full max-w-content flex-1 flex-col items-start justify-center gap-6 px-4 py-16 sm:px-8"
      >
        <Badge tone="accent" icon="sparkles">
          {t('kicker')}
        </Badge>
        <h1 className={locale === 'ar' ? 'text-ar-h1' : 'text-h1'}>{t('title')}</h1>
        <p className="max-w-2xl text-fg-secondary">{t('description')}</p>
        {isDev ? (
          <Button asChild size="lg" iconEnd="arrow-right">
            <Link href="/dev/components">{t('openGallery')}</Link>
          </Button>
        ) : null}
      </main>
      <footer className="border-t border-border-subtle px-4 py-6 text-body-sm text-fg-muted sm:px-8">
        {c('independence')}
      </footer>
    </div>
  );
}
