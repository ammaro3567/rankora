import { getUserSubscriptionInfo, checkUserLimits, getMonthlyUsageCounts } from '../lib/supabase';

export interface AllowanceResult {
  canProceed: boolean;
  reason?: string;
  limit?: number;
  remaining?: number;
  shouldConsumeLocal?: boolean; // for guests
}

export const getPlanMonthlyLimit = async (clerkUserId?: string): Promise<{ limit?: number; isSubscribed: boolean; isOwner: boolean }> => {
  const ownerEmail = import.meta.env.VITE_OWNER_EMAIL as string | undefined;
  
  if (!clerkUserId) {
    return { limit: 2, isSubscribed: false, isOwner: false };
  }
  
  // For now, we'll need to get user email from Clerk context
  // This will be passed from the component
  const isOwner = false; // Will be determined by the calling component
  
  try {
    const sub = await getUserSubscriptionInfo(clerkUserId);
    const isSubscribed = sub?.status === 'active';
    
    if (!isSubscribed) {
      return { limit: 2, isSubscribed: false, isOwner: false };
    }
    
    // Use the actual plan limits from subscription
    const limit = sub?.monthly_analysis_limit || 2;
    
    return { limit, isSubscribed: true, isOwner: false };
  } catch {
    return { limit: 2, isSubscribed: false, isOwner: false };
  }
};

export const evaluateAnalysisAllowance = async (clerkUserId?: string): Promise<AllowanceResult> => {
  try {
    const { limit, isSubscribed, isOwner } = await getPlanMonthlyLimit(clerkUserId);
    
    if (isOwner) {
      return { canProceed: true, limit: undefined, remaining: undefined };
    }
    
    if (!limit) {
      return { canProceed: true, limit: undefined, remaining: undefined };
    }
    
    // Check current usage
    if (clerkUserId) {
      // Prefer computing remaining from actual monthly counts for consistency
      try {
        const usage = await getMonthlyUsageCounts();
        const usedAnalyses = usage?.analyses || 0;
        const remaining = Math.max(0, (limit || 0) - usedAnalyses);
        const canProceed = remaining > 0;
        return {
          canProceed,
          limit,
          remaining,
          reason: canProceed ? undefined : 'Monthly limit reached'
        };
      } catch (err) {
        // Fallback to RPC checkUserLimits if counts fail
        const limits = await checkUserLimits(clerkUserId).catch(() => null);
        if (limits) {
          const remaining = limits.remaining ?? 0;
          const canProceed = !!limits.can_proceed;
          return { canProceed, limit, remaining, reason: canProceed ? undefined : 'Monthly limit reached' };
        }
      }
    }
    
    // Fallback: assume limit not reached
    return { canProceed: true, limit, remaining: limit };
  } catch (error) {
    console.error('Error evaluating analysis allowance:', error);
    return { canProceed: false, reason: 'Error checking limits' };
  }
};

export const consumeIfGuest = (should: boolean) => {
  if (should) consumeFreeAnalysis();
};

// New: Comparison allowance based on subscription's monthly_comparison_limit
export const evaluateComparisonAllowance = async (clerkUserId?: string): Promise<AllowanceResult> => {
  try {
    if (!clerkUserId) {
      return { canProceed: true, limit: 2, remaining: 2 };
    }

    const sub = await getUserSubscriptionInfo(clerkUserId);
    const limit = sub?.monthly_comparison_limit ?? 2;

    const usage = await getMonthlyUsageCounts();
    const usedComparisons = usage?.comparisons || 0;
    const remaining = Math.max(0, (limit || 0) - usedComparisons);
    const canProceed = remaining > 0;
    return { canProceed, limit, remaining, reason: canProceed ? undefined : 'Monthly limit reached' };
  } catch (error) {
    console.error('Error evaluating comparison allowance:', error);
    return { canProceed: false, reason: 'Error checking limits' };
  }
};

// Projects allowance
export const getPlanProjectLimit = async (clerkUserId?: string): Promise<{ limit?: number; isOwner: boolean }> => {
  const ownerEmail = import.meta.env.VITE_OWNER_EMAIL as string | undefined;
  
  if (!clerkUserId) return { limit: 0, isOwner: false };
  
  // For now, we'll need to get user email from Clerk context
  // This will be determined by the calling component
  const isOwner = false; // Will be determined by the calling component
  
  try {
    const sub = await getUserSubscriptionInfo(clerkUserId);
    const isSubscribed = sub?.status === 'active';
    if (!isSubscribed) return { limit: 1, isOwner: false };
    
    // Use the actual project limit from subscription
    const limit = sub?.project_limit || 1;
    
    return { limit, isOwner: false };
  } catch {
    return { limit: 1, isOwner: false };
  }
};

// Local storage for guest users
const FREE_ANALYSIS_KEY = 'free_analysis_count';
const MAX_FREE_ANALYSES = 2;

export const getFreeAnalysisCount = (): number => {
  try {
    return parseInt(localStorage.getItem(FREE_ANALYSIS_KEY) || '0', 10);
  } catch {
    return 0;
  }
};

export const consumeFreeAnalysis = (): boolean => {
  try {
    const current = getFreeAnalysisCount();
    if (current >= MAX_FREE_ANALYSES) {
      return false;
    }
    localStorage.setItem(FREE_ANALYSIS_KEY, (current + 1).toString());
    return true;
  } catch {
    return false;
  }
};

export const resetFreeAnalysisCount = (): void => {
  try {
    localStorage.removeItem(FREE_ANALYSIS_KEY);
  } catch {
    // Ignore errors
  }
};


