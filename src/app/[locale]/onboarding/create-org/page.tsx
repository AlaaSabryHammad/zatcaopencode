import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentMemberships } from '@/server/auth/current-user';
import { CreateOrgForm } from '@/components/onboarding/CreateOrgForm';
import { Logo } from '@/components/zw';

export default async function CreateOrgPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user || user.mfaPending) redirect(`/${locale}/auth/login`);
  const ms = await getCurrentMemberships();
  if (ms.length > 0) redirect(`/${locale}/`);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo variant="full" size={30} />
      <div className="w-full max-w-2xl">
        <CreateOrgForm />
      </div>
    </div>
  );
}
