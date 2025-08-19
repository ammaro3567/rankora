import React from 'react';
import { ArrowRight, Shield, Eye, Database, Lock, Globe, Mail, FileText } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const lastUpdated = "January 15, 2025";
  
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="glass border-b border-primary fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo32.png" alt="Rankora" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-primary">
              RANK<span className="text-accent-primary">ORA</span>
            </span>
          </div>

          {/* Right: Back button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-secondary hover:text-accent-primary transition-colors"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Shield className="w-8 h-8 text-accent-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Privacy Policy</h1>
            </div>
            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
              Your privacy is fundamental to our service. Learn how we protect, handle, and respect your data.
            </p>
            <p className="text-sm text-tertiary mt-4">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content Cards */}
          <div className="space-y-8">
            {/* Overview */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-3">Overview</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      At Rankora, we are committed to protecting your privacy and ensuring transparency in how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices regarding data collection and usage when you use our AI-powered content analysis platform.
                    </p>
                    <p>
                      By using Rankora, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Information We Collect</h2>
                  <div className="text-secondary leading-relaxed space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Personal Information</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Email address for account creation and communication</li>
                        <li>Name and profile information you provide</li>
                        <li>Payment information processed securely through PayPal</li>
                        <li>Communication preferences and settings</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Usage Data</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Content URLs and analysis requests you submit</li>
                        <li>Usage patterns and feature interactions</li>
                        <li>Technical information like IP address, browser type, and device information</li>
                        <li>Performance metrics and error logs for service improvement</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Cookies and Tracking</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Essential cookies for authentication and session management</li>
                        <li>Analytics cookies to understand user behavior (anonymous)</li>
                        <li>Preference cookies to remember your settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">How We Use Your Information</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Service Provision</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Provide AI-powered content analysis and competitor comparison</li>
                        <li>Generate insights and recommendations for your content</li>
                        <li>Maintain your account and manage subscriptions</li>
                        <li>Process payments and billing</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Communication</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Send important service updates and security notifications</li>
                        <li>Respond to your questions and support requests</li>
                        <li>Share relevant tips and best practices (with your consent)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Improvement</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Analyze usage patterns to improve our AI algorithms</li>
                        <li>Enhance user experience and platform performance</li>
                        <li>Develop new features based on user needs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Data Security & Protection</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      We implement robust security measures to protect your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Encryption:</strong> All data transmission uses SSL/TLS encryption</li>
                      <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                      <li><strong>Data Centers:</strong> SOC 2 certified infrastructure with 24/7 monitoring</li>
                      <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                      <li><strong>Incident Response:</strong> Dedicated team for security incident management</li>
                    </ul>
                    <p className="mt-3">
                      While we strive to protect your personal information, no method of transmission over the internet is 100% secure. We continuously work to improve our security measures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Data Sharing & Third Parties</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      We do not sell, trade, or rent your personal information. We may share data only in these limited circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Service Providers:</strong> Trusted partners who help us operate our service (e.g., hosting, payment processing)</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users</li>
                      <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                      <li><strong>Your Consent:</strong> When you explicitly authorize sharing</li>
                    </ul>
                    <p className="mt-3">
                      All third-party partners are bound by strict confidentiality agreements and data protection requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Your Rights & Control</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      You have the following rights regarding your personal data:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Access:</strong> Request a copy of your personal data</li>
                      <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                      <li><strong>Portability:</strong> Receive your data in a structured format</li>
                      <li><strong>Objection:</strong> Object to certain types of data processing</li>
                      <li><strong>Restriction:</strong> Request restriction of data processing</li>
                    </ul>
                    <p className="mt-3">
                      To exercise these rights, contact us at <a href="mailto:contact@rankora.online" className="text-accent-primary hover:text-accent-secondary transition-colors">contact@rankora.online</a>. We will respond within 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Contact Us</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="bg-surface-secondary rounded-lg p-4 mt-4">
                      <p className="font-medium text-primary mb-2">Rankora Privacy Team</p>
                      <p>Email: <a href="mailto:contact@rankora.online" className="text-accent-primary hover:text-accent-secondary transition-colors">contact@rankora.online</a></p>
                      <p className="mt-2 text-sm text-tertiary">
                        We typically respond to privacy inquiries within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes to Policy */}
            <div className="card card-shadow">
              <div className="text-secondary leading-relaxed space-y-3">
                <h2 className="text-2xl font-semibold text-primary mb-4">Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any significant changes by:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Sending you an email notification</li>
                  <li>Providing an in-app notification</li>
                </ul>
                <p className="mt-3">
                  Your continued use of Rankora after any changes indicates your acceptance of the updated Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-12">
            <button 
              onClick={onBack}
              className="btn-primary hover-lift"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
