import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { AIOverviewAnalyzer } from './AIOverviewAnalyzer';
import { CompetitorComparison } from './CompetitorComparison';
import { PricingPage } from './PricingPage';
import { FAQPage } from './FAQPage';
import { ProjectsPage } from './ProjectsPage';
import { AccountSettings } from './AccountSettings';
import { SuccessPage } from './SuccessPage';
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
        return <PricingPage embedded />;
      case 'faq':
        return <FAQPage />;
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
    <div className="min-h-screen relative bg-transparent">
      <AnimatedBackground />
      
      {/* Enhanced Background Effects to match Landing Page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{top: '15%', left: '5%', animation: 'float 20s ease-in-out infinite'}}></div>
        <div className="absolute w-80 h-80 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{top: '65%', right: '5%', animation: 'float 25s ease-in-out infinite reverse'}}></div>
        <div className="absolute w-60 h-60 bg-gradient-to-r from-emerald-400/8 to-emerald-500/8 rounded-full blur-3xl animate-pulse" style={{top: '40%', left: '70%', animation: 'float 30s ease-in-out infinite'}}></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.2; }
        }
      `}</style>
      
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          showAdminAccess={showAdminAccess}
          onOpenAdmin={onOpenAdmin}

        />
        
        <main className="flex-1 lg:ml-0 relative z-10">
      <div className="p-4 lg:p-10 pt-6 lg:pt-10 space-y-6">
            {/* strengthen card contrast over animated bg */}
            <style>{`
              .card { background-color: rgba(15, 23, 42, 0.75); border-color: rgba(148, 163, 184, 0.25); }
              .surface-secondary { background-color: rgba(30, 41, 59, 0.65); }
              .surface-primary { background-color: rgba(15, 23, 42, 0.8); }
              .limit-banner { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); }
            `}</style>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
      )}
    </>
  );
};