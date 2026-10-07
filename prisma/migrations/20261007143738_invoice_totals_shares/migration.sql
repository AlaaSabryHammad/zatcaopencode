-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "contract_ref" TEXT,
ADD COLUMN     "discount_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "locked_at" TIMESTAMPTZ(6),
ADD COLUMN     "original_invoice_id" UUID,
ADD COLUMN     "other_charges" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "po_ref" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "rounding" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "salesperson_id" UUID,
ADD COLUMN     "supply_date" DATE,
ADD COLUMN     "taxable_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "terms" TEXT;

-- CreateTable
CREATE TABLE "share_link" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "viewed_at" TIMESTAMPTZ(6),
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_link_token_hash_key" ON "share_link"("token_hash");

-- CreateIndex
CREATE INDEX "share_link_organization_id_idx" ON "share_link"("organization_id");

-- CreateIndex
CREATE INDEX "share_link_invoice_id_idx" ON "share_link"("invoice_id");

-- AddForeignKey
ALTER TABLE "share_link" ADD CONSTRAINT "share_link_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_link" ADD CONSTRAINT "share_link_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
