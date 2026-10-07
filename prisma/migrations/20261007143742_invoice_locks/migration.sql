-- RLS for ShareLink + immutability trigger for locked invoices.
--
-- Once an invoice is issued (locked_at NOT NULL), its financial columns and lines
-- cannot change: corrections go through credit/debit notes. The service layer
-- enforces the same rule; this trigger is the last line of defence.

ALTER TABLE "share_link" ENABLE ROW LEVEL SECURITY;
CREATE POLICY share_link_all ON "share_link" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

CREATE OR REPLACE FUNCTION invoice_locked_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  locked timestamptz;
BEGIN
  IF TG_TABLE_NAME = 'invoice' THEN
    IF OLD.locked_at IS NOT NULL AND (
      NEW.number IS DISTINCT FROM OLD.number OR
      NEW.type IS DISTINCT FROM OLD.type OR
      NEW.subtotal IS DISTINCT FROM OLD.subtotal OR
      NEW.discount_total IS DISTINCT FROM OLD.discount_total OR
      NEW.taxable_amount IS DISTINCT FROM OLD.taxable_amount OR
      NEW.vat_total IS DISTINCT FROM OLD.vat_total OR
      NEW.other_charges IS DISTINCT FROM OLD.other_charges OR
      NEW.rounding IS DISTINCT FROM OLD.rounding OR
      NEW.grand_total IS DISTINCT FROM OLD.grand_total OR
      NEW.issue_date IS DISTINCT FROM OLD.issue_date OR
      NEW.customer_id IS DISTINCT FROM OLD.customer_id OR
      NEW.branch_id IS DISTINCT FROM OLD.branch_id
    ) THEN
      RAISE EXCEPTION 'invoice % is locked: corrections require a credit/debit note', OLD.id
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  -- invoice_line: find the parent invoice lock state
  SELECT i.locked_at INTO locked FROM "invoice" i WHERE i.id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  IF locked IS NOT NULL THEN
    RAISE EXCEPTION 'invoice % is locked: corrections require a credit/debit note', COALESCE(NEW.invoice_id, OLD.invoice_id)
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER invoice_no_locked_update BEFORE UPDATE ON "invoice"
  FOR EACH ROW EXECUTE FUNCTION invoice_locked_guard();
CREATE TRIGGER invoice_line_no_locked_change BEFORE UPDATE OR DELETE ON "invoice_line"
  FOR EACH ROW EXECUTE FUNCTION invoice_locked_guard();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "share_link" TO zatcaweb_app;
  END IF;
END $$;
