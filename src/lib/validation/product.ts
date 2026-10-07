import { z } from 'zod';

export const productTypeSchema = z.enum(['product', 'service', 'bundle', 'variant']);
export const vatCategorySchema = z.enum(['STANDARD', 'ZERO', 'EXEMPT', 'OUT_OF_SCOPE']);

export const productSchema = z.object({
  type: productTypeSchema.default('product'),
  sku: z.string().trim().min(1, 'validation.required').max(60),
  barcode: z.string().trim().max(60).optional().nullable(),
  nameAr: z.string().trim().min(2, 'validation.nameShort').max(160, 'validation.nameLong'),
  nameEn: z.string().trim().max(160).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  categoryId: z.string().uuid('validation.invalid').optional().nullable(),
  unit: z.string().trim().min(1).max(20).default('pcs'),
  purchasePrice: z.coerce.number().nonnegative().max(999999999999).optional().nullable(),
  sellingPrice: z.coerce.number().nonnegative().max(999999999999),
  vatCategory: vatCategorySchema.default('STANDARD'),
  vatRate: z.coerce.number().min(0).max(100).default(15),
  trackStock: z.boolean().default(true),
  minStock: z.coerce.number().nonnegative().max(999999999).default(0),
  isActive: z.boolean().default(true),
});

/** CSV columns: type,sku,barcode,nameAr,nameEn,description,category,unit,purchasePrice,sellingPrice,vatCategory,vatRate,minStock */
export const productCsvSchema = z.object({
  type: z.string().optional().default('product'),
  sku: z.string().trim().min(1, 'validation.required'),
  barcode: z.string().optional().default(''),
  namear: z.string().trim().min(2, 'validation.nameShort'),
  nameen: z.string().optional().default(''),
  description: z.string().optional().default(''),
  category: z.string().optional().default(''),
  unit: z.string().optional().default('pcs'),
  purchaseprice: z.string().optional().default(''),
  sellingprice: z.string().trim().min(1, 'validation.required'),
  vatcategory: z.string().optional().default('STANDARD'),
  vatrate: z.string().optional().default('15'),
  minstock: z.string().optional().default('0'),
});
