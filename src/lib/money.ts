/**
 * Money helpers. All math in integer halalas; values are plain numbers rounded to 2dp.
 * Server totals and the client editor mirror MUST use these (design/CLAUDE_CODE_PROMPT.md §6).
 */

/** Round to 2dp (half away from zero for positives; negatives symmetric). */
export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Sum with halala-exact accumulation. */
export function sum2(values: number[]): number {
  return values.reduce((a, v) => a + Math.round(v * 100), 0) / 100;
}

/** Format with Intl (2dp). Locale-aware; digits stay Western per brand-book. */
export function fmtMoney(n: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
