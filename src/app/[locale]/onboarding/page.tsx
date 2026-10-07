import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentMemberships, getActiveOrgId } from '@/server/auth/current-user';
import { withRls } from '@/server/db';
import { OnboardingWizard, type OnboardingInitial } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user || user.mfaPending) redirect(`/${locale}/auth/login`);

  const memberships = await getCurrentMemberships();
  const activeId = await getActiveOrgId();
  const m = memberships.find((x) => x.organizationId === activeId) ?? memberships[0] ?? null;
  if (m?.organization.onboardingCompletedAt) redirect(`/${locale}/`);

  let org: OnboardingInitial['org'] = null;
  let step = 0;
  if (m) {
    const rls = { orgId: m.organizationId, userId: user.id, userEmail: user.email };
    const [row, address, seqs] = await withRls(rls, (tx) =>
      Promise.all([
        tx.organization.findUnique({ where: { id: m.organizationId } }),
        tx.organizationAddress.findUnique({ where: { organizationId: m.organizationId } }),
        tx.invoiceSequence.findMany({
          where: { organizationId: m.organizationId, branchId: null, documentType: 'TAX' },
          orderBy: { year: 'desc' },
          take: 1,
        }),
      ]),
    );
    if (row?.onboardingCompletedAt) redirect(`/${locale}/`);
    step = Math.min(Math.max(row?.onboardingStep ?? 0, 0), 5);
    if (row) {
      const seq = seqs[0];
      org = {
        id: row.id,
        nameAr: row.nameAr,
        business: {
          nameAr: row.nameAr,
          nameEn: row.nameEn,
          legalName: row.legalName,
          crNumber: row.crNumber,
          vatNumber: row.vatNumber,
          tin: row.tin,
          businessType: row.businessType,
          industry: row.industry,
          employeesRange: row.employeesRange,
          invoiceVolume: row.invoiceVolume,
        },
        address: address
          ? {
              country: address.country,
              city: address.city,
              district: address.district,
              street: address.street,
              buildingNo: address.buildingNo,
              postalCode: address.postalCode,
              additionalNo: address.additionalNo,
              shortAddress: address.shortAddress,
            }
          : null,
        brandColor: row.brandColor,
        invoiceTemplate: row.invoiceTemplate,
        vatStatus: row.vatStatus,
        currency: row.currency,
        fiscalYearStartMonth: row.fiscalYearStartMonth,
        seqPrefix: seq?.prefix ?? null,
        seqStart: seq?.nextValue ?? null,
      };
    }
  }

  const initial: OnboardingInitial = {
    user: {
      name: user.name,
      email: user.email,
      emailVerified: !!user.emailVerifiedAt,
      phone: user.phone,
      phoneVerified: !!user.phoneVerifiedAt,
    },
    org,
    step,
  };
  return <OnboardingWizard initial={initial} />;
}
