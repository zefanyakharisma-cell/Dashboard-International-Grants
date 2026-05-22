-- ============================================================
-- Row Level Security (RLS) policies
-- Run AFTER 01_schema.sql
-- ============================================================

-- Enable RLS on every public table
alter table public.faculties     enable row level security;
alter table public.programs      enable row level security;
alter table public.categories    enable row level security;
alter table public.profiles      enable row level security;
alter table public.grants        enable row level security;
alter table public.activity_log  enable row level security;
alter table public.bookmarks     enable row level security;

-- ------------------------------------------------------------
-- faculties: world-readable; admins manage
-- ------------------------------------------------------------
drop policy if exists "faculties_select_all"  on public.faculties;
drop policy if exists "faculties_admin_write" on public.faculties;
create policy "faculties_select_all"  on public.faculties for select using (true);
create policy "faculties_admin_write" on public.faculties for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- programs: world-readable; admins manage
-- ------------------------------------------------------------
drop policy if exists "programs_select_all"  on public.programs;
drop policy if exists "programs_admin_write" on public.programs;
create policy "programs_select_all"  on public.programs for select using (true);
create policy "programs_admin_write" on public.programs for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- categories: world-readable; admins manage
-- ------------------------------------------------------------
drop policy if exists "categories_select_all"  on public.categories;
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_select_all"  on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- profiles: user reads own profile, admins read all; user updates own non-role fields
-- ------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own"          on public.profiles;
drop policy if exists "profiles_admin_write"         on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_write" on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- grants: world-readable; admins write
-- ------------------------------------------------------------
drop policy if exists "grants_select_all"  on public.grants;
drop policy if exists "grants_admin_write" on public.grants;
create policy "grants_select_all"  on public.grants for select using (true);
create policy "grants_admin_write" on public.grants for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- activity_log: admins read; any signed-in user can insert their own entry
-- ------------------------------------------------------------
drop policy if exists "activity_admin_read" on public.activity_log;
drop policy if exists "activity_self_insert" on public.activity_log;
create policy "activity_admin_read"  on public.activity_log for select using (public.is_admin());
create policy "activity_self_insert" on public.activity_log for insert
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- bookmarks: each user reads/writes only their own rows
-- ------------------------------------------------------------
drop policy if exists "bookmarks_self_all" on public.bookmarks;
create policy "bookmarks_self_all" on public.bookmarks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
