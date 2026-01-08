-- SQL to create the alumni_profiles table and permissive dev policies
-- Run this in the Supabase SQL editor (development only). Tighten policies for production.

create extension if not exists pgcrypto;

create table if not exists public.alumni_profiles (
  id uuid default gen_random_uuid() primary key,
  full_name text,
  email text,
  student_number text,
  degree text,
  degree_label text,
  major text,
  honors text,
  birth_month int,
  birth_day int,
  birth_year int,
  contact text,
  address text,
  graduated_year int,
  -- Job Status & Career Information fields
  job_status text,
  current_job text,
  previous_roles text,
  career_path text,
  industry text,
  professional_certificates text,
  open_for_mentorship text,
  created_at timestamptz default now()
);

-- Enable row level security and add permissive policies for dev testing
alter table public.alumni_profiles enable row level security;

-- DROP/CREATE pattern avoids unsupported CREATE POLICY IF NOT EXISTS
drop policy if exists anon_select on public.alumni_profiles;
create policy anon_select on public.alumni_profiles for select using (true);

drop policy if exists anon_insert on public.alumni_profiles;
create policy anon_insert on public.alumni_profiles for insert with check (true);

drop policy if exists anon_update on public.alumni_profiles;
create policy anon_update on public.alumni_profiles for update using (true) with check (true);

drop policy if exists anon_delete on public.alumni_profiles;
create policy anon_delete on public.alumni_profiles for delete using (true);

-- Optional: add a couple of seed rows
-- Ensure table has the expected columns (use ALTER ... ADD COLUMN IF NOT EXISTS so this script can be re-run)
alter table public.alumni_profiles add column if not exists degree_label text;
alter table public.alumni_profiles add column if not exists created_at timestamptz default now();

-- Add new Job Status & Career Information columns (for existing tables)
alter table public.alumni_profiles add column if not exists job_status text;
alter table public.alumni_profiles add column if not exists current_job text;
alter table public.alumni_profiles add column if not exists previous_roles text;
alter table public.alumni_profiles add column if not exists career_path text;
alter table public.alumni_profiles add column if not exists industry text;
alter table public.alumni_profiles add column if not exists professional_certificates text;
alter table public.alumni_profiles add column if not exists open_for_mentorship text;

-- Now insert seed rows (won't fail if columns already existed)
insert into public.alumni_profiles (full_name, email, student_number, degree, degree_label, created_at)
values
('Seed User One','seed1@example.com','2020-0001','BSA','Bachelor of Science in Accountancy (BSA)', now()),
('Seed User Two','seed2@example.com','2021-0002','BSIT','Bachelor of Science in Information Technology (BSIT)', now())
ON CONFLICT DO NOTHING;
