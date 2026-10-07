import 'server-only';
import nodemailer from 'nodemailer';
import { env } from '@/server/env';

export function createTransport() {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
      tls: { rejectUnauthorized: false }, // local dev only
    });
  }
  // Mailpit default: localhost:1025, no auth
  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true,
  });
}

export const mailFrom = env.SMTP_FROM;
