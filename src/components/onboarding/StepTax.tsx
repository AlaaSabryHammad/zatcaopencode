'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Alert, Input, SegmentedControl, Select } from '@/components/zw';
import { saveTax } from '@/server/actions/onboarding.actions';

const schema = z.object({
  vatStatus: z.enum(['reg', 'group', 'none']),
  currency: z.string(),
  fiscalYearStartMonth: z.number(),
  invoicePrefix: z.string().trim().min(1).max(40),
  startNumber: z.number().int().min(1).max(999999),
});

type Form = z.infer<typeof schema>;

export function StepTax({
  initial,
  vatNumber,
  onNext,
}: {
  initial: { vatStatus: string; currency: string; fiscalYearStartMonth: number; seqPrefix: string | null; seqStart: number | null };
  vatNumber: string | null;
  onNext: () => void;
}) {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      vatStatus: (['reg', 'group', 'none'] as const).includes(initial.vatStatus as 'reg') ? (initial.vatStatus as Form['vatStatus']) : 'reg',
      currency: initial.currency || 'SAR',
      fiscalYearStartMonth: initial.fiscalYearStartMonth || 1,
      invoicePrefix: initial.seqPrefix ?? 'INV-{YYYY}-{#####}',
      startNumber: initial.seqStart ?? 1,
    },
  });
  const prefix = form.watch('invoicePrefix');
  const start = form.watch('startNumber');
  const nextPreview = (prefix || '')
    .replace('{YYYY}', String(year))
    .replace('{#####}', String(start || 1).padStart(5, '0'));

  return (
    <form
      id="ob-form"
      onSubmit={form.handleSubmit(async (v) => {
        setError(null);
        const res = await saveTax(v);
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
        <h1 className="text-h1">{t('onboarding.s5Title')}</h1>
        <p className="text-fg-muted">{t('onboarding.s5Desc')}</p>
      </div>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      <SegmentedControl
        label={t('onboarding.vatStatus')}
        options={[
          { value: 'reg', label: t('onboarding.vatReg') },
          { value: 'group', label: t('onboarding.vatGroup') },
          { value: 'none', label: t('onboarding.vatNone') },
        ]}
        value={form.watch('vatStatus')}
        onChange={(v) => form.setValue('vatStatus', v as Form['vatStatus'])}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          id="ob-rate"
          label={t('onboarding.defaultRate')}
          options={[
            { value: '15', label: '15% — Standard' },
            { value: '0', label: '0% — Zero-rated' },
            { value: 'ex', label: 'Exempt' },
          ]}
          defaultValue="15"
        />
        <Input id="ob-vat-ro" dir="ltr" mono label={t('org.vatNumber')} value={vatNumber ?? ''} readOnly hint={t('onboarding.fromBusiness')} />
        <Input
          id="ob-prefix"
          dir="ltr"
          mono
          label={t('onboarding.invoiceFormat')}
          hint={t('onboarding.formatHint', { next: nextPreview })}
          error={form.formState.errors.invoicePrefix ? t('validation.required') : undefined}
          {...form.register('invoicePrefix')}
        />
        <Input
          id="ob-start"
          dir="ltr"
          mono
          inputMode="numeric"
          label={t('onboarding.startNumber')}
          error={form.formState.errors.startNumber ? t('validation.invalid') : undefined}
          {...form.register('startNumber', { valueAsNumber: true })}
        />
        <Select
          id="ob-cur"
          label={t('onboarding.currency')}
          options={['SAR', 'USD', 'AED'].map((c) => ({ value: c, label: c }))}
          value={form.watch('currency')}
          onChange={(e) => form.setValue('currency', (e.target as HTMLSelectElement).value)}
        />
        <Select
          id="ob-fy"
          label={t('onboarding.fiscalStart')}
          options={[
            { value: '1', label: 'January' },
            { value: '4', label: 'April' },
            { value: '7', label: 'July' },
            { value: '10', label: 'October' },
          ]}
          value={String(form.watch('fiscalYearStartMonth'))}
          onChange={(e) => form.setValue('fiscalYearStartMonth', Number((e.target as HTMLSelectElement).value))}
        />
      </div>
      <Alert tone="info" title={t('onboarding.deviceNoteTitle')}>
        {t('onboarding.deviceNote')}
      </Alert>
    </form>
  );
}
