'use server';

import { z } from 'zod';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/current-user';
import { verifyPassword, setPassword } from '@/server/services/password.service';
import { revokeSession, revokeAllSessions, listActiveSessions } from '@/server/services/session.service';
import { changePasswordSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';

/** Change password; revokes every other session. */
export async function changePassword(input: unknown): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!current?.passwordHash || !(await verifyPassword(current.passwordHash, parsed.data.current))) {
    return { ok: false, error: 'security.errors.currentWrong' };
  }
  if (await verifyPassword(current.passwordHash, parsed.data.password)) {
    return { ok: false, error: 'security.errors.sameAsCurrent' };
  }
  await setPassword(user.id, parsed.data.password);
  await revokeAllSessions(user.id, user.sessionId);
  return { ok: true };
}

export interface SessionInfo {
  id: string;
  ip: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
  remember: boolean;
  current: boolean;
}

/** Active sessions of the current user (for the security page). */
export async function getMySessions(): Promise<ActionResult<SessionInfo[]>> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const sessions = await listActiveSessions(user.id);
  return {
    ok: true,
    data: sessions.map((s) => ({
      id: s.id,
      ip: s.ip,
      userAgent: s.userAgent,
      lastSeenAt: s.lastSeenAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      remember: s.remember,
      current: s.id === user.sessionId,
    })),
  };
}

const revokeSchema = z.object({ sessionId: z.string().uuid('validation.invalid') });

/** Revoke one of your other sessions (never the current one — use logout for that). */
export async function revokeOtherSession(input: unknown): Promise<ActionResult> {
  const parsed = revokeSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  if (parsed.data.sessionId === user.sessionId) return { ok: false, error: 'security.errors.cannotRevokeCurrent' };
  const s = await prisma.session.findUnique({
    where: { id: parsed.data.sessionId },
    select: { id: true, userId: true },
  });
  if (!s || s.userId !== user.id) return { ok: false, error: 'auth.errors.unauthorized' };
  await revokeSession(s.id);
  return { ok: true };
}
