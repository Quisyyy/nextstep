-- NEXT STEP — Admins table (Supabase)
-- This script creates a secure admins profile table linked to Supabase Auth users.
-- It is safe to re-run: existing policies are dropped and re-created, indexes use IF NOT EXISTS.

-- 1) Table
create table if not exists public.admins (
	id uuid primary key references auth.users(id) on delete cascade,
	employee_id text not null unique,
	email text not null unique,
	full_name text,
	role text not null default 'admin',
	created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.admins enable row level security;

-- 2) RLS Policies (idempotent: drop if exists, then create)
drop policy if exists admins_select_own on public.admins;
drop policy if exists admins_insert_own on public.admins;
drop policy if exists admins_update_own on public.admins;

-- Allow an authenticated user to read their own admin profile
create policy admins_select_own
	on public.admins
	for select
	to authenticated
	using (auth.uid() = id);

-- Allow an authenticated user to insert their own row (id must equal auth.uid())
create policy admins_insert_own
	on public.admins
	for insert
	to authenticated
	with check (auth.uid() = id);

-- Allow an authenticated user to update their own row
create policy admins_update_own
	on public.admins
	for update
	to authenticated
	using (auth.uid() = id)
	with check (auth.uid() = id);

-- Optional (DEV ONLY): To list all admins for debugging, uncomment below
-- drop policy if exists admins_select_all on public.admins;
-- create policy admins_select_all
--   on public.admins
--   for select
--   to authenticated
--   using (true);

-- 3) Helpful indexes
create index if not exists admins_employee_id_idx on public.admins (employee_id);
create index if not exists admins_email_idx on public.admins (email);

-- Notes:
-- - Admin creation flow is handled by the site: sign up via Supabase Auth, then insert into public.admins with the same user id.
-- - See /admin/admin-auth.js and /admin/adminlogin.html for the wired UI and logic.
