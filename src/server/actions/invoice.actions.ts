'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { requirePermission } from '@/server/rbac/guard';
import { withRls, type Tx } from '@/server/db';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { draftSchema } from '@/lib/validation/invoice';
import { invoiceTotals, lineTotals } from '@/lib/vat';
import { allocateNumber } from '@/server/modules/invoices/numbering';
import { hmac, randomToken } from '@/server/crypto';
import { sendInvoiceEmail as mailInvoice } from '@/server/mail';
import type { Prisma } from '@prisma/client';

async function requestMeta(): Promise<{ ip: string | null; ua: string | null }> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for');
    return { ip: fwd ? (fwd.split(',')[0]?.trim() || null) : h.get('x-real-ip'), ua: h.get('user-agent') };
  } catch {
    return { ip: null, ua: null };
  }
}

async function writeAudit(
  tx: Tx,
  o: { orgId: string; actorId: string | null; entity: string; entityId: string; action: string; before?: unknown; after?: unknown },
) {
  const m = await requestMeta();
  await tx.auditLog.create({
    data: {
      organizationId: o.orgId, actorId: o.actorId, entity: o.entity, entityId: o.entityId,
      action: o.action, before: (o.before ?? null) as Prisma.InputJsonValue, after: (o.after ?? null) as Prisma.InputJsonValue,
      ip: m.ip, userAgent: m.ua,
    },
  });
}

function totalsOf(d: z.output<typeof draftSchema>) {
  const t = invoiceTotals(
    d.lines.map((l) => ({ qty: l.qty, unitPrice: l.unitPrice, discountPct: l.discountPct, vatRate: l.vatRate })),
    { bulkDiscountPct: d.bulkDiscountPct, otherCharges: d.otherCharges },
  );
  const rows = d.lines.map((l, i) => {
    const c = lineTotals({ qty: l.qty, unitPrice: l.unitPrice, discountPct: l.discountPct, vatRate: l.vatRate });
    return { ...l, position: i, ...c };
  });
  return { t, rows };
}

function lineCreate(orgId: string, invoiceId: string, r: { productId?: string | null; description: string; descriptionAr?: string | null; qty: number; unit: string; unitPrice: number; discountPct: number; vatRate: number; position: number; net: number; vat: number; total: number }) {
  return {
    organizationId: orgId, invoiceId, position: r.position,
    productId: r.productId ?? null, description: r.description, descriptionAr: r.descriptionAr ?? null,
    qty: r.qty, unit: r.unit, unitPrice: r.unitPrice, discountPct: r.discountPct, vatRate: r.vatRate,
    netAmount: r.net, vatAmount: r.vat, lineTotal: r.total,
  };
}

/** Create a draft invoice (totals always recomputed server-side). */
export async function createDraft(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  if ((d.type === 'CREDIT_NOTE' || d.type === 'DEBIT_NOTE') && !d.originalInvoiceId) {
    return { ok: false, error: 'invoices.errors.originalRequired' };
  }
  const { t, rows } = totalsOf(d);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const inv = await withRls(rls, async (tx) => {
    const created = await tx.invoice.create({
      data: {
        organizationId: orgId, type: d.type, status: 'draft',
        customerId: d.customerId ?? null, branchId: d.branchId ?? null,
        issueDate: new Date(`${d.issueDate}T00:00:00Z`),
        supplyDate: d.supplyDate ? new Date(`${d.supplyDate}T00:00:00Z`) : null,
        dueDate: d.dueDate ? new Date(`${d.dueDate}T00:00:00Z`) : null,
        currency: (d.currency || 'SAR').toUpperCase(),
        poRef: d.poRef || null, contractRef: d.contractRef || null, salespersonId: d.salespersonId ?? null,
        notes: d.notes || null, terms: d.terms || null,
        subtotal: t.subtotal, discountTotal: t.discountTotal, taxableAmount: t.taxable,
        vatTotal: t.vatTotal, otherCharges: t.otherCharges, rounding: t.rounding, grandTotal: t.grand,
        amountPaid: 0, balanceDue: t.grand,
        originalInvoiceId: d.originalInvoiceId ?? null, reason: d.reason || null,
        lines: { create: rows.map((r) => lineCreate(orgId, '', r)) },
      },
      select: { id: true },
    });
    // lines need the real invoice id (nested create already sets it — lineCreate's '' is overwritten by the relation)
    await writeAudit(tx, { orgId, actorId: ctx.user.id, entity: 'invoice', entityId: created.id, action: 'create', after: { type: d.type, grand: t.grand } });
    return created;
  });
  return { ok: true, data: { id: inv.id } };
}

/** Replace a draft's header + lines. Rejected for locked (issued) invoices. */
export async function updateDraft(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = draftSchema.extend({ id: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...d } = parsed.data;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const existing = await withRls(rls, (tx) =>
    tx.invoice.findUnique({ where: { id }, select: { id: true, organizationId: true, status: true, lockedAt: true } }),
  );
  if (!existing || existing.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (existing.status !== 'draft' || existing.lockedAt) return { ok: false, error: 'invoices.errors.locked' };
  const { t, rows } = totalsOf(d);
  await withRls(rls, async (tx) => {
    await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
    await tx.invoice.update({
      where: { id },
      data: {
        type: d.type, customerId: d.customerId ?? null, branchId: d.branchId ?? null,
        issueDate: new Date(`${d.issueDate}T00:00:00Z`),
        supplyDate: d.supplyDate ? new Date(`${d.supplyDate}T00:00:00Z`) : null,
        dueDate: d.dueDate ? new Date(`${d.dueDate}T00:00:00Z`) : null,
        currency: (d.currency || 'SAR').toUpperCase(),
        poRef: d.poRef || null, contractRef: d.contractRef || null, salespersonId: d.salespersonId ?? null,
        notes: d.notes || null, terms: d.terms || null,
        subtotal: t.subtotal, discountTotal: t.discountTotal, taxableAmount: t.taxable,
        vatTotal: t.vatTotal, otherCharges: t.otherCharges, rounding: t.rounding, grandTotal: t.grand,
        balanceDue: t.grand,
        originalInvoiceId: d.originalInvoiceId ?? null, reason: d.reason || null,
        lines: { create: rows.map((r) => lineCreate(orgId, id, r)) },
      },
    });
    await writeAudit(tx, { orgId, actorId: ctx.user.id, entity: 'invoice', entityId: id, action: 'update', after: { grand: t.grand } });
  });
  return { ok: true };
}

/** Delete a draft (issued documents are immutable — use credit/debit notes). */
export async function deleteDraft(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ id: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const existing = await withRls(rls, (tx) =>
    tx.invoice.findUnique({ where: { id: parsed.data.id }, select: { id: true, organizationId: true, status: true, number: true } }),
  );
  if (!existing || existing.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (existing.status !== 'draft') return { ok: false, error: 'invoices.errors.locked' };
  await withRls(rls, async (tx) => {
    await tx.invoice.delete({ where: { id: existing.id } });
    await writeAudit(tx, { orgId, actorId: ctx.user.id, entity: 'invoice', entityId: existing.id, action: 'delete', before: { number: existing.number } });
  });
  return { ok: true };
}

/** Editable draft payload for the editor. */
export async function getDraft(input: unknown): Promise<ActionResult<{
  id: string; type: string; customerId: string | null; branchId: string | null;
  issueDate: string; supplyDate: string | null; dueDate: string | null; currency: string;
  poRef: string | null; contractRef: string | null; salespersonId: string | null;
  notes: string | null; terms: string | null; bulkDiscountPct: number; otherCharges: number;
  originalInvoiceId: string | null; reason: string | null;
  lines: Array<{ productId: string | null; description: string; descriptionAr: string | null; qty: number; unit: string; unitPrice: number; discountPct: number; vatRate: number }>;
}>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ id: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const inv = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.invoice.findUnique({
      where: { id: parsed.data.id },
      include: { lines: { orderBy: { position: 'asc' } } },
    }),
  );
  if (!inv || inv.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (inv.status !== 'draft') return { ok: false, error: 'invoices.errors.locked' };
  return {
    ok: true,
    data: {
      id: inv.id, type: inv.type, customerId: inv.customerId, branchId: inv.branchId,
      issueDate: inv.issueDate.toISOString().slice(0, 10),
      supplyDate: inv.supplyDate ? inv.supplyDate.toISOString().slice(0, 10) : null,
      dueDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : null,
      currency: inv.currency, poRef: inv.poRef, contractRef: inv.contractRef, salespersonId: inv.salespersonId,
      notes: inv.notes, terms: inv.terms, bulkDiscountPct: 0, otherCharges: Number(inv.otherCharges),
      originalInvoiceId: inv.originalInvoiceId, reason: inv.reason,
      lines: inv.lines.map((l) => ({
        productId: l.productId, description: l.description, descriptionAr: l.descriptionAr,
        qty: Number(l.qty), unit: l.unit, unitPrice: Number(l.unitPrice),
        discountPct: Number(l.discountPct), vatRate: Number(l.vatRate),
      })),
    },
  };
}

/** Issue a draft: validate → allocate number → lock. One transaction. */
export async function issueInvoice(input: unknown): Promise<ActionResult<{ number: string }>> {
  const ctx = await requirePermission('invoice.issue');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ id: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };

  const pre = await withRls(rls, (tx) =>
    tx.invoice.findUnique({
      where: { id: parsed.data.id },
      include: {
        lines: true,
        customer: { select: { vatNumber: true } },
        organization: { select: { vatNumber: true, nameAr: true } },
      },
    }),
  );
  if (!pre || pre.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (pre.status !== 'draft' || pre.lockedAt) return { ok: false, error: 'invoices.errors.locked' };
  if (pre.lines.length === 0) return { ok: false, error: 'invoices.errors.emptyLines' };
  if (pre.type === 'TAX' && !pre.customerId) return { ok: false, error: 'invoices.errors.customerRequired' };
  if (pre.type === 'TAX' && pre.customer && !pre.customer.vatNumber) return { ok: false, error: 'invoices.errors.buyerVatRequired' };
  if (!pre.organization.vatNumber) return { ok: false, error: 'invoices.errors.sellerVatRequired' };
  if ((pre.type === 'CREDIT_NOTE' || pre.type === 'DEBIT_NOTE') && !pre.originalInvoiceId) {
    return { ok: false, error: 'invoices.errors.originalRequired' };
  }
  const grand = Number(pre.grandTotal);
  if (pre.type === 'CREDIT_NOTE' && grand >= 0) return { ok: false, error: 'invoices.errors.creditNegative' };
  if (pre.type !== 'CREDIT_NOTE' && grand <= 0) return { ok: false, error: 'invoices.errors.positiveTotal' };

  const year = pre.issueDate.getUTCFullYear();
  const defaults: Record<string, string> = {
    TAX: 'INV-{YYYY}-{#####}', SIMPLIFIED: 'SIM-{YYYY}-{#####}',
    CREDIT_NOTE: 'CN-{YYYY}-{#####}', DEBIT_NOTE: 'DN-{YYYY}-{#####}',
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await withRls(rls, async (tx) => {
        const seq = await tx.invoiceSequence.findFirst({
          where: { organizationId: orgId, key: `${orgId}:${pre.branchId ?? '-'}:${pre.type}:${year}` },
          select: { prefix: true, nextValue: true },
        });
        const alloc = await allocateNumber(tx, orgId, pre.branchId, pre.type, year, seq?.prefix ?? defaults[pre.type]!, seq?.nextValue ?? 1);
        const updated = await tx.invoice.update({
          where: { id: pre.id },
          data: {
            number: alloc.number, status: pre.type === 'CREDIT_NOTE' ? 'credited' : 'issued',
            issuedAt: new Date(), issuedById: ctx.user.id, lockedAt: new Date(), balanceDue: pre.grandTotal,
          },
          select: { number: true },
        });
        await writeAudit(tx, {
          orgId, actorId: ctx.user.id, entity: 'invoice', entityId: pre.id, action: 'issue',
          before: { status: 'draft' }, after: { status: updated.number ? 'issued' : 'issued', number: updated.number, grand },
        });
        return updated;
      });
      return { ok: true, data: { number: out.number ?? '' } };
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'P2002' && attempt === 0) continue;
      throw e;
    }
  }
  return { ok: false, error: 'invoices.errors.issueFailed' };
}

/** Record a payment against an open invoice. */
export async function recordPayment(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('payment.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({
    invoiceId: z.string().uuid('validation.invalid'),
    amount: z.coerce.number().positive('validation.invalid'),
    method: z.enum(['cash', 'bank', 'mada', 'card', 'apple_pay', 'cheque', 'transfer']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalid'),
    reference: z.string().trim().max(80).optional().nullable(),
  }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const inv = await withRls(rls, (tx) =>
    tx.invoice.findUnique({ where: { id: d.invoiceId }, select: { id: true, organizationId: true, status: true, grandTotal: true, amountPaid: true, balanceDue: true, number: true } }),
  );
  if (!inv || inv.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (inv.status === 'draft' || inv.status === 'cancelled') return { ok: false, error: 'invoices.errors.notOpen' };
  const balance = Number(inv.balanceDue);
  if (d.amount - balance > 0.005) return { ok: false, error: 'invoices.errors.overpayment' };
  await withRls(rls, async (tx) => {
    await tx.payment.create({
      data: {
        organizationId: orgId, invoiceId: inv.id, amount: d.amount, method: d.method,
        date: new Date(`${d.date}T00:00:00Z`), reference: d.reference || null, createdById: ctx.user.id,
      },
    });
    const paid = Math.round((Number(inv.amountPaid) + d.amount) * 100) / 100;
    const due = Math.round((Number(inv.grandTotal) - paid) * 100) / 100;
    await tx.invoice.update({
      where: { id: inv.id },
      data: { amountPaid: paid, balanceDue: due, status: due <= 0.005 ? 'paid' : 'partially_paid' },
    });
    await writeAudit(tx, {
      orgId, actorId: ctx.user.id, entity: 'invoice', entityId: inv.id, action: 'payment',
      before: { balance }, after: { balance: due, paid },
    });
  });
  return { ok: true };
}

/** Create a DRAFT credit/debit note prefilled from an issued invoice. */
export async function createNoteFrom(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requirePermission('invoice.creditnote');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({
    invoiceId: z.string().uuid('validation.invalid'),
    type: z.enum(['CREDIT_NOTE', 'DEBIT_NOTE']),
    reason: z.string().trim().min(2, 'validation.required').max(300),
  }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const src = await withRls(rls, (tx) =>
    tx.invoice.findUnique({
      where: { id: parsed.data.invoiceId },
      include: { lines: { orderBy: { position: 'asc' } } },
    }),
  );
  if (!src || src.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (src.status === 'draft' || src.status === 'cancelled') return { ok: false, error: 'invoices.errors.notOpen' };
  if (src.type === 'CREDIT_NOTE' || src.type === 'DEBIT_NOTE') return { ok: false, error: 'invoices.errors.noteOnNote' };
  const sign = parsed.data.type === 'CREDIT_NOTE' ? -1 : 1;
  const lines = src.lines.map((l) => ({
    productId: l.productId, description: l.description, descriptionAr: l.descriptionAr,
    qty: Number(l.qty), unit: l.unit, unitPrice: sign * Number(l.unitPrice),
    discountPct: Number(l.discountPct), vatRate: Number(l.vatRate),
  }));
  const created = await withRls(rls, async (tx) => {
    // reuse totals math via a draft-shaped insert
    const { invoiceTotals: totals } = await import('@/lib/vat');
    const t = totals(lines.map((l) => ({ qty: l.qty, unitPrice: l.unitPrice, discountPct: l.discountPct, vatRate: l.vatRate })), {});
    const inv = await tx.invoice.create({
      data: {
        organizationId: orgId, type: parsed.data.type, status: 'draft',
        customerId: src.customerId, branchId: src.branchId,
        issueDate: new Date(), currency: src.currency,
        subtotal: t.subtotal, discountTotal: t.discountTotal, taxableAmount: t.taxable,
        vatTotal: t.vatTotal, otherCharges: 0, rounding: 0, grandTotal: t.grand,
        amountPaid: 0, balanceDue: t.grand,
        originalInvoiceId: src.id, reason: parsed.data.reason,
        lines: {
          create: lines.map((l, i) => {
            const net = Math.round(l.qty * l.unitPrice * (1 - l.discountPct / 100) * 100) / 100;
            const vat = Math.round(((net * l.vatRate) / 100) * 100) / 100;
            return {
              organizationId: orgId, position: i, productId: l.productId, description: l.description,
              descriptionAr: l.descriptionAr, qty: l.qty, unit: l.unit, unitPrice: l.unitPrice,
              discountPct: l.discountPct, vatRate: l.vatRate, netAmount: net, vatAmount: vat, lineTotal: Math.round((net + vat) * 100) / 100,
            };
          }),
        },
      },
      select: { id: true },
    });
    await writeAudit(tx, { orgId, actorId: ctx.user.id, entity: 'invoice', entityId: inv.id, action: 'create-note', after: { type: parsed.data.type, original: src.number } });
    return inv;
  });
  return { ok: true, data: { id: created.id } };
}

/** Create (or reuse) a 30-day share link; returns the raw token once. */
export async function createShareLink(input: unknown): Promise<ActionResult<{ token: string }>> {
  const ctx = await requirePermission('invoice.view');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ invoiceId: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const inv = await withRls(rls, (tx) =>
    tx.invoice.findUnique({ where: { id: parsed.data.invoiceId }, select: { id: true, organizationId: true, status: true } }),
  );
  if (!inv || inv.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (inv.status === 'draft') return { ok: false, error: 'invoices.errors.notIssued' };
  const token = randomToken(32);
  await withRls(rls, (tx) =>
    tx.shareLink.create({
      data: {
        organizationId: orgId, invoiceId: inv.id, tokenHash: hmac(token, 'token:SHARE'),
        expiresAt: new Date(Date.now() + 30 * 86_400_000), createdById: ctx.user.id,
      },
    }),
  );
  return { ok: true, data: { token } };
}

/** Email the invoice (bilingual summary + share link) to the customer. */
export async function sendInvoiceEmail(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('invoice.view');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ invoiceId: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const inv = await withRls(rls, (tx) =>
    tx.invoice.findUnique({
      where: { id: parsed.data.invoiceId },
      include: { customer: { select: { email: true, nameAr: true, nameEn: true } } },
    }),
  );
  if (!inv || inv.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (!inv.customer?.email) return { ok: false, error: 'invoices.errors.noCustomerEmail' };
  if (inv.status === 'draft') return { ok: false, error: 'invoices.errors.notIssued' };
  const token = randomToken(32);
  await withRls(rls, (tx) =>
    tx.shareLink.create({
      data: {
        organizationId: orgId, invoiceId: inv.id, tokenHash: hmac(token, 'token:SHARE'),
        expiresAt: new Date(Date.now() + 30 * 86_400_000), createdById: ctx.user.id,
      },
    }),
  );
  try {
    await mailInvoice({
      to: inv.customer.email,
      customerName: inv.customer.nameEn ?? inv.customer.nameAr,
      number: inv.number ?? '',
      total: Number(inv.grandTotal),
      currency: inv.currency,
      token,
      locale: ctx.user.locale,
    });
  } catch (e) {
    console.error('sendInvoiceEmail failed:', e);
    return { ok: false, error: 'invoices.errors.emailFailed' };
  }
  return { ok: true };
}

// ── editor lookups ──

export async function searchCustomers(input: unknown): Promise<ActionResult<Array<{ id: string; name: string; vat: string | null; balance: number }>>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const q = typeof input === 'string' ? input : (input as { q?: string })?.q ?? '';
  const rows = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.customer.findMany({
      where: {
        organizationId: orgId,
        OR: q.trim()
          ? [
              { nameAr: { contains: q.trim(), mode: 'insensitive' } },
              { nameEn: { contains: q.trim(), mode: 'insensitive' } },
              { vatNumber: { contains: q.trim().replace(/\D/g, '') } },
            ]
          : undefined,
      },
      orderBy: { nameAr: 'asc' },
      take: 8,
      select: { id: true, nameAr: true, nameEn: true, vatNumber: true, paymentTermsDays: true },
    }),
  );
  const ids = rows.map((r) => r.id);
  const bals = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.invoice.findMany({
      where: { organizationId: orgId, customerId: { in: ids }, balanceDue: { gt: 0 }, status: { in: ['issued', 'viewed', 'sent', 'partially_paid', 'pending'] } },
      select: { customerId: true, balanceDue: true },
    }),
  );
  const byId = new Map<string, number>();
  for (const b of bals) {
    if (!b.customerId) continue;
    byId.set(b.customerId, Math.round(((byId.get(b.customerId) ?? 0) + Number(b.balanceDue)) * 100) / 100);
  }
  return { ok: true, data: rows.map((r) => ({ id: r.id, name: `${r.nameAr}${r.nameEn ? ` · ${r.nameEn}` : ''}`, vat: r.vatNumber, balance: byId.get(r.id) ?? 0 })) };
}

export async function searchProducts(input: unknown): Promise<ActionResult<Array<{ id: string; sku: string; nameAr: string; nameEn: string | null; unit: string; price: number; vatRate: number }>>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const q = typeof input === 'string' ? input : (input as { q?: string })?.q ?? '';
  const rows = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.product.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
        ...(q.trim()
          ? {
              OR: [
                { nameAr: { contains: q.trim(), mode: 'insensitive' } },
                { nameEn: { contains: q.trim(), mode: 'insensitive' } },
                { sku: { contains: q.trim(), mode: 'insensitive' } },
                { barcode: q.trim() },
              ],
            }
          : {}),
      },
      orderBy: { nameEn: 'asc' },
      take: 8,
      select: { id: true, sku: true, nameAr: true, nameEn: true, unit: true, sellingPrice: true, vatRate: true },
    }),
  );
  return {
    ok: true,
    data: rows.map((r) => ({ id: r.id, sku: r.sku, nameAr: r.nameAr, nameEn: r.nameEn, unit: r.unit, price: Number(r.sellingPrice), vatRate: Number(r.vatRate) })),
  };
}

export async function listBranches(): Promise<ActionResult<Array<{ id: string; code: string; nameAr: string; nameEn: string | null }>>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const rows = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.branch.findMany({ where: { organizationId: orgId }, orderBy: [{ isHeadOffice: 'desc' }, { code: 'asc' }] }),
  );
  return { ok: true, data: rows.map((b) => ({ id: b.id, code: b.code, nameAr: b.nameAr, nameEn: b.nameEn })) };
}

export async function listSalesMembers(): Promise<ActionResult<Array<{ id: string; name: string }>>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const rows = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.membership.findMany({
      where: { organizationId: orgId, status: 'active' },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    }),
  );
  return { ok: true, data: rows.map((m) => ({ id: m.user.id, name: m.user.name })) };
}

export async function previewNumber(input: unknown): Promise<ActionResult<{ number: string }>> {
  const ctx = await requirePermission('invoice.create');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({
    branchId: z.string().uuid('validation.invalid').optional().nullable(),
    type: z.enum(['TAX', 'SIMPLIFIED', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const year = new Date().getUTCFullYear();
  const defaults: Record<string, string> = {
    TAX: 'INV-{YYYY}-{#####}', SIMPLIFIED: 'SIM-{YYYY}-{#####}',
    CREDIT_NOTE: 'CN-{YYYY}-{#####}', DEBIT_NOTE: 'DN-{YYYY}-{#####}',
  };
  const { renderNumber } = await import('@/lib/numbering');
  const row = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.invoiceSequence.findFirst({
      where: { organizationId: orgId, key: `${orgId}:${parsed.data.branchId ?? '-'}:${parsed.data.type}:${year}` },
      select: { prefix: true, nextValue: true },
    }),
  );
  return { ok: true, data: { number: renderNumber(row?.prefix ?? defaults[parsed.data.type]!, year, row?.nextValue ?? 1) } };
}
