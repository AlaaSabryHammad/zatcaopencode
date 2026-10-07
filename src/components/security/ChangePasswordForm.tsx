'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Alert, Button, Card, Input } from '@/components/zw';
import { changePasswordSchema } from '@/lib/validation/auth';
import { changePassword } from '@/server/actions/security.actions';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';

type Form = z.input<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const t = useTranslations();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: '', password: '', confirm: '' },
  });
  const pw = form.watch('password') ?? '';

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    setOk(false);
    const res = await changePassword(v);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(true);
    form.reset();
  }

  return (
    <Card title={t('security.passwordTitle')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{t(error as 'security.errors.currentWrong')}</Alert> : null}
        {ok ? <Alert tone="success">{t('security.passwordChanged')}</Alert> : null}
        <Input
          id="current"
          type="password"
          autoComplete="current-password"
          label={t('security.currentPassword')}
          error={form.formState.errors.current ? t('validation.required') : undefined}
          {...form.register('current')}
        />
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          label={t('auth.newPassword')}
          error={
            form.formState.errors.password ? t(form.formState.errors.password.message as 'validation.required') : undefined
          }
          {...form.register('password')}
        />
        <PasswordStrengthBar password={pw} />
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          label={t('auth.confirmPassword')}
          error={
            form.formState.errors.confirm ? t(form.formState.errors.confirm.message as 'validation.required') : undefined
          }
          {...form.register('confirm')}
        />
        <Button type="submit" loading={pending}>
          {t('zw.save')}
        </Button>
      </form>
    </Card>
  );
}
