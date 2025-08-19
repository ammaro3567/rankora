import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Zap,
  AlertCircle,
  Folder
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase, getUserSubscriptionInfo, getMonthlyUsageCounts, listProjects, usageService } from '../lib/supabase';
import { runSystemDiagnostics } from '../utils/system-diagnostics';

export const DashboardOverview: React.FC = () => {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [_loading, setLoading] = useState(true);
  const [analysesUsed, setAnalysesUsed] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  // memberSince not currently used in UI
  const [comparisonsUsed, setComparisonsUsed] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | undefined>(undefined);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [projectLimit, setProjectLimit] = useState<number | undefined>(undefined);
  const [comparisonLimit, setComparisonLimit] = useState<number | undefined>(undefined);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        // تشغيل التشخيص
        runSystemDiagnostics(user);

        try {
          // Prefer calling RPCs that accept clerk_user_id directly.
          // This avoids relying on set_clerk_user_id/session persistence.
          const subscriptionData = await getUserSubscriptionInfo(user.id);

          setSubscription(subscriptionData);
          setMonthlyLimit(subscriptionData?.monthly_analysis_limit || 2);
          setProjectLimit(subscriptionData?.project_limit || 1);
          setComparisonLimit(subscriptionData?.monthly_comparison_limit || 2);

          // جلب المشاريع باستخدام wrapper
          const projects = await listProjects();
          let pCount = projects.length || 0;
          // كـ fallback، حاول استخدام check_user_limits لإظهار العد الصحيح حتى لو RLS منع القراءة
          try {
            const limits = await (async () => {
              try {
                // نستخدم خدمة الاشتراك المتاحة لدينا لتفادي تمرير RLS، ثم دالة عامة للحدود
                const { data, error } = await supabase.rpc('check_user_limits', { p_clerk_user_id: user.id });
                if (error) throw error;
                return Array.isArray(data) ? data[0] : data;
              } catch (e) {
                return null;
              }
            })();
            if (limits && typeof limits.project_limit === 'number' && typeof limits.project_remaining === 'number') {
              const used = Math.max(0, (limits.project_limit || 0) - (limits.project_remaining || 0));
              pCount = Math.max(pCount, used);
            }
          } catch {}
          setProjectsCount(pCount);

          // جلب التحليلات الأخيرة عبر RPC آمنة
          const analyses = await usageService.getRecentAnalyses(5);

          if (analyses && analyses.length) {
            // حساب متوسط النتائج
            const scores = analyses.map((row) => {
              const r = (row as any).analysis_results || {};
              const vals = [r.readability, r.factuality, r.structure, r.qa_format, r.structured_data, r.authority]
                .map((v: any) => (typeof v === 'number' ? v : 0));
              const valid = vals.filter((v: number) => v > 0);
              return valid.length ? Math.round(valid.reduce((a: number, b: number) => a + b, 0) / valid.length) : 0;
            });

            const validScores = scores.filter((s) => s > 0);
            const avgScore = validScores.length 
              ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
              : 0;
            
            setAverageScore(avgScore);

            // إعداد التحليلات الحديثة للعرض
            const recentItems = analyses.map((row: any) => ({
              title: 'Content Analysis',
              url: row.url || 'N/A',
              score: (() => {
                const r = row.analysis_results || {};
                const vals = [r.readability, r.factuality, r.structure, r.qa_format, r.structured_data, r.authority]
                  .map((v: any) => (typeof v === 'number' ? v : 0));
                const valid = vals.filter((v: number) => v > 0);
                return valid.length ? Math.round(valid.reduce((a: number, b: number) => a + b, 0) / valid.length) : 0;
              })(),
              time: new Date(row.created_at).toLocaleString(),
              type: 'analysis'
            }));

            setRecentAnalyses(recentItems);
          }

          // جلب عدد التحليلات والمقارنات عبر wrapper
          const usageCounts = await getMonthlyUsageCounts();
          setAnalysesUsed(usageCounts?.analyses || 0);
          setComparisonsUsed(usageCounts?.comparisons || 0);

          // تاريخ الانضمام (not used)

        } catch (error) {
          console.error('خطأ في جلب بيانات لوحة التحكم:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    // الاستماع لأحداث إكمال التحليل والمقارنة
    const handleAnalysisCompleted = () => fetchDashboardData();
    const handleComparisonCompleted = () => fetchDashboardData();

    window.addEventListener('analysis-completed', handleAnalysisCompleted);
    window.addEventListener('comparison-completed', handleComparisonCompleted);

    return () => {
      window.removeEventListener('analysis-completed', handleAnalysisCompleted);
      window.removeEventListener('comparison-completed', handleComparisonCompleted);
    };
  }, [user]);

  // subscriptionDetails not required; use subscription directly
  const isSubscribed = !!(subscription && subscription.status === 'active');
  const planName = subscription?.plan_name || 'Free';
  const limitReached: boolean = typeof monthlyLimit === 'number' && analysesUsed >= monthlyLimit;

  const stats = [
    {
      title: 'Analyses Used',
      value: String(analysesUsed),
      subtitle: `This month (${monthlyLimit || 5} limit)`,
      icon: BarChart3,
      color: 'text-accent-primary',
      bgColor: 'bg-accent-primary/10',
      trend: null
    },
    {
      title: 'Comparisons Used',
      value: String(comparisonsUsed),
      subtitle: `This month (${comparisonLimit ?? subscription?.monthly_comparison_limit ?? 2} limit)`,
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
      value: `${projectsCount}/${projectLimit ?? (subscription?.project_limit ?? 1)}`,
      subtitle: `${projectsCount} of ${projectLimit ?? (subscription?.project_limit ?? 1)} projects`,
      icon: Folder,
      color: 'text-info',
      bgColor: 'bg-info/10',
      trend: null
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
      {limitReached && (
      <div className="limit-banner rounded-xl p-6 animate-scaleIn mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Monthly Limit Reached</h3>
              <p className="text-secondary">You've used {(analysesUsed ?? 0)}/{monthlyLimit ?? 5} analyses this month. Upgrade for more!</p>
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
              <p className="text-secondary">You've used {(analysesUsed ?? 0)}/{monthlyLimit ?? 5} analyses this month. Upgrade for more!</p>
            </div>
          </div>
          <button className="btn-primary whitespace-nowrap" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>
            Upgrade Now
          </button>
        </div>
      </div>
      )}

      {/* Active Subscription Banner */}
      {isSubscribed && subscription && (
        <div className="surface-primary border border-success/30 rounded-xl p-6 animate-scaleIn mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">You're on the {subscription.plan_name || 'Premium'} Plan</h3>
                <p className="text-secondary">{subscription.plan_description || 'Premium features'} • Full access to all features</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-secondary">Active</div>
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
                    {(analysesUsed ?? 0)}/{monthlyLimit ?? 5}
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
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis, index) => (
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
                ))
              ) : (
                <div className="text-center py-8 text-secondary">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No analyses yet.</p>
                  <p className="text-sm mt-2">Start analyzing content to see your results here.</p>
                </div>
              )}
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

export default DashboardOverview;