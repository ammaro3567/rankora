// PayPal product configuration
export interface PayPalProduct {
  id: string; // Internal product ID
  planId: string; // PayPal Plan ID (legacy subscriptions)
  hostedButtonId?: string; // PayPal Hosted Button ID
  name: string;
  description: string;
  price: number;
  monthlyLimit?: number; // analyses/month
  projectLimit?: number; // projects per account
}

export const PAYPAL_PRODUCTS: PayPalProduct[] = [
  {
    id: 'starter',
    planId: 'P-2G682433AR608915NNCLSZYQ',
    hostedButtonId: 'QGMSH6CSQNBD6',
    name: 'Starter',
    description: '30 Analyses/month',
    price: 10,
    monthlyLimit: 30,
    projectLimit: 3,
  },
  {
    id: 'pro',
    planId: 'P-3T559291UC349771DNCLTI6A',
    hostedButtonId: 'VUK8HZK8RAK6E',
    name: 'Pro',
    description: '100 Analyses/month',
    price: 30,
    monthlyLimit: 100,
    projectLimit: 10,
  },
  {
    id: 'business',
    planId: 'P-9F604615AD1067904NCLTLBA',
    hostedButtonId: 'XSY3PB8G6TEUS',
    name: 'Business',
    description: '300 Analyses/month',
    price: 70,
    monthlyLimit: 300,
    projectLimit: 25,
  }
];

// Helper function to get product by PayPal Plan ID
export const getProductByPayPalPlanId = (planId: string): PayPalProduct | undefined => {
  return PAYPAL_PRODUCTS.find(product => product.planId === planId);
};

// Helper function to get product by internal ID
export const getProductById = (id: string): PayPalProduct | undefined => {
  return PAYPAL_PRODUCTS.find(product => product.id === id);
};