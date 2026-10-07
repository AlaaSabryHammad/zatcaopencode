import 'server-only';
import type { Tx } from '@/server/db';

export interface ProductFilters {
  q?: string;
  type?: 'product' | 'service' | 'bundle' | 'variant';
  categoryId?: string;
  vat?: 'STANDARD' | 'ZERO' | 'EXEMPT' | 'OUT_OF_SCOPE';
  lowStock?: boolean;
  sortKey?: 'name' | 'price' | 'stock';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProductRow {
  id: string;
  type: string;
  sku: string;
  barcode: string | null;
  nameAr: string;
  nameEn: string | null;
  category: string | null;
  unit: string;
  purchasePrice: number | null;
  sellingPrice: number;
  vatCategory: string;
  vatRate: number;
  stock: number | null;
  minStock: number;
  low: boolean;
  isActive: boolean;
}

const num = (v: { toNumber(): number } | null | undefined) => v?.toNumber() ?? 0;

export async function listProducts(
  tx: Tx,
  orgId: string,
  f: ProductFilters,
): Promise<{ rows: ProductRow[]; total: number; counts: Record<string, number> }> {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, f.pageSize ?? 10));

  const where: { organizationId: string; type?: ProductFilters['type']; categoryId?: string; vatCategory?: ProductFilters['vat'] } = {
    organizationId: orgId,
  };
  if (f.type) where.type = f.type;
  if (f.categoryId) where.categoryId = f.categoryId;
  if (f.vat) where.vatCategory = f.vat;
  const all = await tx.product.findMany({
    where,
    include: { category: { select: { nameAr: true, nameEn: true } }, stockLevels: { select: { quantity: true } } },
    orderBy: { nameEn: 'asc' },
  });

  const q = (f.q ?? '').trim().toLowerCase();
  const searched = q
    ? all.filter((p) =>
        [p.nameAr, p.nameEn ?? '', p.sku, p.barcode ?? ''].join(' ').toLowerCase().includes(q),
      )
    : all;

  let rows: ProductRow[] = searched.map((p) => {
    const stock = p.trackStock ? p.stockLevels.reduce((a, s) => a + Number(s.quantity), 0) : null;
    return {
      id: p.id,
      type: p.type,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category ? p.category.nameAr : null,
      unit: p.unit,
      purchasePrice: p.purchasePrice ? num(p.purchasePrice) : null,
      sellingPrice: num(p.sellingPrice),
      vatCategory: p.vatCategory,
      vatRate: num(p.vatRate),
      stock,
      minStock: Number(p.minStock),
      low: stock !== null && stock < Number(p.minStock),
      isActive: p.isActive,
    };
  });
  if (f.lowStock) rows = rows.filter((r) => r.low);

  const dir = f.sortDir === 'desc' ? -1 : 1;
  const key = f.sortKey ?? 'name';
  rows.sort((a, b) => {
    switch (key) {
      case 'price':
        return (a.sellingPrice - b.sellingPrice) * dir;
      case 'stock':
        return ((a.stock ?? -1) - (b.stock ?? -1)) * dir;
      case 'name':
      default:
        return `${a.nameEn ?? ''} ${a.nameAr}`.localeCompare(`${b.nameEn ?? ''} ${b.nameAr}`) * dir;
    }
  });

  const total = rows.length;
  const counts: Record<string, number> = { all: total };
  for (const t of ['product', 'service', 'bundle', 'variant']) {
    counts[t] = rows.filter((r) => r.type === t).length;
  }
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total, counts };
}

export async function productCategories(tx: Tx, orgId: string) {
  return tx.category.findMany({
    where: { organizationId: orgId },
    select: { id: true, key: true, nameAr: true, nameEn: true },
    orderBy: { nameAr: 'asc' },
  });
}

export interface ProductStats {
  total: number;
  lowCount: number;
  stockValue: number;
  counts: Record<string, number>;
}

export async function productStats(tx: Tx, orgId: string): Promise<ProductStats> {
  const all = await tx.product.findMany({
    where: { organizationId: orgId },
    select: { type: true, purchasePrice: true, minStock: true, trackStock: true, stockLevels: { select: { quantity: true } } },
  });
  let lowCount = 0;
  let stockValue = 0;
  const counts: Record<string, number> = { all: all.length, product: 0, service: 0, bundle: 0, variant: 0 };
  for (const p of all) {
    counts[p.type] = (counts[p.type] ?? 0) + 1;
    if (!p.trackStock || !p.purchasePrice) continue;
    const qty = p.stockLevels.reduce((a, s) => a + Number(s.quantity), 0);
    stockValue += qty * num(p.purchasePrice);
    if (qty < Number(p.minStock)) lowCount += 1;
  }
  return { total: all.length, lowCount, stockValue: Math.round(stockValue * 100) / 100, counts };
}
