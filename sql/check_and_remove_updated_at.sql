-- Check and remove updated_at column if it exists
-- Run this in Supabase SQL Editor

-- 1. Check if updated_at column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'alumni_profiles' 
  AND column_name = 'updated_at';

-- 2. If column exists, drop it
ALTER TABLE public.alumni_profiles 
DROP COLUMN IF EXISTS updated_at;

-- 3. Verify column is removed - should return 0 rows
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'alumni_profiles' 
  AND column_name = 'updated_at';

-- 4. Show all current columns to confirm
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'alumni_profiles'
ORDER BY ordinal_position;
