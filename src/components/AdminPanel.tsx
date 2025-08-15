import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Crown, 
  Star, 
  Building2, 
  Zap,
  Settings,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  User
} from 'lucide-react';
import { 
  getAllUsers, 
  updateUserRole, 
  getRoleAssignments,
  isOwner,
  UserRoleSummary,
  RoleAssignment,
  UserRole,
  getUserProfile,
  upsertUserProfile
} from '../lib/supabase';

// Define plans locally
const PLANS = [
  { id: 'starter', name: 'Starter', price: 10, limit: '30 analyses/month' },
  { id: 'pro', name: 'Pro', price: 30, limit: '100 analyses/month' },
  { id: 'business', name: 'Business', price: 70, limit: '300 analyses/month' }
];

interface AdminPanelProps {
  onBack: () => void;
}

const roleIcons = {
  starter: Star,
  pro: Zap,
  business: Building2
};

const roleColors = {
  starter: 'text-blue-500',
  pro: 'text-purple-500',
  business: 'text-gold-500'
};

const roleBadgeColors = {
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  business: 'bg-yellow-100 text-yellow-800'
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserRoleSummary[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRoleSummary | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('starter');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'history' | 'admin-settings'>('users');
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('business');

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const ownerCheck = await isOwner();
        setIsAuthorized(ownerCheck);
        
        if (ownerCheck) {
          const [usersData, assignmentsData, profileData] = await Promise.all([
            getAllUsers(),
            getRoleAssignments(),
            getUserProfile()
          ]);
          setUsers(usersData);
          setRoleAssignments(assignmentsData);
          setAdminProfile(profileData);
          setSelectedPlan(profileData?.role || 'business');
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        setMessage({ type: 'error', text: 'Failed to load admin data' });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, []);

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser.user_id, newRole);
      
      // Refresh data
      const [usersData, assignmentsData] = await Promise.all([
        getAllUsers(),
        getRoleAssignments()
      ]);
      setUsers(usersData);
      setRoleAssignments(assignmentsData);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully updated ${selectedUser.full_name || selectedUser.email} to ${newRole} role` 
      });
      setSelectedUser(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user role' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminPlanUpdate = async () => {
    setIsUpdating(true);
    try {
      await upsertUserProfile({ role: selectedPlan as UserRole });
      setAdminProfile({ ...adminProfile, role: selectedPlan });
      
      setMessage({ 
        type: 'success', 
        text: `Successfully updated admin plan to ${selectedPlan}` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update admin plan' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="card text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-primary mb-2">Loading Admin Panel</h3>
          <p className="text-secondary text-sm">Verifying permissions and loading data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="card text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Access Denied</h2>
          <p className="text-secondary mb-6">
            This admin panel is restricted to authorized personnel only.
          </p>
          <button onClick={onBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-accent-primary" />
            <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
          </div>
          <button onClick={onBack} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-accent-primary text-white'
                : 'bg-secondary text-secondary hover:bg-accent-primary/10'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-accent-primary text-white'
                : 'bg-secondary text-secondary hover:bg-accent-primary/10'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Role History
          </button>
          <button
            onClick={() => setActiveTab('admin-settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'admin-settings'
                ? 'bg-accent-primary text-white'
                : 'bg-secondary text-secondary hover:bg-accent-primary/10'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Admin Settings
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">User Role Management</h2>
              <div className="text-sm text-secondary">
                Total Users: <span className="font-medium text-primary">{users.length}</span>
              </div>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No Users Found</h3>
                <p className="text-secondary">No registered users to manage at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-divider">
                      <th className="text-left py-4 px-2 text-secondary font-semibold">User</th>
                      <th className="text-left py-4 px-2 text-secondary font-semibold">Email</th>
                      <th className="text-left py-4 px-2 text-secondary font-semibold">Current Role</th>
                      <th className="text-left py-4 px-2 text-secondary font-semibold">Assigned</th>
                      <th className="text-left py-4 px-2 text-secondary font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider/30">
                    {users.map((user, index) => {
                      const RoleIcon = roleIcons[user.role];
                      return (
                        <tr key={user.user_id} className="hover:bg-surface-secondary transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-accent-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-accent-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-primary">
                                  {user.full_name || 'No name set'}
                                </div>
                                <div className="text-xs text-tertiary">
                                  User #{index + 1}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-secondary font-mono text-sm">
                              {user.email}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-2">
                              <RoleIcon className={`w-4 h-4 ${roleColors[user.role]}`} />
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeColors[user.role]}`}>
                                {user.role.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-tertiary text-sm">
                              {new Date(user.role_assigned_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                              }}
                              className="btn-secondary text-sm hover:bg-accent-primary hover:text-white transition-all duration-200"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">Role Assignment History</h2>
            
            <div className="space-y-4">
              {roleAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary">
                        Role changed to {assignment.role}
                      </div>
                      <div className="text-sm text-secondary">
                        {assignment.notes}
                      </div>
                    </div>
                    <div className="text-right text-sm text-tertiary">
                      {new Date(assignment.assigned_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin-settings' && (
          <div className="space-y-6">
            {/* Admin Plan Selection */}
            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-6">Admin Plan Settings</h2>
              
              <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-accent-primary" />
                  <span className="font-medium text-primary">Admin Privileges</span>
                </div>
                <p className="text-sm text-secondary mt-2">
                  As an admin, you have unlimited access to all features. You can also choose to experience 
                  the platform from a specific plan's perspective for testing purposes.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-3">
                    Current Plan Experience
                  </label>
                  <div className="space-y-3">
                    {PLANS.map((product) => {
                      const Icon = product.name === 'Business' ? Building2 : 
                                   product.name === 'Pro' ? Zap : Star;
                      return (
                        <div key={product.id} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id={product.id}
                            name="adminPlan"
                            value={product.id}
                            checked={selectedPlan === product.id}
                            onChange={(e) => setSelectedPlan(e.target.value)}
                            className="w-4 h-4 text-accent-primary"
                          />
                          <label htmlFor={product.id} className="flex items-center space-x-2 cursor-pointer">
                            <Icon className={`w-4 h-4 ${roleColors[product.id as keyof typeof roleColors]}`} />
                            <span className="text-primary font-medium">{product.name}</span>
                            <span className="text-sm text-secondary">
                              ({product.limit})
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={handleAdminPlanUpdate}
                    disabled={isUpdating || selectedPlan === adminProfile?.role}
                    className="btn-primary mt-4"
                  >
                    {isUpdating ? 'Updating...' : 'Update Plan Experience'}
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Admin Benefits</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-secondary">Unlimited analyses and comparisons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-secondary">Unlimited projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-secondary">All export formats</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-secondary">Full API access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-secondary">User management capabilities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-secondary">All features regardless of selected plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Profile Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-6">Admin Profile</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                    <p className="text-primary">{adminProfile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Current Plan Display</label>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const roleIcon = roleIcons[adminProfile?.role as keyof typeof roleIcons] || User;
                        const RoleIcon = roleIcon;
                        return (
                          <>
                            <RoleIcon className={`w-4 h-4 ${roleColors[adminProfile?.role as keyof typeof roleColors] || 'text-gray-500'}`} />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColors[adminProfile?.role as keyof typeof roleBadgeColors] || 'bg-gray-100 text-gray-800'}`}>
                              {adminProfile?.role || 'starter'}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Account Created</label>
                    <p className="text-primary">
                      {adminProfile?.created_at ? new Date(adminProfile.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Admin Status</label>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-accent-primary" />
                      <span className="text-sm font-medium text-accent-primary">Full Admin Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Update Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-primary mb-4">
                Update Role for {selectedUser.full_name || selectedUser.email}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Select New Role
                  </label>
                  <div className="relative">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="input w-full appearance-none"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="business">Business</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleRoleUpdate}
                    disabled={isUpdating}
                    className="btn-primary flex-1"
                  >
                    {isUpdating ? 'Updating...' : 'Update Role'}
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
