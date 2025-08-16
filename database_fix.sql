-- Database Fix for Rankora - إصلاح قاعدة البيانات
-- Run this in your Supabase SQL editor

-- 1. إنشاء دالة create_user_subscription إذا لم تكن موجودة
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

-- 2. إنشاء دالة get_user_subscription_info إذا لم تكن موجودة
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

-- 3. إنشاء دالة update_subscription_status إذا لم تكن موجودة
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

-- 4. إنشاء دالة check_user_limits إذا لم تكن موجودة
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

-- 5. إنشاء دالة set_clerk_user_id إذا لم تكن موجودة
CREATE OR REPLACE FUNCTION set_clerk_user_id(clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.clerk_user_id', clerk_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. إنشاء دالة update_updated_at_column إذا لم تكن موجودة
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. إنشاء triggers لتحديث updated_at
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

-- 8. إضافة RLS policies إذا لم تكن موجودة
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_comparisons ENABLE ROW LEVEL SECURITY;

-- 9. إنشاء RLS policies
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

-- 10. منح الصلاحيات المطلوبة
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 11. إدراج الخطط الافتراضية إذا لم تكن موجودة
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, monthly_analysis_limit, monthly_comparison_limit, project_limit, features) 
VALUES
('Free', 'Basic plan for getting started', 0.00, 0.00, 5, 2, 1, '{"export_formats": ["JSON"], "api_access": false, "priority_support": false}'),
('Starter', 'Perfect for small businesses', 10.00, 100.00, 30, 10, 5, '{"export_formats": ["JSON", "CSV"], "api_access": false, "priority_support": false}'),
('Pro', 'For growing businesses', 30.00, 300.00, 100, 50, 20, '{"export_formats": ["JSON", "CSV", "PDF"], "api_access": true, "priority_support": true}'),
('Business', 'Enterprise-grade solution', 70.00, 700.00, 300, 150, 100, '{"export_formats": ["JSON", "CSV", "PDF", "XLSX"], "api_access": true, "priority_support": true, "white_label": true, "team_management": true}')
ON CONFLICT (name) DO NOTHING;

-- 12. إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_clerk_user_id ON user_subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_projects_clerk_user_id ON projects(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_clerk_user_id ON user_analyses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_created_at ON user_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_clerk_user_id ON competitor_comparisons(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_created_at ON competitor_comparisons(created_at);

-- 13. التحقق من أن الجداول موجودة
DO $$
BEGIN
  -- إنشاء جدول profiles إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT UNIQUE NOT NULL,
      full_name TEXT,
      company TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  -- إنشاء جدول subscription_plans إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
    CREATE TABLE subscription_plans (
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
  END IF;

  -- إنشاء جدول user_subscriptions إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
    CREATE TABLE user_subscriptions (
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
  END IF;

  -- إنشاء جدول subscription_history إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_history') THEN
    CREATE TABLE subscription_history (
      id BIGSERIAL PRIMARY KEY,
      subscription_id BIGINT REFERENCES user_subscriptions(id),
      status TEXT NOT NULL,
      paypal_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  -- إنشاء جدول projects إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    CREATE TABLE projects (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  -- إنشاء جدول user_analyses إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_analyses') THEN
    CREATE TABLE user_analyses (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      url TEXT NOT NULL,
      analysis_results JSONB NOT NULL,
      project_id BIGINT REFERENCES projects(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  -- إنشاء جدول competitor_comparisons إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitor_comparisons') THEN
    CREATE TABLE competitor_comparisons (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      user_url TEXT NOT NULL,
      competitor_url TEXT NOT NULL,
      comparison_results JSONB NOT NULL,
      project_id BIGINT REFERENCES projects(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

PRINT 'Database setup completed successfully! ✅';
