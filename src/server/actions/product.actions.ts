'use server';

import { z } from 'zod';
import { requirePermission } from '@/server/rbac/guard';
import { withRls, type Tx } from '@/server/db';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { productSchema, productCsvSchema } from '@/lib/validation/product';
import { parseCsv, rowsToObjects } from '@/lib/csv';

function clean<T extends Record<string, unknown>>(v: T): T {
  const o: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v)) {
    o[k] = val === '' || val === undefined ? null : val;
  }
  return o as T;
}

async function resolveCategory(tx: Tx, orgId: string, ref: string | null): Promise<string | null> {
  if (!ref) return null;
  if (/^[0-9a-f-]{36}$/i.test(ref)) return ref;
  const byKey = await tx.category.findFirst({ where: { organizationId: orgId, key: ref.toLowerCase() } });
  if (byKey) return byKey.id;
  const all = await tx.category.findMany({ where: { organizationId: orgId } });
  const hit = all.find((c) => c.nameAr === ref || c.nameEn.toLowerCase() === ref.toLowerCase());
  return hit?.id ?? null;
}

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requirePermission('product.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const dup = await withRls(rls, (tx) => tx.product.findUnique({ where: { organizationId_sku: { organizationId: orgId, sku: parsed.data.sku } }, select: { id: true } }));
  if (dup) return { ok: false, error: 'products.errors.skuTaken' };
  const d = clean({ ...parsed.data });
  const p = await withRls(rls, async (tx) => {
    const categoryId = await resolveCategory(tx, orgId, (d.categoryId as string | null) ?? null);
    return tx.product.create({
      data: {
        organizationId: orgId,
        type: d.type,
        sku: d.sku as string,
        barcode: d.barcode as string | null,
        nameAr: d.nameAr as string,
        nameEn: d.nameEn as string | null,
        description: d.description as string | null,
        categoryId,
        unit: (d.unit as string) || 'pcs',
        purchasePrice: d.purchasePrice as number | null,
        sellingPrice: d.sellingPrice as number,
        vatCategory: d.vatCategory,
        vatRate: d.vatRate as number,
        trackStock: d.trackStock as boolean,
        minStock: d.minStock as number,
        isActive: d.isActive as boolean,
      },
    });
  });
  return { ok: true, data: { id: p.id } };
}

const updateSchema = productSchema.partial().extend({ id: z.string().uuid('validation.invalid') });

/** Editable fields + current stock for the editor drawer. */
export async function getProduct(input: unknown): Promise<ActionResult<{
  id: string; type: 'product' | 'service' | 'bundle' | 'variant'; sku: string; barcode: string | null;
  nameAr: string; nameEn: string | null; description: string | null; categoryId: string | null;
  unit: string; purchasePrice: number | null; sellingPrice: number; vatCategory: 'STANDARD' | 'ZERO' | 'EXEMPT' | 'OUT_OF_SCOPE';
  vatRate: number; trackStock: boolean; minStock: number; isActive: boolean; stock: number | null;
}>> {
  const ctx = await requirePermission('product.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ id: z.string().uuid('validation.invalid') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const p = await withRls({ orgId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.product.findUnique({
      where: { id: parsed.data.id },
      include: { stockLevels: { select: { quantity: true } } },
    }),
  );
  if (!p || p.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  return {
    ok: true,
    data: {
      id: p.id, type: p.type, sku: p.sku, barcode: p.barcode, nameAr: p.nameAr, nameEn: p.nameEn,
      description: p.description, categoryId: p.categoryId, unit: p.unit,
      purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : null, sellingPrice: Number(p.sellingPrice),
      vatCategory: p.vatCategory, vatRate: Number(p.vatRate), trackStock: p.trackStock,
      minStock: Number(p.minStock), isActive: p.isActive,
      stock: p.trackStock ? p.stockLevels.reduce((a, s) => a + Number(s.quantity), 0) : null,
    },
  };
}

export async function updateProduct(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('product.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { id, ...rest } = parsed.data;
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const existing = await withRls(rls, (tx) => tx.product.findUnique({ where: { id }, select: { id: true, organizationId: true } }));
  if (!existing || existing.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (rest.sku) {
    const dup = await withRls(rls, (tx) =>
      tx.product.findUnique({ where: { organizationId_sku: { organizationId: orgId, sku: rest.sku as string } }, select: { id: true } }),
    );
    if (dup && dup.id !== id) return { ok: false, error: 'products.errors.skuTaken' };
  }
  const d = clean({ ...rest });
  await withRls(rls, async (tx) => {
    const categoryId = d.categoryId !== undefined ? await resolveCategory(tx, orgId, (d.categoryId as string | null) ?? null) : undefined;
    await tx.product.update({
      where: { id },
      data: {
        ...(d.type !== undefined ? { type: d.type } : {}),
        ...(d.sku !== undefined ? { sku: d.sku } : {}),
        ...(d.barcode !== undefined ? { barcode: d.barcode } : {}),
        ...(d.nameAr !== undefined ? { nameAr: d.nameAr } : {}),
        ...(d.nameEn !== undefined ? { nameEn: d.nameEn } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(d.unit !== undefined ? { unit: (d.unit as string) || 'pcs' } : {}),
        ...(d.purchasePrice !== undefined ? { purchasePrice: d.purchasePrice } : {}),
        ...(d.sellingPrice !== undefined ? { sellingPrice: d.sellingPrice } : {}),
        ...(d.vatCategory !== undefined ? { vatCategory: d.vatCategory } : {}),
        ...(d.vatRate !== undefined ? { vatRate: d.vatRate } : {}),
        ...(d.trackStock !== undefined ? { trackStock: d.trackStock } : {}),
        ...(d.minStock !== undefined ? { minStock: d.minStock } : {}),
        ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      },
    });
  });
  return { ok: true };
}

const stockSchema = z.object({
  productId: z.string().uuid('validation.invalid'),
  branchId: z.string().uuid('validation.invalid').optional().nullable(),
  quantity: z.coerce.number().nonnegative().max(999999999),
});

/** Set on-hand quantity (creates the level row if missing). Branch defaults to head office. */
export async function setStock(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('product.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = stockSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const p = await withRls(rls, (tx) => tx.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true, organizationId: true } }));
  if (!p || p.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  let branchId = parsed.data.branchId ?? null;
  if (!branchId) {
    const head = await withRls(rls, (tx) => tx.branch.findFirst({ where: { organizationId: orgId, isHeadOffice: true }, select: { id: true } }));
    branchId = head?.id ?? null;
  }
  await withRls(rls, async (tx) => {
    const existing = await tx.stockLevel.findFirst({ where: { organizationId: orgId, productId: parsed.data.productId, branchId } });
    if (existing) {
      await tx.stockLevel.update({ where: { id: existing.id }, data: { quantity: parsed.data.quantity } });
    } else {
      await tx.stockLevel.create({ data: { organizationId: orgId, productId: parsed.data.productId, branchId, quantity: parsed.data.quantity } });
    }
  });
  return { ok: true };
}

export interface ImportError {
  row: number;
  message: string;
}

/** Import products from CSV text (max 500 rows). */
export async function importProducts(input: unknown): Promise<ActionResult<{ imported: number; errors: ImportError[] }>> {
  const ctx = await requirePermission('product.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = z.object({ csv: z.string().min(1).max(2_000_000) }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { headers, rows } = parseCsv(parsed.data.csv);
  if (headers.length === 0) return { ok: false, error: 'validation.invalid' };
  if (rows.length > 500) return { ok: false, error: 'validation.invalid' };
  const objs = rowsToObjects(headers, rows);
  const errors: ImportError[] = [];
  const valid: Array<z.infer<typeof productSchema> & { categoryRef: string }> = [];
  const TYPES = ['product', 'service', 'bundle', 'variant'] as const;
  const VATS = ['STANDARD', 'ZERO', 'EXEMPT', 'OUT_OF_SCOPE'] as const;
  objs.forEach((o, i) => {
    const r = productCsvSchema.safeParse(o);
    if (!r.success) {
      errors.push({ row: i + 2, message: r.error.issues[0]?.message ?? 'validation.invalid' });
      return;
    }
    const v = r.data;
    const type = TYPES.includes(v.type.toLowerCase() as (typeof TYPES)[number]) ? (v.type.toLowerCase() as (typeof TYPES)[number]) : 'product';
    const vatCat = VATS.includes(v.vatcategory.toUpperCase() as (typeof VATS)[number]) ? (v.vatcategory.toUpperCase() as (typeof VATS)[number]) : 'STANDARD';
    const sell = Number(v.sellingprice);
    const buy = v.purchaseprice ? Number(v.purchaseprice) : null;
    const rate = v.vatrate ? Number(v.vatrate) : 15;
    const min = v.minstock ? Number(v.minstock) : 0;
    if (!Number.isFinite(sell) || (v.purchaseprice && !Number.isFinite(buy!)) || !Number.isFinite(rate) || !Number.isFinite(min)) {
      errors.push({ row: i + 2, message: 'validation.invalid' });
      return;
    }
    const full = productSchema.safeParse({
      type, sku: v.sku, barcode: v.barcode || null, nameAr: v.namear, nameEn: v.nameen || null,
      description: v.description || null, unit: v.unit || 'pcs', purchasePrice: buy, sellingPrice: sell,
      vatCategory: vatCat, vatRate: rate, minStock: min,
    });
    if (!full.success) {
      errors.push({ row: i + 2, message: full.error.issues[0]?.message ?? 'validation.invalid' });
      return;
    }
    valid.push({ ...full.data, categoryRef: v.category });
  });
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  let imported = 0;
  for (const v of valid) {
    const dup = await withRls(rls, (tx) =>
      tx.product.findUnique({ where: { organizationId_sku: { organizationId: orgId, sku: v.sku } }, select: { id: true } }),
    );
    if (dup) {
      errors.push({ row: 0, message: 'products.errors.skuTaken' });
      continue;
    }
    await withRls(rls, async (tx) => {
      const categoryId = await resolveCategory(tx, orgId, v.categoryRef || null);
      await tx.product.create({
        data: {
          organizationId: orgId, type: v.type, sku: v.sku, barcode: v.barcode, nameAr: v.nameAr, nameEn: v.nameEn,
          description: v.description, categoryId, unit: v.unit, purchasePrice: v.purchasePrice, sellingPrice: v.sellingPrice,
          vatCategory: v.vatCategory, vatRate: v.vatRate, minStock: v.minStock,
        },
      });
    });
    imported += 1;
  }
  return { ok: true, data: { imported, errors } };
}
