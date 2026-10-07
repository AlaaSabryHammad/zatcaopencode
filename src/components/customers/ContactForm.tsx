'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Alert, Button, Input } from '@/components/zw';
import { contactSchema } from '@/lib/validation/customer';
import { addContact } from '@/server/actions/customer.actions';

type Form = z.input<typeof contactSchema>;

export function ContactForm({ customerId }: { customerId: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<Form>({ resolver: zodResolver(contactSchema), defaultValues: { name: '', role: '', email: '', phone: '' } });

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    const res = await addContact({ ...v, customerId });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    form.reset();
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" iconStart="plus" onClick={() => setOpen(true)}>
        {t('customers.profile.addContact')}
      </Button>
    );
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-lg border border-border-subtle p-3" noValidate>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      <Input id="ct-name" label={t('customers.profile.contactName')} error={form.formState.errors.name ? t('validation.required') : undefined} {...form.register('name')} />
      <Input id="ct-role" label={t('customers.profile.contactRole')} {...form.register('role')} />
      <div className="flex gap-2">
        <Button size="sm" type="submit" loading={pending}>
          {t('customers.editor.save')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t('zw.cancel')}
        </Button>
      </div>
    </form>
  );
}
