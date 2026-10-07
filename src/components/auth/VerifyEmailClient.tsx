'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button, Card } from '@/components/zw';
import { verifyEmail } from '@/server/actions/auth.actions';

export function VerifyEmailClient() {
  const t = useTranslations();
  const sp = useSearchParams();
  const token = sp.get('token');
  const [state, setState] = useState<'pending' | 'ok' | 'error'>('pending');
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    (async () => {
      if (!token) {
        setState('error');
        return;
      }
      const res = await verifyEmail({ token });
      setState(res.ok ? 'ok' : 'error');
    })();
  }, [token]);

  return (
    <Card
      title={t('auth.verifyEmail')}
      description={
        state === 'pending'
          ? t('common.loading')
          : state === 'ok'
            ? t('auth.emailVerified')
            : t('auth.invalidToken')
      }
    >
      {state !== 'pending' ? (
        <Link href="/auth/login">
          <Button fullWidth>{t('auth.signIn')}</Button>
        </Link>
      ) : null}
    </Card>
  );
}
