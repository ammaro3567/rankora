-- Complete Database Setup for Rankora AI Analysis System
-- This script creates all necessary tables, functions, and RLS policies

-- 1. Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS create_user_subscription(TEXT, BIGINT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_subscription_status(BIGINT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS get_user_subscription_info(TEXT) CASCADE;
DROP FUNCTION IF EXISTS check_user_limits(TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_analysis_with_limit_check(TEXT, TEXT, JSONB, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS create_project_with_limit_check(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_clerk_user_id(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 2. Drop existing tables if they exist
DROP TABLE IF EXISTS user_analyses CASCADE;
DROP TABLE IF EXISTS competitor_comparisons CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_analyses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS subscription_history CASCADE;

-- 3. Create core tables
CREATE TABLE profiles (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE subscription_history (
  id BIGSERIAL PRIMARY KEY,
  subscription_id BIGINT REFERENCES user_subscriptions(id),
  status TEXT NOT NULL,
  paypal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_analyses (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  analysis_results JSONB NOT NULL,
  project_id BIGINT REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE competitor_comparisons (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  user_url TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  comparison_results JSONB NOT NULL,
  project_id BIGINT REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX idx_user_subscriptions_clerk_user_id ON user_subscriptions(clerk_user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_projects_clerk_user_id ON projects(clerk_user_id);
CREATE INDEX idx_user_analyses_clerk_user_id ON user_analyses(clerk_user_id);
CREATE INDEX idx_user_analyses_created_at ON user_analyses(created_at);
CREATE INDEX idx_competitor_comparisons_clerk_user_id ON competitor_comparisons(clerk_user_id);
CREATE INDEX idx_competitor_comparisons_created_at ON competitor_comparisons(created_at);

-- 5. Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, monthly_analysis_limit, monthly_comparison_limit, project_limit, features) VALUES
('Free', 'Basic plan for getting started', 0.00, 0.00, 5, 2, 1, '{"export_formats": ["JSON"], "api_access": false, "priority_support": false}'),
('Starter', 'Perfect for small businesses', 29.99, 299.99, 50, 20, 10, '{"export_formats": ["JSON", "CSV"], "api_access": false, "priority_support": false}'),
('Pro', 'For growing businesses', 79.99, 799.99, 200, 100, 50, '{"export_formats": ["JSON", "CSV", "PDF"], "api_access": true, "priority_support": true}'),
('Business', 'Enterprise-grade solution', 199.99, 1999.99, -1, -1, -1, '{"export_formats": ["JSON", "CSV", "PDF", "XLSX"], "api_access": true, "priority_support": true, "white_label": true, "team_management": true}');

-- 6. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_comparisons ENABLE ROW LEVEL SECURITY;

-- 7. Create function to set Clerk user ID for RLS
CREATE OR REPLACE FUNCTION set_clerk_user_id(clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.clerk_user_id', clerk_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create RLS policies
-- Profiles policy
CREATE POLICY "Users can view and update their own profile" ON profiles
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- Subscription plans policy (read-only for all authenticated users)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- User subscriptions policy
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- Subscription history policy
CREATE POLICY "Users can view their subscription history" ON subscription_history
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM user_subscriptions 
      WHERE clerk_user_id = current_setting('app.clerk_user_id', true)::text
    )
  );

-- Projects policy
CREATE POLICY "Users can view their own projects" ON projects
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- User analyses policy
CREATE POLICY "Users can view their own analyses" ON user_analyses
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- Competitor comparisons policy
CREATE POLICY "Users can view their own comparisons" ON competitor_comparisons
  FOR ALL USING (clerk_user_id = current_setting('app.clerk_user_id', true)::text);

-- 9. Create RPC functions for subscription management
CREATE OR REPLACE FUNCTION create_user_subscription(
  p_clerk_user_id TEXT,
  p_plan_id BIGINT,
  p_paypal_subscription_id TEXT,
  p_paypal_order_id TEXT
)
RETURNS BIGINT AS $$
DECLARE
  v_subscription_id BIGINT;
BEGIN
  -- Set Clerk user ID for RLS
  PERFORM set_clerk_user_id(p_clerk_user_id);
  
  -- Create subscription
  INSERT INTO user_subscriptions (
    clerk_user_id, 
    plan_id, 
    paypal_subscription_id, 
    paypal_order_id,
    current_period_end
  ) VALUES (
    p_clerk_user_id, 
    p_plan_id, 
    p_paypal_subscription_id, 
    p_paypal_order_id,
    NOW() + INTERVAL '1 month'
  ) RETURNING id INTO v_subscription_id;
  
  -- Log subscription creation
  INSERT INTO subscription_history (subscription_id, status, paypal_data)
  VALUES (v_subscription_id, 'active', jsonb_build_object('paypal_subscription_id', p_paypal_subscription_id));
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_subscription_status(
  p_subscription_id BIGINT,
  p_new_status TEXT,
  p_paypal_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update subscription status
  UPDATE user_subscriptions 
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_subscription_id;
  
  -- Log status change
  INSERT INTO subscription_history (subscription_id, status, paypal_data)
  VALUES (p_subscription_id, p_new_status, p_paypal_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  -- Set Clerk user ID for RLS
  PERFORM set_clerk_user_id(p_clerk_user_id);
  
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
  -- Set Clerk user ID for RLS
  PERFORM set_clerk_user_id(p_clerk_user_id);
  
  -- Get user's subscription info
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
  
  -- If no subscription, use free plan limits
  IF v_plan_analysis_limit IS NULL THEN
    v_plan_analysis_limit := 5;
    v_plan_comparison_limit := 2;
    v_plan_project_limit := 1;
    v_subscription_status := 'free';
  END IF;
  
  -- Count current month usage
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
  
  -- Return results
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
  -- Set Clerk user ID for RLS
  PERFORM set_clerk_user_id(p_clerk_user_id);
  
  -- Check if user can create analysis
  SELECT can_proceed INTO v_can_proceed
  FROM check_user_limits(p_clerk_user_id);
  
  IF NOT v_can_proceed THEN
    RAISE EXCEPTION 'Monthly analysis limit exceeded';
  END IF;
  
  -- Create analysis
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
  -- Set Clerk user ID for RLS
  PERFORM set_clerk_user_id(p_clerk_user_id);
  
  -- Check if user can create project
  SELECT can_create_project INTO v_can_create
  FROM check_user_limits(p_clerk_user_id);
  
  IF NOT v_can_create THEN
    RAISE EXCEPTION 'Project limit exceeded';
  END IF;
  
  -- Create project
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

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 11. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Final verification
SELECT 'Database setup completed successfully!' as status;
