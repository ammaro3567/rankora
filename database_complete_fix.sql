-- 🔧 إصلاح شامل لقاعدة البيانات - Complete Database Fix
-- Run this in your Supabase SQL editor to fix all database issues

-- 1. إنشاء جميع الجداول المطلوبة
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  monthly_analysis_limit INTEGER NOT NULL,
  monthly_comparison_limit INTEGER NOT NULL,
  project_limit INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  plan_id BIGINT REFERENCES subscription_plans(id),
  paypal_subscription_id TEXT UNIQUE,
  paypal_order_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_history (
  id BIGSERIAL PRIMARY KEY,
  subscription_id BIGINT REFERENCES user_subscriptions(id),
  status TEXT NOT NULL,
  paypal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_analyses (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  analysis_results JSONB NOT NULL,
  project_id BIGINT REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_comparisons (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  user_url TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  comparison_results JSONB NOT NULL,
  project_id BIGINT REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء جميع الدوال المطلوبة
CREATE OR REPLACE FUNCTION set_clerk_user_id(clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.clerk_user_id', clerk_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. إنشاء دالة create_user_subscription
CREATE OR REPLACE FUNCTION create_user_subscription(
  p_clerk_user_id TEXT,
  p_plan_id BIGINT,
  p_paypal_subscription_id TEXT DEFAULT NULL,
  p_paypal_order_id TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_subscription_id BIGINT;
BEGIN
  -- التحقق من وجود المستخدم
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE clerk_user_id = p_clerk_user_id) THEN
    -- إنشاء ملف شخصي للمستخدم إذا لم يكن موجوداً
    INSERT INTO profiles (clerk_user_id, full_name) 
    VALUES (p_clerk_user_id, 'User') 
    ON CONFLICT (clerk_user_id) DO NOTHING;
  END IF;
  
  -- إنشاء الاشتراك
  INSERT INTO user_subscriptions (
    clerk_user_id, 
    plan_id, 
    paypal_subscription_id, 
    paypal_order_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    p_clerk_user_id, 
    p_plan_id, 
    p_paypal_subscription_id, 
    p_paypal_order_id,
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  ) RETURNING id INTO v_subscription_id;
  
  -- تسجيل إنشاء الاشتراك
  INSERT INTO subscription_history (subscription_id, status, paypal_data)
  VALUES (v_subscription_id, 'active', jsonb_build_object(
    'paypal_subscription_id', p_paypal_subscription_id,
    'paypal_order_id', p_paypal_order_id,
    'created_at', NOW()
  ));
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. إنشاء دالة get_user_subscription_info
CREATE OR REPLACE FUNCTION get_user_subscription_info(p_clerk_user_id TEXT)
RETURNS TABLE (
  subscription_id BIGINT,
  plan_name TEXT,
  plan_description TEXT,
  monthly_analysis_limit INTEGER,
  monthly_comparison_limit INTEGER,
  project_limit INTEGER,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.name,
    sp.description,
    sp.monthly_analysis_limit,
    sp.monthly_comparison_limit,
    sp.project_limit,
    us.status,
    us.current_period_end,
    sp.features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.clerk_user_id = p_clerk_user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. إنشاء دالة update_subscription_status
CREATE OR REPLACE FUNCTION update_subscription_status(
  p_subscription_id BIGINT,
  p_new_status TEXT,
  p_paypal_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- تحديث حالة الاشتراك
  UPDATE user_subscriptions 
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_subscription_id;
  
  -- تسجيل تغيير الحالة
  INSERT INTO subscription_history (subscription_id, status, paypal_data)
  VALUES (p_subscription_id, p_new_status, p_paypal_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. إنشاء دالة check_user_limits
CREATE OR REPLACE FUNCTION check_user_limits(p_clerk_user_id TEXT)
RETURNS TABLE (
  can_proceed BOOLEAN,
  remaining INTEGER,
  analysis_limit INTEGER,
  can_create_project BOOLEAN,
  project_remaining INTEGER,
  project_limit INTEGER
) AS $$
DECLARE
  v_plan_analysis_limit INTEGER;
  v_plan_comparison_limit INTEGER;
  v_plan_project_limit INTEGER;
  v_current_analyses INTEGER;
  v_current_comparisons INTEGER;
  v_current_projects INTEGER;
  v_subscription_status TEXT;
BEGIN
  -- الحصول على معلومات اشتراك المستخدم
  SELECT 
    sp.monthly_analysis_limit,
    sp.monthly_comparison_limit,
    sp.project_limit,
    us.status
  INTO 
    v_plan_analysis_limit,
    v_plan_comparison_limit,
    v_plan_project_limit,
    v_subscription_status
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.clerk_user_id = p_clerk_user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- إذا لم يكن هناك اشتراك، استخدم حدود الخطة المجانية
  IF v_plan_analysis_limit IS NULL THEN
    v_plan_analysis_limit := 5;
    v_plan_comparison_limit := 2;
    v_plan_project_limit := 1;
    v_subscription_status := 'free';
  END IF;
  
  -- عد الاستخدام الحالي لهذا الشهر
  SELECT COUNT(*) INTO v_current_analyses
  FROM user_analyses
  WHERE clerk_user_id = p_clerk_user_id
    AND created_at >= date_trunc('month', NOW());
  
  SELECT COUNT(*) INTO v_current_comparisons
  FROM competitor_comparisons
  WHERE clerk_user_id = p_clerk_user_id
    AND created_at >= date_trunc('month', NOW());
  
  SELECT COUNT(*) INTO v_current_projects
  FROM projects
  WHERE clerk_user_id = p_clerk_user_id;
  
  -- إرجاع النتائج
  RETURN QUERY SELECT
    CASE 
      WHEN v_plan_analysis_limit = -1 THEN true
      ELSE v_current_analyses < v_plan_analysis_limit
    END as can_proceed,
    CASE 
      WHEN v_plan_analysis_limit = -1 THEN -1
      ELSE GREATEST(0, v_plan_analysis_limit - v_current_analyses)
    END as remaining,
    v_plan_analysis_limit as analysis_limit,
    CASE 
      WHEN v_plan_project_limit = -1 THEN true
      ELSE v_current_projects < v_plan_project_limit
    END as can_create_project,
    CASE 
      WHEN v_plan_project_limit = -1 THEN -1
      ELSE GREATEST(0, v_plan_project_limit - v_current_projects)
    END as project_remaining,
    v_plan_project_limit as project_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. إنشاء دالة create_analysis_with_limit_check
CREATE OR REPLACE FUNCTION create_analysis_with_limit_check(
  p_clerk_user_id TEXT,
  p_url TEXT,
  p_analysis_results JSONB,
  p_project_id BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_analysis_id BIGINT;
  v_can_proceed BOOLEAN;
BEGIN
  -- التحقق من أن المستخدم يمكنه إنشاء تحليل
  SELECT can_proceed INTO v_can_proceed
  FROM check_user_limits(p_clerk_user_id);
  
  IF NOT v_can_proceed THEN
    RAISE EXCEPTION 'Monthly analysis limit exceeded';
  END IF;
  
  -- إنشاء التحليل
  INSERT INTO user_analyses (
    clerk_user_id,
    url,
    analysis_results,
    project_id
  ) VALUES (
    p_clerk_user_id,
    p_url,
    p_analysis_results,
    p_project_id
  ) RETURNING id INTO v_analysis_id;
  
  RETURN v_analysis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. إنشاء دالة create_project_with_limit_check
CREATE OR REPLACE FUNCTION create_project_with_limit_check(
  p_clerk_user_id TEXT,
  p_name TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_project_id BIGINT;
  v_can_create BOOLEAN;
BEGIN
  -- التحقق من أن المستخدم يمكنه إنشاء مشروع
  SELECT can_create_project INTO v_can_create
  FROM check_user_limits(p_clerk_user_id);
  
  IF NOT v_can_create THEN
    RAISE EXCEPTION 'Project limit exceeded';
  END IF;
  
  -- إنشاء المشروع
  INSERT INTO projects (
    clerk_user_id,
    name,
    description
  ) VALUES (
    p_clerk_user_id,
    p_name,
    p_description
  ) RETURNING id INTO v_project_id;
  
  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. إنشاء دالة get_monthly_usage
CREATE OR REPLACE FUNCTION get_monthly_usage(p_clerk_user_id TEXT)
RETURNS TABLE (
  total_analyses INTEGER,
  total_comparisons INTEGER,
  total_projects INTEGER
) AS $$
BEGIN
  RETURN QUERY SELECT
    COALESCE(COUNT(ua.id), 0) as total_analyses,
    COALESCE(COUNT(cc.id), 0) as total_comparisons,
    COALESCE(COUNT(p.id), 0) as total_projects
  FROM profiles prof
  LEFT JOIN user_analyses ua ON prof.clerk_user_id = ua.clerk_user_id 
    AND ua.created_at >= date_trunc('month', NOW())
  LEFT JOIN competitor_comparisons cc ON prof.clerk_user_id = cc.clerk_user_id 
    AND cc.created_at >= date_trunc('month', NOW())
  LEFT JOIN projects p ON prof.clerk_user_id = p.clerk_user_id
  WHERE prof.clerk_user_id = p_clerk_user_id
  GROUP BY prof.clerk_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. إنشاء دالة list_user_projects
CREATE OR REPLACE FUNCTION list_user_projects(p_clerk_user_id TEXT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.created_at
  FROM projects p
  WHERE p.clerk_user_id = p_clerk_user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. إنشاء دالة get_project_analyses
CREATE OR REPLACE FUNCTION get_project_analyses(p_project_id BIGINT, p_clerk_user_id TEXT)
RETURNS TABLE (
  id BIGINT,
  url TEXT,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.url,
    ua.analysis_results,
    ua.created_at
  FROM user_analyses ua
  JOIN projects p ON ua.project_id = p.id
  WHERE p.id = p_project_id 
    AND p.clerk_user_id = p_clerk_user_id
  ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. إنشاء دالة delete_user_project
CREATE OR REPLACE FUNCTION delete_user_project(p_project_id BIGINT, p_clerk_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- حذف المشروع (سيتم حذف التحليلات المرتبطة به تلقائياً)
  DELETE FROM projects 
  WHERE id = p_project_id 
    AND clerk_user_id = p_clerk_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. إنشاء triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 14. إضافة RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_comparisons ENABLE ROW LEVEL SECURITY;

-- 15. إنشاء RLS policies
DROP POLICY IF EXISTS "Users can view and update their own profile" ON profiles;
CREATE POLICY "Users can view and update their own profile" ON profiles
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

DROP POLICY IF EXISTS "Users can view their subscription history" ON subscription_history;
CREATE POLICY "Users can view their subscription history" ON subscription_history
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM user_subscriptions 
      WHERE clerk_user_id = current_setting('app.clerk_user_id', true)::text
    )
  );

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

DROP POLICY IF EXISTS "Users can view their own analyses" ON user_analyses;
CREATE POLICY "Users can view their own analyses" ON user_analyses
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

DROP POLICY IF EXISTS "Users can view their own comparisons" ON competitor_comparisons;
CREATE POLICY "Users can view their own comparisons" ON competitor_comparisons
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- 16. منح الصلاحيات المطلوبة
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 17. إدراج الخطط الافتراضية
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, monthly_analysis_limit, monthly_comparison_limit, project_limit, features) 
VALUES
('Free', 'Basic plan for getting started', 0.00, 0.00, 5, 2, 1, '{"export_formats": ["JSON"], "api_access": false, "priority_support": false}'),
('Starter', 'Perfect for small businesses', 10.00, 100.00, 30, 10, 5, '{"export_formats": ["JSON", "CSV"], "api_access": false, "priority_support": false}'),
('Pro', 'For growing businesses', 30.00, 300.00, 100, 50, 20, '{"export_formats": ["JSON", "CSV", "PDF"], "api_access": true, "priority_support": true}'),
('Business', 'Enterprise-grade solution', 70.00, 700.00, 300, 150, 100, '{"export_formats": ["JSON", "CSV", "PDF", "XLSX"], "api_access": true, "priority_support": true, "white_label": true, "team_management": true}')
ON CONFLICT (name) DO NOTHING;

-- 18. إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_clerk_user_id ON user_subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_projects_clerk_user_id ON projects(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_clerk_user_id ON user_analyses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_created_at ON user_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_clerk_user_id ON competitor_comparisons(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_created_at ON competitor_comparisons(created_at);

-- 19. التحقق من إنشاء كل شيء بنجاح
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ All functions created';
  RAISE NOTICE '✅ All policies applied';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ Default plans inserted';
END $$;
