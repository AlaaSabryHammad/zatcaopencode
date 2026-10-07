-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "invoice_template" TEXT NOT NULL DEFAULT 'Modern',
ADD COLUMN     "onboarding_completed_at" TIMESTAMPTZ(6),
ADD COLUMN     "onboarding_step" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vat_status" TEXT NOT NULL DEFAULT 'reg';

-- CreateTable
CREATE TABLE "branch" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "city" TEXT,
    "district" TEXT,
    "street" TEXT,
    "building_no" TEXT,
    "postal_code" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_head_office" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_sequence" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "branch_id" UUID,
    "document_type" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "next_value" INTEGER NOT NULL DEFAULT 1,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoice_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branch_organization_id_idx" ON "branch"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_organization_id_code_key" ON "branch"("organization_id", "code");

-- CreateIndex
CREATE INDEX "invoice_sequence_organization_id_idx" ON "invoice_sequence"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_sequence_organization_id_branch_id_document_type_ye_key" ON "invoice_sequence"("organization_id", "branch_id", "document_type", "year");

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_sequence" ADD CONSTRAINT "invoice_sequence_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_sequence" ADD CONSTRAINT "invoice_sequence_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
