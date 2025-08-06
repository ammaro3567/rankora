import React from 'react';
import { Check, Star, Zap, TrendingUp } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      analyses: '2 analyses per month',
      features: [
        'Basic content analysis',
        'Readability scores',
        'Factuality assessment', 
        'Structure evaluation',
        'Email support'
      ],
      buttonText: 'Get Started Free',
      buttonClass: 'border-2 border-primary-cta text-primary-cta hover:bg-primary-cta hover:text-white',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'month',
      description: 'For content professionals',
      analyses: '100 analyses per month',
      features: [
        'Everything in Free',
        'Competitor comparison',
        'Advanced AI insights',
        'Detailed recommendations',
        'Priority support',
        'Export reports (PDF)',
        'Historical data tracking'
      ],
      buttonText: 'Start Pro Trial',
      buttonClass: 'bg-primary-cta hover:bg-emerald-600 text-white',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      description: 'For teams and agencies',
      analyses: 'Unlimited analyses',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom integrations',
        'API access',
        'White-label reports',
        'Dedicated account manager',
        'Custom training sessions'
      ],
      buttonText: 'Contact Sales',
      buttonClass: 'bg-gray-800 hover:bg-gray-700 text-white dark:bg-gray-600 dark:hover:bg-gray-500',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background-color pt-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-cta/5 rounded-full blur-3xl animate-floating-shapes"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-cta/3 rounded-full blur-3xl animate-bounce-soft" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-20 w-20 h-20 bg-primary-cta/8 rounded-lg rotate-45 animate-rotate-slow"></div>
      <div className="absolute bottom-1/3 left-20 w-24 h-24 bg-primary-cta/6 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-accent-light border border-border-color rounded-full text-primary-cta text-lg font-semibold">
              💰 Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Start free with 2 analyses per month, then upgrade as you grow. 
            No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-card-background border rounded-2xl p-8 transition-all duration-300 hover:shadow-xl animate-scale-in ${
                plan.popular 
                  ? 'border-primary-cta shadow-lg scale-105 animate-gentle-glow' 
                  : 'border-border-color hover:border-primary-cta/50'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-cta text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-text-primary">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-text-secondary">/{plan.period}</span>}
                </div>
                <p className="text-text-secondary mb-4">{plan.description}</p>
                <div className="bg-accent-light border border-border-color rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5 text-primary-cta" />
                    <span className="font-semibold text-text-primary">{plan.analyses}</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary-cta flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 hover:shadow-md ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary">
              Everything you need to know about our pricing plans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card-background border border-border-color rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                What happens when I exceed my analysis limit?
              </h3>
              <p className="text-text-secondary">
                On the Free plan, you'll need to wait until next month or upgrade to Pro. 
                Pro and Enterprise plans include higher limits with optional overages.
              </p>
            </div>

            <div className="bg-card-background border border-border-color rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-text-secondary">
                Yes! You can cancel your subscription at any time. You'll continue to have 
                access until the end of your current billing period.
              </p>
            </div>

            <div className="bg-card-background border border-border-color rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-text-secondary">
                We offer a 14-day money-back guarantee for all paid plans. 
                If you're not satisfied, we'll provide a full refund.
              </p>
            </div>

            <div className="bg-card-background border border-border-color rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Is there a free trial for Pro plans?
              </h3>
              <p className="text-text-secondary">
                Yes! You get a 7-day free trial of the Pro plan with full access 
                to all features. No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-accent-light border border-border-color rounded-2xl p-12">
          <div className="max-w-2xl mx-auto">
            <TrendingUp className="w-16 h-16 text-primary-cta mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Ready to Optimize Your Content?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Join thousands of content creators who've improved their rankings with Rankora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-cta hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg">
                Start Free Analysis
              </button>
              <button className="border-2 border-primary-cta text-primary-cta hover:bg-primary-cta hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};