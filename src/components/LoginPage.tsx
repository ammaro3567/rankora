import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { signIn } from '../lib/supabase';

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
        
        {/* Medium Stars */}
        <div className="absolute top-16 left-1/2 w-1 h-1 bg-indigo-400/40 rounded-full animate-constellation" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-3/4 left-16 w-2 h-2 bg-teal-400/35 rounded-full animate-cosmic-drift" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-orange-400/45 rounded-full animate-twinkle" style={{animationDelay: '3.5s'}}></div>
        <div className="absolute top-40 right-16 w-1 h-1 bg-cyan-400/50 rounded-full animate-sparkle" style={{animationDelay: '4.5s'}}></div>
        
        {/* Small Stars */}
        <div className="absolute top-24 left-3/4 w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-16 left-1/3 w-1 h-1 bg-white/25 rounded-full animate-constellation" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute top-1/2 right-12 w-1 h-1 bg-white/35 rounded-full animate-sparkle" style={{animationDelay: '2.8s'}}></div>
        <div className="absolute bottom-1/3 left-12 w-1 h-1 bg-white/40 rounded-full animate-cosmic-drift" style={{animationDelay: '3.8s'}}></div>
        
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

        {/* Login Form */}
        <div className="bg-card-background border border-border-color rounded-2xl p-8 shadow-xl backdrop-blur-sm animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-cta rounded-2xl flex items-center justify-center mx-auto mb-4 animate-gentle-glow">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
            <p className="text-text-secondary">Sign in to your Rankora account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                  placeholder="Enter your password"
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
                className="text-primary-cta hover:text-emerald-600 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-border-color">
              <p className="text-text-secondary text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-primary-cta hover:text-emerald-600 font-semibold transition-colors"
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