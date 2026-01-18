-- =====================================================================
-- MERGE TABLES: Combine signups and alumni_profiles into single table
-- =====================================================================

-- Step 1: Create comprehensive alumni_data table (merges both tables)
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

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alumni_data_email ON public.alumni_data (email);
CREATE INDEX IF NOT EXISTS idx_alumni_data_student_number ON public.alumni_data (student_number);
CREATE INDEX IF NOT EXISTS idx_alumni_data_degree ON public.alumni_data (degree);
CREATE INDEX IF NOT EXISTS idx_alumni_data_graduation ON public.alumni_data (graduated_year DESC);
CREATE INDEX IF NOT EXISTS idx_alumni_data_job_status ON public.alumni_data (job_status);
CREATE INDEX IF NOT EXISTS idx_alumni_data_mentorship ON public.alumni_data (open_for_mentorship);
CREATE INDEX IF NOT EXISTS idx_alumni_data_confirmed ON public.alumni_data (confirmed);
CREATE INDEX IF NOT EXISTS idx_alumni_data_created_at ON public.alumni_data (created_at DESC);

-- Step 3: Enable RLS
ALTER TABLE public.alumni_data ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
DROP POLICY IF EXISTS alumni_data_anon_select ON public.alumni_data;
CREATE POLICY alumni_data_anon_select ON public.alumni_data FOR SELECT USING (true);

DROP POLICY IF EXISTS alumni_data_anon_insert ON public.alumni_data;
CREATE POLICY alumni_data_anon_insert ON public.alumni_data FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS alumni_data_authenticated_update ON public.alumni_data;
CREATE POLICY alumni_data_authenticated_update ON public.alumni_data FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS alumni_data_anon_delete ON public.alumni_data;
CREATE POLICY alumni_data_anon_delete ON public.alumni_data FOR DELETE USING (true);

-- Step 5: Migrate data from alumni_profiles to alumni_data (if alumni_profiles exists)
-- This will insert all alumni profile data into the new merged table
INSERT INTO public.alumni_data (id, email, full_name, phone, address, birth_month, birth_day, birth_year, 
  student_number, degree, degree_label, major, honors, graduated_year, job_status, current_job, 
  current_company, previous_roles, career_path, industry, professional_certificates, skills, 
  open_for_mentorship, mentorship_areas, linkedin_profile, website_portfolio, created_at, updated_at)
SELECT id, email, full_name, contact, address, birth_month, birth_day, birth_year,
  student_number, degree, degree_label, major, honors, graduated_year, job_status, current_job,
  current_company, previous_roles, career_path, industry, professional_certificates, skills,
  open_for_mentorship, mentorship_areas, linkedin_profile, website_portfolio, created_at, updated_at
FROM public.alumni_profiles
ON CONFLICT (email) DO NOTHING;

-- Step 6: Summary - View the merged data
SELECT COUNT(*) as total_records FROM public.alumni_data;
