-- Migration script to add Job Status & Career Information fields
-- Run this in Supabase SQL Editor if you already have an existing alumni_profiles table
-- This script is safe to run multiple times (uses IF NOT EXISTS)

-- Add new columns for Job Status & Career Information
alter table public.alumni_profiles add column if not exists job_status text;
alter table public.alumni_profiles add column if not exists current_job text;
alter table public.alumni_profiles add column if not exists previous_roles text;
alter table public.alumni_profiles add column if not exists career_path text;
alter table public.alumni_profiles add column if not exists industry text;
alter table public.alumni_profiles add column if not exists professional_certificates text;
alter table public.alumni_profiles add column if not exists open_for_mentorship text;

-- Add comments to document the columns
comment on column public.alumni_profiles.job_status is 'Current employment status: employed, self-employed, unemployed, student, freelancer';
comment on column public.alumni_profiles.current_job is 'Current job title or position';
comment on column public.alumni_profiles.previous_roles is 'Previous job roles or positions';
comment on column public.alumni_profiles.career_path is 'Career direction or field (e.g., Technology, Business, Education)';
comment on column public.alumni_profiles.industry is 'Industry sector (e.g., IT, Finance, Healthcare, Education)';
comment on column public.alumni_profiles.professional_certificates is 'Professional certifications (e.g., AWS Certified, PMP, CPA)';
comment on column public.alumni_profiles.open_for_mentorship is 'Mentorship availability: yes, seeking, both, no';

-- Verify the columns were added
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'alumni_profiles'
  and column_name in (
    'job_status',
    'current_job',
    'previous_roles',
    'career_path',
    'industry',
    'professional_certificates',
    'open_for_mentorship'
  )
order by column_name;
