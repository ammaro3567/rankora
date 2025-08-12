import React, { useState } from 'react';
import { useEffect } from 'react';
import { User, Mail, Lock, Shield, Save } from 'lucide-react';
import { getUserSubscription } from '../lib/paypal';
import { getUserProfile, upsertUserProfile, getCurrentUser } from '../lib/supabase';
import { getProductByPayPalPlanId } from '../paypal-config';

interface AccountSettingsProps {
  onLogout: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: false,
      weekly: true
    }
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await getUserSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
    // Load profile
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user?.email) {
          setFormData(prev => ({ ...prev, email: user.email as string }));
        }
        const profile = await getUserProfile();
        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.full_name || '',
            company: profile.company || '',
            timezone: profile.timezone || 'UTC',
            notifications: (profile.notifications as any) || prev.notifications
          }));
        }
      } catch (e) {
        // noop
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checkbox.checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getSubscriptionDetails = () => {
    if (!subscription?.price_id) return null;
    return getProductByPayPalPlanId(subscription.price_id);
  };

  const subscriptionDetails = getSubscriptionDetails();
  const isSubscribed = subscription && subscription.subscription_status === 'active';

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Profile Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="input-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="input-primary"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-7">Mountain Time (UTC-7)</option>
              <option value="UTC-6">Central Time (UTC-6)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">UTC</option>
            </select>
          </div>
        </div>
        {saveError && (
          <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm mb-4">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm mb-4">
            Profile saved successfully
          </div>
        )}
        <button
          className={`btn-primary mt-2 ${saveLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={saveLoading}
          onClick={async () => {
            setSaveError(null);
            setSaveSuccess(false);
            setSaveLoading(true);
            try {
              const { error } = await upsertUserProfile({
                full_name: formData.name,
                company: formData.company,
                timezone: formData.timezone,
                notifications: formData.notifications as any
              });
              if (error) {
                setSaveError(error.message || 'Failed to save profile');
              } else {
                setSaveSuccess(true);
              }
            } catch (err: any) {
              setSaveError(err?.message || 'Unexpected error');
            } finally {
              setSaveLoading(false);
            }
          }}
        >
          <Save className="w-4 h-4 mr-2" />
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Security Settings</h3>
        <div className="space-y-4">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary">Email Notifications</h4>
                <p className="text-sm text-secondary">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="email"
                  checked={formData.notifications.email}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-surface-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary">Push Notifications</h4>
                <p className="text-sm text-secondary">Receive browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="push"
                  checked={formData.notifications.push}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-surface-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary">Weekly Reports</h4>
                <p className="text-sm text-secondary">Get weekly analysis summaries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="weekly"
                  checked={formData.notifications.weekly}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-surface-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Billing & Subscription</h3>
        
        {loading ? (
          <div className="card">
            <div className="flex items-center justify-center space-x-2">
              <div className="loading-spinner w-5 h-5" />
              <span className="text-secondary">Loading subscription details...</span>
            </div>
          </div>
        ) : (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-primary">Current Plan</h4>
              <p className="text-secondary">
                {isSubscribed && subscriptionDetails ? `${subscriptionDetails.name} Plan` : 'Free Plan'}
              </p>
            </div>
            {!isSubscribed && (
              <button className="btn-primary">Upgrade</button>
            )}
            {isSubscribed && (
              <div className="text-right">
                <div className="text-lg font-bold text-success">
                  ${subscriptionDetails?.price}/month
                </div>
                <div className="text-sm text-success">Active</div>
              </div> 
            )}
          </div>
          <div className="text-sm text-secondary">
            {isSubscribed && subscriptionDetails ? (
              <>
                <p>0/{subscriptionDetails.description.split(' ')[0]} analyses used this month</p>
                <p>Subscription status: {subscription.subscription_status?.replace('_', ' ')}</p>
              </>
            ) : (
              <>
                <p>2/2 analyses used this month</p>
              </>
            )}
            <p>Resets on January 1, 2025</p>
          </div>
        </div>
        )}

        {isSubscribed && (
          <div className="card">
            <h4 className="font-semibold text-primary mb-4">Payment Method</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-secondary" />
                <span className="text-secondary">
                  PayPal Subscription
                </span>
              </div>
              <button className="btn-secondary">Update</button>
            </div>
          </div>
        )}

        {!isSubscribed && (
        <div className="card">
          <h4 className="font-semibold text-primary mb-4">Payment Method</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-secondary" />
              <span className="text-secondary">No payment method on file</span>
            </div>
            <button className="btn-secondary">Subscribe</button>
          </div>
        </div>
        )}
      </div>
    </div>
  );

  const renderDataPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-accent-primary" />
                <div>
                  <h4 className="font-medium text-primary">Export Data</h4>
                  <p className="text-sm text-secondary">Download all your account data</p>
                </div>
              </div>
              <button className="btn-secondary">Export</button>
            </div>
          </div>

          <div className="card border-error/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-error" />
                <div>
                  <h4 className="font-medium text-error">Delete Account</h4>
                  <p className="text-sm text-secondary">Permanently delete your account and all data</p>
                </div>
              </div>
              <button className="bg-error hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-secondary">Manage your account preferences and settings</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    activeSection === section.id
                      ? 'text-accent-primary bg-surface-secondary'
                      : 'text-secondary hover:text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-error hover:bg-red-500/10 transition-all duration-200 text-left mt-8"
            >
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'security' && renderSecurity()}
            {/* removed extra sections for simplicity */}
          </div>
        </div>
      </div>
    </div>
  );
};

// Change Password Card Component
const ChangePasswordCard: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = async () => {
    setError(null);
    setSuccess(false);
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      // Supabase لا يدعم تغيير الباسورد إلا عبر updateUser في الجلسة الحالية
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }
      const { error } = await (await import('../lib/supabase')).supabase.auth.updateUser({ password: newPassword });
      if (error) setError(error.message);
      else setSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Lock className="w-5 h-5 text-accent-primary" />
          <div>
            <h4 className="font-medium text-primary">Change Password</h4>
            <p className="text-sm text-secondary">Update your account password</p>
          </div>
        </div>
      </div>
      {error && <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm mb-4">{error}</div>}
      {success && <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm mb-4">Password updated successfully</div>}
      <div className="grid md:grid-cols-3 gap-4">
        <input type="password" placeholder="Current password" className="input-primary" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input type="password" placeholder="New password" className="input-primary" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <input type="password" placeholder="Confirm new password" className="input-primary" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      <button className={`btn-primary mt-4 ${loading ? 'opacity-70' : ''}`} disabled={loading} onClick={handleChange}>
        {loading ? 'Saving...' : 'Change Password'}
      </button>
    </div>
  );
};