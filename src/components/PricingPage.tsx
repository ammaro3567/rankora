import React, { useState, useEffect } from 'react';
import { Star, Zap, Crown, X, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { AnimatedBackground } from './AnimatedBackground';

// Define the plan structure directly in the component
interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  paypalPlanId: string;
}

declare global {
  interface Window {
    paypal: any;
    Clerk: any;
  }
}

interface PricingPageProps {
  onBack?: () => void;
  embedded?: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack, embedded = false }) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [mounted, setMounted] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Define plans directly in the component
  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 10,
      originalPrice: 20,
      description: 'Perfect for individuals and small projects',
      features: [
        '30 AI analyzers',
        '10 comparison analyses', 
        '5 projects',
        'Email support'
      ],
      icon: <Star className="w-6 h-6" />,
      paypalPlanId: import.meta.env.VITE_PAYPAL_STARTER_PLAN_ID || 'P-4U172182GD1125018NCRYJ2Q'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 30,
      originalPrice: 60,
      description: 'Ideal for growing businesses and teams',
      features: [
        '100 AI analyzers',
        '50 comparison analyses',
        '20 projects',
        'Priority email support',
        'Advanced analytics'
      ],
      icon: <Zap className="w-6 h-6" />,
      paypalPlanId: import.meta.env.VITE_PAYPAL_PRO_PLAN_ID || 'P-6AN8622945094324ENCRYKBI'
    },
    {
      id: 'business',
      name: 'Business',
      price: 70,
      originalPrice: 140,
      description: 'Best value for teams and enterprises',
      features: [
        '300 AI analyzers',
        '150 comparison analyses',
        '100 projects',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ],
      icon: <Crown className="w-6 h-6" />,
      paypalPlanId: import.meta.env.VITE_PAYPAL_BUSINESS_PLAN_ID || 'P-7MD84180M2360054PNCRYKII'
    }
  ];

  const openPayPalModal = (plan: Plan) => {
    // Check if user is authenticated
    if (!user) {
      alert('Please sign in to subscribe to a plan.');
      return;
    }

    // Check if PayPal Plan ID is configured
    if (!plan.paypalPlanId) {
      alert(`PayPal plan for ${plan.name} is not configured. Please check your environment variables or contact support.`);
      return;
    }

    // Log the plan ID for debugging
    console.log(`Attempting to open PayPal modal for ${plan.name} with plan ID: ${plan.paypalPlanId}`);

    // Debug: log the plan id only when debug mode is enabled
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`PayPal plan id for ${plan.name}:`, plan.paypalPlanId);
    }

    // Log environment variables for debugging
    console.log('Environment variables:', {
      VITE_PAYPAL_ENV: import.meta.env.VITE_PAYPAL_ENV,
      VITE_PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'CONFIGURED' : 'NOT_CONFIGURED',
      VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE
    });
    
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // Load PayPal SDK dynamically
  useEffect(() => {
    // Load PayPal SDK with correct client ID from environment
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      
      if (!clientId) {
      setPaypalError('PayPal Client ID not configured');
      console.error('PayPal Client ID not configured');
        return;
      }

    console.log('Loading PayPal SDK with client ID:', clientId);
    console.log('PayPal environment:', import.meta.env.VITE_PAYPAL_ENV || 'sandbox');
    console.log('PayPal Plan IDs:', {
      starter: import.meta.env.VITE_PAYPAL_STARTER_PLAN_ID || 'FALLBACK_ID',
      pro: import.meta.env.VITE_PAYPAL_PRO_PLAN_ID || 'FALLBACK_ID',
      business: import.meta.env.VITE_PAYPAL_BUSINESS_PLAN_ID || 'FALLBACK_ID'
    });

      const script = document.createElement('script');
      const paypalEnv = import.meta.env.VITE_PAYPAL_ENV || 'sandbox';
      const paypalUrl = paypalEnv === 'sandbox' ? 'https://www.sandbox.paypal.com/sdk/js' : 'https://www.paypal.com/sdk/js';
    script.src = `${paypalUrl}?client-id=${clientId}&vault=true&intent=subscription&currency=USD`;
      script.async = true;
      script.onload = () => {
      setPaypalLoaded(true);
        console.log('PayPal SDK loaded successfully');
      console.log('PayPal SDK URL used:', script.src);
      console.log('PayPal SDK loaded at:', new Date().toISOString());
      };
      script.onerror = () => {
      setPaypalError('Failed to load PayPal SDK');
        console.error('Failed to load PayPal SDK');
      console.error('Failed to load script from:', script.src);
      console.error('Failed to load at:', new Date().toISOString());
    };
    document.body.appendChild(script);

    // Set mounted to true
    setMounted(true);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function to reload PayPal SDK if needed
  const reloadPayPalSDK = () => {
    if (import.meta.env.VITE_DEBUG_MODE === 'true') console.log('Reloading PayPal SDK...');
    setPaypalLoaded(false);
    setPaypalError(null);
    
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Clear any existing PayPal buttons
    const containers = document.querySelectorAll('[id^="paypal-button-container-"]');
    containers.forEach(container => {
      container.innerHTML = '';
    });
    
    // Reload SDK
    const loadPayPalSDK = () => {
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      const script = document.createElement('script');
      const paypalEnv = import.meta.env.VITE_PAYPAL_ENV || 'sandbox';
      const paypalUrl = paypalEnv === 'sandbox' ? 'https://www.sandbox.paypal.com/sdk/js' : 'https://www.paypal.com/sdk/js';
      script.src = `${paypalUrl}?client-id=${clientId}&vault=true&intent=subscription&currency=USD&components=buttons`;
      script.crossOrigin = 'anonymous';
      script.async = true;
      
      console.log('Reloading PayPal SDK with URL:', script.src);
      
      script.onload = () => {
        if (import.meta.env.VITE_DEBUG_MODE === 'true') console.log('PayPal SDK reloaded');
        setPaypalLoaded(true);
        setPaypalError(null);
        console.log('PayPal SDK reloaded at:', new Date().toISOString());
      };
      script.onerror = () => {
        console.error('Failed to reload PayPal SDK');
        console.error('Failed to reload script from:', script.src);
        console.error('Failed to reload at:', new Date().toISOString());
        setPaypalError('Failed to reload PayPal SDK. Please refresh the page.');
      };
      
      document.head.appendChild(script);
    };
    
    loadPayPalSDK();
  };

  // Handle PayPal payment success
  const handlePaymentSuccess = async (orderID: string, planId: number) => {
    try {
      setLoading(true);
      
      // Get current user from Clerk using the hook
      if (!user) {
        throw new Error('User not authenticated');
      }

      const clerkUserId = user.id;
      
      // Create subscription in Supabase using the correct function signature
      const { data, error } = await supabase.rpc('create_user_subscription', {
        p_clerk_user_id: clerkUserId,
        p_plan_id: planId,
        p_paypal_subscription_id: null, // For one-time payments, this is null
        p_paypal_order_id: orderID
      });

      if (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
      }

      console.log('Subscription created successfully:', data);
      
      // Close modal and show success message
      setShowModal(false);
      alert('Subscription activated successfully! 🎉');
      
      // Optionally redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Payment success handler error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      alert('Payment successful but failed to activate subscription. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (plan: Plan) => {
    try {
      console.log('Creating PayPal subscription for plan:', plan);
      
      // Create subscription instead of order
      const response = await fetch('/api/create-paypal-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.paypalPlanId,
          userId: user?.id,
          planName: plan.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { subscriptionId } = await response.json();
      
      // Redirect to PayPal for subscription approval
      window.location.href = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=${encodeURIComponent(process.env.VITE_PAYPAL_MERCHANT_EMAIL || '')}&item_name=${encodeURIComponent(plan.name)}&item_number=${subscriptionId}&a3=${plan.price}&p3=1&t3=M&src=1&return=${encodeURIComponent(window.location.origin + '/dashboard?subscription=success')}&cancel_return=${encodeURIComponent(window.location.origin + '/dashboard?subscription=cancelled')}`;
      
    } catch (error) {
      console.error('PayPal subscription error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      setError('Failed to create PayPal subscription. Please try again.');
    }
  };

  const updateUserSubscription = async (planName: string, subscriptionId: string) => {
    try {
      // Update user subscription in database
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          clerk_user_id: user?.id,
          paypal_subscription_id: subscriptionId,
          plan_name: planName,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log('Subscription updated successfully');
      
    } catch (error) {
      console.error('Failed to update subscription:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  };

  // Render PayPal button when modal opens
  useEffect(() => {
    // Don't render PayPal button if Clerk is not loaded or user is not authenticated
    if (!isLoaded || !user) {
      console.log('PayPal button rendering skipped - Clerk not loaded or user not authenticated');
      return;
    }
    
    console.log('PayPal button rendering conditions:', {
      showModal,
      selectedPlan: selectedPlan?.name,
      paypalLoaded,
      hasPayPal: !!window.paypal,
      hasButtons: !!(window.paypal && window.paypal.Buttons)
    });
    
    if (showModal && selectedPlan && paypalLoaded && window.paypal && window.paypal.Buttons) {
      const containerId = `paypal-button-container-${selectedPlan.id}`;
      const container = document.getElementById(containerId);
      console.log('PayPal button container:', {
        containerId,
        containerFound: !!container,
        containerElement: container
      });
      
      console.log('PayPal button rendering started at:', new Date().toISOString());
      
      if (container) {
        container.innerHTML = ''; // Clear previous buttons
        
        console.log('PayPal button container cleared, starting button creation...');
        
        try {
          console.log('Creating PayPal Buttons with configuration:', {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "subscribe"
          });
          
          console.log('PayPal Buttons configuration created, starting button creation...');
          
          window.paypal.Buttons({
            style: {
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "subscribe"
            },
            createSubscription: (data: any, actions: any) => {
              console.log('Creating PayPal subscription for plan:', selectedPlan);
              console.log('Using PayPal Plan ID:', selectedPlan.paypalPlanId);
              console.log('PayPal environment:', import.meta.env.VITE_PAYPAL_ENV || 'sandbox');
              
              return actions.subscription.create({
                'plan_id': selectedPlan.paypalPlanId
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                console.log('Subscription approved:', data);
                console.log('Approval data details:', {
                  subscriptionID: data.subscriptionID,
                  orderID: data.orderID,
                  payerID: data.payerID
                });
                
                // Get subscription details
                const subscription = await actions.subscription.get();
                console.log('Subscription details:', subscription);
                
                // Update user subscription in database
                await updateUserSubscription(selectedPlan.name, subscription.id);
                
                setSuccess(`Successfully subscribed to ${selectedPlan.name}!`);
                setShowSuccessModal(true);
                
              } catch (error) {
                console.error('Subscription capture error:', error);
                if (error instanceof Error) {
                  console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                  });
                }
                setError('Failed to complete subscription. Please try again.');
              }
            },
            onError: (err: any) => {
              console.error('PayPal error:', err);
              console.error('Error details:', {
                name: err.name,
                message: err.message,
                details: err.details,
                code: err.code
              });
              
              let errorMessage = 'PayPal payment failed. Please try again.';
              
              // Check for specific PayPal errors
              if (err.name === 'RESOURCE_NOT_FOUND') {
                errorMessage = `PayPal plan not found (ID: ${selectedPlan.paypalPlanId}). Please check your plan configuration.`;
              } else if (err.name === 'INVALID_REQUEST') {
                errorMessage = 'Invalid request to PayPal. Please try again.';
              } else if (err.name === 'UNPROCESSABLE_ENTITY') {
                errorMessage = 'PayPal plan configuration error. Please contact support.';
              } else if (err.code === 'PLAN_NOT_FOUND') {
                errorMessage = `PayPal plan not found (ID: ${selectedPlan.paypalPlanId}). Please check your plan configuration.`;
              }
              
              setError(errorMessage);
            },
            onCancel: (data: any) => {
              console.log('Payment cancelled by user');
              console.log('Cancellation data:', data);
              setShowModal(false);
            },
            onInit: (data: any, actions: any) => {
              console.log('PayPal button initialized');
              console.log('Initialization data:', data);
            }
          }).render(`#${containerId}`);
            
            console.log('PayPal button rendered successfully in container:', containerId);
            console.log('PayPal button rendering completed at:', new Date().toISOString());
        } catch (error) {
          console.error('Failed to render PayPal button:', error);
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });
          }
          setPaypalError('Failed to load PayPal button. Please try again.');
          container.innerHTML = `
            <div class="text-center p-4">
              <p class="text-red-500 text-sm">PayPal button failed to load</p>
              <p class="text-gray-500 text-xs mt-2">Please refresh the page and try again</p>
            </div>
          `;
          
          console.error('PayPal button rendering failed at:', new Date().toISOString());
        }
      } else {
        console.log('PayPal button container not found:', containerId);
        console.log('Available containers:', document.querySelectorAll('[id^="paypal-button-container-"]'));
      }
    }
  }, [showModal, selectedPlan, paypalLoaded, isLoaded, user]);

  if (!mounted) return null;

  // Build inner content
  const content = (
    <>
        <div className="text-center mb-12">
            {onBack && (
          <button onClick={onBack} className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">← Back</button>
        )}
        <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto">Unlock the full potential of AI-powered content analysis with our flexible subscription plans</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan) => (
          <div key={plan.id} className={`relative surface-primary rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.id === 'pro' ? 'border-accent-primary scale-105' : 'border-primary'}`}>
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</div>
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary">{plan.icon}</div>
                  </div>
              <h3 className="text-2xl font-bold text-primary text-center mb-2">{plan.name}</h3>
              <p className="text-secondary text-center mb-6">{plan.description}</p>
              <div className="text-center mb-8">
                <div className="mb-2 text-sm text-success">Save 50%</div>
                <div className="text-4xl font-bold text-primary">${plan.price}<span className="text-secondary text-base">/month</span></div>
                <div className="text-sm text-tertiary mt-1">
                  {plan.id === 'starter' && (<span><span className="line-through opacity-70 mr-2">$20</span>Limited-time</span>)}
                  {plan.id === 'pro' && (<span><span className="line-through opacity-70 mr-2">$60</span>Launch offer</span>)}
                  {plan.id === 'business' && (<span><span className="line-through opacity-70 mr-2">$140</span>Team deal</span>)}
                </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center"><Check className="w-5 h-5 text-accent-primary mr-3 flex-shrink-0" /><span className="text-secondary">{feature}</span></li>
                  ))}
                </ul>
              <button onClick={() => plan.id === 'free' ? window.location.href = '/dashboard' : openPayPalModal(plan)} className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.id === 'pro' ? 'bg-accent-primary hover:opacity-90 text-white' : 'bg-surface-secondary hover:bg-surface-tertiary text-primary'}`}>Choose this plan</button>
            </div>
            </div>
          ))}
      </div>

        {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Complete Your {selectedPlan.name} Subscription</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="mb-6">
              <p className="text-gray-600 mb-4">You're about to subscribe to the <strong>{selectedPlan.name}</strong> plan for <strong>${selectedPlan.price}/month</strong>.</p>
              <p className="text-sm text-gray-500">Click the PayPal button below to complete your payment securely.</p>
          </div>
              {!isLoaded ? (
              <div className="text-center p-4"><div className="loading-spinner w-8 h-8 mx-auto mb-2"></div><p className="text-gray-500 text-sm">Loading user...</p></div>
              ) : !user ? (
              <div className="text-center p-4"><p className="text-red-500 text-sm mb-2">Please sign in to continue</p><button onClick={() => setShowModal(false)} className="text-emerald-600 hover:text-emerald-700 text-sm underline">Close</button></div>
              ) : loading ? (
              <div className="text-center p-4"><div className="loading-spinner w-8 h-8 mx-auto mb-2"></div><p className="text-gray-500 text-sm">Processing payment...</p></div>
              ) : paypalError ? (
              <div className="text-center p-4"><p className="text-red-500 text-sm mb-2">{paypalError}</p><div className="space-y-2"><button onClick={reloadPayPalSDK} className="text-emerald-600 hover:text-emerald-700 text-sm underline mr-4">Reload PayPal</button><button onClick={() => window.location.reload()} className="text-emerald-600 hover:text-emerald-700 text-sm underline">Refresh page</button></div></div>
              ) : !paypalLoaded ? (
              <div className="text-center p-4"><div className="loading-spinner w-8 h-8 mx-auto mb-2"></div><p className="text-gray-500 text-sm">Loading PayPal...</p></div>
              ) : (
              <div id={`paypal-button-container-${selectedPlan.id}`} className="w-full" />
              )}
        </div>
          </div>
        )}

      {showSuccessModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Subscription Successful!</h3>
              <button onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">You have successfully subscribed to the <strong>{selectedPlan.name}</strong> plan.</p>
              <p className="text-sm text-gray-500">You will be redirected to the dashboard shortly.</p>
            </div>
            <div className="text-center">
              <button onClick={() => window.location.href = '/dashboard'} className="text-emerald-600 hover:text-emerald-700 text-sm underline">Go to Dashboard</button>
            </div>
          </div>
      </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="relative z-10 px-0">{content}</div>;
  }

  return (
    <div className="min-h-screen relative bg-primary">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-4 py-8">{content}</div>
    </div>
  );
};