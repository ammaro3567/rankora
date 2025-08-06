import React, { useState, useEffect } from 'react';
import { BarChart3, Target, Moon, Sun, Menu, X, Lightbulb } from 'lucide-react';
import Dashboard from './components/Dashboard';

import { CompetitorComparison } from './components/CompetitorComparison';
import { AIOverviewAnalyzer } from './components/AIOverviewAnalyzer';
import { PricingPage } from './components/PricingPage';




function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const scrollToAnalyzer = () => {
    const element = document.getElementById('ai-overview-analyzer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToComparison = () => {
    const element = document.getElementById('competitor-comparison');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
  };



  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      document.body.style.backgroundPosition = `${x}% ${y}%`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };



  const renderHomePage = () => (
    <div className="min-h-screen bg-section-bg transition-colors duration-300 relative overflow-hidden">
      <div className="container mx-auto px-4 py-20 relative">
        {/* Animated Background Elements */}
        <div className="absolute top-32 left-16 w-32 h-32 bg-primary-cta/5 rounded-full blur-3xl animate-floating-shapes"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-primary-cta/3 rounded-full blur-3xl animate-bounce-soft" style={{animationDelay: '2s'}}></div>
        
        {/* Additional Floating Shapes */}
        <div className="absolute top-20 right-32 w-20 h-20 bg-primary-cta/10 rounded-lg rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-primary-cta/8 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-8 w-16 h-16 bg-primary-cta/6 rounded-lg animate-floating-shapes" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 right-8 w-28 h-28 bg-primary-cta/4 rounded-full animate-bounce-soft" style={{animationDelay: '4s'}}></div>
        
        {/* More Dynamic Background Elements */}
        <div className="absolute top-16 left-1/3 w-12 h-12 bg-primary-cta/8 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-16 right-1/3 w-18 h-18 bg-primary-cta/6 rounded-lg rotate-12 animate-floating-shapes" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-2/3 left-16 w-14 h-14 bg-primary-cta/7 rounded-full animate-bounce-soft" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute top-40 right-24 w-10 h-10 bg-primary-cta/9 rounded-lg animate-rotate-slow" style={{animationDelay: '3.2s'}}></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-36 h-36 bg-gradient-to-br from-primary-cta/10 to-emerald-400/5 rounded-full blur-2xl animate-floating-shapes" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-gradient-to-br from-emerald-400/8 to-primary-cta/6 rounded-full blur-2xl animate-bounce-soft" style={{animationDelay: '2.8s'}}></div>
        
        {/* Moving Wave Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-cta/20 to-transparent animate-wave"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-cta/15 to-transparent animate-wave" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/15 to-transparent animate-wave" style={{animationDelay: '3s'}}></div>
        </div>
        
        {/* Stars and Cosmic Elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary-cta/30 rounded-full animate-twinkle" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-yellow-400/60 rounded-full animate-sparkle" style={{animationDelay: '1.1s'}}></div>
        <div className="absolute bottom-10 left-20 w-3 h-3 bg-primary-cta/40 rounded-full animate-constellation" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-40 right-40 w-2 h-2 bg-emerald-400/50 rounded-full animate-twinkle" style={{animationDelay: '1.7s'}}></div>
        
        {/* More Stars */}
        <div className="absolute top-32 left-3/4 w-1 h-1 bg-blue-400/50 rounded-full animate-sparkle" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-1/3 right-10 w-2 h-2 bg-purple-400/40 rounded-full animate-constellation" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-pink-400/50 rounded-full animate-twinkle" style={{animationDelay: '2.8s'}}></div>
        <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-indigo-400/35 rounded-full animate-cosmic-drift" style={{animationDelay: '0.5s'}}></div>
        
        {/* Shooting Stars */}
        <div className="absolute top-16 left-0 w-1 h-20 bg-gradient-to-b from-white/60 to-transparent animate-shooting-star opacity-70" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-40 left-1/2 w-1 h-16 bg-gradient-to-b from-primary-cta/60 to-transparent animate-shooting-star opacity-50" style={{animationDelay: '7s'}}></div>
        
        {/* Constellation Groups */}
        <div className="absolute top-24 right-1/4">
          <div className="w-1 h-1 bg-white/40 rounded-full animate-constellation"></div>
          <div className="w-1 h-1 bg-white/30 rounded-full animate-constellation absolute top-2 left-3" style={{animationDelay: '0.5s'}}></div>
          <div className="w-1 h-1 bg-white/35 rounded-full animate-constellation absolute top-4 left-1" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="absolute bottom-32 left-1/3">
          <div className="w-2 h-2 bg-primary-cta/30 rounded-full animate-twinkle"></div>
          <div className="w-1 h-1 bg-primary-cta/25 rounded-full animate-twinkle absolute top-3 left-4" style={{animationDelay: '1s'}}></div>
          <div className="w-1 h-1 bg-primary-cta/20 rounded-full animate-twinkle absolute top-1 left-2" style={{animationDelay: '2s'}}></div>
        </div>
        
                <div className="text-center max-w-6xl mx-auto relative z-10">
          <div className="mb-8 animate-scale-in">
            <span className="inline-block px-6 py-3 bg-accent-light border border-border-color rounded-full text-primary-cta text-lg font-semibold mb-6 animate-pulse-border">
              🎯 AI-Powered Content Analysis
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-8 leading-tight animate-fade-in-up">
            Master Google's{' '}
            <span className="block text-primary-cta mt-2">
              AI Overviews
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 leading-relaxed">
            Transform your content strategy with AI-powered analytics, competitor insights, and data-driven optimization.
          </p>
          
          <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-12">
            Don't lose traffic to AI-generated answers. Join thousands who've already optimized their content for Google's new era.
          </p>
          
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
            <button
              onClick={() => {
                setCurrentPage('features');
                setTimeout(scrollToAnalyzer, 100);
              }}
              className="bg-primary-cta hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg text-lg hover:animate-gentle-glow"
            >
              🎯 Start Free Analysis
            </button>
            <button 
              onClick={() => {
                setCurrentPage('features');
                setTimeout(scrollToComparison, 100);
              }}
              className="border-2 border-primary-cta text-primary-cta hover:bg-primary-cta hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 animate-gentle-glow"
            >
              ⚡ Compare with Competitors
            </button>
          </div>

                    {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card-background border border-border-color rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-primary-cta rounded-lg flex items-center justify-center mb-6 mx-auto hover:animate-bounce-soft">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">Advanced Analytics</h3>
              <p className="text-text-secondary leading-relaxed text-center">Get comprehensive scores for readability, factuality, and structure with real-time AI analysis.</p>
            </div>

            <div className="bg-card-background border border-border-color rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-scale-in" style={{animationDelay: '0.4s'}}>
              <div className="w-12 h-12 bg-primary-cta rounded-lg flex items-center justify-center mb-6 mx-auto hover:animate-bounce-soft">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">Smart Comparison</h3>
              <p className="text-text-secondary leading-relaxed text-center">Compare your content side-by-side with competitors using AI-powered analysis.</p>
            </div>

            <div className="bg-card-background border border-border-color rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-scale-in" style={{animationDelay: '0.6s'}}>
              <div className="w-12 h-12 bg-primary-cta rounded-lg flex items-center justify-center mb-6 mx-auto hover:animate-bounce-soft">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">AI Insights</h3>
              <p className="text-text-secondary leading-relaxed text-center">Receive personalized, actionable recommendations to dominate AI overviews.</p>
            </div>
          </div>

                    {/* Stats Section */}
          <div className="mt-24 bg-accent-light border border-border-color rounded-xl p-8 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8 text-center animate-scale-in">Trusted by Content Creators Worldwide</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="text-4xl md:text-5xl font-bold text-primary-cta mb-2">15K+</div>
                <div className="text-text-secondary font-medium">Articles Analyzed</div>
              </div>
              <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl md:text-5xl font-bold text-primary-cta mb-2">98%</div>
                <div className="text-text-secondary font-medium">Accuracy Rate</div>
              </div>
              <div className="text-center animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="text-4xl md:text-5xl font-bold text-primary-cta mb-2">3.2x</div>
                <div className="text-text-secondary font-medium">Traffic Boost</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Ready to Dominate AI Overviews?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands who've already optimized their content for Google's AI-powered future.
            </p>
            <button
              onClick={() => {
                setCurrentPage('features');
                setTimeout(scrollToAnalyzer, 100);
              }}
              className="bg-primary-cta hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg text-lg"
            >
              🎯 Start Your Free Analysis
            </button>
            <p className="text-text-secondary mt-4 text-sm">No credit card required • Get results in 30 seconds</p>
                    </div>
                  </div>
                    </div>
                  </div>
  );



  const renderFeaturesPage = () => (
    <>
      <AIOverviewAnalyzer />
      <CompetitorComparison />
    </>
  );

  // Show Dashboard if logged in and on dashboard page
  if (isLoggedIn && currentPage === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-navbar-bg/95 backdrop-blur-md border-b border-border-color text-text-primary py-4 px-6 fixed top-0 left-0 right-0 z-50 transition-all duration-200">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
                                <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-cta rounded-lg flex items-center justify-center animate-gentle-glow">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-text-primary">
              RANK<span className="text-primary-cta">ORA</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`hover:text-primary-cta transition-colors font-medium ${currentPage === 'home' ? 'text-primary-cta' : 'text-text-secondary'}`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentPage('features');
                setTimeout(scrollToAnalyzer, 100);
              }}
              className={`hover:text-primary-cta transition-colors font-medium ${currentPage === 'features' ? 'text-primary-cta' : 'text-text-secondary'}`}
            >
              Analyzer
            </button>
                  <button
                    onClick={() => {
                setCurrentPage('features');
                setTimeout(scrollToComparison, 100);
                    }}
              className="hover:text-primary-cta transition-colors font-medium text-text-secondary"
                  >
              Comparison
                  </button>
                  <button 
              onClick={() => setCurrentPage('pricing')}
              className={`hover:text-primary-cta transition-colors font-medium ${currentPage === 'pricing' ? 'text-primary-cta' : 'text-text-secondary'}`}
            >
              Pricing
            </button>
            <button className="hover:text-primary-cta transition-colors font-medium text-text-secondary">FAQ</button>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-accent-light transition-colors duration-200"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-text-secondary" />
              )}
            </button>
            {!isLoggedIn ? (
              <>
                <button 
                  onClick={handleLogin}
                  className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg transition-colors font-medium"
                >
                  Log In
                </button>
                <button 
                  onClick={handleLogin}
                  className="bg-primary-cta hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-primary-cta hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Dashboard
              </button>
            )}
                      </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <div className="flex flex-col space-y-4 mt-4">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left hover:text-green-400 transition-colors ${currentPage === 'home' ? 'text-green-400' : ''}`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage('features');
                  setIsMobileMenuOpen(false);
                  setTimeout(scrollToAnalyzer, 100);
                }}
                className={`text-left hover:text-green-400 transition-colors ${currentPage === 'features' ? 'text-green-400' : ''}`}
              >
                AI Overview Analyzer
              </button>
              <button
                onClick={() => {
                  setCurrentPage('features');
                  setIsMobileMenuOpen(false);
                  setTimeout(scrollToComparison, 100);
                }}
                className="text-left hover:text-green-400 transition-colors"
              >
                Content Comparison
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('pricing');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left hover:text-green-400 transition-colors ${currentPage === 'pricing' ? 'text-green-400' : ''}`}
              >
                Pricing
              </button>
              <button className="text-left hover:text-green-400 transition-colors">FAQ</button>
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-300" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16">
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'features' && renderFeaturesPage()}
        {currentPage === 'pricing' && <PricingPage />}
      </div>
    </div>
  );
}

export default App;