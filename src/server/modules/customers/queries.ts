import 'server-only';
import type { Tx } from '@/server/db';
import { sum2 } from '@/server/modules/dashboard/stats';

const OPEN = ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] as const;

export interface CustomerFilters {
  q?: string;
  type?: 'company' | 'individual';
  city?: string;
  hasBalance?: boolean;
  sortKey?: 'name' | 'outstanding' | 'sales' | 'avgPay' | 'last';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CustomerRow {
  id: string;
  type: string;
  nameAr: string;
  nameEn: string | null;
  vatNumber: string | null;
  city: string | null;
  tags: string[];
  paymentTermsDays: number;
  outstanding: number;
  sales12mo: number;
  avgPayDays: number | null;
  lastActivity: string | null;
}

const num = (v: { toNumber(): number } | null | undefined) => v?.toNumber() ?? 0;

/** Aggregate invoices+payments per customer (12-month window + lifetime open). */
async function aggregate(tx: Tx, orgId: string, since: Date) {
  const [invoices, payments] = await Promise.all([
    tx.invoice.findMany({
      where: {
        organizationId: orgId,
        customerId: { not: null },
        type: { in: ['TAX', 'SIMPLIFIED'] },
        status: { notIn: ['draft', 'cancelled'] },
        issueDate: { gte: since },
      },
      select: { customerId: true, subtotal: true, balanceDue: true, status: true, issueDate: true, dueDate: true, id: true },
    }),
    tx.payment.findMany({
      where: { organizationId: orgId, customerId: { not: null }, date: { gte: since } },
      select: { customerId: true, invoiceId: true, amount: true, date: true },
    }),
  ]);
  const byInvPay = new Map<string, Date>();
  for (const p of payments) {
    if (!p.invoiceId) continue;
    const prev = byInvPay.get(p.invoiceId);
    if (!prev || p.date > prev) byInvPay.set(p.invoiceId, p.date);
  }
  const agg = new Map<string, { sales: number; open: number; payDays: number[]; last: Date | null }>();
  const touch = (id: string) => {
    let e = agg.get(id);
    if (!e) {
      e = { sales: 0, open: 0, payDays: [], last: null };
      agg.set(id, e);
    }
    return e;
  };
  for (const inv of invoices) {
    const id = inv.customerId as string;
    const e = touch(id);
    e.sales = Math.round((e.sales + num(inv.subtotal)) * 100) / 100;
    if (inv.balanceDue !== null && num(inv.balanceDue) > 0 && (OPEN as readonly string[]).includes(inv.status)) {
      e.open = Math.round((e.open + num(inv.balanceDue)) * 100) / 100;
    }
    if (inv.status === 'paid') {
      const lastPay = byInvPay.get(inv.id);
      if (lastPay) {
        const days = Math.round((lastPay.getTime() - inv.issueDate.getTime()) / 86_400_000);
        e.payDays.push(days);
      }
    }
    const last = e.last;
    if (!last || inv.issueDate > last) e.last = inv.issueDate;
  }
  for (const p of payments) {
    if (!p.customerId) continue;
    const e = touch(p.customerId);
    if (!e.last || p.date > e.last) e.last = p.date;
  }
  return agg;
}

const avg = (xs: number[]): number | null => (xs.length === 0 ? null : Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10);

export async function listCustomers(
  tx: Tx,
  orgId: string,
  f: CustomerFilters,
): Promise<{ rows: CustomerRow[]; total: number }> {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, f.pageSize ?? 10));
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);

  const where: { organizationId: string; type?: 'company' | 'individual'; city?: string } = { organizationId: orgId };
  if (f.type) where.type = f.type;
  if (f.city) where.city = f.city;
  const all = await tx.customer.findMany({ where, orderBy: { nameAr: 'asc' } });

  const q = (f.q ?? '').trim().toLowerCase();
  const filtered = q
    ? all.filter((c) =>
        [c.nameAr, c.nameEn ?? '', c.vatNumber ?? '', c.crNumber ?? '', c.email ?? '', c.phone ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : all;

  const agg = await aggregate(tx, orgId, since);
  let rows: CustomerRow[] = filtered.map((c) => {
    const a = agg.get(c.id);
    const payDays = a && a.payDays.length > 0 ? avg(a.payDays) : null;
    return {
      id: c.id,
      type: c.type,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      vatNumber: c.vatNumber,
      city: c.city,
      tags: c.tags,
      paymentTermsDays: c.paymentTermsDays,
      outstanding: a?.open ?? 0,
      sales12mo: a?.sales ?? 0,
      avgPayDays: payDays,
      lastActivity: a?.last ? a.last.toISOString() : c.createdAt.toISOString(),
    };
  });
  if (f.hasBalance) rows = rows.filter((r) => r.outstanding > 0);

  const dir = f.sortDir === 'desc' ? -1 : 1;
  const key = f.sortKey ?? 'name';
  const str = (r: CustomerRow) => `${r.nameAr} ${r.nameEn ?? ''}`.toLowerCase();
  rows.sort((a, b) => {
    switch (key) {
      case 'outstanding':
        return (a.outstanding - b.outstanding) * dir || str(a).localeCompare(str(b));
      case 'sales':
        return (a.sales12mo - b.sales12mo) * dir || str(a).localeCompare(str(b));
      case 'avgPay':
        return ((a.avgPayDays ?? Number.MAX_SAFE_INTEGER) - (b.avgPayDays ?? Number.MAX_SAFE_INTEGER)) * dir;
      case 'last':
        return ((a.lastActivity ?? '') < (b.lastActivity ?? '') ? -1 : 1) * dir;
      case 'name':
      default:
        return str(a).localeCompare(str(b)) * dir;
    }
  });

  const total = rows.length;
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total };
}

export async function customerCities(tx: Tx, orgId: string): Promise<string[]> {
  const rows = await tx.customer.findMany({
    where: { organizationId: orgId, city: { not: null } },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  });
  return rows.map((r) => r.city).filter((c): c is string => !!c);
}

export interface CustomerHeaderStats {
  active: number;
  outstanding: number;
  openInvoices: number;
  avgPayDays: number | null;
  avgPayDelta: number | null;
  newCompanies: number;
  newIndividuals: number;
}

export async function customerHeaderStats(tx: Tx, orgId: string, today: Date): Promise<CustomerHeaderStats> {
  const d90 = new Date(today.getTime() - 90 * 86_400_000);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const [invoiced90, open, paidAll, created] = await Promise.all([
    tx.invoice.findMany({
      where: { organizationId: orgId, type: { in: ['TAX', 'SIMPLIFIED'] }, status: { notIn: ['draft', 'cancelled'] }, issueDate: { gte: d90 } },
      select: { customerId: true },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, status: { in: [...OPEN] }, balanceDue: { gt: 0 } },
      select: { grandTotal: true },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, status: 'paid' },
      select: { issueDate: true, id: true },
    }),
    tx.customer.findMany({ where: { organizationId: orgId, createdAt: { gte: monthStart } }, select: { type: true } }),
  ]);
  const payIds = paidAll.map((p) => p.id);
  const payDates = payIds.length
    ? await tx.payment.findMany({ where: { organizationId: orgId, invoiceId: { in: payIds } }, select: { invoiceId: true, date: true } })
    : [];
  const lastPay = new Map<string, Date>();
  for (const p of payDates) {
    if (!p.invoiceId) continue;
    const prev = lastPay.get(p.invoiceId);
    if (!prev || p.date > prev) lastPay.set(p.invoiceId, p.date);
  }
  const days: number[] = [];
  for (const inv of paidAll) {
    const lp = lastPay.get(inv.id);
    if (lp) days.push(Math.round((lp.getTime() - inv.issueDate.getTime()) / 86_400_000));
  }
  // previous quarter average for the delta (rough "vs Q2" style comparison)
  const qStart = new Date(Date.UTC(today.getUTCFullYear(), Math.floor(today.getUTCMonth() / 3) * 3, 1));
  const prevQ = await tx.invoice.findMany({
    where: {
      organizationId: orgId,
      status: 'paid',
      issueDate: { gte: new Date(qStart.getTime() - 92 * 86_400_000), lt: qStart },
    },
    select: { issueDate: true, id: true },
  });
  const prevIds = prevQ.map((p) => p.id);
  const prevPayDates = prevIds.length
    ? await tx.payment.findMany({ where: { organizationId: orgId, invoiceId: { in: prevIds } }, select: { invoiceId: true, date: true } })
    : [];
  const prevLast = new Map<string, Date>();
  for (const p of prevPayDates) {
    if (!p.invoiceId) continue;
    const prev = prevLast.get(p.invoiceId);
    if (!prev || p.date > prev) prevLast.set(p.invoiceId, p.date);
  }
  const prevDays: number[] = [];
  for (const inv of prevQ) {
    const lp = prevLast.get(inv.id);
    if (lp) prevDays.push(Math.round((lp.getTime() - inv.issueDate.getTime()) / 86_400_000));
  }
  const a = avg(days);
  const pa = avg(prevDays);
  return {
    active: new Set(invoiced90.map((r) => r.customerId)).size,
    outstanding: sum2(open, (r) => num(r.grandTotal)),
    openInvoices: open.length,
    avgPayDays: a === null ? null : Math.round(a),
    avgPayDelta: a === null || pa === null ? null : Math.round((a - pa) * 10) / 10,
    newCompanies: created.filter((c) => c.type === 'company').length,
    newIndividuals: created.filter((c) => c.type === 'individual').length,
  };
}

export interface CustomerProfile {
  id: string;
  type: string;
  nameAr: string;
  nameEn: string | null;
  vatNumber: string | null;
  crNumber: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  creditLimit: number | null;
  paymentTermsDays: number;
  tags: string[];
  stats: {
    sales12mo: number;
    outstanding: number;
    openCount: number;
    overdueCount: number;
    paidCount: number;
    paidCollected: number;
    overdueAmount: number;
    oldestOverdueDays: number | null;
    avgPayDays: number | null;
  };
  monthly: Array<{ key: string; label: string; invoiced: number; paid: number }>;
  invoices: Array<{ id: string; number: string | null; issue: string; due: string | null; status: string; total: number }>;
  payments: Array<{ id: string; amount: number; method: string; date: string; invoiceNumber: string | null; reference: string | null }>;
  creditNotes: Array<{ id: string; number: string | null; issue: string; status: string; total: number }>;
  contacts: Array<{ id: string; name: string; role: string | null; email: string | null; phone: string | null }>;
  insight: { avgLateDays: number; maxDays: number } | null;
}

export async function getCustomerProfile(
  tx: Tx,
  orgId: string,
  id: string,
  today: Date,
  locale: string,
): Promise<CustomerProfile | null> {
  const c = await tx.customer.findFirst({ where: { id, organizationId: orgId } });
  if (!c) return null;
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);
  const [invoices, payments, notes, contacts] = await Promise.all([
    tx.invoice.findMany({
      where: { organizationId: orgId, customerId: id, status: { notIn: ['cancelled'] }, issueDate: { gte: since } },
      orderBy: { issueDate: 'desc' },
      select: { id: true, number: true, type: true, status: true, subtotal: true, grandTotal: true, balanceDue: true, issueDate: true, dueDate: true },
    }),
    tx.payment.findMany({
      where: { organizationId: orgId, customerId: id },
      orderBy: { date: 'desc' },
      take: 50,
      select: { id: true, amount: true, method: true, date: true, reference: true, invoice: { select: { number: true } } },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, customerId: id, type: { in: ['CREDIT_NOTE', 'DEBIT_NOTE'] } },
      orderBy: { issueDate: 'desc' },
      select: { id: true, number: true, issueDate: true, status: true, grandTotal: true },
    }),
    tx.customerContact.findMany({ where: { organizationId: orgId, customerId: id }, orderBy: { createdAt: 'asc' } }),
  ]);
  const salesDocs = invoices.filter((i) => i.type === 'TAX' || i.type === 'SIMPLIFIED');
  const sales12mo = sum2(salesDocs, (r) => num(r.subtotal));
  const open = salesDocs.filter((r) => num(r.balanceDue) > 0 && (OPEN as readonly string[]).includes(r.status));
  const outstanding = sum2(open, (r) => num(r.balanceDue));
  const overdue = open.filter((r) => r.dueDate && r.dueDate < today);
  const overdueAmount = sum2(overdue, (r) => num(r.balanceDue));
  const oldest = overdue.length ? Math.max(...overdue.map((r) => Math.floor((today.getTime() - (r.dueDate as Date).getTime()) / 86_400_000))) : null;
  const paidDocs = salesDocs.filter((r) => r.status === 'paid');
  const paidCollected = sum2(paidDocs, (r) => num(r.grandTotal));
  // payment dates per invoice for avg-pay + late stats
  const payByInv = await tx.payment.findMany({
    where: { organizationId: orgId, customerId: id, invoiceId: { not: null } },
    select: { invoiceId: true, date: true },
  });
  const lastPay = new Map<string, Date>();
  for (const p of payByInv) {
    if (!p.invoiceId) continue;
    const prev = lastPay.get(p.invoiceId);
    if (!prev || p.date > prev) lastPay.set(p.invoiceId, p.date);
  }
  const payDays: number[] = [];
  const lateDays: number[] = [];
  for (const inv of paidDocs) {
    const lp = lastPay.get(inv.id);
    if (!lp) continue;
    payDays.push(Math.round((lp.getTime() - inv.issueDate.getTime()) / 86_400_000));
    if (inv.dueDate) lateDays.push(Math.round((lp.getTime() - inv.dueDate.getTime()) / 86_400_000));
  }
  const avgPay = avg(payDays);
  const latePos = lateDays.filter((x) => x > 0);

  // monthly invoiced vs paid (12 months)
  const months: Array<{ key: string; label: string; invoiced: number; paid: number }> = [];
  const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
  for (let i = 11; i >= 0; i--) {
    const ref = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    const y = ref.getUTCFullYear();
    const m = ref.getUTCMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));
    const inv = salesDocs.filter((r) => r.issueDate >= start && r.issueDate < end);
    const pay = payments.filter((p) => p.date >= start && p.date < end);
    months.push({
      key,
      label: fmt.format(new Date(Date.UTC(y, m, 1))),
      invoiced: sum2(inv, (r) => num(r.grandTotal)),
      paid: sum2(pay, (r) => num(r.amount)),
    });
  }

  return {
    id: c.id,
    type: c.type,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    vatNumber: c.vatNumber,
    crNumber: c.crNumber,
    email: c.email,
    phone: c.phone,
    city: c.city,
    address: c.address,
    creditLimit: c.creditLimit ? num(c.creditLimit) : null,
    paymentTermsDays: c.paymentTermsDays,
    tags: c.tags,
    stats: {
      sales12mo,
      outstanding,
      openCount: open.length,
      overdueCount: overdue.length,
      paidCount: paidDocs.length,
      paidCollected,
      overdueAmount,
      oldestOverdueDays: oldest,
      avgPayDays: avgPay === null ? null : Math.round(avgPay),
    },
    monthly: months,
    invoices: invoices.slice(0, 20).map((r) => ({
      id: r.id,
      number: r.number,
      issue: r.issueDate.toISOString().slice(0, 10),
      due: r.dueDate ? r.dueDate.toISOString().slice(0, 10) : null,
      status: r.status,
      total: num(r.grandTotal),
    })),
    payments: payments.map((p) => ({
      id: p.id,
      amount: num(p.amount),
      method: p.method,
      date: p.date.toISOString().slice(0, 10),
      invoiceNumber: p.invoice?.number ?? null,
      reference: p.reference,
    })),
    creditNotes: notes.map((n) => ({
      id: n.id,
      number: n.number,
      issue: n.issueDate.toISOString().slice(0, 10),
      status: n.status,
      total: num(n.grandTotal),
    })),
    contacts: contacts.map((x) => ({ id: x.id, name: x.name, role: x.role, email: x.email, phone: x.phone })),
    insight: latePos.length ? { avgLateDays: Math.round((latePos.reduce((a, b) => a + b, 0) / latePos.length) * 10) / 10, maxDays: Math.max(...latePos) } : null,
  };
}
