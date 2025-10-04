import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isListening, setIsListening] = useState(false);

  const handleSignOut = () => {
    navigate('/');
  };

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

  const projects = [
    {
      id: 1,
      name: 'Mobile App Redesign',
      description: 'Complete UX/UI overhaul for our mobile application to improve user experience',
      status: 'in_progress',
      progress: 75,
      dueDate: '2025-11-15',
      priority: 'high',
      tags: ['Design', 'Mobile', 'UX'],
      teamSize: 5,
      lastUpdate: '2 hours ago',
      budget: 45000,
      tasksCompleted: 28,
      totalTasks: 42
    },
    {
      id: 2,
      name: 'Website Launch',
      description: 'New marketing website development with modern design and CMS integration',
      status: 'behind',
      progress: 45,
      dueDate: '2025-10-30',
      priority: 'high',
      tags: ['Web', 'Marketing', 'CMS'],
      teamSize: 3,
      lastUpdate: '1 day ago',
      budget: 28000,
      tasksCompleted: 15,
      totalTasks: 35
    },
    {
      id: 3,
      name: 'API Integration',
      description: 'Backend service integration and API development for data synchronization',
      status: 'planning',
      progress: 15,
      dueDate: '2025-12-01',
      priority: 'medium',
      tags: ['Backend', 'API', 'Integration'],
      teamSize: 2,
      lastUpdate: '3 days ago',
      budget: 32000,
      tasksCompleted: 3,
      totalTasks: 25
    },
    {
      id: 4,
      name: 'Dashboard Analytics',
      description: 'Advanced analytics dashboard with real-time reporting and data visualization',
      status: 'completed',
      progress: 100,
      dueDate: '2025-09-30',
      priority: 'medium',
      tags: ['Analytics', 'Dashboard', 'Charts'],
      teamSize: 4,
      lastUpdate: '1 week ago',
      budget: 38000,
      tasksCompleted: 22,
      totalTasks: 22
    },
    {
      id: 5,
      name: 'Security Audit',
      description: 'Comprehensive security audit and implementation of security best practices',
      status: 'on_hold',
      progress: 30,
      dueDate: '2025-11-30',
      priority: 'high',
      tags: ['Security', 'Audit', 'Infrastructure'],
      teamSize: 2,
      lastUpdate: '2 weeks ago',
      budget: 25000,
      tasksCompleted: 8,
      totalTasks: 18
    },
    {
      id: 6,
      name: 'Customer Portal',
      description: 'Self-service customer portal with account management and support features',
      status: 'in_progress',
      progress: 60,
      dueDate: '2025-12-15',
      priority: 'medium',
      tags: ['Portal', 'Customer', 'Frontend'],
      teamSize: 6,
      lastUpdate: '4 hours ago',
      budget: 55000,
      tasksCompleted: 18,
      totalTasks: 30
    }
  ];

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
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      default: // recent
        return b.id - a.id;
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
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* LEFT: Logo */}
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-white">ProjectFlow</span>
              </Link>
            </div>

            {/* LEFT NAVIGATION */}
            <div className="flex items-center space-x-6 ml-8">
              <Link
                to="/dashboard"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="text-white px-3 py-2 rounded-md text-sm font-medium bg-white/20"
              >
                Projects
              </Link>
            </div>

            {/* CENTER: Prominent Voice Microphone - Only for paid subscriptions */}
            {hasVoiceAccess && (
              <div className="flex-1 flex justify-center">
                <button
                  onClick={handleVoiceActivation}
                  className={`relative px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    isListening
                      ? 'bg-red-500/40 border-2 border-red-300 shadow-xl animate-pulse scale-110'
                      : 'bg-white/30 border-2 border-white/40 hover:bg-white/40 hover:border-white/60 shadow-lg'
                  }`}
                  title={isListening ? "🎤 Listening..." : "🎤 Click to activate voice assistant"}
                >
                  <svg
                    className={`w-5 h-5 transition-all duration-300 ${
                      isListening ? 'text-red-100' : 'text-white drop-shadow-sm'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>

                  {/* Listening indicator with glow effect */}
                  {isListening && (
                    <>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 bg-red-400/20 rounded-full animate-pulse"></div>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* RIGHT NAVIGATION */}
            <div className="flex items-center space-x-6">
              <Link
                to="/team"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              >
                Team
              </Link>
              <Link
                to="/profile"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

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

        {/* Projects Grid */}
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
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
                    {new Date(project.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Team Size</p>
                  <p className="text-white text-sm font-medium">{project.teamSize} members</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Budget</p>
                  <p className="text-white text-sm font-medium">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Tasks</p>
                  <p className="text-white text-sm font-medium">{project.tasksCompleted}/{project.totalTasks}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, index) => (
                  <span key={index} className="bg-white/20 text-white px-2 py-1 rounded-lg text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-xs">Updated {project.lastUpdate}</p>
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
            </div>
          ))}
        </div>

        {sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-white/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
              <p className="text-white/70 mb-4">No projects match your current filters.</p>
              <button
                onClick={() => setFilter('all')}
                className="text-white hover:underline"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;