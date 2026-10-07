'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Alert, Button, Progress } from '@/components/zw';
import { resendVerificationEmail } from '@/server/actions/onboarding.actions';

export function SetupBanner({
  emailVerified,
  userEmail,
  memberCount,
}: {
  emailVerified: boolean;
  userEmail: string;
  memberCount: number;
}) {
  const t = useTranslations();
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const pending: Array<{ key: string; done: boolean }> = [
    { key: 'email', done: emailVerified },
    { key: 'invite', done: memberCount > 1 },
  ];
  const done = pending.filter((p) => p.done).length;
  if (done === pending.length) return null;

  async function resend() {
    setBusy(true);
    await resendVerificationEmail();
    setBusy(false);
    setSent(true);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-semibold">
          {t('dashboard.setupTitle')} {t('dashboard.ofComplete', { a: done + 6, b: 8 })}
        </span>
        <Progress value={((done + 6) / 8) * 100} />
        {sent ? <Alert tone="success">{t('onboarding.emailSent')}</Alert> : null}
      </div>
      <div className="flex flex-none flex-wrap gap-2">
        {!emailVerified ? (
          <Button size="sm" variant="secondary" loading={busy} onClick={resend} title={userEmail}>
            {t('dashboard.verifyEmailCta')}
          </Button>
        ) : null}
        <Link href="/settings/users">
          <Button size="sm" variant="secondary" iconStart="user-plus">
            {t('dashboard.inviteCta')}
          </Button>
        </Link>
        <Button size="sm" variant="secondary" iconStart="plug" disabled title={t('onboarding.soon')}>
          {t('dashboard.deviceCta')}
        </Button>
      </div>
    </div>
  );
}
