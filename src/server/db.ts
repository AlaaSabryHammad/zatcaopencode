import 'server-only';
import { PrismaClient, type Prisma } from '@prisma/client';

/**
 * Runtime Prisma client. Connects with DATABASE_URL (non-owner app role → RLS enforced).
 * Migrations use DATABASE_MIGRATION_URL via the Prisma CLI (see prisma/schema.prisma).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Runs `fn` inside a transaction with `app.org_id` set for Postgres Row-Level Security.
 * The organization id MUST come from the authenticated session, never from request input.
 * Repositories in src/server/modules/* call this; route handlers never touch `prisma` directly.
 */
export async function withTenant<T>(
  organizationId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { isolationLevel?: Prisma.TransactionIsolationLevel; timeout?: number },
): Promise<T> {
  if (!UUID_RE.test(organizationId)) throw new Error('withTenant: invalid organization id');
  return prisma.$transaction(
    async (tx) => {
      // set_config(..., true) == SET LOCAL: scoped to this transaction only.
      await tx.$executeRaw`SELECT set_config('app.org_id', ${organizationId}, true)`;
      return fn(tx);
    },
    { isolationLevel: options?.isolationLevel, timeout: options?.timeout ?? 15_000 },
  );
}
