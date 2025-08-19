import React from 'react';
import { ArrowRight, FileText, Scale, AlertTriangle, CreditCard, Users, Shield, Gavel } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
              <Scale className="w-8 h-8 text-accent-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Terms of Service</h1>
            </div>
            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
              These terms govern your use of Rankora and outline our mutual rights and responsibilities.
            </p>
            <p className="text-sm text-tertiary mt-4">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content Cards */}
          <div className="space-y-8">
            {/* Acceptance */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-3">Acceptance of Terms</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      By accessing or using Rankora ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
                    </p>
                    <p>
                      These Terms apply to all visitors, users, and others who access or use the Service. By using our Service, you represent that you are at least 18 years old or have reached the age of majority in your jurisdiction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Description */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Service Description</h2>
                  <div className="text-secondary leading-relaxed space-y-3">
                    <p>
                      Rankora is an AI-powered content analysis platform that helps content creators optimize their content for Google's AI Overviews. Our Service includes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>AI-powered content analysis and scoring</li>
                      <li>Competitor comparison and benchmarking</li>
                      <li>Content optimization recommendations</li>
                      <li>Performance tracking and analytics</li>
                      <li>Export capabilities for reports and data</li>
                    </ul>
                    <p>
                      We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Accounts */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">User Accounts & Responsibilities</h2>
                  <div className="text-secondary leading-relaxed space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Account Creation</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>You must provide accurate and complete information when creating an account</li>
                        <li>You are responsible for maintaining the security of your account credentials</li>
                        <li>You must not share your account with others or allow unauthorized access</li>
                        <li>You must notify us immediately of any suspected unauthorized access</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Acceptable Use</h3>
                      <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Abuse or overload our Service infrastructure</li>
                        <li>Use the Service for spam, malware, or malicious activities</li>
                        <li>Reverse engineer or attempt to extract our algorithms</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription & Billing */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Subscription & Billing</h2>
                  <div className="text-secondary leading-relaxed space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Subscription Plans</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Free tier with limited monthly analyses</li>
                        <li>Paid subscriptions with expanded features and limits</li>
                        <li>Usage-based billing for analyses beyond plan limits</li>
                        <li>All prices are listed in USD and exclude applicable taxes</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Payment Terms</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Payments are processed securely through PayPal</li>
                        <li>Subscriptions renew automatically unless cancelled</li>
                        <li>You can cancel your subscription at any time from your account settings</li>
                        <li>Refunds are provided according to our refund policy</li>
                        <li>We may change pricing with 30 days advance notice</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Refund Policy</h3>
                      <p>We offer refunds under the following conditions:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                        <li>Full refund within 7 days of initial subscription</li>
                        <li>Pro-rated refunds for technical issues lasting more than 48 hours</li>
                        <li>No refunds for usage-based charges or completed analyses</li>
                        <li>Refund requests must be submitted to contact@rankora.online</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Intellectual Property</h2>
                  <div className="text-secondary leading-relaxed space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Our Rights</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Rankora and all related trademarks are our property</li>
                        <li>Our AI algorithms, software, and analysis methods are proprietary</li>
                        <li>All content and materials on our platform are protected by copyright</li>
                        <li>You may not copy, modify, or distribute our intellectual property</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Your Content</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>You retain ownership of content you submit for analysis</li>
                        <li>You grant us limited rights to process and analyze your content</li>
                        <li>We may use aggregated, anonymized data to improve our Service</li>
                        <li>You represent that you have rights to submit the content for analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="card card-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">Disclaimers & Limitation of Liability</h2>
                  <div className="text-secondary leading-relaxed space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Service Disclaimers</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>The Service is provided "as is" without warranties of any kind</li>
                        <li>We do not guarantee specific results or performance improvements</li>
                        <li>AI analysis results are estimates and may not be 100% accurate</li>
                        <li>We are not responsible for third-party content or external links</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Limitation of Liability</h3>
                      <p>To the maximum extent permitted by law:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                        <li>Our total liability shall not exceed the amount you paid in the last 12 months</li>
                        <li>We are not liable for indirect, incidental, or consequential damages</li>
                        <li>We are not responsible for business losses or lost profits</li>
                        <li>Some jurisdictions may not allow these limitations</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-primary mb-2">Indemnification</h3>
                      <p>
                        You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div className="card card-shadow">
              <div className="text-secondary leading-relaxed space-y-4">
                <h2 className="text-2xl font-semibold text-primary mb-4">Termination</h2>
                
                <div>
                  <h3 className="text-lg font-medium text-primary mb-2">By You</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You may terminate your account at any time from your account settings</li>
                    <li>Upon termination, your access to the Service will cease immediately</li>
                    <li>Your data will be retained according to our Privacy Policy</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary mb-2">By Us</h3>
                  <p>We may terminate or suspend your account if you:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Violate these Terms or our Acceptable Use Policy</li>
                    <li>Fail to pay subscription fees</li>
                    <li>Engage in fraudulent or abusive behavior</li>
                    <li>Pose a security risk to our Service or other users</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="card card-shadow">
              <div className="text-secondary leading-relaxed space-y-3">
                <h2 className="text-2xl font-semibold text-primary mb-4">Governing Law & Disputes</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration, except where prohibited by law.
                </p>
                <p>
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                </p>
              </div>
            </div>

            {/* Contact & Changes */}
            <div className="card card-shadow">
              <div className="text-secondary leading-relaxed space-y-4">
                <h2 className="text-2xl font-semibold text-primary mb-4">Changes & Contact</h2>
                
                <div>
                  <h3 className="text-lg font-medium text-primary mb-2">Changes to Terms</h3>
                  <p>
                    We may revise these Terms from time to time. Material changes will be communicated through:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Email notification to your registered address</li>
                    <li>Prominent notice on our website</li>
                    <li>In-app notification when you next use the Service</li>
                  </ul>
                  <p className="mt-2">
                    Your continued use of the Service after changes constitutes acceptance of the new Terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary mb-2">Contact Information</h3>
                  <div className="bg-surface-secondary rounded-lg p-4">
                    <p className="font-medium text-primary mb-2">Rankora Legal Team</p>
                    <p>Email: <a href="mailto:contact@rankora.online" className="text-accent-primary hover:text-accent-secondary transition-colors">contact@rankora.online</a></p>
                    <p className="mt-2 text-sm text-tertiary">
                      For questions about these Terms or to report violations.
                    </p>
                  </div>
                </div>
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
