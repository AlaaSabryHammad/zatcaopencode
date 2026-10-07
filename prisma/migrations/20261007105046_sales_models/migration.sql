-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('company', 'individual');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('product', 'service', 'bundle', 'variant');

-- CreateEnum
CREATE TYPE "VatCategory" AS ENUM ('STANDARD', 'ZERO', 'EXEMPT', 'OUT_OF_SCOPE');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('TAX', 'SIMPLIFIED', 'CREDIT_NOTE', 'DEBIT_NOTE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'issued', 'viewed', 'sent', 'partially_paid', 'paid', 'pending', 'cancelled', 'credited');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'bank', 'mada', 'card', 'apple_pay', 'cheque', 'transfer');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paid');

-- CreateTable
CREATE TABLE "customer" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'company',
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "vat_number" TEXT,
    "cr_number" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "address" TEXT,
    "credit_limit" DECIMAL(18,2),
    "payment_terms_days" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'product',
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "description" TEXT,
    "category_id" UUID,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "purchase_price" DECIMAL(18,2),
    "selling_price" DECIMAL(18,2) NOT NULL,
    "vat_category" "VatCategory" NOT NULL DEFAULT 'STANDARD',
    "vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    "track_stock" BOOLEAN NOT NULL DEFAULT true,
    "min_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_level" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "branch_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "stock_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "number" TEXT,
    "type" "InvoiceType" NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "customer_id" UUID,
    "branch_id" UUID,
    "issue_date" DATE NOT NULL,
    "due_date" DATE,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "vat_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amount_paid" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "issued_at" TIMESTAMPTZ(6),
    "issued_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "product_id" UUID,
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "qty" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "unit_price" DECIMAL(18,2) NOT NULL,
    "discount_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    "net_amount" DECIMAL(18,2) NOT NULL,
    "vat_amount" DECIMAL(18,2) NOT NULL,
    "line_total" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "invoice_id" UUID,
    "customer_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "date" DATE NOT NULL,
    "reference" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_category" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "category_id" UUID,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount_incl_vat" DECIMAL(18,2) NOT NULL,
    "vat_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "recoverable" BOOLEAN NOT NULL DEFAULT true,
    "branch_id" UUID,
    "reference" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_organization_id_idx" ON "customer"("organization_id");

-- CreateIndex
CREATE INDEX "customer_organization_id_name_ar_idx" ON "customer"("organization_id", "name_ar");

-- CreateIndex
CREATE INDEX "category_organization_id_idx" ON "category"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_organization_id_key_key" ON "category"("organization_id", "key");

-- CreateIndex
CREATE INDEX "product_organization_id_idx" ON "product"("organization_id");

-- CreateIndex
CREATE INDEX "product_organization_id_is_active_idx" ON "product"("organization_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_organization_id_sku_key" ON "product"("organization_id", "sku");

-- CreateIndex
CREATE INDEX "stock_level_organization_id_idx" ON "stock_level"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_level_organization_id_product_id_branch_id_key" ON "stock_level"("organization_id", "product_id", "branch_id");

-- CreateIndex
CREATE INDEX "invoice_organization_id_status_idx" ON "invoice"("organization_id", "status");

-- CreateIndex
CREATE INDEX "invoice_organization_id_issue_date_idx" ON "invoice"("organization_id", "issue_date");

-- CreateIndex
CREATE INDEX "invoice_organization_id_customer_id_idx" ON "invoice"("organization_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_organization_id_number_key" ON "invoice"("organization_id", "number");

-- CreateIndex
CREATE INDEX "invoice_line_invoice_id_position_idx" ON "invoice_line"("invoice_id", "position");

-- CreateIndex
CREATE INDEX "payment_organization_id_date_idx" ON "payment"("organization_id", "date");

-- CreateIndex
CREATE INDEX "payment_organization_id_invoice_id_idx" ON "payment"("organization_id", "invoice_id");

-- CreateIndex
CREATE INDEX "expense_category_organization_id_idx" ON "expense_category"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_category_organization_id_key_key" ON "expense_category"("organization_id", "key");

-- CreateIndex
CREATE INDEX "expense_organization_id_date_idx" ON "expense"("organization_id", "date");

-- CreateIndex
CREATE INDEX "expense_organization_id_status_idx" ON "expense"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_level" ADD CONSTRAINT "stock_level_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_level" ADD CONSTRAINT "stock_level_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_category" ADD CONSTRAINT "expense_category_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
