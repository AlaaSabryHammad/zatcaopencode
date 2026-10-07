'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import qrcode from 'qrcode-generator';
import { Alert, Badge, Button, Card, Input } from '@/components/zw';
import { totpSchema } from '@/lib/validation/auth';
import { setupTotp, confirmTotp, disableTotp } from '@/server/actions/mfa.actions';

export function TotpManager({ enabled }: { enabled: boolean }) {
  const t = useTranslations();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [step, setStep] = useState<'idle' | 'scan' | 'codes' | 'disabling'>('idle');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const codeForm = useForm<z.input<typeof totpSchema>>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: '' },
  });
  const pwdForm = useForm<{ password: string }>({ defaultValues: { password: '' } });

  async function start() {
    setPending(true);
    setError(null);
    const res = await setupTotp();
    setPending(false);
    if (!res.ok || !res.data) {
      setError(res.ok ? 'security.errors.noSetup' : res.error);
      return;
    }
    setOtpauthUrl(res.data.otpauthUrl);
    setSecret(res.data.secret);
    setStep('scan');
  }

  async function confirm(v: z.input<typeof totpSchema>) {
    setPending(true);
    setError(null);
    const res = await confirmTotp(v);
    setPending(false);
    if (!res.ok || !res.data) {
      setError(res.ok ? 'auth.errors.otpInvalid' : res.error);
      return;
    }
    setCodes(res.data.codes);
    setIsEnabled(true);
    setStep('codes');
  }

  async function disable(v: { password: string }) {
    setPending(true);
    setError(null);
    const res = await disableTotp(v);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setIsEnabled(false);
    setStep('idle');
    setDoneMsg(t('security.disabled'));
  }

  function qrSvg(url: string): string {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    return qr.createSvgTag({ scalable: true });
  }

  return (
    <Card
      title={t('security.twoFactorTitle')}
      actions={
        <Badge tone={isEnabled ? 'success' : 'neutral'}>
          {isEnabled ? t('security.twoFactorOn') : t('security.twoFactorOff')}
        </Badge>
      }
    >
      <div className="flex max-w-md flex-col gap-4">
        {error ? <Alert tone="danger">{t(error as 'auth.errors.otpInvalid')}</Alert> : null}
        {doneMsg ? <Alert tone="success">{doneMsg}</Alert> : null}

        {!isEnabled && step === 'idle' ? (
          <Button loading={pending} onClick={start}>
            {t('security.enable')}
          </Button>
        ) : null}

        {!isEnabled && step === 'scan' ? (
          <>
            <p className="text-sm text-fg-muted">{t('security.scanDesc')}</p>
            <div
              className="mx-auto w-56 overflow-hidden rounded-lg border border-border-subtle bg-white p-2"
              dangerouslySetInnerHTML={{ __html: qrSvg(otpauthUrl) }}
            />
            <p className="text-sm text-fg-muted">
              {t('security.manualKey')}:{' '}
              <code className="zw-mono" dir="ltr">
                {secret}
              </code>
            </p>
            <form onSubmit={codeForm.handleSubmit(confirm)} className="flex flex-col gap-4" noValidate>
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                dir="ltr"
                label={t('auth.totpCode')}
                error={codeForm.formState.errors.code ? t('validation.otp') : undefined}
                {...codeForm.register('code')}
              />
              <Button type="submit" loading={pending}>
                {t('security.confirmEnable')}
              </Button>
            </form>
          </>
        ) : null}

        {step === 'codes' ? (
          <>
            <Alert tone="success">{t('security.twoFactorOn')}</Alert>
            <p className="font-medium">{t('security.recoveryTitle')}</p>
            <p className="text-sm text-fg-muted">{t('security.recoveryDesc')}</p>
            <div className="grid grid-cols-2 gap-2" dir="ltr">
              {codes.map((c) => (
                <code key={c} className="zw-mono rounded border border-border-subtle px-2 py-1 text-center">
                  {c}
                </code>
              ))}
            </div>
          </>
        ) : null}

        {isEnabled && step !== 'codes' ? (
          step === 'disabling' ? (
            <form onSubmit={pwdForm.handleSubmit(disable)} className="flex flex-col gap-4" noValidate>
              <p className="text-sm text-fg-muted">{t('security.disableDesc')}</p>
              <Input
                id="disable-pwd"
                type="password"
                autoComplete="current-password"
                label={t('security.currentPassword')}
                {...pwdForm.register('password')}
              />
              <div className="flex gap-2">
                <Button type="submit" variant="danger" loading={pending}>
                  {t('security.disable')}
                </Button>
                <Button variant="secondary" onClick={() => setStep('idle')}>
                  {t('zw.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" onClick={() => setStep('disabling')}>
              {t('security.disable')}
            </Button>
          )
        ) : null}
      </div>
    </Card>
  );
}
