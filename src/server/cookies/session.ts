import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/server/services/session.service';
import { env } from '@/server/env';

export async function setSessionCookie(token: string, expiresAt: Date) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value;
}
