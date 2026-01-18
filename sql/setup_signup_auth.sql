-- =====================================================================
-- NEXT STEP: Setup for Signup and Auth
-- Simpler setup focusing on user registration and authentication
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- users TABLE - Primary user authentication
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'alumni',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes on users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =====================================================================
-- alumni_data TABLE - Alumni profile information
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.alumni_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_number TEXT UNIQUE,
  degree TEXT,
  major TEXT,
  birth_month INT,
  birth_day INT,
  birth_year INT,
  address TEXT,
  graduated_year INT,
  job_status TEXT,
  current_job TEXT,
  current_company TEXT,
  industry TEXT,
  skills TEXT,
  linkedin_profile TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes on alumni_data table
CREATE INDEX IF NOT EXISTS idx_alumni_user_id ON public.alumni_data(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_student_number ON public.alumni_data(student_number);
CREATE INDEX IF NOT EXISTS idx_alumni_degree ON public.alumni_data(degree);
CREATE INDEX IF NOT EXISTS idx_alumni_job_status ON public.alumni_data(job_status);

-- Enable RLS on alumni_data table
ALTER TABLE public.alumni_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alumni_data table
DROP POLICY IF EXISTS "Public can view alumni profiles" ON public.alumni_data;
CREATE POLICY "Public can view alumni profiles" ON public.alumni_data
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own alumni data" ON public.alumni_data;
CREATE POLICY "Users can view their own alumni data" ON public.alumni_data
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own alumni data" ON public.alumni_data;
CREATE POLICY "Users can insert their own alumni data" ON public.alumni_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own alumni data" ON public.alumni_data;
CREATE POLICY "Users can update their own alumni data" ON public.alumni_data
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- FUNCTION: Handle new user signup (called by Auth triggers)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    'alumni'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni_data TO anon, authenticated;

-- =====================================================================
-- VIEW: User profile (combines auth data with user data)
-- =====================================================================
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.role,
  ad.student_number,
  ad.degree,
  ad.job_status,
  u.created_at
FROM public.users u
LEFT JOIN public.alumni_data ad ON u.id = ad.user_id;

GRANT SELECT ON public.user_profiles TO anon, authenticated;
