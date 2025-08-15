const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('📥 PayPal webhook received:', body.event_type);
    
    // التحقق من نوع الحدث
    if (body.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      // اشتراك جديد
      const subscription = body.resource;
      
      console.log('🆕 New subscription activated:', subscription.id);
      
      // تحديد نوع الخطة من PayPal price ID
      const planId = getPlanIdFromPayPalPriceId(subscription.billing_info?.next_billing_time?.cycle_executions?.[0]?.tenure_type);
      
      if (!planId) {
        console.warn('⚠️ Could not determine plan ID from PayPal data');
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid plan data' }) };
      }
      
      // إنشاء الاشتراك في قاعدة البيانات
      const { data, error } = await supabase.rpc('create_user_subscription', {
        p_clerk_user_id: subscription.custom_id, // يجب أن يكون Clerk User ID
        p_plan_id: planId,
        p_paypal_subscription_id: subscription.id,
        p_paypal_order_id: subscription.billing_info?.last_payment?.payment_id || null
      });
      
      if (error) {
        console.error('❌ Failed to create subscription:', error);
        throw error;
      }
      
      console.log('✅ Subscription created successfully:', data);
      return { statusCode: 200, body: JSON.stringify({ success: true, subscription_id: data }) };
    }
    
    if (body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
      // إلغاء الاشتراك
      const subscription = body.resource;
      
      console.log('❌ Subscription cancelled:', subscription.id);
      
      // تحديث حالة الاشتراك
      await supabase.rpc('update_subscription_status', {
        p_subscription_id: subscription.id,
        p_new_status: 'cancelled',
        p_paypal_data: body
      });
      
      console.log('✅ Subscription status updated to cancelled');
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    if (body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED') {
      // انتهاء صلاحية الاشتراك
      const subscription = body.resource;
      
      console.log('⏰ Subscription expired:', subscription.id);
      
      // تحديث حالة الاشتراك
      await supabase.rpc('update_subscription_status', {
        p_subscription_id: subscription.id,
        p_new_status: 'expired',
        p_paypal_data: body
      });
      
      console.log('✅ Subscription status updated to expired');
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    if (body.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      // فشل في الدفع
      const subscription = body.resource;
      
      console.log('💥 Payment failed for subscription:', subscription.id);
      
      // تحديث حالة الاشتراك
      await supabase.rpc('update_subscription_status', {
        p_subscription_id: subscription.id,
        p_new_status: 'past_due',
        p_paypal_data: body
      });
      
      console.log('✅ Subscription status updated to past_due');
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    if (body.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED') {
      // اكتمال الدفع
      const subscription = body.resource;
      
      console.log('✅ Payment completed for subscription:', subscription.id);
      
      // تحديث حالة الاشتراك
      await supabase.rpc('update_subscription_status', {
        p_subscription_id: subscription.id,
        p_new_status: 'active',
        p_paypal_data: body
      });
      
      console.log('✅ Subscription status updated to active');
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    console.log('ℹ️ Ignoring webhook event:', body.event_type);
    return { statusCode: 200, body: JSON.stringify({ success: true, event: 'ignored' }) };
    
  } catch (error) {
    console.error('💥 PayPal webhook error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// Function لتحديد نوع الخطة من PayPal data
function getPlanIdFromPayPalPriceId(priceId) {
  // Map PayPal price IDs to plan IDs
  const planMap = {
    'P-2G682433AR608915NNCLSZYQ': 2, // Starter Plan
    'P-3T559291UC349771DNCLTI6A': 3, // Pro Plan  
    'P-9F604615AD1067904NCLTLBA': 4, // Business Plan
    // يمكن إضافة المزيد من الـ price IDs هنا
  };
  
  return planMap[priceId] || 1; // Default to Free plan (ID: 1)
}
