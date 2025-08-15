import React from 'react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  BarChart3, 
  Target, 
  CreditCard, 
  User, 
  HelpCircle, 
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  Folder,
  Crown
} from 'lucide-react';
import { getUserSubscription } from '../lib/paypal';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  showAdminAccess?: boolean;
  onOpenAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  isOpen, 
  onToggle,
  showAdminAccess,
  onOpenAdmin
}) => {
  const { user, isLoaded } = useUser();
  const [planLabel, setPlanLabel] = useState<string>('Free Plan');

  useEffect(() => {
    const init = async () => {
      // 🎯 Get subscription status from Clerk user
      if (isLoaded && user) {
        try {
          const sub = await getUserSubscription(user?.id);
          if (sub?.status === 'active') {
            setPlanLabel('Paid Plan');
          } else {
            setPlanLabel('Free Plan');
          }
        } catch (error) {
          console.log('💰 No subscription found, using Free Plan');
          setPlanLabel('Free Plan');
        }
      }
    };
    
    init();
  }, [isLoaded, user]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'analyzer', label: 'AI Analyzer', icon: BarChart3 },
    { id: 'comparison', label: 'Comparison', icon: Target },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 surface-secondary border border-primary rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-secondary/95 backdrop-blur-md border-r border-primary/60 shadow-2xl z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:z-auto
      `}>
        {/* Right edge separator for stronger contrast */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent" />
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-primary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  RANK<span className="text-emerald-400">ORA</span>
                </h1>
                <p className="text-xs text-tertiary">AI Content Analyzer</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-primary/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {isLoaded && user ? user.primaryEmailAddress?.emailAddress || 'User' : 'Loading...'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-tertiary">{planLabel}</span>
                  {planLabel === 'Paid Plan' && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-primary hover:bg-primary/10 hover:text-emerald-400'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-tertiary'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Admin Access */}
            {showAdminAccess && (
              <button
                onClick={onOpenAdmin}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <Crown className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-primary/30 space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
