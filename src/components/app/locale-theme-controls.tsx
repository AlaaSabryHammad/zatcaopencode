'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { IconButton, Icon, Tooltip } from '@/components/zw';

/** Switches ar ⇄ en on the same route (locale prefix + cookie handled by next-intl). */
export function useToggleLocale() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  return React.useCallback(() => {
    router.replace(pathname, { locale: locale === 'ar' ? 'en' : 'ar' });
  }, [locale, pathname, router]);
}

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const theme: 'light' | 'dark' = mounted && resolvedTheme === 'dark' ? 'dark' : 'light';
  const toggle = React.useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);
  return { theme, toggle, mounted };
}

export function LocaleThemeControls() {
  const t = useTranslations('common');
  const toggleLocale = useToggleLocale();
  const { theme, toggle } = useThemeToggle();
  const locale = useLocale();
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="zw-lang-toggle"
        onClick={toggleLocale}
        aria-label={t('language')}
        lang={locale === 'ar' ? 'en' : 'ar'}
      >
        <Icon name="languages" size={16} />
        <span>{t('switchLanguage')}</span>
      </button>
      <Tooltip content={t('theme')} side="bottom">
        <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={t('theme')} onClick={toggle} />
      </Tooltip>
    </div>
  );
}
