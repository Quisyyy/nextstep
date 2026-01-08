-- Fix Unique Constraints for Alumni Profiles
-- Run each section separately in Supabase SQL Editor

-- STEP 1: Drop existing constraints
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_email_key;
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_student_number_key;
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_email_unique;
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_student_number_unique;

-- STEP 2: Add proper unique constraints
ALTER TABLE public.alumni_profiles ADD CONSTRAINT alumni_profiles_email_unique UNIQUE (email);
ALTER TABLE public.alumni_profiles ADD CONSTRAINT alumni_profiles_student_number_unique UNIQUE (student_number);

-- STEP 3: Create indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_alumni_email ON public.alumni_profiles (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_alumni_student_number ON public.alumni_profiles (student_number) WHERE student_number IS NOT NULL;

-- STEP 4: Verify constraints
SELECT conname as constraint_name, contype as type FROM pg_constraint WHERE conrelid = 'public.alumni_profiles'::regclass AND (conname LIKE '%email%' OR conname LIKE '%student%');
