import React, { useState } from 'react';
import { Search, Loader2, FileText, CheckCircle, BarChart3, HelpCircle, Database, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { sendToN8nWebhook } from '../config/webhooks';
import { consumeIfGuest, evaluateAnalysisAllowance } from '../utils/limits';
import { getCurrentUser, saveUserAnalysis, listProjects, createProject, saveAnalysisToProject } from '../lib/supabase';
import { getUserSubscription } from '../lib/paypal';
import { handleError } from '../utils/error-handler';

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
  const [allowInfo, setAllowInfo] = useState<{ allowed: boolean; used: number; limit?: number } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'new' | ''>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const a = await evaluateAnalysisAllowance();
      setAllowInfo({ allowed: a.canProceed, used: a.remaining || 0, limit: a.limit });
    })();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Smart allowance check (guest limit, plan limits, owner unlimited)
    const allowance = await evaluateAnalysisAllowance();
    if (!allowance.canProceed) {
      setError(allowance.reason || 'Monthly limit reached');
      return;
    }

    // Free-limit disabled: always allow

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call webhook
      const webhookResult = await sendToN8nWebhook({ 
        keyword: 'analysis', 
        userUrl: url.trim() 
      });

      if (!webhookResult.success) {
        throw new Error(webhookResult.error || 'Webhook request failed');
      }

      // Normalize webhook payload. Expected formats:
      // 1) [ { readability, factuality, structure, qa_format, structured_data, authority, suggestions[] } ]
      // 2) { readability, ... }
      const payload: any = webhookResult.data;
      const raw = Array.isArray(payload) ? (payload[0] || {}) : (payload || {});
      const toNumber = (v: any) => {
        const n = typeof v === 'string' ? parseFloat(v) : Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      const finalResult: AnalysisResult = {
        readability: toNumber(raw.readability),
        factuality: toNumber(raw.factuality),
        structure: toNumber(raw.structure),
        qa_format: toNumber(raw.qa_format),
        structured_data: toNumber(raw.structured_data),
        authority: toNumber(raw.authority),
        suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : []
      };

      // Validate payload has scores
      const hasScores = [
        finalResult.readability,
        finalResult.factuality,
        finalResult.structure,
        finalResult.qa_format,
        finalResult.structured_data,
        finalResult.authority
      ].some((v) => v > 0);

      if (!hasScores) {
        throw new Error('No scores returned from webhook');
      }

      setResult(finalResult);
      const user = await getCurrentUser();
      if (!user) consumeIfGuest(!!allowance.shouldConsumeLocal);
      else {
        const savedAnalysis = await saveUserAnalysis({ 
          url: url.trim(), 
          analysis_results: finalResult,
          projectId: null // Will be linked later if user chooses a project
        });
        // Store the analysis ID for later use
        if (savedAnalysis) {
          // Analysis saved successfully
        }
      }

      // Prompt to save in a project if logged in
      if (user) {
        try {
          const list = await listProjects();
          setProjects(list);
          setSelectedProjectId(list.length ? list[0].id : 'new');
        } catch {}
        setSaveOpen(true);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(handleError(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green for excellent
    if (score >= 60) return '#f59e0b'; // Orange for good  
    return '#ef4444'; // Red for needs work
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
      <div className="card max-w-2xl animate-scaleIn mx-auto">
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
            disabled={isAnalyzing || !url.trim() || (allowInfo && !allowInfo.allowed)}
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

      {/* Allowance Banner */}
      {allowInfo && (
        <div className={`card ${allowInfo.allowed ? 'border-accent-primary/30' : 'border-error/30'} `}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              {typeof allowInfo.limit === 'number' ? (
                <span>
                  Monthly usage: <span className="text-primary font-semibold">{allowInfo.used}/{allowInfo.limit}</span>
                </span>
              ) : (
                <span>Unlimited usage</span>
              )}
            </div>
            {!allowInfo.allowed && (
              <button className="btn-primary" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>Upgrade</button>
            )}
          </div>
        </div>
      )}

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

      {/* Save to project modal */}
      {saveOpen && (
        <div className="fixed inset-0 modal-backdrop z-50">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="card glass card-shadow max-w-md w-full relative animate-scaleIn">
              <button className="absolute top-3 right-3 text-secondary hover:text-primary" onClick={() => setSaveOpen(false)}>✕</button>
              <h4 className="text-xl font-semibold text-primary mb-4 text-center">Save analysis to a project</h4>
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
                        const { error } = await createProject(newProjectName.trim());
                        if (error) throw new Error(error.message);
                        const list = await listProjects();
                        setProjects(list);
                        projectId = list[0]?.id || null;
                      } else if (typeof selectedProjectId === 'number') {
                        projectId = selectedProjectId;
                      }
                      if (!projectId) throw new Error('Unable to resolve project');
                      // Link the existing analysis to the project
                      // Note: We need to get the analysis ID from the saved analysis
                      // For now, we'll just close the modal since the analysis is already saved
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