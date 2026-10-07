'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Alert, Badge, Button, Input } from '@/components/zw';
import {
  saveAccount,
  resendVerificationEmail,
  requestPhoneOtp,
  verifyPhoneOtp,
} from '@/server/actions/onboarding.actions';

const schema = z.object({
  name: z.string().trim().min(2, 'validation.nameShort').max(120, 'validation.nameLong'),
});

export function StepAccount({
  initialName,
  email,
  emailVerified,
  initialPhone,
  phoneVerified,
  onVerifiedPhone,
  onNext,
}: {
  initialName: string;
  email: string;
  emailVerified: boolean;
  initialPhone: string | null;
  phoneVerified: boolean;
  onVerifiedPhone: () => void;
  onNext: () => void;
}) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [mailSent, setMailSent] = useState(false);
  const [emailOk] = useState(emailVerified);
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [phoneOk, setPhoneOk] = useState(phoneVerified);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const form = useForm<{ name: string }>({ resolver: zodResolver(schema), defaultValues: { name: initialName } });

  async function resend() {
    setBusy(true);
    setMsg(null);
    await resendVerificationEmail();
    setBusy(false);
    setMailSent(true);
    setMsg(t('onboarding.emailSent'));
  }

  async function sendCode() {
    setBusy(true);
    setMsg(null);
    setError(null);
    const digits = phone.replace(/\D/g, '').replace(/^(00966|966|0)/, '');
    if (!/^5\d{8}$/.test(digits)) {
      setBusy(false);
      setError('validation.phone');
      return;
    }
    const res = await requestPhoneOtp({ phone: digits });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCodeSent(true);
  }

  async function verify() {
    setBusy(true);
    setMsg(null);
    setError(null);
    const digits = phone.replace(/\D/g, '').replace(/^(00966|966|0)/, '');
    const res = await verifyPhoneOtp({ phone: digits, code });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPhoneOk(true);
    onVerifiedPhone();
  }

  return (
    <form
      id="ob-form"
      onSubmit={form.handleSubmit(async (v) => {
        setError(null);
        const res = await saveAccount(v);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onNext();
      })}
      className="flex flex-col gap-7"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t('onboarding.s1Title')}</h1>
        <p className="text-fg-muted">{t('onboarding.s1Desc')}</p>
      </div>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      {msg && !error ? <Alert tone="success">{msg}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="ob-name"
          label={t('auth.name')}
          required
          error={form.formState.errors.name ? t('validation.required') : undefined}
          {...form.register('name')}
        />
        <Input
          id="ob-email"
          type="email"
          label={t('auth.email')}
          value={email}
          readOnly
          iconStart="mail"
          trailing={
            emailOk ? (
              <Badge tone="success">{t('onboarding.verified')}</Badge>
            ) : (
              <Button size="sm" variant="secondary" loading={busy} onClick={resend}>
                {mailSent ? t('onboarding.emailSent') : t('onboarding.verifyEmail')}
              </Button>
            )
          }
        />
      </div>
      <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{t('onboarding.otpTitle')}</span>
            <span className="text-sm text-fg-muted">
              {t('onboarding.otpSentTo', { phone: phone ? `+966 ${phone}` : '—' })}
            </span>
          </div>
          {phoneOk ? (
            <Badge tone="success">{t('onboarding.phoneVerified')}</Badge>
          ) : (
            <Button size="sm" variant="ghost" loading={busy} onClick={sendCode}>
              {codeSent ? t('onboarding.resendEmail') : t('onboarding.sendCode')}
            </Button>
          )}
        </div>
        {!phoneOk ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="ob-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="5X XXX XXXX"
              label={t('auth.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
            {codeSent ? (
              <Input
                id="ob-code"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                placeholder="000000"
                label={t('auth.totpCode')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                trailing={
                  <Button size="sm" loading={busy} onClick={verify} disabled={code.length !== 6}>
                    {t('onboarding.verifyPhone')}
                  </Button>
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
