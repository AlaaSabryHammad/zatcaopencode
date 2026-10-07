import 'server-only';
import type { Tx } from '@/server/db';
import { sum2 } from '@/server/modules/dashboard/stats';

const OPEN = ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] as const;
const NOTES = ['CREDIT_NOTE', 'DEBIT_NOTE'] as const;

export interface InvoiceFilters {
  q?: string;
  tab?: 'all' | 'drafts' | 'unpaid' | 'overdue' | 'paid' | 'notes' | 'attention';
  branchId?: string;
  customerId?: string;
  sortKey?: 'number' | 'issued' | 'due' | 'total';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface InvoiceRow {
  id: string;
  number: string | null;
  type: string;
  customer: string;
  branch: string | null;
  issued: string;
  due: string | null;
  status: string;
  overdue: boolean;
  total: number;
  balance: number;
}

const num = (v: { toNumber(): number } | null | undefined) => v?.toNumber() ?? 0;

export async function listInvoices(
  tx: Tx,
  orgId: string,
  f: InvoiceFilters,
  today: Date,
  locale: string,
): Promise<{ rows: InvoiceRow[]; total: number; counts: Record<string, number> }> {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, f.pageSize ?? 10));
  const tab = f.tab ?? 'all';

  const base = { organizationId: orgId };
  const where: Record<string, unknown> = { ...base };
  if (tab === 'drafts') where.status = 'draft';
  else if (tab === 'paid') where.status = 'paid';
  else if (tab === 'notes') where.type = { in: [...NOTES] };
  else if (tab === 'unpaid' || tab === 'overdue' || tab === 'attention') {
    where.status = { in: [...OPEN] };
    where.balanceDue = { gt: 0 };
  }
  if (f.branchId) where.branchId = f.branchId;
  if (f.customerId) where.customerId = f.customerId;

  const q = (f.q ?? '').trim().toLowerCase();
  const all = await tx.invoice.findMany({
    where: where as never,
    include: {
      customer: { select: { nameAr: true, nameEn: true, vatNumber: true } },
    },
    orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }],
    take: 2000,
  });
  const branchRows = await tx.branch.findMany({
    where: { organizationId: orgId },
    select: { id: true, nameAr: true, nameEn: true },
  });
  const branchNameOf = (id: string | null) => {
    const b = branchRows.find((x) => x.id === id);
    if (!b) return null;
    return locale === 'ar' ? b.nameAr : (b.nameEn ?? b.nameAr);
  };

  let rows = all;
  if (q) {
    rows = all.filter((r) =>
      [r.number ?? '', r.customer?.nameAr ?? '', r.customer?.nameEn ?? '', r.customer?.vatNumber ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }
  const isOverdue = (r: (typeof all)[number]) => r.dueDate != null && r.dueDate < today && num(r.balanceDue) > 0;
  if (tab === 'overdue') rows = rows.filter(isOverdue);
  else if (tab === 'unpaid') rows = rows.filter((r) => !isOverdue(r));
  else if (tab === 'attention') {
    const stale = new Date(today.getTime() - 7 * 86_400_000);
    rows = rows.filter((r) => isOverdue(r) || (r.status === 'draft' && r.createdAt < stale));
  }

  const dir = f.sortDir === 'asc' ? 1 : -1;
  const key = f.sortKey ?? 'issued';
  rows.sort((a, b) => {
    switch (key) {
      case 'number':
        return (a.number ?? '').localeCompare(b.number ?? '') * dir;
      case 'due':
        return ((a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0)) * dir;
      case 'total':
        return (num(a.grandTotal) - num(b.grandTotal)) * dir;
      case 'issued':
      default:
        return (a.issueDate.getTime() - b.issueDate.getTime()) * dir;
    }
  });

  const total = rows.length;
  const cname = (r: (typeof all)[number]) =>
    locale === 'ar' ? (r.customer?.nameAr ?? '—') : (r.customer?.nameEn ?? r.customer?.nameAr ?? '—');
  const out: InvoiceRow[] = rows.slice((page - 1) * pageSize, page * pageSize).map((r) => ({
    id: r.id,
    number: r.number,
    type: r.type,
    customer: cname(r),
    branch: branchNameOf(r.branchId),
    issued: r.issueDate.toISOString().slice(0, 10),
    due: r.dueDate ? r.dueDate.toISOString().slice(0, 10) : null,
    status: r.status,
    overdue: isOverdue(r),
    total: num(r.grandTotal),
    balance: num(r.balanceDue),
  }));

  // Tab counts (unfiltered by tab, respecting other filters is skipped for simplicity — counts are global).
  const [drafts, paid, openAll, notes] = await Promise.all([
    tx.invoice.count({ where: { ...base, status: 'draft' } }),
    tx.invoice.count({ where: { ...base, status: 'paid' } }),
    tx.invoice.findMany({ where: { ...base, status: { in: [...OPEN] }, balanceDue: { gt: 0 } }, select: { dueDate: true } }),
    tx.invoice.count({ where: { ...base, type: { in: [...NOTES] } } }),
  ]);
  const od = openAll.filter((r) => r.dueDate && r.dueDate < today).length;
  const stale = new Date(today.getTime() - 7 * 86_400_000);
  const staleDrafts = await tx.invoice.count({ where: { ...base, status: 'draft', createdAt: { lt: stale } } });
  const allCount = await tx.invoice.count({ where: base });
  return {
    rows: out,
    total,
    counts: {
      all: allCount, drafts, paid, notes,
      unpaid: openAll.length - od, overdue: od, attention: od + staleDrafts,
    },
  };
}

export interface InvoiceListStats {
  issuedYear: number;
  issuedCount: number;
  unpaid: number;
  unpaidCount: number;
  overdue: number;
  overdueCount: number;
  oldestOverdueDays: number | null;
  drafts: number;
  draftCount: number;
}

export async function invoiceListStats(tx: Tx, orgId: string, today: Date): Promise<InvoiceListStats> {
  const yearStart = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
  const [issued, open, drafts] = await Promise.all([
    tx.invoice.findMany({
      where: { organizationId: orgId, type: { in: ['TAX', 'SIMPLIFIED'] }, status: { notIn: ['draft', 'cancelled'] }, issueDate: { gte: yearStart } },
      select: { grandTotal: true },
    }),
    tx.invoice.findMany({
      where: { organizationId: orgId, status: { in: [...OPEN] }, balanceDue: { gt: 0 } },
      select: { grandTotal: true, dueDate: true },
    }),
    tx.invoice.findMany({ where: { organizationId: orgId, status: 'draft' }, select: { grandTotal: true } }),
  ]);
  let unpaid = 0;
  let overdue = 0;
  let overdueCount = 0;
  let oldest: number | null = null;
  for (const r of open) {
    const v = num(r.grandTotal);
    if (r.dueDate && r.dueDate < today) {
      overdue = Math.round((overdue + v) * 100) / 100;
      overdueCount += 1;
      const days = Math.floor((today.getTime() - r.dueDate.getTime()) / 86_400_000);
      oldest = oldest === null ? days : Math.max(oldest, days);
    } else {
      unpaid = Math.round((unpaid + v) * 100) / 100;
    }
  }
  return {
    issuedYear: sum2(issued, (r) => num(r.grandTotal)),
    issuedCount: issued.length,
    unpaid,
    unpaidCount: open.length - overdueCount,
    overdue,
    overdueCount,
    oldestOverdueDays: oldest,
    drafts: sum2(drafts, (r) => num(r.grandTotal)),
    draftCount: drafts.length,
  };
}

export interface InvoiceDetail {
  id: string;
  number: string | null;
  type: string;
  status: string;
  overdue: boolean;
  customer: { id: string | null; nameAr: string; nameEn: string | null; vatNumber: string | null; crNumber: string | null; email: string | null; phone: string | null; city: string | null; address: string | null } | null;
  branch: { id: string | null; nameAr: string; nameEn: string | null } | null;
  issueDate: string;
  supplyDate: string | null;
  dueDate: string | null;
  currency: string;
  poRef: string | null;
  contractRef: string | null;
  salesperson: string | null;
  notes: string | null;
  terms: string | null;
  lines: Array<{ id: string; position: number; productId: string | null; description: string; descriptionAr: string | null; qty: number; unit: string; unitPrice: number; discountPct: number; vatRate: number; net: number; vat: number; total: number }>;
  subtotal: number;
  discountTotal: number;
  taxable: number;
  vatTotal: number;
  otherCharges: number;
  rounding: number;
  grand: number;
  paid: number;
  balance: number;
  issuedAt: string | null;
  issuedBy: string | null;
  locked: boolean;
  original: { id: string; number: string | null } | null;
  payments: Array<{ id: string; amount: number; method: string; date: string; reference: string | null; by: string | null }>;
  audit: Array<{ id: string; at: string; actor: string | null; action: string; before: string | null; after: string | null; ip: string | null }>;
  relatedNotes: Array<{ id: string; number: string | null; status: string; total: number }>;
}

export async function getInvoiceDetail(tx: Tx, orgId: string, id: string, today: Date): Promise<InvoiceDetail | null> {
  const inv = await tx.invoice.findFirst({
    where: { id, organizationId: orgId },
    include: {
      customer: true,
      lines: { orderBy: { position: 'asc' } },
    },
  });
  if (!inv) return null;
  const branch = inv.branchId
    ? await tx.branch.findUnique({ where: { id: inv.branchId }, select: { id: true, nameAr: true, nameEn: true } })
    : null;
  const [payments, audit, related, issuer] = await Promise.all([
    tx.payment.findMany({
      where: { organizationId: orgId, invoiceId: id },
      orderBy: { date: 'desc' },
    }),
    tx.auditLog.findMany({ where: { organizationId: orgId, entity: 'invoice', entityId: id }, orderBy: { createdAt: 'asc' }, take: 100 }),
    tx.invoice.findMany({
      where: { organizationId: orgId, originalInvoiceId: id },
      select: { id: true, number: true, status: true, grandTotal: true },
      orderBy: { createdAt: 'desc' },
    }),
    inv.issuedById ? tx.user.findUnique({ where: { id: inv.issuedById }, select: { name: true } }) : null,
  ]);
  void issuer;
  const issuedByName = inv.issuedById
    ? ((await tx.user.findUnique({ where: { id: inv.issuedById }, select: { name: true } }))?.name ?? null)
    : null;
  const payUsers = await tx.user.findMany({
    where: { id: { in: payments.map((p) => p.createdById).filter((x): x is string => !!x) } },
    select: { id: true, name: true },
  });
  const payName = (uid: string | null) => payUsers.find((u) => u.id === uid)?.name ?? null;
  const auditUsers = await tx.user.findMany({
    where: { id: { in: audit.map((a) => a.actorId).filter((x): x is string => !!x) } },
    select: { id: true, name: true },
  });
  const actorName = (uid: string | null) => (uid ? (auditUsers.find((u) => u.id === uid)?.name ?? null) : 'System');
  const salesName = inv.salespersonId
    ? ((await tx.user.findUnique({ where: { id: inv.salespersonId }, select: { name: true } }))?.name ?? null)
    : null;
  const original = inv.originalInvoiceId
    ? await tx.invoice.findUnique({ where: { id: inv.originalInvoiceId }, select: { id: true, number: true } })
    : null;
  return {
    id: inv.id,
    number: inv.number,
    type: inv.type,
    status: inv.status,
    overdue: !!inv.dueDate && inv.dueDate < today && num(inv.balanceDue) > 0,
    customer: inv.customer
      ? {
          id: inv.customer.id, nameAr: inv.customer.nameAr, nameEn: inv.customer.nameEn,
          vatNumber: inv.customer.vatNumber, crNumber: inv.customer.crNumber, email: inv.customer.email,
          phone: inv.customer.phone, city: inv.customer.city, address: inv.customer.address,
        }
      : null,
    branch: inv.branchId ? { id: inv.branchId, nameAr: branch?.nameAr ?? '', nameEn: branch?.nameEn ?? null } : null,
    issueDate: inv.issueDate.toISOString().slice(0, 10),
    supplyDate: inv.supplyDate ? inv.supplyDate.toISOString().slice(0, 10) : null,
    dueDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : null,
    currency: inv.currency,
    poRef: inv.poRef,
    contractRef: inv.contractRef,
    salesperson: salesName,
    notes: inv.notes,
    terms: inv.terms,
    lines: inv.lines.map((l) => ({
      id: l.id, position: l.position, productId: l.productId, description: l.description,
      descriptionAr: l.descriptionAr, qty: Number(l.qty), unit: l.unit, unitPrice: num(l.unitPrice),
      discountPct: Number(l.discountPct), vatRate: Number(l.vatRate), net: num(l.netAmount),
      vat: num(l.vatAmount), total: num(l.lineTotal),
    })),
    subtotal: num(inv.subtotal),
    discountTotal: num(inv.discountTotal),
    taxable: num(inv.taxableAmount),
    vatTotal: num(inv.vatTotal),
    otherCharges: num(inv.otherCharges),
    rounding: num(inv.rounding),
    grand: num(inv.grandTotal),
    paid: num(inv.amountPaid),
    balance: num(inv.balanceDue),
    issuedAt: inv.issuedAt ? inv.issuedAt.toISOString() : null,
    issuedBy: issuedByName,
    locked: !!inv.lockedAt,
    original: original ? { id: original.id, number: original.number } : null,
    payments: payments.map((p) => ({
      id: p.id, amount: num(p.amount), method: p.method, date: p.date.toISOString().slice(0, 10),
      reference: p.reference, by: payName(p.createdById),
    })),
    audit: audit.map((a) => ({
      id: a.id, at: a.createdAt.toISOString(), actor: actorName(a.actorId), action: a.action,
      before: a.before ? JSON.stringify(a.before) : null, after: a.after ? JSON.stringify(a.after) : null,
      ip: a.ip,
    })),
    relatedNotes: related.map((r) => ({ id: r.id, number: r.number, status: r.status, total: num(r.grandTotal) })),
  };
}
