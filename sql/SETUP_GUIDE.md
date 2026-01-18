# NEXT STEP - Database Setup Instructions

## Quick Setup Steps

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com and login to your project
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Setup SQL Script
1. Copy the contents of `sql/setup_signup_auth.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)
4. Wait for the query to complete (should show green checkmark)

### Step 3: Verify Tables Created
1. Go to **Table Editor** in the sidebar
2. You should see these tables:
   - `public.users` - Main user accounts
   - `public.alumni_data` - Alumni profile information
   - `public.user_profiles` - View combining users + alumni data

### Step 4: Test the Application
1. Open http://localhost:8000/signup.html
2. Try creating a new account
3. You should be able to signup and login

## What Changed?

### New SQL File: `setup_signup_auth.sql`
This replaces the older `alumni_and_signup.sql` with a simpler, more reliable setup:

- **Users Table**: Stores user accounts (connected to Supabase Auth)
- **Alumni Data Table**: Stores alumni-specific information
- **Automatic User Creation**: When someone signs up via Supabase Auth, a user record is automatically created
- **RLS Policies**: Proper row-level security so users can only see/edit their own data

### Why This Works Better
1. Uses Supabase's built-in Auth system (much more reliable)
2. Automatically creates user records on signup
3. Simpler table structure
4. Better security with RLS policies
5. Easier to maintain and extend

## Troubleshooting

### "Service not ready" Error
- Wait 5-10 seconds for the page to fully load
- Check browser console (F12) for any red errors
- Make sure Supabase credentials are correct in `supabase-client.js`

### Cannot Create Account
1. Check that the `users` table exists in Supabase
2. Check browser console for detailed error messages
3. Make sure password meets requirements:
   - At least 8 characters
   - 1 uppercase letter (A-Z)
   - 1 lowercase letter (a-z)
   - 1 number (0-9)
   - 1 symbol (!@#$%...)

### Cannot Login
1. Make sure you created the account first via signup
2. Check that email and password are correct
3. Check Supabase Auth logs for any issues

## Support
For issues, check the browser console (F12) for detailed error messages. These will help identify what's happening.
