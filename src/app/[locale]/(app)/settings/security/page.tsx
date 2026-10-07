import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { listActiveSessions } from '@/server/services/session.service';
import { ChangePasswordForm } from '@/components/security/ChangePasswordForm';
import { TotpManager } from '@/components/security/TotpManager';
import { SessionsManager } from '@/components/security/SessionsManager';
import type { SessionInfo } from '@/server/actions/security.actions';

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding/create-org`);

  const sessions = await listActiveSessions(ctx.user.id);
  const initial: SessionInfo[] = sessions.map((s) => ({
    id: s.id,
    ip: s.ip,
    userAgent: s.userAgent,
    lastSeenAt: s.lastSeenAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    remember: s.remember,
    current: s.id === ctx.user.sessionId,
  }));

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <h1 className="text-h1">{t('security.title')}</h1>
      <ChangePasswordForm />
      <TotpManager enabled={ctx.user.twoFactorEnabled} />
      <SessionsManager initial={initial} />
    </div>
  );
}
