-- ============================================================
-- Realtime — broadcast changes for the public dashboard to react to
-- Run AFTER 03_seed.sql
-- ============================================================

-- Ensure the supabase_realtime publication exists (it does by default
-- in every Supabase project) and add our tables to it.
do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.grants;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.faculties;
alter publication supabase_realtime add table public.programs;

-- Optional: turn on REPLICA IDENTITY FULL so DELETE events
-- include the full row (useful for client-side reconciliation).
alter table public.grants     replica identity full;
alter table public.categories replica identity full;
