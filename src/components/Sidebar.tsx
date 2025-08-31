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
  Crown,
  Search
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
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl hover:bg-gray-800/80 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6 text-emerald-300" /> : <Menu className="w-6 h-6 text-emerald-300" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-emerald-500/30 shadow-2xl z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:z-auto
      `}>
        {/* Right edge separator for stronger contrast */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent" />
        
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-xl border border-emerald-500/40 flex items-center justify-center shadow-lg">
                <img src="/logo32.png" alt="Rankora" className="w-8 h-8 rounded-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">
                  RANK<span className="text-emerald-400">ORA</span>
                </h1>
                <p className="text-xs text-emerald-300/70 font-medium">AI Content Analyzer</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-500/40 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-100 truncate">
                  {isLoaded && user ? user.primaryEmailAddress?.emailAddress || 'User' : 'Loading...'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-emerald-300/70 font-medium">{planLabel}</span>
                  {planLabel === 'Paid Plan' && (
                    <Crown className="w-3 h-3 text-yellow-400" />
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
                      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-100 border border-emerald-500/40 shadow-lg shadow-emerald-500/20' 
                      : 'text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-200 hover:border hover:border-emerald-500/20'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-gray-400 group-hover:text-emerald-300'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Admin Access */}
            {showAdminAccess && (
              <button
                onClick={onOpenAdmin}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 hover:border hover:border-emerald-500/20"
              >
                <Crown className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-emerald-500/20 space-y-2 bg-gradient-to-t from-emerald-500/5 to-transparent">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-red-300 hover:bg-red-500/10 hover:text-red-200 hover:border hover:border-red-500/20"
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
