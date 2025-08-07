import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { StarField } from './components/StarField';
import { Footer } from './components/Footer';
import { supabase, getCurrentUser } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user);
        if (user) {
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="loading-spinner w-12 h-12" />
      </div>
    );
  }

  // Show Dashboard if logged in
  if (isLoggedIn && currentPage === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  // Show Login/Signup pages
  if (currentPage === 'login') {
    return (
      <LoginPage
        onBack={() => setCurrentPage('home')}
        onLogin={() => {
          setIsLoggedIn(true);
          setCurrentPage('dashboard');
        }}
        onSwitchToSignup={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignupPage
        onBack={() => setCurrentPage('home')}
        onSignup={() => {
          setIsLoggedIn(true);
          setCurrentPage('dashboard');
        }}
        onSwitchToLogin={() => setCurrentPage('login')}
      />
    );
  }

  // Home page with authentication gates
  return (
    <div className="min-h-screen bg-primary relative">
      <StarField />
      
      {/* Navigation Bar */}
      <nav className="bg-secondary/95 backdrop-blur-md border-b border-primary fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-primary">
              RANK<span className="text-accent-primary">ORA</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('login')}
              className="text-secondary hover:text-accent-primary transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => setCurrentPage('login')}
              className="text-secondary hover:text-accent-primary transition-colors font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => setCurrentPage('login')}
              className="text-secondary hover:text-accent-primary transition-colors font-medium"
            >
              FAQ
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCurrentPage('login')}
              className="btn-ghost"
            >
              Log In
            </button>
            <button 
              onClick={() => setCurrentPage('signup')}
              className="btn-primary"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 relative z-10">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-8 animate-scaleIn">
              <span className="inline-block px-6 py-3 surface-secondary border border-primary rounded-full text-accent-primary text-lg font-semibold mb-6">
                🎯 AI-Powered Content Analysis
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-8 leading-tight animate-fadeInUp">
              Master Google's{' '}
              <span className="block text-accent-primary mt-2">
                AI Overviews
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-secondary max-w-4xl mx-auto mb-6 leading-relaxed">
              Transform your content strategy with AI-powered analytics, competitor insights, and data-driven optimization.
            </p>
            
            <p className="text-lg text-secondary max-w-3xl mx-auto mb-12">
              Don't lose traffic to AI-generated answers. Join thousands who've already optimized their content for Google's new era.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slideInRight">
              <button
                onClick={() => setCurrentPage('signup')}
                className="btn-primary text-lg px-8 py-4"
              >
                🎯 Start Free Analysis
              </button>
              <button 
                onClick={() => setCurrentPage('login')}
                className="btn-secondary text-lg px-8 py-4"
              >
                ⚡ Compare with Competitors
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="card hover:scale-105 transition-all duration-300 animate-scaleIn" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4 text-center">Advanced Analytics</h3>
                <p className="text-secondary leading-relaxed text-center">Get comprehensive scores for readability, factuality, and structure with real-time AI analysis.</p>
              </div>

              <div className="card hover:scale-105 transition-all duration-300 animate-scaleIn" style={{animationDelay: '0.4s'}}>
                <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4 text-center">Smart Comparison</h3>
                <p className="text-secondary leading-relaxed text-center">Compare your content side-by-side with competitors using AI-powered analysis.</p>
              </div>

              <div className="card hover:scale-105 transition-all duration-300 animate-scaleIn" style={{animationDelay: '0.6s'}}>
                <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4 text-center">AI Insights</h3>
                <p className="text-secondary leading-relaxed text-center">Receive personalized, actionable recommendations to dominate AI overviews.</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-24 card animate-fadeInUp">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center animate-scaleIn">Trusted by Content Creators Worldwide</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center animate-slideInRight" style={{animationDelay: '0.1s'}}>
                  <div className="text-4xl md:text-5xl font-bold text-accent-primary mb-2">15K+</div>
                  <div className="text-secondary font-medium">Articles Analyzed</div>
                </div>
                <div className="text-center animate-slideInRight" style={{animationDelay: '0.2s'}}>
                  <div className="text-4xl md:text-5xl font-bold text-accent-primary mb-2">98%</div>
                  <div className="text-secondary font-medium">Accuracy Rate</div>
                </div>
                <div className="text-center animate-slideInRight" style={{animationDelay: '0.3s'}}>
                  <div className="text-4xl md:text-5xl font-bold text-accent-primary mb-2">3.2x</div>
                  <div className="text-secondary font-medium">Traffic Boost</div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Ready to Dominate AI Overviews?
              </h2>
              <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands who've already optimized their content for Google's AI-powered future.
              </p>
              <button
                onClick={() => setCurrentPage('signup')}
                className="btn-primary text-lg px-8 py-4"
              >
                🎯 Start Your Free Analysis
              </button>
              <p className="text-secondary mt-4 text-sm">No credit card required • Get results in 30 seconds</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;