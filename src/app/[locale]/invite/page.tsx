import { Suspense } from 'react';
import { Logo, Card } from '@/components/zw';
import { getTranslations } from 'next-intl/server';
import { AcceptInviteClient } from '@/components/invites/AcceptInviteClient';

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const t = await getTranslations();
  if (!token) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
        <Logo variant="full" size={30} />
        <div className="w-full max-w-md">
          <Card title={t('invites.acceptTitle')} description={t('invites.errors.invalid')} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo variant="full" size={30} />
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <AcceptInviteClient token={token} />
        </Suspense>
      </div>
    </div>
  );
}
