'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Button, Card, Input, Alert, Tabs } from '@/components/zw';
import { totpSchema, recoveryCodeSchema, safeNext } from '@/lib/validation/auth';
import { verifyTotp, recoverTotp } from '@/server/actions/mfa.actions';

export function MfaForm() {
  const t = useTranslations();
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get('next'));
  const [tab, setTab] = useState('totp');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const totpForm = useForm<z.input<typeof totpSchema>>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: '' },
  });
  const recForm = useForm<z.input<typeof recoveryCodeSchema>>({
    resolver: zodResolver(recoveryCodeSchema),
    defaultValues: { code: '' },
  });

  function done() {
    router.push(next ?? '/');
    router.refresh();
  }

  async function submitTotp(v: z.input<typeof totpSchema>) {
    setPending(true);
    setError(null);
    const res = await verifyTotp(v);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    done();
  }

  async function submitRec(v: z.input<typeof recoveryCodeSchema>) {
    setPending(true);
    setError(null);
    const res = await recoverTotp(v);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    done();
  }

  return (
    <Card title={t('auth.twoFactor')} description={t('auth.twoFactorSubtitle')}>
      <div className="flex flex-col gap-4">
        {error ? <Alert tone="danger">{t(error as 'auth.errors.otpInvalid')}</Alert> : null}
        <Tabs
          tabs={[
            { id: 'totp', label: t('auth.totp') },
            { id: 'recovery', label: t('auth.recoveryCode') },
          ]}
          value={tab}
          onChange={setTab}
        >
          {(active: string) =>
            active === 'totp' ? (
              <form
                onSubmit={totpForm.handleSubmit(submitTotp)}
                className="flex flex-col gap-4 pt-4"
                noValidate
              >
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  dir="ltr"
                  label={t('auth.totpCode')}
                  error={totpForm.formState.errors.code ? t('validation.otp') : undefined}
                  {...totpForm.register('code')}
                />
                <Button type="submit" fullWidth loading={pending}>
                  {t('auth.verify')}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={recForm.handleSubmit(submitRec)}
                className="flex flex-col gap-4 pt-4"
                noValidate
              >
                <Input
                  id="r-code"
                  placeholder="ABC1-DEF2"
                  dir="ltr"
                  label={t('auth.recoveryCode')}
                  error={recForm.formState.errors.code ? t('validation.recoveryCode') : undefined}
                  {...recForm.register('code')}
                />
                <Button type="submit" variant="secondary" fullWidth loading={pending}>
                  {t('auth.useRecovery')}
                </Button>
              </form>
            )
          }
        </Tabs>
      </div>
    </Card>
  );
}
