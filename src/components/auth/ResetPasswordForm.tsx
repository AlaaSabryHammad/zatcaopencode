'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Button, Card, Input, Alert } from '@/components/zw';
import { resetSchema } from '@/lib/validation/auth';
import { resetPassword } from '@/server/actions/auth.actions';
import { PasswordStrengthBar } from './PasswordStrengthBar';

type Form = z.input<typeof resetSchema>;

export function ResetPasswordForm() {
  const t = useTranslations();
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get('token') ?? '';
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token, password: '', confirm: '' },
  });
  const pw = form.watch('password') ?? '';

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    const res = await resetPassword({ ...v, token });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(true);
    setTimeout(() => router.push('/auth/login'), 1500);
  }

  if (ok) {
    return (
      <Card title={t('auth.passwordReset')} description={t('auth.passwordResetSuccess')}>
        <Link href="/auth/login">
          <Button fullWidth>{t('auth.signIn')}</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card title={t('auth.resetPassword')} description={t('auth.resetSubtitle')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{t(error as 'auth.errors.invalidToken')}</Alert> : null}
        <input type="hidden" {...form.register('token')} value={token} />
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          label={t('auth.newPassword')}
          error={
            form.formState.errors.password
              ? t(form.formState.errors.password.message as 'validation.required')
              : undefined
          }
          {...form.register('password')}
        />
        <PasswordStrengthBar password={pw} />
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          label={t('auth.confirmPassword')}
          error={
            form.formState.errors.confirm
              ? t(form.formState.errors.confirm.message as 'validation.required')
              : undefined
          }
          {...form.register('confirm')}
        />
        <Button type="submit" fullWidth loading={pending} disabled={!token}>
          {t('auth.resetPassword')}
        </Button>
        <p className="text-center text-sm">
          <Link href="/auth/login" className="underline">
            {t('auth.backToSignIn')}
          </Link>
        </p>
      </form>
    </Card>
  );
}
