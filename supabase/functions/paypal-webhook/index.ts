import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await req.json();
    const paypalSubscriptionId: string | undefined = body?.paypalSubscriptionId;
    const paypalPlanId: string | undefined = body?.paypalPlanId;
    const buyerEmail: string | undefined = body?.buyerEmail || body?.payer?.email_address || body?.resource?.payer?.email_address;
    const hostedButtonId: string | undefined = body?.hostedButtonId || body?.resource?.custom_id || body?.resource?.invoice_id;

    if (!paypalSubscriptionId || !paypalPlanId) {
      return corsResponse({ error: 'Missing required parameters: paypalSubscriptionId or paypalPlanId' }, 400);
    }

    // Try to authenticate user via Authorization header if present.
    const authHeader = req.headers.get('Authorization');
    let user: any = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabase.auth.getUser(token);
      user = userData?.user || null;
    }

    // Get or create customer entry
    let customerId;
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id, user_id')
      .eq('user_id', user?.id || '')
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information from the database', getCustomerError);
      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    if (!customer || !customer.customer_id) {
      // If no auth user, try to resolve by buyerEmail using RPC call
      let resolvedUserId = user?.id;
      if (!resolvedUserId && buyerEmail) {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserByEmail(buyerEmail);
          if (authUser?.user) {
            resolvedUserId = authUser.user.id;
          }
        } catch (emailLookupError) {
          console.warn('Could not lookup user by email:', emailLookupError);
        }
      }
      if (!resolvedUserId) {
        return corsResponse({ error: 'Unable to resolve user for payment' }, 400);
      }
      // Create new customer record
      customerId = `paypal_${resolvedUserId}_${Date.now()}`;
      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: resolvedUserId,
        customer_id: customerId,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);
        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }
    } else {
      customerId = customer.customer_id;
    }

    // Update or insert subscription (map hosted button to plan if provided)
    const priceId = paypalPlanId || hostedButtonId || null;
    const { data: updatedSubscription, error: subError } = await supabase
      .from('stripe_subscriptions')
      .upsert(
        {
          customer_id: customerId,
          subscription_id: paypalSubscriptionId,
          price_id: priceId,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          cancel_at_period_end: false,
          payment_method_brand: 'PayPal',
          payment_method_last4: null,
        },
        {
          onConflict: 'customer_id',
          ignoreDuplicates: false,
        }
      );

    if (subError) {
      console.error('Error syncing PayPal subscription:', subError);
      return corsResponse({ error: 'Failed to sync PayPal subscription in database' }, 500);
    }

    console.info(`Successfully synced PayPal subscription ${paypalSubscriptionId} for customer: ${customerId}`);
    return corsResponse({ success: true, subscription: updatedSubscription });

  } catch (error: any) {
    console.error(`PayPal webhook error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});