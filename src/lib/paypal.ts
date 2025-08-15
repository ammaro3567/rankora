import { supabase } from './supabase';

interface UpdateSubscriptionParams {
  paypalSubscriptionId: string;
  paypalPlanId: string;
}

export const updatePayPalSubscription = async (params: UpdateSubscriptionParams) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update PayPal subscription');
  }

  return response.json();
};

export const getUserSubscription = async (clerkUserId?: string) => {
  if (!clerkUserId) {
    console.warn('No Clerk user ID provided for subscription lookup');
    return null;
  }

  try {
    // Use the new subscription system with RPC function
    const { data, error } = await supabase.rpc('get_user_subscription_info', {
      p_clerk_user_id: clerkUserId
    });

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    // Return the first subscription info
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};