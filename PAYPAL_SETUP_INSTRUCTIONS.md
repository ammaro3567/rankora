# PayPal Subscription Setup Instructions

## 1. Create PayPal Business Account
- Go to [PayPal Business](https://www.paypal.com/business)
- Sign up for a Business account
- Complete verification process

## 2. Create Subscription Plans in PayPal
- Log into your PayPal Business account
- Go to **Tools** > **Billing Plans** (or **Subscriptions**)
- Click **Create Plan**

### Starter Plan ($10/month)
- **Plan Name**: Rankora Starter Plan
- **Plan ID**: Note this down (e.g., P-5ML4271244454362XMQIZHI)
- **Billing Cycle**: Monthly
- **Amount**: $10.00 USD
- **Description**: 30 AI analyzers, 10 comparison analyses, 5 projects

### Pro Plan ($30/month)
- **Plan Name**: Rankora Pro Plan
- **Plan ID**: Note this down
- **Billing Cycle**: Monthly
- **Amount**: $30.00 USD
- **Description**: 100 AI analyzers, 50 comparison analyses, 20 projects

### Business Plan ($70/month)
- **Plan Name**: Rankora Business Plan
- **Plan ID**: Note this down
- **Billing Cycle**: Monthly
- **Amount**: $70.00 USD
- **Description**: 300 AI analyzers, 150 comparison analyses, 100 projects

## 3. Update Environment Variables
Add these to your `.env` file:

```env
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
VITE_PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
VITE_PAYPAL_ENV=sandbox
VITE_PAYPAL_MERCHANT_EMAIL=your_paypal_merchant_email@example.com
```

## 4. Get PayPal API Credentials
- Go to **Tools** > **API Credentials**
- Click **View API Signature**
- Copy **Client ID** and **Secret**
- For production, use **Live** credentials instead of **Sandbox**

## 5. Update Plan IDs in Code
In `src/components/PricingPage.tsx`, replace the placeholder plan IDs:

```typescript
paypalPlanId: 'P-5ML4271244454362XMQIZHI' // Replace with actual Starter plan ID
paypalPlanId: 'P-XXXXXXXXXXXXXXX' // Replace with actual Pro plan ID  
paypalPlanId: 'P-XXXXXXXXXXXXXXX' // Replace with actual Business plan ID
```

## 6. Test the Integration
1. Use Sandbox environment first
2. Create test PayPal accounts in Sandbox
3. Test subscription flow end-to-end
4. Verify database updates
5. Switch to Production when ready

## 7. Webhook Setup (Optional)
For real-time subscription updates, set up webhooks:
- **Endpoint**: `https://yourdomain.com/api/paypal-webhook`
- **Events**: `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`

## Troubleshooting
- **Sandbox vs Production**: Make sure environment variables match
- **Plan IDs**: Verify plan IDs are correct and active
- **API Permissions**: Ensure your PayPal account has subscription permissions
- **CORS**: Check if your domain is allowed in PayPal settings
