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
          setMonthlyLimit(subscriptionData?.monthly_analysis_limit ?? subscriptionData?.analysis_limit ?? 2);
          setProjectLimit(subscriptionData?.project_limit ?? subscriptionData?.projectLimit ?? 1);
          // support both field names: monthly_comparison_limit or comparison_limit
          setComparisonLimit(subscriptionData?.monthly_comparison_limit ?? subscriptionData?.comparison_limit ?? 2);

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
            // Helper to compute score from multiple shapes
            const computeScore = (r: any): number | null => {
              if (!r || typeof r !== 'object') return null;
              // Single analysis shape
              const direct = [r.readability, r.factuality, r.structure, r.qa_format, r.structured_data, r.authority]
                .map((v: any) => (typeof v === 'number' ? v : 0));
              const directValid = direct.filter((v: number) => v > 0);
              if (directValid.length) return Math.round(directValid.reduce((a: number, b: number) => a + b, 0) / directValid.length);

              // Comparison summary
              if (typeof r.overallUserReadinessScore === 'number') return Math.round(r.overallUserReadinessScore);
              if (r.user_analysis) {
                const ua = r.user_analysis;
                const vals = [ua.readability, ua.factuality, ua.structure, ua.qa_format, ua.structured_data, ua.authority]
                  .map((v: any) => (typeof v === 'number' ? v : 0));
                const ok = vals.filter((v: number) => v > 0);
                if (ok.length) return Math.round(ok.reduce((a: number, b: number) => a + b, 0) / ok.length);
              }

              // Keyword analysis: no numeric metrics → exclude from average
              if (r.analysis_type === 'keyword_analysis') return null;
              return null;
            };

            const scores = analyses
              .map((row) => computeScore((row as any).analysis_results || {}))
              .filter((s): s is number => typeof s === 'number' && isFinite(s));

            const avgScore = scores.length 
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
              : 0;
            setAverageScore(avgScore);

            // إعداد التحليلات الحديثة للعرض
            const recentItems = analyses.map((row: any) => {
              const r = row.analysis_results || {};
              const score = computeScore(r) ?? 0;
              const type = r.analysis_type === 'comparison' ? 'comparison' : (r.analysis_type === 'keyword_analysis' ? 'keyword' : 'analysis');
              const title = type === 'comparison' ? 'URL Comparison' : (type === 'keyword' ? 'Keyword Analysis' : 'Content Analysis');
              return {
                title,
                url: row.url || 'N/A',
                score,
                time: new Date(row.created_at).toLocaleString(),
                type
              };
            });

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
      {/* Enhanced Header with Gradient */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-3xl border border-emerald-500/40 shadow-2xl mb-6">
          <Crown className="w-10 h-10 text-emerald-300" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-4">
          Welcome back!
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Here's what's happening with your content analysis and performance insights.
        </p>
      </div>

      {/* Enhanced Plan Status Banners */}
      {limitReached && (
        <div className="bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-700/10 border border-red-500/30 rounded-2xl p-8 animate-scaleIn mb-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400/30 to-red-600/30 rounded-2xl flex items-center justify-center border border-red-500/40 shadow-lg">
                <AlertCircle className="w-8 h-8 text-red-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Monthly Limit Reached</h3>
                <p className="text-gray-300 text-lg">You've used {(analysesUsed ?? 0)}/{monthlyLimit ?? 5} analyses this month. Upgrade for more!</p>
              </div>
            </div>
            <button 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 whitespace-nowrap" 
              onClick={() => window.dispatchEvent(new Event('open-pricing'))}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Free Plan Banner */}
      {!isSubscribed && !limitReached && (
        <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-700/10 border border-yellow-500/30 rounded-2xl p-8 animate-scaleIn mb-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-2xl flex items-center justify-center border border-yellow-500/40 shadow-lg">
                <Zap className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">You're on the Free Plan</h3>
                <p className="text-gray-300 text-lg">You've used {(analysesUsed ?? 0)}/{monthlyLimit ?? 5} analyses this month. Upgrade for more!</p>
              </div>
            </div>
            <button 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/25 hover:scale-105 whitespace-nowrap" 
              onClick={() => window.dispatchEvent(new Event('open-pricing'))}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Active Subscription Banner */}
      {isSubscribed && subscription && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/10 to-emerald-700/10 border border-emerald-500/30 rounded-2xl p-8 animate-scaleIn mb-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-2xl flex items-center justify-center border border-emerald-500/40 shadow-lg">
                <Crown className="w-8 h-8 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">You're on the {subscription.plan_name || 'Premium'} Plan</h3>
                <p className="text-gray-300 text-lg">{subscription.plan_description || 'Premium features'} • Full access to all features</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2">
                <div className="text-sm text-emerald-200 font-medium">Active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-scaleIn shadow-2xl hover:shadow-emerald-500/25"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                {stat.title === 'Analyses Used' && (
                  <span className="text-sm text-emerald-200 font-medium bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1">
                    {(analysesUsed ?? 0)}/{monthlyLimit ?? 5}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-emerald-200 mb-1">{stat.title}</div>
              <div className="text-xs text-gray-400">{stat.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Smart CTA Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-500/40">
                <BarChart3 className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="font-semibold text-white text-lg">Analyze New Article</h3>
            </div>
            <button 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105" 
              onClick={() => window.dispatchEvent(new Event('open-analyzer'))}
            >
              Open
            </button>
          </div>
          <p className="text-sm text-gray-300">Run AI analysis on a new URL and save results to your workspace.</p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-xl flex items-center justify-center border border-blue-500/40">
                <Target className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="font-semibold text-white text-lg">Competitor Comparison</h3>
            </div>
            <button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105" 
              onClick={() => window.dispatchEvent(new Event('open-comparison'))}
            >
              Open
            </button>
          </div>
          <p className="text-sm text-gray-300">Compare your article against a competitor and get actionable suggestions.</p>
        </div>
        
        {!isSubscribed && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-xl flex items-center justify-center border border-yellow-500/40">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <h3 className="font-semibold text-white text-lg">Upgrade to Unlock More</h3>
              </div>
              <button 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105" 
                onClick={() => window.dispatchEvent(new Event('open-pricing'))}
              >
                Upgrade
              </button>
            </div>
            <p className="text-sm text-gray-300">Increase your monthly quota and access advanced analytics.</p>
          </div>
        )}
      </div>

      {/* Enhanced Main Content Grid */}
      <div className="grid xl:grid-cols-3 gap-8">
        {/* Enhanced Recent Analyses */}
        <div className="xl:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-500/40">
                  <BarChart3 className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Recent Analyses</h3>
              </div>
              <button 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105" 
                onClick={() => window.dispatchEvent(new Event('open-analyzer'))}
              >
                New Analysis
              </button>
            </div>
            <div className="space-y-4">
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 bg-gray-800/30 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        analysis.type === 'analysis' ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-blue-500/20 border-blue-500/40'
                      }`}>
                        {analysis.type === 'analysis' ? (
                          <BarChart3 className="w-6 h-6 text-emerald-300" />
                        ) : (
                          <Target className="w-6 h-6 text-blue-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-lg">{analysis.title}</div>
                        <div className="text-sm text-gray-300">{analysis.url}</div>
                        <div className="text-xs text-gray-400">{analysis.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        analysis.score >= 80 ? 'text-emerald-400' : 
                        analysis.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {analysis.score}
                      </div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-20 h-20 bg-gray-800/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                    <BarChart3 className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-lg mb-2">No analyses yet.</p>
                  <p className="text-sm">Start analyzing content to see your results here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-lg flex items-center justify-center border border-emerald-500/40">
                <Zap className="w-4 h-4 text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-4">
              <button 
                disabled={limitReached}
                onClick={() => window.dispatchEvent(new Event('open-analyzer'))}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                  !limitReached 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105' 
                    : 'bg-gray-800/30 text-gray-400 cursor-not-allowed opacity-50 border border-gray-700/50'
                }`}
              >
                <div className="font-semibold text-lg">Analyze New Article</div>
                <div className="text-sm opacity-90">{!limitReached ? 'Start analyzing content' : 'Monthly limit reached'}</div>
              </button>
              
              <button 
                disabled={limitReached}
                onClick={() => window.dispatchEvent(new Event('open-comparison'))}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                  !limitReached 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105' 
                    : 'bg-gray-800/30 text-gray-400 cursor-not-allowed opacity-50 border border-gray-700/50'
                }`}
              >
                <div className="font-semibold text-lg">Compare with Competitor</div>
                <div className="text-sm opacity-90">{!limitReached ? 'Compare your content' : 'Monthly limit reached'}</div>
              </button>
              
              {!isSubscribed && (
                <button 
                  className="w-full p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 text-left hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105" 
                  onClick={() => window.dispatchEvent(new Event('open-pricing'))}
                >
                  <div className="font-semibold text-lg">View Pricing Plans</div>
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