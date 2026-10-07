-- Runs once when the Postgres volume is first created.
-- The app connects as a NON-owner, NON-superuser role so Row-Level Security cannot be bypassed.
-- Migrations run as the owner role (DATABASE_MIGRATION_URL); the app uses DATABASE_URL.

CREATE ROLE zatcaweb_app LOGIN PASSWORD 'zatcaweb_app' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
GRANT CONNECT ON DATABASE zatcaweb TO zatcaweb_app;
GRANT USAGE ON SCHEMA public TO zatcaweb_app;

-- Tables created later by the owner automatically grant DML to the app role.
ALTER DEFAULT PRIVILEGES FOR ROLE zatcaweb_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zatcaweb_app;
ALTER DEFAULT PRIVILEGES FOR ROLE zatcaweb_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO zatcaweb_app;

-- Shadow database for `prisma migrate dev`.
CREATE DATABASE zatcaweb_shadow OWNER zatcaweb_owner;
CREATE DATABASE zatcaweb_test OWNER zatcaweb_owner;
