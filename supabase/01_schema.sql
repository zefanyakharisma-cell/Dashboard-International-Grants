-- ============================================================
-- Petra International Grants — Database schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Reference tables
-- ------------------------------------------------------------

create table if not exists public.faculties (
  id          text primary key,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.programs (
  id          text primary key,
  faculty_id  text not null references public.faculties(id) on delete cascade,
  name        text not null,
  degree      text not null check (degree in ('Undergraduate','Master''s','Doctoral','Professional')),
  created_at  timestamptz not null default now()
);

create index if not exists programs_faculty_id_idx on public.programs(faculty_id);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- User profiles (extends auth.users with role)
-- ------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('admin','viewer');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        public.user_role not null default 'viewer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: auto-create profile row when a new auth.users record is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- Grants (main entity)
-- ------------------------------------------------------------

create table if not exists public.grants (
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

create index if not exists grants_deadline_idx        on public.grants(deadline);
create index if not exists grants_category_idx        on public.grants(category);
create index if not exists grants_country_idx         on public.grants(country);
create index if not exists grants_archived_idx        on public.grants(archived);
create index if not exists grants_faculty_ids_gin     on public.grants using gin(faculty_ids);
create index if not exists grants_program_ids_gin     on public.grants using gin(program_ids);
create index if not exists grants_tags_gin            on public.grants using gin(tags);
create index if not exists grants_search_trgm         on public.grants using gin ((title || ' ' || organization || ' ' || country) gin_trgm_ops);

-- Enable trigram for fuzzy search (optional but useful)
create extension if not exists pg_trgm;

-- Touch updated_at on every UPDATE
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists grants_touch_updated_at on public.grants;
create trigger grants_touch_updated_at
  before update on public.grants
  for each row execute function public.tg_touch_updated_at();

-- ------------------------------------------------------------
-- Activity log (audit trail)
-- ------------------------------------------------------------

create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  user_email  text,
  action      text not null,            -- 'create' | 'edit' | 'delete' | 'archive' | 'restore' | 'login' | 'logout'
  detail      text,
  grant_id    uuid references public.grants(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on public.activity_log(created_at desc);

-- ------------------------------------------------------------
-- Bookmarks (per-user saved grants — only available when logged in)
-- ------------------------------------------------------------

create table if not exists public.bookmarks (
  user_id     uuid not null references auth.users(id) on delete cascade,
  grant_id    uuid not null references public.grants(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, grant_id)
);
