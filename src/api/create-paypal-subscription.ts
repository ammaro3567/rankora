import { createPayPalSubscription } from './paypal';

export async function POST(request: Request) {
  try {
    const { planId, userId, planName } = await request.json();

    if (!planId || !userId || !planName) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: planId, userId, planName' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create PayPal subscription
    const subscription = await createPayPalSubscription(planId, userId, planName);

    return new Response(JSON.stringify(subscription), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
