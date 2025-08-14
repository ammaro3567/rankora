import { createClient } from '@supabase/supabase-js'

// 📝 Type definitions
export interface ProjectAnalysis {
  id: string
  user_id: string
  project_id: string | null
  url: string
  content: string
  ai_overview_potential: number
  recommendations: string[]
  analysis_results: any
  created_at: string
}

export type UserRole = 'starter' | 'business' | 'enterprise' | 'owner'

export interface UserRoleSummary {
  user_id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in_at?: string
  analysis_count: number
  comparison_count: number
}

export interface RoleAssignment {
  id: string
  user_id: string
  role: UserRole
  assigned_at: string
  assigned_by: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 🚀 Clean Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // لم نعد نستخدم Supabase Auth لإدارة الجلسات
})

// 🔐 Authentication functions - simple and clean
// أزلنا طبقة authService لأن Clerk يتكفّل بالمصادقة

// Helper to return the current authenticated user object (not the whole session)
export const getCurrentUser = async () => null

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
      let comparisonsCount = 0
      try {
        const { data: comparisons, error: comparisonsError } = await supabase
          .from('competitor_comparisons')
          .select('id')
          .eq('user_id', session.user.id)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())

        if (comparisonsError) {
          // Gracefully handle missing table in schema
          if ((comparisonsError as any).message?.includes('Could not find the table')) {
            comparisonsCount = 0
          } else {
            console.warn('⚠️ Failed to get comparisons count:', comparisonsError.message)
          }
        } else {
          comparisonsCount = comparisons?.length || 0
        }
      } catch {
        comparisonsCount = 0
      }

      const analysesCount = analyses?.length || 0
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
    // TODO: بدّل إلى Clerk user id
    const session = null as any
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
    // TODO: استخدم Clerk User ID
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

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
    // TODO: استخدم Clerk User ID
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

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
    // TODO: استخدم Clerk User ID
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

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
    // TODO: استخدم Clerk User ID
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

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
  },

  async getProjectAnalyses(projectId: string) {
    // TODO: استخدم Clerk User ID
    const session = null as any
    if (!session?.user) return []

    console.log('📊 Getting project analyses for project:', projectId)

    try {
  const { data, error } = await supabase
        .from('user_analyses')
    .select('*')
        .eq('user_id', session.user.id)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('⚠️ Failed to get project analyses:', error.message)
        return []
      }

      console.log(`✅ Found ${data?.length || 0} analyses for project`)
      return data || []
    } catch (error) {
      console.error('💥 Error getting project analyses:', error)
      return []
    }
  },

  async deleteProject(projectId: string) {
    // TODO: استخدم Clerk User ID
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

    console.log('🗑️ Deleting project:', projectId)

    try {
      // First, remove project reference from analyses
      const { error: updateError } = await supabase
        .from('user_analyses')
        .update({ project_id: null })
        .eq('project_id', projectId)
        .eq('user_id', session.user.id)

      if (updateError) {
        console.warn('⚠️ Failed to update analyses:', updateError.message)
      }

      // Then delete the project
  const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', session.user.id)
        .select()
        .single()
    
  if (error) {
        console.error('❌ Failed to delete project:', error.message)
        throw error
      }

      console.log('✅ Project deleted successfully')
      return data
    } catch (error) {
      console.error('💥 Error deleting project:', error)
      throw error
    }
  },

  async getAllUsers(): Promise<UserRoleSummary[]> {
    // TODO: تحقّق عبر Clerk owner
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

    console.log('👥 Getting all users for admin panel...')

    try {
      // First check if user is owner/admin
      const isUserOwner = await profileService.isOwner()
      if (!isUserOwner) {
        throw new Error('Unauthorized: Only owners can access user data')
      }

      // Get all users with their profiles and stats
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profileError) {
        console.warn('⚠️ Failed to get user profiles:', profileError.message)
        return []
      }

      // Get analysis counts for each user
      const usersWithStats: UserRoleSummary[] = []
      for (const profile of profiles || []) {
        const [analysesResult, comparisonsResult] = await Promise.all([
          supabase
            .from('user_analyses')
            .select('id', { count: 'exact' })
            .eq('user_id', profile.id),
          supabase
            .from('competitor_comparisons')
            .select('id', { count: 'exact' })
            .eq('user_id', profile.id)
        ])

        usersWithStats.push({
          user_id: profile.id,
          email: profile.email || 'N/A',
          role: profile.role || 'starter',
          created_at: profile.created_at,
          last_sign_in_at: profile.last_sign_in_at,
          analysis_count: analysesResult.count || 0,
          comparison_count: comparisonsResult.count || 0
        })
      }

      console.log(`✅ Found ${usersWithStats.length} users`)
      return usersWithStats
    } catch (error) {
      console.error('💥 Error getting users:', error)
      throw error
    }
  },

  async updateUserRole(userId: string, newRole: UserRole) {
    // TODO: تحقّق عبر Clerk owner
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

    console.log(`🔄 Updating user ${userId} role to ${newRole}...`)

    try {
      // Check if user is owner/admin
      const isUserOwner = await profileService.isOwner()
      if (!isUserOwner) {
        throw new Error('Unauthorized: Only owners can update user roles')
      }

      // Update user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to update user role:', error.message)
        throw error
      }

      // Log the role assignment
      const { error: assignmentError } = await supabase
        .from('role_assignments')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: session.user.id,
          assigned_at: new Date().toISOString()
        })

      if (assignmentError) {
        console.warn('⚠️ Failed to log role assignment:', assignmentError.message)
      }

      console.log('✅ User role updated successfully')
      return data
    } catch (error) {
      console.error('💥 Error updating user role:', error)
      throw error
    }
  },

  async getRoleAssignments(): Promise<RoleAssignment[]> {
    // TODO: تحقّق عبر Clerk owner
    const session = null as any
    if (!session?.user) throw new Error('User not authenticated')

    console.log('📋 Getting role assignments...')

    try {
      // Check if user is owner/admin
      const isUserOwner = await profileService.isOwner()
      if (!isUserOwner) {
        throw new Error('Unauthorized: Only owners can access role assignments')
      }

      const { data, error } = await supabase
        .from('role_assignments')
        .select('*')
        .order('assigned_at', { ascending: false })
        .limit(100)

      if (error) {
        console.warn('⚠️ Failed to get role assignments:', error.message)
        return []
      }

      console.log(`✅ Found ${data?.length || 0} role assignments`)
      return data || []
    } catch (error) {
      console.error('💥 Error getting role assignments:', error)
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
// تمت إزالة واجهات Supabase Auth
export const getUserProfile = profileService.getUserProfile
export const isOwner = profileService.isOwner
export const getMonthlyUsageCounts = usageService.getMonthlyUsageCounts
export const listProjects = usageService.listProjects
export const saveUserAnalysis = usageService.saveUserAnalysis
export const createProject = usageService.createProject
export const saveAnalysisToProject = usageService.saveAnalysisToProject
export const saveUserComparison = usageService.saveUserComparison
export const getProjectAnalyses = usageService.getProjectAnalyses
export const deleteProject = usageService.deleteProject
export const getAllUsers = usageService.getAllUsers
export const updateUserRole = usageService.updateUserRole
export const getRoleAssignments = usageService.getRoleAssignments
export const upsertUserProfile = profileService.upsertUserProfile