import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { AIOverviewAnalyzer } from './AIOverviewAnalyzer';
import { CompetitorComparison } from './CompetitorComparison';
import { PricingPage } from './PricingPage';
import { FAQPage } from './FAQPage';
import { AccountSettings } from './AccountSettings';
import { StarField } from './StarField';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return <AIOverviewAnalyzer />;
      case 'comparison':
        return <CompetitorComparison />;
      case 'pricing':
        return <PricingPage />;
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
    <div className="min-h-screen bg-primary relative">
      <StarField />
      
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 lg:ml-0 relative z-10">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};