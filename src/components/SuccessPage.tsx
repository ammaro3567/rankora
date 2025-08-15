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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {planName}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your subscription has been activated successfully. You now have access to all {planName} features.
          </p>

          {/* Plan Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Your {planName} Plan Includes:
            </h2>
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="text-gray-700 text-lg">{feature}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Your subscription will automatically renew each month.
                <br />
                You can manage your subscription anytime from your account settings.
              </p>
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