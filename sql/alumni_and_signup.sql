-- =====================================================================
-- NEXT STEP: Alumni Profile & Signup Management
-- Complete database setup for alumni accounts and signup registration
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- alumni_data TABLE (Unified Alumni & User Data)
-- Merged table combining signups + alumni_profiles for simplified data management
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.alumni_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User Authentication (from signups)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'student',
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT UNIQUE,
  
  -- Personal Information (from alumni_profiles)
  phone TEXT,
  address TEXT,
  birth_month INT,
  birth_day INT,
  birth_year INT,
  
  -- Academic Information (from alumni_profiles)
  student_number TEXT UNIQUE,
  degree TEXT,
  degree_label TEXT,
  major TEXT,
  honors TEXT,
  graduated_year INT,
  
  -- Career Information (from alumni_profiles)
  job_status TEXT,
  current_job TEXT,
  current_company TEXT,
  previous_roles TEXT,
  career_path TEXT,
  industry TEXT,
  professional_certificates TEXT,
  skills TEXT,
  
  -- Mentorship Information (from alumni_profiles)
  open_for_mentorship BOOLEAN DEFAULT false,
  mentorship_areas TEXT,
  
  -- Professional Links (from alumni_profiles)
  linkedin_profile TEXT,
  website_portfolio TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for alumni_data (for performance)
CREATE INDEX IF NOT EXISTS idx_alumni_data_email ON public.alumni_data (email);
CREATE INDEX IF NOT EXISTS idx_alumni_data_student_number ON public.alumni_data (student_number);
CREATE INDEX IF NOT EXISTS idx_alumni_data_degree ON public.alumni_data (degree);
CREATE INDEX IF NOT EXISTS idx_alumni_data_graduation ON public.alumni_data (graduated_year DESC);
CREATE INDEX IF NOT EXISTS idx_alumni_data_job_status ON public.alumni_data (job_status);
CREATE INDEX IF NOT EXISTS idx_alumni_data_mentorship ON public.alumni_data (open_for_mentorship);
CREATE INDEX IF NOT EXISTS idx_alumni_data_confirmed ON public.alumni_data (confirmed);
CREATE INDEX IF NOT EXISTS idx_alumni_data_created_at ON public.alumni_data (created_at DESC);

-- Enable RLS for alumni_data
ALTER TABLE public.alumni_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for alumni_data
DROP POLICY IF EXISTS alumni_data_anon_select ON public.alumni_data;
CREATE POLICY alumni_data_anon_select ON public.alumni_data FOR SELECT USING (true);

DROP POLICY IF EXISTS alumni_data_anon_insert ON public.alumni_data;
CREATE POLICY alumni_data_anon_insert ON public.alumni_data FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS alumni_data_authenticated_update ON public.alumni_data;
CREATE POLICY alumni_data_authenticated_update ON public.alumni_data FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS alumni_data_anon_delete ON public.alumni_data;
CREATE POLICY alumni_data_anon_delete ON public.alumni_data FOR DELETE USING (true);

DROP POLICY IF EXISTS alumni_authenticated_delete ON public.alumni_profiles;
CREATE POLICY alumni_authenticated_delete ON public.alumni_profiles FOR DELETE USING (true);

-- =====================================================================
-- Add Missing Columns to Existing Tables (Run FIRST)
-- =====================================================================

-- Add missing columns to alumni_profiles if they don't exist
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS signup_id UUID REFERENCES public.signups(id) ON DELETE CASCADE;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS student_number TEXT UNIQUE;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS degree_label TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS graduated_year INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS job_status TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS current_company TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS open_for_mentorship BOOLEAN DEFAULT false;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS honors TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS birth_month INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS birth_day INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS birth_year INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS current_job TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS previous_roles TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS career_path TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS professional_certificates TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS mentorship_areas TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS website_portfolio TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- =====================================================================
-- Seed Data (Development)
-- =====================================================================

-- Seed signups
INSERT INTO public.signups (full_name, email, phone, role, confirmed)
VALUES 
  ('Test Alumni One', 'alumni1@example.com', '+63 900 000 0001', 'student', true),
  ('Test Alumni Two', 'alumni2@example.com', '+63 900 000 0002', 'student', true)
ON CONFLICT (email) DO NOTHING;

-- Seed alumni profiles (linking to signups by email)
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
