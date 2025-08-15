-- Database fixes for Clerk integration
-- Run this in your Supabase SQL editor

-- 1. Fix stripe_user_subscriptions table - add clerk_user_id column
ALTER TABLE stripe_user_subscriptions 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- 2. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create competitor_comparisons table if it doesn't exist
CREATE TABLE IF NOT EXISTS competitor_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  user_url TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  comparison_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_analyses table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_clerk_user_id ON competitor_comparisons(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_clerk_user_id ON user_analyses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_clerk_user_id ON projects(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_user_subscriptions_clerk_user_id ON stripe_user_subscriptions(clerk_user_id);

-- 7. Enable Row Level Security (RLS) - temporarily disabled during transition
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competitor_comparisons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies (commented out during transition)
/*
-- Profiles policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (clerk_user_id = current_setting('clerk_user_id', true));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (clerk_user_id = current_setting('clerk_user_id', true));

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (clerk_user_id = current_setting('clerk_user_id', true));

-- Competitor comparisons policy
CREATE POLICY "Users can view own comparisons" ON competitor_comparisons
  FOR SELECT USING (clerk_user_id = current_setting('clerk_user_id', true));

CREATE POLICY "Users can insert own comparisons" ON competitor_comparisons
  FOR INSERT WITH CHECK (clerk_user_id = current_setting('clerk_user_id', true));

-- User analyses policy
CREATE POLICY "Users can view own analyses" ON user_analyses
  FOR SELECT USING (clerk_user_id = current_setting('clerk_user_id', true));

CREATE POLICY "Users can insert own analyses" ON user_analyses
  FOR INSERT WITH CHECK (clerk_user_id = current_setting('clerk_user_id', true));

-- Projects policy
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (clerk_user_id = current_setting('clerk_user_id', true));

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (clerk_user_id = current_setting('clerk_user_id', true));
*/

-- 9. Update existing data if needed (if you have old user_id columns)
-- UPDATE stripe_user_subscriptions SET clerk_user_id = user_id WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;
-- UPDATE profiles SET clerk_user_id = user_id WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;
-- UPDATE competitor_comparisons SET clerk_user_id = user_id WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;
-- UPDATE user_analyses SET clerk_user_id = user_id WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;
-- UPDATE projects SET clerk_user_id = user_id WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;

-- 10. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON competitor_comparisons TO authenticated;
GRANT ALL ON user_analyses TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON stripe_user_subscriptions TO authenticated;
