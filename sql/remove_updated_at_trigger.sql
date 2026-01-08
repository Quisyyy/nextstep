-- Remove any triggers that try to set updated_at column
-- Run this in Supabase SQL Editor

-- 1. Check if there are any triggers on alumni_profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'alumni_profiles';

-- 2. Drop any trigger that sets updated_at (common trigger names)
DROP TRIGGER IF EXISTS set_updated_at ON public.alumni_profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.alumni_profiles;
DROP TRIGGER IF EXISTS update_updated_at ON public.alumni_profiles;
DROP TRIGGER IF EXISTS update_modified_time ON public.alumni_profiles;
DROP TRIGGER IF EXISTS on_update_timestamp ON public.alumni_profiles;

-- 3. Also drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- 4. Verify all triggers are removed
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'alumni_profiles';

-- Should return 0 rows if all triggers are removed
