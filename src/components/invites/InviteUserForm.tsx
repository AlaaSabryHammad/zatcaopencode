'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Alert, Button, Card, Input, Select } from '@/components/zw';
import { inviteUser } from '@/server/actions/user.actions';

export interface InviteRole {
  id: string;
  key: string;
  nameAr: string;
  nameEn: string;
  isSystem: boolean;
}

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'validation.required').pipe(z.email('validation.email')),
  roleId: z.string().uuid('validation.invalid'),
});

type Form = z.infer<typeof schema>;

export function InviteUserForm({ roles }: { roles: InviteRole[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', roleId: roles[0]?.id ?? '' },
  });

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    setSent(null);
    const res = await inviteUser({ email: v.email, roleId: v.roleId });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSent(v.email);
    form.reset({ email: '', roleId: roles[0]?.id ?? '' });
  }

  return (
    <Card title={t('invites.title')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{t(error as 'users.errors.alreadyMember')}</Alert> : null}
        {sent ? <Alert tone="success">{t('invites.sent', { email: sent })}</Alert> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="inv-email"
            type="email"
            dir="ltr"
            label={t('auth.email')}
            error={form.formState.errors.email ? t('validation.email') : undefined}
            {...form.register('email')}
          />
          <Select
            id="inv-role"
            label={t('users.role')}
            options={roles.map((r) => ({
              value: r.id,
              label: `${locale === 'ar' ? r.nameAr : r.nameEn}${r.isSystem ? '' : ' · ✎'}`,
            }))}
            {...form.register('roleId')}
          />
        </div>
        <Button type="submit" loading={pending}>
          {t('invites.send')}
        </Button>
      </form>
    </Card>
  );
}
