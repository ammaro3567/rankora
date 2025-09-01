import React, { useState } from 'react';
import { Search, Loader2, FileText, CheckCircle, BarChart3, HelpCircle, Database, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { sendToN8nWebhook } from '../config/webhooks';
import { consumeIfGuest, evaluateAnalysisAllowance } from '../utils/limits';
import { saveUserAnalysis, listProjects, createProject, saveAnalysisToProject, supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
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
  const { user } = useUser();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowInfo, setAllowInfo] = useState<{ canProceed: boolean; remaining: number; limit?: number } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'new' | ''>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastAnalysisId, setLastAnalysisId] = useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      if (user?.id) {
        const a = await evaluateAnalysisAllowance(user.id);
        setAllowInfo({ canProceed: a.canProceed, remaining: a.remaining || 0, limit: a.limit });
      }
    })();
  }, [user?.id]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Smart allowance check (guest limit, plan limits, owner unlimited)
    const allowance = await evaluateAnalysisAllowance(user?.id);
    if (!allowance.canProceed) {
      setError(allowance.reason || 'Monthly limit reached');
      return;
    }

    // Free-limit disabled: always allow

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call webhook for SINGLE URL analysis only
      // This ensures each URL is analyzed independently, not compared with others
      console.log('🚀 [AIOverviewAnalyzer] Starting analysis for URL:', url.trim());
      console.log('🔗 [AIOverviewAnalyzer] About to call sendToN8nWebhook');
      
      const webhookResult = await sendToN8nWebhook({ 
        keyword: 'analysis', 
        userUrl: url.trim() 
      });

      console.log('📥 [AIOverviewAnalyzer] Webhook result received:', webhookResult);

      if (!webhookResult.success) {
        throw new Error(webhookResult.error || 'Webhook request failed');
      }

      // Debug: Log the exact structure of webhookResult
      console.log('🔍 [DEBUG] webhookResult structure:', {
        success: webhookResult.success,
        data: webhookResult.data,
        dataType: typeof webhookResult.data,
        isArray: Array.isArray(webhookResult.data),
        keys: webhookResult.data ? Object.keys(webhookResult.data) : 'no data'
      });

      // Normalize webhook payload. Expected formats:
      // 1) [ { readability, factuality, structure, qa_format, structured_data, authority, suggestions[] } ]
      // 2) { readability, ... }
      const payload: any = webhookResult.data;
      const raw = Array.isArray(payload) ? (payload[0] || {}) : (payload || {});
      
      // Debug: Log the normalized payload
      console.log('🔍 [DEBUG] Normalized payload:', {
        payload,
        raw,
        rawKeys: Object.keys(raw),
        hasReadability: 'readability' in raw,
        readabilityValue: raw.readability
      });
      
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

      // Debug: Log the final result
      console.log('🔍 [DEBUG] Final result:', finalResult);

      // Validate payload has scores
      const hasScores = [
        finalResult.readability,
        finalResult.factuality,
        finalResult.structure,
        finalResult.qa_format,
        finalResult.structured_data,
        finalResult.authority
      ].some((v) => v > 0);

      console.log('🔍 [DEBUG] Has scores check:', {
        scores: [
          finalResult.readability,
          finalResult.factuality,
          finalResult.structure,
          finalResult.qa_format,
          finalResult.structured_data,
          finalResult.authority
        ],
        hasScores
      });

      if (!hasScores) {
        throw new Error('No scores returned from webhook');
      }

      setResult(finalResult);
      if (!user) consumeIfGuest(!!allowance.shouldConsumeLocal);
      else {
        // Save analysis using RPC that accepts clerk_user_id to avoid session issues
        const savedAnalysis = await saveUserAnalysis({
          url: url.trim(),
          analysis_results: finalResult,
          projectId: null // Will be linked later if user chooses a project
        });
        // Store the analysis ID for later use
        if (savedAnalysis) {
          try { setLastAnalysisId(typeof savedAnalysis === 'number' ? savedAnalysis : Number(savedAnalysis)); } catch {}
          // Analysis saved successfully
          // Dispatch event to update Dashboard
          window.dispatchEvent(new CustomEvent('analysis-completed'));
          // Refresh local allowance banner to reflect new usage
          try {
            const a2 = await evaluateAnalysisAllowance(user.id);
            setAllowInfo({ canProceed: a2.canProceed, remaining: a2.remaining || 0, limit: a2.limit });
          } catch {}
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
      {/* Enhanced Header with Gradient */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-3xl border border-emerald-500/40 shadow-2xl mb-6">
          <BarChart3 className="w-10 h-10 text-emerald-300" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-4">
          AI Content Analyzer
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Analyze your content with advanced AI to get comprehensive insights on readability, factuality, structure, and more.
        </p>
      </div>

      {/* Enhanced Usage Info */}
      {allowInfo && (
        <div className={`border rounded-2xl p-6 mb-8 text-center shadow-2xl ${
          allowInfo.canProceed 
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-600/10 to-emerald-700/10 border-emerald-500/30' 
            : 'bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-700/10 border-red-500/30'
        }`}>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Database className={`w-6 h-6 ${allowInfo.canProceed ? 'text-emerald-200' : 'text-red-200'}`} />
            <span className={`font-semibold text-lg ${allowInfo.canProceed ? 'text-emerald-200' : 'text-red-200'}`}>
              Monthly Usage
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className={`text-center p-4 rounded-xl border ${
              allowInfo.canProceed 
                ? 'bg-emerald-500/20 border-emerald-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                allowInfo.canProceed ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {allowInfo.remaining}
              </div>
              <div className={`text-sm ${
                allowInfo.canProceed ? 'text-emerald-200' : 'text-red-200'
              }`}>
                Remaining
              </div>
            </div>
            
            <div className={`text-center p-4 rounded-xl border ${
              allowInfo.canProceed 
                ? 'bg-emerald-500/20 border-emerald-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                allowInfo.canProceed ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {allowInfo.limit || '∞'}
              </div>
              <div className={`text-sm ${
                allowInfo.canProceed ? 'text-emerald-200' : 'text-red-200'
              }`}>
                Total Limit
              </div>
            </div>
          </div>
          
          {allowInfo.limit && (
            <div className="mt-4">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    allowInfo.canProceed 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, ((allowInfo.limit - allowInfo.remaining) / allowInfo.limit) * 100))}%` 
                  }}
                ></div>
              </div>
              <div className={`text-xs mt-2 ${
                allowInfo.canProceed ? 'text-emerald-200' : 'text-red-200'
              }`}>
                {allowInfo.limit - allowInfo.remaining} of {allowInfo.limit} used
              </div>
            </div>
          )}
          
          {!allowInfo.canProceed && (
            <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <div className="text-red-200 text-sm font-medium">
                Monthly limit reached! Upgrade your plan for more analyses.
              </div>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-pricing'))}
                className="mt-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Input Form */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-lg font-semibold text-emerald-200 mb-3">
                Website URL to Analyze
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-6 py-4 bg-gray-800/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-lg"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing Content...</span>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  <span>Analyze Content</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Enhanced Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center space-x-3 text-red-400">
              <HelpCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Results Section */}
      {result && (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Enhanced Score Summary */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Analysis Results</h2>
              <p className="text-gray-300 text-lg">Your content performance across key metrics</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.entries(result).filter(([key]) => key !== 'suggestions').map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-800/30 rounded-2xl border border-blue-500/20">
                  <div className={`text-3xl font-bold mb-2 ${
                    value >= 80 ? 'text-emerald-400' : 
                    value >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {value}
                  </div>
                  <div className="text-sm text-gray-300 font-medium capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
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
        <div className="fixed inset-0 modal-backdrop z-[70]">
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
                        
                        // Check project limits before creating
                        try {
                          const limits = await supabase.rpc('check_user_limits', {
                            p_clerk_user_id: user!.id
                          });
                          
                          if (limits.data && limits.data[0] && !limits.data[0].can_create_project) {
                            setSaveError('Project limit reached. Please upgrade your plan.');
                            setSaving(false);
                            return;
                          }
                        } catch (limitError) {
                          console.warn('⚠️ Could not check project limits:', limitError);
                        }
                        
                        const created = await createProject({ name: newProjectName.trim(), description: '' });
                        if ((created as any)?.error) {
                          if ((created as any).error.code === 'LIMIT_EXCEEDED') {
                            setSaveError('Project limit reached. Please upgrade your plan.');
                          } else {
                            setSaveError((created as any).error.message || 'Failed to create project');
                          }
                          setSaving(false);
                          return;
                        }
                        
                        const list = await listProjects();
                        setProjects(list);
                        projectId = list[0]?.id || null;
                      } else if (typeof selectedProjectId === 'number') {
                        projectId = selectedProjectId;
                      }
                      
                      if (!projectId) {
                        throw new Error('Unable to resolve project');
                      }
                      
                      // Link the analysis to the project
                      if (lastAnalysisId) {
                        console.log('🔗 Linking analysis', lastAnalysisId, 'to project', projectId);
                        await saveAnalysisToProject(String(projectId), String(lastAnalysisId));
                        console.log('✅ Analysis linked to project successfully');
                      } else {
                        // Fallback: try to locate by URL
                        console.log('🔍 Fallback: searching for analysis by URL');
                        try {
                          const { data: recent } = await supabase
                            .from('user_analyses')
                            .select('id')
                            .eq('clerk_user_id', user!.id)
                            .eq('url', url.trim())
                            .order('created_at', { ascending: false })
                            .limit(1);
                          
                          if (recent && recent[0]?.id) {
                            console.log('🔗 Linking found analysis', recent[0].id, 'to project', projectId);
                            await saveAnalysisToProject(String(projectId), String(recent[0].id));
                            console.log('✅ Analysis linked to project successfully (fallback)');
                          } else {
                            console.warn('⚠️ No analysis found to link to project');
                          }
                        } catch (linkError) {
                          console.error('💥 Failed to link analysis to project:', linkError);
                          setSaveError('Analysis saved but could not be linked to project');
                          setSaving(false);
                          return;
                        }
                      }
                      
                      // Dispatch events to update UI
                      window.dispatchEvent(new CustomEvent('project-updated'));
                      window.dispatchEvent(new CustomEvent('analysis-completed'));
                      
                      setSaveOpen(false);
                      console.log('✅ Project save completed successfully');
                    } catch (e: any) {
                      console.error('💥 Project save error:', e);
                      setSaveError(e?.message || 'Failed to save to project');
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