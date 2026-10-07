import 'server-only';
import { addHours } from 'date-fns';
import { hmac, randomToken } from '@/server/crypto';
import { prisma } from '@/server/db';
import type { Prisma, TokenPurpose } from '@prisma/client';
import { verifyPassword } from './password.service';

export const RESET_TOKEN_TTL_H = 2;
export const VERIFY_EMAIL_TTL_H = 24;

export interface IssueTokenResult {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export function issueSingleUseToken(purpose: TokenPurpose, ttlHours: number): IssueTokenResult {
  const token = randomToken(32);
  const tokenHash = hmac(token, `token:${purpose}`);
  const expiresAt = addHours(new Date(), ttlHours);
  return { token, tokenHash, expiresAt };
}

export async function createVerificationToken(userId: string, purpose: TokenPurpose, ttlHours: number): Promise<string> {
  const t = issueSingleUseToken(purpose, ttlHours);
  await prisma.verificationToken.create({
    data: { userId, purpose, tokenHash: t.tokenHash, expiresAt: t.expiresAt },
  });
  return t.token;
}

export async function consumeVerificationToken(token: string, purpose: TokenPurpose): Promise<{ ok: boolean; userId?: string }> {
  const tokenHash = hmac(token, `token:${purpose}`);
  const rec = await prisma.verificationToken.findFirst({
    where: { tokenHash, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!rec) return { ok: false };
  await prisma.verificationToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  return { ok: true, userId: rec.userId };
}

export async function markEmailVerified(userId: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
}

export async function recordFailedLogin(userId: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  const u = await client.user.findUnique({ where: { id: userId }, select: { failedLoginCount: true } });
  const c = (u?.failedLoginCount ?? 0) + 1;
  const lock = c >= 10 ? { lockedUntil: addHours(new Date(), 1) } : {};
  return client.user.update({ where: { id: userId }, data: { failedLoginCount: c, ...lock } });
}

export async function resetFailedLogins(userId: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.user.update({ where: { id: userId }, data: { failedLoginCount: 0, lockedUntil: null } });
}

export async function verifyCredentials(email: string, password: string): Promise<{ ok: boolean; userId?: string; reason?: 'locked' | 'no_password' | 'invalid' }> {
  const e = email.toLowerCase().trim();
  const u = await prisma.user.findUnique({ where: { email: e } });
  if (!u || u.deletedAt) return { ok: false, reason: 'invalid' };
  if (u.lockedUntil && u.lockedUntil > new Date()) return { ok: false, reason: 'locked' };
  if (!u.passwordHash) return { ok: false, reason: 'no_password' };
  const v = await verifyPassword(u.passwordHash, password);
  if (!v) {
    await recordFailedLogin(u.id);
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, userId: u.id };
}
