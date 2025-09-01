import React, { useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus, Lightbulb, Target, Search, AlertCircle, CheckCircle, XCircle, BarChart3, Folder } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { saveUserComparison, listProjects, createProject, saveAnalysisToProject, supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { evaluateAnalysisAllowance, evaluateComparisonAllowance, consumeIfGuest } from '../utils/limits';
import { analyzeComparison, analyzeKeywordComparison } from '../config/webhooks';
import { handleError } from '../utils/error-handler';

interface AnalysisResult {
  readability: number;
  factuality: number;
  structure: number;
  qa_format: number;
  structured_data: number;
  authority: number;
}

interface ComparisonData {
  userArticle: AnalysisResult | null;
  competitorArticle: AnalysisResult | null;
  suggestions: string[];
  quickWins?: string[];
  overallUserReadinessScore?: number;
  seoOpportunityScore?: number;
}

interface KeywordAnalysisResult {
  keyword: string;
  missing_topics: string[];
  missing_entities: string[];
  content_gaps: string[];
  seo_opportunities: string[];
}

const ScoreCard: React.FC<{ 
  title: string; 
  userScore: number; 
  competitorScore: number;
  description: string;
}> = ({ title, userScore, competitorScore, description }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getComparisonIcon = () => {
    if (userScore > competitorScore) return <TrendingUp className="w-5 h-5 text-success" />;
    if (userScore < competitorScore) return <TrendingDown className="w-5 h-5 text-error" />;
    return <Minus className="w-5 h-5 text-tertiary" />;
  };

  const difference = userScore - competitorScore;

  return (
    <div className="card hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <div className="flex items-center space-x-2">
          {getComparisonIcon()}
          <span className={`text-sm font-medium ${
            difference > 0 ? 'text-success' : difference < 0 ? 'text-error' : 'text-tertiary'
          }`}>
            {difference > 0 ? '+' : ''}{difference}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 surface-secondary rounded-lg border-l-4 border-accent-primary">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(userScore)} mb-1`}>
              {userScore}
            </div>
            <div className="text-sm text-secondary">Your Article</div>
          </div>
        </div>
        
        <div className="p-4 surface-secondary rounded-lg border-l-4 border-tertiary">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(competitorScore)} mb-1`}>
              {competitorScore}
            </div>
            <div className="text-sm text-secondary">Competitor</div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-tertiary">{description}</p>
    </div>
  );
};

// Helper function to validate analysis scores
const hasValidAnalysisScores = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['readability', 'factuality', 'structure', 'qa_format', 'structured_data', 'authority'];
  const hasRequiredFields = requiredFields.every(field => field in data);
  
  if (!hasRequiredFields) return false;
  
  // Check if at least one score is greater than 0
  const hasValidScores = requiredFields.some(field => {
    const score = Number(data[field]);
    return !isNaN(score) && score > 0;
  });
  
  return hasValidScores;
};

// Helper function to validate keyword analysis data
const hasValidKeywordAnalysisData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Check if we have at least one meaningful result
  const hasMissingTopics = Array.isArray(data.missing_topics) && data.missing_topics.length > 0;
  const hasMissingEntities = Array.isArray(data.missing_entities) && data.missing_entities.length > 0;
  const hasContentGaps = Array.isArray(data.content_gaps) && data.content_gaps.length > 0;
  const hasSeoOpportunities = Array.isArray(data.seo_opportunities) && data.seo_opportunities.length > 0;
  
  // At least one category should have meaningful data
  return hasMissingTopics || hasMissingEntities || hasContentGaps || hasSeoOpportunities;
};

// Helper function to convert values to numbers safely
const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Helper function to normalize analysis data
const normalize = (data: any): AnalysisResult => {
  return {
    readability: toNumber(data.readability),
    factuality: toNumber(data.factuality),
    structure: toNumber(data.structure),
    qa_format: toNumber(data.qa_format),
    structured_data: toNumber(data.structured_data),
    authority: toNumber(data.authority)
  };
};

export const CompetitorComparison: React.FC = () => {
  const { user } = useUser();
  const [userUrl, setUserUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowInfo, setAllowInfo] = useState<{ canProceed: boolean; remaining: number; limit?: number } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'new' | ''>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdComparisonAnalysisId, setCreatedComparisonAnalysisId] = useState<number | null>(null);
  
  // New state for analysis type toggle
  const [analysisType, setAnalysisType] = useState<'comparison' | 'keyword'>('comparison');
  const [keyword, setKeyword] = useState('');
  const [keywordAnalysisResult, setKeywordAnalysisResult] = useState<KeywordAnalysisResult | null>(null);

  React.useEffect(() => {
    (async () => {
      if (user?.id) {
        const a = await evaluateComparisonAllowance(user.id);
        setAllowInfo({ canProceed: a.canProceed, remaining: a.remaining || 0, limit: a.limit });
      }
    })();
  }, [user?.id]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (analysisType === 'comparison') {
      if (!userUrl.trim() || !competitorUrl.trim()) {
        setError('Please fill in both URL fields');
        return;
      }
    } else {
      if (!userUrl.trim() || !keyword.trim()) {
        setError('Please fill in both URL and keyword fields');
        return;
      }
    }

    if (!user?.id) {
      setError('Please sign in to use this feature');
      return;
    }

    // Check limits before proceeding
    if (user) {
      if (analysisType === 'comparison') {
        const comparisonAllowance = await evaluateComparisonAllowance(user.id);
        if (!comparisonAllowance.canProceed) {
          setError(`Monthly comparison limit reached (${comparisonAllowance.limit} per month). Please upgrade your plan.`);
          setIsAnalyzing(false);
          return;
        }
        setAllowInfo({ 
          canProceed: comparisonAllowance.canProceed || false, 
          remaining: comparisonAllowance.remaining || 0, 
          limit: comparisonAllowance.limit 
        });
      } else {
        // For keyword analysis, check analysis limits
        const analysisAllowance = await evaluateAnalysisAllowance(user.id);
        if (!analysisAllowance.canProceed) {
          setError(`Monthly analysis limit reached (${analysisAllowance.limit} per month). Please upgrade your plan.`);
          setIsAnalyzing(false);
          return;
        }
        setAllowInfo({ 
          canProceed: analysisAllowance.canProceed, 
          remaining: analysisAllowance.remaining || 0, 
          limit: analysisAllowance.limit 
        });
      }
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (analysisType === 'comparison') {
        // Regular comparison analysis
        const response = await analyzeComparison({
          userUrl: userUrl.trim(),
          competitorUrl: competitorUrl.trim()
        });

        if (!response.success) throw new Error(response.error || 'Comparison webhook failed');

        // Validate that we have meaningful comparison data
        const payload: any = response.data || {};
        if (!payload || (Array.isArray(payload) && payload.length === 0)) {
          throw new Error('No comparison data received');
        }

        // Check if we have valid scores for both articles
        const hasValidComparisonData = Array.isArray(payload) 
          ? payload.length >= 2 && payload.every(item => item && hasValidAnalysisScores(item))
          : payload.user && payload.competitor && hasValidAnalysisScores(payload.user) && hasValidAnalysisScores(payload.competitor);

        if (!hasValidComparisonData) {
          throw new Error('Invalid comparison data: missing or invalid scores');
        }
        const normalize = (obj: any): AnalysisResult => {
          const item = Array.isArray(obj) ? (obj[0] || {}) : (obj || {});
          const toNumber = (v: any) => {
            const n = typeof v === 'string' ? parseFloat(v) : Number(v);
            return Number.isFinite(n) ? n : 0;
          };
          return {
            readability: toNumber(item.readability),
            factuality: toNumber(item.factuality),
            structure: toNumber(item.structure),
            qa_format: toNumber(item.qa_format),
            structured_data: toNumber(item.structured_data),
            authority: toNumber(item.authority)
          };
        };

        let userData: AnalysisResult;
        let compData: AnalysisResult;
        let suggestions: string[] = [];
        let quickWins: string[] = [];
        let overallUserReadinessScore: number | undefined;
        let seoOpportunityScore: number | undefined;

        if (Array.isArray(payload) && payload.length >= 1 && (payload[0]?.user_analysis || payload[0]?.competitor_analysis || payload[0]?.['User Analysis'] || payload[0]?.['Competitor Analysis'])) {
          const entry = payload[0] || {};
          const userBlock = entry.user_analysis ?? entry['User Analysis'] ?? {};
          const competitorBlock = entry.competitor_analysis ?? entry['Competitor Analysis'] ?? {};
          userData = normalize(userBlock);
          compData = normalize(competitorBlock);
          suggestions = Array.isArray(entry.competitive_suggestions) ? entry.competitive_suggestions : [];
          quickWins = Array.isArray(entry.quick_wins) ? entry.quick_wins : [];
          const toNumber = (v: any) => {
            const n = typeof v === 'string' ? parseFloat(v) : Number(v);
            return Number.isFinite(n) ? n : undefined;
          };
          overallUserReadinessScore = toNumber(entry.overall_user_readiness_score);
          seoOpportunityScore = toNumber(entry.seo_opportunity_score);
        } else if (Array.isArray(payload) && payload.length >= 2) {
          const primary = payload[0] || {};
          const secondary = payload[1] || {};
          userData = normalize(primary);
          compData = normalize(secondary);
          const s1 = Array.isArray(primary.suggestions) ? primary.suggestions : [];
          const s2 = Array.isArray(secondary.suggestions) ? secondary.suggestions : [];
          suggestions = [...s1, ...s2];
        } else {
          userData = normalize(payload.user ?? payload.userArticle ?? payload.user_result ?? payload);
          compData = normalize(payload.competitor ?? payload.competitorArticle ?? payload.competitor_result ?? payload);
          suggestions = Array.isArray(payload.suggestions) ? payload.suggestions : [];
        }

        const data: ComparisonData = {
          userArticle: userData,
          competitorArticle: compData,
          suggestions,
          quickWins,
          overallUserReadinessScore,
          seoOpportunityScore
        };

        setComparisonData(data);
        setKeywordAnalysisResult(null);
      } else {
        // Keyword analysis
        const response = await analyzeKeywordComparison({
          url: userUrl.trim(),
          keyword: keyword.trim()
        });

        if (!response.success) {
          throw new Error(response.error || 'Keyword analysis failed');
        }

        // Validate keyword analysis data
        const keywordData = response.data;
        if (!keywordData || !hasValidKeywordAnalysisData(keywordData)) {
          throw new Error('Invalid keyword analysis data: missing or invalid content');
        }

        setKeywordAnalysisResult(keywordData);
        setComparisonData(null);
        
        console.log('🔍 [DEBUG] keywordAnalysisResult set to:', response.data);

        // Only save keyword analysis if we have valid data
        if (user && hasValidKeywordAnalysisData(keywordData)) {
          try {
            // For keyword analysis, we'll use the keyword as a "competitor" to work around the NOT NULL constraint
            const savedKeywordAnalysis = await saveUserComparison({
            userUrl: userUrl.trim(),
            competitorUrl: `keyword:${keyword.trim()}`, // Use keyword as competitor URL to satisfy NOT NULL constraint
            comparison_results: {
              keyword: keyword.trim(),
              analysis_type: 'keyword',
              missing_topics: response.data?.missing_topics || [],
              missing_entities: response.data?.missing_entities || [],
              content_gaps: response.data?.content_gaps || [],
              seo_opportunities: response.data?.seo_opportunities || []
            }
          });

          if (savedKeywordAnalysis) {
            console.log('✅ Keyword analysis saved to database:', savedKeywordAnalysis);
            setCreatedComparisonAnalysisId(typeof savedKeywordAnalysis === 'number' ? savedKeywordAnalysis : Number(savedKeywordAnalysis));
            
            // Dispatch event to update Dashboard
            window.dispatchEvent(new CustomEvent('comparison-completed'));
            
            // Refresh local allowance banner to reflect new usage
            try {
              const a2 = await evaluateComparisonAllowance(user.id);
              setAllowInfo({ canProceed: a2.canProceed || false, remaining: a2.remaining || 0, limit: a2.limit });
            } catch {}
          }
        } catch (saveError) {
          console.error('❌ Failed to save keyword analysis:', saveError);
          // Don't throw error here, just log it - the analysis still worked
        }
      }

      console.log('✅ Analysis completed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Chart data for comparison results
  const chartData = comparisonData ? [
    {
      metric: 'Readability',
      yours: comparisonData.userArticle?.readability || 0,
      competitor: comparisonData.competitorArticle?.readability || 0,
      fullMark: 100,
    },
    {
      metric: 'Factuality',
      yours: comparisonData.userArticle?.factuality || 0,
      competitor: comparisonData.competitorArticle?.factuality || 0,
      fullMark: 100,
    },
    {
      metric: 'Structure',
      yours: comparisonData.userArticle?.structure || 0,
      competitor: comparisonData.competitorArticle?.structure || 0,
      fullMark: 100,
    },
    {
      metric: 'Q&A Format',
      yours: comparisonData.userArticle?.qa_format || 0,
      competitor: comparisonData.competitorArticle?.qa_format || 0,
      fullMark: 100,
    },
    {
      metric: 'Structured Data',
      yours: comparisonData.userArticle?.structured_data || 0,
      competitor: comparisonData.competitorArticle?.structured_data || 0,
      fullMark: 100,
    },
    {
      metric: 'Authority',
      yours: comparisonData.userArticle?.authority || 0,
      competitor: comparisonData.competitorArticle?.authority || 0,
      fullMark: 100,
    },
  ] : [];

  // Radar chart data
  const radarData = comparisonData ? [
    {
      subject: 'Readability',
      yours: comparisonData.userArticle?.readability || 0,
      competitor: comparisonData.competitorArticle?.readability || 0,
      fullMark: 100,
    },
    {
      subject: 'Factuality',
      yours: comparisonData.userArticle?.factuality || 0,
      competitor: comparisonData.competitorArticle?.factuality || 0,
      fullMark: 100,
    },
    {
      subject: 'Structure',
      yours: comparisonData.userArticle?.structure || 0,
      competitor: comparisonData.competitorArticle?.structure || 0,
      fullMark: 100,
    },
    {
      subject: 'Q&A Format',
      yours: comparisonData.userArticle?.qa_format || 0,
      competitor: comparisonData.competitorArticle?.qa_format || 0,
      fullMark: 100,
    },
    {
      subject: 'Structured Data',
      yours: comparisonData.userArticle?.structured_data || 0,
      competitor: comparisonData.competitorArticle?.structured_data || 0,
      fullMark: 100,
    },
    {
      subject: 'Authority',
      yours: comparisonData.userArticle?.authority || 0,
      competitor: comparisonData.competitorArticle?.authority || 0,
      fullMark: 100,
    },
  ] : [];

  const overallScore = comparisonData ? Math.round((
    (comparisonData.userArticle?.readability || 0) +
    (comparisonData.userArticle?.factuality || 0) +
    (comparisonData.userArticle?.structure || 0) +
    (comparisonData.userArticle?.qa_format || 0) +
    (comparisonData.userArticle?.structured_data || 0) +
    (comparisonData.userArticle?.authority || 0)
  ) / 6) : 0;

  const overallCompetitorScore = comparisonData ? Math.round((
    (comparisonData.competitorArticle?.readability || 0) +
    (comparisonData.competitorArticle?.factuality || 0) +
    (comparisonData.competitorArticle?.structure || 0) +
    (comparisonData.competitorArticle?.qa_format || 0) +
    (comparisonData.competitorArticle?.structured_data || 0) +
    (comparisonData.competitorArticle?.authority || 0)
  ) / 6) : 0;

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-3xl border border-emerald-500/40 shadow-2xl mb-6">
          <TrendingUp className="w-10 h-10 text-emerald-300" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-4">
          Competitor Analysis
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Compare your content with competitors and discover opportunities to outperform them.
        </p>
      </div>

      {/* Enhanced Analysis Type Toggle */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-2 shadow-2xl">
          <div className="flex space-x-2">
            {[
              { id: 'comparison', label: 'URL Comparison', icon: TrendingUp, description: 'Compare two URLs directly' },
              { id: 'keyword', label: 'Keyword Analysis', icon: Target, description: 'Analyze URL against keyword' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setAnalysisType(type.id as 'comparison' | 'keyword')}
                className={`flex-1 flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  analysisType === type.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <type.icon className="w-6 h-6" />
                <span className="font-semibold">{type.label}</span>
                <span className="text-xs opacity-80">{type.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-level Scores for Comparison */}
      {analysisType === 'comparison' && comparisonData?.overallUserReadinessScore !== undefined || comparisonData?.seoOpportunityScore !== undefined ? (
        <div className="grid md:grid-cols-2 gap-6">
          {comparisonData?.overallUserReadinessScore !== undefined && (
            <div className="card text-center">
              <h4 className="text-lg font-semibold text-primary mb-2">Overall User Readiness</h4>
              <div className="text-4xl font-bold text-accent-primary">{comparisonData.overallUserReadinessScore}</div>
            </div>
          )}
          {comparisonData?.seoOpportunityScore !== undefined && (
            <div className="card text-center">
              <h4 className="text-lg font-semibold text-primary mb-2">SEO Opportunity</h4>
              <div className="text-4xl font-bold text-info">{comparisonData.seoOpportunityScore}</div>
            </div>
          )}
        </div>
      ) : null}

      {/* Input Form */}
      <div className="max-w-5xl mx-auto animate-scaleIn">
        <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-2xl border border-emerald-500/40 shadow-xl mb-6">
              {analysisType === 'comparison' ? (
                <Target className="w-8 h-8 text-emerald-300" />
              ) : (
                <Search className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-4">
              {analysisType === 'comparison' ? 'Start Your Competitive Analysis' : 'Analyze Content Against Keyword'}
            </h3>
            <p className="text-lg text-emerald-200/80 max-w-2xl mx-auto">
              {analysisType === 'comparison' 
                ? 'Enter two URLs to get instant AI-powered comparison insights and competitive advantages'
                : 'Enter your URL and target keyword to identify content gaps, missing topics, and SEO opportunities'
              }
            </p>
          </div>
          
          <form onSubmit={handleCompare} className="space-y-8">
            {analysisType === 'comparison' ? (
              // Comparison form
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label htmlFor="userUrl" className="block text-lg font-semibold text-emerald-200 mb-3">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Your Article URL</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="userUrl"
                      value={userUrl}
                      onChange={(e) => setUserUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-800/50 border border-emerald-500/30 rounded-2xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-lg shadow-lg"
                      placeholder="https://yourwebsite.com/article"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="competitorUrl" className="block text-lg font-semibold text-emerald-200 mb-3">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Competitor's URL</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="competitorUrl"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-800/50 border border-emerald-500/30 rounded-2xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-lg shadow-lg"
                      placeholder="https://competitor.com/article"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>
            ) : (
              // Keyword analysis form
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label htmlFor="userUrl" className="block text-lg font-semibold text-emerald-200 mb-3">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Website URL</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="userUrl"
                      value={userUrl}
                      onChange={(e) => setUserUrl(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-800/50 border border-emerald-500/30 rounded-2xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-lg shadow-lg"
                      placeholder="https://yourwebsite.com/article"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="keyword" className="block text-lg font-semibold text-emerald-200 mb-3">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Target Keyword</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-800/50 border border-emerald-500/30 rounded-2xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-lg shadow-lg"
                      placeholder="e.g., health, fitness, technology"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-500/10 border border-red-500/30 rounded-2xl">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-200 text-center font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isAnalyzing || 
                  (analysisType === 'comparison' ? (!userUrl.trim() || !competitorUrl.trim()) : (!userUrl.trim() || !keyword.trim())) || 
                  (allowInfo && allowInfo.canProceed === false)}
                className="relative group px-12 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {isAnalyzing ? (
                    <>
                      <div className="loading-spinner w-6 h-6" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      {analysisType === 'comparison' ? (
                        <>
                          <Target className="w-6 h-6" />
                          <span>Compare Now</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-6 h-6" />
                          <span>Analyze Content</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Allowance banner */}
      {allowInfo && (
        <div className={`max-w-4xl mx-auto mb-8 ${
          allowInfo.canProceed === true 
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-600/10 to-emerald-700/10 border-emerald-500/30' 
            : 'bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-700/10 border-red-500/30'
        } border rounded-2xl p-6 text-center shadow-2xl`}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              allowInfo.canProceed === true 
                ? 'bg-emerald-500/20 border border-emerald-500/40' 
                : 'bg-red-500/20 border border-red-500/40'
            }`}>
              <Target className={`w-5 h-5 ${
                allowInfo.canProceed === true ? 'text-emerald-400' : 'text-red-400'
              }`} />
            </div>
            <span className={`font-semibold text-lg ${
              allowInfo.canProceed === true ? 'text-emerald-200' : 'text-red-200'
            }`}>
              Monthly Comparison Usage
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className={`text-center p-4 rounded-xl border ${
              allowInfo.canProceed === true 
                ? 'bg-emerald-500/20 border-emerald-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                allowInfo.canProceed === true ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {allowInfo.remaining}
              </div>
              <div className={`text-sm ${
                allowInfo.canProceed === true ? 'text-emerald-200' : 'text-red-200'
              }`}>
                Remaining
              </div>
            </div>
            
            <div className={`text-center p-4 rounded-xl border ${
              allowInfo.canProceed === true 
                ? 'bg-emerald-500/20 border-emerald-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                allowInfo.canProceed === true ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {allowInfo.limit || '∞'}
              </div>
              <div className={`text-sm ${
                allowInfo.canProceed === true ? 'text-emerald-200' : 'text-red-200'
              }`}>
                Total Limit
              </div>
            </div>
          </div>
          
          {allowInfo.limit && (
            <div className="mb-4">
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    allowInfo.canProceed === true 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, ((allowInfo.limit - allowInfo.remaining) / allowInfo.limit) * 100))}%` 
                  }}
                ></div>
              </div>
              <div className={`text-sm mt-2 ${
                allowInfo.canProceed === true ? 'text-emerald-200' : 'text-red-200'
              }`}>
                {allowInfo.limit - allowInfo.remaining} of {allowInfo.limit} used
              </div>
            </div>
          )}
          
          {allowInfo.canProceed === false && (
            <div className="mt-4 p-4 bg-red-500/20 rounded-xl border border-red-500/30">
              <div className="text-red-200 text-sm font-medium mb-3">
                Monthly comparison limit reached! Upgrade your plan for more comparisons.
              </div>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-pricing'))}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
              >
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Results */}
      {analysisType === 'comparison' && comparisonData && (
        <div className="space-y-8 animate-fadeInUp">
          {/* Score Comparison Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <ScoreCard
              title="Q&A Format"
              userScore={comparisonData.userArticle!.qa_format}
              competitorScore={comparisonData.competitorArticle!.qa_format}
              description="Question-answer optimization for AI overviews"
            />
            <ScoreCard
              title="Structured Data"
              userScore={comparisonData.userArticle!.structured_data}
              competitorScore={comparisonData.competitorArticle!.structured_data}
              description="Schema markup and rich snippets implementation"
            />
            <ScoreCard
              title="Authority"
              userScore={comparisonData.userArticle!.authority}
              competitorScore={comparisonData.competitorArticle!.authority}
              description="Domain and content authority signals"
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Bar Chart Comparison */}
            <div className="card">
              <h4 className="text-xl font-semibold text-primary mb-6">Side-by-Side Comparison</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="metric" 
                      tick={{ fill: '#b3b3b3', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#b3b3b3' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e1e', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="yours" fill="#3b82f6" name="Your Article" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="competitor" fill="#6b7280" name="Competitor" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="card">
              <h4 className="text-xl font-semibold text-primary mb-6">Performance Radar</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis tick={{ fill: '#b3b3b3', fontSize: 12 }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#b3b3b3', fontSize: 10 }}
                    />
                    <Radar
                      name="Your Article"
                      dataKey="yours"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Competitor"
                      dataKey="competitor"
                      stroke="#6b7280"
                      fill="#6b7280"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-br from-accent-primary/10 to-info/10 border border-accent-primary/30 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-accent-primary to-info rounded-lg mr-4">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                Competitive Suggestions
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {comparisonData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 surface-primary rounded-lg border border-border-primary animate-fadeInLeft"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-accent-primary to-info rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          {comparisonData.quickWins && comparisonData.quickWins.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">Quick Wins</h3>
              <div className="space-y-3">
                {comparisonData.quickWins.map((win, idx) => (
                  <div key={idx} className="p-4 surface-secondary rounded-lg border border-primary">
                    <div className="text-sm text-secondary">{win}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyword Analysis Results */}
      {analysisType === 'keyword' && keywordAnalysisResult && (
        <div className="space-y-8 animate-fadeInUp">
          {/* Summary Card */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary/30 to-info/30 rounded-xl flex items-center justify-center border border-accent-primary/40">
                <Target className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">Analysis Summary</h2>
                <p className="text-secondary">Keyword: <span className="text-accent-primary font-semibold">{keywordAnalysisResult?.keyword || 'N/A'}</span></p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 surface-secondary rounded-xl border border-accent-primary/20">
                <div className="text-3xl font-bold text-accent-primary mb-2">{keywordAnalysisResult?.missing_topics?.length || 0}</div>
                <div className="text-sm text-secondary">Missing Topics</div>
              </div>
              <div className="text-center p-4 surface-secondary rounded-xl border border-info/20">
                <div className="text-3xl font-bold text-info mb-2">{keywordAnalysisResult?.missing_entities?.length || 0}</div>
                <div className="text-sm text-secondary">Missing Entities</div>
              </div>
              <div className="text-center p-4 surface-secondary rounded-xl border border-warning/20">
                <div className="text-3xl font-bold text-warning mb-2">{keywordAnalysisResult?.seo_opportunities?.length || 0}</div>
                <div className="text-sm text-secondary">SEO Opportunities</div>
              </div>
            </div>
          </div>

          {/* Missing Topics */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-error/30 to-error/60 rounded-xl flex items-center justify-center border border-error/40">
                <XCircle className="w-5 h-5 text-error" />
              </div>
              <h3 className="text-xl font-bold text-primary">Missing Topics</h3>
            </div>
            <div className="space-y-3">
              {keywordAnalysisResult?.missing_topics?.map((topic, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 surface-secondary rounded-lg border border-error/20">
                  <div className="w-2 h-2 bg-error rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-secondary text-sm">{topic}</p>
                </div>
              )) || (
                <div className="text-center py-4 text-secondary">No missing topics found</div>
              )}
            </div>
          </div>

          {/* Missing Entities */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/30 to-warning/60 rounded-xl flex items-center justify-center border border-warning/40">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-primary">Missing Entities</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywordAnalysisResult?.missing_entities?.map((entity, index) => (
                <span key={index} className="px-3 py-2 bg-warning/20 border border-warning/30 rounded-lg text-warning text-sm">
                  {entity}
                </span>
              )) || (
                <div className="text-center py-4 text-secondary">No missing entities found</div>
              )}
            </div>
          </div>

          {/* Content Gaps */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/30 to-warning/60 rounded-xl flex items-center justify-center border border-warning/40">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-primary">Content Gaps</h3>
            </div>
            <div className="space-y-3">
              {keywordAnalysisResult?.content_gaps?.map((gap, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 surface-secondary rounded-lg border border-warning/20">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-secondary text-sm">{gap}</p>
                </div>
              )) || (
                <div className="text-center py-4 text-secondary">No content gaps found</div>
              )}
            </div>
          </div>

          {/* SEO Opportunities */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/30 to-accent-primary/60 rounded-xl flex items-center justify-center border border-accent-primary/40">
                <Lightbulb className="w-5 h-5 text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">SEO Opportunities</h3>
            </div>
            <div className="space-y-3">
              {keywordAnalysisResult?.seo_opportunities?.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 surface-secondary rounded-lg border border-accent-primary/20">
                  <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-secondary text-sm">{opportunity}</p>
                </div>
              )) || (
                <div className="text-center py-4 text-secondary">No SEO opportunities found</div>
              )}
            </div>
          </div>

          {/* Save to Project Button */}
          <div className="text-center pt-6">
            <button
              onClick={async () => {
                if (user) {
                  try {
                    const list = await listProjects();
                    setProjects(list);
                    setSelectedProjectId(list.length ? list[0].id : 'new');
                  } catch {}
                  setSaveOpen(true);
                }
              }}
              className="btn-primary px-8 py-3 text-lg"
            >
              <Folder className="w-5 h-5 mr-2" />
              Save to Project
            </button>
          </div>
        </div>
      )}

      {/* Save to project modal */}
      {saveOpen && comparisonData && (
        <div className="fixed inset-0 modal-backdrop z-[70]">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="card glass card-shadow max-w-md w-full relative animate-scaleIn">
              <button className="absolute top-3 right-3 text-secondary hover:text-primary" onClick={() => setSaveOpen(false)}>✕</button>
              <h4 className="text-xl font-semibold text-primary mb-4 text-center">Save comparison to a project</h4>
              {saveError && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm mb-3">{saveError}</div>
              )}
              <div className="space-y-3">
                <label className="text-sm text-secondary">Choose project</label>
                <select className="input-primary select-custom" value={String(selectedProjectId)} onChange={(e) => {
                  const v = e.target.value;
                  setSelectedProjectId(v === 'new' ? 'new' : Number(v));
                }}>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="new">Create new project</option>
                </select>
                {selectedProjectId === 'new' && (
                  <input className="input-primary" placeholder="New project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                )}
                <button
                  className={`btn-primary w-full ${saving ? 'opacity-70' : ''}`}
                  disabled={saving}
                  onClick={async () => {
                    setSaveError(null);
                    setSaving(true);
                    try {
                      let projectId: number | null = null;
                      if (selectedProjectId === 'new') {
                        if (!newProjectName.trim()) {
                          setSaveError('Please enter a project name');
                          setSaving(false);
                          return;
                        }
                        const created = await createProject({ name: newProjectName.trim(), description: '' });
                        if ((created as any)?.error) throw new Error((created as any).error.message);
                        const list = await listProjects();
                        setProjects(list);
                        projectId = list[0]?.id || null;
                      } else if (typeof selectedProjectId === 'number') {
                        projectId = selectedProjectId;
                      }
                      if (!projectId) throw new Error('Unable to resolve project');
                      
                      // Save keyword analysis data
                      if (createdComparisonAnalysisId) {
                        await saveAnalysisToProject(String(projectId), String(createdComparisonAnalysisId));
                        window.dispatchEvent(new CustomEvent('project-updated'));
                      } else {
                        try {
                          const summary = {
                            keyword: keywordAnalysisResult?.keyword || '',
                            missing_topics: keywordAnalysisResult?.missing_topics || [],
                            missing_entities: keywordAnalysisResult?.missing_entities || [],
                            content_gaps: keywordAnalysisResult?.content_gaps || [],
                            seo_opportunities: keywordAnalysisResult?.seo_opportunities || [],
                            analysis_type: 'keyword_analysis'
                          } as any;
                          const { data: createdId } = await supabase.rpc('create_analysis_with_limit_check', {
                            p_clerk_user_id: user!.id,
                            p_url: userUrl.trim() + ' (keyword analysis)',
                            p_analysis_results: summary,
                            p_project_id: Number(projectId)
                          });
                          if (typeof createdId === 'number') {
                            await saveAnalysisToProject(String(projectId), String(createdId));
                            window.dispatchEvent(new CustomEvent('project-updated'));
                          }
                        } catch {}
                      }
                      
                      setSaveOpen(false);
                    } catch (e: any) {
                      setSaveError(e?.message || 'Failed to save');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save to Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};