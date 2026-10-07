import 'server-only';
import { addMinutes } from 'date-fns';
import { hmac, randomDigits, sha256 } from '@/server/crypto';
import { prisma } from '@/server/db';
import type { OtpPurpose } from '@prisma/client';

const OTP_TTL_MIN = 5;
const OTP_MAX_ATTEMPTS = 5;

export interface GenerateOtpResult {
  code: string;
  expiresAt: Date;
}

/** Generate and persist a 6-digit OTP (HMAC-SHA256 stored). */
export async function generateOtp(opts: {
  userId?: string;
  phone: string;
  purpose: OtpPurpose;
}): Promise<GenerateOtpResult> {
  const code = randomDigits(6);
  const codeHash = hmac(code, `otp:${opts.purpose}`);
  const expiresAt = addMinutes(new Date(), OTP_TTL_MIN);
  await prisma.otpCode.create({
    data: {
      userId: opts.userId ?? null,
      phone: opts.phone,
      purpose: opts.purpose,
      codeHash,
      expiresAt,
      attempts: 0,
    },
  });
  return { code, expiresAt };
}

export async function verifyOtp(opts: {
  phone: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<{ ok: boolean; userId?: string; reason?: 'expired' | 'max_attempts' | 'invalid' }> {
  const codeHash = hmac(opts.code, `otp:${opts.purpose}`);
  const rec = await prisma.otpCode.findFirst({
    where: { phone: opts.phone, purpose: opts.purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!rec) return { ok: false, reason: 'expired' };
  if (rec.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpCode.update({ where: { id: rec.id }, data: { consumedAt: new Date() } });
    return { ok: false, reason: 'max_attempts' };
  }
  if (rec.codeHash !== codeHash) {
    await prisma.otpCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: 'invalid' };
  }
  await prisma.otpCode.update({ where: { id: rec.id }, data: { consumedAt: new Date() } });
  return { ok: true, userId: rec.userId ?? undefined };
}

/** Cleanup expired/consumed OTPs. */
export async function cleanupOtp(): Promise<number> {
  const res = await prisma.otpCode.deleteMany({
    where: { OR: [{ consumedAt: { not: null } }, { expiresAt: { lt: new Date() } }] },
  });
  return res.count;
}

export function otpRateLimitKey(phone: string, purpose: OtpPurpose): string {
  const p = sha256(phone).slice(0, 16);
  return `otp:${purpose}:${p}`;
}
