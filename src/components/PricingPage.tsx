import React, { useState, useEffect } from 'react';
import { Check, Star, Crown, Zap, Target, X } from 'lucide-react';
import { PAYPAL_PRODUCTS, PayPalProduct } from '../paypal-config';

declare global {
  interface Window {
    paypal: any;
  }
}

export const PricingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PayPalProduct | null>(null);
  const [mounted, setMounted] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  const openPayPalModal = (product: PayPalProduct) => {
    setSelectedProduct(product);
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
    if (showModal && selectedProduct?.hostedButtonId && paypalLoaded && window.paypal && window.paypal.HostedButtons) {
      const containerId = `paypal-hosted-button-container-${selectedProduct.hostedButtonId}`;
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; // Clear previous buttons
        try {
          window.paypal.HostedButtons({
            hostedButtonId: selectedProduct.hostedButtonId
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
  }, [showModal, selectedProduct, paypalLoaded]);

  const getFeatures = (planName: string) => {
    const baseFeatures = [
      'AI-powered content analysis',
      'Detailed scoring reports',
      'Competitor comparison',
      'Project management',
      'Email support'
    ];

    const proFeatures = [
      ...baseFeatures,
      'Priority support',
      'Advanced analytics',
      'Custom recommendations'
    ];

    const businessFeatures = [
      ...proFeatures,
      'Team collaboration',
      'Bulk analysis',
      'Advanced reporting',
      'Dedicated account manager'
    ];

    switch (planName.toLowerCase()) {
      case 'business':
        return businessFeatures;
      case 'pro':
        return proFeatures;
      default:
        return baseFeatures;
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'business':
        return Crown;
      case 'pro':
        return Zap;
      default:
        return Target;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fadeInUp">
        <div className="inline-block mb-6">
          <span className="px-6 py-3 surface-secondary border border-primary rounded-full text-accent-primary text-lg font-semibold">
            💎 Choose Your Plan
          </span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-6">
          Unlock the Power of
          <span className="block text-accent-primary mt-2">AI Content Analysis</span>
        </h1>
        <p className="text-lg text-secondary max-w-3xl mx-auto">
          Choose the perfect plan for your content optimization needs. All plans include our core AI analysis features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch"> {/* items-stretch for equal height */}
        {PAYPAL_PRODUCTS.map((product, index) => {
          const Icon = getPlanIcon(product.name);
          const isPopular = product.name === 'Pro';
          const features = getFeatures(product.name);
          
          return (
            <div
              key={product.id}
              className={`card relative overflow-hidden transition-all duration-300 hover-lift animate-scaleIn pricing-card ${ // pricing-card class
                isPopular ? 'border-accent-primary shadow-xl glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {isPopular && (
                <div className="badge-popular">
                  <Star className="w-3 h-3 mr-1" />
                    <span>Most Popular</span>
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    isPopular ? 'bg-accent-primary' : 'bg-surface-secondary'
                  }`}>
                    <Icon className={`w-8 h-8 ${isPopular ? 'text-white' : 'text-accent-primary'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">{product.name}</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${product.price}
                    <span className="text-lg font-normal text-secondary">/month</span>
                  </div>
                  <p className="text-secondary">{product.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8 flex-1">
                  {features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-secondary text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => openPayPalModal(product)}
                  disabled={paypalError !== null}
                  className={`w-full mt-auto ${
                    paypalError ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
                  }`}
                >
                  {paypalError ? 'PayPal Unavailable' : 'Choose this plan'}
                </button>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-primary">
                  <div className="text-center">
                    <p className="text-xs text-tertiary mb-2">
                      Cancel anytime • No setup fees • 14-day money-back
                    </p>
                    <p className="text-xs text-tertiary">
                      Secure payment powered by PayPal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PayPal Modal */}
      {showModal && selectedProduct && (
        <div 
          className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="card p-8 max-w-md mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-primary mb-4 text-center">Subscribe to {selectedProduct.name}</h3>
            <p className="text-secondary text-center mb-6">You're about to subscribe to the {selectedProduct.name} plan for ${selectedProduct.price}/month.</p>
            
            {paypalError ? (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
                <p className="text-sm font-medium">{paypalError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <div id={`paypal-hosted-button-container-${selectedProduct.hostedButtonId}`} className="min-h-[45px] rounded-lg" />
            )}
            
            <p className="text-xs text-tertiary text-center mt-4">Powered by PayPal. Cancel anytime.</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-8 text-center max-w-sm mx-4">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Processing Payment</h3>
            <p className="text-secondary">Please wait while we set up your subscription...</p>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="card max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-primary mb-6 text-center">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-primary mb-2">Can I change plans anytime?</h4>
            <p className="text-secondary text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">What happens if I cancel?</h4>
            <p className="text-secondary text-sm">You'll continue to have access until the end of your billing period. No cancellation fees.</p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Do you offer refunds?</h4>
            <p className="text-secondary text-sm">Yes, we offer a 14-day money-back guarantee for all paid plans.</p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Is my data secure?</h4>
            <p className="text-secondary text-sm">Absolutely. We use enterprise-grade security and never share your data with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  );
};