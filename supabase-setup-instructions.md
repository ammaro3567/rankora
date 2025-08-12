# Supabase Setup Instructions

## Required SQL Commands

Run these SQL commands in your Supabase SQL Editor to ensure everything works properly:

### 1. Database Tables (if not already created)

```sql
-- User Analyses Table
CREATE TABLE IF NOT EXISTS user_analyses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  url text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- User Comparisons Table  
CREATE TABLE IF NOT EXISTS user_comparisons (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  user_url text NOT NULL,
  competitor_url text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  full_name text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Project Analyses Table
CREATE TABLE IF NOT EXISTS project_analyses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  project_id bigint REFERENCES projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Stripe Customers Table (for PayPal compatibility)
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Stripe Subscriptions Table (for PayPal compatibility)
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text REFERENCES stripe_customers(customer_id),
  subscription_id text UNIQUE NOT NULL,
  price_id text,
  status text NOT NULL,
  current_period_start int8,
  current_period_end int8,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  payment_method_brand text,
  payment_method_last4 text
);
```

### 2. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- User Analyses policies
CREATE POLICY "Users can manage their own analyses" ON user_analyses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Comparisons policies
CREATE POLICY "Users can manage their own comparisons" ON user_comparisons
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project Analyses policies
CREATE POLICY "Users can manage their own project analyses" ON project_analyses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Stripe Customers policies
CREATE POLICY "Users can access their own customer data" ON stripe_customers
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Stripe Subscriptions policies (accessible through customer relationship)
CREATE POLICY "Users can access their own subscriptions" ON stripe_subscriptions
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );
```

### 3. Required Environment Variables

Make sure you have these in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_WEBHOOK_ANALYZE_URL=your_analyze_webhook_url
VITE_WEBHOOK_COMPARE_URL=your_compare_webhook_url
VITE_OWNER_EMAIL=your_email@example.com
```

### 4. PayPal Webhook Setup

1. Deploy the PayPal webhook function to Supabase Edge Functions
2. Set up PayPal Hosted Buttons to call your webhook URL
3. Ensure the webhook URL is: `https://your-project.supabase.co/functions/v1/paypal-webhook`

## Verification Steps

1. Check that all tables exist in your Supabase dashboard
2. Verify RLS policies are active
3. Test user registration and login
4. Test PayPal payment flow
5. Verify usage limits work correctly
6. Test project creation and limits

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify your environment variables
3. Ensure all SQL commands ran successfully
4. Check Supabase logs for database errors
5. Verify PayPal webhook is receiving requests

Your website should now be fully functional and ready for production!
