'use client';

import * as React from 'react';
import { useLocale, useTranslations, type AbstractIntlMessages } from 'next-intl';
import { Badge, Logo, SegmentedControl, type Lang } from '@/components/zw';
import { LocaleThemeControls, useThemeToggle } from '@/components/app/locale-theme-controls';
import { DEMOS } from './demos';
import { GalleryMessages, Scope } from './scope';

type LangMode = 'current' | 'both';
type ThemeMode = 'current' | 'both';

export function Gallery({ messages }: { messages: Record<Lang, AbstractIntlMessages> }) {
  const t = useTranslations('gallery');
  const locale = useLocale() as Lang;
  const { theme } = useThemeToggle();
  const [langMode, setLangMode] = React.useState<LangMode>('both');
  const [themeMode, setThemeMode] = React.useState<ThemeMode>('current');

  const langs: Lang[] = langMode === 'both' ? ['ar', 'en'] : [locale];
  const themes: Array<'light' | 'dark'> = themeMode === 'both' ? ['light', 'dark'] : [theme];

  return (
    <GalleryMessages messages={messages}>
      <div className="flex min-h-dvh">
        <nav
          aria-label={t('sections')}
          className="sticky top-0 hidden h-dvh w-60 shrink-0 overflow-auto border-e border-border bg-surface-sunken p-4 md:block"
        >
          <div className="mb-4">
            <Logo variant={locale === 'ar' ? 'arabic' : 'full'} size={24} />
          </div>
          <p className="mb-2 text-caption text-fg-muted">{t('sections')}</p>
          <ul className="flex flex-col">
            {DEMOS.map((d) => (
              <li key={d.id}>
                <a
                  href={`#${d.id}`}
                  className="block rounded-sm px-2.5 py-1.5 text-body-sm text-fg-secondary hover:bg-surface-hover hover:text-fg"
                >
                  {d.id}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="min-w-0 flex-1">
          <header className="sticky top-0 z-sticky flex flex-wrap items-center gap-3 border-b border-border-subtle bg-canvas px-4 py-3 sm:px-8">
            <div className="me-auto">
              <p className="text-caption text-fg-muted">{t('kicker')}</p>
              <h1 className={locale === 'ar' ? 'text-ar-h2' : 'text-h2'}>{t('title')}</h1>
            </div>
            <SegmentedControl
              size="sm"
              value={langMode}
              onChange={(v) => setLangMode(v as LangMode)}
              label="Language"
              options={[
                { value: 'both', label: t('showBoth'), icon: 'languages' },
                { value: 'current', label: t('onlyCurrent') },
              ]}
            />
            <SegmentedControl
              size="sm"
              value={themeMode}
              onChange={(v) => setThemeMode(v as ThemeMode)}
              label="Theme"
              options={[
                {
                  value: 'current',
                  label: theme === 'dark' ? 'Dark' : 'Light',
                  icon: theme === 'dark' ? 'moon' : 'sun',
                },
                { value: 'both', label: 'Light + Dark' },
              ]}
            />
            <LocaleThemeControls />
          </header>
          <p className="px-4 pt-6 text-fg-secondary sm:px-8">{t('description')}</p>
          <div className="flex flex-col gap-10 px-4 py-6 sm:px-8">
            {DEMOS.map(({ id, Demo, note }) => (
              <section key={id} id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
                <div className="mb-3 flex items-center gap-2">
                  <h2 id={`${id}-h`} className="text-h3" dir="ltr">
                    {id}
                  </h2>
                  {note ? (
                    <Badge tone="accent" size="sm">
                      {note}
                    </Badge>
                  ) : null}
                </div>
                <div className={`grid gap-4 ${langs.length * themes.length > 1 ? 'xl:grid-cols-2' : ''}`}>
                  {themes.flatMap((th) =>
                    langs.map((lg) => (
                      <Scope
                        key={`${th}-${lg}`}
                        lang={lg}
                        theme={th}
                        className="min-w-0 rounded-xl border border-border bg-canvas p-5"
                      >
                        <div className="mb-3 flex gap-2" dir="ltr">
                          <Badge size="sm" tone="neutral">
                            {lg.toUpperCase()}
                          </Badge>
                          <Badge size="sm" tone="neutral" icon={th === 'dark' ? 'moon' : 'sun'}>
                            {th}
                          </Badge>
                        </div>
                        <Demo />
                      </Scope>
                    )),
                  )}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </GalleryMessages>
  );
}
