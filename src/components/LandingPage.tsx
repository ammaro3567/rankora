import React from 'react';
import { ArrowRight, Zap, Target, TrendingUp, Star, Shield, Users } from 'lucide-react';
import { StarField } from './StarField';
import { AnimatedBackground } from './AnimatedBackground';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onPricing }) => {
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      <StarField />
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="glass border-b border-primary fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">RankOra</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onPricing}
              className="text-secondary hover:text-primary transition-colors duration-200"
            >
              Pricing
            </button>
            <button
              onClick={onLogin}
              className="text-secondary hover:text-primary transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={onSignup}
              className="btn-primary px-6 py-2"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto text-center px-4">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/20 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-accent-primary font-medium">
                AI-Powered Content Optimization
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Optimize Your Content for{' '}
              <span className="text-accent-primary">Google's AI Overviews</span>
            </h1>
            
            <p className="text-xl text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Get ahead of the competition with AI-powered content analysis that helps you rank in 
              Google's new AI Overview results. Boost your visibility and drive more organic traffic.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onSignup}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onPricing}
                className="btn-secondary text-lg px-8 py-4"
              >
                View Pricing
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-primary/20 transition-colors duration-300">
                <Target className="w-8 h-8 text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">AI Overview Analysis</h3>
              <p className="text-secondary">
                Analyze your content's potential to appear in Google's AI Overview results with advanced AI algorithms.
              </p>
            </div>

            <div className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-primary/20 transition-colors duration-300">
                <TrendingUp className="w-8 h-8 text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Competitor Comparison</h3>
              <p className="text-secondary">
                Compare your content performance against competitors and discover optimization opportunities.
              </p>
            </div>

            <div className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-primary/20 transition-colors duration-300">
                <Shield className="w-8 h-8 text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Actionable Insights</h3>
              <p className="text-secondary">
                Get specific recommendations to improve your content's visibility in AI-powered search results.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">10K+</div>
              <div className="text-secondary">Content Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">85%</div>
              <div className="text-secondary">Improvement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">500+</div>
              <div className="text-secondary">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">24/7</div>
              <div className="text-secondary">AI Monitoring</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 card text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Ready to Optimize Your Content?
            </h2>
            <p className="text-secondary mb-6">
              Join hundreds of content creators and marketers who are already winning with AI-optimized content.
            </p>
            <button
              onClick={onSignup}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Start Your Free Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
