import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentMemberships, getActiveOrgId } from '@/server/auth/current-user';
import { withRls } from '@/server/db';
import { AppShellClient } from '@/components/app/AppShellClient';
import type { Org } from '@/components/zw';

/** Guards every /(app) route and provides the app shell (sidebar, topbar, org switcher). */
export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user || user.mfaPending) redirect(`/${locale}/auth/login`);
  const ms = await getCurrentMemberships();
  if (ms.length === 0) redirect(`/${locale}/onboarding`);
  const activeId = await getActiveOrgId();
  const active = ms.find((x) => x.organizationId === activeId) ?? ms[0];
  if (!active) redirect(`/${locale}/onboarding`);
  if (!active.organization.onboardingCompletedAt) redirect(`/${locale}/onboarding`);

  const rls = { orgId: active.organizationId, userId: user.id, userEmail: user.email };
  const overdueCount = await withRls(rls, (tx) =>
    tx.invoice.count({
      where: {
        organizationId: active.organizationId,
        status: { in: ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] },
        balanceDue: { gt: 0 },
        dueDate: { lt: new Date() },
      },
    }),
  );

  const orgs: Org[] = ms.map((m) => ({
    id: m.organizationId,
    name: locale === 'ar' ? m.organization.nameAr : (m.organization.nameEn ?? m.organization.nameAr),
    role: locale === 'ar' ? m.role.nameAr : m.role.nameEn,
  }));

  return (
    <AppShellClient
      userName={user.name}
      orgs={orgs}
      currentOrgId={active.organizationId}
      notifCount={overdueCount}
    >
      {children}
    </AppShellClient>
  );
}
