'use server';

import { z } from 'zod';
import { requirePermission } from '@/server/rbac/guard';
import { withRls } from '@/server/db';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { PERMISSIONS, type PermissionKey } from '@/server/rbac/permissions';

const createRoleSchema = z.object({
  nameAr: z.string().trim().min(2, 'validation.required'),
  nameEn: z.string().trim().optional().nullable(),
  permissions: z.array(z.string()).min(1, 'validation.required'),
});

export async function createCustomRole(input: unknown): Promise<ActionResult<{ roleId: string }>> {
  const ctx = await requirePermission('role.manage');
  const orgId = ctx.activeMembership!.organizationId;
  const parsed = createRoleSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const perms = parsed.data.permissions.filter((p): p is PermissionKey => p in PERMISSIONS);
  if (perms.length === 0) return { ok: false, error: 'validation.invalid' };
  const rls = { orgId, userId: ctx.user.id, userEmail: ctx.user.email };
  // RLS insert policy requires organization_id = app.org_id() AND NOT is_system.
  const role = await withRls(rls, (tx) =>
    tx.role.create({
      data: {
        organizationId: orgId,
        key: `custom.${Date.now()}`,
        nameAr: parsed.data.nameAr,
        nameEn: parsed.data.nameEn ?? parsed.data.nameAr,
        isSystem: false,
      },
    }),
  );
  await withRls(rls, (tx) =>
    tx.rolePermission.createMany({
      data: perms.map((pk) => ({ roleId: role.id, permissionKey: pk })),
      skipDuplicates: true,
    }),
  );
  return { ok: true, data: { roleId: role.id } };
}
