import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { hasPermission } from '@/server/rbac/guard';
import { withRls } from '@/server/db';
import { listCustomers, customerHeaderStats, customerCities } from '@/server/modules/customers/queries';
import { Button, StatCard } from '@/components/zw';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { CustomerDialogs } from '@/components/customers/CustomerDialogs';

export default async function CustomersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding`);
  const orgId = ctx.activeMembership.organizationId;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const today = new Date();

  const tab = sp.tab ?? 'all';
  const filters = {
    q: sp.q,
    type: tab === 'companies' ? ('company' as const) : tab === 'individuals' ? ('individual' as const) : undefined,
    city: sp.city || undefined,
    hasBalance: sp.balance ? true : tab === 'balance' ? true : undefined,
    sortKey: (sp.sort as 'name' | 'outstanding' | 'sales' | 'avgPay' | 'last' | undefined) ?? 'name',
    sortDir: (sp.dir as 'asc' | 'desc' | undefined) ?? 'asc',
    page: Math.max(1, Number(sp.page ?? 1) || 1),
    pageSize: 10,
  };
  const [list, stats, cities, canManage] = await withRls(rls, async (tx) => {
    const [l, s, c] = await Promise.all([
      listCustomers(tx, orgId, filters),
      customerHeaderStats(tx, orgId, today),
      customerCities(tx, orgId),
    ]);
    return [l, s, c] as const;
  }).then(async ([l, s, c]) => [l, s, c, await hasPermission('customer.manage')] as const);

  const counts = await withRls(rls, async (tx) => {
    const [all, companies, individuals, balance] = await Promise.all([
      tx.customer.count({ where: { organizationId: orgId } }),
      tx.customer.count({ where: { organizationId: orgId, type: 'company' } }),
      tx.customer.count({ where: { organizationId: orgId, type: 'individual' } }),
      tx.invoice.findMany({
        where: { organizationId: orgId, status: { in: ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] }, balanceDue: { gt: 0 } },
        select: { customerId: true },
      }),
    ]);
    return { all, companies, individuals, balance: new Set(balance.map((b) => b.customerId)).size };
  });

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{t('customers.title')}</h1>
          <p className="text-sm text-fg-muted">
            {t('customers.subtitle', { n: counts.all, amount: stats.outstanding.toFixed(2), invoices: stats.openInvoices })}
          </p>
        </div>
        {canManage ? (
          <div className="flex gap-2">
            <Link href="/customers?import=1">
              <Button variant="secondary" iconStart="upload">
                {t('customers.import')}
              </Button>
            </Link>
            <Link href="/customers?new=1">
              <Button iconStart="user-plus" kbd="C">
                {t('customers.add')}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('customers.stats.active')} value={stats.active} icon="users" footnote={t('customers.stats.activeHint')} />
        <StatCard label={t('customers.stats.outstanding')} value={stats.outstanding} currency footnote={t('dashboard.invoicesCount', { n: stats.openInvoices })} />
        <StatCard
          label={t('customers.stats.avgPay')}
          value={stats.avgPayDays ?? '—'}
          footnote={stats.avgPayDelta !== null && stats.avgPayDelta < 0 ? t('customers.stats.avgPayHint', { days: Math.abs(stats.avgPayDelta) }) : t('customers.stats.vsLast')}
        />
        <StatCard
          label={t('customers.stats.newMonth')}
          value={stats.newCompanies + stats.newIndividuals}
          footnote={`${stats.newCompanies} ${t('customers.stats.companies')} · ${stats.newIndividuals} ${t('customers.stats.individuals')}`}
        />
      </div>

      <CustomersTable rows={list.rows} total={list.total} counts={counts} cities={cities} />
      <CustomerDialogs canManage={canManage} />
    </div>
  );
}
