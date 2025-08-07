import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Bell, CreditCard, Download, Trash2, Save } from 'lucide-react';

interface AccountSettingsProps {
  onLogout: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    timezone: 'UTC-5',
    notifications: {
      email: true,
      push: false,
      weekly: true
    }
  });

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

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Privacy', icon: Download },
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
        <button className="btn-primary mt-6">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-accent-primary" />
                <div>
                  <h4 className="font-medium text-primary">Change Password</h4>
                  <p className="text-sm text-secondary">Update your account password</p>
                </div>
              </div>
              <button className="btn-secondary">Change</button>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-accent-primary" />
                <div>
                  <h4 className="font-medium text-primary">Two-Factor Authentication</h4>
                  <p className="text-sm text-secondary">Add an extra layer of security</p>
                </div>
              </div>
              <button className="btn-secondary">Enable</button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent-primary" />
                <div>
                  <h4 className="font-medium text-primary">Login Notifications</h4>
                  <p className="text-sm text-secondary">Get notified of new logins</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-surface-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>
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
        
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-primary">Current Plan</h4>
              <p className="text-secondary">Free Plan</p>
            </div>
            <button className="btn-primary">Upgrade</button>
          </div>
          <div className="text-sm text-secondary">
            <p>2/2 analyses used this month</p>
            <p>Resets on January 1, 2025</p>
          </div>
        </div>

        <div className="card">
          <h4 className="font-semibold text-primary mb-4">Payment Method</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-secondary" />
              <span className="text-secondary">No payment method on file</span>
            </div>
            <button className="btn-secondary">Add Card</button>
          </div>
        </div>
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
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'billing' && renderBilling()}
            {activeSection === 'data' && renderDataPrivacy()}
          </div>
        </div>
      </div>
    </div>
  );
};