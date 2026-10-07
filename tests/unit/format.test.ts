import { describe, expect, it } from 'vitest';
import {
  fmtCompact,
  fmtNumber,
  fmtPhone,
  isVatFormat,
  parseIsoDate,
  toIsoDate,
} from '@/components/zw/lib/format';
import { tlvBase64 } from '@/components/zw/lib/qr';

describe('fmtNumber', () => {
  it('uses two decimals, thousands separators and Western digits', () => {
    expect(fmtNumber(248930.5)).toBe('248,930.50');
    expect(fmtNumber(13200)).toBe('13,200.00');
    expect(fmtNumber(250000, 0)).toBe('250,000');
  });
  it('renders an em dash for empty values', () => {
    expect(fmtNumber(null)).toBe('—');
    expect(fmtNumber('')).toBe('—');
    expect(fmtNumber('abc')).toBe('—');
  });
  it('accepts decimal strings from the server', () => {
    expect(fmtNumber('37339.58')).toBe('37,339.58');
  });
});

describe('fmtCompact', () => {
  it('compacts large numbers', () => {
    expect(fmtCompact(1250000)).toBe('1.3M');
  });
});

describe('isVatFormat', () => {
  it('accepts 15 digits starting and ending with 3', () => {
    expect(isVatFormat('310123456700003')).toBe(true);
  });
  it.each(['210123456700004', '31012345670000', '3101234567000033', '31012345670000x', ''])(
    'rejects %s',
    (v) => {
      expect(isVatFormat(v)).toBe(false);
    },
  );
});

describe('fmtPhone', () => {
  it('formats Saudi mobile as 5X XXX XXXX', () => {
    expect(fmtPhone('551234567')).toBe('55 123 4567');
    expect(fmtPhone('55123')).toBe('55 123');
  });
});

describe('ISO dates', () => {
  it('round-trips without timezone drift', () => {
    expect(toIsoDate(parseIsoDate('2026-10-07')!)).toBe('2026-10-07');
    expect(parseIsoDate('bad')).toBeNull();
  });
});

describe('tlvBase64', () => {
  it('encodes tags 1–5 as tag/length/value bytes', () => {
    const b64 = tlvBase64({
      seller: 'AB',
      vat: '310123456700003',
      timestamp: 'T',
      total: '1.00',
      vatTotal: '0.13',
    });
    const bytes = Array.from(atob(b64), (c) => c.charCodeAt(0));
    expect(bytes.slice(0, 4)).toEqual([1, 2, 65, 66]);
    expect(bytes[4]).toBe(2);
    expect(bytes[5]).toBe(15);
  });
  it('counts UTF-8 bytes for Arabic seller names', () => {
    const b64 = tlvBase64({ seller: 'شركة', vat: '3', timestamp: 'T', total: '1', vatTotal: '0' });
    const bytes = Array.from(atob(b64), (c) => c.charCodeAt(0));
    expect(bytes[1]).toBe(8); // 4 Arabic letters × 2 bytes
  });
});
