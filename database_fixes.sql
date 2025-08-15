-- Database fixes for Clerk integration
-- Run this in your Supabase SQL editor
-- This script updates existing tables to work with Clerk

-- 1. Check current table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'competitor_comparisons', 'user_analyses', 'projects', 'stripe_user_subscriptions')
  AND column_name IN ('clerk_user_id', 'user_id')
ORDER BY table_name, column_name;

-- 2. Update existing NULL values in profiles table
-- For now, we'll set a temporary value for existing records
UPDATE profiles 
SET clerk_user_id = 'legacy_user_' || id::text 
WHERE clerk_user_id IS NULL;

-- 3. Update existing NULL values in competitor_comparisons table
UPDATE competitor_comparisons 
SET clerk_user_id = 'legacy_user_' || id::text 
WHERE clerk_user_id IS NULL;

-- 4. Update existing NULL values in user_analyses table
UPDATE user_analyses 
SET clerk_user_id = 'legacy_user_' || id::text 
WHERE clerk_user_id IS NULL;

-- 5. Update existing NULL values in projects table
UPDATE projects 
SET clerk_user_id = 'legacy_user_' || id::text 
WHERE clerk_user_id IS NULL;

-- 6. Update existing NULL values in stripe_user_subscriptions table
UPDATE stripe_user_subscriptions 
SET clerk_user_id = 'legacy_user_' || id::text 
WHERE clerk_user_id IS NULL;

-- 7. Now make clerk_user_id NOT NULL
ALTER TABLE profiles ALTER COLUMN clerk_user_id SET NOT NULL;
ALTER TABLE competitor_comparisons ALTER COLUMN clerk_user_id SET NOT NULL;
ALTER TABLE user_analyses ALTER COLUMN clerk_user_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN clerk_user_id SET NOT NULL;
ALTER TABLE stripe_user_subscriptions ALTER COLUMN clerk_user_id SET NOT NULL;

-- 8. Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_clerk_user_id ON competitor_comparisons(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_clerk_user_id ON user_analyses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_clerk_user_id ON projects(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_user_subscriptions_clerk_user_id ON stripe_user_subscriptions(clerk_user_id);

-- 9. Grant necessary permissions (if not already granted)
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON competitor_comparisons TO authenticated;
GRANT ALL ON user_analyses TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON stripe_user_subscriptions TO authenticated;

-- 10. Verify the final structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'competitor_comparisons', 'user_analyses', 'projects', 'stripe_user_subscriptions')
  AND column_name = 'clerk_user_id'
ORDER BY table_name;

-- 11. Show sample data to verify (separate queries to avoid syntax issues)
SELECT 'profiles' as table_name, clerk_user_id FROM profiles LIMIT 3;

SELECT 'competitor_comparisons' as table_name, clerk_user_id FROM competitor_comparisons LIMIT 3;

SELECT 'user_analyses' as table_name, clerk_user_id FROM user_analyses LIMIT 3;

SELECT 'projects' as table_name, clerk_user_id FROM projects LIMIT 3;

SELECT 'stripe_user_subscriptions' as table_name, clerk_user_id FROM stripe_user_subscriptions LIMIT 3;
