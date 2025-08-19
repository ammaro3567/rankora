import { createClient } from '@supabase/supabase-js'

// 📝 Type definitions
export interface ProjectAnalysis {
  id: string
  clerk_user_id: string
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
  clerk_user_id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in_at?: string
  analysis_count: number
  comparison_count: number
}

export interface RoleAssignment {
  id: string
  clerk_user_id: string
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
  auth: { 
    persistSession: false 
  }
})

// أثناء التطوير، اعرض العميل على نافذة المتصفح لتسهيل الاختبار من Console
if (import.meta.env.DEV) {
  // @ts-ignore
  (window as any).supabase = supabase;
}

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

// Helper function to set Clerk user ID for RLS
// NOTE: calling set_clerk_user_id from the browser often produces
// network 404s when PostgREST schema cache doesn't match or the
// RPC is not exposed to the Data API. To avoid spamming the console
// we make this a no-op in the browser. Server-side callers should
// still use a service role or call a single RPC that accepts the
// clerk_user_id parameter directly.
export const setClerkUserIdForRLS = async (_clerkUserId: string) => {
  // Intentionally no-op in frontend to avoid repeated 404 POSTs.
  return;
};

// 📊 Usage tracking functions
export const usageService = {
  async getMonthlyUsageCounts() {
    const clerkUserId = requireClerkUserId()

    // Prefer a server-side RPC that takes clerk_user_id explicitly to avoid RLS/session drift
    try {
      const { data, error } = await supabase.rpc('get_monthly_usage_counts_for', {
        p_clerk_user_id: clerkUserId
      })
      if (error) throw error

      const analysesCount = Array.isArray(data)
        ? Number(data[0]?.analyses || 0)
        : Number((data as any)?.analyses || 0)
      const comparisonsCount = Array.isArray(data)
        ? Number(data[0]?.comparisons || 0)
        : Number((data as any)?.comparisons || 0)
      const total = analysesCount + comparisonsCount

      console.log(`📊 Monthly usage (RPC): ${total} total (${analysesCount} analyses, ${comparisonsCount} comparisons)`)

      return { total, analyses: analysesCount, comparisons: comparisonsCount }
    } catch (rpcError) {
      console.warn('⚠️ RPC get_monthly_usage_counts_for failed, falling back to client-side counts:', (rpcError as any)?.message)

      // Fallback to client-side counting (may be affected by RLS)
      // Set Clerk user ID for RLS (no-op on frontend, safe to call)
      await setClerkUserIdForRLS(clerkUserId)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      try {
        const { data: analyses, error: analysesError } = await supabase
          .from('user_analyses')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())

        if (analysesError) {
          console.warn('⚠️ Failed to get analyses count:', analysesError.message)
        }

        let comparisonsCount = 0
        try {
          const { data: comparisons, error: comparisonsError } = await supabase
            .from('competitor_comparisons')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString())

          if (comparisonsError) {
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

        console.log(`📊 Monthly usage (fallback): ${total} total (${analysesCount} analyses, ${comparisonsCount} comparisons)`)

        return { total, analyses: analysesCount, comparisons: comparisonsCount }
      } catch (error) {
        console.error('💥 Error getting monthly usage (fallback):', error)
        return { total: 0, analyses: 0, comparisons: 0 }
      }
    }
  },

  async getRecentAnalyses(limit: number = 5) {
    const clerkUserId = requireClerkUserId()

    // Prefer secured RPC so RLS does not hide data
    try {
      const { data, error } = await supabase.rpc('get_recent_analyses_for', {
        p_clerk_user_id: clerkUserId,
        p_limit: limit
      })
      if (error) throw error
      const rows = Array.isArray(data) ? data : (data ? [data] : [])
      return rows as Array<{ url: string; analysis_results: any; created_at: string }>
    } catch (rpcError) {
      console.warn('⚠️ RPC get_recent_analyses_for failed, falling back to direct select:', (rpcError as any)?.message)
      try {
        await setClerkUserIdForRLS(clerkUserId)
        const { data, error } = await supabase
          .from('user_analyses')
          .select('url, analysis_results, created_at')
          .eq('clerk_user_id', clerkUserId)
          .order('created_at', { ascending: false })
          .limit(limit)
        if (error) throw error
        return (data || []) as Array<{ url: string; analysis_results: any; created_at: string }>
      } catch (e) {
        console.error('💥 Error getting recent analyses (fallback):', e)
        return []
      }
    }
  },

  async listProjects() {
    const clerkUserId = requireClerkUserId()
    
    // Prefer secured RPC to avoid RLS/session drift
    try {
      const { data, error } = await supabase.rpc('list_projects_for', { p_clerk_user_id: clerkUserId })
      if (error) throw error
      return Array.isArray(data) ? data : (data ? [data] : [])
    } catch (rpcError) {
      console.warn('⚠️ RPC list_projects_for failed, falling back to direct select:', (rpcError as any)?.message)
      try {
        // Best-effort RLS context
        await setClerkUserIdForRLS(clerkUserId);
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
        console.error('💥 Error getting projects (fallback):', error)
        return []
      }
    }
  },

  async saveUserAnalysis(analysisData: any) {
    const clerkUserId = requireClerkUserId()
    
    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUserId);

    console.log('📊 Saving user analysis:', analysisData.url)

    try {
      // Use the new enhanced service with limit checking
      const { data, error } = await supabase.rpc('create_analysis_with_limit_check', {
        p_clerk_user_id: clerkUserId,
        p_url: analysisData.url,
        p_analysis_results: analysisData.analysis_results,
        p_project_id: analysisData.projectId || null
      });

      if (error) {
        if (error.message?.includes('LIMIT_EXCEEDED')) {
          throw new Error('Monthly analysis limit reached. Please upgrade your plan.');
        }
        throw error;
      }

      console.log('✅ Analysis saved successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Error saving analysis:', error)
      throw error
    }
  },

  async createProject(projectData: any) {
    const clerkUserId = requireClerkUserId()
    
    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUserId);

    console.log('📁 Creating new project...')

    try {
      // استخدام Function الجديد مع التحقق من الحدود
      const { data, error } = await supabase.rpc('create_project_with_limit_check', {
        p_clerk_user_id: clerkUserId,
        p_name: projectData.name,
        p_description: projectData.description
      });
      
      if (error) {
        if (error.message?.includes('Project limit exceeded')) {
          console.warn('⚠️ Project limit reached:', error.message)
          return { 
            error: { 
              message: 'Project limit reached. Please upgrade your plan.',
              code: 'LIMIT_EXCEEDED'
            } 
          }
        }
        throw error;
      }
      
      console.log('✅ Project created successfully with limit check:', data)
      return { id: data }
    } catch (error: any) {
      console.error('💥 Error creating project:', error)
      throw error
    }
  },

  async saveAnalysisToProject(projectId: string, analysisId: string) {
    const clerkUserId = requireClerkUserId()
    
    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUserId);

    console.log('🔗 Linking analysis to project...')

  try {
    // Prefer secured RPC to avoid RLS update issues
    const { data, error } = await supabase.rpc('link_analysis_to_project', {
      p_clerk_user_id: clerkUserId,
      p_project_id: Number(projectId),
      p_analysis_id: Number(analysisId)
    })

      if (error) {
        console.warn('⚠️ RPC link_analysis_to_project failed, falling back to direct update:', (error as any)?.message)
        const fallback = await supabase
          .from('user_analyses')
          .update({ project_id: Number(projectId) })
          .eq('id', Number(analysisId))
          .eq('clerk_user_id', clerkUserId)
          .select()
          .single()
        if (fallback.error) {
          console.error('❌ Failed to link analysis to project (fallback):', fallback.error.message)
          throw fallback.error
        }
        console.log('✅ Analysis linked to project successfully (fallback)')
        return fallback.data
      }

      console.log('✅ Analysis linked to project successfully (RPC)')
      return data
  } catch (error) {
      console.error('💥 Error linking analysis to project:', error)
      throw error
    }
  },

  async saveUserComparison(comparisonData: any) {
    const clerkUserId = requireClerkUserId()

    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUserId);

    console.log('📊 Saving user comparison:', comparisonData.userUrl, 'vs', comparisonData.competitorUrl)

    try {
      // Prefer secured RPC to avoid RLS issues with anon key
      const { data, error } = await supabase.rpc('create_user_comparison', {
        p_clerk_user_id: clerkUserId,
        p_user_url: comparisonData.userUrl,
        p_competitor_url: comparisonData.competitorUrl,
        p_comparison_results: comparisonData.comparison_results
      })

      if (error) {
        console.warn('⚠️ RPC create_user_comparison failed, falling back to direct insert:', (error as any)?.message)
        const fallback = await supabase
          .from('competitor_comparisons')
          .insert({
            clerk_user_id: clerkUserId,
            user_url: comparisonData.userUrl,
            competitor_url: comparisonData.competitorUrl,
            comparison_results: comparisonData.comparison_results
          })
          .select()
          .single()
        if (fallback.error) {
          console.error('💥 Error saving comparison (fallback):', fallback.error)
          throw fallback.error
        }
        console.log('✅ Comparison saved via fallback:', fallback.data)
        return fallback.data
      }

      console.log('✅ Comparison saved successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Error saving comparison:', error)
      throw error
    }
  },

  async getProjectAnalyses(projectId: string) {
    const clerkUserId = requireClerkUserId()
    
    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUserId);

    console.log('📊 Getting project analyses for project:', projectId)

    try {
      // Prefer secured RPC to avoid RLS issues
      const { data, error } = await supabase.rpc('get_project_analyses_for', {
        p_clerk_user_id: clerkUserId,
        p_project_id: Number(projectId)
      })

      if (error) throw error

      const rows = Array.isArray(data) ? data : (data ? [data] : [])
      console.log(`✅ Found ${rows.length} analyses for project`)
      return rows
    } catch (error) {
      console.warn('⚠️ RPC get_project_analyses_for failed, falling back to direct select:', (error as any)?.message)
      try {
        await setClerkUserIdForRLS(clerkUserId);
        const { data, error: qError } = await supabase
          .from('user_analyses')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .eq('project_id', Number(projectId))
          .order('created_at', { ascending: false })

        if (qError) {
          console.warn('⚠️ Failed to get project analyses:', qError.message)
          return []
        }

        console.log(`✅ Found ${data?.length || 0} analyses for project (fallback)`)
        return data || []
      } catch (e) {
        console.error('💥 Error getting project analyses (fallback):', e)
        return []
      }
    }
  },

  async deleteProject(projectId: string) {
    const clerkUserId = requireClerkUserId()
    
    console.log('📁 Deleting project:', projectId)

    try {
      // Prefer secured RPC to avoid RLS issues
      const { data, error } = await supabase.rpc('delete_project_for', {
        p_clerk_user_id: clerkUserId,
        p_project_id: Number(projectId)
      })
      if (error) throw error

      console.log('✅ Project deleted successfully (RPC)')
      return !!data || true
    } catch (error) {
      console.warn('⚠️ RPC delete_project_for failed, falling back to direct delete:', (error as any)?.message)
      try {
        await setClerkUserIdForRLS(clerkUserId)
        const { error: qError } = await supabase
          .from('projects')
          .delete()
          .eq('id', Number(projectId))
          .eq('clerk_user_id', clerkUserId)
        if (qError) {
          console.error('💥 Error deleting project (fallback):', qError)
          throw qError
        }
        console.log('✅ Project deleted successfully (fallback)')
        return true
      } catch (e) {
        console.error('💥 Error deleting project:', e)
        throw e
      }
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
          clerk_user_id: profile.clerk_user_id,
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
        .eq('clerk_user_id', userId)
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
          clerk_user_id: userId,
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
    
    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUserId);
  
  const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    if (error) {
      // 406 occurs when no rows; suppress noisy log
      if ((error as any).code !== 'PGRST116' && (error as any).code !== '406') {
        console.warn('⚠️ Profile fetch error:', (error as any).message || error)
      }
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
    
    // Set Clerk user ID for RLS
    await setClerkUserIdForRLS(clerkUser.id);
    
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

// 💳 Subscription and Plan Management Functions
export const subscriptionService = {
  // الحصول على معلومات الاشتراك
  async getUserSubscriptionInfo(clerkUserId: string) {
    // Prefer RPC that accepts clerk_user_id directly to avoid relying on
    // set_clerk_user_id session state across pooled connections.
    const { data, error } = await supabase.rpc('get_user_subscription_info_for', {
      p_clerk_user_id: clerkUserId
    });

    if (error) throw error;
    // RPC returns table rows; ensure we return single object or null
    return Array.isArray(data) ? data[0] || null : data || null;
  },

  // إنشاء اشتراك جديد
  async createUserSubscription(
    clerkUserId: string,
    planId: number,
    paypalSubscriptionId: string,
    paypalOrderId: string
  ) {
    await setClerkUserIdForRLS(clerkUserId);
    
    const { data, error } = await supabase.rpc('create_user_subscription', {
      p_clerk_user_id: clerkUserId,
      p_plan_id: planId,
      p_paypal_subscription_id: paypalSubscriptionId,
      p_paypal_order_id: paypalOrderId
    });
    
    if (error) throw error;
    return data;
  },

  // التحقق من حدود المستخدم
  async checkUserLimits(clerkUserId: string) {
    await setClerkUserIdForRLS(clerkUserId);
    
    const { data, error } = await supabase.rpc('check_user_limits', {
      p_clerk_user_id: clerkUserId
    });
    
    if (error) throw error;
    return data[0] || null;
  },

  // تحديث حالة الاشتراك
  async updateSubscriptionStatus(
    subscriptionId: number,
    newStatus: string,
    paypalData?: any
  ) {
    const { data, error } = await supabase.rpc('update_subscription_status', {
      p_subscription_id: subscriptionId,
      p_new_status: newStatus,
      p_paypal_data: paypalData || {}
    });
    
    if (error) throw error;
    return data;
  },

  // الحصول على جميع الخطط المتاحة
  async getAvailablePlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

// 🔒 Enhanced Analysis and Project Creation with Limit Checks
export const enhancedService = {
  // إنشاء تحليل مع التحقق من الحدود
  async createAnalysisWithLimitCheck(
    clerkUserId: string,
    url: string,
    analysisResults: any,
    projectId?: number
  ) {
    await setClerkUserIdForRLS(clerkUserId);
    
    const { data, error } = await supabase.rpc('create_analysis_with_limit_check', {
      p_clerk_user_id: clerkUserId,
      p_url: url,
      p_analysis_results: analysisResults,
      p_project_id: projectId
    });
    
    if (error) throw error;
    return data;
  },

  // إنشاء مشروع مع التحقق من الحدود
  async createProjectWithLimitCheck(
    clerkUserId: string,
    name: string,
    description?: string
  ) {
    await setClerkUserIdForRLS(clerkUserId);
    
    const { data, error } = await supabase.rpc('create_project_with_limit_check', {
      p_clerk_user_id: clerkUserId,
      p_name: name,
      p_description: description
    });
    
    if (error) throw error;
    return data;
  }
};

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

// 🆕 New subscription and enhanced service exports
export const getUserSubscriptionInfo = subscriptionService.getUserSubscriptionInfo
export const createUserSubscription = subscriptionService.createUserSubscription
export const checkUserLimits = subscriptionService.checkUserLimits
export const updateSubscriptionStatus = subscriptionService.updateSubscriptionStatus
export const getAvailablePlans = subscriptionService.getAvailablePlans
export const createAnalysisWithLimitCheck = enhancedService.createAnalysisWithLimitCheck
export const createProjectWithLimitCheck = enhancedService.createProjectWithLimitCheck