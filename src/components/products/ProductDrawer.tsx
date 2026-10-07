'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Alert, Badge, Button, Drawer, Icon, Input, SegmentedControl, Select, Switch, Textarea } from '@/components/zw';
import { productSchema } from '@/lib/validation/product';
import { createProduct, updateProduct, setStock } from '@/server/actions/product.actions';
import type { CategoryOpt } from './ProductsTable';

type Form = z.input<typeof productSchema>;

export interface ProductEditData extends Form {
  id: string;
  stock: number | null;
}

const TYPES = ['product', 'service', 'bundle', 'variant'] as const;

export function ProductDrawer({
  open,
  initial,
  categories,
  onClose,
}: {
  open: boolean;
  initial: ProductEditData | null;
  categories: CategoryOpt[];
  onClose: (saved: boolean) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(productSchema),
    defaultValues: blank(),
  });
  const sell = Number(form.watch('sellingPrice') ?? 0);
  const buy = Number(form.watch('purchasePrice') ?? 0) || 0;
  const margin = sell - buy;
  const marginPct = sell > 0 ? (margin / sell) * 100 : 0;

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    if (!initial) {
      form.reset(blank());
      return;
    }
    const { id: _id, stock: _stock, ...rest } = initial;
    void _id;
    void _stock;
    form.reset({ ...blank(), ...rest });
  }, [open, initial, form]);

  function blank(): Form {
    return {
      type: 'product', sku: '', barcode: '', nameAr: '', nameEn: '', description: '', categoryId: null,
      unit: 'pcs', purchasePrice: null, sellingPrice: 0, vatCategory: 'STANDARD', vatRate: 15,
      trackStock: true, minStock: 0, isActive: true,
    };
  }

  async function onSubmit(v: Form) {
    setPending(true);
    setError(null);
    const res = initial ? await updateProduct({ ...v, id: initial.id }) : await createProduct(v);
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
      title={initial ? t('products.edit') : t('products.new')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onClose(false)}>
            {t('products.editor.cancel')}
          </Button>
          <Button type="submit" form="product-form" iconStart="check" loading={pending}>
            {t('products.editor.save')}
          </Button>
        </div>
      }
    >
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {error ? <Alert tone="danger">{t(error as 'products.errors.skuTaken')}</Alert> : null}
        <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4">
          <span className="text-sm text-fg-muted">{t('products.editor.image')}</span>
          <span className="text-xs text-fg-muted">{t('products.editor.imageHint')}</span>
          {initial && initial.stock !== null && initial.stock < 5 ? (
            <Badge tone="warning">{t('products.filters.lowStock')}</Badge>
          ) : null}
        </div>
        <SegmentedControl
          label={t('products.cols.type')}
          options={TYPES.map((v) => ({ value: v, label: t(`products.type.${v}` as 'products.type.product') }))}
          value={form.watch('type')}
          onChange={(v) => form.setValue('type', v as Form['type'])}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input id="p-sku" dir="ltr" mono label={t('products.editor.sku')} required error={form.formState.errors.sku ? t('validation.required') : undefined} {...form.register('sku')} />
          <Input id="p-barcode" dir="ltr" mono label={t('products.editor.barcode')} {...form.register('barcode')} />
          <Input id="p-nameEn" dir="ltr" label={t('products.editor.nameEn')} required error={form.formState.errors.nameEn ? t('validation.required') : undefined} {...form.register('nameEn')} />
          <Input id="p-nameAr" label={t('products.editor.nameAr')} required error={form.formState.errors.nameAr ? t('validation.required') : undefined} {...form.register('nameAr')} />
        </div>
        <Textarea id="p-desc" label={t('products.editor.description')} rows={2} {...form.register('description')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            id="p-cat"
            label={t('products.editor.category')}
            options={[{ value: '', label: t('products.editor.noCategory') }, ...categories.map((c) => ({ value: c.id, label: locale === 'ar' ? c.nameAr : c.nameEn }))]}
            value={form.watch('categoryId') ?? ''}
            onChange={(e) => form.setValue('categoryId', (e.target as HTMLSelectElement).value || null)}
          />
          <Input id="p-unit" dir="ltr" label={t('products.editor.unit')} {...form.register('unit')} />
          <Input id="p-buy" dir="ltr" mono inputMode="decimal" label={t('products.editor.purchasePrice')} suffix={<span>SAR</span>} {...form.register('purchasePrice')} />
          <Input id="p-sell" dir="ltr" mono inputMode="decimal" label={t('products.editor.sellingPrice')} suffix={<span>SAR</span>} error={form.formState.errors.sellingPrice ? t('validation.required') : undefined} {...form.register('sellingPrice')} />
          <Select
            id="p-vatcat"
            label={t('products.editor.vatCategory')}
            options={(['STANDARD', 'ZERO', 'EXEMPT', 'OUT_OF_SCOPE'] as const).map((v) => ({ value: v, label: t(`products.vatCat.${v}` as 'products.vatCat.STANDARD') }))}
            value={form.watch('vatCategory')}
            onChange={(e) => form.setValue('vatCategory', (e.target as HTMLSelectElement).value as Form['vatCategory'])}
          />
          <Input id="p-vatrate" dir="ltr" mono inputMode="decimal" label={t('products.editor.vatRate')} suffix={<span>%</span>} {...form.register('vatRate')} />
          <StockField productId={initial?.id ?? null} initial={initial?.stock ?? null} />
          <Input id="p-min" dir="ltr" mono inputMode="numeric" label={t('products.editor.minStock')} suffix={<span>{form.watch('unit') || 'pcs'}</span>} {...form.register('minStock')} />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-sunken px-4 py-3 text-sm">
          <span className="text-fg-muted">{t('products.editor.margin')}</span>
          <span className="zw-tnum font-semibold" dir="ltr">
            SAR {margin.toFixed(2)} · {marginPct.toFixed(1)}%
          </span>
        </div>
        <Switch label={t('products.editor.active')} description={t('products.editor.activeHint')} checked={!!form.watch('isActive')} onChange={(e) => form.setValue('isActive', (e.target as HTMLInputElement).checked)} />
      </form>
    </Drawer>
  );
}

function StockField({ productId, initial }: { productId: string | null; initial: number | null }) {
  const t = useTranslations();
  const [qty, setQty] = React.useState(initial === null ? '' : String(initial));
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    setQty(initial === null ? '' : String(initial));
    setDone(false);
  }, [initial, productId]);
  if (productId === null) {
    return (
      <Input id="p-stock-new" dir="ltr" mono inputMode="numeric" label={t('products.editor.inStock')} hint={t('products.editor.warehouse')} value="" disabled />
    );
  }
  return (
    <Input
      id="p-stock"
      dir="ltr"
      mono
      inputMode="numeric"
      label={t('products.editor.inStock')}
      hint={t('products.editor.warehouse')}
      value={qty}
      onChange={(e) => {
        setQty(e.target.value.replace(/[^0-9.]/g, ''));
        setDone(false);
      }}
      trailing={
        <Button
          size="sm"
          loading={busy}
          onClick={async () => {
            const n = Number(qty);
            if (!Number.isFinite(n)) return;
            setBusy(true);
            const res = await setStock({ productId, quantity: n });
            setBusy(false);
            if (res.ok) setDone(true);
          }}
        >
          {done ? <Icon name="check" size={14} /> : t('zw.save')}
        </Button>
      }
    />
  );
}
