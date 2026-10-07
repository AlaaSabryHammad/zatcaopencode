import { z } from 'zod';

export const invoiceTypeSchema = z.enum(['TAX', 'SIMPLIFIED', 'CREDIT_NOTE', 'DEBIT_NOTE']);

export const invoiceLineSchema = z.object({
  productId: z.string().uuid('validation.invalid').optional().nullable(),
  description: z.string().trim().min(1, 'validation.required').max(300),
  descriptionAr: z.string().trim().max(300).optional().nullable(),
  qty: z.coerce.number().positive('validation.invalid').max(999999999),
  unit: z.string().trim().min(1).max(20).default('pcs'),
  unitPrice: z.coerce.number().min(0).max(999999999999),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  vatRate: z.coerce.number().min(0).max(100).default(15),
});

export const invoiceHeaderSchema = z.object({
  type: invoiceTypeSchema.default('TAX'),
  customerId: z.string().uuid('validation.invalid').optional().nullable(),
  branchId: z.string().uuid('validation.invalid').optional().nullable(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalid'),
  supplyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalid').optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalid').optional().nullable(),
  currency: z.string().trim().length(3, 'validation.invalid').default('SAR'),
  poRef: z.string().trim().max(60).optional().nullable(),
  contractRef: z.string().trim().max(60).optional().nullable(),
  salespersonId: z.string().uuid('validation.invalid').optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  terms: z.string().trim().max(2000).optional().nullable(),
  bulkDiscountPct: z.coerce.number().min(0).max(100).default(0),
  otherCharges: z.coerce.number().min(0).max(999999999999).default(0),
  originalInvoiceId: z.string().uuid('validation.invalid').optional().nullable(),
  reason: z.string().trim().max(300).optional().nullable(),
  lines: z.array(invoiceLineSchema).min(1, 'validation.required').max(100),
});

export const draftSchema = invoiceHeaderSchema;
export type DraftInput = z.input<typeof draftSchema>;
