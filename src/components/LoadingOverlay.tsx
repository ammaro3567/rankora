import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Loading...", 
  isVisible 
}) => {
  if (!isVisible) return null;
  // Safety auto-hide after 2.5s in case parent forgets to flip the flag
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const el = document.querySelector('.loading-overlay');
      if (el) {
        el.classList.add('pointer-events-none');
      }
    }, 2500);
  }

  return (
    <div className="loading-overlay">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
        <Loader2 className="w-12 h-12 text-accent-primary mx-auto mb-4 animate-spin" />
        <p className="text-primary font-semibold text-lg mb-2">Please wait</p>
        <p className="text-secondary text-sm">{message}</p>
      </div>
    </div>
  );
};
