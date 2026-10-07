'use server';

import { z } from 'zod';
import { addDays } from 'date-fns';
import { requirePermission } from '@/server/rbac/guard';
import { prisma, withRls } from '@/server/db';
import { emailSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { hmac, randomToken } from '@/server/crypto';

const inviteSchema = z.object({
  email: emailSchema,
  roleId: z.string().uuid('validation.invalid'),
  branchIds: z.array(z.string().uuid()).optional().default([]),
});

export async function inviteUser(input: unknown): Promise<ActionResult<{ token: string }>> {
  const ctx = await requirePermission('invitation.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const email = parsed.data.email;

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  if (existingUser) {
    const member = await withRls(rls, (tx) =>
      tx.membership.findFirst({ where: { organizationId: orgId, userId: existingUser.id }, select: { id: true } }),
    );
    if (member) return { ok: false, error: 'users.errors.alreadyMember' };
  }
  const pending = await withRls(rls, (tx) =>
    tx.invitation.findFirst({
      where: { organizationId: orgId, email, status: 'pending', expiresAt: { gt: new Date() } },
      select: { id: true },
    }),
  );
  if (pending) return { ok: false, error: 'users.errors.pendingInvite' };

  const token = randomToken(32);
  await withRls(rls, (tx) =>
    tx.invitation.create({
      data: {
        organizationId: orgId,
        email,
        roleId: parsed.data.roleId,
        branchIds: parsed.data.branchIds,
        tokenHash: hmac(token, 'token:INVITE'),
        invitedById: ctx.user.id,
        expiresAt: addDays(new Date(), 7),
      },
    }),
  );
  // TODO Phase 2 (invites flow): email the accept link `/invite?token=…`.
  return { ok: true, data: { token } };
}

const updateRoleSchema = z.object({
  membershipId: z.string().uuid('validation.invalid'),
  roleId: z.string().uuid('validation.invalid'),
});

export async function updateMembershipRole(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('user.update');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const m = await withRls(rls, (tx) =>
    tx.membership.findUnique({ where: { id: parsed.data.membershipId }, select: { id: true, organizationId: true } }),
  );
  if (!m || m.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  await withRls(rls, (tx) => tx.membership.update({ where: { id: m.id }, data: { roleId: parsed.data.roleId } }));
  return { ok: true };
}

const suspendSchema = z.object({ membershipId: z.string().uuid('validation.invalid') });

export async function suspendMembership(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('user.update');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = suspendSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  const m = await withRls(rls, (tx) =>
    tx.membership.findUnique({
      where: { id: parsed.data.membershipId },
      select: { id: true, organizationId: true, userId: true },
    }),
  );
  if (!m || m.organizationId !== orgId) return { ok: false, error: 'auth.errors.unauthorized' };
  if (m.userId === ctx.user.id) return { ok: false, error: 'users.errors.cannotSuspendSelf' };
  await withRls(rls, (tx) => tx.membership.update({ where: { id: m.id }, data: { status: 'suspended' } }));
  return { ok: true };
}
