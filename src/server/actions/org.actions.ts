'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/server/auth/current-user';
import { createOrganization, setActiveOrg, SlugTakenError } from '@/server/services/org.service';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { withRls } from '@/server/db';

const createOrgSchema = z.object({
  nameAr: z.string().trim().min(2, 'validation.required'),
  nameEn: z.string().trim().optional().nullable(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/, 'validation.slugInvalid')
    .optional()
    .nullable(),
  crNumber: z.string().trim().optional().nullable(),
  vatNumber: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || /^3\d{13}3$/.test(v), 'validation.vatInvalid'),
  tin: z.string().trim().optional().nullable(),
  businessType: z.string().trim().optional().nullable(),
  industry: z.string().trim().optional().nullable(),
});

export async function createOrg(input: unknown): Promise<ActionResult<{ orgId: string; slug: string }>> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const parsed = createOrgSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const org = await createOrganization(user.id, parsed.data);
    await setActiveOrg(user.sessionId, org.id);
    return { ok: true, data: { orgId: org.id, slug: org.slug } };
  } catch (e) {
    if (e instanceof SlugTakenError) return { ok: false, error: 'org.errors.slugTaken' };
    throw e;
  }
}

export async function switchOrg(orgId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const m = await withRls({ userId: user.id, userEmail: user.email }, (tx) =>
    tx.membership.findFirst({ where: { userId: user.id, organizationId: orgId, status: 'active' } }),
  );
  if (!m) return { ok: false, error: 'org.errors.notMember' };
  await setActiveOrg(user.sessionId, orgId);
  return { ok: true };
}

/** Clear the active org so the onboarding wizard starts a fresh organization. */
export async function startNewOrg(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  await setActiveOrg(user.sessionId, null);
  return { ok: true };
}

/** Active organization details for the shell header. */
export async function getActiveOrg() {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return null;
  return withRls({ userId: user.id, userEmail: user.email }, async (tx) => {
    const sess = await tx.session.findUnique({ where: { id: user.sessionId }, select: { activeOrgId: true } });
    if (!sess?.activeOrgId) return null;
    const m = await tx.membership.findFirst({
      where: { userId: user.id, organizationId: sess.activeOrgId, status: 'active' },
      include: { organization: true },
    });
    return m?.organization ?? null;
  });
}
