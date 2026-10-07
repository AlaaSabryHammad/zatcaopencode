import 'server-only';
import { PrismaClient, type Prisma } from '@prisma/client';

/**
 * Runtime Prisma client. Connects with DATABASE_URL (non-owner app role → RLS enforced).
 * Migrations use DATABASE_MIGRATION_URL via the Prisma CLI (see prisma/schema.prisma).
 *
 * Non-tenant tables (user, session, tokens, security_event, permission) can be used directly.
 * Tenant tables (organization, membership, role, invitation, audit_log, …) return NO rows unless
 * accessed inside withRls()/withTenant(), because their RLS policies read the transaction context.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type Tx = Prisma.TransactionClient;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface RlsContext {
  /** Current organization — MUST come from the authenticated session/membership, never request input. */
  orgId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
}

/**
 * Runs `fn` in a transaction with the RLS context set via set_config(..., true) (≡ SET LOCAL),
 * so it never leaks to other requests sharing the pooled connection.
 */
export async function withRls<T>(
  ctx: RlsContext,
  fn: (tx: Tx) => Promise<T>,
  options?: { isolationLevel?: Prisma.TransactionIsolationLevel; timeout?: number },
): Promise<T> {
  for (const id of [ctx.orgId, ctx.userId]) {
    if (id && !UUID_RE.test(id)) throw new Error('withRls: invalid uuid in context');
  }
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT
        set_config('app.org_id', ${ctx.orgId ?? ''}, true),
        set_config('app.user_id', ${ctx.userId ?? ''}, true),
        set_config('app.user_email', ${(ctx.userEmail ?? '').toLowerCase()}, true)`;
      return fn(tx);
    },
    { isolationLevel: options?.isolationLevel, timeout: options?.timeout ?? 15_000 },
  );
}

/** Tenant-scoped transaction: organization + acting user. */
export function withTenant<T>(
  organizationId: string,
  fn: (tx: Tx) => Promise<T>,
  options?: { userId?: string; isolationLevel?: Prisma.TransactionIsolationLevel; timeout?: number },
): Promise<T> {
  if (!UUID_RE.test(organizationId)) return Promise.reject(new Error('withTenant: invalid organization id'));
  return withRls({ orgId: organizationId, userId: options?.userId }, fn, options);
}
