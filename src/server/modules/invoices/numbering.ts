import 'server-only';
import type { Tx } from '@/server/db';
import { renderNumber } from '@/lib/numbering';

export interface AllocatedNumber {
  number: string;
  value: number;
  prefix: string;
}

/** Surrogate key shared by allocateNumber and the onboarding upserts. */
export function sequenceKey(orgId: string, branchId: string | null, documentType: string, year: number): string {
  return `${orgId}:${branchId ?? '-'}:${documentType}:${year}`;
}

/**
 * Allocate the next document number, gap-free under concurrency.
 *
 * Holds a row-level lock (`SELECT … FOR UPDATE`) on the sequence row inside the
 * caller's transaction, so parallel issuers serialize and values never repeat.
 * Creates the sequence row on first use (unique-violation retry covers the race
 * where two transactions create it at once). The rendered `number` still has a
 * UNIQUE constraint per org as a final backstop — callers retry the whole issue
 * transaction on conflict.
 */
export async function allocateNumber(
  tx: Tx,
  orgId: string,
  branchId: string | null,
  documentType: string,
  year: number,
  prefix: string,
  startAt = 1,
): Promise<AllocatedNumber> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const rows = await tx.$queryRaw<Array<{ id: string; next_value: number; prefix: string }>>`
      SELECT id, next_value, prefix FROM invoice_sequence
      WHERE key = ${sequenceKey(orgId, branchId, documentType, year)}
      FOR UPDATE`;
    const row = rows[0];
    if (row) {
      const value = row.next_value;
      await tx.$executeRaw`
        UPDATE invoice_sequence SET next_value = ${value + 1}, updated_at = now()
        WHERE id = ${row.id}::uuid`;
      return { number: renderNumber(row.prefix || prefix, year, value), value, prefix: row.prefix || prefix };
    }
    try {
      await tx.invoiceSequence.create({
        data: { organizationId: orgId, branchId, key: sequenceKey(orgId, branchId, documentType, year), documentType, prefix, nextValue: startAt, year },
      });
    } catch {
      // Lost the creation race — loop around and lock the winner's row.
    }
  }
  throw new Error('allocateNumber: sequence row unavailable after retries');
}
