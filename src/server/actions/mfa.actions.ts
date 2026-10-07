'use server';

import { prisma } from '@/server/db';
import { getSessionToken } from '@/server/cookies/session';
import { getSessionByToken, completeMfa } from '@/server/services/session.service';
import { getCurrentUser } from '@/server/auth/current-user';
import { verifyPassword } from '@/server/services/password.service';
import { z } from 'zod';
import { totpSchema, recoveryCodeSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { decryptSecret, hmac, safeEqual, encryptSecret } from '@/server/crypto';
import { randomBytes } from 'node:crypto';
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
  if (!user?.twoFactorEnabled || !user.twoFactorSecret)
    return { ok: false, error: 'auth.errors.mfaNotEnabled' };
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

const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newRecoveryCode(): string {
  const bytes = randomBytes(10);
  let s = '';
  for (const b of bytes) s += RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length];
  return s;
}

/** Start TOTP enrollment: stores an encrypted secret (inactive) and returns the otpauth URL. */
export async function setupTotp(): Promise<ActionResult<{ otpauthUrl: string; secret: string }>> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true },
  });
  if (current?.twoFactorEnabled) return { ok: false, error: 'security.errors.alreadyEnabled' };
  const secret = new OTPAuth.Secret({ size: 20 }).base32;
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: encryptSecret(secret, `totp:${user.id}`) },
  });
  const totp = new OTPAuth.TOTP({
    issuer: 'ZatcaWeb',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });
  return { ok: true, data: { otpauthUrl: totp.toString(), secret } };
}

/** Confirm enrollment with a TOTP code; returns single-view recovery codes. */
export async function confirmTotp(input: unknown): Promise<ActionResult<{ codes: string[] }>> {
  const parsed = totpSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!current?.twoFactorSecret) return { ok: false, error: 'security.errors.noSetup' };
  if (current.twoFactorEnabled) return { ok: false, error: 'security.errors.alreadyEnabled' };
  let secret: string;
  try {
    secret = decryptSecret(current.twoFactorSecret, `totp:${user.id}`);
  } catch {
    return { ok: false, error: 'auth.errors.mfaInvalid' };
  }
  const totp = new OTPAuth.TOTP({ secret, algorithm: 'SHA1', digits: 6, period: 30 });
  if (totp.validate({ token: parsed.data.code, window: 1 }) === null) {
    return { ok: false, error: 'auth.errors.otpInvalid' };
  }
  const codes = Array.from({ length: 10 }, () => newRecoveryCode());
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true, twoFactorEnabledAt: new Date() },
    });
    await tx.recoveryCode.deleteMany({ where: { userId: user.id } });
    await tx.recoveryCode.createMany({
      data: codes.map((c) => ({ userId: user.id, codeHash: hmac(c, 'recovery') })),
    });
  });
  return { ok: true, data: { codes } };
}

const disableSchema = z.object({ password: z.string().min(1, 'validation.required') });

/** Disable 2FA after password confirmation; wipes secret and recovery codes. */
export async function disableTotp(input: unknown): Promise<ActionResult> {
  const parsed = disableSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!current?.passwordHash || !(await verifyPassword(current.passwordHash, parsed.data.password))) {
    return { ok: false, error: 'security.errors.currentWrong' };
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorEnabledAt: null, twoFactorSecret: null },
    });
    await tx.recoveryCode.deleteMany({ where: { userId: user.id } });
  });
  return { ok: true };
}
