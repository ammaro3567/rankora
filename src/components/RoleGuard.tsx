import React, { useState, useEffect, ReactNode } from 'react';
import { Shield, Lock, Crown } from 'lucide-react';
import { getUserRole, hasPermission, UserRole } from '../lib/supabase';

interface RoleGuardProps {
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface UsageGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  requiredRole, 
  requiredPermission, 
  fallback, 
  children 
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (requiredRole) {
          const userRole = await getUserRole();
          const roleHierarchy = { starter: 1, pro: 2, business: 3 };
          setHasAccess(roleHierarchy[userRole] >= roleHierarchy[requiredRole]);
        } else if (requiredPermission) {
          const permission = await hasPermission(requiredPermission);
          setHasAccess(!!permission && Object.keys(permission).length > 0);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking role access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredRole, requiredPermission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        {fallback || (
          <div className="p-6 bg-secondary rounded-lg border-2 border-dashed border-divider text-center">
            <Lock className="w-8 h-8 text-tertiary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {requiredRole ? `${requiredRole} Plan Required` : 'Upgrade Required'}
            </h3>
            <p className="text-tertiary text-sm">
              This feature requires a higher tier plan. Contact support to upgrade.
            </p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export const UsageGuard: React.FC<UsageGuardProps> = ({ permission, fallback, children }) => {
  const [canUse, setCanUse] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [limitInfo, setLimitInfo] = useState<any>({});

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const permissionData = await hasPermission(permission);
        const limit = permissionData.limit || 0;
        
        // This would need to be implemented based on your specific usage tracking
        // For now, we'll just check if the permission exists
        setCanUse(limit === -1 || limit > 0);
        setLimitInfo(permissionData);
      } catch (error) {
        console.error('Error checking usage:', error);
        setCanUse(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUsage();
  }, [permission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!canUse) {
    return (
      <div>
        {fallback || (
          <div className="p-6 bg-secondary rounded-lg border-2 border-dashed border-divider text-center">
            <Shield className="w-8 h-8 text-tertiary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-secondary mb-2">
              Usage Limit Reached
            </h3>
            <p className="text-tertiary text-sm">
              You've reached your monthly limit for this feature. Upgrade to continue using it.
            </p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Helper component for role badges
export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const roleConfig = {
    starter: { icon: Shield, color: 'bg-blue-100 text-blue-800', label: 'Starter' },
    pro: { icon: Crown, color: 'bg-purple-100 text-purple-800', label: 'Pro' },
    business: { icon: Crown, color: 'bg-yellow-100 text-yellow-800', label: 'Business' }
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};
