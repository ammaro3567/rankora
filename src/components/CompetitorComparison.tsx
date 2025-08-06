import React, { useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { analyzeUserArticle, analyzeCompetitorArticle } from '../config/webhooks';

interface AnalysisResult {
  readability: number;
  factuality: number;
  structure: number;
  suggestions?: string[];
}

interface ComparisonData {
  userArticle: AnalysisResult | null;
  competitorArticle: AnalysisResult | null;
  suggestions: string[];
}

const ScoreCard: React.FC<{ 
  title: string; 
  userScore: number; 
  competitorScore: number;
  description: string;
}> = ({ title, userScore, competitorScore, description }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getComparisonIcon = () => {
    if (userScore > competitorScore) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (userScore < competitorScore) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {getComparisonIcon()}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-lg border-2 ${getScoreBg(userScore)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(userScore)} mb-1`}>
              {userScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Your Article</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${getScoreBg(competitorScore)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(competitorScore)} mb-1`}>
              {competitorScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Competitor</div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export const CompetitorComparison: React.FC = () => {
  const [userUrl, setUserUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userUrl.trim() || !competitorUrl.trim()) {
      setError('Please fill in both URL fields');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Analyze both articles in parallel
      const [userResult, competitorResult] = await Promise.all([
        analyzeUserArticle(userUrl.trim()),
        analyzeCompetitorArticle(competitorUrl.trim())
      ]);

      if (!userResult.success) {
        throw new Error(`Failed to analyze your article: ${userResult.error}`);
      }

      if (!competitorResult.success) {
        throw new Error(`Failed to analyze competitor article: ${competitorResult.error}`);
      }

      // Mock data for demonstration - replace with actual webhook response structure
      const mockUserData: AnalysisResult = {
        readability: Math.floor(Math.random() * 40) + 60,
        factuality: Math.floor(Math.random() * 40) + 60,
        structure: Math.floor(Math.random() * 40) + 60,
      };

      const mockCompetitorData: AnalysisResult = {
        readability: Math.floor(Math.random() * 40) + 60,
        factuality: Math.floor(Math.random() * 40) + 60,
        structure: Math.floor(Math.random() * 40) + 60,
      };

      // Generate AI suggestions based on comparison
      const suggestions = [
        "Restructure content with clear H2/H3 subheadings to improve scannability and AI overview selection",
        "Add authoritative citations and recent statistics to boost credibility and factual accuracy",
        "Include FAQ sections and direct question-answer formats that AI overviews prefer",
        "Optimize for featured snippet formats with numbered lists and step-by-step guides",
        "Enhance content freshness with updated data and current industry insights"
      ];

      setComparisonData({
        userArticle: mockUserData,
        competitorArticle: mockCompetitorData,
        suggestions: suggestions
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="competitor-comparison" className="py-16 bg-section-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50">
        <div className="absolute top-32 right-16 w-40 h-40 bg-primary-cta/5 rounded-full blur-3xl animate-floating-shapes"></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 bg-primary-cta/3 rounded-full blur-3xl animate-bounce-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-primary-cta/8 rounded-lg rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-primary-cta/6 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-accent-light border border-border-color rounded-full text-primary-cta text-lg font-semibold">
              ⚔️ Competitive Analysis
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
            Compare Your Content with{' '}
            <span className="block text-primary-cta mt-2">
              Any Competitor
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
            Get instant insights with side-by-side analysis, competitive intelligence, and AI-powered strategies.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card-background border border-border-color rounded-xl p-6 md:p-8 shadow-sm">
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-4">Start Your Competitive Analysis</h3>
              <p className="text-text-secondary">Enter two URLs to get instant AI-powered comparison insights</p>
            </div>
            <form onSubmit={handleCompare} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="userUrl" className="block text-lg font-semibold text-text-primary mb-3">
                    Your Article URL
                  </label>
                  <input
                    type="url"
                    id="userUrl"
                    value={userUrl}
                    onChange={(e) => setUserUrl(e.target.value)}
                    className="w-full px-4 py-4 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                    placeholder="https://yourwebsite.com/article"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="competitorUrl" className="block text-lg font-semibold text-text-primary mb-3">
                    Competitor's URL
                  </label>
                  <input
                    type="url"
                    id="competitorUrl"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    className="w-full px-4 py-4 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                    placeholder="https://competitor.com/article"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isAnalyzing || !userUrl.trim() || !competitorUrl.trim()}
                  className="bg-primary-cta hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg text-lg animate-gentle-glow hover:animate-pulse-border"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Compare Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Comparison Results */}
        {comparisonData && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Score Comparison Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <ScoreCard
                title="Readability"
                userScore={comparisonData.userArticle!.readability}
                competitorScore={comparisonData.competitorArticle!.readability}
                description="How easy your content is to read and understand"
              />
              <ScoreCard
                title="Factuality"
                userScore={comparisonData.userArticle!.factuality}
                competitorScore={comparisonData.competitorArticle!.factuality}
                description="Accuracy and credibility of your content claims"
              />
              <ScoreCard
                title="Structure"
                userScore={comparisonData.userArticle!.structure}
                competitorScore={comparisonData.competitorArticle!.structure}
                description="Organization and logical flow of your content"
              />
            </div>

            {/* AI Suggestions */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 md:p-8 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Powered Suggestions to Beat the Competitor
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {comparisonData.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};