import React, { useState } from 'react';
import { useEffect } from 'react';
import { User, Mail, Lock, Shield, Save } from 'lucide-react';
import { getUserSubscription } from '../lib/paypal';
import { supabase, getUserProfile, upsertUserProfile } from '../lib/supabase';
import { useUser, useClerk } from '@clerk/clerk-react';

interface AccountSettingsProps {
  onLogout: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onLogout }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
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
        if (user?.id) {
          const sub = await getUserSubscription(user.id);
          setSubscription(sub);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchSubscription();
      // Load profile from Clerk user data
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      const fullName = user.fullName || '';
      
      setFormData(prev => ({
        ...prev,
        email: email || '',
        name: fullName || ''
      }));

      // Load additional profile data from Supabase
      (async () => {
        try {
          const profile = await getUserProfile();
          if (profile) {
            setFormData(prev => ({
              ...prev,
              company: profile.company || '',
              timezone: profile.timezone || 'UTC',
              notifications: (profile.notifications as any) || prev.notifications
            }));
          }
        } catch (e) {
          console.log('No profile data found, using defaults');
        }
      })();
    }
  }, [isLoaded, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email managed by Clerk</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
        {saveError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm mb-4">
            Profile saved successfully
          </div>
        )}
        <button
          className={`bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition duration-200 shadow-lg shadow-emerald-500/20 mt-2 ${saveLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={saveLoading}
          onClick={async () => {
            setSaveError(null);
            setSaveSuccess(false);
            setSaveLoading(true);
            try {
              const result = await upsertUserProfile({
                full_name: formData.name,
                company: formData.company
              });
              if (result) {
                setSaveSuccess(true);
              }
            } catch (err: any) {
              setSaveError(err?.message || 'Failed to save profile');
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
          <div className="p-4 border border-gray-600 rounded-lg">
            <h4 className="text-lg font-medium text-primary mb-2">Password Management</h4>
            <p className="text-secondary mb-4">Password changes are managed through Clerk. Use the user menu to update your password.</p>
            <button
              onClick={() => window.open('https://clerk.com/docs/users/management', '_blank')}
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Learn more about Clerk security
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-primary font-medium">Email Notifications</label>
              <p className="text-secondary text-sm">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              name="email"
              checked={formData.notifications.email}
              onChange={handleInputChange}
              className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-primary font-medium">Push Notifications</label>
              <p className="text-secondary text-sm">Receive browser notifications</p>
            </div>
            <input
              type="checkbox"
              name="push"
              checked={formData.notifications.push}
              onChange={handleInputChange}
              className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-primary font-medium">Weekly Reports</label>
              <p className="text-secondary text-sm">Receive weekly usage summaries</p>
            </div>
            <input
              type="checkbox"
              name="weekly"
              checked={formData.notifications.weekly}
              onChange={handleInputChange}
              className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Data Privacy</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-600 rounded-lg">
            <h4 className="text-lg font-medium text-primary mb-2">Data Usage</h4>
            <p className="text-secondary mb-4">Your data is stored securely and used only to provide our services. We never share your personal information with third parties.</p>
          </div>
          <div className="p-4 border border-gray-600 rounded-lg">
            <h4 className="text-lg font-medium text-primary mb-2">Data Export</h4>
            <p className="text-secondary mb-4">You can export your data at any time. Contact support for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

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
                      ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30'
                      : 'text-secondary hover:text-primary hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left mt-8"
            >
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'security' && renderSecurity()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'privacy' && renderDataPrivacy()}
          </div>
        </div>
      </div>
    </div>
  );
};