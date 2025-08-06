import React from 'react';
import { BarChart3, User, CreditCard, TrendingUp, Star, Calendar } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-background-color">
      {/* Navigation */}
      <nav className="bg-navbar-bg border-b border-border-color">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold">
                <span className="text-text-primary">RANK</span>
                <span className="text-primary-cta">ORA</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-text-primary hover:text-primary-cta transition-colors">Dashboard</a>
                <a href="#" className="text-text-secondary hover:text-primary-cta transition-colors">Analytics</a>
                <a href="#" className="text-text-secondary hover:text-primary-cta transition-colors">Reports</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-text-primary font-medium">Welcome, User!</div>
              <button
                onClick={onLogout}
                className="bg-primary-cta text-white px-4 py-2 rounded-lg hover:bg-primary-cta/90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
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
            <div className="text-xs text-orange-500 mt-2">Free Plan: 2/2 remaining</div>
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
                <CreditCard className="w-6 h-6 text-purple-500 animate-constellation" />
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
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">Product Page Analysis</div>
                      <div className="text-sm text-text-secondary">store.com/product-page</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">67</div>
                    <div className="text-xs text-text-secondary">Score</div>
                  </div>
                </div>
              </div>
              
              {/* Upgrade Notice */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-cta/10 to-emerald-400/10 border border-primary-cta/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-text-primary">You've used all your free analyses!</div>
                    <div className="text-sm text-text-secondary">Upgrade to Pro for unlimited analyses</div>
                  </div>
                  <button className="bg-primary-cta text-white px-4 py-2 rounded-lg hover:bg-primary-cta/90 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account & Features */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-card-background border border-border-color rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-text-secondary" />
                  <div>
                    <div className="font-medium text-text-primary">Free Plan</div>
                    <div className="text-sm text-text-secondary">2 analyses per month</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-text-secondary" />
                  <div>
                    <div className="font-medium text-text-primary">Next Reset</div>
                    <div className="text-sm text-text-secondary">January 1, 2025</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card-background border border-border-color rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-primary-cta text-white rounded-lg hover:bg-primary-cta/90 transition-colors text-left">
                  <div className="font-medium">Analyze New Article</div>
                  <div className="text-sm opacity-90">Get AI-powered insights</div>
                </button>
                <button className="w-full p-3 bg-accent-light border border-border-color rounded-lg hover:shadow-md transition-all duration-200 text-left">
                  <div className="font-medium text-text-primary">Compare with Competitor</div>
                  <div className="text-sm text-text-secondary">Side-by-side analysis</div>
                </button>
                <button className="w-full p-3 bg-accent-light border border-border-color rounded-lg hover:shadow-md transition-all duration-200 text-left">
                  <div className="font-medium text-text-primary">View Pricing</div>
                  <div className="text-sm text-text-secondary">Upgrade your plan</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-1 h-1 bg-primary-cta/30 rounded-full animate-twinkle" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-40 w-2 h-2 bg-yellow-400/40 rounded-full animate-sparkle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-40 w-1 h-1 bg-blue-400/30 rounded-full animate-constellation" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/20 rounded-full animate-cosmic-drift" style={{animationDelay: '6s'}}></div>
      </div>
    </div>
  );
};

export default Dashboard;