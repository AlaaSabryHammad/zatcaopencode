'use server';

import { z } from 'zod';
import { addDays } from 'date-fns';
import { requirePermission } from '@/server/rbac/guard';
import { prisma, withRls } from '@/server/db';
import { emailSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { hmac, randomToken } from '@/server/crypto';
import { sendInvitationEmail } from '@/server/mail';
import { setActiveOrg } from '@/server/services/org.service';
import { getCurrentUser } from '@/server/auth/current-user';

const inviteSchema = z.object({
  email: emailSchema,
  roleId: z.string().uuid('validation.invalid'),
  branchIds: z.array(z.string().uuid()).optional().default([]),
});

export async function inviteUser(input: unknown): Promise<ActionResult> {
  const ctx = await requirePermission('invitation.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const email = parsed.data.email;

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true, locale: true } });
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

  try {
    const meta = await withRls(rls, (tx) =>
      tx.organization.findUnique({
        where: { id: orgId },
        select: { nameAr: true, nameEn: true, defaultLocale: true },
      }),
    );
    const role = await withRls(rls, (tx) =>
      tx.role.findUnique({ where: { id: parsed.data.roleId }, select: { nameAr: true, nameEn: true } }),
    );
    const locale = existingUser?.locale ?? meta?.defaultLocale ?? 'ar';
    const orgName = locale === 'ar' ? (meta?.nameAr ?? '') : (meta?.nameEn ?? meta?.nameAr ?? '');
    const roleName = locale === 'ar' ? (role?.nameAr ?? '') : (role?.nameEn ?? role?.nameAr ?? '');
    await sendInvitationEmail({ to: email, orgName, roleName, token, locale, expiresInDays: 7 });
  } catch (e) {
    console.error('sendInvitationEmail failed:', e);
  }
  return { ok: true };
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

const inviteTokenSchema = z.object({ token: z.string().min(20, 'validation.invalid') });

export interface InvitePreview {
  email: string;
  orgNameAr: string;
  orgNameEn: string | null;
  roleNameAr: string;
  roleNameEn: string;
  expiresAt: string;
}

/** Public preview of a pending invitation (no auth; only non-sensitive fields via SECURITY DEFINER). */
export async function previewInvite(input: unknown): Promise<ActionResult<InvitePreview>> {
  const parsed = inviteTokenSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const tokenHash = hmac(parsed.data.token, 'token:INVITE');
  const rows = await prisma.$queryRaw<
    Array<{
      email: string;
      organization_id: string;
      organization_name_ar: string;
      organization_name_en: string | null;
      role_name_ar: string;
      role_name_en: string;
      expires_at: Date;
    }>
  >`SELECT * FROM invitation_preview(${tokenHash})`;
  const r = rows[0];
  if (!r) return { ok: false, error: 'invites.errors.invalid' };
  return {
    ok: true,
    data: {
      email: r.email,
      orgNameAr: r.organization_name_ar,
      orgNameEn: r.organization_name_en,
      roleNameAr: r.role_name_ar,
      roleNameEn: r.role_name_en,
      expiresAt: r.expires_at.toISOString(),
    },
  };
}

/** Accept an invitation: creates the membership, marks the invite accepted, activates the org. */
export async function acceptInvite(input: unknown): Promise<ActionResult<{ orgNameAr: string; orgNameEn: string | null }>> {
  const parsed = inviteTokenSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const tokenHash = hmac(parsed.data.token, 'token:INVITE');

  // The invitee reads their own invitation via the `email = app_user_email()` RLS branch.
  const inv = await withRls({ userId: user.id, userEmail: user.email }, (tx) =>
    tx.invitation.findFirst({
      where: { tokenHash, status: 'pending', expiresAt: { gt: new Date() } },
      include: { organization: { select: { id: true, nameAr: true, nameEn: true } } },
    }),
  );
  if (!inv) return { ok: false, error: 'invites.errors.invalid' };
  if (inv.email !== user.email.toLowerCase()) return { ok: false, error: 'invites.errors.emailMismatch' };

  const rls = { orgId: inv.organizationId, userId: user.id, userEmail: user.email };
  await withRls(rls, async (tx) => {
    const existing = await tx.membership.findFirst({
      where: { userId: user.id, organizationId: inv.organizationId },
      select: { id: true },
    });
    if (!existing) {
      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: inv.organizationId,
          roleId: inv.roleId,
          branchIds: inv.branchIds,
          status: 'active',
        },
      });
    }
    await tx.invitation.update({ where: { id: inv.id }, data: { status: 'accepted', acceptedAt: new Date() } });
  });
  await setActiveOrg(user.sessionId, inv.organizationId);
  return { ok: true, data: { orgNameAr: inv.organization.nameAr, orgNameEn: inv.organization.nameEn } };
}
