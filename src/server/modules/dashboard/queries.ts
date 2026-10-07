import 'server-only';
import type { Tx } from '@/server/db';
import { splitOpen, agingBuckets, pctChange, monthlySeries, topN, sum2 } from './stats';

const RIYADH_MS = 3 * 3_600_000;

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DashboardRange {
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
}

/** Riyadh calendar day (Asia/Riyadh has no DST — fixed UTC+3). */
function riyadhParts(now: Date): { y: number; m: number; d: number } {
  const r = new Date(now.getTime() + RIYADH_MS);
  return { y: r.getUTCFullYear(), m: r.getUTCMonth(), d: r.getUTCDate() };
}

const dayStart = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d) - RIYADH_MS);
const addDays = (dt: Date, n: number) => new Date(dt.getTime() + n * 86_400_000);

export function resolveRange(period: DashboardPeriod, now: Date, custom?: { from?: string; to?: string }): DashboardRange {
  const { y, m, d } = riyadhParts(now);
  const today = dayStart(y, m, d);
  const monthStart = dayStart(y, m, 1);
  const q = Math.floor(m / 3);
  const quarterStart = dayStart(y, q * 3, 1);
  const yearStart = dayStart(y, 0, 1);
  switch (period) {
    case 'today':
      return { from: today, to: addDays(today, 1), prevFrom: addDays(today, -1), prevTo: today };
    case 'week':
      return { from: addDays(today, -6), to: addDays(today, 1), prevFrom: addDays(today, -13), prevTo: addDays(today, -6) };
    case 'quarter': {
      const nextQ = q === 3 ? dayStart(y + 1, 0, 1) : dayStart(y, (q + 1) * 3, 1);
      const span = nextQ.getTime() - quarterStart.getTime();
      return { from: quarterStart, to: nextQ, prevFrom: new Date(quarterStart.getTime() - span), prevTo: quarterStart };
    }
    case 'year': {
      const nextY = dayStart(y + 1, 0, 1);
      return { from: yearStart, to: nextY, prevFrom: dayStart(y - 1, 0, 1), prevTo: yearStart };
    }
    case 'custom': {
      const f = custom?.from ? dayStart(...parts(custom.from)) : monthStart;
      const t = custom?.to ? addDays(dayStart(...parts(custom.to)), 1) : addDays(today, 1);
      const span = Math.max(t.getTime() - f.getTime(), 86_400_000);
      return { from: f, to: t, prevFrom: new Date(f.getTime() - span), prevTo: f };
    }
    case 'month':
    default: {
      const nextM = m === 11 ? dayStart(y + 1, 0, 1) : dayStart(y, m + 1, 1);
      const prevM = m === 0 ? dayStart(y - 1, 11, 1) : dayStart(y, m - 1, 1);
      return { from: monthStart, to: nextM, prevFrom: prevM, prevTo: monthStart };
    }
  }
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y as number, (m as number) - 1, d as number];
}

const OPEN_STATUSES = ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] as const;

export interface DashboardData {
  kpis: {
    sales: number; salesDelta: number | null;
    net: number; netDelta: number | null;
    vat: number; vatDelta: number | null;
    expenses: number; expensesDelta: number | null;
    profit: number; profitMargin: number | null;
    outstanding: number; issuedCount: number;
  };
  buckets: { paid: number; paidCount: number; unpaid: number; unpaidCount: number; overdue: number; overdueCount: number; draft: number; draftCount: number };
  aging: { d030: number; d3160: number; d6190: number; d90: number };
  monthly: Array<{ key: string; label: string; revenue: number; expenses: number }>;
  branches: Array<{ id: string; name: string; sales: number }>;
  vatSummary: { output: number; input: number; net: number };
  topCustomers: Array<{ id: string; name: string; amount: number; share: number }>;
  topProducts: Array<{ id: string; name: string; units: string; amount: number; share: number }>;
  methods: Array<{ method: string; amount: number; share: number }>;
  recent: Array<{ id: string; number: string | null; customer: string; due: string | null; status: string; total: number }>;
  activity: Array<{ id: string; kind: 'payment' | 'invoice' | 'expense'; title: string; detail: string; at: string }>;
  overdueList: Array<{ id: string; number: string | null; customer: string; balance: number; days: number }>;
  lowStock: Array<{ id: string; name: string; qty: number; min: number; branch: string | null }>;
  insight: { topDebtor: string; topAmount: number; share: number } | null;
}

const num = (v: { toNumber(): number } | null | undefined) => v?.toNumber() ?? 0;

export async function getDashboardData(
  tx: Tx,
  orgId: string,
  range: DashboardRange,
  today: Date,
  locale: string,
): Promise<DashboardData> {
  const issuedWhere = {
    organizationId: orgId,
    type: { in: ['TAX', 'SIMPLIFIED'] as Array<'TAX' | 'SIMPLIFIED'> },
    status: { notIn: ['draft', 'cancelled'] as Array<'draft' | 'cancelled'> },
  };
  const inRange = { issueDate: { gte: range.from, lt: range.to } };
  const inPrev = { issueDate: { gte: range.prevFrom, lt: range.prevTo } };

  const [docs, prevDocs, notes, prevNotes, expenses, prevExpenses] = await Promise.all([
    tx.invoice.findMany({ where: { ...issuedWhere, ...inRange }, select: { subtotal: true, vatTotal: true, grandTotal: true } }),
    tx.invoice.findMany({ where: { ...issuedWhere, ...inPrev }, select: { subtotal: true, vatTotal: true, grandTotal: true } }),
    tx.invoice.findMany({
      where: { organizationId: orgId, type: 'CREDIT_NOTE', status: 'credited', issueDate: { gte: range.from, lt: range.to } },
      select: { grandTotal: true },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, type: 'CREDIT_NOTE', status: 'credited', issueDate: { gte: range.prevFrom, lt: range.prevTo } },
      select: { grandTotal: true },
    }),
    tx.expense.findMany({
      where: { organizationId: orgId, status: { in: ['approved', 'paid'] }, date: { gte: range.from, lt: range.to } },
      select: { amountInclVat: true, vatAmount: true, recoverable: true },
    }),
    tx.expense.findMany({
      where: { organizationId: orgId, status: { in: ['approved', 'paid'] }, date: { gte: range.prevFrom, lt: range.prevTo } },
      select: { amountInclVat: true },
    }),
  ]);

  const sales = sum2(docs, (r) => num(r.subtotal));
  const vat = sum2(docs, (r) => num(r.vatTotal));
  const credit = sum2(notes, (r) => num(r.grandTotal));
  const net = Math.round((sales + credit) * 100) / 100;
  const expTotal = sum2(expenses, (r) => num(r.amountInclVat));
  const expVat = sum2(expenses.filter((e) => e.recoverable), (r) => num(r.vatAmount));
  const prevSales = sum2(prevDocs, (r) => num(r.subtotal));
  const prevVat = sum2(prevDocs, (r) => num(r.vatTotal));
  const prevCredit = sum2(prevNotes, (r) => num(r.grandTotal));
  const prevNet = Math.round((prevSales + prevCredit) * 100) / 100;
  const prevExp = sum2(prevExpenses, (r) => num(r.amountInclVat));
  const profit = Math.round((net - expTotal) * 100) / 100;

  // Buckets: paid-in-range (payment date), open as-of-today, drafts as-of-today.
  const [paidDocs, openDocs, draftDocs] = await Promise.all([
    tx.invoice.findMany({
      where: { organizationId: orgId, status: 'paid', payments: { some: { date: { gte: range.from, lt: range.to } } } },
      select: { grandTotal: true },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, status: { in: [...OPEN_STATUSES] }, balanceDue: { gt: 0 } },
      select: { grandTotal: true, dueDate: true },
    }),
    tx.invoice.findMany({ where: { organizationId: orgId, status: 'draft' }, select: { grandTotal: true } }),
  ]);
  const paid = sum2(paidDocs, (r) => num(r.grandTotal));
  const { unpaid, overdue } = splitOpen(
    openDocs.map((r) => ({ grandTotal: num(r.grandTotal), dueDate: r.dueDate })),
    today,
  );
  const draft = sum2(draftDocs, (r) => num(r.grandTotal));
  const aging = agingBuckets(
    openDocs.map((r) => ({ grandTotal: num(r.grandTotal), dueDate: r.dueDate })),
    today,
  );

  // Monthly series: last 7 calendar months ending in range.to's month.
  const endR = new Date(range.to.getTime() - 1 + RIYADH_MS);
  const ey = endR.getUTCFullYear();
  const em = endR.getUTCMonth();
  const startM = new Date(Date.UTC(em - 6 < 0 ? ey - 1 : ey, (em - 6 + 12) % 12, 1));
  const revRows = await tx.invoice.findMany({
    where: { ...issuedWhere, issueDate: { gte: startM, lt: range.to } },
    select: { issueDate: true, subtotal: true },
  });
  const expRows = await tx.expense.findMany({
    where: { organizationId: orgId, status: { in: ['approved', 'paid'] }, date: { gte: startM, lt: range.to } },
    select: { date: true, amountInclVat: true },
  });
  const revByMonth: Record<string, number> = {};
  for (const r of revRows) {
    const k = `${r.issueDate.getUTCFullYear()}-${String(r.issueDate.getUTCMonth() + 1).padStart(2, '0')}`;
    revByMonth[k] = Math.round(((revByMonth[k] ?? 0) + num(r.subtotal)) * 100) / 100;
  }
  const expByMonth: Record<string, number> = {};
  for (const r of expRows) {
    const k = `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, '0')}`;
    expByMonth[k] = Math.round(((expByMonth[k] ?? 0) + num(r.amountInclVat)) * 100) / 100;
  }
  const fromKey = `${startM.getUTCFullYear()}-${String(startM.getUTCMonth() + 1).padStart(2, '0')}`;
  const toKey = `${ey}-${String(em + 1).padStart(2, '0')}`;
  const monthly = monthlySeries(fromKey, toKey, revByMonth, expByMonth, locale);

  // Branches, VAT quarter-to-date, tops, methods, recent, activity, alerts, insight.
  const [branchRows, branches, qDocs, qExp, custRows, lineRows, payRows, recentRows, payAct, invAct, expAct, lowRows] = await Promise.all([
    tx.invoice.findMany({ where: { ...issuedWhere, ...inRange }, select: { branchId: true, subtotal: true } }),
    tx.branch.findMany({ where: { organizationId: orgId }, select: { id: true, nameAr: true, nameEn: true } }),
    tx.invoice.findMany({
      where: { ...issuedWhere, issueDate: { gte: quarterStartOf(range.to), lt: range.to } },
      select: { vatTotal: true },
    }),
    tx.expense.findMany({
      where: { organizationId: orgId, status: { in: ['approved', 'paid'] }, recoverable: true, date: { gte: quarterStartOf(range.to), lt: range.to } },
      select: { vatAmount: true },
    }),
    tx.invoice.findMany({
      where: { ...issuedWhere, ...inRange, customerId: { not: null } },
      select: { customerId: true, grandTotal: true, customer: { select: { nameAr: true, nameEn: true } } },
    }),
    tx.invoiceLine.findMany({
      where: { organizationId: orgId, invoice: { ...issuedWhere, ...inRange } },
      select: { qty: true, unit: true, lineTotal: true, description: true, product: { select: { id: true, nameAr: true, nameEn: true } } },
    }),
    tx.payment.findMany({
      where: { organizationId: orgId, date: { gte: range.from, lt: range.to } },
      select: { method: true, amount: true },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId },
      orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      select: { id: true, number: true, dueDate: true, status: true, grandTotal: true, customer: { select: { nameAr: true, nameEn: true } } },
    }),
    tx.payment.findMany({
      where: { organizationId: orgId },
      orderBy: { date: 'desc' },
      take: 3,
      select: { id: true, amount: true, method: true, date: true, invoice: { select: { number: true } }, customer: { select: { nameAr: true } } },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, status: { notIn: ['draft'] } },
      orderBy: { issueDate: 'desc' },
      take: 3,
      select: { id: true, number: true, status: true, grandTotal: true, issueDate: true, customer: { select: { nameAr: true } } },
    }),
    tx.expense.findMany({
      where: { organizationId: orgId, status: { in: ['approved', 'paid'] } },
      orderBy: { date: 'desc' },
      take: 2,
      select: { id: true, description: true, amountInclVat: true, date: true },
    }),
    tx.stockLevel.findMany({
      where: { organizationId: orgId },
      include: { product: { select: { id: true, nameAr: true, nameEn: true, minStock: true, trackStock: true } }, },
      take: 50,
    }),
  ]);

  const branchName = (id: string | null) => {
    const b = branches.find((x) => x.id === id);
    if (!b) return locale === 'ar' ? 'غير محدد' : 'Unassigned';
    return locale === 'ar' ? b.nameAr : (b.nameEn ?? b.nameAr);
  };
  const byBranch: Record<string, number> = {};
  for (const r of branchRows) {
    const k = r.branchId ?? '';
    byBranch[k] = Math.round(((byBranch[k] ?? 0) + num(r.subtotal)) * 100) / 100;
  }
  const branchData = Object.entries(byBranch).map(([id, s]) => ({ id, name: branchName(id || null), sales: s }));

  const output = sum2(qDocs, (r) => num(r.vatTotal));
  const input = sum2(qExp, (r) => num(r.vatAmount));

  const custMap = new Map<string, { name: string; amount: number }>();
  for (const r of custRows) {
    const id = r.customerId as string;
    const e = custMap.get(id) ?? { name: locale === 'ar' ? (r.customer?.nameAr ?? '') : (r.customer?.nameEn ?? r.customer?.nameAr ?? ''), amount: 0 };
    e.amount = Math.round((e.amount + num(r.grandTotal)) * 100) / 100;
    custMap.set(id, e);
  }
  const topCustomers = topN([...custMap.entries()].map(([id, v]) => ({ id, ...v })), 5);

  const prodMap = new Map<string, { name: string; units: string; unitsQty: number; amount: number }>();
  for (const r of lineRows) {
    const id = r.product?.id ?? r.description;
    const e = prodMap.get(id) ?? {
      name: locale === 'ar' ? (r.product?.nameAr ?? r.description) : (r.product?.nameEn ?? r.product?.nameAr ?? r.description),
      units: '',
      unitsQty: 0,
      amount: 0,
    };
    e.unitsQty += Number(r.qty);
    e.units = `${e.unitsQty} ${r.unit}`;
    e.amount = Math.round((e.amount + num(r.lineTotal)) * 100) / 100;
    prodMap.set(id, e);
  }
  const topProducts = topN([...prodMap.entries()].map(([id, v]) => ({ id, ...v })), 5);

  const methodTotal = sum2(payRows, (r) => num(r.amount));
  const methodMap = new Map<string, number>();
  for (const r of payRows) methodMap.set(r.method, Math.round(((methodMap.get(r.method) ?? 0) + num(r.amount)) * 100) / 100);
  const methods = [...methodMap.entries()]
    .map(([method, amount]) => ({ method, amount, share: methodTotal > 0 ? Math.round((amount / methodTotal) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const cname = (c: { nameAr: string; nameEn: string | null } | null | undefined, fallback: string) =>
    c ? (locale === 'ar' ? c.nameAr : (c.nameEn ?? c.nameAr)) : fallback;
  const recent = recentRows.map((r) => ({
    id: r.id,
    number: r.number,
    customer: cname(r.customer, '—'),
    due: r.dueDate ? r.dueDate.toISOString().slice(0, 10) : null,
    status: r.status,
    total: num(r.grandTotal),
  }));

  const activity: DashboardData['activity'] = [
    ...payAct.map((p) => ({
      id: `pay-${p.id}`,
      kind: 'payment' as const,
      title: `${p.method} · ${num(p.amount).toFixed(2)}`,
      detail: [p.invoice?.number, p.customer?.nameAr].filter(Boolean).join(' · '),
      at: p.date.toISOString(),
    })),
    ...invAct.map((v) => ({
      id: `inv-${v.id}`,
      kind: 'invoice' as const,
      title: v.number ?? v.status,
      detail: [v.customer?.nameAr, num(v.grandTotal).toFixed(2)].filter(Boolean).join(' · '),
      at: v.issueDate.toISOString(),
    })),
    ...expAct.map((e) => ({
      id: `exp-${e.id}`,
      kind: 'expense' as const,
      title: e.description,
      detail: num(e.amountInclVat).toFixed(2),
      at: e.date.toISOString(),
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 5);

  const lowStock = lowRows
    .filter((s) => s.product.trackStock && Number(s.quantity) < Number(s.product.minStock))
    .map((s) => ({
      id: s.product.id,
      name: locale === 'ar' ? s.product.nameAr : (s.product.nameEn ?? s.product.nameAr),
      qty: Number(s.quantity),
      min: Number(s.product.minStock),
      branch: s.branchId ? branchName(s.branchId) : null,
    }));

  const outstanding = Math.round((unpaid + overdue) * 100) / 100;
  const [overdueDetails, topInsight, issuedCount] = await Promise.all([
    withOverdueDetails(tx, orgId, today, locale),
    topDebtor(tx, orgId, today, locale, outstanding),
    tx.invoice.count({ where: { ...issuedWhere, ...inRange } }),
  ]);

  return {
    kpis: {
      sales, salesDelta: pctChange(sales, prevSales),
      net, netDelta: pctChange(net, prevNet),
      vat, vatDelta: pctChange(vat, prevVat),
      expenses: expTotal, expensesDelta: pctChange(expTotal, prevExp),
      profit, profitMargin: net !== 0 ? Math.round((profit / net) * 1000) / 10 : null,
      outstanding,
      issuedCount,
    },
    buckets: {
      paid, paidCount: paidDocs.length,
      unpaid, unpaidCount: openDocs.length - overdueDetails.length,
      overdue, overdueCount: overdueDetails.length,
      draft, draftCount: draftDocs.length,
    },
    aging,
    monthly,
    branches: branchData,
    vatSummary: { output, input, net: Math.round((output - input) * 100) / 100 },
    topCustomers,
    topProducts,
    methods,
    recent,
    activity,
    overdueList: overdueDetails,
    lowStock,
    insight: topInsight,
  };
}

// Helpers with extra queries (kept separate for readability).
function quarterStartOf(to: Date): Date {  const r = new Date(to.getTime() - 1 + RIYADH_MS);
  const y = r.getUTCFullYear();
  const q = Math.floor(r.getUTCMonth() / 3);
  return new Date(Date.UTC(y, q * 3, 1) - RIYADH_MS);
}

async function withOverdueDetails(tx: Tx, orgId: string, today: Date, locale: string) {
  const rows = await tx.invoice.findMany({
    where: { organizationId: orgId, status: { in: [...OPEN_STATUSES] }, balanceDue: { gt: 0 }, dueDate: { lt: today } },
    orderBy: { dueDate: 'asc' },
    take: 20,
    select: {
      id: true, number: true, grandTotal: true, dueDate: true,
      customer: { select: { nameAr: true, nameEn: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    customer: locale === 'ar' ? (r.customer?.nameAr ?? '—') : (r.customer?.nameEn ?? r.customer?.nameAr ?? '—'),
    balance: num(r.grandTotal),
    days: r.dueDate ? Math.floor((today.getTime() - r.dueDate.getTime()) / 86_400_000) : 0,
  }));
}

async function topDebtor(tx: Tx, orgId: string, today: Date, locale: string, outstanding: number) {
  void today;
  const rows = await tx.invoice.findMany({
    where: { organizationId: orgId, status: { in: [...OPEN_STATUSES] }, balanceDue: { gt: 0 } },
    select: { balanceDue: true, customer: { select: { nameAr: true, nameEn: true } } },
  });
  const byName = new Map<string, number>();
  for (const r of rows) {
    const name = locale === 'ar' ? (r.customer?.nameAr ?? '—') : (r.customer?.nameEn ?? r.customer?.nameAr ?? '—');
    byName.set(name, Math.round(((byName.get(name) ?? 0) + num(r.balanceDue)) * 100) / 100);
  }
  let top: { name: string; amount: number } | null = null;
  for (const [name, amount] of byName) {
    if (!top || amount > top.amount) top = { name, amount };
  }
  if (!top || outstanding <= 0) return null;
  return { topDebtor: top.name, topAmount: top.amount, share: Math.round((top.amount / outstanding) * 100) };
}
