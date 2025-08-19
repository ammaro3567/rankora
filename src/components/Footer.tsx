import React from 'react';
import { Heart, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleContactEmail = () => {
    window.open('mailto:contact@rankora.online', '_blank');
  };

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-secondary border-t border-primary py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-accent-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold text-primary">
                RANK<span className="text-accent-primary">ORA</span>
              </span>
            </div>
            <p className="text-secondary text-sm leading-relaxed mb-4 max-w-md">
              Master Google's AI Overviews with AI-powered content analysis, competitor insights, and data-driven optimization for content creators worldwide.
            </p>
            <div className="flex items-center space-x-2 text-sm text-secondary">
              <Mail className="w-4 h-4" />
              <button 
                onClick={handleContactEmail}
                className="hover:text-accent-primary transition-colors cursor-pointer"
              >
                contact@rankora.online
              </button>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li><a href="#features" className="hover:text-accent-primary transition-colors">AI Analyzer</a></li>
              <li><a href="#features" className="hover:text-accent-primary transition-colors">Competitor Comparison</a></li>
              <li><a href="#pricing" className="hover:text-accent-primary transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-accent-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <button 
                  onClick={handleContactEmail}
                  className="hover:text-accent-primary transition-colors text-left"
                >
                  Contact Support
                </button>
              </li>
              <li><a href="#faq" className="hover:text-accent-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors">System Status</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <button 
                  onClick={() => handleNavigation('privacy')}
                  className="hover:text-accent-primary transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('terms')}
                  className="hover:text-accent-primary transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li><a href="/privacy" className="hover:text-accent-primary transition-colors">Data Privacy</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-6 border-t border-primary">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-secondary text-sm">
                © 2025 Rankora. All rights reserved.
              </p>
              <p className="text-tertiary text-xs flex items-center justify-center md:justify-start mt-1">
                Made with <Heart className="w-3 h-3 mx-1 text-accent-primary" /> for content creators worldwide
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center space-x-4 text-xs text-tertiary">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-accent-primary rounded-full"></span>
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-accent-primary rounded-full"></span>
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-accent-primary rounded-full"></span>
                <span>SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};