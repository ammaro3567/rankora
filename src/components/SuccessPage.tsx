import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Home, BarChart3 } from 'lucide-react';
import { getUserSubscription } from '../lib/paypal';
import { getProductByPayPalPlanId } from '../paypal-config';

interface SuccessPageProps {
  onNavigate: (page: string) => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onNavigate }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await getUserSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getSubscriptionDetails = () => {
    if (!subscription?.price_id) return null;
    return getProductByPayPalPlanId(subscription.price_id);
  };

  const subscriptionDetails = getSubscriptionDetails();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="card text-center animate-scaleIn">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-primary mb-4">
            Payment Successful!
          </h1>
          
          {loading ? (
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="loading-spinner w-5 h-5" />
              <span className="text-secondary">Loading subscription details...</span>
            </div>
          ) : subscriptionDetails ? (
            <div className="mb-8">
              <p className="text-xl text-secondary mb-6">
                Welcome to Rankora {subscriptionDetails.name}!
              </p>
              
              {/* Subscription Details */}
              <div className="surface-secondary border border-primary rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Your Subscription</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-secondary text-sm">Plan:</span>
                    <div className="font-semibold text-primary">{subscriptionDetails.name}</div>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Analyses:</span>
                    <div className="font-semibold text-primary">{subscriptionDetails.description}</div>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Price:</span>
                    <div className="font-semibold text-primary">${subscriptionDetails.price}/month</div>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Status:</span>
                    <div className="font-semibold text-success capitalize"> 
                      {subscription.subscription_status?.replace('_', ' ') || 'Active'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xl text-secondary mb-8">
              Your payment has been processed successfully!
            </p>
          )}

          {/* What's Next */}
          <div className="surface-secondary border border-primary rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-primary mb-4 text-center">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-secondary">Your subscription is now active</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-secondary">Full access to all premium features</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-secondary">Confirmation email sent to your inbox</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-secondary">Start analyzing your content immediately</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('analyzer')}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onNavigate('overview')}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-primary">
            <p className="text-secondary text-sm">
              Need help getting started?{' '}
              <button 
                onClick={() => onNavigate('faq')}
                className="text-accent-primary hover:text-accent-secondary transition-colors"
              >
                Check our FAQ
              </button>{' '}
              or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};