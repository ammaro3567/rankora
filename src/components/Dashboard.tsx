import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { AIOverviewAnalyzer } from './AIOverviewAnalyzer';
import { CompetitorComparison } from './CompetitorComparison';
import { ProjectsPage } from './ProjectsPage';
import { PricingPage } from './PricingPage';
import { FAQPage } from './FAQPage';
import { AccountSettings } from './AccountSettings';
import { SuccessPage } from './SuccessPage';
import { DashboardHeader } from './DashboardHeader';
import { BillingPage } from './BillingPage';
import { AnimatedBackground } from './AnimatedBackground';

interface DashboardProps {
  onLogout: () => void;
  showAdminAccess?: boolean;
  onOpenAdmin?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, showAdminAccess, onOpenAdmin }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if we're coming from a successful payment
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/success' || urlParams.get('success') === 'true') {
      setActiveTab('success');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Listen for global events to open tabs (for Upgrade CTA)
  React.useEffect(() => {
    const openPricing = () => setActiveTab('pricing');
    const openAnalyzer = () => setActiveTab('analyzer');
    const openComparison = () => setActiveTab('comparison');
    window.addEventListener('open-pricing', openPricing);
    window.addEventListener('open-analyzer', openAnalyzer);
    window.addEventListener('open-comparison', openComparison);
    return () => {
      window.removeEventListener('open-pricing', openPricing);
      window.removeEventListener('open-analyzer', openAnalyzer);
      window.removeEventListener('open-comparison', openComparison);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'success':
        return <SuccessPage onNavigate={setActiveTab} />;
      case 'analyzer':
        return <AIOverviewAnalyzer />;
      case 'comparison':
        return <CompetitorComparison />;
      case 'projects':
        return <ProjectsPage />;
      case 'pricing':
        return <PricingPage onTabChange={setActiveTab} />;
      case 'faq':
        return <FAQPage />;
      case 'billing':
        return <BillingPage onTabChange={setActiveTab} />;
      case 'account':
      case 'settings':
        return <AccountSettings onLogout={onLogout} />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <>
      {activeTab === 'success' ? (
        renderContent()
      ) : (
        <div className="min-h-screen relative bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <AnimatedBackground />
          
          <div className="flex min-h-screen">
            {/* Enhanced Sidebar */}
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={onLogout}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              showAdminAccess={showAdminAccess}
              onOpenAdmin={onOpenAdmin}
            />
            
            {/* Enhanced Main Content Area */}
            <main className="flex-1 lg:ml-0 relative z-10 flex flex-col">
              {/* Dashboard Header - Only show in overview */}
              {activeTab === 'overview' && (
                <div className="sticky top-0 z-20">
                  <DashboardHeader onTabChange={setActiveTab} currentTab={activeTab} />
                </div>
              )}
              
              {/* Enhanced Content Container - Responsive padding */}
              <div className="flex-1 p-4 sm:p-6 lg:p-12 pt-6 sm:pt-8 lg:pt-16 space-y-6 sm:space-y-8">
                {/* Enhanced Card Styling */}
                <style>{`
                  .card { 
                    background: rgba(15, 23, 42, 0.85); 
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                  }
                  .surface-secondary { 
                    background: rgba(30, 41, 59, 0.75); 
                    backdrop-filter: blur(20px);
                  }
                  .surface-primary { 
                    background: rgba(15, 23, 42, 0.9); 
                    backdrop-filter: blur(20px);
                  }
                  .limit-banner { 
                    background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05));
                    backdrop-filter: blur(20px);
                  }
                  .btn-primary {
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
                  }
                  .btn-primary:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.3);
                    transform: translateY(-2px);
                  }
                  .btn-secondary {
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(148, 163, 184, 0.3);
                    backdrop-filter: blur(20px);
                  }
                  .btn-secondary:hover {
                    background: rgba(51, 65, 85, 0.9);
                    border-color: rgba(16, 185, 129, 0.5);
                  }
                `}</style>
                
                {/* Content with Enhanced Spacing */}
                <div className="max-w-7xl mx-auto">
                  {renderContent()}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
};