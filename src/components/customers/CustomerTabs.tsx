'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

const TABS = ['overview', 'invoices', 'payments', 'creditNotes', 'documents', 'notes'] as const;

export function CustomerTabs({
  overview,
  invoices,
  payments,
  creditNotes,
  documents,
  notes,
  counts,
}: {
  overview: React.ReactNode;
  invoices: React.ReactNode;
  payments: React.ReactNode;
  creditNotes: React.ReactNode;
  documents: React.ReactNode;
  notes: React.ReactNode;
  counts: { invoices: number; payments: number; creditNotes: number };
}) {
  const t = useTranslations();
  const [tab, setTab] = React.useState<(typeof TABS)[number]>('overview');
  const bodies: Record<(typeof TABS)[number], React.ReactNode> = { overview, invoices, payments, creditNotes, documents, notes };
  const count = (k: (typeof TABS)[number]) =>
    k === 'invoices' ? counts.invoices : k === 'payments' ? counts.payments : k === 'creditNotes' ? counts.creditNotes : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="zw-tabs zw-tabs--line">
        <div className="zw-tablist" role="tablist">
          {TABS.map((k) => {
            const n = count(k);
            return (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`zw-tab${tab === k ? ' is-active' : ''}`}
              >
                {t(`customers.profile.tabs.${k}` as 'customers.profile.tabs.overview')}
                {n !== null ? <span className="zw-tab-count zw-tnum">{n}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div role="tabpanel">{bodies[tab]}</div>
    </div>
  );
}
