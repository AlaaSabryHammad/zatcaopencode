'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Alert, Input, Select, VatInput } from '@/components/zw';
import { saveBusiness } from '@/server/actions/onboarding.actions';
import type { BusinessData } from './OnboardingWizard';

const schema = z.object({
  nameAr: z.string().trim().min(2, 'validation.required'),
  nameEn: z.string().trim().max(160).optional(),
  legalName: z.string().trim().min(2, 'validation.required'),
  crNumber: z.string().trim().regex(/^\d{10}$/, 'validation.invalid'),
  vatNumber: z.string().trim().regex(/^3\d{13}3$/, 'validation.vatInvalid'),
  tin: z.string().trim().max(20).optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  employeesRange: z.string().optional(),
  invoiceVolume: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function StepBusiness({
  initial,
  onNext,
}: {
  initial: Partial<BusinessData>;
  onNext: (saved: { vatNumber: string; orgName: string }) => void;
}) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameAr: initial.nameAr ?? '',
      nameEn: initial.nameEn ?? '',
      legalName: initial.legalName ?? '',
      crNumber: initial.crNumber ?? '',
      vatNumber: initial.vatNumber ?? '',
      tin: initial.tin ?? '',
      businessType: initial.businessType ?? 'llc',
      industry: initial.industry ?? 'it',
      employeesRange: initial.employeesRange ?? 'm',
      invoiceVolume: initial.invoiceVolume ?? 'b',
    },
  });

  return (
    <form
      id="ob-form"
      onSubmit={form.handleSubmit(async (v) => {
        setError(null);
        const res = await saveBusiness({
          ...v,
          nameEn: v.nameEn || null,
          tin: v.tin || null,
          businessType: v.businessType || null,
          industry: v.industry || null,
          employeesRange: v.employeesRange || null,
          invoiceVolume: v.invoiceVolume || null,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onNext({ vatNumber: v.vatNumber, orgName: v.nameAr });
      })}
      className="flex flex-col gap-7"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t('onboarding.s2Title')}</h1>
        <p className="text-fg-muted">{t('onboarding.s2Desc')}</p>
      </div>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="ob-nameAr"
          label={t('org.nameAr')}
          required
          error={form.formState.errors.nameAr ? t('validation.required') : undefined}
          {...form.register('nameAr')}
        />
        <Input id="ob-nameEn" dir="ltr" label={t('org.nameEn')} {...form.register('nameEn')} />
        <Input
          id="ob-legal"
          label={t('onboarding.legalName')}
          required
          error={form.formState.errors.legalName ? t('validation.required') : undefined}
          {...form.register('legalName')}
        />
        <Input
          id="ob-cr"
          dir="ltr"
          mono
          inputMode="numeric"
          maxLength={10}
          label={t('org.crNumber')}
          required
          error={form.formState.errors.crNumber ? t('validation.invalid') : undefined}
          {...form.register('crNumber')}
        />
        <VatInput
          label={t('org.vatNumber')}
          value={form.watch('vatNumber') ?? ''}
          onChange={(digits) => form.setValue('vatNumber', digits, { shouldValidate: true })}
          error={form.formState.errors.vatNumber ? t('validation.vatInvalid') : undefined}
        />
        <Input id="ob-tin" dir="ltr" mono inputMode="numeric" maxLength={20} label="TIN" {...form.register('tin')} />
        <Select
          id="ob-biz"
          label={t('onboarding.businessType')}
          options={['llc', 'est', 'jsc', 'branch', 'free'].map((v) => ({
            value: v,
            label: t(`onboarding.opts.biz.${v}` as 'onboarding.opts.biz.llc'),
          }))}
          {...form.register('businessType')}
        />
        <Select
          id="ob-ind"
          label={t('onboarding.industry')}
          options={['it', 'construction', 'retail', 'hospitality', 'services', 'logistics'].map((v) => ({
            value: v,
            label: t(`onboarding.opts.ind.${v}` as 'onboarding.opts.ind.it'),
          }))}
          {...form.register('industry')}
        />
        <Select
          id="ob-emp"
          label={t('onboarding.employees')}
          options={['s', 'm', 'l', 'xl'].map((v) => ({
            value: v,
            label: t(`onboarding.opts.emp.${v}` as 'onboarding.opts.emp.s'),
          }))}
          {...form.register('employeesRange')}
        />
        <Select
          id="ob-vol"
          label={t('onboarding.volume')}
          hint={t('onboarding.volumeHint')}
          options={['a', 'b', 'c', 'd'].map((v) => ({
            value: v,
            label: t(`onboarding.opts.vol.${v}` as 'onboarding.opts.vol.a'),
          }))}
          {...form.register('invoiceVolume')}
        />
      </div>
    </form>
  );
}
