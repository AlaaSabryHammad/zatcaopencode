'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button, Card, Input } from '@/components/zw';
import { forgotSchema } from '@/lib/validation/auth';
import { forgotPassword } from '@/server/actions/auth.actions';

type Form = z.input<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  async function onSubmit(v: Form) {
    setPending(true);
    await forgotPassword(v);
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Card title={t('auth.checkEmail')} description={t('auth.resetLinkSent')}>
        <Link href="/auth/login">
          <Button variant="secondary" fullWidth>
            {t('auth.backToSignIn')}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card title={t('auth.forgotPassword')} description={t('auth.forgotSubtitle')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          label={t('auth.email')}
          error={
            form.formState.errors.email
              ? t(form.formState.errors.email.message as 'validation.required')
              : undefined
          }
          {...form.register('email')}
        />
        <Button type="submit" fullWidth loading={pending}>
          {t('auth.sendResetLink')}
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
