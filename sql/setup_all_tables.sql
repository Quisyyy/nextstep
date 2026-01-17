
-- =====================================================================
-- Complete database setup script for NEXT STEP project
-- This script creates both alumni_profiles and signups tables with RLS policies
-- Safe to run multiple times (uses IF NOT EXISTS and safe column additions)
-- =====================================================================

-- Enable required extensions
create extension if not exists pgcrypto;

-- =====================================================================
-- alumni_profiles table (for Information form submissions)
-- =====================================================================
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
  created_at timestamptz default now()
);

-- Safe column additions for alumni_profiles
alter table public.alumni_profiles add column if not exists full_name text;
alter table public.alumni_profiles add column if not exists email text;
alter table public.alumni_profiles add column if not exists student_number text;
alter table public.alumni_profiles add column if not exists degree text;
alter table public.alumni_profiles add column if not exists degree_label text;
alter table public.alumni_profiles add column if not exists major text;
alter table public.alumni_profiles add column if not exists honors text;
alter table public.alumni_profiles add column if not exists birth_month int;
alter table public.alumni_profiles add column if not exists birth_day int;
alter table public.alumni_profiles add column if not exists birth_year int;
alter table public.alumni_profiles add column if not exists contact text;
alter table public.alumni_profiles add column if not exists address text;
alter table public.alumni_profiles add column if not exists graduated_year int;
alter table public.alumni_profiles add column if not exists created_at timestamptz default now();

-- Indexes for alumni_profiles
create index if not exists idx_alumni_email on public.alumni_profiles (email);
create index if not exists idx_alumni_degree on public.alumni_profiles (degree);

-- Enable RLS for alumni_profiles
alter table public.alumni_profiles enable row level security;

-- RLS policies for alumni_profiles (permissive for development)
drop policy if exists alumni_anon_select on public.alumni_profiles;
create policy alumni_anon_select on public.alumni_profiles for select using (true);

drop policy if exists alumni_anon_insert on public.alumni_profiles;
create policy alumni_anon_insert on public.alumni_profiles for insert with check (true);

-- Seed data for alumni_profiles
insert into public.alumni_profiles (full_name, email, student_number, degree, degree_label, created_at)
values
('Seed Alumni One','alumni1@example.com','2020-0001','BSA','Bachelor of Science in Accountancy (BSA)', now()),
('Seed Alumni Two','alumni2@example.com','2021-0002','BSIT','Bachelor of Science in Information Technology (BSIT)', now())
ON CONFLICT DO NOTHING;

-- =====================================================================
-- signups table (for user registration)
-- =====================================================================
create table if not exists public.signups (
  id uuid default gen_random_uuid() primary key,
  full_name text,
  email text,
  phone text,
  password_hash text,
  role text,
  confirmed boolean default false,
  confirm_token text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Safe column adds for signups
alter table public.signups add column if not exists full_name text;
alter table public.signups add column if not exists email text;
alter table public.signups add column if not exists phone text;
alter table public.signups add column if not exists password_hash text;
alter table public.signups add column if not exists role text;
alter table public.signups add column if not exists confirmed boolean default false;
alter table public.signups add column if not exists confirm_token text;
alter table public.signups add column if not exists metadata jsonb;
alter table public.signups add column if not exists created_at timestamptz default now();

-- Indexes for signups
create index if not exists idx_signups_email on public.signups (email);

-- Enable RLS for signups
alter table public.signups enable row level security;

-- RLS policies for signups (permissive for development)
drop policy if exists signups_anon_select on public.signups;
create policy signups_anon_select on public.signups for select using (true);

drop policy if exists signups_anon_insert on public.signups;
create policy signups_anon_insert on public.signups for insert with check (true);

-- Seed data for signups
insert into public.signups (full_name, email, phone, role, created_at)
values ('Signup Test','signup-test@example.com','+63 900 000 0000','student', now())
ON CONFLICT DO NOTHING;

-- =====================================================================
-- End of setup script
-- =====================================================================
