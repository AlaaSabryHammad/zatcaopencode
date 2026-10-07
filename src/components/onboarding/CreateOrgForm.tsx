'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button, Card, Input, Alert } from '@/components/zw';
import { createOrg } from '@/server/actions/org.actions';

const schema = z.object({
  nameAr: z.string().trim().min(2, 'validation.required'),
  nameEn: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  crNumber: z.string().trim().optional(),
  vatNumber: z.string().trim().optional(),
});

type Form = z.infer<typeof schema>;

export function CreateOrgForm() {
  const t = useTranslations();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr: '', nameEn: '', slug: '', crNumber: '', vatNumber: '' },
  });

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    const res = await createOrg({
      nameAr: v.nameAr,
      nameEn: v.nameEn || null,
      slug: v.slug || null,
      crNumber: v.crNumber || null,
      vatNumber: v.vatNumber || null,
    });
    setPending(false);
    if (!res.ok) {
      if (res.fieldErrors) {
        for (const [k, msg] of Object.entries(res.fieldErrors)) {
          form.setError(k as keyof Form, { message: msg });
        }
      }
      setError(res.error);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <Card title={t('onboarding.createOrg')} description={t('onboarding.createOrgSubtitle')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{t(error as 'org.errors.slugTaken')}</Alert> : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="nameAr"
            label={t('org.nameAr')}
            required
            error={form.formState.errors.nameAr ? t('validation.required') : undefined}
            {...form.register('nameAr')}
          />
          <Input id="nameEn" dir="ltr" label={t('org.nameEn')} {...form.register('nameEn')} />
          <Input id="slug" dir="ltr" placeholder="acme" label={t('org.slug')} {...form.register('slug')} />
          <Input id="crNumber" dir="ltr" inputMode="numeric" label={t('org.crNumber')} {...form.register('crNumber')} />
          <div className="md:col-span-2">
            <Input
              id="vatNumber"
              dir="ltr"
              inputMode="numeric"
              maxLength={15}
              placeholder="3XXXXXXXXXXXXX3"
              label={t('org.vatNumber')}
              {...form.register('vatNumber')}
            />
          </div>
        </div>
        <Button type="submit" fullWidth loading={pending}>
          {t('onboarding.continue')}
        </Button>
      </form>
    </Card>
  );
}
