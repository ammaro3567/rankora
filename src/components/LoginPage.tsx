import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { signIn } from '../lib/supabase';
import { StarField } from './StarField';

interface LoginPageProps {
  onBack: () => void;
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        onLogin();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center">
      <StarField />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-secondary hover:text-accent-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:animate-float" />
          <span>Back to Home</span>
        </button>

        {/* Login Form */}
        <div className="card animate-scaleIn">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-secondary">Sign in to your Rankora account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-primary pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-primary pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-error text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-5 h-5" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-accent-primary hover:text-accent-secondary text-sm font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-primary">
              <p className="text-secondary text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-accent-primary hover:text-accent-secondary font-semibold transition-colors"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};