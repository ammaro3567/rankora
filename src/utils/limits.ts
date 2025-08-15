import { getUserSubscription } from '../lib/paypal';

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
    const sub = await getUserSubscription(clerkUserId);
    const isSubscribed = sub?.status === 'active';
    if (!isSubscribed) {
      return { limit: 2, isSubscribed: false, isOwner: false };
    }
    
    // Map plan IDs to limits
    let limit: number | undefined;
    if (sub?.plan_id) {
      switch (sub.plan_id) {
        case 2: // Starter
          limit = 30;
          break;
        case 3: // Pro
          limit = 100;
          break;
        case 4: // Business
          limit = 300;
          break;
        default:
          limit = 2;
      }
    }
    
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
    
    // For now, we'll assume the limit hasn't been reached
    // In a real implementation, you'd check the current usage
    return { canProceed: true, limit, remaining: limit };
  } catch (error) {
    console.error('Error evaluating analysis allowance:', error);
    return { canProceed: false, reason: 'Error checking limits' };
  }
};

export const consumeIfGuest = (should: boolean) => {
  if (should) consumeFreeAnalysis();
};

// Projects allowance
export const getPlanProjectLimit = async (clerkUserId?: string): Promise<{ limit?: number; isOwner: boolean }> => {
  const ownerEmail = import.meta.env.VITE_OWNER_EMAIL as string | undefined;
  
  if (!clerkUserId) return { limit: 0, isOwner: false };
  
  // For now, we'll need to get user email from Clerk context
  // This will be determined by the calling component
  const isOwner = false; // Will be determined by the calling component
  
  try {
    const sub = await getUserSubscription(clerkUserId);
    const isSubscribed = sub?.status === 'active';
    if (!isSubscribed) return { limit: 1, isOwner: false };
    
    // Map plan IDs to project limits
    let limit: number | undefined;
    if (sub?.plan_id) {
      switch (sub.plan_id) {
        case 2: // Starter
          limit = 3;
          break;
        case 3: // Pro
          limit = 10;
          break;
        case 4: // Business
          limit = 25;
          break;
        default:
          limit = 1;
      }
    }
    
    return { limit: limit || 5, isOwner: false }; // default 5 for paid plans
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


