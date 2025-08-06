import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Rankora and how does it work?",
    answer: "Rankora is an AI-powered content analysis tool that helps optimize your content for Google's AI Overviews. It analyzes your articles across 6 key metrics: readability, factuality, structure, Q&A format, structured data, and authority. Our AI provides actionable recommendations to improve your content's chances of being featured in AI-generated search results."
  },
  {
    question: "How accurate are the analysis results?",
    answer: "Our AI analysis has a 98% accuracy rate, trained on thousands of successful AI Overview snippets. We continuously update our algorithms based on Google's latest AI Overview patterns and ranking factors. However, results may vary as Google's AI systems evolve."
  },
  {
    question: "What's included in the Free plan?",
    answer: "The Free plan includes 2 content analyses per month, basic scoring across all 6 metrics, general improvement suggestions, and email support. It's perfect for individual content creators who want to test our platform."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your Pro or Enterprise subscription at any time from your dashboard. You'll continue to have access to premium features until the end of your current billing period. No cancellation fees or hidden charges."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with Rankora within the first 14 days, contact our support team for a full refund."
  },
  {
    question: "How does the competitor comparison feature work?",
    answer: "Our competitor comparison tool analyzes both your content and a competitor's content side-by-side across all metrics. It provides detailed insights into where you're outperforming or falling behind, plus AI-generated strategies to help you rank higher than your competitors."
  },
  {
    question: "What types of content can I analyze?",
    answer: "You can analyze any publicly accessible web content including blog posts, articles, product pages, landing pages, and more. Our AI works best with text-heavy content that's at least 300 words long."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use enterprise-grade security measures to protect your data. We don't store your content permanently, and all analysis is processed securely. We never share your data with third parties or competitors."
  },
  {
    question: "How often should I analyze my content?",
    answer: "We recommend analyzing new content before publishing and re-analyzing existing content monthly or after major updates. Google's AI Overview preferences can change, so regular analysis helps maintain optimal performance."
  },
  {
    question: "Do you provide API access?",
    answer: "Yes! API access is available with our Enterprise plan. You can integrate Rankora's analysis capabilities directly into your content management system, editorial workflow, or custom applications."
  },
  {
    question: "What makes Rankora different from other SEO tools?",
    answer: "Rankora is specifically designed for Google's AI Overviews, not traditional SEO. While other tools focus on keywords and backlinks, we analyze the specific factors that AI systems consider when selecting content for featured snippets and AI-generated answers."
  },
  {
    question: "Can I export my analysis reports?",
    answer: "Yes! Pro and Enterprise users can export detailed PDF reports of their analyses. These reports include all scores, recommendations, and are perfect for sharing with team members or clients."
  }
];

export const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-background-color pt-20 relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary-cta/40 rounded-full animate-twinkle" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-yellow-400/60 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-blue-400/30 rounded-full animate-constellation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/40 rounded-full animate-cosmic-drift" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-emerald-400/50 rounded-full animate-twinkle" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-pink-400/30 rounded-full animate-sparkle" style={{animationDelay: '5s'}}></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-primary-cta/5 to-emerald-400/3 rounded-full blur-3xl animate-floating-shapes" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-400/4 to-purple-400/3 rounded-full blur-3xl animate-bounce-soft" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-accent-light border border-border-color rounded-full text-primary-cta text-lg font-semibold flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Frequently Asked Questions</span>
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Got Questions?
            <span className="block text-primary-cta mt-2">We've Got Answers</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about Rankora, AI Overviews optimization, and our platform.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-card-background border border-border-color rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-accent-light transition-colors group"
                >
                  <h3 className="text-lg font-semibold text-text-primary pr-4 group-hover:text-primary-cta transition-colors">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-primary-cta" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-secondary group-hover:text-primary-cta transition-colors" />
                    )}
                  </div>
                </button>
                
                <div className={`accordion-content ${openItems.includes(index) ? 'open' : ''} bg-accent-light`}>
                  <div className="px-6 py-5 text-text-secondary leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 text-center bg-accent-light border border-border-color rounded-2xl p-12 max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-primary-cta rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you succeed with AI Overviews optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-cta hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg">
              Contact Support
            </button>
            <button className="border-2 border-primary-cta text-primary-cta hover:bg-primary-cta hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};