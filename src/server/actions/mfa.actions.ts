'use server';

import { prisma } from '@/server/db';
import { getSessionToken } from '@/server/cookies/session';
import { getSessionByToken, completeMfa } from '@/server/services/session.service';
import { totpSchema, recoveryCodeSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { decryptSecret, hmac, safeEqual } from '@/server/crypto';
import * as OTPAuth from 'otpauth';

export async function verifyTotp(input: unknown): Promise<ActionResult> {
  const parsed = totpSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const token = await getSessionToken();
  if (!token) return { ok: false, error: 'auth.errors.sessionExpired' };
  const ctx = await getSessionByToken(token);
  if (!ctx) return { ok: false, error: 'auth.errors.sessionExpired' };
  const { session } = ctx;
  if (!session.mfaPending) return { ok: true };
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) return { ok: false, error: 'auth.errors.mfaNotEnabled' };
  let secret: string;
  try {
    secret = decryptSecret(user.twoFactorSecret, `totp:${user.id}`);
  } catch {
    return { ok: false, error: 'auth.errors.mfaInvalid' };
  }
  const totp = new OTPAuth.TOTP({ secret, algorithm: 'SHA1', digits: 6, period: 30 });
  const delta = totp.validate({ token: parsed.data.code, window: 1 });
  if (delta === null) return { ok: false, error: 'auth.errors.otpInvalid' };
  await completeMfa(session.id);
  return { ok: true };
}

export async function recoverTotp(input: unknown): Promise<ActionResult> {
  const parsed = recoveryCodeSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const token = await getSessionToken();
  if (!token) return { ok: false, error: 'auth.errors.sessionExpired' };
  const ctx = await getSessionByToken(token);
  if (!ctx) return { ok: false, error: 'auth.errors.sessionExpired' };
  const { session } = ctx;
  if (!session.mfaPending) return { ok: true };
  const codeHash = hmac(parsed.data.code, 'recovery');
  const codes = await prisma.recoveryCode.findMany({
    where: { userId: session.userId, usedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  const match = codes.find((rc) => safeEqual(rc.codeHash, codeHash));
  if (!match) return { ok: false, error: 'auth.errors.recoveryInvalid' };
  await prisma.$transaction(async (tx) => {
    await tx.recoveryCode.update({ where: { id: match.id }, data: { usedAt: new Date() } });
    await tx.session.update({ where: { id: session.id }, data: { mfaPending: false } });
  });
  return { ok: true };
}
