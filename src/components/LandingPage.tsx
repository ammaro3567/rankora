import React from 'react'
import { Target, Zap, TrendingUp, Users, Star, ArrowRight, Play, CheckCircle, BarChart3, Brain, Shield } from 'lucide-react'

interface LandingPageProps {
  onLogin: () => void
  onSignup: () => void
  onPricing: () => void
}

export default function LandingPage({ onLogin, onSignup, onPricing }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <span className="text-2xl font-bold">RANKORA</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <button 
            onClick={onPricing}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onLogin}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={onSignup}
            className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl pt-20 pb-32 sm:pt-32 sm:pb-40">
          <div className="text-center">
            {/* Badge */}
            <div className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-600/20 px-6 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm border border-blue-500/30">
              <Target className="h-4 w-4" />
              <span>AI-Powered Content Analysis</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Master Google's{' '}
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI Overviews
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
              Transform your content strategy with AI-powered analytics, competitor insights, and data-driven optimization.
            </p>

            {/* Social Proof */}
            <p className="mt-4 text-sm text-gray-400">
              Don't lose traffic to AI-generated answers. Join thousands who've already optimized their content for Google's new era.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button 
                onClick={onSignup}
                className="group bg-gradient-to-r from-green-400 to-blue-500 px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2"
              >
                <Target className="h-5 w-5" />
                <span>Start Free Analysis</span>
              </button>
              <button className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Compare with Competitors</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">10M+</div>
                <div className="text-sm text-gray-400">Keywords Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">250%</div>
                <div className="text-sm text-gray-400">Avg. Traffic Boost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">50K+</div>
                <div className="text-sm text-gray-400">Content Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 sm:py-32 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to dominate AI search
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Comprehensive tools to analyze, optimize, and outrank competitors in Google's AI-powered search results.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 rounded-2xl backdrop-blur-sm border border-blue-500/20">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <Brain className="h-5 w-5 flex-none text-blue-400" />
                  AI Content Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Advanced AI algorithms analyze your content's potential to appear in Google AI Overviews with actionable optimization suggestions.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col bg-gradient-to-br from-green-900/50 to-blue-900/50 p-8 rounded-2xl backdrop-blur-sm border border-green-500/20">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <BarChart3 className="h-5 w-5 flex-none text-green-400" />
                  Competitor Intelligence
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Discover what content is winning in AI search results and get detailed insights into your competitors' strategies.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 rounded-2xl backdrop-blur-sm border border-purple-500/20">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <TrendingUp className="h-5 w-5 flex-none text-purple-400" />
                  Performance Tracking
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Monitor your content's performance in AI search results with real-time tracking and detailed analytics dashboards.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Everything you need to know about optimizing for Google AI Overviews.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-8 rounded-2xl backdrop-blur-sm border border-blue-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  What are Google AI Overviews?
                </h3>
                <p className="text-gray-300">
                  Google AI Overviews are AI-generated summaries that appear at the top of search results, providing users with comprehensive answers. They're powered by Google's advanced language models and can significantly impact organic traffic.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-8 rounded-2xl backdrop-blur-sm border border-green-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  How does RankOra help with AI Overview optimization?
                </h3>
                <p className="text-gray-300">
                  RankOra analyzes your content using advanced AI algorithms to identify optimization opportunities, provides competitor insights, and tracks your performance in AI-generated search results.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-8 rounded-2xl backdrop-blur-sm border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Can I try RankOra for free?
                </h3>
                <p className="text-gray-300">
                  Yes! We offer a free tier that includes basic content analysis and limited competitor insights. You can upgrade anytime to access advanced features and unlimited analyses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 sm:py-32 bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to dominate AI search?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join thousands of content creators and marketers who are already winning with RankOra.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button 
                onClick={onSignup}
                className="bg-gradient-to-r from-green-400 to-blue-500 px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
              >
                Start Free Analysis
              </button>
              <button 
                onClick={onPricing}
                className="text-gray-300 hover:text-white transition-colors font-semibold"
              >
                View Pricing <ArrowRight className="ml-2 h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .stars {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
        }
        
        .star:nth-child(2n) {
          width: 1px;
          height: 1px;
          background: #60a5fa;
        }
        
        .star:nth-child(3n) {
          width: 3px;
          height: 3px;
          background: #34d399;
        }
        
        .star:nth-child(4n) {
          width: 1.5px;
          height: 1.5px;
          background: #a78bfa;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}