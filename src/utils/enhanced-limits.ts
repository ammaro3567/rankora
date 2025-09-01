import { supabase } from '../lib/supabase';

export interface EnhancedLimitInfo {
  canProceed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
  canCreateProject: boolean;
  projectRemaining: number;
  projectLimit: number;
}

export interface ProjectSaveResult {
  success: boolean;
  projectId?: number;
  error?: string;
  code?: string;
}

/**
 * Enhanced limit checking with better error handling
 */
export const checkEnhancedLimits = async (clerkUserId: string): Promise<EnhancedLimitInfo> => {
  try {
    const { data, error } = await supabase.rpc('check_user_limits', {
      p_clerk_user_id: clerkUserId
    });

    if (error) {
      console.warn('⚠️ RPC check_user_limits failed:', error.message);
      // Fallback to basic limits
      return {
        canProceed: true,
        remaining: 999,
        limit: 999,
        canCreateProject: true,
        projectRemaining: 999,
        projectLimit: 999
      };
    }

    const limits = Array.isArray(data) ? data[0] : data;
    if (!limits) {
      throw new Error('No limit data returned');
    }

    return {
      canProceed: !!limits.can_proceed,
      remaining: limits.remaining || 0,
      limit: limits.analysis_limit || 5,
      canCreateProject: !!limits.can_create_project,
      projectRemaining: limits.project_remaining || 0,
      projectLimit: limits.project_limit || 1
    };
  } catch (error) {
    console.error('💥 Error checking enhanced limits:', error);
    // Fallback to basic limits
    return {
      canProceed: true,
      remaining: 999,
      limit: 999,
      canCreateProject: true,
      projectRemaining: 999,
      projectLimit: 999
    };
  }
};

/**
 * Enhanced project creation with limit checking
 */
export const createProjectWithLimits = async (
  clerkUserId: string, 
  name: string, 
  description?: string
): Promise<ProjectSaveResult> => {
  try {
    // Check limits first
    const limits = await checkEnhancedLimits(clerkUserId);
    
    if (!limits.canCreateProject) {
      return {
        success: false,
        error: `Project limit reached (${limits.projectLimit} per month). Please upgrade your plan.`,
        code: 'LIMIT_EXCEEDED'
      };
    }

    // Create project using RPC
    const { data, error } = await supabase.rpc('create_project_with_limit_check', {
      p_clerk_user_id: clerkUserId,
      p_name: name,
      p_description: description || ''
    });

    if (error) {
      if (error.message?.includes('Project limit exceeded')) {
        return {
          success: false,
          error: 'Project limit reached. Please upgrade your plan.',
          code: 'LIMIT_EXCEEDED'
        };
      }
      throw error;
    }

    return {
      success: true,
      projectId: data
    };
  } catch (error: any) {
    console.error('💥 Error creating project with limits:', error);
    return {
      success: false,
      error: error.message || 'Failed to create project',
      code: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Enhanced analysis linking to projects
 */
export const linkAnalysisToProject = async (
  clerkUserId: string,
  projectId: number,
  analysisId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('link_analysis_to_project', {
      p_clerk_user_id: clerkUserId,
      p_project_id: projectId,
      p_analysis_id: analysisId
    });

    if (error) {
      console.warn('⚠️ RPC link_analysis_to_project failed, using fallback:', error.message);
      
      // Fallback to direct update
      const { error: updateError } = await supabase
        .from('user_analyses')
        .update({ project_id: projectId })
        .eq('id', analysisId)
        .eq('clerk_user_id', clerkUserId);

      if (updateError) {
        throw updateError;
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('💥 Error linking analysis to project:', error);
    return {
      success: false,
      error: error.message || 'Failed to link analysis to project'
    };
  }
};
