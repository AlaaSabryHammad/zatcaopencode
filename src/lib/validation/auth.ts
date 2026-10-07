import { z } from 'zod';
import { PASSWORD_MAX, passwordStrength } from '@/lib/password';

/**
 * Shared Zod schemas (client forms + server actions). Error messages are i18n keys under
 * `validation.*` in messages/{ar,en}.json — forms translate them, servers return them as-is.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'validation.required')
  .max(254, 'validation.email')
  .pipe(z.email('validation.email'));

/** Saudi mobile: 9 national digits starting with 5 → stored as E.164 (+9665XXXXXXXX). */
export const saudiMobileSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, '').replace(/^(00966|966|0)/, ''))
  .refine((v) => /^5\d{8}$/.test(v), 'validation.phone')
  .transform((v) => `+966${v}`);

export const passwordSchema = z
  .string()
  .max(PASSWORD_MAX, 'validation.passwordTooLong')
  .refine((v) => passwordStrength(v).meetsPolicy, 'validation.passwordWeak');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'validation.required').max(PASSWORD_MAX),
  remember: z.boolean().default(false),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'validation.nameShort').max(120, 'validation.nameLong'),
  email: emailSchema,
  phone: saudiMobileSchema,
  password: passwordSchema,
  terms: z.boolean().refine((v) => v === true, 'validation.terms'),
});

export const otpCodeSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => /^\d{6}$/.test(v), 'validation.otp');

export const otpRequestSchema = z.object({ phone: saudiMobileSchema });
export const otpVerifySchema = z.object({ phone: saudiMobileSchema, code: otpCodeSchema });

export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z
  .object({ token: z.string().min(20), password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'validation.passwordMismatch' });

export const totpSchema = z.object({ code: otpCodeSchema });
export const recoveryCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => v.replace(/[^A-Z0-9]/g, ''))
    .refine((v) => /^[A-Z0-9]{10}$/.test(v), 'validation.recoveryCode'),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'validation.required'),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'validation.passwordMismatch' });

/** Only same-site relative paths are allowed as post-login redirects (open-redirect guard). */
export function safeNext(next: unknown): string | null {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  if (/[\r\n]/.test(next)) return null;
  return next;
}
