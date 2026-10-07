-- RLS for Phase 4 sales/catalog/expense tables (same pattern as onboarding_rls).

ALTER TABLE "customer" ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_all ON "customer" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "category" ENABLE ROW LEVEL SECURITY;
CREATE POLICY category_all ON "category" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "product" ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_all ON "product" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "stock_level" ENABLE ROW LEVEL SECURITY;
CREATE POLICY stock_level_all ON "stock_level" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "invoice" ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoice_all ON "invoice" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "invoice_line" ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoice_line_all ON "invoice_line" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "payment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_all ON "payment" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "expense_category" ENABLE ROW LEVEL SECURITY;
CREATE POLICY expense_category_all ON "expense_category" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

ALTER TABLE "expense" ENABLE ROW LEVEL SECURITY;
CREATE POLICY expense_all ON "expense" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "customer" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "category" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "product" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "stock_level" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "invoice" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "invoice_line" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "payment" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "expense_category" TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "expense" TO zatcaweb_app;
  END IF;
END $$;
