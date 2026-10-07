'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button, Card, Input, Checkbox, Alert } from '@/components/zw';
import { registerSchema } from '@/lib/validation/auth';
import { register } from '@/server/actions/auth.actions';
import { PasswordStrengthBar } from './PasswordStrengthBar';

type Form = z.input<typeof registerSchema>;

function tk(t: ReturnType<typeof useTranslations>, key: string) {
  return t(key as 'auth.signIn');
}

export function RegisterForm() {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<{ email: string } | null>(null);
  const [pending, setPending] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', terms: false },
  });
  const pw = form.watch('password') ?? '';

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    setOk(null);
    const res = await register(v);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(res.data ?? null);
    form.reset();
  }

  if (ok) {
    return (
      <Card title={t('auth.checkEmail')} description={t('auth.verifyEmailSent', { email: ok.email })}>
        <Link href="/auth/login">
          <Button variant="secondary" fullWidth>
            {t('auth.backToSignIn')}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card title={t('auth.createAccount')} description={t('auth.createAccountSubtitle')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{tk(t, error)}</Alert> : null}
        <Input
          id="name"
          autoComplete="name"
          label={t('auth.name')}
          error={
            form.formState.errors.name
              ? tk(t, form.formState.errors.name.message ?? 'validation.invalid')
              : undefined
          }
          {...form.register('name')}
        />
        <Input
          id="email"
          type="email"
          autoComplete="email"
          label={t('auth.email')}
          error={
            form.formState.errors.email
              ? tk(t, form.formState.errors.email.message ?? 'validation.invalid')
              : undefined
          }
          {...form.register('email')}
        />
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          placeholder="5X XXX XXXX"
          label={t('auth.phone')}
          hint={t('zw.phoneHint')}
          error={
            form.formState.errors.phone
              ? tk(t, form.formState.errors.phone.message ?? 'validation.invalid')
              : undefined
          }
          {...form.register('phone')}
        />
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          label={t('auth.password')}
          error={
            form.formState.errors.password
              ? tk(t, form.formState.errors.password.message ?? 'validation.invalid')
              : undefined
          }
          {...form.register('password')}
        />
        <PasswordStrengthBar password={pw} />
        <Checkbox id="terms" label={t('auth.terms')} {...form.register('terms')} />
        {form.formState.errors.terms ? (
          <p className="text-fg-danger text-sm">{tk(t, 'validation.terms')}</p>
        ) : null}
        <Button type="submit" fullWidth loading={pending}>
          {t('auth.createAccount')}
        </Button>
        <p className="text-center text-sm">
          {t('auth.haveAccount')}{' '}
          <Link href="/auth/login" className="underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </form>
    </Card>
  );
}
