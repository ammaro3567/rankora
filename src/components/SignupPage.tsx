import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, User } from 'lucide-react';
import { signUp, signInWithGoogle } from '../lib/supabase';
import { upsertUserProfile } from '../lib/supabase';
import { StarField } from './StarField';

interface SignupPageProps {
  onBack: () => void;
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onBack, onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Create initial profile with full name
        await upsertUserProfile({ full_name: formData.name });
        setSuccess(true);
        setTimeout(() => {
          onSignup();
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message);
      }
      // Note: Google OAuth will redirect, so we don't need to call onSignup here
    } catch (err) {
      setError('Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center">
        <StarField />
        
        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          <div className="card text-center animate-scaleIn">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Account Created!</h2>
            <p className="text-secondary mb-4">
              Welcome to Rankora! We've sent a verification email to <strong>{formData.email}</strong>. Please check your email and click the verification link to activate your account.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-accent-primary">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Signup Form */}
        <div className="card animate-scaleIn">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-3xl">R</span>
            </div>
            <h1 className="text-4xl font-bold text-primary mb-3 bg-gradient-to-r from-accent-primary to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-secondary text-lg">
              Join thousands of content creators optimizing with AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary mb-3">
                Full Name
              </label>
              <div className="form-field">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-primary pl-12"
                  placeholder="Enter your full name"
                  required
                />
                <User className="form-icon" />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-3">
                Email Address
              </label>
              <div className="form-field">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-primary pl-12"
                  placeholder="Enter your email address"
                  required
                />
                <Mail className="form-icon" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-3">
                Password
              </label>
              <div className="form-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-primary pl-12 pr-12"
                  placeholder="Create a strong password"
                  required
                />
                <Lock className="form-icon" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-accent-primary transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary mb-3">
                Confirm Password
              </label>
              <div className="form-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-primary pl-12 pr-12"
                  placeholder="Confirm your password"
                  required
                />
                <Lock className="form-icon" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-accent-primary transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-primary to-purple-600 hover:from-purple-600 hover:to-accent-primary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-5 h-5" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-primary text-tertiary">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-primary rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-primary font-medium transition-all duration-200 hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Terms */}
            <p className="text-xs text-tertiary text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-accent-primary hover:text-accent-secondary transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-accent-primary hover:text-accent-secondary transition-colors">
                Privacy Policy
              </a>
            </p>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-primary">
              <p className="text-secondary text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-accent-primary hover:text-accent-secondary font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};