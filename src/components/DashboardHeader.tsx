import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { CreditCard, HelpCircle } from 'lucide-react';

interface DashboardHeaderProps {
  onTabChange: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onTabChange }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 lg:px-10 py-4">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <img src="/logo32.png" alt="Rankora" className="w-8 h-8 rounded-lg" />
          <h1 className="text-lg font-bold text-primary">
            RANK<span className="text-emerald-400">ORA</span>
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Billing Button */}
          <button
            onClick={() => onTabChange('billing')}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all duration-200"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Billing</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => onTabChange('faq')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Clerk UserButton */}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "bg-gray-900 border border-gray-700 shadow-2xl",
                userButtonPopoverActionButton: "hover:bg-gray-800 text-gray-300 hover:text-white",
                userButtonPopoverActionButtonText: "text-sm",
                userButtonPopoverFooter: "border-t border-gray-700"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
};
