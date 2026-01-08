-- ========================================
-- ULTIMATE FIX: Remove updated_at trigger error
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- THEN CLICK "RUN"
-- ========================================

-- IMPORTANT: This must be run in Supabase Dashboard > SQL Editor
-- NOT in your code editor!

-- Step 1: Show all triggers (diagnostic)
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '=== TRIGGERS ON alumni_profiles ===';
    FOR r IN 
        SELECT trigger_name, event_manipulation
        FROM information_schema.triggers
        WHERE event_object_table = 'alumni_profiles'
    LOOP
        RAISE NOTICE 'Found trigger: % on %', r.trigger_name, r.event_manipulation;
    END LOOP;
END $$;

-- Step 2: Drop ALL triggers (including hidden ones)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'alumni_profiles' 
          AND trigger_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.alumni_profiles CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Step 3: Drop common trigger functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.moddatetime() CASCADE;
DROP FUNCTION IF EXISTS extensions.moddatetime() CASCADE;

-- Step 4: Remove updated_at column completely
ALTER TABLE public.alumni_profiles DROP COLUMN IF EXISTS updated_at CASCADE;

-- Step 5: Verify everything is clean
DO $$
DECLARE
    trigger_count INTEGER;
    column_exists BOOLEAN;
BEGIN
    -- Check triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_table = 'alumni_profiles';
    
    -- Check column
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'alumni_profiles' 
        AND column_name = 'updated_at'
    ) INTO column_exists;
    
    IF trigger_count = 0 AND NOT column_exists THEN
        RAISE NOTICE '✅ SUCCESS! No triggers or updated_at column found.';
        RAISE NOTICE '✅ Your update should work now!';
    ELSE
        IF trigger_count > 0 THEN
            RAISE NOTICE '⚠️ WARNING: % trigger(s) still exist', trigger_count;
        END IF;
        IF column_exists THEN
            RAISE NOTICE '⚠️ WARNING: updated_at column still exists';
        END IF;
    END IF;
END $$;

-- Step 6: Show final state
SELECT 'Triggers remaining:' as check_type, COUNT(*)::text as count
FROM information_schema.triggers
WHERE event_object_table = 'alumni_profiles'
UNION ALL
SELECT 'updated_at column exists:' as check_type, 
       CASE WHEN EXISTS(
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'alumni_profiles' AND column_name = 'updated_at'
       ) THEN 'YES - PROBLEM!' ELSE 'NO - GOOD!' END as count;
