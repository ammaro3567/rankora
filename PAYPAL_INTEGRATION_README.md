# PayPal Integration Setup for Rankora AI

## 🚀 Overview
This guide will help you set up PayPal subscriptions for your Rankora AI application. The system uses PayPal's Subscription API for recurring payments.

## 📋 Prerequisites
- PayPal Business Account
- Supabase Database
- React Application with Clerk Authentication

## 🔧 Step-by-Step Setup

### 1. PayPal Business Account Setup
1. Go to [PayPal Business](https://www.paypal.com/business)
2. Sign up and complete verification
3. Enable Subscriptions in your account

### 2. Create PayPal Subscription Plans
1. Log into PayPal Business Dashboard
2. Go to **Tools** > **Billing Plans** (or **Subscriptions**)
3. Create three plans:

#### Starter Plan ($10/month)
- **Plan Name**: Rankora Starter Plan
- **Billing Cycle**: Monthly
- **Amount**: $10.00 USD
- **Description**: 30 AI analyzers, 10 comparison analyses, 5 projects

#### Pro Plan ($30/month)
- **Plan Name**: Rankora Pro Plan
- **Billing Cycle**: Monthly
- **Amount**: $30.00 USD
- **Description**: 100 AI analyzers, 50 comparison analyses, 20 projects

#### Business Plan ($70/month)
- **Plan Name**: Rankora Business Plan
- **Billing Cycle**: Monthly
- **Amount**: $70.00 USD
- **Description**: 300 AI analyzers, 150 comparison analyses, 100 projects

### 3. Get PayPal API Credentials
1. Go to **Tools** > **API Credentials**
2. Click **View API Signature**
3. Copy **Client ID** and **Secret**
4. Note: Use **Sandbox** credentials for testing, **Live** for production

### 4. Environment Variables
Add these to your `.env` file:

```env
# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
VITE_PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
VITE_PAYPAL_ENV=sandbox
VITE_PAYPAL_MERCHANT_EMAIL=your_paypal_merchant_email@example.com
```

### 5. Database Setup
Run the SQL script `supabase_subscriptions_setup.sql` in your Supabase SQL Editor:

```sql
-- This will create:
-- - subscriptions table
-- - RLS policies
-- - Helper functions
-- - Indexes for performance
```

### 6. Update Plan IDs in Code
In `src/components/PricingPage.tsx`, replace the placeholder plan IDs with your actual PayPal plan IDs:

```typescript
const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    originalPrice: 20,
    paypalPlanId: 'P-5ML4271244454362XMQIZHI', // Replace with actual Starter plan ID
    // ... other properties
  },
  {
    id: 'pro',
    name: 'Pro', 
    price: 30,
    originalPrice: 60,
    paypalPlanId: 'P-XXXXXXXXXXXXXXX', // Replace with actual Pro plan ID
    // ... other properties
  },
  {
    id: 'business',
    name: 'Business',
    price: 70,
    originalPrice: 140,
    paypalPlanId: 'P-XXXXXXXXXXXXXXX', // Replace with actual Business plan ID
    // ... other properties
  }
];
```

### 7. Install Dependencies
Make sure you have the PayPal React components installed:

```bash
npm install @paypal/react-paypal-js
```

### 8. Test the Integration
1. Start with Sandbox environment
2. Create test PayPal accounts in Sandbox
3. Test subscription flow end-to-end
4. Verify database updates
5. Switch to Production when ready

## 🔍 Troubleshooting Common Issues

### "global_session_not_found" Error
- **Cause**: PayPal session expired or browser cache issues
- **Solution**: 
  - Clear browser cache
  - Use incognito/private mode
  - Close all PayPal tabs and retry

### "unauthorized order" Error
- **Cause**: Order creation failed or session issues
- **Solution**: 
  - Use Subscriptions instead of Orders (already implemented)
  - Ensure PayPal plan IDs are correct
  - Check PayPal account permissions

### Database Connection Issues
- **Cause**: RLS policies or permissions
- **Solution**: 
  - Verify RLS policies are created
  - Check user authentication
  - Ensure proper database permissions

### PayPal Button Not Loading
- **Cause**: Missing or incorrect PayPal credentials
- **Solution**: 
  - Verify environment variables
  - Check PayPal account status
  - Ensure plan IDs are active

## 📊 Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    paypal_subscription_id TEXT UNIQUE NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Functions
- `get_user_subscription_info_for(p_clerk_user_id)` - Get user's subscription details
- `can_create_subscription(p_clerk_user_id)` - Check if user can create subscription

## 🔐 Security Features
- Row Level Security (RLS) enabled
- User can only access their own subscriptions
- Secure API endpoints
- Environment variable protection

## 🚀 Production Deployment
1. Switch to PayPal Live environment
2. Update environment variables
3. Test with real PayPal accounts
4. Monitor subscription status
5. Set up webhooks for real-time updates

## 📞 Support
If you encounter issues:
1. Check PayPal Developer Documentation
2. Verify all environment variables
3. Test in Sandbox first
4. Check browser console for errors
5. Verify database permissions

## 🔄 Next Steps
After successful setup:
1. Implement webhook handling
2. Add subscription management UI
3. Implement usage tracking
4. Add payment analytics
5. Set up automated billing reminders
