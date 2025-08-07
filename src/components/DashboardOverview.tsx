import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Crown,
  Zap,
  AlertCircle
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const stats = [
    {
      title: 'Analyses Used',
      value: '2',
      subtitle: '0/2 remaining this month',
      icon: BarChart3,
      color: 'text-accent-primary',
      bgColor: 'bg-accent-primary/10',
      trend: null
    },
    {
      title: 'Average Score',
      value: '87',
      subtitle: '+5% from last month',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: '+5%'
    },
    {
      title: 'Current Plan',
      value: 'Free',
      subtitle: 'Upgrade available',
      icon: Crown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: null
    },
    {
      title: 'Member Since',
      value: 'Dec 2024',
      subtitle: 'Premium features available',
      icon: Calendar,
      color: 'text-info',
      bgColor: 'bg-info/10',
      trend: null
    }
  ];

  const recentAnalyses = [
    {
      title: 'Blog Post Analysis',
      url: 'example.com/blog-post',
      score: 92,
      time: '2 hours ago',
      type: 'analysis'
    },
    {
      title: 'Competitor Comparison',
      url: 'vs competitor.com/article',
      score: 67,
      time: '1 day ago',
      type: 'comparison'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome back!</h1>
        <p className="text-secondary">Here's what's happening with your content analysis.</p>
      </div>

      {/* Plan Status Banner */}
      <div className="surface-primary border border-warning/30 rounded-xl p-6 animate-scaleIn">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">You're on the Free Plan</h3>
              <p className="text-secondary">You've used 2/2 analyses this month. Upgrade for unlimited access!</p>
            </div>
          </div>
          <button className="btn-primary whitespace-nowrap">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="card hover:scale-105 transition-transform duration-300 animate-scaleIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <span className="text-sm text-success font-medium">{stat.trend}</span>
                )}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-secondary">{stat.title}</div>
              <div className="text-xs text-tertiary mt-2">{stat.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Analyses */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-bold text-primary mb-6">Recent Analyses</h3>
            <div className="space-y-4">
              {recentAnalyses.map((analysis, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      analysis.type === 'analysis' ? 'bg-success/20' : 'bg-info/20'
                    }`}>
                      {analysis.type === 'analysis' ? (
                        <BarChart3 className="w-5 h-5 text-success" />
                      ) : (
                        <Target className="w-5 h-5 text-info" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-primary">{analysis.title}</div>
                      <div className="text-sm text-secondary">{analysis.url}</div>
                      <div className="text-xs text-tertiary">{analysis.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      analysis.score >= 80 ? 'text-success' : 
                      analysis.score >= 60 ? 'text-warning' : 'text-error'
                    }`}>
                      {analysis.score}
                    </div>
                    <div className="text-xs text-tertiary">Score</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Usage Limit Notice */}
            <div className="mt-6 p-4 bg-error/10 border border-error/30 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <div>
                    <div className="font-semibold text-primary">Monthly limit reached!</div>
                    <div className="text-sm text-secondary">Upgrade to Pro for unlimited analyses</div>
                  </div>
                </div>
                <button className="btn-primary">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                disabled
                className="w-full p-3 surface-tertiary text-tertiary rounded-lg cursor-not-allowed text-left opacity-50"
              >
                <div className="font-medium">Analyze New Article</div>
                <div className="text-sm">Upgrade to unlock</div>
              </button>
              <button 
                disabled
                className="w-full p-3 surface-tertiary text-tertiary rounded-lg cursor-not-allowed text-left opacity-50"
              >
                <div className="font-medium">Compare with Competitor</div>
                <div className="text-sm">Upgrade to unlock</div>
              </button>
              <button className="w-full p-3 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors text-left">
                <div className="font-medium">View Pricing Plans</div>
                <div className="text-sm opacity-90">Unlock all features</div>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-secondary" />
                <div>
                  <div className="font-medium text-primary">Free Plan</div>
                  <div className="text-sm text-secondary">2 analyses per month</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-secondary" />
                <div>
                  <div className="font-medium text-primary">Next Reset</div>
                  <div className="text-sm text-secondary">January 1, 2025</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-secondary" />
                <div>
                  <div className="font-medium text-primary">Member Since</div>
                  <div className="text-sm text-secondary">December 2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tip */}
          <div className="bg-gradient-to-br from-info/10 to-accent-primary/10 border border-info/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-info rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary">AI Tip of the Day</h3>
            </div>
            <p className="text-secondary text-sm leading-relaxed">
              Structure your content with clear H2 and H3 headings. AI Overviews prefer well-organized content that's easy to scan and understand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};