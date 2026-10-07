import { PrismaClient, type Prisma } from '@prisma/client';
import { PERMISSIONS, type PermissionKey } from '../src/server/rbac/permissions';
import { SYSTEM_ROLES } from '../src/server/rbac/system-roles';

const prisma = new PrismaClient();

async function seedSystemInfo() {
  const entries: Array<Prisma.SystemInfoCreateInput> = [
    { key: 'seed.phase', value: '2' },
    { key: 'schema.version', value: '2.0.0' },
    { key: 'roles.syncedAt', value: new Date().toISOString() },
    { key: 'permissions.syncedAt', value: new Date().toISOString() },
  ];
  for (const e of entries) {
    await prisma.systemInfo.upsert({ where: { key: e.key }, create: e, update: { value: e.value } });
  }
}

async function seedPermissions() {
  const keys = Object.keys(PERMISSIONS) as PermissionKey[];
  for (const key of keys) {
    const p = PERMISSIONS[key];
    await prisma.permission.upsert({
      where: { key },
      create: { key, group: p.group, description: p.description },
      update: { group: p.group, description: p.description },
    });
  }
}

async function seedSystemRoles() {
  for (const r of SYSTEM_ROLES) {
    // organizationId is nullable so upsert on the composite key isn't possible; use find-then-write.
    const existing = await prisma.role.findFirst({ where: { organizationId: null, key: r.key } });
    const role = existing
      ? await prisma.role.update({
          where: { id: existing.id },
          data: { nameAr: r.nameAr, nameEn: r.nameEn, isSystem: true },
        })
      : await prisma.role.create({
          data: { organizationId: null, key: r.key, nameAr: r.nameAr, nameEn: r.nameEn, isSystem: true },
        });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: r.permissions.map((pk) => ({ roleId: role.id, permissionKey: pk })),
      skipDuplicates: true,
    });
  }
}

async function main() {
  await seedSystemInfo();
  await seedPermissions();
  await seedSystemRoles();
  console.log('Seed complete (phase 2: RBAC).');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
