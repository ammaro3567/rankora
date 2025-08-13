import React from 'react';
import { useEffect, useState } from 'react';
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
import { getCurrentUser } from '../lib/supabase';
import { getUserSubscription } from '../lib/paypal';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  showAdminAccess?: boolean;
  onOpenAdmin?: () => void;
  isLoggedIn?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  isOpen, 
  onToggle,
  showAdminAccess,
  onOpenAdmin,
  isLoggedIn
}) => {
  const [userEmail, setUserEmail] = useState<string>('Guest');
  const [planLabel, setPlanLabel] = useState<string>('Free Plan');

  useEffect(() => {
    const init = async () => {
      // 🎯 Only fetch user if logged in (according to App state)
      if (isLoggedIn) {
        const user = await getCurrentUser();
        if (user?.email) {
          setUserEmail(user.email);
        } else {
          // Fallback - wait a bit and try again
          setTimeout(async () => {
            const retryUser = await getCurrentUser();
            if (retryUser?.email) setUserEmail(retryUser.email);
          }, 1000);
        }
        
        try {
          const sub = await getUserSubscription();
          if (sub?.subscription_status === 'active') {
            setPlanLabel('Paid Plan');
          } else {
            setPlanLabel('Free Plan');
          }
        } catch {}
      } else {
        setUserEmail('Guest');
        setPlanLabel('Free Plan');
      }
    };
    init();
  }, [isLoggedIn]);
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
        fixed left-0 top-0 h-full w-64 bg-secondary border-r border-primary z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-primary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  RANK<span className="text-accent-primary">ORA</span>
                </h1>
                <p className="text-xs text-tertiary">AI Content Analyzer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-left
                    ${activeTab === item.id 
                      ? 'text-accent-primary bg-surface-secondary' 
                      : 'text-secondary hover:text-primary hover:bg-surface-secondary'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-primary">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{userEmail}</p>
                <p className="text-xs text-tertiary truncate">{planLabel}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {showAdminAccess && onOpenAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-accent-primary hover:bg-accent-primary/10 transition-all duration-200 border border-accent-primary/30"
                >
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Panel</span>
                </button>
              )}
              
              <button
                onClick={() => onTabChange('settings')}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-secondary transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
              
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-error hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};