-- Complete Fix for Alumni Profiles - Run in Supabase SQL Editor
-- This script removes duplicates and sets up proper constraints

-- ============================================================
-- STEP 1: Find and display current duplicates (for review)
-- ============================================================
SELECT 
    'DUPLICATE CHECK' as info,
    email,
    student_number,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as duplicate_ids
FROM public.alumni_profiles
WHERE email IS NOT NULL OR student_number IS NOT NULL
GROUP BY email, student_number
HAVING COUNT(*) > 1;

-- ============================================================
-- STEP 2: Remove duplicate records (keep most recent)
-- ============================================================
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY 
                COALESCE(email, 'null_' || id::text),
                COALESCE(student_number, 'null_' || id::text)
            ORDER BY created_at DESC
        ) as row_num
    FROM public.alumni_profiles
)
DELETE FROM public.alumni_profiles
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- ============================================================
-- STEP 3: Drop ALL existing constraints
-- ============================================================
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_email_key;
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_student_number_key;
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_email_unique;
ALTER TABLE public.alumni_profiles DROP CONSTRAINT IF EXISTS alumni_profiles_student_number_unique;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_alumni_email;
DROP INDEX IF EXISTS idx_alumni_student_number;

-- ============================================================
-- STEP 4: Create partial unique indexes (allows NULL, prevents duplicates)
-- ============================================================
-- These indexes enforce uniqueness only when values are NOT NULL
-- This allows updates to work correctly
CREATE UNIQUE INDEX idx_alumni_email_unique 
ON public.alumni_profiles (email) 
WHERE email IS NOT NULL AND email != '';

CREATE UNIQUE INDEX idx_alumni_student_number_unique 
ON public.alumni_profiles (student_number) 
WHERE student_number IS NOT NULL AND student_number != '';

-- ============================================================
-- STEP 5: Verify the setup
-- ============================================================
SELECT 
    'Total Records' as metric,
    COUNT(*) as count
FROM public.alumni_profiles

UNION ALL

SELECT 
    'Unique Emails (non-null)' as metric,
    COUNT(DISTINCT email) as count
FROM public.alumni_profiles
WHERE email IS NOT NULL

UNION ALL

SELECT 
    'Unique Student Numbers (non-null)' as metric,
    COUNT(DISTINCT student_number) as count
FROM public.alumni_profiles
WHERE student_number IS NOT NULL;

-- ============================================================
-- STEP 6: Show current indexes
-- ============================================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'alumni_profiles'
    AND (indexname LIKE '%email%' OR indexname LIKE '%student%');
