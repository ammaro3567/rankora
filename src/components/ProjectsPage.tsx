import React, { useEffect, useState } from 'react';
import { Plus, Folder, Link2, Eye, Trash2, Calendar, FileText, BarChart3, Target, ArrowLeft, X } from 'lucide-react';
import { createProject, listProjects, getProjectAnalyses, deleteProject, ProjectAnalysis, checkUserLimits } from '../lib/supabase';
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
      const { error } = await createProject(newProjectName.trim());
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
      const analyses = await getProjectAnalyses(project.id.toString());
      setProjectAnalyses(analyses);
    } catch (error) {
      console.error('Error loading project analyses:', error);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      const { error } = await deleteProject(projectId.toString());
      if (error) {
        setError(error.message);
      } else {
        await refresh();
        setDeleteConfirm(null);
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      }
    } catch (error) {
      setError('Failed to delete project');
    }
  };

  const renderAnalysisResult = (analysis: ProjectAnalysis) => {
    if (!analysis) return null;

    const result = analysis.analysis_results;

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

    // Handle comparison results
    if (result && (result.userAnalysis || result.competitorAnalysis)) {
      return (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h4 className="font-semibold text-primary mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Your Content
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.userAnalysis || {}).map(([key, value]) => (
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
                {Object.entries(result.competitorAnalysis || {}).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-secondary">{value as number}%</div>
                    <div className="text-xs text-tertiary">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
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
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Projects</h1>
          <p className="text-secondary">Organize analyses into projects and keep your workspace clean.</p>
        </div>
        <div className="text-sm text-secondary">
          {userLimits ? (
            <span>Projects: <span className="text-primary font-semibold">{userLimits.projects_used}/{userLimits.projects_limit}</span></span>
          ) : (
            <span>Projects: <span className="text-primary font-semibold">Loading...</span></span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center space-x-3">
          <input
            className="input-primary flex-1"
            placeholder="New project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button 
            className="btn-primary" 
            disabled={loading || !canCreate()} 
            onClick={handleCreate}
            title={!canCreate() ? 'Project limit reached. Upgrade your plan to create more projects.' : 'Create new project'}
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
        {error && <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>}
      </div>

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
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
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


