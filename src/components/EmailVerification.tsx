import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { StarField } from './StarField';
import { authService, supabase } from '../lib/supabase';

interface EmailVerificationProps {
  onBack: () => void;
  userEmail?: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ onBack, userEmail }) => {
  const [status, setStatus] = useState<'waiting' | 'checking' | 'success' | 'error'>('waiting')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if this is a verification callback from email
    const handleVerificationCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (type === 'signup' && accessToken && refreshToken) {
        console.log('📧 Processing email verification callback')
        setStatus('checking')

        try {
          // Set the session from verification callback
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('❌ Session setting failed:', error.message)
            setStatus('error')
            setMessage('Email verification failed. Please try again or contact support.')
            return
          }

          if (data.session?.user) {
            console.log('✅ Email verified successfully for:', data.session.user.email)
            setStatus('success')
            setMessage('Email verified successfully! Redirecting to dashboard...')
            
            // Clean up URL and redirect to dashboard
            window.history.replaceState({}, document.title, '/dashboard')
            
            // Let the auth state change handle the redirect
            setTimeout(() => {
              window.location.reload() // Force refresh to trigger auth check
            }, 1500)
          } else {
            setStatus('error')
            setMessage('Verification completed but no user session found.')
          }
          
        } catch (error) {
          console.error('💥 Verification error:', error)
          setStatus('error')
          setMessage('Something went wrong during verification. Please try again.')
        }
      }
    }

    handleVerificationCallback()
  }, [])

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Verifying Email...</h2>
            <p className="text-secondary">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Email Verified!</h2>
            <p className="text-secondary mb-4">{message}</p>
            <div className="animate-pulse">
              <p className="text-sm text-accent-primary">Redirecting to dashboard...</p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Verification Failed</h2>
            <p className="text-secondary mb-6">{message}</p>
            <button
              onClick={onBack}
              className="btn-primary"
            >
              Go Back to Home
            </button>
          </div>
        )

      default: // waiting
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Check Your Email</h2>
            <p className="text-secondary mb-6">
              We've sent a verification email to{' '}
              <span className="font-medium text-primary">
                {userEmail || 'your email address'}
              </span>
              . Please click the link in the email to verify your account.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Next steps:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be automatically redirected to your dashboard</li>
              </ol>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-secondary">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
              <button
                onClick={onBack}
                className="text-accent-primary hover:text-accent-secondary font-medium transition-colors duration-200"
              >
                Go back to signup
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center">
      <StarField />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Back button - only show when waiting */}
        {status === 'waiting' && (
          <button
            onClick={onBack}
            className="absolute -top-16 left-4 text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        )}

        <div className="card animate-scaleIn">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}