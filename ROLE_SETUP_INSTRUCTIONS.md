# Role-Based Access Control Setup Instructions

## Overview
You now have a complete role-based access control system with three tiers: **Starter**, **Pro**, and **Business**. Only you (the owner) can access and manage user roles.

## Setup Steps

### 1. Update Owner Email
Replace `your-owner-email@example.com` with your actual email address in these files:

**Owner email has been set to: `ammarebrahim725@gmail.com`**

✅ Already configured in:
- `src/lib/supabase.ts` 
- `supabase/migrations/20250110000000_add_user_roles.sql`

### 2. Run Database Migration
Execute the SQL migration in your Supabase SQL Editor:
```bash
# The migration file is: supabase/migrations/20250110000000_add_user_roles.sql
```

### 3. Role Permissions

#### Starter Plan (Default)
- Monthly analyses: 10
- Monthly comparisons: 5  
- Projects: 3
- Export formats: JSON only
- API access: Disabled

#### Pro Plan
- Monthly analyses: 100
- Monthly comparisons: 50
- Projects: 20
- Export formats: JSON, CSV, PDF
- API access: Enabled (1,000 requests/month)
- Priority support: Enabled

#### Business Plan
- Monthly analyses: Unlimited
- Monthly comparisons: Unlimited
- Projects: Unlimited
- Export formats: JSON, CSV, PDF, XLSX
- API access: Enabled (10,000 requests/month)
- Priority support: Enabled
- White label: Enabled
- Team management: Up to 50 members

## How to Use

### 1. Access Admin Panel
Once you've updated your email and run the migration:
1. Log in with your owner email
2. You'll see a "Admin Panel" button in the sidebar (with crown icon)
3. Click it to access role management

### 2. Manage User Roles
In the admin panel you can:
- View all users and their current roles
- Change user roles (Starter → Pro → Business)
- View role assignment history
- See when roles were changed and by whom

### 3. Role-Based Features
The system includes components to protect features:

**RoleGuard Component:**
```tsx
import { RoleGuard } from './components/RoleGuard';

// Require specific role
<RoleGuard requiredRole="pro">
  <ProFeature />
</RoleGuard>

// Require specific permission
<RoleGuard requiredPermission="api_access">
  <APISettings />
</RoleGuard>
```

**Usage Limits:**
```tsx
import { checkUsageLimits } from './lib/supabase';

const limits = await checkUsageLimits();
// Returns: { analyses: {used, limit, canUse}, comparisons: {used, limit, canUse}, projects: {used, limit, canUse} }
```

## Security Features

### 1. Owner-Only Access
- Admin panel only appears for owner email
- All role management functions check owner status
- Database policies enforce owner-only access

### 2. Audit Trail
- All role changes are logged in `role_assignments` table
- Includes who made the change and when
- Previous role is recorded for history

### 3. Database Security
- Row Level Security (RLS) enabled on all role tables
- Functions use `SECURITY DEFINER` for controlled access
- Role permissions defined at database level

## Customization

### Adding New Permissions
1. Add to `role_permissions` table:
```sql
INSERT INTO role_permissions (role, permission_name, permission_value) VALUES
('pro', 'new_feature', '{"enabled": true, "limit": 100}');
```

2. Use in code:
```typescript
const permission = await hasPermission('new_feature');
if (permission.enabled) {
  // Feature is enabled
}
```

### Modifying Role Limits
Update the `role_permissions` table:
```sql
UPDATE role_permissions 
SET permission_value = '{"limit": 200}' 
WHERE role = 'pro' AND permission_name = 'monthly_analyses';
```

## Important Notes

1. **Owner Email**: Must be exactly the same as the email you use to log in
2. **Case Sensitive**: Email comparison is case-sensitive
3. **Migration Required**: Database migration must be run before using role features
4. **Backup**: Always backup your database before running migrations

## Troubleshooting

### Admin Panel Not Showing
- Verify owner email is set correctly in both files
- Check that you're logged in with the exact owner email
- Ensure database migration has been run

### Role Changes Not Working
- Check Supabase logs for permission errors
- Verify RLS policies are correctly applied
- Ensure owner email function returns true for your email

### Permission Errors
- Check that user has required role/permission
- Verify role_permissions table has correct data
- Look for console errors in browser developer tools
