import React, { useState } from 'react';
import { Check, Star, Zap, TrendingUp, CreditCard, Shield, Clock } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$19',
      period: 'month',
      description: 'Perfect for individuals and small teams getting started with SEO.',
      analyses: '30 Analyses / month',
      features: [
        '30 Analyses / month',
        '5 Gap Analyses / month',
        '5 AI Articles / month',
        '3 Projects',
        '25 Tracked Keywords',
        'Email Support',
        'Basic Analytics'
      ],
      buttonText: 'Choose Plan',
      buttonClass: 'btn-secondary',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$39',
      period: 'month',
      description: 'Unlock deeper insights and more automation to help your content rank in AI Overviews.',
      analyses: '100 Analyses / month',
      features: [
        '100 Analyses / month',
        '25 Gap Analyses / month',
        '10 AI Articles / month',
        '10 Projects',
        '100 Tracked Keywords',
        'Priority Support',
        'Advanced Analytics',
        'Competitor Tracking',
        'Export Reports (PDF)',
        'API Access'
      ],
      buttonText: 'Choose Plan',
      buttonClass: 'btn-primary',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '$79',
      period: 'month',
      description: 'Manage a portfolio of websites with high-volume AI analyses, smart tracking, and optimization at scale.',
      analyses: '300 Analyses / month',
      features: [
        '300 Analyses / month',
        '60 Gap Analyses / month',
        '60 AI Articles / month',
        '30 Projects',
        '300 Tracked Keywords',
        'Dedicated Support',
        'Custom Analytics',
        'Team Collaboration',
        'White-label Reports',
        'Advanced API Access',
        'Custom Integrations'
      ],
      buttonText: 'Choose Plan',
      buttonClass: 'btn-secondary',
      popular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">Choose Your Perfect Plan</h1>
        <p className="text-secondary max-w-3xl mx-auto">
          Start free with 2 analyses per month, then upgrade as you grow. No hidden fees, no surprises.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`
              relative card transition-all duration-300 hover:scale-105
              ${plan.popular ? 'border-accent-primary shadow-xl shadow-accent-primary/20' : ''}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>MOST POPULAR</span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-bold text-primary">{plan.price}</span>
                <span className="text-secondary">/{plan.period}</span>
              </div>
              <p className="text-secondary mb-4">{plan.description}</p>
              <div className="surface-secondary border border-primary rounded-lg p-3 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5 text-accent-primary" />
                  <span className="font-semibold text-primary">{plan.analyses}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
                  <span className="text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePlanSelect(plan.id)}
              className={`w-full ${plan.buttonClass}`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="card max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-primary mb-8 text-center">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary">
                <th className="text-left py-4 px-4 text-primary font-semibold">Features</th>
                <th className="text-center py-4 px-4 text-primary font-semibold">Starter</th>
                <th className="text-center py-4 px-4 text-primary font-semibold">Pro</th>
                <th className="text-center py-4 px-4 text-primary font-semibold">Business</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              <tr className="border-b border-primary/30">
                <td className="py-4 px-4">Monthly Analyses</td>
                <td className="text-center py-4 px-4">30</td>
                <td className="text-center py-4 px-4">100</td>
                <td className="text-center py-4 px-4">300</td>
              </tr>
              <tr className="border-b border-primary/30">
                <td className="py-4 px-4">Gap Analyses</td>
                <td className="text-center py-4 px-4">5</td>
                <td className="text-center py-4 px-4">25</td>
                <td className="text-center py-4 px-4">60</td>
              </tr>
              <tr className="border-b border-primary/30">
                <td className="py-4 px-4">AI Articles</td>
                <td className="text-center py-4 px-4">5</td>
                <td className="text-center py-4 px-4">10</td>
                <td className="text-center py-4 px-4">60</td>
              </tr>
              <tr className="border-b border-primary/30">
                <td className="py-4 px-4">Projects</td>
                <td className="text-center py-4 px-4">3</td>
                <td className="text-center py-4 px-4">10</td>
                <td className="text-center py-4 px-4">30</td>
              </tr>
              <tr className="border-b border-primary/30">
                <td className="py-4 px-4">Tracked Keywords</td>
                <td className="text-center py-4 px-4">25</td>
                <td className="text-center py-4 px-4">100</td>
                <td className="text-center py-4 px-4">300</td>
              </tr>
              <tr className="border-b border-primary/30">
                <td className="py-4 px-4">API Access</td>
                <td className="text-center py-4 px-4">-</td>
                <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent-primary mx-auto" /></td>
                <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent-primary mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-4 px-4">Team Collaboration</td>
                <td className="text-center py-4 px-4">-</td>
                <td className="text-center py-4 px-4">-</td>
                <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent-primary mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              question: "What happens when I exceed my analysis limit?",
              answer: "On the Starter plan, you'll need to wait until next month or upgrade. Pro and Business plans include higher limits with optional overages."
            },
            {
              question: "Can I cancel my subscription anytime?",
              answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
            },
            {
              question: "Do you offer refunds?",
              answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, we'll provide a full refund."
            },
            {
              question: "Is there a free trial for paid plans?",
              answer: "Yes! You get a 7-day free trial of any paid plan with full access to all features. No credit card required."
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="card animate-scaleIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h4 className="text-lg font-semibold text-primary mb-3">{faq.question}</h4>
              <p className="text-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="card text-center bg-gradient-to-br from-accent-primary/10 to-info/10 border-accent-primary/30 max-w-4xl mx-auto">
        <TrendingUp className="w-16 h-16 text-accent-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-primary mb-6">
          Ready to Optimize Your Content?
        </h2>
        <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
          Join thousands of content creators who've improved their rankings with Rankora.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => handlePlanSelect('pro')}
            className="btn-primary"
          >
            Start Free Trial
          </button>
          <button className="btn-secondary">
            Contact Sales
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={plans.find(p => p.id === selectedPlan)!}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};