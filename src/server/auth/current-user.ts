import 'server-only';
import { getSessionToken } from '@/server/cookies/session';
import { getSessionByToken } from '@/server/services/session.service';
import { prisma, withRls } from '@/server/db';

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const ctx = await getSessionByToken(token);
  if (!ctx) return null;
  const user = await prisma.user.findUnique({
    where: { id: ctx.session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      locale: true,
      theme: true,
      emailVerifiedAt: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
    },
  });
  if (!user) return null;
  return { ...user, sessionId: ctx.session.id, mfaPending: ctx.isMfaPending };
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

const membershipInclude = {
  organization: { select: { id: true, nameAr: true, nameEn: true, slug: true, logoKey: true } },
  role: { select: { id: true, key: true, nameAr: true, nameEn: true, isSystem: true } },
} as const;

export async function getCurrentMemberships() {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return [];
  // The `user_id = app_user_id()` RLS branch lets a user list their own memberships.
  return withRls({ userId: user.id, userEmail: user.email }, (tx) =>
    tx.membership.findMany({
      where: { userId: user.id, status: 'active' },
      include: membershipInclude,
      orderBy: { createdAt: 'asc' },
    }),
  );
}

export async function getActiveOrgId() {
  const token = await getSessionToken();
  if (!token) return null;
  const ctx = await getSessionByToken(token);
  if (!ctx) return null;
  return ctx.session.activeOrgId;
}

export async function requireOrgContext() {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) throw new Error('unauthorized');
  const memberships = await withRls({ userId: user.id, userEmail: user.email }, (tx) =>
    tx.membership.findMany({
      where: { userId: user.id, status: 'active' },
      include: membershipInclude,
      orderBy: { createdAt: 'asc' },
    }),
  );
  const token = await getSessionToken();
  const sess = token ? await getSessionByToken(token) : null;
  const activeId = sess?.session.activeOrgId;
  const activeMembership = memberships.find((m) => m.organizationId === activeId) ?? memberships[0] ?? null;
  return { user, memberships, activeMembership };
}

export type OrgContext = Awaited<ReturnType<typeof requireOrgContext>>;
