import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { StarField } from './components/StarField';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Footer } from './components/Footer';
import { PricingPage } from './components/PricingPage';
import { FAQPage } from './components/FAQPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import EmailVerification from './components/EmailVerification';
import { AdminPanel } from './components/AdminPanel';
import { supabase, getCurrentUser, isOwner, getUserProfile, upsertUserProfile } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOwnerAccess, setShowOwnerAccess] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Route handling based on URL
        const path = window.location.pathname;
        
        // Handle specific routes
        switch (path) {
          case '/dashboard':
            const user = await getCurrentUser();
            if (user && user.email_confirmed_at) {
              setIsLoggedIn(true);
              setCurrentPage('dashboard');
              const ownerStatus = await isOwner();
              setShowOwnerAccess(ownerStatus);
              setIsLoading(false);
              return;
            } else {
              window.history.replaceState({}, document.title, '/login');
              setCurrentPage('login');
              setIsLoading(false);
              return;
            }
            
          case '/login':
            setCurrentPage('login');
            setIsLoading(false);
            return;
            
          case '/signup':
            setCurrentPage('signup');
            setIsLoading(false);
            return;
            
          case '/verify-email':
            setCurrentPage('verify-email');
            setIsLoading(false);
            return;
            
          case '/privacy':
            setCurrentPage('privacy');
            setIsLoading(false);
            return;
            
          case '/terms':
            setCurrentPage('terms');
            setIsLoading(false);
            return;
            
          case '/pricing':
            setCurrentPage('pricing');
            setIsLoading(false);
            return;
            
          case '/admin':
            const adminUser = await getCurrentUser();
            if (adminUser && await isOwner()) {
              setIsLoggedIn(true);
              setCurrentPage('admin');
              setShowOwnerAccess(true);
              setIsLoading(false);
              return;
            } else {
              window.history.replaceState({}, document.title, '/login');
              setCurrentPage('login');
              setIsLoading(false);
              return;
            }
        }

        // Check for email verification callback
        if (window.location.hash.includes('type=signup')) {
          setCurrentPage('verify-email');
          setIsLoading(false);
          return;
        }

        // Check if this is OAuth callback
        if (window.location.hash.includes('access_token') || window.location.hash.includes('/auth/callback')) {
          // OAuth callback - wait for auth state to settle
          setTimeout(async () => {
            const user = await getCurrentUser();
            if (user) {
              // Check if email is verified for new users
              if (!user.email_confirmed_at) {
                setCurrentPage('verify-email');
                setIsLoading(false);
                return;
              }
              setIsLoggedIn(true);
              setCurrentPage('dashboard');
              const ownerStatus = await isOwner();
              setShowOwnerAccess(ownerStatus);
              // Clean up URL
              window.history.replaceState({}, document.title, '/dashboard');
            }
            setIsLoading(false);
          }, 1000);
          return;
        }

        const user = await getCurrentUser();
        if (user) {
          // Check if email is verified for existing users
          if (!user.email_confirmed_at) {
            setCurrentPage('verify-email');
            setIsLoading(false);
            return;
          }
          setIsLoggedIn(true);
          // Check if user is owner for admin access
          const ownerStatus = await isOwner();
          setShowOwnerAccess(ownerStatus);
          
          // If user is logged in but on home page, redirect to dashboard
          if (path === '/' || path === '/home') {
            window.history.replaceState({}, document.title, '/dashboard');
            setCurrentPage('dashboard');
          } else if (path === '/dashboard') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('dashboard'); // Default to dashboard for logged in users
          }
        } else {
          // Not logged in - redirect protected routes to login
          const protectedRoutes = ['/dashboard', '/admin'];
          if (protectedRoutes.includes(path)) {
            window.history.replaceState({}, document.title, '/login');
            setCurrentPage('login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Safety timeout: stop loading if anything stalls
    const fallback = setTimeout(() => setIsLoading(false), 4000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Check email verification status
        if (!session.user.email_confirmed_at) {
          setCurrentPage('verify-email');
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
        
        // For Google OAuth users, ensure profile exists
        if (event === 'SIGNED_IN' && session.user.app_metadata.provider === 'google') {
          try {
            const existingProfile = await getUserProfile();
            if (!existingProfile) {
              // Create profile for new Google users
              await upsertUserProfile({
                full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
              });
            }
          } catch (error) {
            console.warn('Failed to create profile for Google user:', error);
          }
        }
        
        // Check if user is owner for admin access
        const ownerStatus = await isOwner();
        setShowOwnerAccess(ownerStatus);
        
        // Smart routing based on current path
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/home' || currentPath === '/login' || currentPath === '/signup') {
          window.history.replaceState({}, document.title, '/dashboard');
          setCurrentPage('dashboard');
        } else if (currentPath === '/dashboard') {
          setCurrentPage('dashboard');
        }
      } else {
        setIsLoggedIn(false);
        setShowOwnerAccess(false);
        
        // Only redirect if on protected route
        const currentPath = window.location.pathname;
        const protectedRoutes = ['/dashboard', '/admin'];
        if (protectedRoutes.includes(currentPath)) {
          window.history.replaceState({}, document.title, '/');
          setCurrentPage('home');
        }
      }
    });

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  // Handle success page routing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    
    if (pathname === '/success' || urlParams.get('success') === 'true') {
      if (isLoggedIn) {
        setCurrentPage('dashboard');
      }
    }
  }, [isLoggedIn]);

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
    return (
      <Dashboard 
        onLogout={handleLogout}
        showAdminAccess={showOwnerAccess}
        onOpenAdmin={() => setCurrentPage('admin')}
      />
    );
  }

  // Show Admin Panel if logged in and owner
  if (isLoggedIn && currentPage === 'admin') {
    return <AdminPanel onBack={() => setCurrentPage('dashboard')} />;
  }

  // Show Privacy Policy page
  if (currentPage === 'privacy') {
    return <PrivacyPage onBack={() => {
      window.history.replaceState({}, document.title, '/');
      setCurrentPage('home');
    }} />;
  }

  // Show Terms of Service page
  if (currentPage === 'terms') {
    return <TermsPage onBack={() => {
      window.history.replaceState({}, document.title, '/');
      setCurrentPage('home');
    }} />;
  }

  // Show Pricing page (standalone)
  if (currentPage === 'pricing') {
    return (
      <div className="min-h-screen bg-primary">
        <PricingPage />
      </div>
    );
  }

  // Show Login/Signup pages
  if (currentPage === 'verify-email') {
    return (
      <EmailVerification
        onBack={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onBack={() => setCurrentPage('home')}
        onLogin={async () => {
          const user = await getCurrentUser();
          if (user && !user.email_confirmed_at) {
            window.history.replaceState({}, document.title, '/verify-email');
            setCurrentPage('verify-email');
            return;
          }
          setIsLoggedIn(true);
          window.history.replaceState({}, document.title, '/dashboard');
          setCurrentPage('dashboard');
        }}
        onSwitchToSignup={() => {
          window.history.replaceState({}, document.title, '/signup');
          setCurrentPage('signup');
        }}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignupPage
        onBack={() => setCurrentPage('home')}
        onSignup={() => {
          // Always redirect to email verification for new signups
          setCurrentPage('verify-email');
        }}
        onSwitchToLogin={() => {
          window.history.replaceState({}, document.title, '/login');
          setCurrentPage('login');
        }}
      />
    );
  }

  // Home page with authentication gates
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      <StarField />
      <AnimatedBackground />
      
      {/* Navigation Bar */}
      <nav className="glass border-b border-primary fixed top-0 left-0 right-0 z-50" style={{zIndex: 9999}}>
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
          <div className="hidden md:flex items-center space-x-8" style={{zIndex: 10000}}>
            <a 
              href="#features" 
              className="text-secondary hover:text-accent-primary transition-all duration-300 font-medium relative group bg-transparent px-3 py-2"
              style={{position: 'relative', zIndex: 10001}}
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a 
              href="#pricing" 
              className="text-secondary hover:text-accent-primary transition-all duration-300 font-medium relative group bg-transparent px-3 py-2"
              style={{position: 'relative', zIndex: 10001}}
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a 
              href="#faq" 
              className="text-secondary hover:text-accent-primary transition-all duration-300 font-medium relative group bg-transparent px-3 py-2"
              style={{position: 'relative', zIndex: 10001}}
            >
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all duration-300" />
            </a>
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
              <span className="inline-block px-6 py-3 glass border border-accent-primary/30 rounded-full text-accent-primary text-lg font-semibold mb-6 glow-hover">
                🎯 AI-Powered Content Analysis
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-8 leading-tight animate-fadeInUp hero-text">
              Master Google's{' '}
              <span className="block gradient-text mt-2">
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
                className="btn-primary text-lg px-8 py-4 hover-lift glow-hover"
              >
                🎯 Start Free Analysis
              </button>
              <button 
                onClick={() => setCurrentPage('login')}
                className="btn-secondary text-lg px-8 py-4 hover-lift"
              >
                ⚡ Compare with Competitors
              </button>
            </div>

            {/* Feature Highlights */}
            <section id="features" className="mt-16">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="card card-shadow hover-lift hover:scale-105 transition-all duration-300 animate-scaleIn" style={{animationDelay: '0.2s'}}>
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 mx-auto glow">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2 text-center">AI Overview Analyzer</h3>
                  <p className="text-secondary leading-relaxed text-center">Analyze your articles across key metrics and get instant AI-powered recommendations.</p>
                </div>

                <div className="card card-shadow hover-lift hover:scale-105 transition-all duration-300 animate-scaleIn" style={{animationDelay: '0.4s'}}>
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 mx-auto glow">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2 text-center">Competitor Comparison</h3>
                  <p className="text-secondary leading-relaxed text-center">Compare your content side-by-side with competitors using smart visualizations.</p>
                </div>

                <div className="card card-shadow hover-lift hover:scale-105 transition-all duration-300 animate-scaleIn" style={{animationDelay: '0.6s'}}>
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-6 mx-auto glow">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2 text-center">One-Click Insights</h3>
                  <p className="text-secondary leading-relaxed text-center">Get quick wins and competitive suggestions tailored to your content in seconds.</p>
                </div>
              </div>
            </section>

            {/* Trust Signals */}
            <div className="mt-20 mb-20 flex flex-wrap justify-center gap-6 animate-fadeInUp">
              <div className="trust-badge">
                <span className="text-xl">🔒</span>
                <span className="text-sm text-secondary">Bank-Level Security</span>
              </div>
              <div className="trust-badge">
                <span className="text-xl">⚡</span>
                <span className="text-sm text-secondary">Real-Time Analysis</span>
              </div>
              <div className="trust-badge">
                <span className="text-xl">🌍</span>
                <span className="text-sm text-secondary">Trusted Globally</span>
              </div>
              <div className="trust-badge">
                <span className="text-xl">🏆</span>
                <span className="text-sm text-secondary">Industry Leader</span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-24 card glass card-shadow animate-fadeInUp">
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

            {/* Pricing Section */}
            <div id="pricing" className="mt-24">
              <div className="mb-10 text-center">
                <span className="inline-block px-6 py-3 surface-secondary border border-primary rounded-full text-accent-primary text-lg font-semibold">💎 Plans & Pricing</span>
              </div>
              <div className="max-w-6xl mx-auto">
                <PricingPage />
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-32 text-center py-20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 animate-gradient" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6 hero-text">
                  Ready to Dominate <span className="gradient-text">AI Overviews</span>?
                </h2>
                <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
                  Join thousands who've already optimized their content for Google's AI-powered future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => setCurrentPage('signup')}
                    className="btn-primary text-lg px-10 py-4 hover-lift glow-hover"
                  >
                    🚀 Get Started Free
                  </button>
                  <a href="#pricing" className="text-accent-primary hover:text-accent-secondary transition-colors font-medium">
                    View pricing plans →
                  </a>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-secondary">
                  <span className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> No credit card required
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> 2 free analyses per month
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-accent-primary">✓</span> Results in 30 seconds
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* FAQ Section */}
        <section id="faq" className="container mx-auto px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <FAQPage />
          </div>
        </section>
      </main>

      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;