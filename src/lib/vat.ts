import { r2, sum2 } from './money';

/**
 * Line math — the server is the source of truth, the client editor mirrors it.
 * net = round2(qty × unitPrice × (1 − discount%))
 * vat = round2(net × rate)
 * Totals are sums of rounded line values (design/CLAUDE_CODE_PROMPT.md §6).
 */
export interface LineInput {
  qty: number;
  unitPrice: number;
  discountPct?: number;
  vatRate?: number;
}

export interface LineTotals {
  net: number;
  vat: number;
  total: number;
}

export function lineTotals(l: LineInput): LineTotals {
  const net = r2(l.qty * l.unitPrice * (1 - (l.discountPct ?? 0) / 100));
  const vat = r2((net * (l.vatRate ?? 15)) / 100);
  return { net, vat, total: r2(net + vat) };
}

export interface InvoiceTotals {
  subtotal: number;
  discountTotal: number;
  taxable: number;
  vatTotal: number;
  otherCharges: number;
  rounding: number;
  grand: number;
}

/** Invoice totals from lines + bulk discount % + other charges. */
export function invoiceTotals(
  lines: LineInput[],
  opts?: { bulkDiscountPct?: number; otherCharges?: number },
): InvoiceTotals {
  const computed = lines.map(lineTotals);
  const subtotal = sum2(lines.map((l) => r2(l.qty * l.unitPrice)));
  const lineDiscount = r2(subtotal - sum2(computed.map((c) => c.net)));
  const bulk = r2(((subtotal - lineDiscount) * (opts?.bulkDiscountPct ?? 0)) / 100);
  const discountTotal = r2(lineDiscount + bulk);
  const taxable = r2(subtotal - discountTotal);
  // VAT is recomputed on the discounted taxable base, pro-rata per line.
  const vatTotal = sum2(
    lines.map((l, i) => {
      const c = computed[i]!;
      const share = subtotal - lineDiscount > 0 ? r2(c.net - (c.net * (opts?.bulkDiscountPct ?? 0)) / 100) : 0;
      return r2((share * (l.vatRate ?? 15)) / 100);
    }),
  );
  const otherCharges = r2(opts?.otherCharges ?? 0);
  const raw = r2(taxable + vatTotal + otherCharges);
  const grand = r2(raw);
  const rounding = r2(grand - raw);
  return { subtotal, discountTotal, taxable, vatTotal, otherCharges, rounding, grand };
}
