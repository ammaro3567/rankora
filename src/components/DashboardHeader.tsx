import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { CreditCard, HelpCircle, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  onTabChange: (tab: string) => void;
  currentTab: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onTabChange, currentTab }) => {
  return (
    <header className="bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl border-b border-emerald-500/30 shadow-2xl mb-8">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left side - Elegant branding */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-500/40 shadow-lg">
            <span className="text-emerald-300 text-lg">✨</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-emerald-200">Dashboard</span>
            <span className="text-xs text-emerald-400/60 font-medium">Quick Access</span>
          </div>
        </div>

        {/* Right side - Enhanced Actions toolbar */}
        <div className="flex items-center space-x-3">
          {/* Billing Button - Enhanced */}
          <button
            onClick={() => onTabChange('billing')}
            className="group flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r from-emerald-500/25 via-emerald-600/25 to-emerald-700/25 hover:from-emerald-500/35 hover:via-emerald-600/35 hover:to-emerald-700/35 text-emerald-200 border border-emerald-500/50 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-105 hover:-translate-y-0.5 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>Billing</span>
          </button>

          {/* Help Button - Enhanced */}
          <button
            onClick={() => onTabChange('faq')}
            className="group flex items-center p-2.5 text-gray-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-emerald-500/30"
            title="Help & FAQ"
          >
            <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          </button>

          {/* Notification Bell - Enhanced */}
          <button 
            className="group p-2.5 text-gray-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-emerald-500/30"
            title="Notifications"
          >
            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          </button>

          {/* Elegant Divider */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent mx-2"></div>

          {/* Enhanced Clerk UserButton */}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-emerald-500/40 hover:ring-emerald-500/60 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25",
                userButtonPopoverCard: "bg-gray-900/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl",
                userButtonPopoverActionButton: "hover:bg-emerald-500/15 text-gray-300 hover:text-emerald-200 transition-colors duration-200",
                userButtonPopoverActionButtonText: "text-sm font-medium",
                userButtonPopoverFooter: "border-t border-emerald-500/30"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
};
