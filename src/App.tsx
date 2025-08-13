import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
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
        console.log(`🎯 Authenticated user on path: ${path}`)
        
        // Always redirect authenticated users to dashboard unless they're specifically on admin
        if (path === '/admin' && ownerStatus) {
          navigateTo('admin', false)
        } else {
          // For all other paths (including /), redirect to dashboard
          navigateTo('dashboard', true)
        }
        
      } else {
        // No authenticated user
        console.log('ℹ️ No authenticated user found')
        updateState({ isLoading: false, isAuthenticated: false })
        
        // Handle routing for non-authenticated users
        const path = window.location.pathname
        console.log(`🏠 Non-authenticated user on path: ${path}`)
        
        // Redirect protected routes to login
        if (path === '/dashboard' || path === '/admin') {
          console.log('🔒 Protected route - redirecting to login')
          navigateTo('login', true)
        } else if (path === '/') {
          // 🚨 NO LANDING PAGE! Root goes directly to login
          console.log('🔥 Root access - redirecting to login (NO HOME PAGE)')
          navigateTo('login', true)
        } else if (['/login', '/signup', '/pricing', '/privacy', '/terms', '/verify-email'].includes(path)) {
          // Public pages - navigate without URL update
          const page = path.substring(1)
          navigateTo(page, false)
        } else {
          // Unknown routes go to login
          navigateTo('login', true)
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
        
        console.log('🎯 Redirecting signed-in user to dashboard')
        navigateTo('dashboard', true)

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
          console.log('🎨 Rendering Dashboard - User:', state.currentUser?.email)
    return (
      <Dashboard 
        onLogout={handleLogout}
              showAdminAccess={state.isOwner}
              onOpenAdmin={() => navigateTo('admin')}
              isLoggedIn={state.isAuthenticated}
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
      case 'login':
    return (
      <LoginPage
            onBack={() => navigateTo('login')}
            onLogin={handleLogin}
            onSwitchToSignup={() => navigateTo('signup')}
            onGoogleLogin={handleGoogleAuth}
          />
        )

      case 'signup':
    return (
      <SignupPage
            onBack={() => navigateTo('login')}
            onSignup={handleSignup}
            onSwitchToLogin={() => navigateTo('login')}
            onGoogleSignup={handleGoogleAuth}
          />
        )

      case 'verify-email':
        return (
          <EmailVerification
            onBack={() => navigateTo('login')}
            userEmail={state.currentUser?.email}
          />
        )

      case 'pricing':
        return (
          <PricingPage
            onBack={() => navigateTo('login')}
            onLogin={() => navigateTo('login')}
          />
        )

      case 'privacy':
        return <PrivacyPage onBack={() => navigateTo('login')} />

      case 'terms':
        return <TermsPage onBack={() => navigateTo('login')} />

      default:
        navigateTo('login')
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