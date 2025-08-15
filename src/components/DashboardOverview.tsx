import React from 'react';
import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Crown,
  Zap,
  AlertCircle,
  Infinity,
  Folder
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { getMonthlyUsageCounts, getUserSubscriptionInfo, checkUserLimits } from '../lib/supabase';
import { listProjects } from '../lib/supabase';

export const DashboardOverview: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysesUsed, setAnalysesUsed] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [memberSince, setMemberSince] = useState<string>('');
  const [comparisonsUsed, setComparisonsUsed] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | undefined>(undefined);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [projectLimit, setProjectLimit] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (!user?.id) return;
        
        // Get subscription info using new functions
        const sub = await getUserSubscriptionInfo(user.id);
        setSubscription(sub);
        
        // Get user limits
        const limits = await checkUserLimits(user.id);
        if (limits) {
          setMonthlyLimit(limits.analyses_limit);
          setProjectLimit(limits.projects_limit);
        }
        
        // Get projects count
        const projects = await listProjects();
        setProjectsCount(projects.length);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
    
    // Fetch usage counts (current month)
    const fetchUsage = async () => {
      try {
        const usage = await getMonthlyUsageCounts();
        console.log('📊 Dashboard usage data:', usage);
        setAnalysesUsed(usage.analyses); // Use analyses count, not total
        setComparisonsUsed(usage.comparisons);
      } catch (error) {
        console.error('Error fetching usage:', error);
        setAnalysesUsed(0);
        setComparisonsUsed(0);
      }
    };
    fetchUsage();

            // Fetch user analyses stats for average score calculation (last 30 days)
        const fetchAnalysesStats = async () => {
          if (!user?.id) return;
          
          const since = new Date();
          since.setDate(since.getDate() - 30);
          const { data, error } = await supabase
            .from('user_analyses')
            .select('analysis_results, created_at')
            .eq('clerk_user_id', user.id)
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false });
          if (error) {
            console.warn('Failed to fetch analyses for stats', error);
            return;
          }
          if (data && data.length) {
            const scores = data.map((row: any) => {
              const r = row.analysis_results || {};
              const vals = [r.readability, r.factuality, r.structure, r.qa_format, r.structured_data, r.authority]
                .map((v: any) => (typeof v === 'number' ? v : 0));
              const valid = vals.filter((v: number) => v > 0);
              if (!valid.length) return 0;
              return Math.round(valid.reduce((a: number, b: number) => a + b, 0) / valid.length);
            });
            const validScores = scores.filter((s) => s > 0);
            const avg = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
            setAverageScore(avg);
          } else {
            setAverageScore(0);
          }
        };

    fetchAnalysesStats();

    // Member since from Clerk user metadata
    if (user?.createdAt) {
      const d = new Date(user.createdAt);
      setMemberSince(d.toLocaleDateString());
    }
  }, [user?.id]);

  const getSubscriptionDetails = () => {
    if (!subscription?.price_id) return null;
            return subscription?.plan_name || 'Free';
  };

  const subscriptionDetails = getSubscriptionDetails();
  const isSubscribed = subscription && subscription.status === 'active';
  const planName = subscription?.plan_name || 'Free';
  const limitReached = monthlyLimit !== undefined && analysesUsed >= monthlyLimit;

  const stats = [
    {
      title: 'Analyses Used',
      value: String(analysesUsed),
      subtitle: 'This month',
      icon: BarChart3,
      color: 'text-accent-primary',
      bgColor: 'bg-accent-primary/10',
      trend: null
    },
    {
      title: 'Comparisons Used',
      value: String(comparisonsUsed),
      subtitle: 'This month',
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
      trend: null
    },
    {
      title: 'Average Score',
      value: String(averageScore || 0),
      subtitle: averageScore ? 'Based on last 30 days' : 'No data yet',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: null
    },
    {
      title: 'Current Plan',
      value: planName,
      subtitle: isSubscribed ? 'Active subscription' : 'Upgrade available',
      icon: Crown,
      color: isSubscribed ? 'text-success' : 'text-warning',
      bgColor: isSubscribed ? 'bg-success/10' : 'bg-warning/10',
      trend: null
    },
    {
      title: 'Projects Used',
      value: `${projectsCount}${projectLimit !== undefined ? `/${projectLimit}` : ''}`,
              subtitle: `${projectsCount} of ${projectLimit || 1} projects`,
      icon: Folder,
      color: 'text-info',
      bgColor: 'bg-info/10',
      trend: null
    }
  ];

  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('user_analyses')
        .select('url, result, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) {
        const items = data.map((row: any) => ({
          title: 'Content Analysis',
          url: row.url,
          score: (() => {
            const r = row.result || {};
            const vals = [r.readability, r.factuality, r.structure, r.qa_format, r.structured_data, r.authority]
              .map((v: any) => (typeof v === 'number' ? v : 0));
            const valid = vals.filter((v: number) => v > 0);
            return valid.length ? Math.round(valid.reduce((a: number, b: number) => a + b, 0) / valid.length) : 0;
          })(),
          time: new Date(row.created_at).toLocaleString(),
      type: 'analysis'
        }));
        setRecentAnalyses(items);
      }
    };
    loadRecent();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome back!</h1>
        <p className="text-secondary">Here's what's happening with your content analysis.</p>
      </div>

      {/* Plan Status Banner */}
      {limitReached && (
      <div className="limit-banner rounded-xl p-6 animate-scaleIn mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Monthly Limit Reached</h3>
              <p className="text-secondary">You've used {analysesUsed}/{monthlyLimit} analyses this month. Upgrade for more!</p>
            </div>
          </div>
          <button className="btn-primary whitespace-nowrap" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>
            Upgrade Now
          </button>
        </div>
      </div>
      )}
      
      {/* Free Plan Banner */}
      {!isSubscribed && !limitReached && (
      <div className="surface-primary border border-warning/30 rounded-xl p-6 animate-scaleIn mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">You're on the Free Plan</h3>
              <p className="text-secondary">You've used {analysesUsed}/{monthlyLimit} analyses this month. Upgrade for more!</p>
            </div>
          </div>
          <button className="btn-primary whitespace-nowrap" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>
            Upgrade Now
          </button>
        </div>
      </div>
      )}

      {/* Active Subscription Banner */}
      {isSubscribed && subscriptionDetails && (
        <div className="surface-primary border border-success/30 rounded-xl p-6 animate-scaleIn mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">You're on the {subscriptionDetails.name} Plan</h3>
                <p className="text-secondary">{subscriptionDetails.description} • Full access to all features</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-success">${subscriptionDetails.price}/month</div>
              <div className="text-sm text-secondary">Active</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Owner Banner */}
      {false && (
        <div className="surface-primary border border-accent-primary/30 rounded-xl p-6 animate-scaleIn mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                <Infinity className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Owner Account</h3>
                <p className="text-secondary">Unlimited analyses • Full system access</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-accent-primary">Unlimited</div>
              <div className="text-sm text-secondary">Owner</div>
            </div>
          </div>
        </div>
      )}

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
                {stat.title === 'Analyses Used' && (
                  <span className="text-sm text-secondary">
                    {analysesUsed}/{monthlyLimit === undefined ? '∞' : monthlyLimit}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-secondary">{stat.title}</div>
              <div className="text-xs text-tertiary mt-2">{stat.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Smart CTA Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-accent-primary" />
              <h3 className="font-semibold text-primary">Analyze New Article</h3>
            </div>
            <button className="btn-primary" onClick={() => window.dispatchEvent(new Event('open-analyzer'))}>Open</button>
          </div>
          <p className="text-sm text-secondary">Run AI analysis on a new URL and save results to your workspace.</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-info" />
              <h3 className="font-semibold text-primary">Competitor Comparison</h3>
            </div>
            <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event('open-comparison'))}>Open</button>
          </div>
          <p className="text-sm text-secondary">Compare your article against a competitor and get actionable suggestions.</p>
        </div>
        {!isSubscribed && (
          <div className="card border-warning/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-primary">Upgrade to Unlock More</h3>
              </div>
              <button className="btn-primary" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>Upgrade</button>
            </div>
            <p className="text-sm text-secondary">Increase your monthly quota and access advanced analytics.</p>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid xl:grid-cols-3 gap-8">
        {/* Recent Analyses */}
        <div className="xl:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">Recent Analyses</h3>
              <button className="btn-secondary" onClick={() => window.dispatchEvent(new Event('open-analyzer'))}>New Analysis</button>
            </div>
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors duration-200 border border-primary"
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
            
            {/* Usage CTA now moved to Smart CTA Row above */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                disabled={limitReached}
                onClick={() => window.dispatchEvent(new Event('open-analyzer'))}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  !limitReached 
                    ? 'bg-accent-primary text-white hover:bg-accent-secondary' 
                    : 'surface-tertiary text-tertiary cursor-not-allowed opacity-50'
                }`}
              >
                <div className="font-medium">Analyze New Article</div>
                <div className="text-sm">{!limitReached ? 'Start analyzing content' : 'Monthly limit reached'}</div>
              </button>
              <button 
                disabled={limitReached}
                onClick={() => window.dispatchEvent(new Event('open-comparison'))}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  !limitReached 
                    ? 'bg-accent-primary text-white hover:bg-accent-secondary' 
                    : 'surface-tertiary text-tertiary cursor-not-allowed opacity-50'
                }`}
              >
                <div className="font-medium">Compare with Competitor</div>
                <div className="text-sm">{!limitReached ? 'Compare your content' : 'Monthly limit reached'}</div>
              </button>
              {!isSubscribed && (
              <button className="w-full p-3 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors text-left" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>
                <div className="font-medium">View Pricing Plans</div>
                <div className="text-sm opacity-90">Unlock all features</div>
              </button>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};