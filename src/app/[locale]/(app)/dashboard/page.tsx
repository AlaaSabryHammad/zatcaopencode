import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { requireOrgContext } from '@/server/auth/current-user';
import { withRls } from '@/server/db';
import { getDashboardData, resolveRange, type DashboardPeriod } from '@/server/modules/dashboard/queries';
import {
  Alert,
  Amount,
  Avatar,
  Badge,
  Button,
  Card,
  Delta,
  InvoiceStatus,
  Progress,
  Sparkline,
  StatCard,
  Table,
} from '@/components/zw';
import { RevenueChart, DonutChart, CashflowChart, BranchChart, DONUT_COLORS } from '@/components/dashboard/charts';
import { DashboardToolbar } from '@/components/dashboard/DashboardToolbar';
import { DashboardActivity } from '@/components/dashboard/DashboardActivity';
import { SetupBanner } from '@/components/dashboard/SetupBanner';

const PERIODS: DashboardPeriod[] = ['today', 'week', 'month', 'quarter', 'year', 'custom'];

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations();
  const ctx = await requireOrgContext().catch((): never => redirect(`/${locale}/auth/login`));
  if (!ctx.activeMembership) redirect(`/${locale}/onboarding`);

  const period: DashboardPeriod = PERIODS.includes(sp.period as DashboardPeriod) ? (sp.period as DashboardPeriod) : 'month';
  const now = new Date();
  const range = resolveRange(period, now, { from: sp.from, to: sp.to });
  const today = new Date(now);
  const rls = { orgId: ctx.activeMembership.organizationId, userId: ctx.user.id, userEmail: ctx.user.email };
  const data = await withRls(rls, (tx) => getDashboardData(tx, ctx.activeMembership!.organizationId, range, today, locale));

  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf0 = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { maximumFractionDigits: 0 });
  const compact = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { notation: 'compact', maximumFractionDigits: 1 });
  const dateLine = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh',
  }).format(now);
  const riyadhHour = new Date(now.getTime() + 3 * 3_600_000).getUTCHours();
  const greet = riyadhHour < 12 ? t('dashboard.morning') : riyadhHour < 17 ? t('dashboard.afternoon') : t('dashboard.evening');
  const orgName = locale === 'ar' ? ctx.activeMembership.organization.nameAr : (ctx.activeMembership.organization.nameEn ?? ctx.activeMembership.organization.nameAr);
  const firstName = ctx.user.name.split(' ')[0] ?? ctx.user.name;
  const prevLabel = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', timeZone: 'Asia/Riyadh' }).format(range.prevFrom);

  const b = data.buckets;
  const bucketTotal = b.paid + b.unpaid + b.overdue + b.draft;
  const seg = (v: number) => (bucketTotal > 0 ? `${(v / bucketTotal) * 100}%` : '0%');
  const statusTotal = b.paid + b.unpaid + b.overdue + b.draft;
  const share = (v: number) => (statusTotal > 0 ? Math.round((v / statusTotal) * 100) : 0);
  const methodTotal = data.methods.reduce((a, m) => a + m.amount, 0);

  const csv = [
    'number,customer,due,status,total',
    ...data.recent.map((r) => [r.number ?? '', `"${r.customer}"`, r.due ?? '', r.status, r.total.toFixed(2)].join(',')),
  ].join('\n');

  const k = data.kpis;
  const revTrend = data.monthly.map((m) => m.revenue);
  const expTrend = data.monthly.map((m) => m.expenses);
  const netTrend = data.monthly.map((m) => Math.round((m.revenue - m.expenses) * 100) / 100);

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-fg-muted">{dateLine}</span>
          <h1 className="text-h1">
            {greet}، {firstName}
          </h1>
          <p className="text-sm text-fg-muted">
            {t('dashboard.overview')} · {orgName}
          </p>
        </div>
      </div>

      <DashboardToolbar period={period} from={sp.from} to={sp.to} csv={csv} filename={`dashboard-${period}.csv`} />

      <SetupBanner emailVerified={!!ctx.user.emailVerifiedAt} userEmail={ctx.user.email} memberCount={ctx.memberships.length} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('dashboard.kpi.sales')} value={k.sales} currency size="kpi" emphasis trend={revTrend} delta={k.salesDelta ?? undefined} footnote={`${t('dashboard.kpi.salesHint')} ${prevLabel}`} />
        <StatCard label={t('dashboard.kpi.net')} value={k.net} currency size="kpi" trend={netTrend} delta={k.netDelta ?? undefined} footnote={t('dashboard.kpi.netHint')} />
        <StatCard label={t('dashboard.kpi.vat')} value={k.vat} currency size="kpi" trend={revTrend} trendTone="accent" delta={k.vatDelta ?? undefined} footnote={t('dashboard.kpi.vatHint')} />
        <StatCard label={t('dashboard.kpi.profit')} value={k.profit} currency size="kpi" trend={netTrend} trendTone="accent" delta={k.profitDelta ?? undefined} footnote={t('dashboard.kpi.profitHint', { margin: k.profitMargin ?? 0 })} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          title={t('dashboard.receivables')}
          description={`${t('dashboard.issuedIn', { period: prevLabel })} · ${t('dashboard.invoicesCount', { n: k.issuedCount })}`}
          className="xl:col-span-2"
          actions={<Amount value={k.outstanding} size="lg" />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full" dir="ltr" aria-hidden>
              <span style={{ width: seg(b.paid), background: 'var(--chart-1)' }} />
              <span style={{ width: seg(b.unpaid), background: 'var(--chart-4)' }} />
              <span style={{ width: seg(b.overdue), background: 'var(--chart-5)' }} />
              <span style={{ width: seg(b.draft), background: 'var(--chart-7)' }} />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { key: 'paid', v: b.paid, n: b.paidCount, dot: 'var(--chart-1)' },
                { key: 'unpaid', v: b.unpaid, n: b.unpaidCount, dot: 'var(--chart-4)' },
                { key: 'overdue', v: b.overdue, n: b.overdueCount, dot: 'var(--chart-5)' },
                { key: 'draft', v: b.draft, n: b.draftCount, dot: 'var(--chart-7)' },
              ].map((s) => (
                <div key={s.key} className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-sm text-fg-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                    {t(`dashboard.${s.key}` as 'dashboard.paid')}
                  </span>
                  <Amount value={s.v} />
                  <span className="text-xs text-fg-muted">{t('dashboard.invoicesCount', { n: s.n })}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t('dashboard.aging')}</span>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {[
                  { k: 'd030', v: data.aging.d030 },
                  { k: 'd3160', v: data.aging.d3160 },
                  { k: 'd6190', v: data.aging.d6190 },
                  { k: 'd90', v: data.aging.d90 },
                ].map((a) => (
                  <div key={a.k} className="rounded-lg bg-sunken p-3">
                    <div className="text-xs text-fg-muted">{t(`dashboard.bands.${a.k}` as 'dashboard.bands.d030')}</div>
                    <Amount value={a.v} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card
            title={t('dashboard.kpi.expenses')}
            actions={<Delta value={k.expensesDelta ?? 0} invert />}
          >
            <div className="flex flex-col gap-2">
              <Amount value={k.expenses} size="lg" />
              <Sparkline data={expTrend} tone="brand" />
            </div>
          </Card>
          {data.insight ? (
            <Alert tone="accent" title={t('dashboard.insight')} icon="sparkles">
              {t('dashboard.insightText', { name: data.insight.topDebtor, amount: nf.format(data.insight.topAmount), share: data.insight.share })}
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title={t('dashboard.revenue')} description={t('dashboard.last7m')} className="xl:col-span-2">
          <RevenueChart data={data.monthly} revenueLabel={t('dashboard.kpi.net')} expensesLabel={t('dashboard.kpi.expenses')} />
        </Card>
        <Card title={t('dashboard.invoiceStatus')}>
          <DonutChart
            ariaLabel={t('dashboard.invoiceStatus')}
            centerTop={compact.format(statusTotal)}
            centerBottom={t('dashboard.invoicesCount', { n: b.paidCount + b.unpaidCount + b.overdueCount + b.draftCount })}
            slices={[
              { name: t('dashboard.paid'), value: b.paid, color: DONUT_COLORS.paid },
              { name: t('dashboard.unpaid'), value: b.unpaid, color: DONUT_COLORS.unpaid },
              { name: t('dashboard.overdue'), value: b.overdue, color: DONUT_COLORS.overdue },
              { name: t('dashboard.draft'), value: b.draft, color: DONUT_COLORS.draft },
            ]}
          />
          <div className="flex flex-col gap-1.5">
            {[
              { k: 'paid', v: b.paid },
              { k: 'unpaid', v: b.unpaid },
              { k: 'overdue', v: b.overdue },
              { k: 'draft', v: b.draft },
            ].map((s) => (
              <div key={s.k} className="flex items-center justify-between text-sm">
                <span>{t(`dashboard.${s.k}` as 'dashboard.paid')}</span>
                <span className="zw-tnum text-fg-muted">
                  {nf0.format(s.v)} · {share(s.v)}٪
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title={t('dashboard.cashflow')} description={t('dashboard.weekly')}>
          <CashflowChart data={data.cashflow} inflowLabel={t('dashboard.inflow')} outflowLabel={t('dashboard.outflow')} />
        </Card>
        <Card title={t('dashboard.branchSales')}>
          <BranchChart data={data.branches} ariaLabel={t('dashboard.branchSales')} />
        </Card>
        <Card
          title={t('dashboard.vatSummary')}
          description={t('dashboard.toDate', { period: t('dashboard.periods.quarter') })}
          actions={<Badge tone="accent">{t('dashboard.q3due', { date: '31 Oct' })}</Badge>}
        >
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">{t('dashboard.outputVat')}</span>
              <Amount value={data.vatSummary.output} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">{t('dashboard.inputVat')}</span>
              <Amount value={data.vatSummary.input} size="sm" />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle pt-2 font-semibold">
              <span>{t('dashboard.netVatPayable')}</span>
              <Amount value={data.vatSummary.net} size="sm" />
            </div>
            <span className="text-xs text-fg-muted">{t('dashboard.openVat')} · {t('onboarding.soon')}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title={t('dashboard.topCustomers')} actions={<span className="text-sm text-fg-muted">{t('dashboard.viewAll')}</span>}>
          <div className="flex flex-col gap-3">
            {data.topCustomers.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <Avatar name={c.name} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{c.name}</span>
                    <Amount value={c.amount} size="sm" />
                  </div>
                  <Progress value={c.share} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('dashboard.topProducts')} actions={<span className="text-sm text-fg-muted">{t('dashboard.viewAll')}</span>}>
          <div className="flex flex-col gap-3">
            {data.topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar name={p.name} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{p.name}</span>
                    <Amount value={p.amount} size="sm" />
                  </div>
                  <span className="text-xs text-fg-muted" dir="ltr">
                    {p.units}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('dashboard.methods')} description={t('dashboard.receivedIn', { period: prevLabel })}>
          <DonutChart
            ariaLabel={t('dashboard.methods')}
            centerTop={compact.format(methodTotal)}
            centerBottom={t('dashboard.receivedIn', { period: prevLabel })}
            slices={data.methods.map((m, i) => ({
              name: t(`dashboard.method.${m.method}` as 'dashboard.method.bank'),
              value: m.amount,
              color: [DONUT_COLORS.paid, DONUT_COLORS.unpaid, DONUT_COLORS.overdue, DONUT_COLORS.draft, 'var(--chart-3)'][i % 5]!,
            }))}
          />
          <div className="flex flex-col gap-1.5">
            {data.methods.map((m) => (
              <div key={m.method} className="flex items-center justify-between text-sm">
                <span>{t(`dashboard.method.${m.method}` as 'dashboard.method.bank')}</span>
                <span className="zw-tnum text-fg-muted">
                  {nf0.format(m.amount)} · {m.share}٪
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          title={t('dashboard.recent')}
          className="xl:col-span-2"
          actions={<span className="text-sm text-fg-muted">{t('dashboard.allInvoices')}</span>}
        >
          <Table
            columns={[
              { key: 'number', header: t('dashboard.colInvoice') },
              { key: 'customer', header: t('dashboard.colCustomer') },
              { key: 'due', header: t('dashboard.colDue') },
              { key: 'status', header: t('dashboard.colStatus') },
              { key: 'total', header: t('dashboard.colTotal') },
            ]}
            rows={data.recent.map((r) => {
              const overdue = r.due != null && r.due < today.toISOString().slice(0, 10) && r.balance > 0;
              return {
                id: r.id,
                number: (
                  <span className="zw-mono" dir="ltr">
                    {r.number ?? '—'}
                  </span>
                ),
                customer: r.customer,
                due: r.due ? (
                  <span className="zw-tnum" dir="ltr">
                    {r.due}
                  </span>
                ) : (
                  '—'
                ),
                status: <InvoiceStatus size="sm" status={(overdue ? 'overdue' : r.status) as 'draft'} />,
                total: <Amount value={r.total} size="sm" />,
              };
            })}
          />
        </Card>
        <Card title={t('dashboard.activity')}>
          <DashboardActivity items={data.activity} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title={t('dashboard.alerts')} className="xl:col-span-2">
          <div className="flex flex-col gap-2">
            {data.overdueList.length > 0 ? (
              <Alert tone="danger" title={t('dashboard.overdueAlert', { n: data.overdueList.length })}>
                {t('dashboard.overdueHint', { amount: nf.format(data.buckets.overdue) })}
              </Alert>
            ) : null}
            {data.lowStock.map((s) => (
              <Alert key={s.id} tone="info" title={t('dashboard.stockAlert', { name: s.name })}>
                {t('dashboard.stockHint', { qty: s.qty, min: s.min })}
              </Alert>
            ))}
          </div>
        </Card>
        <Card title={t('dashboard.setupTitle')} description={t('dashboard.ofComplete', { a: 6, b: 8 })}>
          <div className="flex flex-col gap-2">
            <Progress value={75} />
            <Link href="/settings/users">
              <Button variant="secondary" size="sm" iconStart="user-plus" fullWidth>
                {t('dashboard.inviteCta')}
              </Button>
            </Link>
            <Button variant="secondary" size="sm" iconStart="plug" disabled fullWidth title={t('onboarding.soon')}>
              {t('dashboard.deviceCta')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
