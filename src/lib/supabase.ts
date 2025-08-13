import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase credentials are configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your-supabase-url' || 
    supabaseAnonKey === 'your-supabase-anon-key' ||
    supabaseUrl === 'https://your-project-id.supabase.co' ||
    supabaseAnonKey === 'your-anon-key-here') {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true
  }
})

// Auth helper functions
export const signUp = async (email: string, password: string, fullName?: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: { message: 'Supabase not configured. Please check your environment variables.' } }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
      data: {
        full_name: fullName || '',
      }
    }
  })

  // Create profile after successful signup
  if (data.user && fullName) {
    await upsertUserProfile({
      user_id: data.user.id,
      full_name: fullName,
    });
  }

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: { message: 'Supabase not configured. Please check your environment variables.' } }
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// Google Sign In
export const signInWithGoogle = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: { message: 'Supabase not configured. Please check your environment variables.' } }
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/#/auth/callback`,
      queryParams: {
        // modern params; avoid deprecated flow warnings
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: { message: 'Supabase not configured. Please check your environment variables.' } }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  try {
  const { data: { user } } = await supabase.auth.getUser()
  return user
  } catch (error) {
    console.warn('Failed to get current user:', error)
    return null
  }
}

// Persist analysis for logged-in users
export const saveUserAnalysis = async (url: string, result: unknown) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } };
  return await supabase.from('user_analyses').insert({ user_id: user.id, url, result });
}

export const saveUserComparison = async (
  userUrl: string,
  competitorUrl: string,
  result: unknown
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } };
  return await supabase.from('user_comparisons').insert({ user_id: user.id, user_url: userUrl, competitor_url: competitorUrl, result });
}

// Monthly usage counts for logged-in user
export const getMonthlyUsageCounts = async (): Promise<{ analyses: number; comparisons: number; total: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { analyses: 0, comparisons: 0, total: 0 };
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: analysesCount } = await supabase
    .from('user_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', firstOfMonth);

  const { count: comparisonsCount } = await supabase
    .from('user_comparisons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', firstOfMonth);

  const analyses = analysesCount || 0;
  const comparisons = comparisonsCount || 0;
  return { analyses, comparisons, total: analyses + comparisons };
}

// Projects APIs
export interface Project { id: number; user_id: string; name: string; created_at: string }

export const listProjects = async (): Promise<Project[]> => {
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  return (data as unknown as Project[]) || [];
};

export const createProject = async (name: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } };
  return await supabase.from('projects').insert({ user_id: user.id, name });
};

export const saveAnalysisToProject = async (projectId: number, url: string, result: unknown) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } };
  return await supabase.from('project_analyses').insert({ user_id: user.id, project_id: projectId, url, result });
};

export interface ProjectAnalysis {
  id: number;
  project_id: number;
  url: string;
  result: any;
  created_at: string;
}

export const getProjectAnalyses = async (projectId: number): Promise<ProjectAnalysis[]> => {
  const { data } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return (data as unknown as ProjectAnalysis[]) || [];
};

export const deleteProject = async (projectId: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } };
  return await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
};

// Role Types
export type UserRole = 'starter' | 'pro' | 'business';

export interface RolePermission {
  role: UserRole;
  permission_name: string;
  permission_value: any;
}

export interface RoleAssignment {
  id: number;
  user_id: string;
  role: UserRole;
  assigned_by: string;
  assigned_at: string;
  previous_role?: UserRole;
  notes?: string;
}

export interface UserRoleSummary {
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  role_assigned_at: string;
  assigned_by_email: string | null;
  profile_created_at: string;
}

// Profiles
export interface UserProfile {
  user_id: string;
  full_name: string | null;
  company: string | null;
  timezone: string | null;
  role: UserRole;
  role_assigned_by: string | null;
  role_assigned_at: string | null;
  notifications: {
    email: boolean;
    push: boolean;
    weekly: boolean;
  } | null;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return (data as unknown as UserProfile) || null;
};

export const upsertUserProfile = async (profile: Partial<UserProfile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } } as const;
  const payload = { user_id: user.id, ...profile } as any;
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .maybeSingle();
  return { data: data as unknown as UserProfile | null, error } as const;
};

// Role Management Functions (Owner Only)
export const OWNER_EMAIL = 'ammarebrahim725@gmail.com'; // Owner email

export const isOwner = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === OWNER_EMAIL;
};

export const getAllUsers = async (): Promise<UserRoleSummary[]> => {
  if (!await isOwner()) throw new Error('Unauthorized: Owner access required');
  
  // Try using the function first, fallback to direct query if needed
  try {
    const { data, error } = await supabase
      .rpc('get_all_users_with_roles');
      
    if (error) throw error;
    return (data as unknown as UserRoleSummary[]) || [];
  } catch (error) {
    // Fallback to direct query if function doesn't work
    console.warn('Function call failed, using direct query:', error);
    
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        role,
        role_assigned_at,
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (queryError) throw queryError;
    
    // Get user emails separately
    const { data: users } = await supabase.auth.admin.listUsers();
    
    return (data || []).map(profile => ({
      user_id: profile.user_id,
      email: users?.users.find(u => u.id === profile.user_id)?.email || 'Unknown',
      full_name: profile.full_name,
      role: profile.role || 'starter',
      role_assigned_at: profile.role_assigned_at || profile.created_at,
      assigned_by_email: null,
      profile_created_at: profile.created_at
    })) as UserRoleSummary[];
  }
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  if (!await isOwner()) throw new Error('Unauthorized: Owner access required');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ 
      role, 
      role_assigned_by: user.id,
      role_assigned_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) throw error;
};

export const getRoleAssignments = async (): Promise<RoleAssignment[]> => {
  if (!await isOwner()) throw new Error('Unauthorized: Owner access required');
  
  const { data, error } = await supabase
    .from('role_assignments')
    .select('*')
    .order('assigned_at', { ascending: false });
    
  if (error) throw error;
  return (data as unknown as RoleAssignment[]) || [];
};

export const getUserRole = async (): Promise<UserRole> => {
  const profile = await getUserProfile();
  return profile?.role || 'starter';
};

export const hasPermission = async (permission: string): Promise<any> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  
  const { data, error } = await supabase
    .rpc('has_permission', { user_id: user.id, permission });
    
  if (error) {
    console.warn('Error checking permission:', error);
    return {};
  }
  
  return data || {};
};

export const getRolePermissions = async (role?: UserRole): Promise<RolePermission[]> => {
  const targetRole = role || await getUserRole();
  
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role', targetRole);
    
  if (error) throw error;
  return (data as unknown as RolePermission[]) || [];
};

// Enhanced usage tracking with role limits
export const checkUsageLimits = async (): Promise<{
  analyses: { used: number; limit: number; canUse: boolean };
  comparisons: { used: number; limit: number; canUse: boolean };
  projects: { used: number; limit: number; canUse: boolean };
}> => {
  // Check if user is owner - if so, give unlimited access
  const isOwnerUser = await isOwner();
  
  if (isOwnerUser) {
    const [usage, projects] = await Promise.all([
      getMonthlyUsageCounts(),
      listProjects()
    ]);
    
    return {
      analyses: {
        used: usage.analyses,
        limit: -1, // Unlimited for owner
        canUse: true
      },
      comparisons: {
        used: usage.comparisons,
        limit: -1, // Unlimited for owner
        canUse: true
      },
      projects: {
        used: projects.length,
        limit: -1, // Unlimited for owner
        canUse: true
      }
    };
  }

  // Regular user - check permissions
  const [usage, analysesPermission, comparisonsPermission, projectsPermission, projects] = await Promise.all([
    getMonthlyUsageCounts(),
    hasPermission('monthly_analyses'),
    hasPermission('monthly_comparisons'),
    hasPermission('projects'),
    listProjects()
  ]);

  const analysesLimit = analysesPermission.limit || 10;
  const comparisonsLimit = comparisonsPermission.limit || 5;
  const projectsLimit = projectsPermission.limit || 3;

  return {
    analyses: {
      used: usage.analyses,
      limit: analysesLimit,
      canUse: analysesLimit === -1 || usage.analyses < analysesLimit
    },
    comparisons: {
      used: usage.comparisons,
      limit: comparisonsLimit,
      canUse: comparisonsLimit === -1 || usage.comparisons < comparisonsLimit
    },
    projects: {
      used: projects.length,
      limit: projectsLimit,
      canUse: projectsLimit === -1 || projects.length < projectsLimit
    }
  };
};