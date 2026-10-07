import { z } from 'zod';

export const customerTypeSchema = z.enum(['company', 'individual']);

const vatOptional = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => !v || /^3\d{13}3$/.test(v), 'validation.vatInvalid');

const phoneOptional = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => !v || /^\+?\d{7,15}$/.test(v.replace(/[\s-]/g, '')), 'validation.phone');

export const customerSchema = z.object({
  type: customerTypeSchema.default('company'),
  nameAr: z.string().trim().min(2, 'validation.nameShort').max(160, 'validation.nameLong'),
  nameEn: z.string().trim().max(160).optional().nullable(),
  vatNumber: vatOptional,
  crNumber: z.string().trim().max(20).optional().nullable(),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email('validation.email')).optional().nullable(),
  phone: phoneOptional,
  city: z.string().trim().max(80).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  creditLimit: z.coerce.number().nonnegative().max(999999999999).optional().nullable(),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),
  notes: z.string().trim().max(1000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'validation.nameShort').max(120, 'validation.nameLong'),
  role: z.string().trim().max(80).optional().nullable(),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email('validation.email')).optional().nullable(),
  phone: phoneOptional,
});

/** CSV columns (headers case-insensitive): type,nameAr,nameEn,vatNumber,crNumber,email,phone,city,address,creditLimit,paymentTermsDays,tags(| separated) */
export const customerCsvSchema = z.object({
  type: z.string().optional().default('company'),
  namear: z.string().trim().min(2, 'validation.nameShort'),
  nameen: z.string().optional().default(''),
  vatnumber: z.string().optional().default(''),
  crnumber: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  city: z.string().optional().default(''),
  address: z.string().optional().default(''),
  creditlimit: z.string().optional().default(''),
  paymenttermsdays: z.string().optional().default('30'),
  tags: z.string().optional().default(''),
});
