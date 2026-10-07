-- RLS for Branch and InvoiceSequence (same pattern as 20261007083144_rls_policies).

ALTER TABLE "branch" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_all ON "branch" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "invoice_sequence" ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoice_sequence_all ON "invoice_sequence" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

-- Runtime role grants for the new tables (mirrors the earlier grants block).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "branch" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "invoice_sequence" TO zatcaweb_app;
  END IF;
END $$;
