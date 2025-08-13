import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 🚀 Clean Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'rankora-auth-token'
  }
})

// 🔐 Authentication functions - simple and clean
export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, fullName: string) {
    console.log('🔄 Starting signup for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName.trim(),
        }
      }
    })

    if (error) {
      console.error('❌ Signup error:', error.message)
      return { success: false, error: error.message, data: null }
    }

    if (data.user) {
      console.log('✅ Signup successful:', data.user.email)
      
      // Create user profile - only once, here
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName.trim(),
            email: data.user.email
          })

        if (profileError) {
          console.warn('⚠️ Profile creation failed:', profileError.message)
        } else {
          console.log('✅ Profile created successfully')
        }
      } catch (profileErr) {
        console.warn('⚠️ Profile creation error:', profileErr)
      }
    }

    return { success: true, error: null, data }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    console.log('🔄 Starting signin for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      console.error('❌ Signin error:', error.message)
      return { success: false, error: error.message, data: null }
    }

    console.log('✅ Signin successful:', data.user?.email)
    return { success: true, error: null, data }
  },

  // Google OAuth
  async signInWithGoogle() {
    console.log('🔄 Starting Google signin')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      console.error('❌ Google signin error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Google signin initiated')
    return { success: true, error: null }
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Session check error:', error.message)
      return { session: null, error: error.message }
    }

    if (session?.user) {
      console.log('✅ Session found:', session.user.email)
    } else {
      console.log('ℹ️ No active session')
    }

    return { session, error: null }
  },

  // Sign out
  async signOut() {
    console.log('🔄 Signing out user')
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Signout error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Signout successful')
    return { success: true, error: null }
  },

  // Check if email is verified
  isEmailVerified(user: any) {
    return user?.email_confirmed_at != null
  },

  // Auth state listener
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 👤 User profile functions
export const profileService = {
  async getUserProfile() {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      console.warn('⚠️ Profile fetch error:', error.message)
      return null
    }

    return data
  },

  async isOwner() {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) return false

    return session.user.email === 'ammarragab256@gmail.com'
  }
}

// Export for backward compatibility (will remove later)
export const signUp = authService.signUp
export const signIn = authService.signIn
export const signInWithGoogle = authService.signInWithGoogle
export const getCurrentUser = authService.getCurrentSession
export const getUserProfile = profileService.getUserProfile
export const isOwner = profileService.isOwner
export const upsertUserProfile = () => {} // Deprecated