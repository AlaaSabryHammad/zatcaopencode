'use server';

import { z } from 'zod';
import { requirePermission } from '@/server/rbac/guard';
import { withRls } from '@/server/db';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { customerSchema, contactSchema, customerCsvSchema } from '@/lib/validation/customer';
import { parseCsv, rowsToObjects } from '@/lib/csv';

function clean<T extends Record<string, unknown>>(v: T): T {
  const o: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v)) {
    o[k] = val === '' || val === undefined ? null : val;
  }
  return o as T;
}

export async function createCustomer(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requirePermission('customer.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const d = clean({ ...parsed.data });
  const c = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.customer.create({
      data: {
        organizationId: orgId,
        type: d.type,
        nameAr: d.nameAr as string,
        nameEn: d.nameEn as string | null,
        vatNumber: (d.vatNumber as string | null) || null,
        crNumber: d.crNumber as string | null,
        email: d.email as string | null,
        phone: d.phone as string | null,
        city: d.city as string | null,
        address: d.address as string | null,
        creditLimit: d.creditLimit as number | null,
        paymentTermsDays: d.paymentTermsDays as number,
        notes: d.notes as string | null,
        tags: (d.tags as string[]) ?? [],
      },
    }),
  );
  return { ok: true, data: { id: c.id } };
}

const updateSchema = customerSchema.partial().extend({ id: z.string().uuid('validation.invalid') });

/** Editable fields for the editor drawer. */
export async function getCustomer(input: unknown): Promise<ActionResult<{
  id: string; type: 'company' | 'individual'; nameAr: string; nameEn: string | null;
  vatNumber: string | null; crNumber: string | null; email: string | null; phone: string | null;
  city: string | null; address: string | null; creditLimit: number | null; paymentTermsDays: number;
  notes: string | null; tags: string[];
}>> {
  const ctx = await requirePermission('customer.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ id: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const c = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.customer.findUnique({ where: { id: parsed.data.id } }),
  );
  if (!c || c.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  return {
    ok: true,
    data: {
      id: c.id, type: c.type, nameAr: c.nameAr, nameEn: c.nameEn, vatNumber: c.vatNumber,
      crNumber: c.crNumber, email: c.email, phone: c.phone, city: c.city, address: c.address,
      creditLimit: c.creditLimit ? Number(c.creditLimit) : null, paymentTermsDays: c.paymentTermsDays,
      notes: c.notes, tags: c.tags,
    },
  };
}

export async function updateCustomer(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('customer.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...rest } = parsed.data;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const existing = await withRls(rls, (tx) => tx.customer.findUnique({ where: { id }, select: { id: true, organizationId: true } }));
  if (!existing || existing.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  const d = clean({ ...rest });
  await withRls(rls, (tx) =>
    tx.customer.update({
      where: { id },
      data: {
        ...(d.type !== undefined ? { type: d.type } : {}),
        ...(d.nameAr !== undefined ? { nameAr: d.nameAr } : {}),
        ...(d.nameEn !== undefined ? { nameEn: d.nameEn } : {}),
        ...(d.vatNumber !== undefined ? { vatNumber: d.vatNumber } : {}),
        ...(d.crNumber !== undefined ? { crNumber: d.crNumber } : {}),
        ...(d.email !== undefined ? { email: d.email } : {}),
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
        ...(d.city !== undefined ? { city: d.city } : {}),
        ...(d.address !== undefined ? { address: d.address } : {}),
        ...(d.creditLimit !== undefined ? { creditLimit: d.creditLimit } : {}),
        ...(d.paymentTermsDays !== undefined ? { paymentTermsDays: d.paymentTermsDays } : {}),
        ...(d.notes !== undefined ? { notes: d.notes } : {}),
        ...(d.tags !== undefined ? { tags: d.tags } : {}),
      },
    }),
  );
  return { ok: true };
}

const contactInput = contactSchema.extend({ customerId: z.string().uuid('validation.invalid') });

export async function addContact(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requirePermission('customer.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = contactInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const cust = await withRls(rls, (tx) =>
    tx.customer.findUnique({ where: { id: parsed.data.customerId }, select: { id: true, organizationId: true } }),
  );
  if (!cust || cust.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  const d = clean({ ...parsed.data });
  const c = await withRls(rls, (tx) =>
    tx.customerContact.create({
      data: {
        organizationId: orgId,
        customerId: parsed.data.customerId,
        name: d.name as string,
        role: d.role as string | null,
        email: d.email as string | null,
        phone: d.phone as string | null,
      },
    }),
  );
  return { ok: true, data: { id: c.id } };
}

export interface ImportError {
  row: number;
  message: string;
}

/** Import customers from CSV text (max 500 rows). Returns imported count + per-row errors. */
export async function importCustomers(input: unknown): Promise<ActionResult<{ imported: number; errors: ImportError[] }>> {
  const ctx = await requirePermission('customer.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ csv: z.string().min(1).max(2_000_000) }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { headers, rows } = parseCsv(parsed.data.csv);
  if (headers.length === 0) return { ok: false, error: 'validation.invalid' };
  if (rows.length > 500) return { ok: false, error: 'validation.invalid' };
  const objs = rowsToObjects(headers, rows);
  const errors: ImportError[] = [];
  const valid: Array<z.infer<typeof customerSchema>> = [];
  objs.forEach((o, i) => {
    const r = customerCsvSchema.safeParse(o);
    if (!r.success) {
      errors.push({ row: i + 2, message: r.error.issues[0]?.message ?? 'validation.invalid' });
      return;
    }
    const v = r.data;
    const type = v.type.toLowerCase().startsWith('ind') ? 'individual' : 'company';
    const credit = v.creditlimit ? Number(v.creditlimit) : null;
    const terms = v.paymenttermsdays ? Number(v.paymenttermsdays) : 30;
    if ((v.creditlimit && !Number.isFinite(credit!)) || !Number.isInteger(terms)) {
      errors.push({ row: i + 2, message: 'validation.invalid' });
      return;
    }
    const full = customerSchema.safeParse({
      type,
      nameAr: v.namear,
      nameEn: v.nameen || null,
      vatNumber: v.vatnumber || null,
      crNumber: v.crnumber || null,
      email: v.email || null,
      phone: v.phone || null,
      city: v.city || null,
      address: v.address || null,
      creditLimit: credit,
      paymentTermsDays: terms,
      tags: v.tags ? v.tags.split('|').map((s) => s.trim()).filter(Boolean) : [],
    });
    if (!full.success) {
      errors.push({ row: i + 2, message: full.error.issues[0]?.message ?? 'validation.invalid' });
      return;
    }
    valid.push(full.data);
  });
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  let imported = 0;
  for (const v of valid) {
    const d = clean({ ...v });
    await withRls(rls, (tx) =>
      tx.customer.create({
        data: {
          organizationId: orgId,
          type: d.type,
          nameAr: d.nameAr as string,
          nameEn: d.nameEn as string | null,
          vatNumber: (d.vatNumber as string | null) || null,
          crNumber: d.crNumber as string | null,
          email: d.email as string | null,
          phone: d.phone as string | null,
          city: d.city as string | null,
          address: d.address as string | null,
          creditLimit: d.creditLimit as number | null,
          paymentTermsDays: d.paymentTermsDays as number,
          notes: null,
          tags: (d.tags as string[]) ?? [],
        },
      }),
    );
    imported += 1;
  }
  return { ok: true, data: { imported, errors } };
}
