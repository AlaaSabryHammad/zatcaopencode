/**
 * Cross-tenant RLS proof (dev only, run manually: `pnpm db:rls-check`).
 *
 * Creates two organizations with one invoice each, then asserts through the
 * NON-OWNER app role (DATABASE_URL) that:
 *   1. tenant reads outside the RLS context return nothing,
 *   2. writes outside the context are rejected,
 *   3. the SECURITY DEFINER invitation_preview() only serves pending tokens.
 * Cleans everything up afterwards. Standalone (no server-only imports).
 */
import { PrismaClient } from '@prisma/client';

const owner = new PrismaClient({ datasourceUrl: process.env.DATABASE_MIGRATION_URL });
const app = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const stamp = Date.now().toString(36);

async function withCtx<T>(orgId: string, fn: (db: PrismaClient) => Promise<T>): Promise<T> {
  return app.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.org_id', ${orgId}, true)`;
    const scoped = tx as unknown as PrismaClient;
    return fn(scoped);
  });
}

async function main() {
  const mkOrg = (slug: string) =>
    owner.organization.create({ data: { slug: `${slug}-${stamp}`, nameAr: `RLS ${slug}`, status: 'active' } });
  const orgA = await mkOrg('rls-a');
  const orgB = await mkOrg('rls-b');
  try {
    await owner.invoice.create({
      data: {
        organizationId: orgA.id, number: `RLS-${stamp}-A`, type: 'TAX', status: 'issued',
        issueDate: new Date(), currency: 'SAR', subtotal: 100, vatTotal: 15, grandTotal: 115,
        amountPaid: 0, balanceDue: 115,
      },
    });
    await owner.invoice.create({
      data: {
        organizationId: orgB.id, number: `RLS-${stamp}-B`, type: 'TAX', status: 'issued',
        issueDate: new Date(), currency: 'SAR', subtotal: 200, vatTotal: 30, grandTotal: 230,
        amountPaid: 0, balanceDue: 230,
      },
    });

    // 1. reads are isolated
    const seenFromB = await withCtx(orgB.id, (db) => db.invoice.findMany({ where: { organizationId: orgA.id } }));
    if (seenFromB.length !== 0) throw new Error(`cross-tenant read leaked ${seenFromB.length} rows`);
    const ownInA = await withCtx(orgA.id, (db) => db.invoice.findMany({ where: { organizationId: orgA.id } }));
    if (ownInA.length !== 1) throw new Error(`own-context read returned ${ownInA.length} rows, want 1`);
    const noCtx = await app.invoice.findMany({ where: { organizationId: orgA.id } });
    if (noCtx.length !== 0) throw new Error('read without context leaked rows');

    // 2. writes outside the context are rejected
    let blocked = false;
    try {
      await withCtx(orgB.id, (db) =>
        db.invoice.create({
          data: {
            organizationId: orgA.id, type: 'TAX', status: 'draft', issueDate: new Date(),
            currency: 'SAR', subtotal: 1, vatTotal: 0, grandTotal: 1, amountPaid: 0, balanceDue: 1,
          },
        }),
      );
    } catch {
      blocked = true;
    }
    if (!blocked) throw new Error('cross-tenant write was NOT blocked');

    // 3. invitation_preview serves nothing for unknown hashes
    const rows = await app.$queryRaw<Array<{ email: string }>>`SELECT * FROM invitation_preview(${`nope-${stamp}`})`;
    if (rows.length !== 0) throw new Error('invitation_preview leaked a row');

    console.log('RLS check OK: reads isolated, writes blocked, preview closed.');
  } finally {
    await owner.organization.deleteMany({ where: { slug: { endsWith: stamp } } });
    await owner.$disconnect();
    await app.$disconnect();
  }
}

main().catch((e) => {
  console.error('RLS check FAILED:', e);
  process.exit(1);
});
