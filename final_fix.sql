-- 🔧 الإصلاح النهائي - إصلاح قراءة البيانات

-- 1. فحص RLS policies
SELECT 
  'RLS Policies Status' as check_type,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_subscriptions', 'projects', 'user_analyses')
ORDER BY tablename, policyname;

-- 2. فحص البيانات في الجداول
SELECT 
  'Data Status' as check_type,
  'profiles' as table_name,
  COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
  'Data Status' as check_type,
  'user_subscriptions' as table_name,
  COUNT(*) as record_count
FROM user_subscriptions
UNION ALL
SELECT 
  'Data Status' as check_type,
  'projects' as table_name,
  COUNT(*) as record_count
FROM projects
UNION ALL
SELECT 
  'Data Status' as check_type,
  'user_analyses' as table_name,
  COUNT(*) as record_count
FROM user_analyses;

-- 3. إنشاء RLS policy لجدول profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- 4. إنشاء RLS policy لجدول user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- 5. إنشاء RLS policy لجدول projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- 6. إنشاء RLS policy لجدول user_analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON user_analyses;
CREATE POLICY "Users can view own analyses" ON user_analyses
FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- 7. اختبار قراءة البيانات
SELECT 
  'Test Read Profiles' as check_type,
  COUNT(*) as profiles_count
FROM profiles
WHERE clerk_user_id = 'user_31NNkf8JH7UwCRP0JyjGtO14fIS';

SELECT 
  'Test Read Subscriptions' as check_type,
  COUNT(*) as subscriptions_count
FROM user_subscriptions
WHERE clerk_user_id = 'user_31NNkf8JH7UwCRP0JyjGtO14fIS';

-- 8. فحص النتيجة النهائية
SELECT 
  'Final Status' as check_type,
  'All fixes applied' as status,
  'Check the application now' as next_step;
