// @vitest-environment node
import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { allocateNumber } from '@/server/modules/invoices/numbering';

const url = process.env.DATABASE_MIGRATION_URL;
const run = url ? describe : describe.skip;

run('allocateNumber concurrency', () => {
  const db = new PrismaClient({ datasourceUrl: url });
  let orgId = '';

  beforeAll(async () => {
    const org = await db.organization.create({
      data: { slug: `numtest-${Date.now()}`, nameAr: 'ترقيم', status: 'active' },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    if (orgId) await db.organization.delete({ where: { id: orgId } }).catch(() => {});
    await db.$disconnect();
  });

  it('hands out gap-free unique values under parallel load', async () => {
    const N = 10;
    const results = await Promise.all(
      Array.from({ length: N }, (_, i) =>
        db.$transaction((tx) => allocateNumber(tx, orgId, null, 'TAX', 2026, 'INV-{YYYY}-{#####}', 1), {
          timeout: 30_000,
        }).then((r) => ({ ...r, i })),
      ),
    );
    const values = results.map((r) => r.value).sort((a, b) => a - b);
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const numbers = new Set(results.map((r) => r.number));
    expect(numbers.size).toBe(N);
    expect(results[0]!.number).toMatch(/^INV-2026-0000\d$/);
  }, 60_000);
});
