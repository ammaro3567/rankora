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
  const planLimit = subscription?.monthly_analysis_limit || 5;
  const comparisonLimit = subscription?.monthly_comparison_limit || 2;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">Billing & Subscription</h1>
        <p className="text-secondary">Manage your subscription and view usage</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">{planName}</h2>
                  <p className="text-secondary">
                    {isSubscribed ? 'Active Subscription' : 'Free Tier'}
                  </p>
                </div>
              </div>
              {isSubscribed && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              )}
            </div>

            {/* Plan Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                      width: `${comparisonLimit === -1 ? 0 : Math.min((usage?.comparisons || 0) / comparisonLimit * 100, 100)}` 
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
