-- ============================================================
-- Petra International Grants — Database schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
--
-- All objects live in a dedicated `petra_grants` schema so this app
-- can safely coexist with other projects in the same Supabase instance.
-- ============================================================

-- Required extensions (must be created BEFORE any index that uses them)
create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- ------------------------------------------------------------
-- Dedicated schema + access grants
-- ------------------------------------------------------------
create schema if not exists petra_grants;

-- PostgREST needs USAGE on the schema for anon/authenticated to even see it,
-- plus table-level grants (RLS will then enforce row-level rules).
grant usage on schema petra_grants to anon, authenticated, service_role;

-- Apply the same grants automatically to any future tables/sequences in this schema.
alter default privileges in schema petra_grants
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema petra_grants
  grant usage, select on sequences to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- Reference tables
-- ------------------------------------------------------------

create table if not exists petra_grants.faculties (
  id          text primary key,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists petra_grants.programs (
  id          text primary key,
  faculty_id  text not null references petra_grants.faculties(id) on delete cascade,
  name        text not null,
  degree      text not null check (degree in ('Undergraduate','Master''s','Doctoral','Professional')),
  created_at  timestamptz not null default now()
);

create index if not exists programs_faculty_id_idx on petra_grants.programs(faculty_id);

create table if not exists petra_grants.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- User profiles (extends auth.users with a role for THIS app only)
-- ------------------------------------------------------------

do $$ begin
  create type petra_grants.user_role as enum ('admin','viewer');
exception when duplicate_object then null; end $$;

create table if not exists petra_grants.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        petra_grants.user_role not null default 'viewer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: when ANY user signs up across this Supabase project,
-- auto-create a petra_grants.profiles row for them with default 'viewer' role.
-- (The trigger name is namespaced so other apps on this project can have
-- their own auth.users triggers without colliding.)
create or replace function petra_grants.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = petra_grants, public
as $$
begin
  insert into petra_grants.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_petra_grants on auth.users;
create trigger on_auth_user_created_petra_grants
  after insert on auth.users
  for each row execute function petra_grants.handle_new_user();

-- Helper: is current user an admin of THIS app?
create or replace function petra_grants.is_admin()
returns boolean
language sql stable security definer set search_path = petra_grants, public
as $$
  select exists (
    select 1 from petra_grants.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Allow PostgREST callers to invoke the helper (used inside RLS policies; usually
-- not called directly, but the GRANT keeps EXPLAIN/diagnostics from failing).
grant execute on function petra_grants.is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- Grants (main entity)
-- ------------------------------------------------------------

create table if not exists petra_grants.grants (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  organization    text not null,
  country         text not null,
  category        text not null,
  amount          numeric(14,2) default 0,
  currency        text not null default 'USD',
  amount_note     text default '',
  deadline        date,
  description     text default '',
  eligibility     text default '',
  website         text default '',
  contact_email   text default '',
  tags            text[] not null default '{}',
  attachments     jsonb  not null default '[]'::jsonb,
  faculty_ids     text[] not null default '{}',
  program_ids     text[] not null default '{}',
  degree_levels   text[] not null default '{}',
  archived        boolean not null default false,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists grants_deadline_idx    on petra_grants.grants(deadline);
create index if not exists grants_category_idx    on petra_grants.grants(category);
create index if not exists grants_country_idx     on petra_grants.grants(country);
create index if not exists grants_archived_idx    on petra_grants.grants(archived);
create index if not exists grants_faculty_ids_gin on petra_grants.grants using gin(faculty_ids);
create index if not exists grants_program_ids_gin on petra_grants.grants using gin(program_ids);
create index if not exists grants_tags_gin        on petra_grants.grants using gin(tags);
create index if not exists grants_search_trgm     on petra_grants.grants using gin ((title || ' ' || organization || ' ' || country) gin_trgm_ops);

-- Touch updated_at on every UPDATE
create or replace function petra_grants.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists grants_touch_updated_at on petra_grants.grants;
create trigger grants_touch_updated_at
  before update on petra_grants.grants
  for each row execute function petra_grants.tg_touch_updated_at();

-- ------------------------------------------------------------
-- Activity log (audit trail)
-- ------------------------------------------------------------

create table if not exists petra_grants.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  action      text not null,            -- 'create' | 'edit' | 'delete' | 'archive' | 'restore' | 'login' | 'logout'
  detail      text,
  grant_id    uuid references petra_grants.grants(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on petra_grants.activity_log(created_at desc);

-- ------------------------------------------------------------
-- Bookmarks (per-user saved grants — only available when logged in)
-- ------------------------------------------------------------

create table if not exists petra_grants.bookmarks (
  user_id     uuid not null references auth.users(id) on delete cascade,
  grant_id    uuid not null references petra_grants.grants(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, grant_id)
);

-- Re-apply table-level grants for everything we just created. The default-privileges
-- statement above covers any future tables, but objects created in the same script
-- before the ALTER DEFAULT runs aren't retroactively covered; this catches them.
grant select, insert, update, delete on all tables in schema petra_grants
  to anon, authenticated, service_role;
grant usage, select on all sequences in schema petra_grants
  to anon, authenticated, service_role;
