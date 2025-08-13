import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StarField } from './StarField';

interface EmailVerificationProps {
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'waiting' | 'loading' | 'success' | 'error'>('waiting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if this is a verification callback from email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (type === 'signup' && accessToken && refreshToken) {
      // This is a callback from email verification - redirect to dashboard
      const verifyAndRedirect = async () => {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            // Successful verification - go directly to dashboard
            console.log('✅ Email verified successfully, redirecting to dashboard');
            window.location.href = '/dashboard';
          } else {
            setStatus('error');
            setMessage('Email verification failed. Please try again.');
          }
        } catch (error) {
          setStatus('error');
          setMessage('Something went wrong. Please try again.');
        }
      };
      
      verifyAndRedirect();
    }
    // If no verification params, stay in waiting state to show instructions
  }, []);

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center">
      <StarField />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="card text-center animate-scaleIn">
          
          {/* Waiting for Confirmation State */}
          {status === 'waiting' && (
            <>
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent-primary" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Check Your Email</h2>
              <p className="text-secondary mb-6">
                We've sent you a verification email. Please check your inbox and click the verification link to complete your registration and access the dashboard.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={onBack}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-accent-primary/10 rounded-lg">
                <p className="text-tertiary text-sm">
                  <strong>Can't find the email?</strong> Check your spam folder or wait a few minutes for delivery. The verification link will take you directly to the dashboard.
                </p>
              </div>
            </>
          )}

          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Verifying Email...</h2>
              <p className="text-secondary mb-4">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Email Verified!</h2>
              <p className="text-secondary mb-4">{message}</p>
              <p className="text-tertiary text-sm">
                Redirecting to dashboard in 3 seconds...
              </p>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Verification Failed</h2>
              <p className="text-secondary mb-6">{message}</p>
              
              <div className="space-y-3">
                <button
                  onClick={onBack}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/signup'}
                  className="btn-secondary w-full"
                >
                  Try Signing Up Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

