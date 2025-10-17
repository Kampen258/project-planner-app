import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

const ProjectsPageDebug: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (message: string) => {
    console.log('🐛 DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      addDebug('Starting project load...');
      setLoading(true);
      setError(null);

      addDebug(`User: ${user ? user.email : 'null'}`);
      addDebug(`User ID: ${user?.id || 'null'}`);

      if (!user?.id) {
        throw new Error('No user ID available');
      }

      addDebug('Importing ProjectService...');

      // Test dynamic import
      const { ProjectService } = await import('../../services/projectService');
      addDebug('ProjectService imported successfully');

      addDebug('Calling getAllProjects...');
      const dbProjects = await ProjectService.getAllProjects(user.id);
      addDebug(`Loaded ${dbProjects.length} projects from database`);

      setProjects(dbProjects);
      addDebug('Projects set in state successfully');

    } catch (error: any) {
      addDebug(`Error occurred: ${error.message}`);
      console.error('❌ Error loading projects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      addDebug('Loading completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-white mb-4">🐛 Debug Projects Page</h1>
            <div className="text-white">
              <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mb-4"></div>
              <p>Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">🐛 Debug Projects Page</h1>

          {/* Navigation Links */}
          <div className="flex gap-4 mb-6">
            <Link
              to="/"
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={loadProjects}
              className="bg-blue-500/20 text-white px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Reload Projects
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
              <h3 className="text-red-200 font-semibold mb-2">Error:</h3>
              <p className="text-red-100">{error}</p>
            </div>
          )}

          {/* Projects Display */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Projects ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <div className="text-white/70 text-center py-8">
                <p>No projects found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project, index) => (
                  <div key={project.id || index} className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold">
                      {project.title || project.name || `Project ${index + 1}`}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {project.description || 'No description'}
                    </p>
                    <div className="text-white/60 text-xs mt-2">
                      ID: {project.id} | Status: {project.status} | Progress: {project.progress}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Debug Log:</h3>
            <div className="text-white/80 text-sm space-y-1 max-h-48 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="font-mono">{info}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPageDebug;