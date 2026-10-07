import { describe, expect, it } from 'vitest';
import { parseCsv, rowsToObjects } from '@/lib/csv';

describe('parseCsv', () => {
  it('parses simple rows and trims headers', () => {
    const r = parseCsv('name,email\nAcme,a@b.sa\n');
    expect(r.headers).toEqual(['name', 'email']);
    expect(r.rows).toEqual([['Acme', 'a@b.sa']]);
  });

  it('handles quotes, commas and escaped quotes', () => {
    const r = parseCsv('name,notes\n"Acme, Inc","said ""hi"" loudly"\n');
    expect(r.rows).toEqual([['Acme, Inc', 'said "hi" loudly']]);
  });

  it('handles CRLF, BOM and skips empty lines', () => {
    const r = parseCsv('﻿a,b\r\n1,2\r\n\r\n3,4\r\n');
    expect(r.headers).toEqual(['a', 'b']);
    expect(r.rows).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('keeps newlines inside quoted fields', () => {
    const r = parseCsv('a,b\n"x\ny",2\n');
    expect(r.rows).toEqual([['x\ny', '2']]);
  });

  it('returns empty for blank input', () => {
    expect(parseCsv('')).toEqual({ headers: [], rows: [] });
  });
});

describe('rowsToObjects', () => {
  it('keys by lower-cased header and fills missing cells', () => {
    expect(rowsToObjects(['Name', 'VAT'], [['Acme']])).toEqual([{ name: 'Acme', vat: '' }]);
  });
});
