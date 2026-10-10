-- Roles for the accounts database. Locally a superuser runs this; on Neon
-- `accounts-db provision` creates the same roles through the migrator.
--
-- accounts_migrator  owns the schema and runs migrations only.
-- accounts_api       the API at runtime: no superuser, no BYPASSRLS, owns nothing.
-- accounts_publisher sweeps and marks the outbox across workspaces; nothing else.

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'accounts_migrator') THEN
        CREATE ROLE accounts_migrator LOGIN NOSUPERUSER NOCREATEROLE NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'accounts_api') THEN
        CREATE ROLE accounts_api LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'accounts_publisher') THEN
        CREATE ROLE accounts_publisher LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT;
    END IF;
END
$$;
