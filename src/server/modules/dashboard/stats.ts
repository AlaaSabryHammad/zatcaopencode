/**
 * Pure dashboard math (no DB). All money handled as integer halalas to avoid float drift.
 * See design/screens/source/Dashboard.dc.html for the widget semantics.
 */

export type OpenStatus = 'issued' | 'viewed' | 'sent' | 'partially_paid' | 'pending';

export interface OpenInvoice {
  grandTotal: number;
  dueDate: Date | null;
}

export interface StatusBuckets {
  paid: number;
  paidCount: number;
  unpaid: number;
  unpaidCount: number;
  overdue: number;
  overdueCount: number;
  draft: number;
  draftCount: number;
  outstanding: number;
}

/** Split open invoices into unpaid vs overdue. Overdue is DERIVED (dueDate < today && balance > 0). */
export function splitOpen(invoices: OpenInvoice[], today: Date): { unpaid: number; overdue: number } {
  let unpaid = 0;
  let overdue = 0;
  for (const inv of invoices) {
    const cents = Math.round(inv.grandTotal * 100);
    if (inv.dueDate && inv.dueDate < today) overdue += cents;
    else unpaid += cents;
  }
  return { unpaid: unpaid / 100, overdue: overdue / 100 };
}

export interface AgingBands {
  d030: number;
  d3160: number;
  d6190: number;
  d90: number;
}

const DAY = 86_400_000;

/**
 * Receivables aging over OPEN invoices. Not-yet-due counts as current (0–30).
 * Bands are days overdue: [0–30], [31–60], [61–90], [90+].
 */
export function agingBuckets(invoices: OpenInvoice[], today: Date): AgingBands {
  const bands = { d030: 0, d3160: 0, d6190: 0, d90: 0 };
  for (const inv of invoices) {
    const cents = Math.round(inv.grandTotal * 100);
    const daysOverdue = inv.dueDate ? Math.floor((today.getTime() - inv.dueDate.getTime()) / DAY) : -1;
    if (daysOverdue <= 30) bands.d030 += cents;
    else if (daysOverdue <= 60) bands.d3160 += cents;
    else if (daysOverdue <= 90) bands.d6190 += cents;
    else bands.d90 += cents;
  }
  return { d030: bands.d030 / 100, d3160: bands.d3160 / 100, d6190: bands.d6190 / 100, d90: bands.d90 / 100 };
}

/** Percent change vs previous period; null when previous is zero (avoids ∞). */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

export interface MonthPoint {
  key: string; // YYYY-MM
  label: string;
  revenue: number;
  expenses: number;
}

/**
 * Build a continuous monthly series between two YYYY-MM keys (inclusive),
 * filling gaps with zeros. Labels are Intl month names in the given locale.
 */
export function monthlySeries(
  fromKey: string,
  toKey: string,
  revenueByMonth: Record<string, number>,
  expensesByMonth: Record<string, number>,
  locale: string,
): MonthPoint[] {
  const out: MonthPoint[] = [];
  const [fy, fm] = fromKey.split('-').map(Number);
  const [ty, tm] = toKey.split('-').map(Number);
  const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
  let y = fy as number;
  let m = fm as number;
  for (;;) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const cents = (v: number | undefined) => Math.round((v ?? 0) * 100) / 100;
    out.push({
      key,
      label: fmt.format(new Date(Date.UTC(y, m - 1, 1))),
      revenue: cents(revenueByMonth[key]),
      expenses: cents(expensesByMonth[key]),
    });
    if (y === ty && m === tm) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    if (out.length > 36) throw new Error('monthlySeries: range too large');
  }
  return out;
}

/** Top-N by amount desc, with share of the leader (for progress bars). */
export function topN<T extends { amount: number }>(rows: T[], n: number): Array<T & { share: number }> {
  const sorted = [...rows].sort((a, b) => b.amount - a.amount).slice(0, n);
  const leader = sorted[0]?.amount ?? 0;
  return sorted.map((r) => ({ ...r, share: leader > 0 ? Math.round((r.amount / leader) * 100) : 0 }));
}

/** Sum a numeric selector in integer halalas. */
export function sum2<T>(rows: T[], pick: (r: T) => number): number {
  return rows.reduce((a, r) => a + Math.round(pick(r) * 100), 0) / 100;
}
