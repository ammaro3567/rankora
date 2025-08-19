import { supabase } from '../lib/supabase';

// PayPal API configuration
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.VITE_PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = import.meta.env.VITE_PAYPAL_ENV || 'sandbox';

const PAYPAL_BASE_URL = PAYPAL_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Create PayPal subscription
export async function createPayPalSubscription(planId: string, userId: string, planName: string) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    // Create subscription in PayPal
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        plan_id: planId,
        // نمرر معرف المستخدم لدينا حتى يعود في الويبهوك لربطه بالمستخدم في Supabase
        custom_id: userId,
        start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
        subscriber: {
          name: {
            given_name: 'User',
            surname: 'Account'
          },
          email_address: userId // Using userId as email for now
        },
        application_context: {
          brand_name: 'Rankora AI',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${window.location.origin}/dashboard?subscription=success`,
          cancel_url: `${window.location.origin}/dashboard?subscription=cancelled`
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal subscription creation error:', errorData);
      throw new Error(`PayPal error: ${errorData.message || 'Unknown error'}`);
    }

    const subscription = await response.json();
    
    // Save subscription to database
    await saveSubscriptionToDatabase(subscription.id, userId, planName, subscription.status);
    
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      approvalUrl: subscription.links.find((link: any) => link.rel === 'approve')?.href
    };
    
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    throw error;
  }
}

// Save subscription to database
async function saveSubscriptionToDatabase(paypalSubscriptionId: string, userId: string, planName: string, status: string) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        clerk_user_id: userId,
        paypal_subscription_id: paypalSubscriptionId,
        plan_name: planName,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving subscription to database:', error);
      throw error;
    }
    
    console.log('Subscription saved to database successfully');
    
  } catch (error) {
    console.error('Failed to save subscription to database:', error);
    throw error;
  }
}

// Verify subscription status
export async function verifyPayPalSubscription(subscriptionId: string) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify subscription');
    }

    const subscription = await response.json();
    return subscription;
    
  } catch (error) {
    console.error('Error verifying subscription:', error);
    throw error;
  }
}

// Cancel subscription
export async function cancelPayPalSubscription(subscriptionId: string, reason: string = 'User requested cancellation') {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    // Update database status
    await updateSubscriptionStatus(subscriptionId, 'CANCELLED');
    
    return { success: true };
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// Update subscription status in database
async function updateSubscriptionStatus(paypalSubscriptionId: string, status: string) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', paypalSubscriptionId);

    if (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Failed to update subscription status:', error);
    throw error;
  }
}
