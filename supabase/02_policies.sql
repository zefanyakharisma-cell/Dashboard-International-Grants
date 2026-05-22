-- ============================================================
-- Row Level Security (RLS) policies for the petra_grants schema.
-- Run AFTER 01_schema.sql
-- ============================================================

alter table petra_grants.faculties     enable row level security;
alter table petra_grants.programs      enable row level security;
alter table petra_grants.categories    enable row level security;
alter table petra_grants.profiles      enable row level security;
alter table petra_grants.grants        enable row level security;
alter table petra_grants.activity_log  enable row level security;
alter table petra_grants.bookmarks     enable row level security;

-- ------------------------------------------------------------
-- faculties: world-readable; admins manage
-- ------------------------------------------------------------
drop policy if exists "faculties_select_all"  on petra_grants.faculties;
drop policy if exists "faculties_admin_write" on petra_grants.faculties;
create policy "faculties_select_all"  on petra_grants.faculties for select using (true);
create policy "faculties_admin_write" on petra_grants.faculties for all
  using (petra_grants.is_admin()) with check (petra_grants.is_admin());

-- ------------------------------------------------------------
-- programs: world-readable; admins manage
-- ------------------------------------------------------------
drop policy if exists "programs_select_all"  on petra_grants.programs;
drop policy if exists "programs_admin_write" on petra_grants.programs;
create policy "programs_select_all"  on petra_grants.programs for select using (true);
create policy "programs_admin_write" on petra_grants.programs for all
  using (petra_grants.is_admin()) with check (petra_grants.is_admin());

-- ------------------------------------------------------------
-- categories: world-readable; admins manage
-- ------------------------------------------------------------
drop policy if exists "categories_select_all"  on petra_grants.categories;
drop policy if exists "categories_admin_write" on petra_grants.categories;
create policy "categories_select_all"  on petra_grants.categories for select using (true);
create policy "categories_admin_write" on petra_grants.categories for all
  using (petra_grants.is_admin()) with check (petra_grants.is_admin());

-- ------------------------------------------------------------
-- profiles: user reads own profile, admins read all; user updates own;
--           admins can change roles.
-- ------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on petra_grants.profiles;
drop policy if exists "profiles_update_own"          on petra_grants.profiles;
drop policy if exists "profiles_admin_write"         on petra_grants.profiles;
create policy "profiles_select_own_or_admin" on petra_grants.profiles for select
  using (auth.uid() = id or petra_grants.is_admin());
create policy "profiles_update_own" on petra_grants.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_write" on petra_grants.profiles for all
  using (petra_grants.is_admin()) with check (petra_grants.is_admin());

-- ------------------------------------------------------------
-- grants: world-readable; admins write
-- ------------------------------------------------------------
drop policy if exists "grants_select_all"  on petra_grants.grants;
drop policy if exists "grants_admin_write" on petra_grants.grants;
create policy "grants_select_all"  on petra_grants.grants for select using (true);
create policy "grants_admin_write" on petra_grants.grants for all
  using (petra_grants.is_admin()) with check (petra_grants.is_admin());

-- ------------------------------------------------------------
-- activity_log: admins read; any signed-in user can insert their own entry
-- ------------------------------------------------------------
drop policy if exists "activity_admin_read"  on petra_grants.activity_log;
drop policy if exists "activity_self_insert" on petra_grants.activity_log;
create policy "activity_admin_read"  on petra_grants.activity_log for select using (petra_grants.is_admin());
create policy "activity_self_insert" on petra_grants.activity_log for insert
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- bookmarks: each user reads/writes only their own rows
-- ------------------------------------------------------------
drop policy if exists "bookmarks_self_all" on petra_grants.bookmarks;
create policy "bookmarks_self_all" on petra_grants.bookmarks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
