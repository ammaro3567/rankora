import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary border-t border-primary py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-lg font-bold text-primary">
              RANK<span className="text-accent-primary">ORA</span>
            </span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-secondary text-sm mb-2">
              © 2025 Rankora. All rights reserved.
            </p>
            <p className="text-tertiary text-xs flex items-center justify-center md:justify-end">
              Made with <Heart className="w-3 h-3 mx-1 text-accent-primary" /> for content creators
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-primary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-primary mb-2">Product</h4>
              <ul className="space-y-1 text-secondary">
                <li><a href="#" className="hover:text-accent-primary transition-colors">AI Analyzer</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Competitor Comparison</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-2">Company</h4>
              <ul className="space-y-1 text-secondary">
                <li><a href="#" className="hover:text-accent-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-2">Support</h4>
              <ul className="space-y-1 text-secondary">
                <li><a href="#" className="hover:text-accent-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-2">Legal</h4>
              <ul className="space-y-1 text-secondary">
                <li><a href="#" className="hover:text-accent-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-accent-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};