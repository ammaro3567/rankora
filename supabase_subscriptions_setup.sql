-- =====================================================
-- PayPal Subscriptions Setup for Rankora AI
-- =====================================================

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    paypal_subscription_id TEXT UNIQUE NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for secure access
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON public.subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON public.subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant necessary permissions
GRANT ALL ON public.subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE public.subscriptions_id_seq TO authenticated;

-- 8. Create function to get user subscription info
CREATE OR REPLACE FUNCTION get_user_subscription_info_for(p_clerk_user_id text)
RETURNS TABLE(
    status text,
    plan_name text,
    monthly_analysis_limit integer,
    project_limit integer,
    monthly_comparison_limit integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(s.status, 'inactive')::text,
        COALESCE(s.plan_name, 'Free')::text,
        CASE 
            WHEN s.plan_name = 'Starter' THEN 30
            WHEN s.plan_name = 'Pro' THEN 100
            WHEN s.plan_name = 'Business' THEN 300
            ELSE 2  -- Free plan default
        END::integer as monthly_analysis_limit,
        CASE 
            WHEN s.plan_name = 'Starter' THEN 5
            WHEN s.plan_name = 'Pro' THEN 20
            WHEN s.plan_name = 'Business' THEN 100
            ELSE 1  -- Free plan default
        END::integer as project_limit,
        CASE 
            WHEN s.plan_name = 'Starter' THEN 10
            WHEN s.plan_name = 'Pro' THEN 50
            WHEN s.plan_name = 'Business' THEN 150
            ELSE 2  -- Free plan default
        END::integer as monthly_comparison_limit
    FROM public.subscriptions s
    WHERE s.clerk_user_id = p_clerk_user_id 
    AND s.status = 'ACTIVE'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no active subscription found, return Free plan defaults
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            'inactive'::text,
            'Free'::text,
            2::integer,  -- Free plan: 2 analyses
            1::integer,  -- Free plan: 1 project
            2::integer;  -- Free plan: 2 comparisons
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_subscription_info_for(text) TO authenticated;

-- 10. Create function to check if user can create subscription
CREATE OR REPLACE FUNCTION can_create_subscription(p_clerk_user_id text)
RETURNS boolean AS $$
DECLARE
    active_subscription_count integer;
BEGIN
    SELECT COUNT(*) INTO active_subscription_count
    FROM public.subscriptions
    WHERE clerk_user_id = p_clerk_user_id 
    AND status = 'ACTIVE';
    
    RETURN active_subscription_count = 0; -- Only one active subscription allowed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant execute permission
GRANT EXECUTE ON FUNCTION can_create_subscription(text) TO authenticated;

-- =====================================================
-- Test Data (Optional - for development)
-- =====================================================

-- Uncomment these lines to insert test data
/*
INSERT INTO public.subscriptions (clerk_user_id, paypal_subscription_id, plan_name, status) 
VALUES 
    ('test_user_1', 'P-TEST123456789', 'Starter', 'ACTIVE'),
    ('test_user_2', 'P-TEST987654321', 'Pro', 'ACTIVE')
ON CONFLICT (paypal_subscription_id) DO NOTHING;
*/

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if table was created
-- SELECT * FROM information_schema.tables WHERE table_name = 'subscriptions';

-- Check if policies were created
-- SELECT * FROM pg_policies WHERE tablename = 'subscriptions';

-- Check if functions were created
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%subscription%';

-- Test the subscription function
-- SELECT * FROM get_user_subscription_info_for('test_user_1');
