-- NULL-safe surrogate key for sequences (see D-015). Backfills existing rows, then enforces NOT NULL + UNIQUE.
ALTER TABLE "invoice_sequence" ADD COLUMN "key" TEXT;
UPDATE "invoice_sequence"
   SET "key" = organization_id::text || ':' || COALESCE(branch_id::text, '-') || ':' || document_type || ':' || year::text
 WHERE "key" IS NULL;
ALTER TABLE "invoice_sequence" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "invoice_sequence_key_key" ON "invoice_sequence"("key");
