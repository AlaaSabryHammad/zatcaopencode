-- Row-Level Security for tenant tables (defence in depth; the service layer also scopes every query).
--
-- Request context is set per transaction by src/server/db.ts (withRls / withTenant) using
-- set_config(..., true) (≡ SET LOCAL):
--   app.org_id      current organization (from the authenticated session, never from input)
--   app.user_id     authenticated user
--   app.user_email  authenticated user's email (lower-case) — only used to read own invitations
--
-- Tables are owned by the migration role; RLS is ENABLED (not FORCED) so migrations/seed (owner) bypass it,
-- while the runtime role `zatcaweb_app` (NOSUPERUSER, NOBYPASSRLS, not owner) is always subject to it.

-- ── context helpers ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION app_org_id() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT nullif(current_setting('app.org_id', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION app_user_id() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT nullif(current_setting('app.user_id', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION app_user_email() RETURNS text
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT nullif(lower(current_setting('app.user_email', true)), '') $$;

-- ── integrity checks ───────────────────────────────────────────────────
ALTER TABLE "user" ADD CONSTRAINT user_email_lowercase CHECK (email = lower(email));
ALTER TABLE "invitation" ADD CONSTRAINT invitation_email_lowercase CHECK (email = lower(email));
ALTER TABLE "organization" ADD CONSTRAINT organization_vat_format CHECK (vat_number IS NULL OR vat_number ~ '^3[0-9]{13}3$');
ALTER TABLE "organization" ADD CONSTRAINT organization_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$');
ALTER TABLE "organization_address" ADD CONSTRAINT address_postal_code CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{5}$');
ALTER TABLE "organization_address" ADD CONSTRAINT address_building_no CHECK (building_no IS NULL OR building_no ~ '^[0-9]{4}$');
ALTER TABLE "organization_address" ADD CONSTRAINT address_additional_no CHECK (additional_no IS NULL OR additional_no ~ '^[0-9]{4}$');

-- ── organization ───────────────────────────────────────────────────────
ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_select ON "organization" FOR SELECT
  USING (
    id = app_org_id()
    OR EXISTS (
      SELECT 1 FROM "membership" m
      WHERE m.organization_id = "organization".id AND m.user_id = app_user_id() AND m.status = 'active'
    )
  );
CREATE POLICY organization_insert ON "organization" FOR INSERT WITH CHECK (id = app_org_id());
CREATE POLICY organization_update ON "organization" FOR UPDATE USING (id = app_org_id()) WITH CHECK (id = app_org_id());
-- no DELETE policy: organizations are soft-deleted.

ALTER TABLE "organization_address" ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_address_all ON "organization_address" FOR ALL
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());

-- ── membership ─────────────────────────────────────────────────────────
ALTER TABLE "membership" ENABLE ROW LEVEL SECURITY;
-- A user may list their own memberships across organizations (organization switcher).
CREATE POLICY membership_select ON "membership" FOR SELECT
  USING (organization_id = app_org_id() OR user_id = app_user_id());
CREATE POLICY membership_insert ON "membership" FOR INSERT WITH CHECK (organization_id = app_org_id());
CREATE POLICY membership_update ON "membership" FOR UPDATE
  USING (organization_id = app_org_id()) WITH CHECK (organization_id = app_org_id());
CREATE POLICY membership_delete ON "membership" FOR DELETE USING (organization_id = app_org_id());

-- ── roles & permissions ────────────────────────────────────────────────
ALTER TABLE "role" ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_select ON "role" FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id = app_org_id()
    OR EXISTS (SELECT 1 FROM "membership" m WHERE m.role_id = "role".id AND m.user_id = app_user_id())
  );
CREATE POLICY role_insert ON "role" FOR INSERT WITH CHECK (organization_id = app_org_id() AND NOT is_system);
CREATE POLICY role_update ON "role" FOR UPDATE
  USING (organization_id = app_org_id() AND NOT is_system) WITH CHECK (organization_id = app_org_id() AND NOT is_system);
CREATE POLICY role_delete ON "role" FOR DELETE USING (organization_id = app_org_id() AND NOT is_system);

ALTER TABLE "role_permission" ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_permission_select ON "role_permission" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "role" r WHERE r.id = role_id)); -- inherits role visibility
CREATE POLICY role_permission_write ON "role_permission" FOR ALL
  USING (EXISTS (SELECT 1 FROM "role" r WHERE r.id = role_id AND r.organization_id = app_org_id() AND NOT r.is_system))
  WITH CHECK (EXISTS (SELECT 1 FROM "role" r WHERE r.id = role_id AND r.organization_id = app_org_id() AND NOT r.is_system));

-- ── invitations ────────────────────────────────────────────────────────
ALTER TABLE "invitation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_select ON "invitation" FOR SELECT
  USING (organization_id = app_org_id() OR email = app_user_email());
CREATE POLICY invitation_insert ON "invitation" FOR INSERT WITH CHECK (organization_id = app_org_id());
CREATE POLICY invitation_update ON "invitation" FOR UPDATE
  USING (organization_id = app_org_id() OR email = app_user_email())
  WITH CHECK (organization_id = app_org_id() OR email = app_user_email());
CREATE POLICY invitation_delete ON "invitation" FOR DELETE USING (organization_id = app_org_id());

-- ── audit log (append-only) ────────────────────────────────────────────
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_select ON "audit_log" FOR SELECT USING (organization_id = app_org_id());
CREATE POLICY audit_log_insert ON "audit_log" FOR INSERT WITH CHECK (organization_id = app_org_id());

CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only (% blocked)', TG_OP USING ERRCODE = 'insufficient_privilege';
END $$;
CREATE TRIGGER audit_log_no_update BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON "audit_log"
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_immutable();

-- ── grants for the runtime role ────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zatcaweb_app') THEN
    GRANT USAGE ON SCHEMA public TO zatcaweb_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO zatcaweb_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO zatcaweb_app;
    GRANT EXECUTE ON FUNCTION app_org_id(), app_user_id(), app_user_email() TO zatcaweb_app;
    REVOKE UPDATE, DELETE, TRUNCATE ON "audit_log" FROM zatcaweb_app;
    IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
      REVOKE ALL ON "_prisma_migrations" FROM zatcaweb_app;
    END IF;
    -- Tables created by later migrations (same owner) get DML for the app role automatically.
    EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zatcaweb_app', current_user);
    EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO zatcaweb_app', current_user);
  END IF;
END $$;
