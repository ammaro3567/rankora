import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Home, BarChart3 } from 'lucide-react';
import { getUserSubscription } from '../lib/paypal';

interface SuccessPageProps {
  onNavigate: (page: string) => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onNavigate }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Get subscription from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const clerkUserId = urlParams.get('clerk_user_id') || localStorage.getItem('clerk_user_id');
        
        if (clerkUserId) {
          const sub = await getUserSubscription(clerkUserId);
          setSubscription(sub);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getPlanName = (subscription: any) => {
    if (!subscription) return 'Free';
    
    // Map plan IDs to names
    const planMap: { [key: number]: string } = {
      2: 'Starter',
      3: 'Pro',
      4: 'Business'
    };
    
    return planMap[subscription.plan_id] || 'Free';
  };

  const getPlanFeatures = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return ['30 Analyses/month', '3 Projects', 'Basic Support'];
      case 'pro':
        return ['100 Analyses/month', '10 Projects', 'Priority Support'];
      case 'business':
        return ['300 Analyses/month', '25 Projects', 'Dedicated Support'];
      default:
        return ['Limited Analyses', 'Basic Features'];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  const planName = getPlanName(subscription);
  const features = getPlanFeatures(planName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{top: '15%', left: '5%', animation: 'float 20s ease-in-out infinite'}}></div>
        <div className="absolute w-80 h-80 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{top: '65%', right: '5%', animation: 'float 25s ease-in-out infinite reverse'}}></div>
        <div className="absolute w-60 h-60 bg-gradient-to-r from-emerald-400/8 to-emerald-500/8 rounded-full blur-3xl animate-pulse" style={{top: '40%', left: '70%', animation: 'float 30s ease-in-out infinite'}}></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.2; }
        }
      `}</style>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Enhanced Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-3xl border border-emerald-500/40 shadow-2xl mb-8 animate-bounce">
            <CheckCircle className="w-14 h-14 text-emerald-300" />
          </div>

          {/* Enhanced Success Message */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-6">
            Welcome to {planName}!
          </h1>
          <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Your subscription has been activated successfully. You now have access to all {planName} features.
          </p>

          {/* Enhanced Plan Details */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl p-10 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">
              Your {planName} Plan Includes:
            </h2>
            <div className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center space-x-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-gray-200 text-xl font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-primary flex items-center justify-center space-x-2 px-8 py-3"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="btn-secondary flex items-center justify-center space-x-2 px-8 py-3"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@rankora.com" className="text-emerald-600 hover:text-emerald-700 underline">
                support@rankora.com
              </a>
            </p>
            <p className="text-xs text-gray-400">
              You'll receive a confirmation email shortly with your subscription details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};