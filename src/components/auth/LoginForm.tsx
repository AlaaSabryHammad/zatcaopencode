'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { Button, Card, Input, Checkbox, Alert } from '@/components/zw';
import { loginSchema, safeNext } from '@/lib/validation/auth';
import { login } from '@/server/actions/auth.actions';

type Form = z.input<typeof loginSchema>;

/** Cast a server-returned i18n key to a valid translation key. */
function tk(t: ReturnType<typeof useTranslations>, key: string) {
  return t(key as 'auth.signIn');
}

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get('next'));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    const res = await login(v);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.data?.requiresMfa) {
      router.push(`/auth/2fa${next ? `?next=${encodeURIComponent(next)}` : ''}`);
      return;
    }
    router.push(next ?? '/');
    router.refresh();
  }

  return (
    <Card title={t('auth.signIn')} description={t('auth.signInSubtitle')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{tk(t, error)}</Alert> : null}
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
          id="password"
          type="password"
          autoComplete="current-password"
          label={t('auth.password')}
          error={
            form.formState.errors.password
              ? tk(t, form.formState.errors.password.message ?? 'validation.invalid')
              : undefined
          }
          {...form.register('password')}
        />
        <div className="flex items-center justify-between gap-2">
          <Checkbox id="remember" label={t('auth.rememberMe')} {...form.register('remember')} />
          <Link href="/auth/forgot-password" className="text-sm underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <Button type="submit" fullWidth loading={pending}>
          {t('auth.signIn')}
        </Button>
        <p className="text-center text-sm">
          {t('auth.noAccount')}{' '}
          <Link href="/auth/register" className="underline">
            {t('auth.createAccount')}
          </Link>
        </p>
      </form>
    </Card>
  );
}
