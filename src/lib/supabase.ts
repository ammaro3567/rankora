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

// 📊 Usage tracking functions
export const usageService = {
  async getMonthlyUsageCounts() {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) {
      return { total: 0, analyses: 0, comparisons: 0 }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    try {
      // Get analyses count
      const { data: analyses, error: analysesError } = await supabase
        .from('user_analyses')
        .select('id')
        .eq('user_id', session.user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      if (analysesError) {
        console.warn('⚠️ Failed to get analyses count:', analysesError.message)
      }

      // Get comparisons count
      const { data: comparisons, error: comparisonsError } = await supabase
        .from('competitor_comparisons')
        .select('id')
        .eq('user_id', session.user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      if (comparisonsError) {
        console.warn('⚠️ Failed to get comparisons count:', comparisonsError.message)
      }

      const analysesCount = analyses?.length || 0
      const comparisonsCount = comparisons?.length || 0
      const total = analysesCount + comparisonsCount

      console.log(`📊 Monthly usage: ${total} total (${analysesCount} analyses, ${comparisonsCount} comparisons)`)

      return {
        total,
        analyses: analysesCount,
        comparisons: comparisonsCount
      }
    } catch (error) {
      console.error('💥 Error getting monthly usage:', error)
      return { total: 0, analyses: 0, comparisons: 0 }
    }
  },

  async listProjects() {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) return []

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('⚠️ Failed to get projects:', error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.error('💥 Error getting projects:', error)
      return []
    }
  },

  async saveUserAnalysis(analysisData: any) {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    console.log('💾 Saving user analysis...')

    try {
      const { data, error } = await supabase
        .from('user_analyses')
        .insert({
          user_id: session.user.id,
          url: analysisData.url,
          content: analysisData.content || '',
          ai_overview_potential: analysisData.ai_overview_potential || 0,
          recommendations: analysisData.recommendations || [],
          analysis_results: analysisData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to save analysis:', error.message)
        throw error
      }

      console.log('✅ Analysis saved successfully:', data.id)
      return data
    } catch (error) {
      console.error('💥 Error saving analysis:', error)
      throw error
    }
  },

  async createProject(projectData: any) {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    console.log('📁 Creating new project...')

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          name: projectData.name,
          description: projectData.description || '',
          website_url: projectData.website_url || '',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to create project:', error.message)
        throw error
      }

      console.log('✅ Project created successfully:', data.id)
      return data
    } catch (error) {
      console.error('💥 Error creating project:', error)
      throw error
    }
  },

  async saveAnalysisToProject(projectId: string, analysisId: string) {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    console.log('🔗 Linking analysis to project...')

    try {
      const { data, error } = await supabase
        .from('user_analyses')
        .update({ project_id: projectId })
        .eq('id', analysisId)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to link analysis to project:', error.message)
        throw error
      }

      console.log('✅ Analysis linked to project successfully')
      return data
    } catch (error) {
      console.error('💥 Error linking analysis to project:', error)
      throw error
    }
  },

  async saveUserComparison(comparisonData: any) {
    const { session } = await authService.getCurrentSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    console.log('⚔️ Saving competitor comparison...')

    try {
      const { data, error } = await supabase
        .from('competitor_comparisons')
        .insert({
          user_id: session.user.id,
          user_url: comparisonData.userUrl,
          competitor_url: comparisonData.competitorUrl,
          user_content: comparisonData.userContent || '',
          competitor_content: comparisonData.competitorContent || '',
          user_score: comparisonData.userScore || 0,
          competitor_score: comparisonData.competitorScore || 0,
          comparison_results: comparisonData,
          recommendations: comparisonData.recommendations || [],
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to save comparison:', error.message)
        throw error
      }

      console.log('✅ Comparison saved successfully:', data.id)
      return data
    } catch (error) {
      console.error('💥 Error saving comparison:', error)
      throw error
    }
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
export const getMonthlyUsageCounts = usageService.getMonthlyUsageCounts
export const listProjects = usageService.listProjects
export const saveUserAnalysis = usageService.saveUserAnalysis
export const createProject = usageService.createProject
export const saveAnalysisToProject = usageService.saveAnalysisToProject
export const saveUserComparison = usageService.saveUserComparison
export const upsertUserProfile = () => {} // Deprecated