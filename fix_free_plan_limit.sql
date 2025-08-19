-- 🔧 إصلاح Free Plan limit ليكون 2 تحليلات فقط

-- 1. تحديث Free Plan limit
UPDATE subscription_plans 
SET monthly_analysis_limit = 2,
    monthly_comparison_limit = 2,
    project_limit = 1
WHERE name = 'Free';

-- 2. فحص النتيجة
SELECT 
  'Free Plan Updated' as check_type,
  name,
  monthly_analysis_limit,
  monthly_comparison_limit,
  project_limit
FROM subscription_plans 
WHERE name = 'Free';

-- 3. فحص جميع الخطط
SELECT 
  'All Plans' as check_type,
  name,
  monthly_analysis_limit,
  monthly_comparison_limit,
  project_limit,
  price_monthly
FROM subscription_plans 
ORDER BY price_monthly;
