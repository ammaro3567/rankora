import React, { useState } from 'react';
import { Search, Loader2, FileText, CheckCircle, BarChart3, HelpCircle, Database, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
      // Call the webhook endpoint
      const response = await fetch('https://n8n-n8n.easypanel.host/webhook/616dad33-b5c1-424d-b6c3-0cd04f044a49', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process the webhook response or use mock data for demonstration
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
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the URL. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  const pieData = result ? [
    { name: 'Readability', value: result.readability, color: getScoreColor(result.readability) },
    { name: 'Factuality', value: result.factuality, color: getScoreColor(result.factuality) },
    { name: 'Structure', value: result.structure, color: getScoreColor(result.structure) },
    { name: 'Q&A Format', value: result.qa_format, color: getScoreColor(result.qa_format) },
    { name: 'Structured Data', value: result.structured_data, color: getScoreColor(result.structured_data) },
    { name: 'Authority', value: result.authority, color: getScoreColor(result.authority) },
  ] : [];

  const barData = result ? [
    { name: 'Readability', score: result.readability, fill: getScoreColor(result.readability) },
    { name: 'Factuality', score: result.factuality, fill: getScoreColor(result.factuality) },
    { name: 'Structure', score: result.structure, fill: getScoreColor(result.structure) },
    { name: 'Q&A Format', score: result.qa_format, fill: getScoreColor(result.qa_format) },
    { name: 'Structured Data', score: result.structured_data, fill: getScoreColor(result.structured_data) },
    { name: 'Authority', score: result.authority, fill: getScoreColor(result.authority) },
  ] : [];

  const overallScore = result ? Math.round((result.readability + result.factuality + result.structure + result.qa_format + result.structured_data + result.authority) / 6) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-primary mb-2">AI Overview Analyzer</h1>
        <p className="text-secondary">Analyze your content for Google's AI Overviews optimization</p>
      </div>

      {/* Input Form */}
      <div className="card max-w-2xl animate-scaleIn">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label htmlFor="analyzeUrl" className="block text-lg font-semibold text-primary mb-3">
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
                className="input-primary pl-12"
                placeholder="https://example.com/your-article"
                required
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-error text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isAnalyzing || !url.trim()}
            className="btn-primary w-full"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner w-5 h-5" />
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze Now'
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-fadeInUp">
          {/* Overall Score */}
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-primary mb-6">Overall AI Overview Score</h3>
            <div className="inline-block p-8 surface-secondary rounded-xl">
              <div className={`text-6xl font-bold mb-2`} style={{ color: getScoreColor(overallScore) }}>
                {overallScore}
              </div>
              <div className="text-lg text-secondary">{getScoreLabel(overallScore)}</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="card">
              <h4 className="text-xl font-semibold text-primary mb-6">Score Distribution</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="card">
              <h4 className="text-xl font-semibold text-primary mb-6">Detailed Scores</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="name" 
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
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Readability', score: result.readability, icon: FileText, description: 'Content clarity and accessibility' },
              { name: 'Factuality', score: result.factuality, icon: CheckCircle, description: 'Accuracy and credibility' },
              { name: 'Structure', score: result.structure, icon: BarChart3, description: 'Organization and hierarchy' },
              { name: 'Q&A Format', score: result.qa_format, icon: HelpCircle, description: 'Question-answer optimization' },
              { name: 'Structured Data', score: result.structured_data, icon: Database, description: 'Schema markup assessment' },
              { name: 'Authority', score: result.authority, icon: Shield, description: 'Domain and content authority' },
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.name}
                  className="card hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-accent-primary" />
                    <h4 className="font-semibold text-primary mb-2 text-sm">{metric.name}</h4>
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{ color: getScoreColor(metric.score) }}
                    >
                      {metric.score}
                    </div>
                    <div className="text-xs text-secondary mb-2">
                      {getScoreLabel(metric.score)}
                    </div>
                    <p className="text-xs text-tertiary leading-tight">{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suggestions */}
          <div className="card">
            <h4 className="text-xl font-semibold text-primary mb-6">AI-Powered Recommendations</h4>
            <div className="space-y-4">
              {result.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 surface-secondary rounded-lg animate-fadeInLeft"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-secondary leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};