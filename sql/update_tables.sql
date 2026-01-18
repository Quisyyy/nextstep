-- =====================================================================
-- NEXT STEP: Add Missing Columns to Existing Tables
-- Run this to update existing alumni_profiles and signups tables
-- =====================================================================

-- =====================================================================
-- UPDATE SIGNUPS TABLE
-- =====================================================================

-- Add missing columns to signups if needed
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT false;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS confirm_token TEXT UNIQUE;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_signups_email ON public.signups (email);
CREATE INDEX IF NOT EXISTS idx_signups_confirm_token ON public.signups (confirm_token);

-- =====================================================================
-- UPDATE ALUMNI_PROFILES TABLE
-- =====================================================================

-- Add missing columns to alumni_profiles
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS signup_id UUID;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS degree_label TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS graduated_year INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS job_status TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS current_job TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS current_company TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS previous_roles TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS career_path TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS professional_certificates TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS open_for_mentorship BOOLEAN DEFAULT false;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS mentorship_areas TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS website_portfolio TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS major TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS honors TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS birth_month INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS birth_day INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS birth_year INT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.alumni_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alumni_email ON public.alumni_profiles (email);
CREATE INDEX IF NOT EXISTS idx_alumni_degree ON public.alumni_profiles (degree);
CREATE INDEX IF NOT EXISTS idx_alumni_graduation ON public.alumni_profiles (graduated_year DESC);
CREATE INDEX IF NOT EXISTS idx_alumni_job_status ON public.alumni_profiles (job_status);
CREATE INDEX IF NOT EXISTS idx_alumni_mentorship ON public.alumni_profiles (open_for_mentorship);

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- Insert into signups (remove duplicate emails first)
DELETE FROM public.signups WHERE email IN ('alumni1@example.com', 'alumni2@example.com');

INSERT INTO public.signups (full_name, email, phone, role, confirmed)
VALUES 
  ('Test Alumni One', 'alumni1@example.com', '+63 900 000 0001', 'student', true),
  ('Test Alumni Two', 'alumni2@example.com', '+63 900 000 0002', 'student', true);

-- Update alumni profiles to link to signups
UPDATE public.alumni_profiles ap
SET signup_id = s.id
FROM public.signups s
WHERE ap.email = s.email AND ap.signup_id IS NULL;

-- Insert/update additional alumni profiles
DELETE FROM public.alumni_profiles WHERE email IN ('alumni1@example.com', 'alumni2@example.com');

INSERT INTO public.alumni_profiles (
  full_name, email, student_number, degree, degree_label, 
  graduated_year, job_status, current_company, open_for_mentorship, signup_id
)
SELECT
  s.full_name,
  s.email,
  CASE WHEN s.email = 'alumni1@example.com' THEN '2020-0001' ELSE '2021-0002' END,
  CASE WHEN s.email = 'alumni1@example.com' THEN 'BSA' ELSE 'BSIT' END,
  CASE WHEN s.email = 'alumni1@example.com' THEN 'Bachelor of Science in Accountancy (BSA)' ELSE 'Bachelor of Science in Information Technology (BSIT)' END,
  CASE WHEN s.email = 'alumni1@example.com' THEN 2020 ELSE 2021 END,
  'Employed',
  CASE WHEN s.email = 'alumni1@example.com' THEN 'Tech Corp' ELSE 'Innovation Labs' END,
  true,
  s.id
FROM public.signups s
WHERE s.email IN ('alumni1@example.com', 'alumni2@example.com');

-- =====================================================================
-- End of update script
-- =====================================================================
