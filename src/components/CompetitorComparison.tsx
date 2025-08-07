import React, { useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus, Lightbulb, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

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
      // Simulate API call - replace with actual webhook calls
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockUserData: AnalysisResult = {
        readability: Math.floor(Math.random() * 40) + 60,
        factuality: Math.floor(Math.random() * 40) + 60,
        structure: Math.floor(Math.random() * 40) + 60,
        qa_format: Math.floor(Math.random() * 40) + 60,
        structured_data: Math.floor(Math.random() * 40) + 60,
        authority: Math.floor(Math.random() * 40) + 60,
      };

      const mockCompetitorData: AnalysisResult = {
        readability: Math.floor(Math.random() * 40) + 60,
        factuality: Math.floor(Math.random() * 40) + 60,
        structure: Math.floor(Math.random() * 40) + 60,
        qa_format: Math.floor(Math.random() * 40) + 60,
        structured_data: Math.floor(Math.random() * 40) + 60,
        authority: Math.floor(Math.random() * 40) + 60,
      };

      const suggestions = [
        "Restructure content with clear H2/H3 subheadings to improve scannability",
        "Add authoritative citations and recent statistics to boost credibility",
        "Include FAQ sections and direct question-answer formats",
        "Optimize for featured snippet formats with numbered lists",
        "Enhance content freshness with updated data and insights"
      ];

      setComparisonData({
        userArticle: mockUserData,
        competitorArticle: mockCompetitorData,
        suggestions: suggestions
      });

    } catch (err) {
      setError('An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = comparisonData ? [
    {
      metric: 'Readability',
      yours: comparisonData.userArticle!.readability,
      competitor: comparisonData.competitorArticle!.readability,
    },
    {
      metric: 'Factuality',
      yours: comparisonData.userArticle!.factuality,
      competitor: comparisonData.competitorArticle!.factuality,
    },
    {
      metric: 'Structure',
      yours: comparisonData.userArticle!.structure,
      competitor: comparisonData.competitorArticle!.structure,
    },
    {
      metric: 'Q&A Format',
      yours: comparisonData.userArticle!.qa_format,
      competitor: comparisonData.competitorArticle!.qa_format,
    },
    {
      metric: 'Structured Data',
      yours: comparisonData.userArticle!.structured_data,
      competitor: comparisonData.competitorArticle!.structured_data,
    },
    {
      metric: 'Authority',
      yours: comparisonData.userArticle!.authority,
      competitor: comparisonData.competitorArticle!.authority,
    },
  ] : [];

  const radarData = comparisonData ? [
    {
      subject: 'Readability',
      yours: comparisonData.userArticle!.readability,
      competitor: comparisonData.competitorArticle!.readability,
      fullMark: 100,
    },
    {
      subject: 'Factuality',
      yours: comparisonData.userArticle!.factuality,
      competitor: comparisonData.competitorArticle!.factuality,
      fullMark: 100,
    },
    {
      subject: 'Structure',
      yours: comparisonData.userArticle!.structure,
      competitor: comparisonData.competitorArticle!.structure,
      fullMark: 100,
    },
    {
      subject: 'Q&A Format',
      yours: comparisonData.userArticle!.qa_format,
      competitor: comparisonData.competitorArticle!.qa_format,
      fullMark: 100,
    },
    {
      subject: 'Structured Data',
      yours: comparisonData.userArticle!.structured_data,
      competitor: comparisonData.competitorArticle!.structured_data,
      fullMark: 100,
    },
    {
      subject: 'Authority',
      yours: comparisonData.userArticle!.authority,
      competitor: comparisonData.competitorArticle!.authority,
      fullMark: 100,
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">Competitor Comparison</h1>
        <p className="text-secondary">Compare your content with competitors using AI-powered analysis</p>
      </div>

      {/* Input Form */}
      <div className="card max-w-4xl animate-scaleIn">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-primary mb-4">Start Your Competitive Analysis</h3>
          <p className="text-secondary">Enter two URLs to get instant AI-powered comparison insights</p>
        </div>
        <form onSubmit={handleCompare} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="userUrl" className="block text-lg font-semibold text-primary mb-3">
                Your Article URL
              </label>
              <input
                type="url"
                id="userUrl"
                value={userUrl}
                onChange={(e) => setUserUrl(e.target.value)}
                className="input-primary"
                placeholder="https://yourwebsite.com/article"
                required
              />
            </div>

            <div>
              <label htmlFor="competitorUrl" className="block text-lg font-semibold text-primary mb-3">
                Competitor's URL
              </label>
              <input
                type="url"
                id="competitorUrl"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                className="input-primary"
                placeholder="https://competitor.com/article"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-error text-center">{error}</p>
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={isAnalyzing || !userUrl.trim() || !competitorUrl.trim()}
              className="btn-primary"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-5 h-5" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Compare Now'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comparison Results */}
      {comparisonData && (
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
                    <Bar dataKey="yours" fill="#10b981" name="Your Article" radius={[2, 2, 0, 0]} />
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
                      stroke="#10b981"
                      fill="#10b981"
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
                AI-Powered Suggestions to Beat the Competitor
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
        </div>
      )}
    </div>
  );
};