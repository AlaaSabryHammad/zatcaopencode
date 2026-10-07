-- Public share-link reader for /s/[token] (no session).
--
-- share_link rows are invisible to anonymous visitors under RLS, so this SECURITY
-- DEFINER function (owned by the migration role) returns the full view-only
-- document as JSON for a valid, unexpired token hash. Side effects (intended,
-- this is the buyer's view tracking): stamps viewed_at once and promotes
-- sent/issued invoices to viewed.
-- Token hashes are 43-char base64url (256-bit); enumeration is infeasible.

CREATE OR REPLACE FUNCTION share_consume(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link_id uuid;
  v_inv_id uuid;
  v_status text;
  v_doc jsonb;
BEGIN
  SELECT s.id, s.invoice_id, i.status
    INTO v_link_id, v_inv_id, v_status
    FROM "share_link" s
    JOIN "invoice" i ON i.id = s.invoice_id
   WHERE s.token_hash = p_token_hash
     AND (s.expires_at IS NULL OR s.expires_at > now())
   LIMIT 1;

  IF v_link_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE "share_link" SET viewed_at = COALESCE(viewed_at, now()) WHERE id = v_link_id;

  IF v_status IN ('sent', 'issued') THEN
    UPDATE "invoice" SET status = 'viewed', updated_at = now() WHERE id = v_inv_id;
    v_status := 'viewed';
  END IF;

  SELECT jsonb_build_object(
    'id', i.id,
    'number', i.number,
    'type', i.type,
    'status', v_status,
    'issueDate', to_char(i.issue_date, 'YYYY-MM-DD'),
    'supplyDate', to_char(i.supply_date, 'YYYY-MM-DD'),
    'dueDate', to_char(i.due_date, 'YYYY-MM-DD'),
    'currency', i.currency,
    'poRef', i.po_ref,
    'contractRef', i.contract_ref,
    'notes', i.notes,
    'terms', i.terms,
    'subtotal', i.subtotal,
    'discountTotal', i.discount_total,
    'taxable', i.taxable_amount,
    'vatTotal', i.vat_total,
    'otherCharges', i.other_charges,
    'rounding', i.rounding,
    'grand', i.grand_total,
    'paid', i.amount_paid,
    'balance', i.balance_due,
    'seller', jsonb_build_object(
      'nameAr', o.name_ar, 'nameEn', o.name_en, 'legalName', o.legal_name,
      'crNumber', o.cr_number, 'vatNumber', o.vat_number,
      'brandColor', o.brand_color,
      'buildingNo', a.building_no, 'street', a.street, 'district', a.district,
      'city', a.city, 'postalCode', a.postal_code, 'additionalNo', a.additional_no,
      'country', a.country
    ),
    'customer', CASE WHEN c.id IS NULL THEN NULL ELSE jsonb_build_object(
      'nameAr', c.name_ar, 'nameEn', c.name_en,
      'vatNumber', c.vat_number, 'crNumber', c.cr_number,
      'email', c.email, 'phone', c.phone,
      'city', c.city, 'address', c.address
    ) END,
    'branch', CASE WHEN b.id IS NULL THEN NULL ELSE jsonb_build_object(
      'nameAr', b.name_ar, 'nameEn', b.name_en, 'city', b.city
    ) END,
    'lines', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'position', l.position,
        'description', l.description, 'descriptionAr', l.description_ar,
        'qty', l.qty, 'unit', l.unit, 'unitPrice', l.unit_price,
        'discountPct', l.discount_pct, 'vatRate', l.vat_rate,
        'net', l.net_amount, 'vat', l.vat_amount, 'total', l.line_total
      ) ORDER BY l.position)
      FROM "invoice_line" l WHERE l.invoice_id = i.id
    ), '[]'::jsonb)
  )
  INTO v_doc
  FROM "invoice" i
  JOIN "organization" o ON o.id = i.organization_id
  LEFT JOIN "organization_address" a ON a.organization_id = o.id
  LEFT JOIN "customer" c ON c.id = i.customer_id
  LEFT JOIN "branch" b ON b.id = i.branch_id
  WHERE i.id = v_inv_id;

  RETURN v_doc;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT EXECUTE ON FUNCTION share_consume(text) TO zatcaweb_app;
  END IF;
END $$;
