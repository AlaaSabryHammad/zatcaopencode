'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Amount, InvoiceStatus, Table } from '@/components/zw';

export interface MiniRow {
  id: string;
  number: string | null;
  issue: string;
  due: string | null;
  status: string;
  total: number;
}

export function InvoicesMiniClient({ rows }: { rows: MiniRow[] }) {
  const t = useTranslations();
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  return (
    <Table
      columns={[
        { key: 'number', header: t('customers.profile.colInvoice') },
        { key: 'issue', header: t('customers.profile.colIssued') },
        { key: 'due', header: t('customers.profile.colDue') },
        { key: 'status', header: t('customers.profile.colStatus') },
        { key: 'total', header: t('customers.profile.colTotal') },
      ]}
      rows={rows.map((r) => {
        const overdue = r.due != null && r.due < today && r.total > 0 && r.status !== 'paid' && r.status !== 'credited';
        return {
          id: r.id,
          number: (
            <span className="zw-mono" dir="ltr">
              {r.number ?? '—'}
            </span>
          ),
          issue: (
            <span dir="ltr" className="zw-tnum">
              {r.issue}
            </span>
          ),
          due: r.due ? (
            <span dir="ltr" className="zw-tnum">
              {r.due}
            </span>
          ) : (
            '—'
          ),
          status: <InvoiceStatus size="sm" status={(overdue ? 'overdue' : r.status) as 'draft'} />,
          total: <Amount value={r.total} size="sm" />,
        };
      })}
    />
  );
}
