/**
 * Document numbering: render a stored prefix pattern with year + sequence value.
 * Pattern tokens: {YYYY} (4-digit year), {#####…} (value left-padded to the # run).
 * Unknown tokens are left untouched so a bad pattern never crashes issuing.
 */
export function renderNumber(prefix: string, year: number, value: number): string {
  const run = prefix.match(/#+/);
  let out = prefix.replace('{YYYY}', String(year));
  if (run) {
    const padded = String(Math.max(0, Math.floor(value))).padStart(run[0].length, '0');
    out = out.replace(`{${run[0]}}`, padded).replace(run[0], padded);
  }
  return out;
}

/** Next value preview (does NOT allocate). */
export function previewNumber(prefix: string, year: number, nextValue: number): string {
  return renderNumber(prefix, year, nextValue);
}
