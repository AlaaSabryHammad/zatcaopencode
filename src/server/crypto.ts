import 'server-only';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { env } from './env';

/** URL-safe random token (default 32 bytes → 43 chars). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Numeric code with uniform distribution (OTP). */
export function randomDigits(length = 6): string {
  let s = '';
  for (let i = 0; i < length; i++) s += randomInt(0, 10).toString();
  return s;
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Keyed hash for low-entropy secrets (OTP and recovery codes) so a DB leak can't be brute-forced offline. */
export function hmac(value: string, purpose: string): string {
  return createHmac('sha256', env.AUTH_SECRET).update(`${purpose}:${value}`).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Envelope encryption for secrets at rest (TOTP secrets, e-invoicing private keys, API secrets).
 * Each value gets a fresh 256-bit data key (DEK) encrypted with AES-256-GCM; the DEK itself is wrapped
 * with the key-encryption key APP_ENCRYPTION_KEY. Format: v1.<wrappedDek>.<iv>.<tag>.<ciphertext> (base64url).
 * Rotating APP_ENCRYPTION_KEY only requires re-wrapping DEKs.
 */
const VERSION = 'v1';

function kek(): Buffer {
  return Buffer.from(env.APP_ENCRYPTION_KEY, 'base64');
}

function gcmEncrypt(key: Buffer, plaintext: Buffer, aad: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(aad));
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { iv, tag: cipher.getAuthTag(), ct };
}

function gcmDecrypt(key: Buffer, iv: Buffer, tag: Buffer, ct: Buffer, aad: string): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/** @param context binds the ciphertext to its use (e.g. `totp:<userId>`) so it can't be swapped between rows. */
export function encryptSecret(plaintext: string, context: string): string {
  const dek = randomBytes(32);
  const wrapped = gcmEncrypt(kek(), dek, `dek:${context}`);
  const body = gcmEncrypt(dek, Buffer.from(plaintext, 'utf8'), context);
  const wrappedDek = Buffer.concat([wrapped.iv, wrapped.tag, wrapped.ct]).toString('base64url');
  return [VERSION, wrappedDek, body.iv.toString('base64url'), body.tag.toString('base64url'), body.ct.toString('base64url')].join('.');
}

export function decryptSecret(payload: string, context: string): string {
  const [version, wrappedDek, iv, tag, ct] = payload.split('.');
  if (version !== VERSION || !wrappedDek || !iv || !tag || !ct) throw new Error('decryptSecret: malformed payload');
  const w = Buffer.from(wrappedDek, 'base64url');
  const dek = gcmDecrypt(kek(), w.subarray(0, 12), w.subarray(12, 28), w.subarray(28), `dek:${context}`);
  return gcmDecrypt(dek, Buffer.from(iv, 'base64url'), Buffer.from(tag, 'base64url'), Buffer.from(ct, 'base64url'), context).toString('utf8');
}
