'use server';

import { headers } from 'next/headers';
import { sha256 } from '@/server/crypto';
import { prisma } from '@/server/db';
import { getRateLimitStore } from '@/server/rate-limit';
import { createSession, revokeSession, revokeAllSessions } from '@/server/services/session.service';
import { setSessionCookie, clearSessionCookie, getSessionToken } from '@/server/cookies/session';
import {
  verifyCredentials,
  createVerificationToken,
  consumeVerificationToken,
  markEmailVerified,
  RESET_TOKEN_TTL_H,
  VERIFY_EMAIL_TTL_H,
} from '@/server/services/auth.service';
import { setPassword, hashPassword } from '@/server/services/password.service';
import { generateOtp, verifyOtp, otpRateLimitKey } from '@/server/services/otp.service';
import { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail } from '@/server/mail';
import {
  loginSchema,
  registerSchema,
  forgotSchema,
  resetSchema,
  otpRequestSchema,
  otpVerifySchema,
} from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import type { OtpPurpose } from '@prisma/client';

async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0]?.trim() || null;
    return h.get('x-real-ip');
  } catch {
    return null;
  }
}

async function getUserAgent(): Promise<string | null> {
  try {
    return (await headers()).get('user-agent');
  } catch {
    return null;
  }
}

/** تسجيل حساب جديد */
export async function register(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { id: true },
  });
  if (existing) return { ok: false, error: 'auth.errors.emailExists' };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, locale: 'ar', theme: 'system' },
    select: { id: true, email: true, name: true },
  });

  try {
    const token = await createVerificationToken(user.id, 'VERIFY_EMAIL', VERIFY_EMAIL_TTL_H);
    await sendVerificationEmail({ to: user.email, name: user.name, token, locale: 'ar' });
  } catch (e) {
    console.error('sendVerificationEmail failed:', e);
  }

  return { ok: true, data: { email: user.email } };
}

/** تسجيل الدخول بالبريد وكلمة المرور */
export async function login(
  input: unknown,
): Promise<ActionResult<{ requiresMfa?: boolean; email?: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { email, password, remember } = parsed.data;

  const ip = await getClientIp();
  const ua = await getUserAgent();
  const rl = getRateLimitStore();
  const keyEmail = `login:email:${sha256(email).slice(0, 16)}`;
  const keyIp = ip ? `login:ip:${sha256(ip).slice(0, 16)}` : undefined;

  const r1 = await rl.increment(keyEmail, 10, 5 * 60_000);
  if (!r1.allowed)
    return {
      ok: false,
      error: 'auth.errors.tooManyAttempts',
      retryAfter: Math.ceil((r1.resetMs - Date.now()) / 1000),
    };
  if (keyIp) {
    const r2 = await rl.increment(keyIp, 20, 5 * 60_000);
    if (!r2.allowed)
      return {
        ok: false,
        error: 'auth.errors.tooManyAttempts',
        retryAfter: Math.ceil((r2.resetMs - Date.now()) / 1000),
      };
  }

  const cred = await verifyCredentials(email, password);
  if (!cred.ok || !cred.userId) {
    const reason =
      cred.reason === 'locked'
        ? 'auth.errors.accountLocked'
        : cred.reason === 'no_password'
          ? 'auth.errors.noPasswordSet'
          : 'auth.errors.invalidCredentials';
    return { ok: false, error: reason };
  }

  const user = await prisma.user.findUnique({
    where: { id: cred.userId },
    select: { id: true, email: true, twoFactorEnabled: true },
  });
  if (!user) return { ok: false, error: 'auth.errors.invalidCredentials' };

  if (user.twoFactorEnabled) {
    const s = await createSession({ userId: user.id, remember, mfaPending: true, ip, userAgent: ua });
    await setSessionCookie(s.token, s.expiresAt);
    return { ok: true, data: { requiresMfa: true, email: user.email } };
  }

  const s = await createSession({ userId: user.id, remember, mfaPending: false, ip, userAgent: ua });
  await setSessionCookie(s.token, s.expiresAt);

  prisma.user
    .update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), failedLoginCount: 0, lockedUntil: null },
    })
    .catch(() => {});

  return { ok: true, data: {} };
}

/** تسجيل الخروج */
export async function logout(): Promise<ActionResult> {
  const token = await getSessionToken();
  if (token) {
    const sess = await prisma.session.findUnique({
      where: { tokenHash: sha256(token) },
      select: { id: true },
    });
    if (sess) await revokeSession(sess.id);
  }
  await clearSessionCookie();
  return { ok: true };
}

/** تسجيل الخروج من كل الجلسات */
export async function logoutAll(): Promise<ActionResult> {
  const token = await getSessionToken();
  if (token) {
    const sess = await prisma.session.findUnique({
      where: { tokenHash: sha256(token) },
      select: { id: true, userId: true },
    });
    if (sess) await revokeAllSessions(sess.userId, sess.id);
  }
  await clearSessionCookie();
  return { ok: true };
}

/** طلب رابط إعادة تعيين كلمة المرور (لا يكشف وجود الإيميل) */
export async function forgotPassword(input: unknown): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { email } = parsed.data;
  const u = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, locale: true } });
  if (u) {
    try {
      const token = await createVerificationToken(u.id, 'RESET_PASSWORD', RESET_TOKEN_TTL_H);
      await sendPasswordResetEmail({ to: email, name: u.name, token, expiresInHours: RESET_TOKEN_TTL_H, locale: u.locale });
    } catch (e) {
      console.error('sendPasswordResetEmail failed:', e);
    }
  }
  return { ok: true };
}

/** إعادة تعيين كلمة المرور برابط التحقق */
export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { token, password } = parsed.data;
  const c = await consumeVerificationToken(token, 'RESET_PASSWORD');
  if (!c.ok || !c.userId) return { ok: false, error: 'auth.errors.invalidToken' };
  await setPassword(c.userId, password);
  await revokeAllSessions(c.userId);
  await clearSessionCookie();
  return { ok: true };
}

/** تأكيد البريد الإلكتروني */
export async function verifyEmail(input: { token: string } | unknown): Promise<ActionResult> {
  const token =
    typeof input === 'object' && input && 'token' in input
      ? String((input as { token: unknown }).token ?? '')
      : String(input ?? '');
  if (!token || token.length < 20) return { ok: false, error: 'auth.errors.invalidToken' };
  const c = await consumeVerificationToken(token, 'VERIFY_EMAIL');
  if (!c.ok || !c.userId) return { ok: false, error: 'auth.errors.invalidToken' };
  await markEmailVerified(c.userId);
  return { ok: true };
}

/** طلب رمز OTP للهاتف */
export async function requestOtp(input: unknown, purpose: OtpPurpose = 'LOGIN'): Promise<ActionResult> {
  const parsed = otpRequestSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { phone } = parsed.data;
  const rl = getRateLimitStore();
  const r = await rl.increment(otpRateLimitKey(phone, purpose), 5, 10 * 60_000);
  if (!r.allowed)
    return {
      ok: false,
      error: 'auth.errors.tooManyAttempts',
      retryAfter: Math.ceil((r.resetMs - Date.now()) / 1000),
    };

  const u = await prisma.user.findUnique({ where: { phone }, select: { id: true, name: true, email: true } });
  const res = await generateOtp({ userId: u?.id, phone, purpose });
  try {
    if (u?.email) {
      await sendOtpEmail({ to: u.email, name: u.name, code: res.code, expiresInMinutes: 5 });
    }
  } catch (e) {
    console.error('sendOtpEmail failed:', e);
  }
  return { ok: true };
}

/** التحقق من رمز OTP وتسجيل الدخول */
export async function verifyOtpCode(input: unknown, purpose: OtpPurpose = 'LOGIN'): Promise<ActionResult> {
  const parsed = otpVerifySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { phone, code } = parsed.data;
  const v = await verifyOtp({ phone, purpose, code });
  if (!v.ok) {
    const err =
      v.reason === 'max_attempts'
        ? 'auth.errors.otpMaxAttempts'
        : v.reason === 'expired'
          ? 'auth.errors.otpExpired'
          : 'auth.errors.otpInvalid';
    return { ok: false, error: err };
  }
  let userId = v.userId;
  if (!userId) {
    const u = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
    userId = u?.id;
  }
  if (!userId) return { ok: false, error: 'auth.errors.userNotFound' };

  const ip = await getClientIp();
  const ua = await getUserAgent();
  const s = await createSession({ userId, remember: true, mfaPending: false, ip, userAgent: ua });
  await setSessionCookie(s.token, s.expiresAt);
  prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } }).catch(() => {});
  return { ok: true };
}
