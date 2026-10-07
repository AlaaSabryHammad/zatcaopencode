'use client';

import { useLocale } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Icon } from '@/components/zw';
import type { DashboardData } from '@/server/modules/dashboard/queries';

const KIND_ICON = { payment: 'banknote', invoice: 'receipt', expense: 'wallet' } as const;
const KIND_TONE = { payment: 'success', invoice: 'info', expense: 'brand' } as const;

export function DashboardActivity({ items }: { items: DashboardData['activity'] }) {
  const locale = useLocale();
  return (
    <div className="flex flex-col">
      {items.map((a) => (
        <div key={a.id} className="flex items-start gap-3 border-b border-border-subtle py-3 last:border-0">
          <span className={`zw-tl-marker zw-tl--${KIND_TONE[a.kind]}`}>
            <Icon name={KIND_ICON[a.kind]} size={14} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{a.title}</span>
            <span className="truncate text-sm text-fg-muted">{a.detail}</span>
          </div>
          <span className="flex-none text-xs text-fg-muted">
            {formatDistanceToNow(new Date(a.at), { addSuffix: true, locale: locale === 'ar' ? arSA : enUS })}
          </span>
        </div>
      ))}
    </div>
  );
}
