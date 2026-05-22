-- ============================================================
-- Realtime — broadcast changes so the public dashboard reacts live.
-- Run AFTER 03_seed.sql
--
-- The `supabase_realtime` publication is shared across the whole project,
-- but a publication can include tables from many schemas without conflict.
-- ============================================================

-- Ensure the publication exists (it does by default in every Supabase project).
do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Add our tables to it. `if not exists` would be ideal but isn't available for
-- ALTER PUBLICATION; if the table is already in the publication, Postgres throws
-- a 42710 error which we catch and ignore.
do $$
begin
  begin alter publication supabase_realtime add table petra_grants.grants;     exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table petra_grants.categories; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table petra_grants.faculties;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table petra_grants.programs;   exception when duplicate_object then null; end;
end $$;

-- REPLICA IDENTITY FULL makes DELETE events include the full old row
-- (otherwise only the primary key is broadcast). Useful for client-side
-- reconciliation when an admin deletes a grant.
alter table petra_grants.grants     replica identity full;
alter table petra_grants.categories replica identity full;
