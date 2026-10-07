import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { withRls } from '@/server/db';
import { Badge, Card } from '@/components/zw';

export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding/create-org`);
  const orgId = ctx.activeMembership.organizationId;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };

  const roles = await withRls(rls, (tx) =>
    tx.role.findMany({
      where: { OR: [{ organizationId: orgId }, { organizationId: null, isSystem: true }] },
      include: { permissions: { select: { permissionKey: true } } },
      orderBy: [{ isSystem: 'desc' }, { nameAr: 'asc' }],
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <Card title={t('roles.title')} description={t('roles.description')}>
        <div className="flex flex-col gap-4">
          {roles.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-lg border border-border-subtle p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{locale === 'ar' ? r.nameAr : r.nameEn}</div>
                  <div className="text-sm text-fg-muted" dir="ltr">
                    {r.key}
                  </div>
                </div>
                {r.isSystem ? <Badge>{t('roles.system')}</Badge> : null}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((p) => (
                  <span key={p.permissionKey} dir="ltr">
                    <Badge tone="neutral">{p.permissionKey}</Badge>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
