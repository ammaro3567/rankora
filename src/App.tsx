import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { EmailVerification } from './components/EmailVerification';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { PricingPage } from './components/PricingPage';
import { AdminPanel } from './components/AdminPanel';
import { authService, profileService } from './lib/supabase';
import { LoadingOverlay } from './components/LoadingOverlay';

// 🎯 App state type
type AppState = {
  isLoading: boolean
  isAuthenticated: boolean
  currentUser: any
  currentPage: string
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
  const navigateTo = (page: string, updateUrl = true) => {
    console.log(`🧭 Navigating to: ${page}`)
    updateState({ currentPage: page })
    
    if (updateUrl) {
      const url = page === 'home' ? '/' : `/${page}`
      window.history.replaceState({}, document.title, url)
    }
  }

  // 🔐 Authentication check
  const checkAuthentication = async () => {
    console.log('🔍 Checking authentication status...')
    
    try {
      const { session, error } = await authService.getCurrentSession()
      
      if (error) {
        console.error('❌ Auth check failed:', error)
        updateState({ isLoading: false, isAuthenticated: false })
        return
      }

      if (session?.user) {
        // Check email verification
        if (!authService.isEmailVerified(session.user)) {
          console.log('📧 Email not verified, showing verification page')
          updateState({ 
            isLoading: false, 
            isAuthenticated: false, 
            currentUser: session.user,
            currentPage: 'verify-email'
          })
          return
        }

        // User is authenticated and verified
        console.log('✅ User authenticated:', session.user.email)
        
        // Check if user is owner
        const ownerStatus = await profileService.isOwner()
        
        updateState({ 
          isLoading: false, 
          isAuthenticated: true, 
          currentUser: session.user,
          isOwner: ownerStatus
        })

        // Handle routing for authenticated users
        const path = window.location.pathname
        
        if (path === '/' || path === '/home' || path === '/login' || path === '/signup') {
          navigateTo('dashboard')
        } else if (path === '/dashboard') {
          navigateTo('dashboard', false)
        } else if (path === '/admin' && ownerStatus) {
          navigateTo('admin', false)
        } else {
          navigateTo('dashboard')
        }
        
      } else {
        // No authenticated user
        console.log('ℹ️ No authenticated user found')
        updateState({ isLoading: false, isAuthenticated: false })
        
        // Handle routing for non-authenticated users
        const path = window.location.pathname
        const publicPages = ['/', '/login', '/signup', '/pricing', '/privacy', '/terms']
        
        if (path === '/dashboard' || path === '/admin') {
          navigateTo('login')
        } else if (publicPages.includes(path)) {
          const page = path === '/' ? 'home' : path.substring(1)
          navigateTo(page, false)
        } else {
          navigateTo('home')
        }
      }
      
    } catch (error) {
      console.error('💥 Authentication check failed:', error)
      updateState({ isLoading: false, isAuthenticated: false })
      navigateTo('home')
    }
  }

  // 🎧 Auth state listener
  useEffect(() => {
    console.log('🚀 App initializing...')
    
    // Initial auth check
    checkAuthentication()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Auth state changed: ${event}`, session?.user?.email || 'no user')

      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in
        if (!authService.isEmailVerified(session.user)) {
          console.log('📧 New user needs email verification')
          updateState({ 
            isLoading: false, 
            isAuthenticated: false, 
            currentUser: session.user,
            currentPage: 'verify-email'
          })
          return
        }

        // Handle Google OAuth profile creation
        if (session.user.app_metadata?.provider === 'google') {
          try {
            const existingProfile = await profileService.getUserProfile()
            if (!existingProfile) {
              console.log('🔄 Creating profile for Google user')
              const { error } = await supabase
                .from('user_profiles')
                .insert({
                  user_id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                  email: session.user.email
                })
              
              if (error) {
                console.warn('⚠️ Google profile creation failed:', error.message)
              }
            }
          } catch (error) {
            console.warn('⚠️ Google profile check failed:', error)
          }
        }

        // User is authenticated and verified
        console.log('✅ User signed in successfully')
        const ownerStatus = await profileService.isOwner()
        
        updateState({ 
          isLoading: false, 
          isAuthenticated: true, 
          currentUser: session.user,
          isOwner: ownerStatus
        })
        
        navigateTo('dashboard')

      } else if (event === 'SIGNED_OUT') {
        // User signed out
        console.log('👋 User signed out')
        updateState({ 
          isLoading: false, 
          isAuthenticated: false, 
          currentUser: null,
          isOwner: false
        })
        
        navigateTo('home')

      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed')
        // Don't change state, just log
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 🎭 Event handlers
  const handleLogin = async (email: string, password: string) => {
    console.log('🔐 Handling login...')
    updateState({ isLoading: true })

    const result = await authService.signIn(email, password)
    
    if (!result.success) {
      updateState({ isLoading: false })
      return { success: false, error: result.error }
    }

    // Auth state change listener will handle the rest
    return { success: true, error: null }
  }

  const handleSignup = async (email: string, password: string, fullName: string) => {
    console.log('📝 Handling signup...')
    updateState({ isLoading: true })

    const result = await authService.signUp(email, password, fullName)
    
    if (!result.success) {
      updateState({ isLoading: false })
      return { success: false, error: result.error }
    }

    // Show verification page
    updateState({ 
      isLoading: false,
      currentPage: 'verify-email',
      currentUser: result.data?.user
    })
    
    return { success: true, error: null }
  }

  const handleGoogleAuth = async () => {
    console.log('🔗 Handling Google auth...')
    const result = await authService.signInWithGoogle()
    return result
  }

  const handleLogout = async () => {
    console.log('👋 Handling logout...')
    updateState({ isLoading: true })
    
    await authService.signOut()
    // Auth state change listener will handle the rest
  }

  // 🎨 Render logic
  const renderCurrentPage = () => {
    if (state.isLoading) {
      return <LoadingOverlay />
    }

    // Authenticated user pages
    if (state.isAuthenticated) {
      switch (state.currentPage) {
        case 'dashboard':
          return (
            <Dashboard
              onLogout={handleLogout}
              showAdminAccess={state.isOwner}
              onOpenAdmin={() => navigateTo('admin')}
              isLoggedIn={true}
            />
          )
        
        case 'admin':
          if (state.isOwner) {
            return <AdminPanel onBack={() => navigateTo('dashboard')} />
          }
          // Fallback to dashboard if not owner
          navigateTo('dashboard')
          return <LoadingOverlay />
        
        default:
          navigateTo('dashboard')
          return <LoadingOverlay />
      }
    }

    // Non-authenticated user pages
    switch (state.currentPage) {
      case 'home':
        return (
          <LandingPage
            onLogin={() => navigateTo('login')}
            onSignup={() => navigateTo('signup')}
            onPricing={() => navigateTo('pricing')}
          />
        )

      case 'login':
        return (
          <LoginPage
            onBack={() => navigateTo('home')}
            onLogin={handleLogin}
            onSwitchToSignup={() => navigateTo('signup')}
            onGoogleLogin={handleGoogleAuth}
          />
        )

      case 'signup':
        return (
          <SignupPage
            onBack={() => navigateTo('home')}
            onSignup={handleSignup}
            onSwitchToLogin={() => navigateTo('login')}
            onGoogleSignup={handleGoogleAuth}
          />
        )

      case 'verify-email':
        return (
          <EmailVerification
            onBack={() => navigateTo('home')}
            userEmail={state.currentUser?.email}
          />
        )

      case 'pricing':
        return (
          <PricingPage
            onBack={() => navigateTo('home')}
            onLogin={() => navigateTo('login')}
          />
        )

      case 'privacy':
        return <PrivacyPage onBack={() => navigateTo('home')} />

      case 'terms':
        return <TermsPage onBack={() => navigateTo('home')} />

      default:
        navigateTo('home')
        return <LoadingOverlay />
    }
  }

  return (
    <div className="app">
      {renderCurrentPage()}
    </div>
  )
}

export default App