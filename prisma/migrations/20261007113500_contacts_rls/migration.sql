-- RLS for CustomerContact (same pattern as sales_rls).

ALTER TABLE "customer_contact" ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_contact_all ON "customer_contact" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "customer_contact" TO zatcaweb_app;
  END IF;
END $$;
