# Supabase Setup - Step by Step Screenshots Guide

## Location: Supabase Dashboard

### STEP 1: Open SQL Editor

```
Supabase Dashboard
├── Left Sidebar
│   ├── Project Settings
│   ├── Database
│   ├── SQL Editor ← CLICK HERE
│   ├── Table Editor
│   └── ...
```

### STEP 2: Create New Query

```
SQL Editor Page
├── Top of Page: Click "New Query" button
│   This opens a new SQL editor window
```

### STEP 3: Copy & Paste SQL

**Copy this entire text:**

```sql
-- =====================================================================
-- NEXT STEP: Setup for Signup and Auth
-- =====================================================================

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

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);
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

CREATE INDEX IF NOT EXISTS idx_alumni_user_id ON public.alumni_data(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_student_number ON public.alumni_data(student_number);
CREATE INDEX IF NOT EXISTS idx_alumni_degree ON public.alumni_data(degree);
CREATE INDEX IF NOT EXISTS idx_alumni_job_status ON public.alumni_data(job_status);

ALTER TABLE public.alumni_data ENABLE ROW LEVEL SECURITY;

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
-- FUNCTION: Handle new user signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- Grant permissions
-- =====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni_data TO anon, authenticated;

-- =====================================================================
-- VIEW: User profile
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
```

### STEP 4: Paste into SQL Editor

```
1. Click in the SQL editor area
2. Paste the SQL code (Ctrl+V or Cmd+V)
3. You should see all the SQL code in the editor
```

### STEP 5: Run the Query

```
Button Location: Top right of SQL editor
├── "Run" button (or Ctrl+Enter / Cmd+Enter)
└── Click this button to execute
```

### STEP 6: Wait for Success

```
Expected Result:
├── Green checkmark ✅ at bottom
├── Message: "Success"
└── Takes 2-5 seconds to complete
```

### STEP 7: Verify Tables Created

```
After success:
1. Click "Table Editor" in left sidebar
2. You should see:
   ✅ public.users
   ✅ public.alumni_data
   ✅ public.user_profiles (as a view)
```

---

## Verification Checklist

- [ ] SQL query executed without errors
- [ ] Green ✅ checkmark appeared
- [ ] `users` table visible in Table Editor
- [ ] `alumni_data` table visible in Table Editor
- [ ] Can go to test-supabase.html and click "Test Connection" → Success
- [ ] Can create new account at signup.html
- [ ] Can login at login.html

---

## Common Issues

### ❌ "Error: Already exists"
**Solution**: This is normal if you're re-running the SQL. The `IF NOT EXISTS` prevents errors.
- Just click Run again
- Or delete old tables first and re-run

### ❌ "Error: Permission denied"
**Solution**: Make sure you're using the SQL Editor, not the actual database console
- Use Supabase Dashboard SQL Editor only

### ❌ Tables don't appear in Table Editor
**Solution**: Refresh the page or click Table Editor menu again
- Sometimes needs a refresh to show new tables

### ✅ All working? Continue with:
1. Go to http://localhost:8000/test-supabase.html
2. Click "Test Connection" - should be green ✅
3. Go to http://localhost:8000/signup.html and create an account
4. Go to http://localhost:8000/login.html and login

---

Done! Your database is now ready! 🎉
