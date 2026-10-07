'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Amount, Avatar, Badge, Input, Select, FilterChip } from '@/components/zw';
import { ServerTable } from '@/components/data/ServerTable';
import { useListQuery, useDebounced } from '@/components/data/use-list-query';
import type { CustomerRow } from '@/server/modules/customers/queries';

export function CustomersTable({
  rows,
  total,
  counts,
  cities,
}: {
  rows: CustomerRow[];
  total: number;
  counts: { all: number; companies: number; individuals: number; balance: number };
  cities: string[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
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

  function setTab(next: string) {
    set({ tab: next === 'all' ? null : next, type: null });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="zw-tabs zw-tabs--line">
        <div className="zw-tablist" role="tablist" aria-label={t('customers.title')}>
          {(
            [
              { id: 'all', label: t('customers.tabs.all'), n: counts.all },
              { id: 'companies', label: t('customers.tabs.companies'), n: counts.companies },
              { id: 'individuals', label: t('customers.tabs.individuals'), n: counts.individuals },
              { id: 'balance', label: t('customers.tabs.balance'), n: counts.balance },
            ] as const
          ).map((tb) => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={(params.tab ?? 'all') === tb.id}
              onClick={() => setTab(tb.id)}
              className={`zw-tab${(params.tab ?? 'all') === tb.id ? ' is-active' : ''}`}
            >
              {tb.label} <span className="zw-tab-count zw-tnum">{tb.n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-60 flex-1">
          <Input
            id="cust-q"
            iconStart="search"
            placeholder={t('customers.filters.search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {cities.length > 0 ? (
          <Select
            id="cust-city"
            aria-label={t('customers.filters.city')}
            options={[{ value: '', label: t('customers.filters.allCities') }, ...cities.map((c) => ({ value: c, label: c }))]}
            value={params.city ?? ''}
            onChange={(e) => set({ city: (e.target as HTMLSelectElement).value || null })}
          />
        ) : null}
        <FilterChip
          label={t('customers.filters.balance')}
          value={params.balance ? t('customers.filters.withBalance') : undefined}
          active={!!params.balance}
          onRemove={() => set({ balance: null })}
          onClick={() => set({ balance: params.balance ? null : '1' })}
        />
      </div>

      <ServerTable<CustomerRow>
        columns={[
          {
            key: 'name',
            header: t('customers.cols.customer'),
            sortable: true,
            cell: (r) => (
              <span className="flex items-center gap-2.5">
                <Avatar name={locale === 'ar' ? r.nameAr : (r.nameEn ?? r.nameAr)} size="sm" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{locale === 'ar' ? r.nameAr : (r.nameEn ?? r.nameAr)}</span>
                  <span className="truncate text-xs text-fg-muted">
                    {t(`customers.type.${r.type}` as 'customers.type.company')} · {r.nameAr}
                  </span>
                </span>
              </span>
            ),
          },
          {
            key: 'vat',
            header: t('customers.cols.vat'),
            cell: (r) =>
              r.vatNumber ? (
                <span className="zw-mono" dir="ltr">
                  {r.vatNumber}
                </span>
              ) : (
                <span className="text-fg-muted">—</span>
              ),
          },
          { key: 'city', header: t('customers.cols.city'), sortable: true, cell: (r) => r.city ?? '—' },
          {
            key: 'tags',
            header: t('customers.cols.tags'),
            cell: (r) => (
              <span className="flex flex-wrap gap-1">
                {r.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} tone={tag === 'Key account' ? 'accent' : 'neutral'}>
                    {tag}
                  </Badge>
                ))}
                {r.paymentTermsDays > 0 ? (
                  <Badge tone="neutral">
                    <span dir="ltr">Net {r.paymentTermsDays}</span>
                  </Badge>
                ) : null}
              </span>
            ),
          },
          {
            key: 'outstanding',
            header: t('customers.cols.outstanding'),
            sortable: true,
            numeric: true,
            align: 'end',
            cell: (r) => <Amount value={r.outstanding} size="sm" tone={r.outstanding > 0 ? undefined : 'muted'} />,
          },
          {
            key: 'sales',
            header: t('customers.cols.sales12'),
            sortable: true,
            numeric: true,
            align: 'end',
            cell: (r) => <Amount value={r.sales12mo} size="sm" />,
          },
          {
            key: 'avgPay',
            header: t('customers.cols.avgPay'),
            sortable: true,
            numeric: true,
            align: 'end',
            cell: (r) => (r.avgPayDays === null ? <span className="text-fg-muted">—</span> : <span className="zw-tnum">{r.avgPayDays} {t('customers.cols.days')}</span>),
          },
          {
            key: 'last',
            header: t('customers.cols.last'),
            sortable: true,
            align: 'end',
            cell: (r) =>
              r.lastActivity ? (
                <span className="text-fg-muted">
                  {formatDistanceToNow(new Date(r.lastActivity), { addSuffix: false, locale: locale === 'ar' ? arSA : enUS })}
                </span>
              ) : (
                <span className="text-fg-muted">—</span>
              ),
          },
        ]}
        rows={rows}
        getRowId={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key) => {
          if (key === sortKey) set({ dir: sortDir === 'asc' ? 'desc' : 'asc' });
          else set({ sort: key, dir: key === 'name' ? 'asc' : 'desc' });
        }}
        onRowClick={(r) => router.push(`/customers/${r.id}`)}
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
