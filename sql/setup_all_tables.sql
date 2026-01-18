
-- =====================================================================
-- Complete database setup script for NEXT STEP project
-- This script creates both alumni_profiles and signups tables with RLS policies
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- signups TABLE (User Registration / Account Creation)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'student',
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for signups
CREATE INDEX IF NOT EXISTS idx_signups_email ON public.signups (email);
CREATE INDEX IF NOT EXISTS idx_signups_confirm_token ON public.signups (confirm_token);
CREATE INDEX IF NOT EXISTS idx_signups_created_at ON public.signups (created_at DESC);

-- Enable RLS for signups
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- RLS policies for signups
DROP POLICY IF EXISTS signups_anon_select ON public.signups;
CREATE POLICY signups_anon_select ON public.signups FOR SELECT USING (true);

DROP POLICY IF EXISTS signups_anon_insert ON public.signups;
CREATE POLICY signups_anon_insert ON public.signups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS signups_authenticated_update ON public.signups;
CREATE POLICY signups_authenticated_update ON public.signups FOR UPDATE USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);

-- =====================================================================
-- alumni_profiles TABLE (Alumni Information & Career Data)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signup_id UUID REFERENCES public.signups(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  student_number TEXT UNIQUE,
  degree TEXT,
  degree_label TEXT,
  major TEXT,
  honors TEXT,
  birth_month INT,
  birth_day INT,
  birth_year INT,
  contact TEXT,
  address TEXT,
  graduated_year INT,
  job_status TEXT,
  current_job TEXT,
  current_company TEXT,
  previous_roles TEXT,
  career_path TEXT,
  industry TEXT,
  professional_certificates TEXT,
  skills TEXT,
  open_for_mentorship BOOLEAN DEFAULT false,
  mentorship_areas TEXT,
  linkedin_profile TEXT,
  website_portfolio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for alumni_profiles (for performance)
CREATE INDEX IF NOT EXISTS idx_alumni_email ON public.alumni_profiles (email);
CREATE INDEX IF NOT EXISTS idx_alumni_student_number ON public.alumni_profiles (student_number);
CREATE INDEX IF NOT EXISTS idx_alumni_degree ON public.alumni_profiles (degree);
CREATE INDEX IF NOT EXISTS idx_alumni_graduation ON public.alumni_profiles (graduated_year DESC);
CREATE INDEX IF NOT EXISTS idx_alumni_job_status ON public.alumni_profiles (job_status);
CREATE INDEX IF NOT EXISTS idx_alumni_mentorship ON public.alumni_profiles (open_for_mentorship);
CREATE INDEX IF NOT EXISTS idx_alumni_signup_id ON public.alumni_profiles (signup_id);

-- Enable RLS for alumni_profiles
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for alumni_profiles
DROP POLICY IF EXISTS alumni_anon_select ON public.alumni_profiles;
CREATE POLICY alumni_anon_select ON public.alumni_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS alumni_anon_insert ON public.alumni_profiles;
CREATE POLICY alumni_anon_insert ON public.alumni_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS alumni_authenticated_update ON public.alumni_profiles;
CREATE POLICY alumni_authenticated_update ON public.alumni_profiles FOR UPDATE USING (auth.uid()::text = signup_id::text) WITH CHECK (auth.uid()::text = signup_id::text);

DROP POLICY IF EXISTS alumni_authenticated_delete ON public.alumni_profiles;
CREATE POLICY alumni_authenticated_delete ON public.alumni_profiles FOR DELETE USING (auth.uid()::text = signup_id::text);

-- =====================================================================
-- Seed Data (Development)
-- =====================================================================

-- Seed signups
INSERT INTO public.signups (full_name, email, phone, role, confirmed)
VALUES 
  ('Test Alumni One', 'alumni1@example.com', '+63 900 000 0001', 'student', true),
  ('Test Alumni Two', 'alumni2@example.com', '+63 900 000 0002', 'student', true)
ON CONFLICT (email) DO NOTHING;

-- Seed alumni profiles (linking to signups)
INSERT INTO public.alumni_profiles (
  signup_id, full_name, email, student_number, degree, degree_label, 
  graduated_year, job_status, current_company, open_for_mentorship
)
SELECT 
  s.id, s.full_name, s.email, 
  '2020-0001', 'BSA', 'Bachelor of Science in Accountancy (BSA)',
  2020, 'Employed', 'Tech Corp', true
FROM public.signups s
WHERE s.email = 'alumni1@example.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.alumni_profiles (
  signup_id, full_name, email, student_number, degree, degree_label, 
  graduated_year, job_status, current_company, open_for_mentorship
)
SELECT 
  s.id, s.full_name, s.email,
  '2021-0002', 'BSIT', 'Bachelor of Science in Information Technology (BSIT)',
  2021, 'Employed', 'Innovation Labs', true
FROM public.signups s
WHERE s.email = 'alumni2@example.com'
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- End of setup script
-- =====================================================================
