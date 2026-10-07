-- Public invitation preview for the anonymous accept page (/invite?token=…).
--
-- The runtime role cannot read `invitation` rows without RLS context, so this
-- SECURITY DEFINER function (owned by the migration role) exposes only the
-- non-sensitive fields of a *pending, unexpired* invitation looked up by token hash.
-- Token hashes are 43-char base64url (256-bit); enumeration is infeasible.

CREATE OR REPLACE FUNCTION invitation_preview(p_token_hash text)
RETURNS TABLE (
  email text,
  organization_id uuid,
  organization_name_ar text,
  organization_name_en text,
  role_name_ar text,
  role_name_en text,
  expires_at timestamptz(6)
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.email,
         i.organization_id,
         o.name_ar,
         o.name_en,
         r.name_ar,
         r.name_en,
         i.expires_at
    FROM "invitation" i
    JOIN "organization" o ON o.id = i.organization_id
    JOIN "role" r ON r.id = i.role_id
   WHERE i.token_hash = p_token_hash
     AND i.status = 'pending'
     AND i.expires_at > now()
   LIMIT 1
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT EXECUTE ON FUNCTION invitation_preview(text) TO zatcaweb_app;
  END IF;
END $$;
