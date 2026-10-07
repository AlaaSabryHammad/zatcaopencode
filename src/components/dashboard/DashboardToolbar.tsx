'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, DatePicker } from '@/components/zw';
import type { DashboardPeriod } from '@/server/modules/dashboard/queries';

const PERIODS: DashboardPeriod[] = ['today', 'week', 'month', 'quarter', 'year', 'custom'];

export function DashboardToolbar({
  period,
  from,
  to,
  csv,
  filename,
}: {
  period: DashboardPeriod;
  from?: string;
  to?: string;
  csv: string;
  filename: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const sp = useSearchParams();
  const [custom, setCustom] = React.useState(false);
  const [f, setF] = React.useState(from ?? '');
  const [tt, setTt] = React.useState(to ?? '');

  function go(p: DashboardPeriod, extra?: { from?: string; to?: string }) {
    const q = new URLSearchParams(sp.toString());
    q.set('period', p);
    if (extra?.from) q.set('from', extra.from);
    else q.delete('from');
    if (extra?.to) q.set('to', extra.to);
    else q.delete('to');
    router.push(`?${q.toString()}`);
  }

  function download() {
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1" role="group" aria-label={t('dashboard.periods.month')}>
        {PERIODS.filter((p) => p !== 'custom').map((p) => (
          <Button
            key={p}
            size="sm"
            variant={period === p && !custom ? 'secondary' : 'ghost'}
            onClick={() => {
              setCustom(false);
              go(p);
            }}
          >
            {t(`dashboard.periods.${p}` as 'dashboard.periods.today')}
          </Button>
        ))}
        <Button size="sm" variant={custom ? 'secondary' : 'ghost'} onClick={() => setCustom((v) => !v)}>
          {t('dashboard.periods.custom')}
        </Button>
      </div>
      {custom ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go('custom', { from: f || undefined, to: tt || undefined });
          }}
        >
          <DatePicker label={t('dashboard.periods.from')} value={f} onChange={setF} />
          <DatePicker label={t('dashboard.periods.to')} value={tt} onChange={setTt} />
          <Button size="sm" type="submit">
            {t('dashboard.periods.apply')}
          </Button>
        </form>
      ) : null}
      <span className="flex-1" />
      <Button size="sm" variant="secondary" iconStart="download" onClick={download}>
        {t('dashboard.export')}
      </Button>
    </div>
  );
}
