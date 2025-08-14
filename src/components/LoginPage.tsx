import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { StarField } from './StarField';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  onSwitchToSignup: () => void;
  onGoogleLogin: () => Promise<{ success: boolean; error: string | null }>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onBack, 
  onLogin, 
  onSwitchToSignup, 
  onGoogleLogin 
}) => {
  // 🎯 Clean state management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 📝 Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  // 🔐 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return
    }
    
    if (!formData.password) {
      setError('Please enter your password')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    console.log('🔐 Attempting login for:', formData.email)
    setIsLoading(true)
    setError(null)

    try {
      const result = await onLogin(formData.email, formData.password)
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.')
        setIsLoading(false)
      } else {
        // Success - add safety timeout to prevent infinite loading
        setTimeout(() => {
          setIsLoading(false)
        }, 3000) // 3 second safety timeout
      }
      // App.tsx will handle the redirect via auth state change
      
    } catch (err) {
      console.error('💥 Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  // 🔗 Handle Google login
  const handleGoogleLogin = async () => {
    console.log('🔗 Attempting Google login')
    setIsLoading(true)
    setError(null)

    try {
      const result = await onGoogleLogin()
      
      if (!result.success) {
        setError(result.error || 'Google login failed. Please try again.')
        setIsLoading(false)
      }
      // If successful, redirect will happen automatically
      
    } catch (err) {
      console.error('💥 Google login error:', err)
      setError('Google login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex items-center justify-center">
      <StarField />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute -top-16 left-4 text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Login Form */}
        <div className="card animate-scaleIn">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your Rankora account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-primary pl-12 h-12 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
                <Mail className="form-icon" />
              </div>
            </div>

            {/* Password field */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-primary pl-12 pr-12 h-12 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400/20"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <Lock className="form-icon" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-accent-primary transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                  <span>Sign In</span>
              )}
            </button>
          </form>

            {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-3 text-sm text-secondary">or</span>
            <div className="flex-1 border-t border-border"></div>
            </div>

          {/* Google login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/15 border border-gray-600 text-white font-semibold flex items-center justify-center gap-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            <span>Continue with Google</span>
            </button>

          {/* Switch to signup */}
          <div className="mt-6 text-center">
            <p className="text-secondary">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-accent-primary hover:text-accent-secondary font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                Sign up here
                </button>
              </p>
            </div>
        </div>
      </div>
    </div>
  )
}