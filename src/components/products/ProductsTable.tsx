'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { Amount, Badge, Input, Select, FilterChip } from '@/components/zw';
import { ServerTable } from '@/components/data/ServerTable';
import { useListQuery, useDebounced } from '@/components/data/use-list-query';
import type { ProductRow } from '@/server/modules/products/queries';

export interface CategoryOpt {
  id: string;
  nameAr: string;
  nameEn: string;
}

const TABS = ['all', 'product', 'service', 'bundle', 'variant'] as const;

export function ProductsTable({
  rows,
  total,
  counts,
  categories,
}: {
  rows: ProductRow[];
  total: number;
  counts: Record<string, number>;
  categories: CategoryOpt[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { params, set } = useListQuery({ sort: 'name', dir: 'asc' });
  const [q, setQ] = React.useState(params.q ?? '');
  const dq = useDebounced(q);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    set({ q: dq || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const sortKey = params.sort ?? 'name';
  const sortDir = params.dir === 'desc' ? 'desc' : 'asc';

  return (
    <div className="flex flex-col gap-4">
      <div className="zw-tabs zw-tabs--line">
        <div className="zw-tablist" role="tablist" aria-label={t('products.title')}>
          {TABS.map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={(params.tab ?? 'all') === id}
              onClick={() => set({ tab: id === 'all' ? null : id })}
              className={`zw-tab${(params.tab ?? 'all') === id ? ' is-active' : ''}`}
            >
              {t(`products.tabs.${id}` as 'products.tabs.all')} <span className="zw-tab-count zw-tnum">{counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-60 flex-1">
          <Input
            id="prod-q"
            iconStart="search"
            placeholder={t('products.filters.search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {categories.length > 0 ? (
          <Select
            id="prod-cat"
            aria-label={t('products.filters.category')}
            options={[{ value: '', label: t('products.filters.allCategories') }, ...categories.map((c) => ({ value: c.id, label: locale === 'ar' ? c.nameAr : c.nameEn }))]}
            value={params.category ?? ''}
            onChange={(e) => set({ category: (e.target as HTMLSelectElement).value || null })}
          />
        ) : null}
        <Select
          id="prod-vat"
          aria-label={t('products.filters.vat')}
          options={[
            { value: '', label: t('products.filters.vat') },
            { value: 'STANDARD', label: t('products.vatCat.STANDARD') },
            { value: 'ZERO', label: t('products.vatCat.ZERO') },
            { value: 'EXEMPT', label: t('products.vatCat.EXEMPT') },
            { value: 'OUT_OF_SCOPE', label: t('products.vatCat.OUT_OF_SCOPE') },
          ]}
          value={params.vat ?? ''}
          onChange={(e) => set({ vat: (e.target as HTMLSelectElement).value || null })}
        />
        <FilterChip
          label={t('products.filters.stock')}
          value={params.low ? t('products.filters.lowStock') : undefined}
          active={!!params.low}
          onRemove={() => set({ low: null })}
          onClick={() => set({ low: params.low ? null : '1' })}
        />
      </div>

      <ServerTable<ProductRow>
        columns={[
          {
            key: 'name',
            header: t('products.cols.item'),
            sortable: true,
            cell: (r) => (
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{locale === 'ar' ? r.nameAr : (r.nameEn ?? r.nameAr)}</span>
                <span className="truncate text-xs text-fg-muted" dir="ltr">
                  {locale === 'ar' ? (r.nameEn ?? r.sku) : r.nameAr} · {r.sku}
                </span>
              </span>
            ),
          },
          {
            key: 'type',
            header: t('products.cols.type'),
            cell: (r) => <Badge tone="neutral">{t(`products.type.${r.type}` as 'products.type.product')}</Badge>,
          },
          { key: 'category', header: t('products.cols.category'), cell: (r) => r.category ?? '—' },
          {
            key: 'vat',
            header: t('products.cols.vat'),
            cell: (r) => <Badge tone={r.vatCategory === 'STANDARD' ? 'neutral' : 'accent'}>{t(`products.vatCat.${r.vatCategory}` as 'products.vatCat.STANDARD')}</Badge>,
          },
          {
            key: 'cost',
            header: t('products.cols.cost'),
            numeric: true,
            align: 'end',
            cell: (r) => (r.purchasePrice === null ? <span className="text-fg-muted">—</span> : <Amount value={r.purchasePrice} size="sm" />),
          },
          {
            key: 'price',
            header: t('products.cols.price'),
            sortable: true,
            numeric: true,
            align: 'end',
            cell: (r) => <Amount value={r.sellingPrice} size="sm" />,
          },
          {
            key: 'stock',
            header: t('products.cols.stock'),
            sortable: true,
            numeric: true,
            align: 'end',
            cell: (r) =>
              r.stock === null ? (
                <span className="text-fg-muted">—</span>
              ) : (
                <span className="zw-tnum" style={{ color: r.low ? 'var(--danger-fg)' : undefined }}>
                  {r.stock} / {r.minStock}
                </span>
              ),
          },
        ]}
        rows={rows}
        getRowId={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key) => {
          if (key === sortKey) set({ dir: sortDir === 'asc' ? 'desc' : 'asc' });
          else set({ sort: key, dir: 'asc' });
        }}
        onRowClick={(r) => {
          const q = new URLSearchParams(search.toString());
          q.set('edit', r.id);
          router.push(`${pathname}?${q.toString()}`, { scroll: false });
        }}
        page={page}
        pageCount={pageCount}
        total={total}
        pageSize={pageSize}
        onPageChange={(p) => set({ page: String(p) }, { resetPage: true })}
        emptyTitle={t('dashboard.noData')}
      />
    </div>
  );
}
