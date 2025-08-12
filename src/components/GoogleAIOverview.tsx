import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { sendToN8nWebhook } from '../config/webhooks';

interface AccordionItemProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, content, isOpen, onClick }) => (
  <div className="border-b border-gray-200 dark:border-gray-700">
    <button
      className="w-full py-3 md:py-4 px-4 md:px-6 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={onClick}
    >
      <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base pr-2">{title}</span>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      )}
    </button>
    <div className={`accordion-content ${isOpen ? 'open' : ''} bg-gray-50 dark:bg-gray-800`}>
      <div className="p-4 md:p-6 text-gray-600 dark:text-gray-300 text-sm md:text-base">
        {content}
      </div>
    </div>
  </div>
);

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  const circumference = 440;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32 md:w-48 md:h-48">
      <svg className="circular-progress w-full h-full" viewBox="0 0 160 160">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r="70"
          cx="80"
          cy="80"
        />
        <circle
          className="text-accent-primary"
          strokeWidth="12"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="70"
          cx="80"
          cy="80"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
        {percentage}%
      </div>
    </div>
  );
};

export const GoogleAIOverview: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [userUrl, setUserUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const recommendations = [
    {
      title: "Expand on Enjoyable Activities",
      content: "Add more detailed descriptions of activities that visitors can enjoy. Include specific examples, durations, and what makes each activity unique."
    },
    {
      title: "Enhance Location Context",
      content: "Provide more geographical context about the location, including nearby attractions, transportation options, and local amenities."
    },
    {
      title: "Add Seasonal Information",
      content: "Include details about how the experience varies across different seasons, including weather considerations and seasonal activities."
    }
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim() || !userUrl.trim()) {
      alert('Please fill in both fields');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await sendToN8nWebhook({
        keyword: keyword.trim(),
        userUrl: userUrl.trim()
      });

      if (result.success) {
        setAnalysisComplete(true);
        console.log('Analysis request sent successfully:', result.data);
      } else {
        throw new Error(result.error || 'Failed to send analysis request');
      }
    } catch (error) {
      console.error('Error sending analysis request:', error);
      alert('Failed to send analysis request. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="google-ai-overview" className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12 px-4">
          Advanced Content Analysis Tools
        </h2>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
          Get detailed insights about your content performance and discover opportunities for optimization.
        </p>

        {/* User Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-card-background rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label htmlFor="keyword" className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Target Keyword
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="input-primary"
                  placeholder="Enter your target keyword..."
                  required
                />
              </div>

              <div>
                <label htmlFor="userUrl" className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Your Page URL
                </label>
                <input
                  type="url"
                  id="userUrl"
                  value={userUrl}
                  onChange={(e) => setUserUrl(e.target.value)}
                  className="input-primary"
                  placeholder="https://yourwebsite.com/page"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !keyword.trim() || !userUrl.trim()}
                className="btn-primary w-full"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze'
                )}
              </button>

              {analysisComplete && (
                <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
                  <p className="text-success text-center font-medium">
                    ✅ Analysis request sent successfully! Results will be processed shortly.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Mobile-First Responsive Grid - All Four Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Similarity Score Card */}
          <div className="bg-card-background rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
              Similarity Score
            </h3>
            <div className="flex justify-center">
              <CircularProgress percentage={86} />
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-card-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white p-6 md:p-8 pb-4">
              Actionable Recommendations
            </h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recommendations.map((item, index) => (
                <AccordionItem
                  key={index}
                  title={item.title}
                  content={item.content}
                  isOpen={openAccordion === index}
                  onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                />
              ))}
            </div>
          </div>

          {/* Top AI Overview Snippet Card */}
          <div className="bg-card-background rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Top AI Overview Snippet
            </h3>
            <div className="text-blue-600 dark:text-blue-400 mb-2 text-sm md:text-base break-all">
              https://example.com/best-overview
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
              "Experience the perfect blend of adventure and relaxation at our mountain retreat. 
              Visitors can enjoy hiking trails suitable for all skill levels, with guided tours 
              available daily. Our location offers stunning views of the surrounding peaks..."
            </p>
          </div>

          {/* Your Page Snippet Card */}
          <div className="bg-card-background rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Page Snippet
            </h3>
            <div className="text-blue-600 dark:text-blue-400 mb-2 text-sm md:text-base break-all">
              https://yoursite.com/location-overview
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
              "Our mountain location provides a great escape from the city. We have hiking trails 
              and offer tours. The views are beautiful and there's plenty to do during your stay..."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};