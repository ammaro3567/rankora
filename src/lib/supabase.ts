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

// 🔎 Clerk helpers (frontend-only)
const getClerkUser = () => {
  try {
    const anyWindow = window as any
    return anyWindow?.Clerk?.user || null
  } catch {
    return null
  }
}

const requireClerkUserId = (): string => {
  const clerkUser = getClerkUser()
  if (!clerkUser?.id) throw new Error('User not authenticated')
  return clerkUser.id as string
}

// 📊 Usage tracking functions
export const usageService = {
  async getMonthlyUsageCounts() {
    const clerkUserId = requireClerkUserId()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    try {
      // Get analyses count
      const { data: analyses, error: analysesError } = await supabase
        .from('user_analyses')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
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
          .eq('clerk_user_id', clerkUserId)
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
    const clerkUserId = requireClerkUserId()

    try {
      const { data, error } = await supabase
        .from('projects')
    .select('*')
        .eq('clerk_user_id', clerkUserId)
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
    const clerkUserId = requireClerkUserId()

    console.log('💾 Saving user analysis...')

    try {
      const { data, error } = await supabase
        .from('user_analyses')
        .insert({
          clerk_user_id: clerkUserId,
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
    const clerkUserId = requireClerkUserId()

    console.log('📁 Creating new project...')

    try {
  const { data, error } = await supabase
        .from('projects')
        .insert({
          clerk_user_id: clerkUserId,
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
    const clerkUserId = requireClerkUserId()

    console.log('🔗 Linking analysis to project...')

  try {
    const { data, error } = await supabase
        .from('user_analyses')
        .update({ project_id: projectId })
        .eq('id', analysisId)
        .eq('clerk_user_id', clerkUserId)
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
    const clerkUserId = requireClerkUserId()

    console.log('⚔️ Saving competitor comparison...')

    try {
      const { data, error } = await supabase
        .from('competitor_comparisons')
        .insert({
          clerk_user_id: clerkUserId,
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
    const clerkUserId = requireClerkUserId()

    console.log('📊 Getting project analyses for project:', projectId)

    try {
  const { data, error } = await supabase
        .from('user_analyses')
    .select('*')
        .eq('clerk_user_id', clerkUserId)
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
    const clerkUserId = requireClerkUserId()

    console.log('🗑️ Deleting project:', projectId)

    try {
      // First, remove project reference from analyses
      const { error: updateError } = await supabase
        .from('user_analyses')
        .update({ project_id: null })
        .eq('project_id', projectId)
        .eq('clerk_user_id', clerkUserId)

      if (updateError) {
        console.warn('⚠️ Failed to update analyses:', updateError.message)
      }

      // Then delete the project
  const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('clerk_user_id', clerkUserId)
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
    const clerkUser = getClerkUser()
    if (!clerkUser) throw new Error('User not authenticated')

    console.log('👥 Getting all users for admin panel...')

    try {
      // First check if user is owner/admin
      const isUserOwner = await profileService.isOwner()
      if (!isUserOwner) {
        throw new Error('Unauthorized: Only owners can access user data')
      }

      // Get all users with their profiles and stats
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
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
            .eq('clerk_user_id', profile.clerk_user_id),
          supabase
            .from('competitor_comparisons')
            .select('id', { count: 'exact' })
            .eq('clerk_user_id', profile.clerk_user_id)
        ])

        usersWithStats.push({
          user_id: profile.user_id,
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
    const clerkUser = getClerkUser()
    if (!clerkUser) throw new Error('User not authenticated')

    console.log(`🔄 Updating user ${userId} role to ${newRole}...`)

    try {
      // Check if user is owner/admin
      const isUserOwner = await profileService.isOwner()
      if (!isUserOwner) {
        throw new Error('Unauthorized: Only owners can update user roles')
      }

      // Update user profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId)
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
          assigned_by: clerkUser.id,
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
    const clerkUser = getClerkUser()
    if (!clerkUser) throw new Error('User not authenticated')

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
    const clerkUserId = requireClerkUserId()
  const { data, error } = await supabase
      .from('profiles')
    .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) {
      console.warn('⚠️ Profile fetch error:', error.message)
      return null
    }

    return data
  },

  async isOwner() {
    const clerkUser = getClerkUser()
    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL as string | undefined
    const email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress
    return !!(ownerEmail && email && email.toLowerCase() === ownerEmail.toLowerCase())
  },

  async upsertUserProfile(partial: { full_name?: string; company?: string }) {
    const clerkUser = getClerkUser()
    if (!clerkUser?.id) throw new Error('User not authenticated')
    const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || null
    const payload: any = {
      clerk_user_id: clerkUser.id,
      full_name: partial.full_name ?? (clerkUser.fullName || null),
      company: partial.company ?? null,
      updated_at: new Date().toISOString()
    }
    if (email) payload.email = email
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'clerk_user_id' })
      .select()
      .single()
    if (error) throw error
    return data
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