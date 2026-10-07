'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/server/auth/current-user';
import { createOrganization, setActiveOrg } from '@/server/services/org.service';
import { prisma, withRls } from '@/server/db';
import { saudiMobileSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/action-result';
import { invalid } from '@/lib/action-result';
import { generateOtp, verifyOtp, otpRateLimitKey } from '@/server/services/otp.service';
import { getRateLimitStore } from '@/server/rate-limit';
import { createVerificationToken, VERIFY_EMAIL_TTL_H } from '@/server/services/auth.service';
import { sendVerificationEmail, sendOtpEmail } from '@/server/mail';
import type { OtpPurpose } from '@prisma/client';

async function activeOrgId(userId: string, sessionId: string): Promise<string | null> {
  const sess = await prisma.session.findUnique({ where: { id: sessionId }, select: { activeOrgId: true } });
  return sess?.activeOrgId ?? null;
}

function markStep(orgId: string, userId: string, userEmail: string, step: number) {
  return withRls({ orgId, userId, userEmail }, async (tx) => {
    const o = await tx.organization.findUnique({ where: { id: orgId }, select: { onboardingStep: true } });
    await tx.organization.update({
      where: { id: orgId },
      data: { onboardingStep: Math.max(o?.onboardingStep ?? 0, step) },
    });
  });
}

// ── Step 1 · account ───────────────────────────────────────────────

const accountSchema = z.object({
  name: z.string().trim().min(2, 'validation.nameShort').max(120, 'validation.nameLong'),
});

export async function saveAccount(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  return { ok: true };
}

export async function resendVerificationEmail(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  if (user.emailVerifiedAt) return { ok: true };
  try {
    const token = await createVerificationToken(user.id, 'VERIFY_EMAIL', VERIFY_EMAIL_TTL_H);
    await sendVerificationEmail({ to: user.email, name: user.name, token, locale: user.locale });
  } catch (e) {
    console.error('resendVerificationEmail failed:', e);
  }
  return { ok: true };
}

export async function requestPhoneOtp(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const parsed = z.object({ phone: saudiMobileSchema }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return requestOtpFor(user.id, user.name, user.email, parsed.data.phone, 'VERIFY_PHONE');
}

async function requestOtpFor(
  userId: string,
  name: string,
  email: string,
  phone: string,
  purpose: OtpPurpose,
): Promise<ActionResult> {
  const rl = getRateLimitStore();
  const r = await rl.increment(otpRateLimitKey(phone, purpose), 5, 10 * 60_000);
  if (!r.allowed)
    return { ok: false, error: 'auth.errors.tooManyAttempts', retryAfter: Math.ceil((r.resetMs - Date.now()) / 1000) };
  const res = await generateOtp({ userId, phone, purpose });
  try {
    await sendOtpEmail({ to: email, name, code: res.code, expiresInMinutes: 5 });
  } catch (e) {
    console.error('sendOtpEmail failed:', e);
  }
  return { ok: true };
}

export async function verifyPhoneOtp(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const parsed = z.object({ phone: saudiMobileSchema, code: z.string().regex(/^\d{6}$/, 'validation.otp') }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = await verifyOtp({ phone: parsed.data.phone, purpose: 'VERIFY_PHONE', code: parsed.data.code });
  if (!v.ok) {
    const err =
      v.reason === 'max_attempts'
        ? 'auth.errors.otpMaxAttempts'
        : v.reason === 'expired'
          ? 'auth.errors.otpExpired'
          : 'auth.errors.otpInvalid';
    return { ok: false, error: err };
  }
  if (v.userId && v.userId !== user.id) return { ok: false, error: 'auth.errors.unauthorized' };
  await prisma.user.update({
    where: { id: user.id },
    data: { phone: parsed.data.phone, phoneVerifiedAt: new Date() },
  });
  return { ok: true };
}

// ── Step 2 · business (creates the org on first save) ──────────────

const businessSchema = z.object({
  nameAr: z.string().trim().min(2, 'validation.required'),
  nameEn: z.string().trim().max(160).optional().nullable(),
  legalName: z.string().trim().min(2, 'validation.required'),
  crNumber: z.string().trim().regex(/^\d{10}$/, 'validation.invalid'),
  vatNumber: z.string().trim().regex(/^3\d{13}3$/, 'validation.vatInvalid'),
  tin: z.string().trim().max(20).optional().nullable(),
  businessType: z.string().trim().max(40).optional().nullable(),
  industry: z.string().trim().max(40).optional().nullable(),
  employeesRange: z.string().trim().max(20).optional().nullable(),
  invoiceVolume: z.string().trim().max(20).optional().nullable(),
});

export async function saveBusiness(input: unknown): Promise<ActionResult<{ orgId: string }>> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;

  const orgId = await activeOrgId(user.id, user.sessionId);
  if (orgId) {
    await withRls({ orgId, userId: user.id, userEmail: user.email }, (tx) =>
      tx.organization.update({
        where: { id: orgId },
        data: {
          nameAr: d.nameAr,
          nameEn: d.nameEn || null,
          legalName: d.legalName,
          crNumber: d.crNumber,
          vatNumber: d.vatNumber,
          tin: d.tin || null,
          businessType: d.businessType || null,
          industry: d.industry || null,
          employeesRange: d.employeesRange || null,
          invoiceVolume: d.invoiceVolume || null,
        },
      }),
    );
    await markStep(orgId, user.id, user.email, 2);
    return { ok: true, data: { orgId } };
  }

  const org = await createOrganization(user.id, {
    nameAr: d.nameAr,
    nameEn: d.nameEn,
    legalName: d.legalName,
    crNumber: d.crNumber,
    vatNumber: d.vatNumber,
    tin: d.tin,
    businessType: d.businessType,
    industry: d.industry,
  });
  await prisma.organization.update({
    where: { id: org.id },
    data: { employeesRange: d.employeesRange || null, invoiceVolume: d.invoiceVolume || null, onboardingStep: 2 },
  });
  await setActiveOrg(user.sessionId, org.id);
  return { ok: true, data: { orgId: org.id } };
}

// ── Step 3 · National Address ───────────────────────────────────────

const addressSchema = z.object({
  country: z.string().trim().default('SA'),
  city: z.string().trim().min(2, 'validation.required').max(80),
  district: z.string().trim().max(80).optional().nullable(),
  street: z.string().trim().max(120).optional().nullable(),
  buildingNo: z.string().trim().regex(/^\d{4}$/, 'validation.invalid').optional().nullable(),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'validation.invalid').optional().nullable(),
  additionalNo: z.string().trim().regex(/^\d{4}$/, 'validation.invalid').optional().nullable(),
  shortAddress: z.string().trim().max(20).optional().nullable(),
});

export async function saveAddress(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const orgId = await activeOrgId(user.id, user.sessionId);
  if (!orgId) return { ok: false, error: 'onboarding.errors.noOrg' };
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  await withRls({ orgId, userId: user.id, userEmail: user.email }, (tx) =>
    tx.organizationAddress.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        country: d.country || 'SA',
        city: d.city,
        district: d.district || null,
        street: d.street || null,
        buildingNo: d.buildingNo || null,
        postalCode: d.postalCode || null,
        additionalNo: d.additionalNo || null,
        shortAddress: d.shortAddress || null,
      },
      update: {
        country: d.country || 'SA',
        city: d.city,
        district: d.district || null,
        street: d.street || null,
        buildingNo: d.buildingNo || null,
        postalCode: d.postalCode || null,
        additionalNo: d.additionalNo || null,
        shortAddress: d.shortAddress || null,
      },
    }),
  );
  await markStep(orgId, user.id, user.email, 3);
  return { ok: true };
}

// ── Step 4 · branding ───────────────────────────────────────────────

const brandingSchema = z.object({
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'validation.invalid')
    .optional()
    .nullable(),
  invoiceTemplate: z.enum(['Modern', 'Classic', 'Minimal', 'Corporate']).optional().nullable(),
});

export async function saveBranding(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const orgId = await activeOrgId(user.id, user.sessionId);
  if (!orgId) return { ok: false, error: 'onboarding.errors.noOrg' };
  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await withRls({ orgId, userId: user.id, userEmail: user.email }, (tx) =>
    tx.organization.update({
      where: { id: orgId },
      data: {
        brandColor: parsed.data.brandColor || null,
        invoiceTemplate: parsed.data.invoiceTemplate || 'Modern',
      },
    }),
  );
  await markStep(orgId, user.id, user.email, 4);
  return { ok: true };
}

// ── Step 5 · tax & numbering ────────────────────────────────────────

const taxSchema = z.object({
  vatStatus: z.enum(['reg', 'group', 'none']).default('reg'),
  currency: z.string().trim().length(3, 'validation.invalid').default('SAR'),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12).default(1),
  invoicePrefix: z.string().trim().min(1).max(40).default('INV-{YYYY}-{#####}'),
  startNumber: z.coerce.number().int().min(1).max(999999).default(1),
});

export async function saveTax(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const orgId = await activeOrgId(user.id, user.sessionId);
  if (!orgId) return { ok: false, error: 'onboarding.errors.noOrg' };
  const parsed = taxSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const year = new Date().getFullYear();
  await withRls({ orgId, userId: user.id, userEmail: user.email }, async (tx) => {
    await tx.organization.update({
      where: { id: orgId },
      data: {
        vatStatus: d.vatStatus,
        currency: d.currency.toUpperCase(),
        fiscalYearStartMonth: d.fiscalYearStartMonth,
      },
    });
    for (const doc of ['TAX', 'SIMPLIFIED']) {
      const seq = await tx.invoiceSequence.findFirst({
        where: { organizationId: orgId, branchId: null, documentType: doc, year },
        select: { id: true },
      });
      if (seq) {
        await tx.invoiceSequence.update({ where: { id: seq.id }, data: { prefix: d.invoicePrefix, nextValue: d.startNumber } });
      } else {
        await tx.invoiceSequence.create({
          data: { organizationId: orgId, branchId: null, documentType: doc, prefix: d.invoicePrefix, nextValue: d.startNumber, year },
        });
      }
    }
    const o = await tx.organization.findUnique({ where: { id: orgId }, select: { onboardingStep: true } });
    await tx.organization.update({ where: { id: orgId }, data: { onboardingStep: Math.max(o?.onboardingStep ?? 0, 5) } });
  });
  return { ok: true };
}

// ── Step 6 · finalize workspace ─────────────────────────────────────

export async function finalizeWorkspace(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.mfaPending) return { ok: false, error: 'auth.errors.unauthorized' };
  const orgId = await activeOrgId(user.id, user.sessionId);
  if (!orgId) return { ok: false, error: 'onboarding.errors.noOrg' };
  const year = new Date().getFullYear();
  await withRls({ orgId, userId: user.id, userEmail: user.email }, async (tx) => {
    let head = await tx.branch.findFirst({ where: { organizationId: orgId, isHeadOffice: true } });
    if (!head) {
      const addr = await tx.organizationAddress.findUnique({ where: { organizationId: orgId } });
      head = await tx.branch.create({
        data: {
          organizationId: orgId,
          code: 'HO',
          nameAr: 'المقر الرئيسي',
          nameEn: 'Head Office',
          city: addr?.city ?? null,
          district: addr?.district ?? null,
          street: addr?.street ?? null,
          buildingNo: addr?.buildingNo ?? null,
          postalCode: addr?.postalCode ?? null,
        },
      });
    }
    for (const doc of ['TAX', 'SIMPLIFIED']) {
      const seq = await tx.invoiceSequence.findFirst({
        where: { organizationId: orgId, branchId: null, documentType: doc, year },
        select: { id: true },
      });
      if (!seq) {
        await tx.invoiceSequence.create({
          data: { organizationId: orgId, branchId: null, documentType: doc, prefix: 'INV-{YYYY}-{#####}', nextValue: 1, year },
        });
      }
    }
    await tx.organization.update({
      where: { id: orgId },
      data: { onboardingStep: 6, onboardingCompletedAt: new Date() },
    });
  });
  return { ok: true };
}
