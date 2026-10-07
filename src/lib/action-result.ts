import type { z } from 'zod';

/**
 * Uniform server-action result. `error` and `fieldErrors` values are i18n keys (e.g. `auth.errors.invalidCredentials`,
 * `validation.email`) so the client renders them in the active language.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string>; retryAfter?: number };

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
  }
  return out;
}

export function invalid(error: z.ZodError): ActionResult<never> {
  return { ok: false, error: 'validation.fixErrors', fieldErrors: fieldErrorsFrom(error) };
}
