import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { ProjectService } from '../../services/projectService'; // Direct import instead of dynamic
import Navigation from '../layout/Navigation';

const ProjectsPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects from database on component mount
  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        console.log('⚠️ No user ID available, using empty projects list');
        setProjects([]);
        return;
      }

      console.log('📂 Loading projects for user:', user.id);

      // Direct call instead of dynamic import
      const dbProjects = await ProjectService.getAllProjects(user.id);
      console.log('✅ Loaded projects from Supabase:', dbProjects.length);

      // Transform the projects to match the expected format
      const transformedProjects = dbProjects.map(project => ({
        id: project.id,
        name: project.title || project.name,
        title: project.title || project.name,
        description: project.description || '',
        status: project.status || 'planning',
        progress: project.progress || 0,
        dueDate: project.due_date || '',
        priority: 'medium',
        tags: project.tags || [],
        teamSize: 1,
        lastUpdate: 'Recently',
        budget: 0,
        tasksCompleted: Math.floor((project.progress || 0) / 100 * 10),
        totalTasks: 10
      }));

      setProjects(transformedProjects);

    } catch (error: any) {
      console.error('❌ Error loading projects:', error);
      setError(`Failed to load projects: ${error.message}`);

      // Fallback to empty array instead of localStorage for simplicity
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      default: // recent
        return 0; // Keep original order since we don't have timestamps
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-100';
      case 'in_progress':
      case 'active':
        return 'bg-blue-500/20 text-blue-100';
      case 'behind':
        return 'bg-red-500/20 text-red-100';
      case 'on_hold':
        return 'bg-gray-500/20 text-gray-100';
      default:
        return 'bg-yellow-500/20 text-yellow-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'active':
        return 'Active';
      case 'behind':
        return 'Behind Schedule';
      case 'on_hold':
        return 'On Hold';
      default:
        return 'Planning';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <Navigation />

      {/* Projects Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
            <p className="text-white/80">Manage and track all your projects in one place</p>
          </div>
          <Link
            to="/projects/new"
            className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/20 transition-all duration-300 inline-flex items-center space-x-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Project</span>
          </Link>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <label className="block text-white/80 text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <label className="block text-white/80 text-sm font-medium mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="recent">Recently Updated</option>
              <option value="name">Name</option>
              <option value="progress">Progress</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="text-white/80 text-sm font-medium mb-2">Quick Stats</div>
            <div className="flex space-x-4 text-white text-sm">
              <span>Total: {projects.length}</span>
              <span>Active: {projects.filter(p => p.status === 'active').length}</span>
              <span>Completed: {projects.filter(p => p.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
              <p className="text-white/80">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 text-center mb-6">
            <p className="text-red-200 font-medium mb-4">{error}</p>
            <button
              onClick={loadProjects}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
            <p className="text-white/70 mb-4">Get started by creating your first project.</p>
            <Link
              to="/projects/new"
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Project</span>
            </Link>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <div key={project.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-white/70 text-sm line-clamp-2">{project.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Progress</span>
                  <span className="text-white font-semibold text-sm">{project.progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      project.status === 'completed' ? 'bg-green-400/70' :
                      project.status === 'behind' ? 'bg-red-400/70' :
                      'bg-blue-400/70'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-xs">Updated {project.lastUpdate}</p>
                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPageFixed;