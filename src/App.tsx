import { useState, useEffect } from 'react';
// import { LoginPage } from './components/LoginPage';
// import { SignupPage } from './components/SignupPage';
import { Dashboard } from './components/Dashboard';
// import { EmailVerification } from './components/EmailVerification';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { PricingPage } from './components/PricingPage';
import { AdminPanel } from './components/AdminPanel';
import { profileService } from './lib/supabase';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AnimatedBackground } from './components/AnimatedBackground';
import LandingPage from './components/LandingPage';

// تم إزالة تحويلات Supabase المبكرة؛ Clerk سيتكفل بإدارة الدخول

// 🎯 App state type
type AppState = {
  isLoading: boolean
  isAuthenticated: boolean
  currentUser: any
  currentPage: 'loading' | 'home' | 'dashboard' | 'login' | 'signup' | 'pricing' | 'privacy' | 'terms' | 'admin'
  isOwner: boolean
}

function App() {
  // 🚀 Clean state management
  const [state, setState] = useState<AppState>({
    isLoading: true,
    isAuthenticated: false,
    currentUser: null,
    currentPage: 'loading',
    isOwner: false
  })

  // 🔄 Update state helper
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // 🛣️ Navigation helper
  const navigateTo = (page: AppState['currentPage'], updateUrl = true) => {
    console.log(`🧭 Navigating to: ${page}`)
    updateState({ currentPage: page })
    
    if (updateUrl) {
      const url = page === 'home' ? '/' : `/${page}`
      window.history.replaceState({}, document.title, url)
    }
  }

  // 🔐 Clerk-driven auth state
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  // 🎧 React to Clerk state and enforce routing
  useEffect(() => {
    if (!isLoaded) return
    
    const path = window.location.pathname
    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL as string | undefined;
    const isOwnerUser = user?.primaryEmailAddress?.emailAddress === ownerEmail;
    
    if (isSignedIn) {
      updateState({ 
        isAuthenticated: true, 
        currentUser: user, 
        isLoading: false,
        isOwner: isOwnerUser
      })
      
      if (path === '/' || path === '/home' || ['/login','/signup','/verify-email'].includes(path)) {
        navigateTo('dashboard', true)
      } else if (path === '/dashboard') {
        navigateTo('dashboard', false)
      } else if (path === '/terms') {
        navigateTo('terms', false)
      } else if (path === '/privacy') {
        navigateTo('privacy', false)
      } else if (path === '/admin') {
        if (!isOwnerUser) navigateTo('dashboard', true)
      }
    } else {
      updateState({ 
        isAuthenticated: false, 
        currentUser: null, 
        isLoading: false,
        isOwner: false
      })
      
      if (path === '/dashboard' || path === '/admin') {
        navigateTo('home', true)
      } else if (path === '/terms') {
        navigateTo('terms', true)
      } else if (path === '/privacy') {
        navigateTo('privacy', true)
      } else if (path === '/') {
        navigateTo('home', true)
      }
    }
  }, [isLoaded, isSignedIn, user])

  // ✅ Ensure loading stops when Clerk loaded
  useEffect(() => {
    if (isLoaded && state.isLoading) updateState({ isLoading: false })
  }, [isLoaded])

  // 🎭 Event handlers
  const goToDashboard = async () => {
    if (state.isAuthenticated) {
      window.location.href = '/dashboard'
    } else {
      navigateTo('home', true)
    }
  }
  // لم نعد نستخدم صفحات تسجيل الدخول المخصصة؛ سنعرض أزرار Clerk الجاهزة

  // لا حاجة لدوال تسجيل الاشتراك اليدوية

  // لا حاجة لتعامل خاص مع جوجل؛ Clerk يتكفّل به

  const handleLogout = async () => {
    console.log('👋 Handling logout...')
    await signOut()
  }

  // 🎨 Render logic
  const renderCurrentPage = () => {
    if (state.isLoading) {
      return <LoadingOverlay isVisible={true} />
    }

    // Authenticated user pages (driven by Clerk)
    if (isLoaded && isSignedIn) {
      switch (state.currentPage) {
        case 'home':
          // 🔓 مستخدم مسجّل لكن يبقى على الهوم مع زر الذهاب للداشبورد
          return (
            <LandingPage
              onLogin={() => navigateTo('login')}
              onSignup={() => navigateTo('signup')}
              onPricing={() => navigateTo('pricing')}
              isAuthenticated={true}
              onGoDashboard={goToDashboard}
            />
          )
        case 'dashboard':
          console.log('🎨 Rendering Dashboard - User:', state.currentUser?.primaryEmailAddress?.emailAddress)
          return (
            <Dashboard 
              onLogout={handleLogout}
              showAdminAccess={state.isOwner}
              onOpenAdmin={() => navigateTo('admin')}
            />
          )
        
        case 'admin':
          if (state.isOwner) {
            return <AdminPanel onBack={() => navigateTo('dashboard')} />
          }
          // Fallback to dashboard if not owner
          navigateTo('dashboard')
          return <LoadingOverlay isVisible={true} />
        case 'terms':
          return <TermsPage onBack={() => navigateTo('dashboard')} />
        case 'privacy':
          return <PrivacyPage onBack={() => navigateTo('dashboard')} />
        
        default:
          // Fallback safely: render dashboard directly
          return (
            <Dashboard 
              onLogout={handleLogout}
              showAdminAccess={state.isOwner}
              onOpenAdmin={() => navigateTo('admin')}
            />
          )
      }
    }

    // Public pages (Clerk-driven)
    switch (state.currentPage) {
      case 'home':
        console.log('🏠 Rendering Landing Page')
        return (
          <LandingPage
            onLogin={() => navigateTo('login')}
            onSignup={() => navigateTo('signup')}
            onPricing={() => navigateTo('pricing')}
            isAuthenticated={isLoaded && isSignedIn}
            onGoDashboard={goToDashboard}
          />
        )

      case 'login':
    return (
          <div className="p-6 flex items-center justify-center">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        )

      case 'signup':
    return (
          <div className="p-6 flex items-center justify-center">
            <SignedOut>
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        )

      

      case 'pricing':
        return <PricingPage onBack={() => navigateTo('home')} />

      case 'privacy':
        return <PrivacyPage onBack={() => navigateTo('home')} />

      case 'terms':
        return <TermsPage onBack={() => navigateTo('home')} />

      default:
        navigateTo('home')
        return <LoadingOverlay isVisible={true} />
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Global animated background aligned with landing */}
      <AnimatedBackground />

      <div className="relative z-10 app">
        {renderCurrentPage()}
      </div>
    </div>
  )
}

export default App