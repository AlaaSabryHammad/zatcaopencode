import { getTranslations } from 'next-intl/server';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { redirect } from 'next/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { hasPermission } from '@/server/rbac/guard';
import { withRls } from '@/server/db';
import { Badge, Card, Table } from '@/components/zw';
import { InviteUserForm } from '@/components/invites/InviteUserForm';

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding/create-org`);
  const orgId = ctx.activeMembership.organizationId;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };

  const memberships = await withRls(rls, (tx) =>
    tx.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { name: true, email: true, phone: true, twoFactorEnabled: true, lastLoginAt: true } },
        role: { select: { key: true, nameAr: true, nameEn: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
  );

  const rows = memberships.map((m) => ({
    id: m.id,
    user: (
      <div className="flex flex-col">
        <span className="font-medium">{m.user.name}</span>
        <span className="text-sm text-fg-muted" dir="ltr">
          {m.user.email}
        </span>
        {m.user.phone ? (
          <span className="text-sm text-fg-muted" dir="ltr">
            {m.user.phone}
          </span>
        ) : null}
      </div>
    ),
    role: <Badge tone="brand">{locale === 'ar' ? m.role.nameAr : m.role.nameEn}</Badge>,
    twoFactor: m.user.twoFactorEnabled ? t('common.yes') : t('common.no'),
    lastActive: m.user.lastLoginAt
      ? formatDistanceToNow(new Date(m.user.lastLoginAt), { addSuffix: true, locale: locale === 'ar' ? arSA : enUS })
      : t('common.never'),
    status: (
      <Badge tone={m.status === 'active' ? 'success' : 'danger'}>
        {m.status === 'active' ? t('users.statusActive') : t('users.statusSuspended')}
      </Badge>
    ),
  }));

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <Card title={t('users.title')}>
        <Table
          columns={[
            { key: 'user', header: t('users.user') },
            { key: 'role', header: t('users.role') },
            { key: 'twoFactor', header: t('users.twoFactor') },
            { key: 'lastActive', header: t('users.lastActive') },
            { key: 'status', header: t('common.status') },
          ]}
          rows={rows}
        />
      </Card>
      <InviteUserFormGate orgId={orgId} userId={ctx.user.id} userEmail={ctx.user.email} />
    </div>
  );
}

async function InviteUserFormGate({
  orgId,
  userId,
  userEmail,
}: {
  orgId: string;
  userId: string;
  userEmail: string;
}) {
  if (!(await hasPermission('invitation.manage'))) return null;
  const roles = await withRls({ orgId, userId, userEmail }, (tx) =>
    tx.role.findMany({
      where: { OR: [{ organizationId: orgId }, { organizationId: null, isSystem: true }] },
      select: { id: true, key: true, nameAr: true, nameEn: true, isSystem: true },
      orderBy: [{ isSystem: 'desc' }, { nameAr: 'asc' }],
    }),
  );
  return <InviteUserForm roles={roles} />;
}
