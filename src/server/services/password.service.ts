import 'server-only';
import { hash, verify } from '@node-rs/argon2';
import { sha256 } from '@/server/crypto';
import { prisma } from '@/server/db';
import type { Prisma } from '@prisma/client';

// Library default algorithm is Argon2id; params are encoded in the PHC string so verify() needs no options.
const ARGON_OPTS = {
  memoryCost: 65536, // 64 MB
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, { ...ARGON_OPTS });
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** True if the candidate matches the current hash (reuse guard). */
export async function passwordRecentlyUsed(userId: string, password: string, tx?: Prisma.TransactionClient): Promise<boolean> {
  const client = tx ?? prisma;
  const u = await client.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!u?.passwordHash) return false;
  return verifyPassword(u.passwordHash, password);
}

export async function setPassword(userId: string, password: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  const passwordHash = await hashPassword(password);
  return client.user.update({
    where: { id: userId },
    data: { passwordHash, passwordChangedAt: new Date(), failedLoginCount: 0, lockedUntil: null },
    select: { id: true },
  });
}

export function passwordChangedAfter(changedAt: Date | null, reference: Date | null): boolean {
  if (!changedAt || !reference) return false;
  return changedAt.getTime() > reference.getTime();
}

export function tokenFingerprint(token: string): string {
  return sha256(token);
}
