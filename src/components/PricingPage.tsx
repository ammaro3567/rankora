import React, { useState, useEffect } from 'react';
import { Check, Star, Crown, Zap, Target, X } from 'lucide-react';

// Define the plan structure directly in the component
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  hostedButtonId: string;
  features: string[];
  icon: React.ReactNode;
}

declare global {
  interface Window {
    paypal: any;
  }
}

interface PricingPageProps {
  onBack?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [mounted, setMounted] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  // Define plans directly in the component
  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: '30 Analyses/month',
      price: 10,
      hostedButtonId: 'QGMSH6CSQNBD6',
      features: [
        'AI-powered content analysis',
        'Detailed scoring reports',
        'Competitor comparison',
        'Project management',
        'Email support'
      ],
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'pro',
      name: 'Pro',
      description: '100 Analyses/month',
      price: 30,
      hostedButtonId: 'VUK8HZK8RAK6E',
      features: [
        'AI-powered content analysis',
        'Detailed scoring reports',
        'Competitor comparison',
        'Project management',
        'Email support',
        'Priority support',
        'Advanced analytics',
        'Custom recommendations'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'business',
      name: 'Business',
      description: '300 Analyses/month',
      price: 70,
      hostedButtonId: 'XSY3PB8G6TEUS',
      features: [
        'AI-powered content analysis',
        'Detailed scoring reports',
        'Competitor comparison',
        'Project management',
        'Email support',
        'Priority support',
        'Advanced analytics',
        'Custom recommendations',
        'Team collaboration',
        'Bulk analysis',
        'Advanced reporting',
        'Dedicated account manager'
      ],
      icon: <Crown className="w-6 h-6" />
    }
  ];

  const openPayPalModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // Load PayPal SDK dynamically
  useEffect(() => {
    const loadPayPalSDK = () => {
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      
      if (!clientId) {
        console.warn('PayPal Client ID not configured');
        setPaypalError('PayPal not configured. Please check PayPal Client ID settings.');
        return;
      }

      // Check if PayPal script already exists to prevent duplication
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript && window.paypal) {
        setPaypalLoaded(true);
        setPaypalError(null);
        return;
      }

      // Remove existing script if it exists but PayPal is not available
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        setPaypalError(null);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        setPaypalError('Failed to load PayPal SDK. Please check your internet connection and try again.');
      };
      
      document.head.appendChild(script);
    };

    setMounted(true);
    loadPayPalSDK();
  }, []);

  // Render PayPal hosted button when modal opens
  useEffect(() => {
    if (showModal && selectedPlan?.hostedButtonId && paypalLoaded && window.paypal && window.paypal.HostedButtons) {
      const containerId = `paypal-hosted-button-container-${selectedPlan.hostedButtonId}`;
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; // Clear previous buttons
        try {
          window.paypal.HostedButtons({
            hostedButtonId: selectedPlan.hostedButtonId
          }).render(`#${containerId}`);
        } catch (error) {
          console.error('Failed to render PayPal button:', error);
          setPaypalError('Failed to load PayPal button. Please try again.');
          container.innerHTML = `
            <div class="text-center p-4">
              <p class="text-red-500 text-sm">PayPal button failed to load</p>
              <p class="text-gray-500 text-xs mt-2">Please refresh the page and try again</p>
            </div>
          `;
        }
      }
    }
  }, [showModal, selectedPlan, paypalLoaded]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
            >
              ← Back
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered content analysis with our flexible subscription plans
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.id === 'pro' ? 'border-emerald-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    {plan.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {plan.description}
                </p>

                <div className="text-center mb-8">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openPayPalModal(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.id === 'pro'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  Choose this plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PayPal Modal */}
        {showModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Your {selectedPlan.name} Subscription
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  You're about to subscribe to the <strong>{selectedPlan.name}</strong> plan for{' '}
                  <strong>${selectedPlan.price}/month</strong>.
                </p>
                <p className="text-sm text-gray-500">
                  Click the PayPal button below to complete your payment securely.
                </p>
              </div>

              {paypalError ? (
                <div className="text-center p-4">
                  <p className="text-red-500 text-sm mb-2">{paypalError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-emerald-600 hover:text-emerald-700 text-sm underline"
                  >
                    Refresh page
                  </button>
                </div>
              ) : !paypalLoaded ? (
                <div className="text-center p-4">
                  <div className="loading-spinner w-8 h-8 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading PayPal...</p>
                </div>
              ) : (
                <div
                  id={`paypal-hosted-button-container-${selectedPlan.hostedButtonId}`}
                  className="w-full"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};