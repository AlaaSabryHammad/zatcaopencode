import 'server-only';
import { render } from 'react-email';
import { createTransport, mailFrom } from './config';
import { VerifyEmail } from './templates/VerifyEmail';
import { ResetPassword } from './templates/ResetPassword';
import { OtpCode } from './templates/OtpCode';
import { env } from '@/server/env';

const transport = createTransport();

export async function sendVerificationEmail(opts: { to: string; name: string; token: string }) {
  const verifyUrl = `${env.APP_URL}/auth/verify-email?token=${opts.token}`;
  const html = await render(VerifyEmail({ name: opts.name, verifyUrl, appUrl: env.APP_URL }));
  await transport.sendMail({ from: mailFrom, to: opts.to, subject: 'تأكيد البريد الإلكتروني — ZatcaWeb', html });
}

export async function sendPasswordResetEmail(opts: { to: string; name: string; token: string; expiresInHours: number }) {
  const resetUrl = `${env.APP_URL}/auth/reset-password?token=${opts.token}`;
  const html = await render(ResetPassword({ name: opts.name, resetUrl, appUrl: env.APP_URL, expiresInHours: opts.expiresInHours }));
  await transport.sendMail({ from: mailFrom, to: opts.to, subject: 'إعادة تعيين كلمة المرور — ZatcaWeb', html });
}

export async function sendOtpEmail(opts: { to: string; name: string; code: string; expiresInMinutes: number }) {
  const html = await render(OtpCode({ name: opts.name, code: opts.code, appUrl: env.APP_URL, expiresInMinutes: opts.expiresInMinutes }));
  await transport.sendMail({ from: mailFrom, to: opts.to, subject: `رمز التحقق: ${opts.code}`, html });
}
