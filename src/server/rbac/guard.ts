import 'server-only';
import { withRls } from '@/server/db';
import { requireOrgContext, type OrgContext } from '@/server/auth/current-user';
import type { PermissionKey } from './permissions';

async function rolePermissions(ctx: OrgContext): Promise<Set<string>> {
  const m = ctx.activeMembership;
  if (!m) return new Set();
  const rows = await withRls({ orgId: m.organizationId, userId: ctx.user.id, userEmail: ctx.user.email }, (tx) =>
    tx.rolePermission.findMany({ where: { roleId: m.roleId }, select: { permissionKey: true } }),
  );
  return new Set(rows.map((r) => r.permissionKey));
}

export async function hasPermission(permission: PermissionKey): Promise<boolean> {
  try {
    const ctx = await requireOrgContext();
    if (!ctx.activeMembership) return false;
    return (await rolePermissions(ctx)).has(permission);
  } catch {
    return false;
  }
}

export async function requirePermission(permission: PermissionKey): Promise<OrgContext> {
  const ctx = await requireOrgContext();
  if (!ctx.activeMembership) throw new Error('forbidden');
  if (!(await rolePermissions(ctx)).has(permission)) throw new Error('forbidden');
  return ctx;
}
