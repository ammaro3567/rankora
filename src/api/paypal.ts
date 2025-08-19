// لم نعد نكتب مباشرة في قاعدة البيانات من الواجهة.

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

    // محاولة إبلاغ الويبهوك (Edge/Netlify) بدل الكتابة المباشرة
    try {
      const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
      const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
      const webhookUrl = `https://${projectRef}.functions.supabase.co/paypal-webhook`;
      const payload = {
        event_type: 'BILLING.SUBSCRIPTION.CREATED',
        resource: {
          id: subscription.id,
          custom_id: userId,
          plan_id: planId,
          status: subscription.status
        }
      };
      let ok = false;
      try {
        const resp = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        ok = resp.ok;
      } catch {}
      if (!ok) {
        try {
          const resp2 = await fetch('/.netlify/functions/paypal-webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          ok = resp2.ok;
        } catch {}
      }
    } catch {}

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

// لم يعد هناك حفظ مباشر للقاعدة هنا.

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

    // إبلاغ الويبهوك بالحالة الجديدة
    try {
      const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
      const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
      const webhookUrl = `https://${projectRef}.functions.supabase.co/paypal-webhook`;
      const payload = {
        event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
        resource: {
          id: subscriptionId
        }
      };
      let ok = false;
      try {
        const resp = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        ok = resp.ok;
      } catch {}
      if (!ok) {
        try {
          await fetch('/.netlify/functions/paypal-webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } catch {}
      }
    } catch {}
    
    return { success: true };
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// لا تحديث مباشر لحالة الاشتراك من الواجهة بعد الآن.
