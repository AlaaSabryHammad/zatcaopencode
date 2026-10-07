'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Alert, Button, Drawer, Input, SegmentedControl, Textarea } from '@/components/zw';
import { customerSchema } from '@/lib/validation/customer';
import { createCustomer, updateCustomer, getCustomer } from '@/server/actions/customer.actions';

type Form = z.input<typeof customerSchema>;

function empty(): Form {
  return {
    type: 'company', nameAr: '', nameEn: '', vatNumber: '', crNumber: '', email: '',
    phone: '', city: '', address: '', creditLimit: null, paymentTermsDays: 30, notes: '', tags: [],
  };
}

export function CustomerDrawer({
  open,
  customerId,
  onClose,
}: {
  open: boolean;
  customerId: string | null;
  onClose: (saved: boolean) => void;
}) {
  const t = useTranslations();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [loading, setLoading] = React.useState(!!customerId);
  const form = useForm<Form>({ resolver: zodResolver(customerSchema), defaultValues: empty() });
  const tagsText = form.watch('tags')?.join(' | ') ?? '';

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    if (!customerId) {
      form.reset(empty());
      setLoading(false);
      return;
    }
    setLoading(true);
    getCustomer({ id: customerId }).then((res) => {
      setLoading(false);
      if (!res.ok || !res.data) {
        setError(res.ok ? 'validation.invalid' : res.error);
        return;
      }
      const d = res.data;
      form.reset({
        type: d.type,
        nameAr: d.nameAr,
        nameEn: d.nameEn ?? '',
        vatNumber: d.vatNumber ?? '',
        crNumber: d.crNumber ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        city: d.city ?? '',
        address: d.address ?? '',
        creditLimit: d.creditLimit,
        paymentTermsDays: d.paymentTermsDays,
        notes: d.notes ?? '',
        tags: d.tags,
      });
    });
  }, [open, customerId, form]);

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    const payload = { ...v, tags: (v.tags ?? []).map((s) => s.trim()).filter(Boolean) };
    const res = customerId ? await updateCustomer({ ...payload, id: customerId }) : await createCustomer(payload);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose(true);
  }

  return (
    <Drawer
      open={open}
      onClose={() => onClose(false)}
      title={customerId ? t('customers.edit') : t('customers.new')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onClose(false)}>
            {t('zw.cancel')}
          </Button>
          <Button type="submit" form="customer-form" loading={pending || loading}>
            {t('customers.editor.save')}
          </Button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-fg-muted">{t('common.loading')}</p>
      ) : (
        <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
          <SegmentedControl
            label={t('customers.type.company')}
            options={[
              { value: 'company', label: t('customers.editor.company') },
              { value: 'individual', label: t('customers.editor.individual') },
            ]}
            value={form.watch('type')}
            onChange={(v) => form.setValue('type', v as 'company' | 'individual')}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input id="c-nameAr" label={t('org.nameAr')} required error={form.formState.errors.nameAr ? t('validation.required') : undefined} {...form.register('nameAr')} />
            <Input id="c-nameEn" dir="ltr" label={t('org.nameEn')} {...form.register('nameEn')} />
            <Input id="c-vat" dir="ltr" mono label={t('org.vatNumber')} error={form.formState.errors.vatNumber ? t('validation.vatInvalid') : undefined} {...form.register('vatNumber')} />
            <Input id="c-cr" dir="ltr" mono label={t('org.crNumber')} {...form.register('crNumber')} />
            <Input id="c-email" dir="ltr" type="email" label={t('auth.email')} error={form.formState.errors.email ? t('validation.email') : undefined} {...form.register('email')} />
            <Input id="c-phone" dir="ltr" type="tel" label={t('auth.phone')} error={form.formState.errors.phone ? t('validation.phone') : undefined} {...form.register('phone')} />
            <Input id="c-city" label={t('onboarding.city')} {...form.register('city')} />
            <Input id="c-addr" label={t('onboarding.street')} {...form.register('address')} />
            <Input id="c-credit" dir="ltr" mono inputMode="decimal" label={t('customers.editor.creditLimit')} {...form.register('creditLimit')} />
            <Input id="c-terms" dir="ltr" mono inputMode="numeric" label={t('customers.editor.paymentTerms')} {...form.register('paymentTermsDays')} />
          </div>
          <Input
            id="c-tags"
            label={t('customers.cols.tags')}
            hint={t('customers.editor.tagsHint')}
            value={tagsText}
            onChange={(e) => form.setValue('tags', e.target.value.split('|').map((s) => s.trim()).filter(Boolean))}
          />
          <Textarea id="c-notes" label={t('customers.editor.notes')} rows={2} {...form.register('notes')} />
        </form>
      )}
    </Drawer>
  );
}
