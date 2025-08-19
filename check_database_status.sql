-- التحقق الشامل من حالة قاعدة البيانات

-- 1. التحقق من الدوال
\echo '🔍 التحقق من الدوال المطلوبة:'
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'set_clerk_user_id', 
    'get_user_subscription_info', 
    'get_monthly_usage_counts',
    'check_user_limits',
    'create_project_with_limit_check'
);

-- 2. التحقق من هيكل الجداول
\echo '\n🗃️ هيكل الجداول:'
\d projects;
\d user_analyses;
\d user_subscriptions;
\d profiles;

-- 3. التحقق من سياسات RLS
\echo '\n🔒 سياسات RLS:'
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies
WHERE schemaname = 'public';

-- 4. فحص عدد السجلات
\echo '\n📊 عدد السجلات في الجداول:'
SELECT 
    'projects' AS table_name, COUNT(*) AS record_count 
FROM projects
UNION ALL
SELECT 
    'user_analyses', COUNT(*) 
FROM user_analyses
UNION ALL
SELECT 
    'user_subscriptions', COUNT(*) 
FROM user_subscriptions
UNION ALL
SELECT 
    'profiles', COUNT(*) 
FROM profiles;

-- 5. التحقق من العلاقات والقيود
\echo '\n🔗 العلاقات والقيود:'
SELECT 
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';

-- 6. فحص أنواع البيانات للأعمدة الحساسة
\echo '\n📝 أنواع البيانات للأعمدة الحساسة:'
SELECT 
    table_name, 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND column_name IN (
        'clerk_user_id', 
        'user_id', 
        'email', 
        'monthly_analysis_limit', 
        'monthly_comparison_limit'
    );
