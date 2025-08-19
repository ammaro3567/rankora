// Supabase Edge Function: PayPal Webhook
// Runtime: Deno
// Endpoint (production): https://<project-ref>.functions.supabase.co/paypal-webhook
// Example: https://mpjpdgjrafjexniivzln.functions.supabase.co/paypal-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables for Edge Function");
}

const supabase = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const eventType: string = body?.event_type || body?.eventType || "";
    const resource: any = body?.resource || {};

    console.log("📥 PayPal webhook received:", eventType);

    // Helper: map PayPal plan_id -> internal plan_id (fallback)
    const getPlanIdFromPayPalPlanId = async (paypalPlanId: string | undefined): Promise<number | null> => {
      if (!paypalPlanId) return null;

      // Attempt DB lookup if a column `paypal_plan_id` exists
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("id, paypal_plan_id")
          .eq("paypal_plan_id", paypalPlanId)
          .maybeSingle();
        if (!error && data?.id) {
          return Number(data.id);
        }
      } catch (_) {
        // ignore and fallback to map below
      }

      // Fallback static map (update with your real PayPal plan IDs)
      const planMap: Record<string, number> = {
        // 'P-EXAMPLE123': 2,
        // 'P-EXAMPLE456': 3,
      };
      return planMap[paypalPlanId] ?? 1; // default to Free/basic plan id = 1
    };

    // Helper: find internal subscription id by PayPal subscription id
    const findInternalSubscriptionId = async (paypalSubscriptionId: string): Promise<number | null> => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("paypal_subscription_id", paypalSubscriptionId)
        .maybeSingle();
      if (error || !data?.id) return null;
      return Number(data.id);
    };

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const subscription = resource;
      console.log("🆕 Activated:", subscription?.id);

      const clerkUserId: string | undefined = subscription?.custom_id;
      if (!clerkUserId) {
        console.warn("⚠️ Missing custom_id (Clerk User ID) in subscription resource");
        return new Response(JSON.stringify({ error: "missing_custom_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const planId = await getPlanIdFromPayPalPlanId(subscription?.plan_id);
      if (!planId) {
        console.warn("⚠️ Could not resolve plan id from PayPal plan_id:", subscription?.plan_id);
        return new Response(JSON.stringify({ error: "invalid_plan" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const paypalOrderId: string | null = subscription?.billing_info?.last_payment?.payment_id ?? null;

      const { data, error } = await supabase.rpc("create_user_subscription", {
        p_clerk_user_id: clerkUserId,
        p_plan_id: planId,
        p_paypal_subscription_id: subscription.id,
        p_paypal_order_id: paypalOrderId,
      });

      if (error) {
        console.error("❌ create_user_subscription failed:", error);
        return new Response(JSON.stringify({ error: "rpc_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ success: true, subscription_id: data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED" || eventType === "BILLING.SUBSCRIPTION.EXPIRED" || eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED" || eventType === "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED") {
      const subscription = resource;
      const paypalSubscriptionId: string = subscription?.id;
      if (!paypalSubscriptionId) {
        return new Response(JSON.stringify({ error: "missing_subscription_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const internalId = await findInternalSubscriptionId(paypalSubscriptionId);
      if (!internalId) {
        console.warn("⚠️ No internal subscription for PayPal id:", paypalSubscriptionId);
        return new Response(JSON.stringify({ success: true, note: "no-internal-subscription" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let newStatus = "active";
      if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") newStatus = "cancelled";
      else if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") newStatus = "expired";
      else if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") newStatus = "past_due";
      else if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED") newStatus = "active";

      const { error } = await supabase.rpc("update_subscription_status", {
        p_subscription_id: internalId,
        p_new_status: newStatus,
        p_paypal_data: body,
      });

      if (error) {
        console.error("❌ update_subscription_status failed:", error);
        return new Response(JSON.stringify({ error: "rpc_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("ℹ️ Ignored event:", eventType);
    return new Response(JSON.stringify({ success: true, event: "ignored" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("💥 PayPal webhook error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "unknown_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});


