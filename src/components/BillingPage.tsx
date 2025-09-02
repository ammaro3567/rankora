import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  CreditCard, 
  Crown, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Target,
  Calendar,
  Zap,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { getUserSubscriptionInfo, getMonthlyUsageCounts } from '../lib/supabase';

interface BillingPageProps {
  onTabChange: (tab: string) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onTabChange }) => {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (user?.id) {
        try {
          const [sub, usageData] = await Promise.all([
            getUserSubscriptionInfo(user.id),
            getMonthlyUsageCounts()
          ]);
          console.log('🔍 [BillingPage] Subscription data:', sub);
          console.log('🔍 [BillingPage] Usage data:', usageData);
          setSubscription(sub);
          setUsage(usageData);
        } catch (error) {
          console.error('Error fetching billing data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBillingData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const isSubscribed = subscription?.status === 'active';
  const planName = subscription?.plan_name || 'Free Plan';
  
  // Handle both field names for analysis limit
  const planLimit = subscription?.monthly_analysis_limit ?? subscription?.analysis_limit ?? 5;
  
  // Handle both field names for comparison limit and provide proper fallbacks
  let comparisonLimit = subscription?.monthly_comparison_limit ?? subscription?.comparison_limit ?? 2;
  
  // If we have a subscription but no comparison limit, try to get it from the plan name
  if (subscription && !subscription.monthly_comparison_limit && !subscription.comparison_limit) {
    switch (subscription.plan_name) {
      case 'Starter':
        comparisonLimit = 10;
        break;
      case 'Pro':
        comparisonLimit = 50;
        break;
      case 'Business':
        comparisonLimit = 150;
        break;
      default:
        comparisonLimit = 2; // Free plan
    }
  }
  
  console.log('🔍 [BillingPage] Processed data:', {
    isSubscribed,
    planName,
    planLimit,
    comparisonLimit,
    subscription: subscription,
    rawComparisonLimit: subscription?.monthly_comparison_limit,
    rawComparisonLimitAlt: subscription?.comparison_limit
  });

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-3xl border border-emerald-500/40 shadow-2xl mb-6">
          <CreditCard className="w-10 h-10 text-emerald-300" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-4">
          Billing & Subscription
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Manage your subscription, view usage statistics, and upgrade your plan.
        </p>
      </div>

      {/* Enhanced Current Plan Status */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-2xl flex items-center justify-center border border-emerald-500/40">
              <Crown className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Current Plan</h2>
              <p className="text-gray-300">Your active subscription details</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-2">{planName}</div>
              <div className="text-sm text-gray-300">Plan Type</div>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {isSubscribed ? 'Active' : 'Free'}
              </div>
              <div className="text-sm text-gray-300">Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-primary font-medium">AI Analysis</p>
                  <p className="text-secondary text-sm">
                    {planLimit === -1 ? 'Unlimited' : `${planLimit} per month`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-primary font-medium">Competitor Comparison</p>
                  <p className="text-secondary text-sm">
                    {comparisonLimit === -1 ? 'Unlimited' : `${comparisonLimit} per month`}
                  </p>
                </div>
              </div>
            </div>

            {/* Upgrade Button */}
            {!isSubscribed && (
              <button
                onClick={() => onTabChange('pricing')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-6">
          {/* Current Month Usage */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Current Month Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-secondary">AI Analysis</span>
                  <span className="text-primary font-medium">
                    {usage?.analyses || 0} / {planLimit === -1 ? '∞' : planLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${planLimit === -1 ? 0 : Math.min((usage?.analyses || 0) / planLimit * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-secondary">Comparisons</span>
                  <span className="text-primary font-medium">
                    {usage?.comparisons || 0} / {comparisonLimit === -1 ? '∞' : comparisonLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${comparisonLimit === -1 ? 0 : Math.min((usage?.comparisons || 0) / comparisonLimit * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onTabChange('analyzer')}
                className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span className="text-primary">New Analysis</span>
              </button>
              <button
                onClick={() => onTabChange('comparison')}
                className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-primary">New Comparison</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      {isSubscribed && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Subscription Details</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-secondary text-sm">Billing Cycle</p>
                <p className="text-primary font-medium">Monthly</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-secondary text-sm">Payment Method</p>
                <p className="text-primary font-medium">PayPal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-secondary text-sm">Status</p>
                <p className="text-primary font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
