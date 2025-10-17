import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { SupabaseProjectService } from '../../services/supabaseProjectService';
import type { SupabaseProject } from '../../services/supabaseProjectService';
import Navigation from '../common/Navigation';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isListening, setIsListening] = useState(false);
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Pro/Admin users have full access to voice features
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';

  const handleVoiceActivation = () => {
    console.log('🎤 [ProjectsPage] Voice activation initiated');
    console.log('🎤 [ProjectsPage] User access check:', {
      email: user?.email,
      hasAccess: hasVoiceAccess,
      timestamp: new Date().toISOString()
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      console.log('🎤 [ProjectsPage] SpeechRecognition API available, creating instance');

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log('🎤 [ProjectsPage] Recognition configuration:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });

      setIsListening(true);
      console.log('🎤 [ProjectsPage] Set listening state to true');

      recognition.onstart = () => {
        console.log('🎤 [ProjectsPage] Voice recognition started successfully');
        console.log('🎤 [ProjectsPage] Microphone is now active and listening...');
      };

      recognition.onresult = (event) => {
        console.log('🎤 [ProjectsPage] Voice recognition result received');
        console.log('🎤 [ProjectsPage] Full event object:', event);

        const results = event.results;
        const resultIndex = event.resultIndex;
        const transcript = results[resultIndex][0].transcript;
        const confidence = results[resultIndex][0].confidence;

        console.log('🎤 [ProjectsPage] Speech detection details:', {
          transcript: transcript,
          confidence: confidence,
          resultIndex: resultIndex,
          totalResults: results.length,
          timestamp: new Date().toISOString()
        });

        console.log('🎤 [ProjectsPage] Voice command processed:', transcript);
        alert(`🎤 Voice Command Detected!\n\nTranscript: "${transcript}"\nConfidence: ${Math.round(confidence * 100)}%\n\n✅ Voice agent activated successfully!`);
      };

      recognition.onspeechstart = () => {
        console.log('🎤 [ProjectsPage] Speech detected - user is speaking');
      };

      recognition.onspeechend = () => {
        console.log('🎤 [ProjectsPage] Speech ended - user stopped speaking');
      };

      recognition.onaudiostart = () => {
        console.log('🎤 [ProjectsPage] Audio input started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 [ProjectsPage] Audio input ended');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 [ProjectsPage] Voice recognition session ended');
        console.log('🎤 [ProjectsPage] Set listening state to false');
        console.log('🎤 [ProjectsPage] Ready for next voice command');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('🎤 [ProjectsPage] Voice recognition error occurred:', {
          error: event.error,
          message: event.message,
          timestamp: new Date().toISOString()
        });

        let errorMessage = 'Voice recognition error occurred.';
        switch(event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone access error. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during voice recognition.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Voice recognition service not available.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }

        console.error('🎤 [ProjectsPage] User-friendly error message:', errorMessage);
        alert(`🎤 Voice Recognition Error\n\n${errorMessage}\n\nPlease try again.`);
      };

      console.log('🎤 [ProjectsPage] Starting voice recognition...');
      try {
        recognition.start();
        console.log('🎤 [ProjectsPage] Recognition.start() called successfully');
      } catch (error) {
        console.error('🎤 [ProjectsPage] Error starting recognition:', error);
        setIsListening(false);
        alert('Failed to start voice recognition. Please try again.');
      }
    } else {
      console.error('🎤 [ProjectsPage] SpeechRecognition API not supported');
      console.log('🎤 [ProjectsPage] Browser compatibility check failed');
      console.log('🎤 [ProjectsPage] Available APIs:', {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        SpeechRecognition: 'SpeechRecognition' in window,
        userAgent: navigator.userAgent
      });
      alert('🎤 Speech Recognition Not Supported\n\nYour browser does not support voice recognition.\nPlease use Chrome, Edge, or Safari for voice features.');
    }
  };

  // Load projects from database
  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Loading projects for user:', user.id);
        console.log('User object:', user);

        // First, let's see what's in the database at all
        console.log('🔧 DEBUG: Checking all projects in database...');
        await SupabaseProjectService.getAllProjectsDebug();

        // Use the user ID from auth context (now set to the correct Supabase user ID)
        console.log('Using user ID for Supabase:', user.id);

        // First, try to get projects for the specific user
        const projectsData = await SupabaseProjectService.getProjects(user.id);
        console.log('📦 [ProjectsPage] Received projects for user:', projectsData);
        console.log('📦 [ProjectsPage] User-specific projects count:', projectsData?.length || 0);

        // If no projects found for this specific user, try loading all projects as a fallback
        if (!projectsData || projectsData.length === 0) {
          console.log('🔄 [ProjectsPage] No projects found for specific user, trying fallback strategies...');

          // Try getting projects with null user_id
          const nullUserProjects = await SupabaseProjectService.getProjects(null);
          console.log('🔄 [ProjectsPage] Projects with null user_id:', nullUserProjects?.length || 0);

          // Try getting ALL projects (debug method)
          const allProjects = await SupabaseProjectService.getAllProjectsDebug();
          console.log('🔄 [ProjectsPage] ALL projects in database:', allProjects?.length || 0);

          // Use whichever gives us projects
          let finalProjects = [];
          if (allProjects && allProjects.length > 0) {
            console.log('✅ [ProjectsPage] Using ALL projects from database');
            finalProjects = allProjects;
          } else if (nullUserProjects && nullUserProjects.length > 0) {
            console.log('✅ [ProjectsPage] Using null user_id projects');
            finalProjects = nullUserProjects;
          }

          if (finalProjects.length > 0) {
            console.log('✅ [ProjectsPage] Setting projects state with:', finalProjects.length, 'projects');
            console.log('✅ [ProjectsPage] Sample project:', finalProjects[0]);
            setProjects(finalProjects);
            return;
          }
        } else {
          console.log('✅ [ProjectsPage] Using user-specific projects');
          console.log('✅ [ProjectsPage] Setting projects state with:', projectsData.length, 'projects');
          setProjects(projectsData);
          return;
        }

        console.log('❌ [ProjectsPage] No projects found anywhere');
        setProjects([]);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user?.id]);

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.title || a.name || '').localeCompare(b.title || b.name || '');
      case 'progress':
        return b.progress - a.progress;
      case 'dueDate':
        const aDate = (a.due_date || a.end_date) ? new Date(a.due_date || a.end_date).getTime() : 0;
        const bDate = (b.due_date || b.end_date) ? new Date(b.due_date || b.end_date).getTime() : 0;
        return aDate - bDate;
      default: // recent
        const aTime = new Date(a.updated_at).getTime();
        const bTime = new Date(b.updated_at).getTime();
        return bTime - aTime;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-100';
      case 'in_progress':
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
      case 'behind':
        return 'Behind Schedule';
      case 'on_hold':
        return 'On Hold';
      default:
        return 'Planning';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-100';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-100';
      default:
        return 'bg-green-500/20 text-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Navigation */}
      <Navigation activeSection="/projects" />

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
              <option value="in_progress">In Progress</option>
              <option value="planning">Planning</option>
              <option value="behind">Behind Schedule</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
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
              <span>Active: {projects.filter(p => p.status === 'in_progress').length}</span>
              <span>Completed: {projects.filter(p => p.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/10 rounded mb-4"></div>
                <div className="h-2 bg-white/10 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-3 bg-white/10 rounded"></div>
                  <div className="h-3 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-red-300 mb-2">Error Loading Projects</h3>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500/30 hover:bg-red-500/40 text-red-100 px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 block"
            >
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{project.title || project.name}</h3>
                  <p className="text-white/70 text-sm line-clamp-2">{project.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300`}>
                    NEW
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

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white/60 text-xs">Due Date</p>
                  <p className="text-white text-sm font-medium">
                    {(project.due_date || project.end_date) ? new Date(project.due_date || project.end_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Team Size</p>
                  <p className="text-white text-sm font-medium">{project.team_members?.length || 0} members</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Created</p>
                  <p className="text-white text-sm font-medium">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Progress</p>
                  <p className="text-white text-sm font-medium">{project.progress}%</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags && project.tags.map((tag, index) => (
                  <span key={index} className="bg-white/20 text-white px-2 py-1 rounded-lg text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-xs">Updated {new Date(project.updated_at).toLocaleDateString()}</p>
                <div className="flex space-x-2">
                  <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}

{!loading && !error && sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-white/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
              <p className="text-white/70 mb-4">Your database is empty. Create some sample projects to get started!</p>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={async () => {
                    console.log('🔴 BUTTON CLICKED - Create Sample Projects');
                    console.log('🔴 User:', user);
                    console.log('🔴 User ID:', user?.id);

                    if (user?.id) {
                      console.log('✅ User ID exists, proceeding...');
                      setLoading(true);
                      console.log('🏗️ Creating sample projects...');

                      try {
                        const success = await SupabaseProjectService.createSampleProjects(user.id);
                        console.log('🔴 Sample projects creation result:', success);

                        if (success) {
                          console.log('✅ Sample projects created, reloading...');
                          window.location.reload(); // Simple refresh to show new projects
                        } else {
                          console.error('❌ Failed to create sample projects');
                          alert('Failed to create sample projects. Please check the console for errors.');
                        }
                      } catch (error) {
                        console.error('❌ Error during sample project creation:', error);
                        alert('Error creating projects: ' + error);
                      } finally {
                        setLoading(false);
                      }
                    } else {
                      console.error('❌ No user ID available');
                      alert('No user ID available. Cannot create projects.');
                    }
                  }}
                  className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-lg transition-colors border border-blue-400/30 font-medium"
                >
                  🏗️ Create Sample Projects
                </button>

                <button
                  onClick={() => setFilter('all')}
                  className="text-white/70 hover:text-white text-sm"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;