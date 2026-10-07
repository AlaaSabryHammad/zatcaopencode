/**
 * Password policy shared by client (strength meter) and server (enforcement).
 * Minimum 10 characters with letters and digits; strength rewards length and character variety.
 */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

export type PasswordStrength = {
  /** 0–100 for the Progress bar */
  score: number;
  level: 'empty' | 'weak' | 'fair' | 'strong';
  length: number;
  hasLetter: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  hasMixedCase: boolean;
  meetsPolicy: boolean;
};

const COMMON = ['password', '12345678', 'qwerty', 'zatcaweb', 'p@ssw0rd', 'iloveyou', 'admin123'];

export function passwordStrength(pw: string): PasswordStrength {
  const length = [...pw].length;
  const hasLetter = /\p{L}/u.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^\p{L}\d\s]/u.test(pw);
  const hasMixedCase = /\p{Ll}/u.test(pw) && /\p{Lu}/u.test(pw);
  const common = COMMON.some((c) => pw.toLowerCase().includes(c));
  const meetsPolicy = length >= PASSWORD_MIN && length <= PASSWORD_MAX && hasLetter && hasDigit && !common;

  if (!length)
    return { score: 0, level: 'empty', length, hasLetter, hasDigit, hasSymbol, hasMixedCase, meetsPolicy };
  let score = Math.min(length, 16) * 4; // up to 64
  if (hasDigit) score += 8;
  if (hasSymbol) score += 14;
  if (hasMixedCase) score += 14;
  if (common) score = Math.min(score, 20);
  if (!meetsPolicy) score = Math.min(score, 45);
  score = Math.min(100, score);
  const level = score >= 75 ? 'strong' : score >= 45 ? 'fair' : 'weak';
  return { score, level, length, hasLetter, hasDigit, hasSymbol, hasMixedCase, meetsPolicy };
}
