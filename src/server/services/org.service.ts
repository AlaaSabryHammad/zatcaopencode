import 'server-only';
import { randomUUID } from 'node:crypto';
import { prisma, withRls } from '@/server/db';
import { randomToken } from '@/server/crypto';

export interface CreateOrgInput {
  slug?: string | null;
  nameAr: string;
  nameEn?: string | null;
  legalName?: string | null;
  crNumber?: string | null;
  vatNumber?: string | null;
  tin?: string | null;
  businessType?: string | null;
  industry?: string | null;
}

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return base || 'org';
}

export class SlugTakenError extends Error {
  constructor() {
    super('slug taken');
  }
}

/**
 * Creates the organization with a client-generated id inside an RLS transaction whose
 * `app.org_id` equals that id, so the INSERT policy (`id = app.org_id()`) passes.
 * The creator becomes `org.owner`.
 */
export async function createOrganization(userId: string, input: CreateOrgInput) {
  const explicit = (input.slug ?? '').trim().toLowerCase() || null;
  let attempt = 0;
  for (;;) {
    const slug = explicit ?? (attempt === 0 ? slugify(input.nameAr) : `${slugify(input.nameAr)}-${randomToken(3)}`);
    const id = randomUUID();
    try {
      return await withRls({ orgId: id, userId }, async (tx) => {
        const org = await tx.organization.create({
          data: {
            id,
            slug,
            nameAr: input.nameAr,
            nameEn: input.nameEn ?? null,
            legalName: input.legalName ?? null,
            crNumber: input.crNumber ?? null,
            vatNumber: input.vatNumber ?? null,
            tin: input.tin ?? null,
            businessType: input.businessType ?? null,
            industry: input.industry ?? null,
            defaultLocale: 'ar',
            currency: 'SAR',
            createdById: userId,
          },
        });
        const ownerRole = await tx.role.findFirst({
          where: { organizationId: null, key: 'org.owner', isSystem: true },
        });
        if (!ownerRole) throw new Error('system role missing: org.owner (run db:seed)');
        await tx.membership.create({
          data: { userId, organizationId: id, roleId: ownerRole.id, status: 'active' },
        });
        return org;
      });
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'P2002') {
        if (explicit) throw new SlugTakenError();
        attempt += 1;
        if (attempt > 3) throw new SlugTakenError();
        continue;
      }
      throw e;
    }
  }
}

export async function setActiveOrg(sessionId: string, orgId: string | null) {
  return prisma.session.update({ where: { id: sessionId }, data: { activeOrgId: orgId } });
}
