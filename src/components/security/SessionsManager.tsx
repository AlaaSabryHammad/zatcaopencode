'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Badge, Button, Card } from '@/components/zw';
import { revokeOtherSession, type SessionInfo } from '@/server/actions/security.actions';

function deviceLabel(ua: string | null, t: ReturnType<typeof useTranslations>): string {
  if (!ua) return t('security.unknownDevice');
  const m = ua.match(/(Windows|Macintosh|Linux|Android|iPhone|iPad)[^;)]*/);
  const b = ua.match(/(Chrome|Firefox|Safari|Edg|OPR)\/(\d+)/);
  const os = m ? m[0].slice(0, 40) : t('security.unknownDevice');
  return b ? `${os} · ${b[1]} ${b[2]}` : os;
}

export function SessionsManager({ initial }: { initial: SessionInfo[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [sessions, setSessions] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function revoke(id: string) {
    setBusy(id);
    const res = await revokeOtherSession({ sessionId: id });
    setBusy(null);
    if (res.ok) setSessions((s) => s.filter((x) => x.id !== id));
  }

  return (
    <Card title={t('security.sessionsTitle')} description={t('security.sessionsDesc')}>
      <div className="flex flex-col gap-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle p-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{deviceLabel(s.userAgent, t)}</span>
                {s.current ? <Badge tone="brand">{t('security.current')}</Badge> : null}
              </div>
              <span className="text-sm text-fg-muted" dir="ltr">
                {s.ip ?? '–'}
              </span>
              <span className="text-sm text-fg-muted">
                {t('security.lastSeen')}:{' '}
                {formatDistanceToNow(new Date(s.lastSeenAt), {
                  addSuffix: true,
                  locale: locale === 'ar' ? arSA : enUS,
                })}
              </span>
            </div>
            {!s.current ? (
              <Button size="sm" variant="danger-ghost" loading={busy === s.id} onClick={() => revoke(s.id)}>
                {t('security.revoke')}
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
