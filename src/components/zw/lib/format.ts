/**
 * Display formatting for the design system. Western (Latin) digits in both languages for
 * financial clarity. These format numbers that are already computed; money arithmetic lives
 * in src/lib/money.ts (decimal.js) — never do math on these strings.
 */
const nfCache = new Map<string, Intl.NumberFormat>();
function nf(key: string, opts: Intl.NumberFormatOptions) {
  let f = nfCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-US', opts);
    nfCache.set(key, f);
  }
  return f;
}

export function fmtNumber(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '—';
  return nf(`d${decimals}`, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
    Number(value),
  );
}

export function fmtCompact(value: number): string {
  return nf('compact', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value));
}

export function fmtInt(value: number): string {
  return nf('int', { maximumFractionDigits: 0 }).format(value);
}

export function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

/** Format check only: 15 digits starting and ending with 3 (not a registry lookup). */
export function isVatFormat(value: string | null | undefined): boolean {
  return /^3\d{13}3$/.test(value ?? '');
}

/** Saudi mobile display: 5X XXX XXXX */
export function fmtPhone(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 9)].filter(Boolean).join(' ');
}

/** ISO yyyy-mm-dd helpers (local calendar dates; no timezone shifting). */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseIsoDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function fmtHijri(d: Date, lang: 'ar' | 'en'): string {
  try {
    return new Intl.DateTimeFormat(`${lang === 'ar' ? 'ar-SA' : 'en-US'}-u-ca-islamic-umalqura-nu-latn`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}
