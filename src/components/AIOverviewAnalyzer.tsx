import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, BarChart3, FileText, HelpCircle, Database } from 'lucide-react';

interface AnalysisResult {
  readability: number;
  factuality: number;
  structure: number;
  qa_format: number;
  structured_data: number;
  authority: number;
  suggestions: string[];
}

export const AIOverviewAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock result
      const mockResult: AnalysisResult = {
        readability: Math.floor(Math.random() * 40) + 60,
        factuality: Math.floor(Math.random() * 40) + 60,
        structure: Math.floor(Math.random() * 40) + 60,
        qa_format: Math.floor(Math.random() * 40) + 60,
        structured_data: Math.floor(Math.random() * 40) + 60,
        authority: Math.floor(Math.random() * 40) + 60,
        suggestions: [
          "Add more structured data markup to improve AI overview selection",
          "Enhance content with FAQ sections for better question-answer format",
          "Include more authoritative citations and recent statistics",
          "Improve readability with shorter paragraphs and bullet points",
          "Optimize headings with clear, descriptive titles"
        ]
      };

      setResult(mockResult);
    } catch {
      setError('Failed to analyze the URL. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <section id="ai-overview-analyzer" className="py-16 bg-background-color relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50">
        <div className="absolute top-32 left-16 w-40 h-40 bg-primary-cta/5 rounded-full blur-3xl animate-floating-shapes"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-primary-cta/3 rounded-full blur-3xl animate-bounce-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-primary-cta/8 rounded-lg rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-cta/6 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        
        {/* Stars and Cosmic Elements */}
        <div className="absolute top-16 left-1/4 w-1 h-1 bg-yellow-400/60 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 right-1/4 w-2 h-2 bg-primary-cta/50 rounded-full animate-sparkle" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-blue-400/50 rounded-full animate-constellation" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-16 right-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-cosmic-drift" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 left-10 w-1 h-1 bg-emerald-400/50 rounded-full animate-twinkle" style={{animationDelay: '3.5s'}}></div>
        <div className="absolute top-2/3 right-12 w-1 h-1 bg-pink-400/60 rounded-full animate-sparkle" style={{animationDelay: '1.8s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-accent-light border border-border-color rounded-full text-primary-cta text-lg font-semibold">
              🎯 AI Overview Analysis
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
            Instantly Analyze Any Article for{' '}
            <span className="block text-primary-cta mt-2">
              Google's AI Overviews
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
            Get instant, AI-powered scores for readability, factuality, and structure to dominate search results.
          </p>
        </div>

        {/* Key Metrics Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 hover:shadow-lg transition-all duration-300 animate-glow-pulse hover:scale-105" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-500 animate-twinkle" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Readability</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg px-4 py-3 hover:shadow-lg transition-all duration-300 animate-glow-pulse hover:scale-105" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-500 animate-sparkle" style={{animationDelay: '1s'}} />
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Factuality</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg px-4 py-3 hover:shadow-lg transition-all duration-300 animate-glow-pulse hover:scale-105" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-500 animate-constellation" style={{animationDelay: '2s'}} />
              <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">Structure</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg px-4 py-3 hover:shadow-lg transition-all duration-300 animate-glow-pulse hover:scale-105" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-orange-500 animate-cosmic-drift" style={{animationDelay: '3s'}} />
              <span className="text-orange-600 dark:text-orange-400 font-medium text-sm">Q&A Format</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg px-4 py-3 hover:shadow-lg transition-all duration-300 animate-glow-pulse hover:scale-105" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-500 animate-drift" style={{animationDelay: '4s'}} />
              <span className="text-cyan-600 dark:text-cyan-400 font-medium text-sm">Structured Data</span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-card-background border border-border-color rounded-xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label htmlFor="analyzeUrl" className="block text-lg font-semibold text-text-primary mb-3">
                  Article URL to Analyze
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="analyzeUrl"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-accent-light border border-border-color rounded-lg focus:ring-2 focus:ring-primary-cta focus:border-primary-cta outline-none transition-all duration-200 text-text-primary placeholder-text-secondary"
                    placeholder="https://example.com/your-article"
                    required
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
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
                    disabled={isAnalyzing || !url.trim()}
                    className="bg-primary-cta hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg text-lg animate-gentle-glow hover:animate-pulse-border"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Analyze Now'
                    )}
                  </button>
                </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="bg-card-background border border-gray-200 dark:border-gray-600 rounded-xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                AI Overview Readiness Score
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {/* Readability */}
                <div className={`p-4 rounded-lg border-2 ${getScoreBg(result.readability)} hover:scale-105 transition-all duration-300 animate-glow-pulse`}>
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-emerald-500 animate-twinkle" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Readability</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(result.readability)} mb-1`}>
                      {result.readability}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {result.readability >= 80 ? 'Excellent' : result.readability >= 60 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                </div>

                {/* Factuality */}
                <div className={`p-4 rounded-lg border-2 ${getScoreBg(result.factuality)} hover:scale-105 transition-all duration-300 animate-glow-pulse`}>
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-500 animate-sparkle" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Factuality</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(result.factuality)} mb-1`}>
                      {result.factuality}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {result.factuality >= 80 ? 'Highly Accurate' : result.factuality >= 60 ? 'Mostly Accurate' : 'Needs Verification'}
                    </div>
                  </div>
                </div>

                {/* Structure */}
                <div className={`p-4 rounded-lg border-2 ${getScoreBg(result.structure)} hover:scale-105 transition-all duration-300 animate-glow-pulse`}>
                  <div className="text-center">
                    <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-500 animate-constellation" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Structure</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(result.structure)} mb-1`}>
                      {result.structure}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {result.structure >= 80 ? 'Well Organized' : result.structure >= 60 ? 'Good Structure' : 'Needs Organization'}
                    </div>
                  </div>
                </div>

                {/* Q&A Format */}
                <div className={`p-4 rounded-lg border-2 ${getScoreBg(result.qa_format)} hover:scale-105 transition-all duration-300 animate-glow-pulse`}>
                  <div className="text-center">
                    <HelpCircle className="w-6 h-6 mx-auto mb-2 text-orange-500 animate-cosmic-drift" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Q&A Format</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(result.qa_format)} mb-1`}>
                      {result.qa_format}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {result.qa_format >= 80 ? 'Perfect Q&A' : result.qa_format >= 60 ? 'Good Q&A' : 'Add Q&A'}
                    </div>
                  </div>
                </div>

                {/* Structured Data */}
                <div className={`p-4 rounded-lg border-2 ${getScoreBg(result.structured_data)} hover:scale-105 transition-all duration-300 animate-glow-pulse`}>
                  <div className="text-center">
                    <Database className="w-6 h-6 mx-auto mb-2 text-cyan-500 animate-drift" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Structured Data</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(result.structured_data)} mb-1`}>
                      {result.structured_data}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {result.structured_data >= 80 ? 'Rich Schema' : result.structured_data >= 60 ? 'Good Schema' : 'Add Schema'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gray-100 dark:bg-gray-700 rounded-xl p-6 animate-pulse-glow">
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Overall AI Overview Score</h4>
                  <div className={`text-5xl font-bold ${getScoreColor(Math.round((result.readability + result.factuality + result.structure + result.qa_format + result.structured_data + result.authority) / 6))}`}>
                    {Math.round((result.readability + result.factuality + result.structure + result.qa_format + result.structured_data + result.authority) / 6)}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-text-primary mb-4">Recommendations for AI Overview Optimization</h4>
                <ul className="space-y-3">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-3 animate-fade-in-left" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-cta rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-text-secondary leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};