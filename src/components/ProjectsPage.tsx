import React, { useEffect, useState } from 'react';
import { Plus, Folder, Link2, Eye, Trash2, Calendar, FileText, BarChart3, Target, ArrowLeft, X, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { createProject, listProjects, getProjectAnalyses, deleteProject, ProjectAnalysis, checkUserLimits, supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

export const ProjectsPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Array<{ id: number; name: string; created_at: string }>>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLimits, setUserLimits] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<{ id: number; name: string; created_at: string } | null>(null);
  const [projectAnalyses, setProjectAnalyses] = useState<ProjectAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ProjectAnalysis | null>(null);

  const refresh = async () => {
    if (isLoaded && user?.id) {
      const list = await listProjects();
      setProjects(list);
    }
  };

  useEffect(() => {
    if (isLoaded && user?.id) {
      refresh();
      (async () => {
        try {
          const limits = await checkUserLimits(user.id);
          setUserLimits(limits);
        } catch (error) {
          console.error('Error fetching user limits:', error);
        }
      })();
    }
  }, [isLoaded, user?.id]);

  const canCreate = () => {
    if (!userLimits) return true; // Allow if limits not loaded yet
    return userLimits.can_create_project;
  };

  const handleCreate = async () => {
    setError(null);
    if (!newProjectName.trim()) return;
    if (!canCreate()) {
      setError('You have reached your project limit. Upgrade your plan to create more projects.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await createProject({
        name: newProjectName.trim(),
        description: ''
      });
      if (error) setError(error.message);
      else {
        setNewProjectName('');
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const viewProject = async (project: { id: number; name: string; created_at: string }) => {
    setSelectedProject(project);
    setLoadingAnalyses(true);
    try {
      if (user?.id) {
        const { data, error } = await supabase.rpc('get_project_analyses_for', {
          p_clerk_user_id: user.id,
          p_project_id: Number(project.id)
        });
        if (error) throw error;
        setProjectAnalyses((Array.isArray(data) ? data : data ? [data] : []) as ProjectAnalysis[]);
      } else {
        setProjectAnalyses([]);
      }
    } catch (error) {
      console.error('Error loading project analyses:', error);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  // Refresh when analyses are saved/linked to a project from other pages
  useEffect(() => {
    const onProjectUpdated = () => {
      if (selectedProject) viewProject(selectedProject);
    };
    window.addEventListener('project-updated', onProjectUpdated);
    return () => window.removeEventListener('project-updated', onProjectUpdated);
  }, [selectedProject]);

  const handleDeleteProject = async (projectId: number) => {
    try {
      const result = await deleteProject(projectId.toString());
      if (result) {
        await refresh();
        setDeleteConfirm(null);
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      } else {
        setError('Failed to delete project');
      }
    } catch (error) {
      setError('Failed to delete project');
    }
  };

  const renderAnalysisResult = (analysis: ProjectAnalysis) => {
    if (!analysis) return null;

    const result = analysis.analysis_results;

    // Handle keyword analysis results
    if (result && result.analysis_type === 'keyword_analysis') {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Keyword Analysis: {result.keyword || 'N/A'}</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">{result.missing_topics?.length || 0}</div>
              <div className="text-xs text-red-300">Missing Topics</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{result.missing_entities?.length || 0}</div>
              <div className="text-xs text-yellow-300">Missing Entities</div>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">{result.content_gaps?.length || 0}</div>
              <div className="text-xs text-orange-300">Content Gaps</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{result.seo_opportunities?.length || 0}</div>
              <div className="text-xs text-blue-300">SEO Opportunities</div>
            </div>
          </div>
        </div>
      );
    }

    // Handle single analysis results
    if (result && result.readability !== undefined) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(result).map(([key, value]) => {
            if (key === 'suggestions') return null;
            return (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-accent-primary">{value as number}%</div>
                <div className="text-xs text-tertiary capitalize">{key.replace('_', ' ')}</div>
              </div>
            );
          })}
        </div>
      );
    }

    // Handle comparison results (support both camelCase and snake_case)
    if (result && (result.userAnalysis || result.competitorAnalysis || result.user_analysis || result.competitor_analysis)) {
      const userAnalysis = result.userAnalysis || result.user_analysis || {};
      const competitorAnalysis = result.competitorAnalysis || result.competitor_analysis || {};
      const overallUserReadinessScore = result.overallUserReadinessScore ?? result.overall_user_readiness_score;
      const seoOpportunityScore = result.seoOpportunityScore ?? result.seo_opportunity_score;
      const suggestions = result.suggestions || [];
      const quickWins = result.quickWins || result.quick_wins || [];
      return (
        <div className="space-y-4">
          {(overallUserReadinessScore !== undefined || seoOpportunityScore !== undefined) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {overallUserReadinessScore !== undefined && (
                <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-400">{overallUserReadinessScore}%</div>
                  <div className="text-xs text-emerald-300">Overall Readiness</div>
                </div>
              )}
              {seoOpportunityScore !== undefined && (
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{seoOpportunityScore}%</div>
                  <div className="text-xs text-blue-300">SEO Opportunity</div>
                </div>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h4 className="font-semibold text-primary mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Your Content
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(userAnalysis).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-accent-primary">{value as number}%</div>
                    <div className="text-xs text-tertiary">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h4 className="font-semibold text-primary mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Competitor
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(competitorAnalysis).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-secondary">{value as number}%</div>
                    <div className="text-xs text-tertiary">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {(suggestions.length > 0 || quickWins.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {suggestions.length > 0 && (
                <div className="card p-4">
                  <h5 className="font-semibold text-primary mb-2">Suggestions</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                    {suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {quickWins.length > 0 && (
                <div className="card p-4">
                  <h5 className="font-semibold text-primary mb-2">Quick Wins</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                    {quickWins.map((q: string, i: number) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Fallback for other result formats
    return (
      <div className="text-center py-4">
        <div className="text-secondary">Analysis data not available</div>
      </div>
    );
  };

  // If viewing a specific project
  if (selectedProject) {
    return (
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedProject(null)}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center space-x-3">
                <Folder className="w-8 h-8 text-accent-primary" />
                <span>{selectedProject.name}</span>
              </h1>
              <p className="text-secondary">
                Created {new Date(selectedProject.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setDeleteConfirm(selectedProject.id)}
            className="btn-secondary text-error hover:bg-error/10 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Project</span>
          </button>
        </div>

        {/* Project Analyses */}
        <div className="card">
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Saved Analyses ({projectAnalyses.length})</span>
          </h2>
          
          {loadingAnalyses ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner w-8 h-8" />
            </div>
          ) : projectAnalyses.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No analyses saved to this project yet.</p>
              <p className="text-sm mt-2">Analyses will appear here when you save them from the AI Analyzer or Competitor Comparison tools.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projectAnalyses.map((analysis) => (
                <div key={analysis.id} className="card border hover-lift">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link2 className="w-4 h-4 text-accent-primary" />
                        <a 
                          href={analysis.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-accent-primary font-medium truncate"
                        >
                          {analysis.url}
                        </a>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-tertiary mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(analysis.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {renderAnalysisResult(analysis)}
                    </div>
                    <button 
                      onClick={() => setSelectedAnalysis(analysis)}
                      className="btn-secondary flex items-center space-x-1 ml-4"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm === selectedProject.id && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[70]">
            <div className="card p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold text-primary mb-4">Delete Project</h3>
              <p className="text-secondary mb-6">
                Are you sure you want to delete "{selectedProject.name}"? This will also delete all saved analyses in this project.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleDeleteProject(selectedProject.id)}
                  className="btn-primary bg-error hover:bg-red-600"
                >
                  Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Detail Modal */}
        {selectedAnalysis && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[70]">
            <div className="card p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary">Analysis Details</h3>
                <button 
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-secondary hover:text-primary"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4 text-accent-primary" />
                  <a 
                    href={selectedAnalysis.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent-primary hover:underline"
                  >
                    {selectedAnalysis.url}
                  </a>
                </div>
                <div className="text-sm text-tertiary">
                  Analyzed on {new Date(selectedAnalysis.created_at).toLocaleString()}
                </div>
                <div className="border-t border-primary pt-4">
                  {renderAnalysisResult(selectedAnalysis)}
                </div>
                
                {/* Keyword Analysis Details */}
                {selectedAnalysis.analysis_results?.analysis_type === 'keyword_analysis' && (
                  <div className="space-y-6">
                    {/* Missing Topics */}
                    {selectedAnalysis.analysis_results.missing_topics && selectedAnalysis.analysis_results.missing_topics.length > 0 && (
                      <div className="border-t border-primary pt-4">
                        <h4 className="font-semibold text-primary mb-3 flex items-center">
                          <XCircle className="w-5 h-5 text-red-400 mr-2" />
                          Missing Topics ({selectedAnalysis.analysis_results.missing_topics.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedAnalysis.analysis_results.missing_topics.map((topic: string, index: number) => (
                            <div key={index} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <p className="text-secondary text-sm">{topic}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Entities */}
                    {selectedAnalysis.analysis_results.missing_entities && selectedAnalysis.analysis_results.missing_entities.length > 0 && (
                      <div className="border-t border-primary pt-4">
                        <h4 className="font-semibold text-primary mb-3 flex items-center">
                          <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                          Missing Entities ({selectedAnalysis.analysis_results.missing_entities.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAnalysis.analysis_results.missing_entities.map((entity: string, index: number) => (
                            <span key={index} className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Gaps */}
                    {selectedAnalysis.analysis_results.content_gaps && selectedAnalysis.analysis_results.content_gaps.length > 0 && (
                      <div className="border-t border-primary pt-4">
                        <h4 className="font-semibold text-primary mb-3 flex items-center">
                          <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
                          Content Gaps ({selectedAnalysis.analysis_results.content_gaps.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedAnalysis.analysis_results.content_gaps.map((gap: string, index: number) => (
                            <div key={index} className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                              <p className="text-secondary text-sm">{gap}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEO Opportunities */}
                    {selectedAnalysis.analysis_results.seo_opportunities && selectedAnalysis.analysis_results.seo_opportunities.length > 0 && (
                      <div className="border-t border-primary pt-4">
                        <h4 className="font-semibold text-primary mb-3 flex items-center">
                          <Lightbulb className="w-5 h-5 text-blue-400 mr-2" />
                          SEO Opportunities ({selectedAnalysis.analysis_results.seo_opportunities.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedAnalysis.analysis_results.seo_opportunities.map((opportunity: string, index: number) => (
                            <div key={index} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <p className="text-secondary text-sm">{opportunity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Analysis Suggestions */}
                {selectedAnalysis.analysis_results?.suggestions && (
                  <div className="border-t border-primary pt-4">
                    <h4 className="font-semibold text-primary mb-3">Suggestions</h4>
                    <ul className="space-y-2">
                      {selectedAnalysis.analysis_results.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-secondary text-sm">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main projects list view
  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="text-center mb-12 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400/30 via-emerald-500/40 to-emerald-600/30 rounded-3xl border border-emerald-500/40 shadow-2xl mb-6">
          <Folder className="w-10 h-10 text-emerald-300" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-4">
          Your Projects
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Organize and manage your content analyses in dedicated project workspaces.
        </p>
      </div>

      {/* Enhanced Project Creation */}
      {!selectedProject && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-500/40">
                <Plus className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Create New Project</h3>
                <p className="text-gray-300">Start organizing your content analyses</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
              />
              <button
                onClick={handleCreate}
                disabled={loading || !newProjectName.trim() || !canCreate()}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="card hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Folder className="w-6 h-6 text-accent-primary" />
                <div>
                  <h3 className="font-semibold text-primary">{p.name}</h3>
                  <div className="text-xs text-tertiary">Created {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <button 
                onClick={() => setDeleteConfirm(p.id)}
                className="text-secondary hover:text-error transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => viewProject(p)}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Project</span>
            </button>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 mx-auto mb-4 text-tertiary opacity-50" />
          <h3 className="text-xl font-semibold text-primary mb-2">No Projects Yet</h3>
          <p className="text-secondary mb-6">Create your first project to organize your analyses.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[70]">
          <div className="card p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Delete Project</h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete this project? This will also delete all saved analyses.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleDeleteProject(deleteConfirm)}
                className="btn-primary bg-error hover:bg-red-600"
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


