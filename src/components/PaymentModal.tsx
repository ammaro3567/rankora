import React, { useState } from 'react';
import { X, CreditCard, Shield, Lock, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
}

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose }) => {
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'US'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const renderPlanConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">Confirm Your Plan</h3>
        <p className="text-secondary">Review your selection before proceeding to payment</p>
      </div>

      <div className="surface-secondary border border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-primary">{plan.name} Plan</h4>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent-primary">{plan.price}</div>
            <div className="text-sm text-secondary">per {plan.period}</div>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          {plan.features.slice(0, 5).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-accent-primary" />
              <span className="text-secondary text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-primary pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary">Total</span>
            <span className="text-xl font-bold text-accent-primary">{plan.price}/{plan.period}</span>
          </div>
          <p className="text-xs text-tertiary mt-2">7-day free trial • Cancel anytime</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="flex-1 btn-ghost"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('payment')}
          className="flex-1 btn-primary"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">Payment Details</h3>
        <p className="text-secondary">Your payment information is secure and encrypted</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-primary">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border rounded-lg flex items-center justify-center space-x-2 transition-all ${
              paymentMethod === 'card' 
                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' 
                : 'border-primary text-secondary hover:border-secondary'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Credit Card</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border rounded-lg flex items-center justify-center space-x-2 transition-all ${
              paymentMethod === 'paypal' 
                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' 
                : 'border-primary text-secondary hover:border-secondary'
            }`}
          >
            <span className="font-bold">PayPal</span>
          </button>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-primary"
            placeholder="your@email.com"
            required
          />
        </div>

        {paymentMethod === 'card' && (
          <>
            {/* Card Details */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="123"
                  required
                />
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Cardholder Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="New York"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="10001"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="flex items-center space-x-2 p-3 surface-secondary rounded-lg">
          <Shield className="w-5 h-5 text-accent-primary" />
          <span className="text-sm text-secondary">Your payment is secured with 256-bit SSL encryption</span>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setStep('plan')}
            className="flex-1 btn-ghost"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
          >
            <Lock className="w-4 h-4 mr-2" />
            Complete Payment
          </button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-success" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-primary mb-2">Payment Successful!</h3>
        <p className="text-secondary">Welcome to Rankora {plan.name}! Your account has been upgraded.</p>
      </div>

      <div className="surface-secondary border border-primary rounded-xl p-6">
        <h4 className="font-semibold text-primary mb-4">What's Next?</h4>
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <Check className="w-4 h-4 text-accent-primary" />
            <span className="text-secondary text-sm">Your 7-day free trial has started</span>
          </div>
          <div className="flex items-center space-x-3">
            <Check className="w-4 h-4 text-accent-primary" />
            <span className="text-secondary text-sm">Full access to all {plan.name} features</span>
          </div>
          <div className="flex items-center space-x-3">
            <Check className="w-4 h-4 text-accent-primary" />
            <span className="text-secondary text-sm">Confirmation email sent to your inbox</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="btn-primary w-full"
      >
        Start Using Rankora
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="surface-primary border border-primary rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-lg font-bold text-primary">Rankora</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {step === 'plan' && renderPlanConfirmation()}
        {step === 'payment' && renderPaymentForm()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
};