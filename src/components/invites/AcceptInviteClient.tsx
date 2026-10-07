'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Alert, Button, Card } from '@/components/zw';
import { acceptInvite, previewInvite, type InvitePreview } from '@/server/actions/user.actions';

export function AcceptInviteClient({ token }: { token: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const fired = useRef(false);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    (async () => {
      const res = await previewInvite({ token });
      if (!res.ok || !res.data) {
        setError(res.ok ? 'invites.errors.invalid' : res.error);
        return;
      }
      setPreview(res.data);
    })();
  }, [token]);

  async function onAccept() {
    setPending(true);
    setError(null);
    const res = await acceptInvite({ token });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const name = locale === 'ar' ? res.data?.orgNameAr : (res.data?.orgNameEn ?? res.data?.orgNameAr);
    setDone(name ?? '');
    router.refresh();
  }

  if (done !== null) {
    return (
      <Card title={t('invites.acceptTitle')} description={t('invites.accepted', { org: done })}>
        <Link href="/">
          <Button fullWidth>{t('invites.goHome')}</Button>
        </Link>
      </Card>
    );
  }

  if (error) {
    const needsLogin = error === 'auth.errors.unauthorized';
    return (
      <Card title={t('invites.acceptTitle')} description={t('invites.errors.invalid')}>
        {needsLogin && preview ? (
          <div className="flex flex-col gap-4">
            <Alert tone="info">{t('invites.signInFirst', { email: preview.email })}</Alert>
            <Link href={`/auth/login?next=${encodeURIComponent(`/invite?token=${token}`)}`}>
              <Button fullWidth>{t('auth.signIn')}</Button>
            </Link>
          </div>
        ) : (
          <Alert tone="danger">{t(error as 'invites.errors.invalid')}</Alert>
        )}
      </Card>
    );
  }

  if (!preview) {
    return <Card title={t('invites.acceptTitle')} description={t('common.loading')} />;
  }

  const org = locale === 'ar' ? preview.orgNameAr : (preview.orgNameEn ?? preview.orgNameAr);
  const role = locale === 'ar' ? preview.roleNameAr : preview.roleNameEn;
  return (
    <Card title={t('invites.acceptTitle')} description={t('invites.acceptDesc', { org, role })}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-fg-muted" dir="ltr">
          {preview.email}
        </p>
        <Button fullWidth loading={pending} onClick={onAccept}>
          {t('invites.accept')}
        </Button>
      </div>
    </Card>
  );
}
