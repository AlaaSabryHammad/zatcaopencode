/**
 * Minimal RFC-4180 CSV parser (no dependency): commas, double-quoted fields,
 * escaped quotes (""), CRLF/LF, BOM. Returns rows as string arrays.
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export function parseCsv(text: string): ParsedCsv {
  const src = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let i = 0;
  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    // skip fully-empty lines
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
    row = [];
  };
  while (i < src.length) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          quoted = false;
          i += 1;
        }
      } else {
        field += c;
        i += 1;
      }
    } else if (c === '"') {
      quoted = true;
      i += 1;
    } else if (c === ',') {
      pushField();
      i += 1;
    } else if (c === '\r') {
      pushField();
      pushRow();
      i += src[i + 1] === '\n' ? 2 : 1;
    } else if (c === '\n') {
      pushField();
      pushRow();
      i += 1;
    } else {
      field += c;
      i += 1;
    }
  }
  pushField();
  pushRow();
  if (rows.length === 0) return { headers: [], rows: [] };
  const [headers, ...rest] = rows as [string[], ...string[][]];
  return { headers: headers.map((h) => h.trim()), rows: rest };
}

/** Map rows to objects keyed by lower-cased header. Missing cells become ''. */
export function rowsToObjects(headers: string[], rows: string[][]): Array<Record<string, string>> {
  const keys = headers.map((h) => h.trim().toLowerCase());
  return rows.map((r) => {
    const o: Record<string, string> = {};
    keys.forEach((k, idx) => {
      o[k] = (r[idx] ?? '').trim();
    });
    return o;
  });
}
