/**
 * Base64 TLV (tags 1–5) for sample/demo QR payloads only.
 * Production payloads (including hash/signature tags) MUST come from the backend signing step
 * (src/server/einvoicing — Phase 7). See design-system/docs/compliance-states.md.
 */
export function tlvBase64(fields: {
  seller: string;
  vat: string;
  timestamp: string;
  total: string;
  vatTotal: string;
}): string {
  const values = [fields.seller, fields.vat, fields.timestamp, fields.total, fields.vatTotal];
  const enc = new TextEncoder();
  const out: number[] = [];
  values.forEach((v, i) => {
    const bytes = enc.encode(v ?? '');
    if (bytes.length > 255) throw new Error(`TLV tag ${i + 1} exceeds 255 bytes`);
    out.push(i + 1, bytes.length, ...bytes);
  });
  let bin = '';
  for (const c of out) bin += String.fromCharCode(c);
  return typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
}
