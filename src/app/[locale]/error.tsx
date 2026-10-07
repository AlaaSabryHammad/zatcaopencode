'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Button } from '@/components/zw';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const c = useTranslations('common');
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-xl place-items-center p-6">
      <Alert
        tone="danger"
        title={t('genericTitle')}
        action={
          <Button size="sm" variant="secondary" iconStart="refresh-cw" onClick={reset}>
            {c('retry')}
          </Button>
        }
      >
        {t('genericBody')}
        {error.digest ? (
          <span className="mt-1 block font-mono text-caption text-fg-muted" dir="ltr">
            {error.digest}
          </span>
        ) : null}
      </Alert>
    </main>
  );
}
