import 'server-only';
import { addDays, addHours, isBefore } from 'date-fns';
import { sha256, randomToken } from '@/server/crypto';
import { prisma } from '@/server/db';
import type { Prisma, Session, User } from '@prisma/client';

export const SESSION_COOKIE = 'zatcaweb.sid';
export const SESSION_TTL_DAYS = 30;
export const SESSION_TTL_SHORT_HOURS = 24;
export const MFA_TTL_MIN = 10;

export interface SessionContext {
  session: Session & { user: Pick<User, 'id' | 'email' | 'name' | 'twoFactorEnabled'> };
  isMfaPending: boolean;
}

export interface CreateSessionInput {
  userId: string;
  remember: boolean;
  mfaPending?: boolean;
  ip?: string | null;
  userAgent?: string | null;
  activeOrgId?: string | null;
}

export interface SessionToken {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export function issueSessionToken(remember: boolean, mfaPending = false): SessionToken {
  const token = randomToken(32);
  const tokenHash = sha256(token);
  if (mfaPending) {
    return { token, tokenHash, expiresAt: new Date(Date.now() + MFA_TTL_MIN * 60_000) };
  }
  const expiresAt = remember ? addDays(new Date(), SESSION_TTL_DAYS) : addHours(new Date(), SESSION_TTL_SHORT_HOURS);
  return { token, tokenHash, expiresAt };
}

export async function createSession(input: CreateSessionInput): Promise<{ token: string; sessionId: string; expiresAt: Date }> {
  const t = issueSessionToken(input.remember, input.mfaPending);
  const s = await prisma.session.create({
    data: {
      tokenHash: t.tokenHash,
      userId: input.userId,
      mfaPending: !!input.mfaPending,
      remember: input.remember,
      activeOrgId: input.activeOrgId ?? null,
      ip: input.ip,
      userAgent: input.userAgent,
      expiresAt: t.expiresAt,
      lastSeenAt: new Date(),
    },
  });
  return { token: t.token, sessionId: s.id, expiresAt: t.expiresAt };
}

export async function getSessionByToken(token: string): Promise<SessionContext | null> {
  if (!token) return null;
  const tokenHash = sha256(token);
  const s = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, name: true, twoFactorEnabled: true } } },
  });
  if (!s || s.revokedAt || isBefore(s.expiresAt, new Date())) return null;
  await prisma.session.update({ where: { id: s.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  return { session: s, isMfaPending: s.mfaPending };
}

export async function revokeSession(sessionId: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null, id: exceptSessionId ? { not: exceptSessionId } : undefined },
    data: { revokedAt: new Date() },
  });
}

export async function completeMfa(sessionId: string): Promise<void> {
  await prisma.session.update({ where: { id: sessionId }, data: { mfaPending: false, lastSeenAt: new Date() } });
}

/** Rotate session: issue new token, revoke old. */
export async function rotateSession(oldToken: string, ip?: string | null, userAgent?: string | null): Promise<{ token: string; expiresAt: Date } | null> {
  const ctx = await getSessionByToken(oldToken);
  if (!ctx) return null;
  const { session } = ctx;
  const t = issueSessionToken(session.remember, false);
  await prisma.$transaction(async (tx) => {
    await tx.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    await tx.session.create({
      data: {
        tokenHash: t.tokenHash,
        userId: session.userId,
        mfaPending: false,
        remember: session.remember,
        activeOrgId: session.activeOrgId,
        ip,
        userAgent,
        expiresAt: t.expiresAt,
        lastSeenAt: new Date(),
      },
    });
  });
  return { token: t.token, expiresAt: t.expiresAt };
}

/** Cleanup expired/revoked sessions (>30d old). */
export async function cleanupSessions(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const res = await prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null, lt: cutoff } }] },
  });
  return res.count;
}

/** Get active sessions for a user (latest first). */
export async function listActiveSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true, ip: true, userAgent: true, lastSeenAt: true, createdAt: true, expiresAt: true, remember: true, mfaPending: true },
  });
}
