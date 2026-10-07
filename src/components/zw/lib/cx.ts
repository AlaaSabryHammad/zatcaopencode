/** Joins truthy class names (same semantics as the reference bundle's `cx`). */
export function cx(...parts: Array<string | false | null | undefined | 0>): string {
  return parts.filter(Boolean).join(' ');
}
