/*
  # PayPal Integration Schema

  1. New Tables
    - `stripe_customers` -> Renamed to handle PayPal customer data
    - `stripe_subscriptions` -> Renamed to handle PayPal subscription data  
    - `stripe_orders` -> Renamed to handle PayPal order data
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    
  3. Views
    - Create user-friendly views for subscription and order data
*/

-- Create customers table (renamed from stripe_customers)
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create subscriptions table (renamed from stripe_subscriptions)
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text UNIQUE NOT NULL,
  subscription_id text,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create orders table (renamed from stripe_orders)
CREATE TABLE IF NOT EXISTS stripe_orders (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status stripe_order_status DEFAULT 'pending'::stripe_order_status,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

-- Create policies for orders
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

-- Create user-friendly views
CREATE OR REPLACE VIEW stripe_user_subscriptions
WITH (security_definer = true)
AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.user_id = auth.uid() 
  AND sc.deleted_at IS NULL 
  AND (ss.deleted_at IS NULL OR ss.deleted_at IS NULL);

CREATE OR REPLACE VIEW stripe_user_orders
WITH (security_definer = true)
AS
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date
FROM stripe_customers sc
LEFT JOIN stripe_orders so ON sc.customer_id = so.customer_id
WHERE sc.user_id = auth.uid() 
  AND sc.deleted_at IS NULL 
  AND (so.deleted_at IS NULL OR so.deleted_at IS NULL);

-- User analyses table
CREATE TABLE IF NOT EXISTS user_analyses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  url text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses" ON user_analyses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own analyses" ON user_analyses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Comparisons table
CREATE TABLE IF NOT EXISTS user_comparisons (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  user_url text NOT NULL,
  competitor_url text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE user_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comparisons" ON user_comparisons
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own comparisons" ON user_comparisons
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text DEFAULT NULL,
  company text DEFAULT NULL,
  timezone text DEFAULT 'UTC',
  notifications jsonb DEFAULT jsonb_build_object(
    'email', true,
    'push', false,
    'weekly', true
  ),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can upsert their own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project analyses (link specific analysis results to a project)
CREATE TABLE IF NOT EXISTS project_analyses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  project_id bigint REFERENCES projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project analyses" ON project_analyses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());