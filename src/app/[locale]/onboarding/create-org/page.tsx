import { redirect } from 'next/navigation';

export default async function CreateOrgCompat({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/onboarding`);
}
