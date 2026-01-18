-- =====================================================================
-- ALUMNI DATA TABLE - FRESH CREATION (No migrations)
-- =====================================================================

-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS public.alumni_data CASCADE;

-- Create the unified alumni_data table
CREATE TABLE public.alumni_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  password_hash TEXT,
  phone TEXT,
  address TEXT,
  birth_month INT,
  birth_day INT,
  birth_year INT,
  student_number TEXT UNIQUE,
  degree TEXT,
  degree_label TEXT,
  major TEXT,
  honors TEXT,
  graduated_year INT,
  job_status TEXT,
  current_job TEXT,
  current_company TEXT,
  previous_roles TEXT,
  career_path TEXT,
  industry TEXT,
  professional_certificates TEXT,
  
  skills TEXT,
  role TEXT DEFAULT 'student',
  confirmed BOOLEAN DEFAULT false,
  confirm_token TEXT UNIQUE,
  open_for_mentorship BOOLEAN DEFAULT false,
  mentorship_areas TEXT,
  linkedin_profile TEXT,
  website_portfolio TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_alumni_data_email ON public.alumni_data (email);
CREATE INDEX idx_alumni_data_student_number ON public.alumni_data (student_number);
CREATE INDEX idx_alumni_data_degree ON public.alumni_data (degree);
CREATE INDEX idx_alumni_data_graduation ON public.alumni_data (graduated_year DESC);
CREATE INDEX idx_alumni_data_job_status ON public.alumni_data (job_status);
CREATE INDEX idx_alumni_data_mentorship ON public.alumni_data (open_for_mentorship);
CREATE INDEX idx_alumni_data_confirmed ON public.alumni_data (confirmed);
CREATE INDEX idx_alumni_data_email_created ON public.alumni_data (email, created_at DESC);

-- Enable RLS
ALTER TABLE public.alumni_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations
CREATE POLICY alumni_data_select ON public.alumni_data FOR SELECT USING (true);
CREATE POLICY alumni_data_insert ON public.alumni_data FOR INSERT WITH CHECK (true);
CREATE POLICY alumni_data_update ON public.alumni_data FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY alumni_data_delete ON public.alumni_data FOR DELETE USING (true);

-- Success message
SELECT 'SUCCESS: alumni_data table created!' as result;
