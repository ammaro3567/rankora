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
    answer: "Yes. We offer a 14-day money-back guarantee. If you cancel within this period, you receive a refund, and the subscription will not continue. No additional trial is granted."
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
    answer: "Not yet. API access is currently not available. We will announce it once it's ready."
  },
  {
    question: "What makes Rankora different from other SEO tools?",
    answer: "Rankora is specifically designed for Google's AI Overviews, not traditional SEO. While other tools focus on keywords and backlinks, we analyze the specific factors that AI systems consider when selecting content for featured snippets and AI-generated answers."
  },
  {
    question: "Can I export my analysis reports?",
    answer: "Exporting analyses as downloadable reports is not available right now. You can review and manage analyses inside your dashboard projects."
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fadeInUp">
        <div className="inline-block mb-6">
          <span className="px-6 py-3 surface-secondary border border-primary rounded-full text-accent-primary text-lg font-semibold flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Frequently Asked Questions</span>
          </span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-6">
          Got Questions?
          <span className="block text-accent-primary mt-2">We've Got Answers</span>
        </h1>
        <p className="text-lg text-secondary max-w-3xl mx-auto">
          Everything you need to know about Rankora, AI Overviews optimization, and our platform.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="card overflow-hidden animate-scaleIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-surface-secondary transition-colors group"
              >
                <h3 className="text-lg font-semibold text-primary pr-4 group-hover:text-accent-primary transition-colors">
                  {item.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-accent-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-secondary group-hover:text-accent-primary transition-colors" />
                  )}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openItems.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 py-5 surface-secondary text-secondary leading-relaxed border-t border-primary">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="card text-center bg-gradient-to-br from-accent-primary/10 to-info/10 border-accent-primary/30 max-w-4xl mx-auto">
        <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8 text-accent-primary" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">
          Still Have Questions?
        </h2>
        <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
          Can't find the answer you're looking for? Our support team is here to help you succeed with AI Overviews optimization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            Contact Support
          </button>
          <button className="btn-secondary">
            Schedule Demo
          </button>
        </div>
      </div>
    </div>
  );
};