import React from 'react';
import { BarChart3, User, CreditCard, TrendingUp, Star, Calendar, Target, Lightbulb, Settings, LogOut, Crown, Zap } from 'lucide-react';
import { AIOverviewAnalyzer } from './AIOverviewAnalyzer';
import { CompetitorComparison } from './CompetitorComparison';
import { PricingPage } from './PricingPage';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [userPlan, setUserPlan] = React.useState('free'); // free, pro, enterprise

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return <AIOverviewAnalyzer />;
      case 'comparison':
        return <CompetitorComparison />;
      case 'pricing':
        return <PricingPage />;
      case 'account':
        return <AccountSettings onLogout={onLogout} />;
      default:
        return <DashboardOverview userPlan={userPlan} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-color">
      {/* Animated Background Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-1 h-1 bg-primary-cta/30 rounded-full animate-twinkle" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-40 w-2 h-2 bg-yellow-400/40 rounded-full animate-sparkle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-40 w-1 h-1 bg-blue-400/30 rounded-full animate-constellation" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/20 rounded-full animate-cosmic-drift" style={{animationDelay: '6s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-emerald-400/40 rounded-full animate-twinkle" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-400/30 rounded-full animate-sparkle" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-navbar-bg border-b border-border-color">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-cta rounded-lg flex items-center justify-center animate-gentle-glow">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-text-primary">
                  RANK<span className="text-primary-cta">ORA</span>
                </span>
              </div>
              <div className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`hover:text-primary-cta transition-colors font-medium ${activeTab === 'overview' ? 'text-primary-cta' : 'text-text-secondary'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('analyzer')}
                  className={`hover:text-primary-cta transition-colors font-medium ${activeTab === 'analyzer' ? 'text-primary-cta' : 'text-text-secondary'}`}
                >
                  Analyzer
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`hover:text-primary-cta transition-colors font-medium ${activeTab === 'comparison' ? 'text-primary-cta' : 'text-text-secondary'}`}
                >
                  Comparison
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`hover:text-primary-cta transition-colors font-medium ${activeTab === 'pricing' ? 'text-primary-cta' : 'text-text-secondary'}`}
                >
                  Pricing
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent-light rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="hidden md:block">
                  <div className="text-text-primary font-medium text-sm">Welcome back!</div>
                  <div className="text-text-secondary text-xs">user@example.com</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('account')}
                className="p-2 rounded-lg hover:bg-accent-light transition-colors"
              >
                <Settings className="w-5 h-5 text-text-secondary" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC<{ userPlan: string }> = ({ userPlan }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Plan Status Banner */}
      {userPlan === 'free' && (
        <div className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">You're on the Free Plan</h3>
                <p className="text-text-secondary">You've used 2/2 analyses this month. Upgrade for unlimited access!</p>
              </div>
            </div>
            <button className="bg-primary-cta hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card-background border border-border-color rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-cta/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-cta animate-twinkle" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">2</div>
            <div className="text-text-secondary text-sm">Analyses Used</div>
            <div className="text-xs text-orange-500 mt-2">Free Plan: 0/2 remaining</div>
          </div>

          <div className="bg-card-background border border-border-color rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-500 animate-sparkle" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">87</div>
            <div className="text-text-secondary text-sm">Average Score</div>
            <div className="text-xs text-emerald-500 mt-2">+5% from last month</div>
          </div>

          <div className="bg-card-background border border-border-color rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-500 animate-constellation" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">Free</div>
            <div className="text-text-secondary text-sm">Current Plan</div>
            <div className="text-xs text-primary-cta mt-2 cursor-pointer hover:underline">Upgrade Plan</div>
          </div>

          <div className="bg-card-background border border-border-color rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-500 animate-drift" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">Dec 2024</div>
            <div className="text-text-secondary text-sm">Member Since</div>
            <div className="text-xs text-text-secondary mt-2">Premium features available</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Analyses */}
          <div className="lg:col-span-2">
            <div className="bg-card-background border border-border-color rounded-xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-6">Recent Analyses</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent-light rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">Blog Post Analysis</div>
                      <div className="text-sm text-text-secondary">example.com/blog-post</div>
                      <div className="text-xs text-text-secondary">2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-500">92</div>
                    <div className="text-xs text-text-secondary">Score</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent-light rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">Competitor Comparison</div>
                      <div className="text-sm text-text-secondary">vs competitor.com/article</div>
                      <div className="text-xs text-text-secondary">1 day ago</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">67</div>
                    <div className="text-xs text-text-secondary">Your Score</div>
                  </div>
                </div>
              </div>
              
              {/* Usage Limit Notice */}
              <div className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-text-primary">Monthly limit reached!</div>
                    <div className="text-sm text-text-secondary">Upgrade to Pro for unlimited analyses</div>
                  </div>
                  <button className="bg-primary-cta text-white px-4 py-2 rounded-lg hover:bg-primary-cta/90 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card-background border border-border-color rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  disabled
                  className="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed text-left"
                >
                  <div className="font-medium">Analyze New Article</div>
                  <div className="text-sm opacity-75">Upgrade to unlock</div>
                </button>
                <button 
                  disabled
                  className="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed text-left"
                >
                  <div className="font-medium">Compare with Competitor</div>
                  <div className="text-sm opacity-75">Upgrade to unlock</div>
                </button>
                <button className="w-full p-3 bg-primary-cta text-white rounded-lg hover:bg-primary-cta/90 transition-colors text-left">
                  <div className="font-medium">View Pricing Plans</div>
                  <div className="text-sm opacity-90">Unlock all features</div>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-card-background border border-border-color rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-text-secondary" />
                  <div>
                    <div className="font-medium text-text-primary">Free Plan</div>
                    <div className="text-sm text-text-secondary">2 analyses per month</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-text-secondary" />
                  <div>
                    <div className="font-medium text-text-primary">Next Reset</div>
                    <div className="text-sm text-text-secondary">January 1, 2025</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-text-secondary" />
                  <div>
                    <div className="font-medium text-text-primary">Member Since</div>
                    <div className="text-sm text-text-secondary">December 2024</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">AI Tip of the Day</h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                Structure your content with clear H2 and H3 headings. AI Overviews prefer well-organized content that's easy to scan and understand.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

// Account Settings Component
const AccountSettings: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Account Settings</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <div className="bg-card-background border border-border-color rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full px-4 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary"
                />
              </div>
              <button className="bg-primary-cta hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card-background border border-border-color rounded-xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Security</h2>
            <div className="space-y-4">
              <button className="w-full p-3 bg-accent-light border border-border-color rounded-lg hover:shadow-md transition-all duration-200 text-left">
                <div className="font-medium text-text-primary">Change Password</div>
                <div className="text-sm text-text-secondary">Update your account password</div>
              </button>
              <button className="w-full p-3 bg-accent-light border border-border-color rounded-lg hover:shadow-md transition-all duration-200 text-left">
                <div className="font-medium text-text-primary">Two-Factor Authentication</div>
                <div className="text-sm text-text-secondary">Add an extra layer of security</div>
              </button>
              <button 
                onClick={onLogout}
                className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-left"
              >
                <div className="font-medium text-red-600 dark:text-red-400">Sign Out</div>
                <div className="text-sm text-red-500 dark:text-red-400">Sign out of your account</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;