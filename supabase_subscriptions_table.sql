-- Create subscriptions table for PayPal subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    paypal_subscription_id TEXT UNIQUE NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON public.subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON public.subscriptions(paypal_subscription_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.subscriptions TO authenticated;
GRANT USAGE ON SEQUENCE public.subscriptions_id_seq TO authenticated;
