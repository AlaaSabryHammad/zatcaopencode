'use client';

import * as React from 'react';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { LocaleProvider, useLang, type Lang } from '@/components/zw';

type MessagesByLocale = Record<Lang, AbstractIntlMessages>;
const MessagesCtx = React.createContext<MessagesByLocale | null>(null);

export function GalleryMessages({
  messages,
  children,
}: {
  messages: MessagesByLocale;
  children: React.ReactNode;
}) {
  return <MessagesCtx.Provider value={messages}>{children}</MessagesCtx.Provider>;
}

/** Switches next-intl locale, dir/lang and (optionally) theme for a subtree. */
export function Scope({
  lang,
  theme,
  className,
  children,
}: {
  lang: Lang;
  theme?: 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
}) {
  const messages = React.useContext(MessagesCtx);
  if (!messages) throw new Error('Scope must be inside <GalleryMessages>');
  const inner = (
    <LocaleProvider lang={lang} className={className}>
      {children}
    </LocaleProvider>
  );
  return (
    <NextIntlClientProvider locale={lang} messages={messages[lang]} timeZone="Asia/Riyadh">
      {theme ? (
        <div data-theme={theme} className="contents">
          {inner}
        </div>
      ) : (
        inner
      )}
    </NextIntlClientProvider>
  );
}

/** Same as the previews' AR(...) helper. */
export function Ar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Scope lang="ar" className={className}>
      {children}
    </Scope>
  );
}

export function En({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Scope lang="en" className={className}>
      {children}
    </Scope>
  );
}

/** Pick fixture text for the current scope language. */
export function useS() {
  const lang = useLang();
  return React.useCallback(<T,>(en: T, ar: T): T => (lang === 'ar' ? ar : en), [lang]);
}
