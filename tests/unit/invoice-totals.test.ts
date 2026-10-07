import { describe, expect, it } from 'vitest';
import { lineTotals, invoiceTotals } from '@/lib/vat';
import { renderNumber } from '@/lib/numbering';

describe('lineTotals', () => {
  it('matches the design example (Dell line: 6 × 4250 −5% +15%)', () => {
    expect(lineTotals({ qty: 6, unitPrice: 4250, discountPct: 5, vatRate: 15 })).toEqual({
      net: 24225,
      vat: 3633.75,
      total: 27858.75,
    });
  });

  it('handles zero-rated lines', () => {
    expect(lineTotals({ qty: 2, unitPrice: 6500, vatRate: 0 })).toEqual({ net: 13000, vat: 0, total: 13000 });
  });

  it('handles zero quantity and 100% discount', () => {
    expect(lineTotals({ qty: 0, unitPrice: 100, vatRate: 15 })).toEqual({ net: 0, vat: 0, total: 0 });
    expect(lineTotals({ qty: 1, unitPrice: 100, discountPct: 100, vatRate: 15 })).toEqual({ net: 0, vat: 0, total: 0 });
  });

  it('rounds half halalas on tiny amounts', () => {
    // 3 × 0.333 = 0.999 → 1.00; vat 0.15 → 0.15
    expect(lineTotals({ qty: 3, unitPrice: 0.333, vatRate: 15 })).toEqual({ net: 1, vat: 0.15, total: 1.15 });
  });
});

describe('invoiceTotals (INV-2026-00127 design example)', () => {
  const lines = [
    { qty: 1, unitPrice: 18500, discountPct: 0, vatRate: 15 },
    { qty: 6, unitPrice: 4250, discountPct: 5, vatRate: 15 },
    { qty: 1, unitPrice: 9600, discountPct: 0, vatRate: 15 },
  ];
  it('reproduces subtotal/discount/taxable/VAT/grand exactly', () => {
    expect(invoiceTotals(lines)).toEqual({
      subtotal: 53600,
      discountTotal: 1275,
      taxable: 52325,
      vatTotal: 7848.75,
      otherCharges: 0,
      rounding: 0,
      grand: 60173.75,
    });
  });

  it('applies bulk discount pro-rata before VAT', () => {
    const t = invoiceTotals([{ qty: 1, unitPrice: 1000, vatRate: 15 }], { bulkDiscountPct: 10 });
    expect(t).toEqual({
      subtotal: 1000,
      discountTotal: 100,
      taxable: 900,
      vatTotal: 135,
      otherCharges: 0,
      rounding: 0,
      grand: 1035,
    });
  });

  it('adds other charges after VAT', () => {
    const t = invoiceTotals([{ qty: 1, unitPrice: 1000, vatRate: 15 }], { otherCharges: 50 });
    expect(t.grand).toBe(1200);
    expect(t.otherCharges).toBe(50);
  });
});

describe('renderNumber', () => {
  it('renders INV-{YYYY}-{#####} patterns', () => {
    expect(renderNumber('INV-{YYYY}-{#####}', 2026, 1)).toBe('INV-2026-00001');
    expect(renderNumber('INV-{YYYY}-{#####}', 2026, 127)).toBe('INV-2026-00127');
  });

  it('leaves unknown tokens untouched', () => {
    expect(renderNumber('Q-{YY}-{###}', 2026, 5)).toBe('Q-{YY}-005');
  });
});
