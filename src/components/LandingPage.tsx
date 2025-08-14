import React, { useState } from 'react'

interface LandingPageProps {
  onLogin: () => void
  onSignup: () => void
  onPricing: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onPricing }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black relative">
      {/* Enhanced Star Field Background with Movement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Emerald aura */}
        <div className="absolute -top-32 -left-32 w-[42rem] h-[42rem] bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[36rem] h-[36rem] bg-emerald-400/10 blur-3xl rounded-full" />
        {/* Moving gradient orbs for atmosphere */}
        <div className="absolute w-96 h-96 bg-gradient-to-r from-accent/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{top: '10%', left: '10%', animation: 'float 20s ease-in-out infinite'}}></div>
        <div className="absolute w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{top: '60%', right: '10%', animation: 'float 25s ease-in-out infinite reverse'}}></div>
        
        {/* Animated stars */}
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse" style={{top: '10%', left: '20%'}}></div>
        <div className="absolute w-1 h-1 bg-accent rounded-full opacity-30 animate-pulse" style={{top: '20%', right: '15%', animationDelay: '1s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{top: '30%', left: '70%', animationDelay: '0.5s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-25 animate-pulse" style={{top: '40%', left: '10%', animationDelay: '2s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full opacity-35 animate-pulse" style={{top: '50%', right: '25%', animationDelay: '1.5s'}}></div>
        <div className="absolute w-1 h-1 bg-accent rounded-full opacity-20 animate-pulse" style={{top: '60%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-30" style={{top: '70%', left: '30%'}}></div>
        <div className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{top: '80%', right: '40%', animationDelay: '0.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-25" style={{top: '90%', left: '60%'}}></div>
        <div className="absolute w-1 h-1 bg-accent rounded-full opacity-35 animate-pulse" style={{top: '15%', left: '50%', animationDelay: '2.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full opacity-20 animate-pulse" style={{top: '25%', right: '60%', animationDelay: '3s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{top: '35%', left: '5%', animationDelay: '1.8s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{top: '45%', right: '10%', animationDelay: '2.2s'}}></div>
        <div className="absolute w-1 h-1 bg-accent rounded-full opacity-25 animate-pulse" style={{top: '55%', left: '75%', animationDelay: '0.8s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-35" style={{top: '65%', right: '50%'}}></div>
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-pulse" style={{top: '75%', left: '15%', animationDelay: '2.2s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-accent rounded-full opacity-30 animate-pulse" style={{top: '85%', right: '20%', animationDelay: '1.7s'}}></div>
        <div className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{top: '95%', left: '40%', animationDelay: '1.2s'}}></div>
      </div>

      {/* Add floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.2; }
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-secondary/80 backdrop-blur-sm border-b border-gray-700/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-8" src="/logo32.png" alt="Rankora" />
                <span className="ml-2 text-xl font-bold text-white">Rankora</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                Features
              </a>
              <button 
                onClick={onPricing}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200"
              >
                Pricing
              </button>
              <a href="#faq" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                FAQ
              </a>
              <button
                onClick={onLogin}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200"
              >
                Login
              </button>
              <button
                onClick={onSignup}
                className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition duration-200 shadow-lg shadow-accent/20"
              >
                Sign Up Free
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none transition duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-700/50 py-4">
              <div className="flex flex-col space-y-2">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                  Features
                </a>
                <button 
                  onClick={onPricing}
                  className="text-left text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200"
                >
                  Pricing
                </button>
                <a href="#faq" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200">
                  FAQ
                </a>
                <button
                  onClick={onLogin}
                  className="text-left text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition duration-200"
                >
                  Login
                </button>
                <button
                  onClick={onSignup}
                  className="text-left bg-accent text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition duration-200 mx-3 shadow-lg shadow-accent/20"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Transform Your Ideas Into
              <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent"> Ranked Success</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Rankora helps you rank, compare, and analyze anything with powerful AI-driven insights. 
              Make data-driven decisions with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onSignup}
                className="w-full sm:w-auto bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent/90 transform hover:scale-105 transition duration-200 shadow-lg shadow-accent/20"
              >
                Start Ranking Free
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-500 hover:bg-gray-800/50 transition duration-200"
              >
                Sign In
              </button>
            </div>

            <div className="mt-12 text-sm text-gray-400">
              ✨ No credit card required • 🚀 Get started in 30 seconds • 🔒 100% secure
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Features for Smart Ranking
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to rank, compare, and analyze with precision and intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-accent/10 transition duration-300">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Ranking</h3>
              <p className="text-gray-300">
                AI-powered ranking algorithms that understand context and deliver meaningful results.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-blue-400/10 transition duration-300">
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-300">
                Deep insights and analytics to understand patterns and make informed decisions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-green-400/10 transition duration-300">
              <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300">
                Get results in seconds, not minutes. Optimized for speed and performance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-purple-400/10 transition duration-300">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Custom Criteria</h3>
              <p className="text-gray-300">
                Define your own ranking criteria and weights to match your specific needs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-yellow-400/10 transition duration-300">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Team Collaboration</h3>
              <p className="text-gray-300">
                Work together with your team to create and refine rankings collaboratively.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-red-400/10 transition duration-300">
              <div className="w-12 h-12 bg-red-400/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Enterprise Security</h3>
              <p className="text-gray-300">
                Bank-level security with encryption, audit logs, and compliance standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-primary relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to know about Rankora and AI Overviews optimization
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-accent/5 transition duration-300">
              <h3 className="text-lg font-semibold text-white mb-2">
                What is Rankora and how does it work?
              </h3>
              <p className="text-gray-300">
                Rankora is an AI-powered content analysis tool that helps optimize your content for Google's AI Overviews. It analyzes your articles across 6 key metrics: readability, factuality, structure, Q&A format, structured data, and authority.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-accent/5 transition duration-300">
              <h3 className="text-lg font-semibold text-white mb-2">
                How accurate are the analysis results?
              </h3>
              <p className="text-gray-300">
                Our AI analysis has a 98% accuracy rate, trained on thousands of successful AI Overview snippets. We continuously update our algorithms based on Google's latest AI Overview patterns and ranking factors.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-accent/5 transition duration-300">
              <h3 className="text-lg font-semibold text-white mb-2">
                What's included in the Free plan?
              </h3>
              <p className="text-gray-300">
                The Free plan includes 2 content analyses per month, basic scoring across all 6 metrics, general improvement suggestions, and email support. Perfect for testing our platform.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-accent/5 transition duration-300">
              <h3 className="text-lg font-semibold text-white mb-2">
                How does the competitor comparison feature work?
              </h3>
              <p className="text-gray-300">
                Our competitor comparison tool analyzes both your content and a competitor's content side-by-side across all metrics, providing detailed insights and AI-generated strategies.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-accent/5 transition duration-300">
              <h3 className="text-lg font-semibold text-white mb-2">
                Is my data secure and private?
              </h3>
              <p className="text-gray-300">
                Absolutely. We use enterprise-grade security measures to protect your data. We don't store your content permanently, and we never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-blue-400 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            Ready to Start Ranking?
          </h2>
          <p className="text-xl text-gray-100 mb-12">
            Join thousands of users who trust Rankora for their ranking and analysis needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onSignup}
              className="w-full sm:w-auto bg-white text-accent px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition duration-200 shadow-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={onPricing}
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-accent transition duration-200"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-gray-700/50 text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <img className="h-8 w-8" src="/logo32.png" alt="Rankora" />
                <span className="ml-2 text-xl font-bold">Rankora</span>
              </div>
              <p className="text-gray-300 mb-4">
                Transform your ideas into ranked success with AI-powered ranking and analysis tools.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-accent transition duration-200">Features</a></li>
                <li><button onClick={onPricing} className="hover:text-accent transition duration-200">Pricing</button></li>
                <li><a href="#faq" className="hover:text-accent transition duration-200">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={onLogin} className="hover:text-accent transition duration-200">Login</button></li>
                <li><button onClick={onSignup} className="hover:text-accent transition duration-200">Sign Up</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rankora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
