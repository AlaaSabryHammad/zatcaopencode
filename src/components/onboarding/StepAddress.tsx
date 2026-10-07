'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Alert, Icon, Input, Select } from '@/components/zw';
import { saveAddress } from '@/server/actions/onboarding.actions';
import type { AddressData } from './OnboardingWizard';

const schema = z.object({
  country: z.string().default('SA'),
  city: z.string().min(1, 'validation.required'),
  district: z.string().max(80).optional(),
  street: z.string().max(120).optional(),
  buildingNo: z.string().regex(/^\d{4}$/, 'validation.invalid').optional().or(z.literal('')),
  postalCode: z.string().regex(/^\d{5}$/, 'validation.invalid').optional().or(z.literal('')),
  additionalNo: z.string().regex(/^\d{4}$/, 'validation.invalid').optional().or(z.literal('')),
  shortAddress: z.string().max(20).optional(),
});

type Form = z.input<typeof schema>;

const CITIES = ['riyadh', 'jeddah', 'dammam', 'khobar', 'makkah', 'madinah', 'other'];

export function StepAddress({ initial, onNext }: { initial: AddressData | null; onNext: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: initial?.country ?? 'SA',
      city: initial?.city ?? 'riyadh',
      district: initial?.district ?? '',
      street: initial?.street ?? '',
      buildingNo: initial?.buildingNo ?? '',
      postalCode: initial?.postalCode ?? '',
      additionalNo: initial?.additionalNo ?? '',
      shortAddress: initial?.shortAddress ?? '',
    },
  });
  const w = form.watch();

  const cityLabel = (v: string) =>
    v === 'other' || !CITIES.includes(v) ? v : t(`onboarding.opts.cities.${v}` as 'onboarding.opts.cities.riyadh');
  const enLine = [w.buildingNo, w.street, w.district, w.city ? cityLabel(w.city) : '', w.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <form
      id="ob-form"
      onSubmit={form.handleSubmit(async (v) => {
        setError(null);
        const res = await saveAddress({
          ...v,
          district: v.district || null,
          street: v.street || null,
          buildingNo: v.buildingNo || null,
          postalCode: v.postalCode || null,
          additionalNo: v.additionalNo || null,
          shortAddress: v.shortAddress || null,
        });
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
        <h1 className="text-h1">{t('onboarding.s3Title')}</h1>
        <p className="text-fg-muted">{t('onboarding.s3Desc')}</p>
      </div>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          id="ob-country"
          label={t('onboarding.country')}
          options={[{ value: 'SA', label: locale === 'ar' ? 'السعودية' : 'Saudi Arabia' }]}
          {...form.register('country')}
        />
        <Select
          id="ob-city"
          label={t('onboarding.city')}
          options={CITIES.map((v) => ({
            value: v,
            label: t(`onboarding.opts.cities.${v}` as 'onboarding.opts.cities.riyadh'),
          }))}
          {...form.register('city')}
        />
        <Input id="ob-district" label={t('onboarding.district')} {...form.register('district')} />
        <Input id="ob-street" label={t('onboarding.street')} {...form.register('street')} />
        <Input
          id="ob-bno"
          dir="ltr"
          mono
          inputMode="numeric"
          maxLength={4}
          hint={t('onboarding.digits4')}
          label={t('onboarding.buildingNo')}
          error={form.formState.errors.buildingNo ? t('validation.invalid') : undefined}
          {...form.register('buildingNo')}
        />
        <Input
          id="ob-postal"
          dir="ltr"
          mono
          inputMode="numeric"
          maxLength={5}
          hint={t('onboarding.digits5')}
          label={t('onboarding.postalCode')}
          error={form.formState.errors.postalCode ? t('validation.invalid') : undefined}
          {...form.register('postalCode')}
        />
        <Input
          id="ob-addno"
          dir="ltr"
          mono
          inputMode="numeric"
          maxLength={4}
          hint={t('onboarding.digits4')}
          label={t('onboarding.additionalNo')}
          error={form.formState.errors.additionalNo ? t('validation.invalid') : undefined}
          {...form.register('additionalNo')}
        />
        <Input id="ob-short" dir="ltr" mono label={t('onboarding.shortAddress')} {...form.register('shortAddress')} />
      </div>
      <div className="flex items-start gap-4 rounded-lg border border-border-subtle bg-surface p-5">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-brand-100 text-fg-brand">
          <Icon name="building" size={20} />
        </span>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">{t('onboarding.invoicePreview')}</span>
          <span className="text-fg-secondary" dir="ltr">
            {enLine || '—'}
          </span>
        </div>
      </div>
    </form>
  );
}
