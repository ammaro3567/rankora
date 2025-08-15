import { getUserSubscription } from '../lib/paypal';
import { getProductByPayPalPlanId } from '../paypal-config';
import { getMonthlyUsageCounts } from '../lib/supabase';
import { canUseFreeAnalysis, consumeFreeAnalysis, getFreeUsageCount } from './usage';

export interface AllowanceResult {
  allowed: boolean;
  reason?: string;
  usedThisMonth: number;
  monthlyLimit?: number; // undefined means unlimited
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
    const isSubscribed = sub?.subscription_status === 'active';
    if (!isSubscribed) {
      return { limit: 2, isSubscribed: false, isOwner: false };
    }
    const prod = sub?.price_id ? getProductByPayPalPlanId(sub.price_id) : undefined;
    // Prefer explicit monthlyLimit from config
    let limit: number | undefined = prod?.monthlyLimit;
    // Fallback: parse description like "30 Analyses/month"
    if (!limit && prod?.description) {
      const m = prod.description.match(/(\d+)\s*Analyses/i);
      if (m) limit = parseInt(m[1], 10);
    }
    // Fallback per plan name
    if (!limit && prod?.name) {
      if (prod.name.toLowerCase() === 'starter') limit = 30;
      else if (prod.name.toLowerCase() === 'pro') limit = 100;
      else if (prod.name.toLowerCase() === 'business') limit = 300;
    }
    return { limit, isSubscribed: true, isOwner: false };
  } catch {
    return { limit: 2, isSubscribed: false, isOwner: false };
  }
};

export const evaluateAnalysisAllowance = async (clerkUserId?: string): Promise<AllowanceResult> => {
  if (!clerkUserId) {
    // Guest: use local 2 attempts per month
    const allowed = canUseFreeAnalysis();
    return {
      allowed,
      reason: allowed ? undefined : 'You have reached the free monthly limit (2/2). Please sign up to continue.',
      usedThisMonth: getFreeUsageCount(),
      monthlyLimit: 2,
      shouldConsumeLocal: allowed,
    };
  }

  const { limit, isOwner } = await getPlanMonthlyLimit(clerkUserId);
  const usage = await getMonthlyUsageCounts();
  // Unlimited for owner
  if (isOwner || typeof limit === 'undefined') {
    return { allowed: true, usedThisMonth: usage.total, monthlyLimit: undefined };
  }

  // If no active sub, limit = 2
  const allowed = usage.total < (limit ?? 2);
  return {
    allowed,
    reason: allowed ? undefined : `You have reached your monthly limit (${usage.total}/${limit}). Upgrade to increase your quota.`,
    usedThisMonth: usage.total,
    monthlyLimit: limit ?? 2,
  };
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
    const isSubscribed = sub?.subscription_status === 'active';
    if (!isSubscribed) return { limit: 1, isOwner: false };
    const prod = sub?.price_id ? getProductByPayPalPlanId(sub.price_id) : undefined;
    let limit = prod?.projectLimit;
    
    // Fallback based on plan name if projectLimit not set
    if (!limit && prod?.name) {
      if (prod.name.toLowerCase() === 'starter') limit = 3;
      else if (prod.name.toLowerCase() === 'pro') limit = 10;
      else if (prod.name.toLowerCase() === 'business') limit = 25;
    }
    
    return { limit: limit || 5, isOwner: false }; // default 5 for paid plans
  } catch {
    return { limit: 1, isOwner: false };
  }
};


