import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { hasPermission } from '@/server/rbac/guard';
import { withRls } from '@/server/db';
import { getCustomerProfile } from '@/server/modules/customers/queries';
import { Alert, Amount, Avatar, Badge, Button, Card, EmptyState, Progress, StatCard, Table, Timeline } from '@/components/zw';
import { RevenueChart } from '@/components/dashboard/charts';
import { CustomerDialogs } from '@/components/customers/CustomerDialogs';
import { CustomerTabs } from '@/components/customers/CustomerTabs';
import { ContactForm } from '@/components/customers/ContactForm';
import { InvoicesMiniClient } from '@/components/customers/InvoicesMiniClient';

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding`);
  const orgId = ctx.activeMembership.organizationId;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const today = new Date();

  const [profile, canManage] = await withRls(rls, (tx) => getCustomerProfile(tx, orgId, id, today, locale)).then(
    async (p) => [p, await hasPermission('customer.manage')] as const,
  );
  if (!profile) redirect(`/${locale}/customers`);

  const name = locale === 'ar' ? profile.nameAr : (profile.nameEn ?? profile.nameAr);

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={name} size="lg" square />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h2">{name}</h1>
                {profile.tags.map((tag) => (
                  <Badge key={tag} tone={tag === 'Key account' ? 'accent' : 'neutral'}>
                    {tag}
                  </Badge>
                ))}
                <Badge tone="neutral">
                  <span dir="ltr">Net {profile.paymentTermsDays}</span>
                </Badge>
              </div>
              <p className="text-sm text-fg-muted">
                {profile.nameEn && locale === 'ar' ? profile.nameEn : profile.nameAr} ·{' '}
                {t(`customers.type.${profile.type}` as 'customers.type.company')}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
                {profile.vatNumber ? (
                  <span dir="ltr" className="zw-tnum">
                    VAT {profile.vatNumber}
                  </span>
                ) : null}
                {profile.crNumber ? (
                  <span dir="ltr" className="zw-tnum">
                    CR {profile.crNumber}
                  </span>
                ) : null}
                {profile.email ? <span dir="ltr">{profile.email}</span> : null}
                {profile.phone ? (
                  <span dir="ltr" className="zw-tnum">
                    {profile.phone}
                  </span>
                ) : null}
                {profile.address ? <span>{profile.address}</span> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canManage ? (
              <Link href={`/customers/${id}?edit=${id}`}>
                <Button variant="secondary" iconStart="pencil">
                  {t('customers.profile.edit')}
                </Button>
              </Link>
            ) : null}
            <Button variant="secondary" iconStart="send" disabled title={t('onboarding.soon')}>
              {t('customers.profile.sendStatement')}
            </Button>
            <Button iconStart="plus" disabled title={t('onboarding.soon')}>
              {t('customers.profile.newInvoice')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label={t('customers.profile.sales12')} value={profile.stats.sales12mo} currency emphasis trend={profile.monthly.map((m) => m.invoiced)} />
        <StatCard
          label={t('customers.profile.outstandingBalance')}
          value={profile.stats.outstanding}
          currency
          footnote={`${profile.stats.openCount} ${t('customers.profile.invoices')} · ${profile.stats.overdueCount} ${t('customers.profile.overdue')}`}
        />
        <StatCard
          label={t('customers.profile.paidInvoices')}
          value={profile.stats.paidCount}
          footnote={t('customers.profile.collected', { amount: profile.stats.paidCollected.toFixed(2) })}
        />
        <StatCard
          label={t('customers.profile.overdue')}
          value={profile.stats.overdueAmount}
          currency
          footnote={profile.stats.oldestOverdueDays !== null ? t('customers.profile.lateBy', { days: profile.stats.oldestOverdueDays }) : undefined}
        />
        <StatCard
          label={t('customers.profile.avgPayTime')}
          value={profile.stats.avgPayDays ?? '—'}
          footnote={t('customers.profile.termsAre', { days: profile.paymentTermsDays })}
        />
      </div>

      <CustomerTabs
        overview={
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card title={t('customers.profile.invoicedVsPaid')} description={t('customers.profile.monthly')} className="xl:col-span-2">
              <RevenueChart
                data={profile.monthly.map((m) => ({ label: m.label, revenue: m.invoiced, expenses: m.paid }))}
                revenueLabel={t('customers.profile.invoicedVsPaid')}
                expensesLabel={t('customers.profile.tabs.payments')}
              />
            </Card>
            <div className="flex flex-col gap-4">
              <Card title={t('customers.profile.credit')}>
                {profile.creditLimit !== null ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-fg-muted">{t('customers.profile.limitUsed')}</span>
                      <span className="zw-tnum" dir="ltr">
                        {profile.stats.outstanding.toFixed(2)} / {profile.creditLimit.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={profile.creditLimit > 0 ? (profile.stats.outstanding / profile.creditLimit) * 100 : 0} />
                  </div>
                ) : (
                  <span className="text-sm text-fg-muted">—</span>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">{t('customers.profile.paymentTerms')}</span>
                  <span>{t('customers.profile.netDays', { days: profile.paymentTermsDays })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">{t('customers.profile.currency')}</span>
                  <span>SAR</span>
                </div>
              </Card>
              <Card title={t('customers.profile.contacts')}>
                <div className="flex flex-col gap-3">
                  {profile.contacts.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <Avatar name={c.name} size="sm" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        {c.role ? <span className="truncate text-xs text-fg-muted">{c.role}</span> : null}
                      </div>
                    </div>
                  ))}
                  {canManage ? <ContactForm customerId={id} /> : null}
                </div>
              </Card>
              <Card title={t('customers.profile.nationalAddress')}>
                <p className="text-sm text-fg-secondary">{[profile.address, profile.city].filter(Boolean).join('، ') || '—'}</p>
              </Card>
              {profile.insight ? (
                <Alert tone="accent" title={t('dashboard.insight')} icon="sparkles">
                  {t('customers.profile.insightLate', { days: profile.insight.avgLateDays, max: profile.insight.maxDays })}
                </Alert>
              ) : null}
            </div>
            <Card
              title={t('customers.profile.tabs.invoices')}
              className="xl:col-span-2"
              actions={<span className="text-sm text-fg-muted">{t('customers.profile.viewAll')}</span>}
            >
              <InvoicesMiniClient rows={profile.invoices.slice(0, 5)} />
            </Card>
            <Card title={t('dashboard.activity')}>
              <Timeline
                compact
                items={[...profile.invoices.slice(0, 4).map((r) => ({
                  title: `${r.number ?? r.status} · ${r.total.toFixed(2)}`,
                  time: r.issue,
                  icon: 'receipt' as const,
                  tone: 'neutral' as const,
                })), ...profile.payments.slice(0, 2).map((p) => ({
                  title: `${p.amount.toFixed(2)} · ${p.method}`,
                  time: p.date,
                  icon: 'banknote' as const,
                  tone: 'success' as const,
                }))]}
              />
            </Card>
          </div>
        }
        invoices={
          <Card title={t('customers.profile.tabs.invoices')}>
            {profile.invoices.length ? <InvoicesMiniClient rows={profile.invoices} /> : <EmptyState compact icon="inbox" title={t('customers.profile.noInvoices')} />}
          </Card>
        }
        payments={
          <Card title={t('customers.profile.tabs.payments')}>
            {profile.payments.length ? (
              <Table
                columns={[
                  { key: 'date', header: t('customers.profile.colDate') },
                  { key: 'amount', header: t('customers.profile.colAmount') },
                  { key: 'method', header: t('customers.profile.colMethod') },
                  { key: 'ref', header: t('customers.profile.colReference') },
                ]}
                rows={profile.payments.map((p) => ({
                  id: p.id,
                  date: <span dir="ltr" className="zw-tnum">{p.date}</span>,
                  amount: <Amount value={p.amount} size="sm" />,
                  method: p.method,
                  ref: <span dir="ltr">{p.reference ?? p.invoiceNumber ?? '—'}</span>,
                }))}
              />
            ) : (
              <EmptyState compact icon="inbox" title={t('customers.profile.noPayments')} />
            )}
          </Card>
        }
        creditNotes={
          <Card title={t('customers.profile.tabs.creditNotes')}>
            {profile.creditNotes.length ? (
              <InvoicesMiniClient rows={profile.creditNotes.map((n) => ({ ...n, due: null }))} />
            ) : (
              <EmptyState compact icon="inbox" title={t('customers.profile.noCreditNotes')} />
            )}
          </Card>
        }
        documents={
          <Card title={t('customers.profile.tabs.documents')}>
            <EmptyState compact icon="folder" title={t('customers.profile.documentsEmpty')} />
          </Card>
        }
        notes={
          <Card title={t('customers.profile.tabs.notes')}>
            <EmptyState compact icon="pencil" title={t('customers.profile.notesEmpty')} />
          </Card>
        }
        counts={{ invoices: profile.invoices.length, payments: profile.payments.length, creditNotes: profile.creditNotes.length }}
      />
      <CustomerDialogs canManage={canManage} />
    </div>
  );
}
