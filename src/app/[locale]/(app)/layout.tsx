import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentMemberships } from '@/server/auth/current-user';

/** Guards every /(app) route: signed in (MFA complete) + belongs to an organization. */
export default async function AppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user || user.mfaPending) redirect(`/${locale}/auth/login`);
  const ms = await getCurrentMemberships();
  if (ms.length === 0) redirect(`/${locale}/onboarding/create-org`);
  return <>{children}</>;
}
