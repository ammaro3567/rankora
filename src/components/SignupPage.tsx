import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, User } from 'lucide-react';
import { signUp } from '../lib/supabase';

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
      const { data, error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
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

  if (success) {
    return (
      <div className="min-h-screen bg-background-color relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-primary-cta/40 rounded-full animate-twinkle"></div>
          <div className="absolute top-32 right-32 w-1 h-1 bg-yellow-400/60 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-40 w-3 h-3 bg-blue-400/30 rounded-full animate-constellation" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          <div className="bg-card-background border border-border-color rounded-2xl p-8 shadow-xl backdrop-blur-sm text-center animate-scale-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Account Created!</h2>
            <p className="text-text-secondary mb-4">
              Welcome to Rankora! Please check your email to verify your account.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-primary-cta">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-color relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Stars */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary-cta/40 rounded-full animate-twinkle" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-yellow-400/60 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-blue-400/30 rounded-full animate-constellation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/40 rounded-full animate-cosmic-drift" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-emerald-400/50 rounded-full animate-twinkle" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-pink-400/30 rounded-full animate-sparkle" style={{animationDelay: '5s'}}></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-primary-cta/5 to-emerald-400/3 rounded-full blur-3xl animate-floating-shapes" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-400/4 to-purple-400/3 rounded-full blur-3xl animate-bounce-soft" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-text-secondary hover:text-primary-cta transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:animate-bounce-soft" />
          <span>Back to Home</span>
        </button>

        {/* Signup Form */}
        <div className="bg-card-background border border-border-color rounded-2xl p-8 shadow-xl backdrop-blur-sm animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-cta rounded-2xl flex items-center justify-center mx-auto mb-4 animate-gentle-glow">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
            <p className="text-text-secondary">Join Rankora and optimize your content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-cta hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg animate-gentle-glow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-text-secondary text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-cta hover:text-emerald-600 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-cta hover:text-emerald-600 transition-colors">
                Privacy Policy
              </a>
            </p>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-border-color">
              <p className="text-text-secondary text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary-cta hover:text-emerald-600 font-semibold transition-colors"
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