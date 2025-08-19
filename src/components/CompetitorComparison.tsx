import React, { useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus, Lightbulb, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { saveUserComparison, listProjects, createProject, saveAnalysisToProject, supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { evaluateAnalysisAllowance, evaluateComparisonAllowance, consumeIfGuest } from '../utils/limits';
import { analyzeComparison } from '../config/webhooks';
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
    
    if (!userUrl.trim() || !competitorUrl.trim()) {
      setError('Please fill in both URL fields');
      return;
    }

    // Smart allowance check
    const allowance = await evaluateComparisonAllowance(user.id);
    if (!allowance.canProceed) {
      setError(allowance.reason || 'Monthly limit reached');
      return;
    }
    // user is already available from useUser hook

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Send both URLs in one request
      const response = await analyzeComparison({
        userUrl: userUrl.trim(),
        competitorUrl: competitorUrl.trim()
      });

      if (!response.success) throw new Error(response.error || 'Comparison webhook failed');

      // Expected payload from webhook could be:
      // 1) [{ user_analysis: {...}, competitor_analysis: {...}, overall_user_readiness_score, seo_opportunity_score, competitive_suggestions: [], quick_wins: [] }]
      // 2) [{...user metrics...}, {...competitor metrics...}]
      // 3) { user: {...}, competitor: {...}, suggestions: [...] }
      // 4) a single metrics object
      const payload: any = response.data || {};
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
      if (user) {
        // Save comparison record (competitor_comparisons)
        await saveUserComparison({
          userUrl: userUrl.trim(),
          competitorUrl: competitorUrl.trim(),
          comparison_results: data
        });

        // Create a lightweight analysis row so it appears in Recent Analyses and can be linked to projects
        try {
          const summary = {
            readability: data.userArticle?.readability ?? 0,
            factuality: data.userArticle?.factuality ?? 0,
            structure: data.userArticle?.structure ?? 0,
            qa_format: data.userArticle?.qa_format ?? 0,
            structured_data: data.userArticle?.structured_data ?? 0,
            authority: data.userArticle?.authority ?? 0,
            suggestions: data.suggestions ?? []
          } as any;
          const { data: createdId } = await supabase.rpc('create_analysis_with_limit_check', {
            p_clerk_user_id: user.id,
            p_url: `${userUrl.trim()} (comparison)` ,
            p_analysis_results: summary,
            p_project_id: null
          });
          if (typeof createdId === 'number') {
            setCreatedComparisonAnalysisId(createdId);
            // notify dashboard to refresh recent analyses
            window.dispatchEvent(new CustomEvent('analysis-completed'));
          }
        } catch (e) {
          console.warn('Failed to create comparison summary analysis:', e);
        }
        // Dispatch event to update Dashboard
        window.dispatchEvent(new CustomEvent('comparison-completed'));
        try {
          const list = await listProjects();
          setProjects(list);
          setSelectedProjectId(list.length ? list[0].id : 'new');
        } catch {}
        setSaveOpen(true);
      } else {
        consumeIfGuest(!!allowance.shouldConsumeLocal);
      }

    } catch (err) {
      setError(handleError(err));
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

      {/* High-level Scores */}
      {comparisonData?.overallUserReadinessScore !== undefined || comparisonData?.seoOpportunityScore !== undefined ? (
        <div className="grid md:grid-cols-2 gap-6">
          {comparisonData.overallUserReadinessScore !== undefined && (
            <div className="card text-center">
              <h4 className="text-lg font-semibold text-primary mb-2">Overall User Readiness</h4>
              <div className="text-4xl font-bold text-accent-primary">{comparisonData.overallUserReadinessScore}</div>
            </div>
          )}
          {comparisonData.seoOpportunityScore !== undefined && (
            <div className="card text-center">
              <h4 className="text-lg font-semibold text-primary mb-2">SEO Opportunity</h4>
              <div className="text-4xl font-bold text-info">{comparisonData.seoOpportunityScore}</div>
            </div>
          )}
        </div>
      ) : null}

      {/* Input Form */}
      <div className="card max-w-4xl animate-scaleIn mx-auto">
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
              disabled={isAnalyzing || !userUrl.trim() || !competitorUrl.trim() || (allowInfo && !allowInfo.canProceed)}
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

      {/* Allowance banner */}
      {allowInfo && (
        <div className={`card ${allowInfo.canProceed ? 'border-accent-primary/30' : 'border-error/30'}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              {typeof allowInfo.limit === 'number' ? (() => {
                const used = Math.max(0, (allowInfo.limit || 0) - (allowInfo.remaining || 0));
                return (
                  <span>Monthly usage: <span className="text-primary font-semibold">{used}/{allowInfo.limit}</span></span>
                );
              })() : (
                <span>Unlimited usage</span>
              )}
            </div>
            {!allowInfo.canProceed && (
              <button className="btn-primary" onClick={() => window.dispatchEvent(new Event('open-pricing'))}>Upgrade</button>
            )}
          </div>
        </div>
      )}

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
                      // Option A: if we created a synthetic analysis id earlier, attach it
                      if (createdComparisonAnalysisId) {
                        await saveAnalysisToProject(String(projectId), String(createdComparisonAnalysisId));
                        window.dispatchEvent(new CustomEvent('project-updated'));
                      } else {
                        // Option B: create a lightweight analysis row now and link it
                        try {
                          const summary = {
                            readability: comparisonData.userArticle?.readability ?? 0,
                            factuality: comparisonData.userArticle?.factuality ?? 0,
                            structure: comparisonData.userArticle?.structure ?? 0,
                            qa_format: comparisonData.userArticle?.qa_format ?? 0,
                            structured_data: comparisonData.userArticle?.structured_data ?? 0,
                            authority: comparisonData.userArticle?.authority ?? 0,
                            suggestions: comparisonData.suggestions ?? []
                          } as any;
                          const { data: createdId } = await supabase.rpc('create_analysis_with_limit_check', {
                            p_clerk_user_id: user!.id,
                            p_url: userUrl.trim() + ' (comparison)',
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
      )}
    </div>
  );
};