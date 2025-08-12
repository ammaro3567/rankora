-- Add role management system
-- This migration adds user roles and role-based access control

-- Create roles enum
CREATE TYPE user_role AS ENUM ('starter', 'pro', 'business');

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role DEFAULT 'starter',
ADD COLUMN role_assigned_by uuid REFERENCES auth.users(id),
ADD COLUMN role_assigned_at timestamptz DEFAULT now();

-- Create role_assignments table for audit trail
CREATE TABLE IF NOT EXISTS role_assignments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id),
  role user_role NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  previous_role user_role,
  notes text
);

-- Enable RLS on role_assignments
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;

-- Create role_permissions table to define what each role can do
CREATE TABLE IF NOT EXISTS role_permissions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  role user_role NOT NULL,
  permission_name text NOT NULL,
  permission_value jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_name)
);

-- Enable RLS on role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Insert default permissions for each role
INSERT INTO role_permissions (role, permission_name, permission_value) VALUES
-- Starter permissions
('starter', 'monthly_analyses', '{"limit": 10}'),
('starter', 'monthly_comparisons', '{"limit": 5}'),
('starter', 'projects', '{"limit": 3}'),
('starter', 'export_formats', '{"allowed": ["json"]}'),
('starter', 'api_access', '{"enabled": false}'),

-- Pro permissions  
('pro', 'monthly_analyses', '{"limit": 100}'),
('pro', 'monthly_comparisons', '{"limit": 50}'),
('pro', 'projects', '{"limit": 20}'),
('pro', 'export_formats', '{"allowed": ["json", "csv", "pdf"]}'),
('pro', 'api_access', '{"enabled": true, "rate_limit": 1000}'),
('pro', 'priority_support', '{"enabled": true}'),

-- Business permissions
('business', 'monthly_analyses', '{"limit": -1}'),
('business', 'monthly_comparisons', '{"limit": -1}'),
('business', 'projects', '{"limit": -1}'),
('business', 'export_formats', '{"allowed": ["json", "csv", "pdf", "xlsx"]}'),
('business', 'api_access', '{"enabled": true, "rate_limit": 10000}'),
('business', 'priority_support', '{"enabled": true}'),
('business', 'white_label', '{"enabled": true}'),
('business', 'team_management', '{"enabled": true, "max_members": 50}');

-- Create function to check if user is owner (based on email)
CREATE OR REPLACE FUNCTION is_owner(user_email text)
RETURNS boolean AS $$
BEGIN
  -- Owner email for admin access
  RETURN user_email = 'ammarebrahim725@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result 
  FROM profiles 
  WHERE profiles.user_id = get_user_role.user_id;
  
  RETURN COALESCE(user_role_result, 'starter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check role permissions
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, permission text)
RETURNS jsonb AS $$
DECLARE
  user_role_val user_role;
  permission_val jsonb;
BEGIN
  SELECT get_user_role(user_id) INTO user_role_val;
  
  SELECT permission_value INTO permission_val
  FROM role_permissions 
  WHERE role = user_role_val AND permission_name = permission;
  
  RETURN COALESCE(permission_val, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for role_assignments
CREATE POLICY "Owner can view all role assignments" ON role_assignments
  FOR SELECT TO authenticated
  USING (is_owner((SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Owner can manage all roles" ON role_assignments
  FOR ALL TO authenticated
  USING (is_owner((SELECT email FROM auth.users WHERE id = auth.uid())))
  WITH CHECK (is_owner((SELECT email FROM auth.users WHERE id = auth.uid())));

-- RLS Policies for role_permissions  
CREATE POLICY "All users can view role permissions" ON role_permissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only owner can modify role permissions" ON role_permissions
  FOR ALL TO authenticated  
  USING (is_owner((SELECT email FROM auth.users WHERE id = auth.uid())))
  WITH CHECK (is_owner((SELECT email FROM auth.users WHERE id = auth.uid())));

-- Update profiles policies to allow owner to manage roles
CREATE POLICY "Owner can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_owner((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Owner can update any profile role" ON profiles
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_owner((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    is_owner((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO role_assignments (user_id, role, assigned_by, previous_role, notes)
    VALUES (
      NEW.user_id, 
      NEW.role, 
      NEW.role_assigned_by, 
      OLD.role,
      'Role changed from ' || COALESCE(OLD.role::text, 'none') || ' to ' || NEW.role::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_change_log
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- Create view for user role summary
CREATE OR REPLACE VIEW user_role_summary AS
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  p.role,
  p.role_assigned_at,
  assigned_by.email as assigned_by_email,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN auth.users assigned_by ON p.role_assigned_by = assigned_by.id
WHERE u.email_confirmed_at IS NOT NULL;

-- Create function to get all users with roles (for owner only)
CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  role user_role,
  role_assigned_at timestamptz,
  assigned_by_email text,
  profile_created_at timestamptz
) AS $$
BEGIN
  -- Check if the requesting user is the owner
  IF NOT is_owner((SELECT auth.users.email FROM auth.users WHERE auth.users.id = auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: Owner access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    p.full_name,
    p.role,
    p.role_assigned_at,
    assigned_by.email as assigned_by_email,
    p.created_at as profile_created_at
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.user_id
  LEFT JOIN auth.users assigned_by ON p.role_assigned_by = assigned_by.id
  WHERE u.email_confirmed_at IS NOT NULL
  ORDER BY p.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
