import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import WeeklyGoalsCardDashboard from '../WeeklyGoalsCard-Dashboard';
import WeeklyGoalsModal from '../WeeklyGoalsModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime] = useState(new Date());
  const [selectedProjects, setSelectedProjects] = useState([1, 2]); // Show first 2 projects by default
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWeeklyGoalsModal, setShowWeeklyGoalsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    // In a real app, this would clear auth state
    navigate('/');
  };

  // Pro/Admin users have full access to voice features - Debug info
  console.log('🎤 Dashboard Debug - User:', user?.email, 'Should have access:', user?.email === 'edovankampen@outlook.com');
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';
  console.log('🎤 Dashboard hasVoiceAccess:', hasVoiceAccess);

  const handleVoiceActivation = () => {
    console.log('🎤 [Dashboard] Voice activation initiated');
    console.log('🎤 [Dashboard] User access check:', {
      email: user?.email,
      hasAccess: hasVoiceAccess,
      timestamp: new Date().toISOString()
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      console.log('🎤 [Dashboard] SpeechRecognition API available, creating instance');

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log('🎤 [Dashboard] Recognition configuration:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });

      setIsListening(true);
      console.log('🎤 [Dashboard] Set listening state to true');

      recognition.onstart = () => {
        console.log('🎤 [Dashboard] Voice recognition started successfully');
        console.log('🎤 [Dashboard] Microphone is now active and listening...');
      };

      recognition.onresult = (event) => {
        console.log('🎤 [Dashboard] Voice recognition result received');
        console.log('🎤 [Dashboard] Full event object:', event);

        const results = event.results;
        const resultIndex = event.resultIndex;
        const transcript = results[resultIndex][0].transcript;
        const confidence = results[resultIndex][0].confidence;

        console.log('🎤 [Dashboard] Speech detection details:', {
          transcript: transcript,
          confidence: confidence,
          resultIndex: resultIndex,
          totalResults: results.length,
          timestamp: new Date().toISOString()
        });

        console.log('🎤 [Dashboard] Voice command processed:', transcript);

        // Enhanced alert with more details
        alert(`🎤 Voice Command Detected!\n\nTranscript: "${transcript}"\nConfidence: ${Math.round(confidence * 100)}%\n\n✅ Voice agent activated successfully!`);
      };

      recognition.onspeechstart = () => {
        console.log('🎤 [Dashboard] Speech detected - user is speaking');
      };

      recognition.onspeechend = () => {
        console.log('🎤 [Dashboard] Speech ended - user stopped speaking');
      };

      recognition.onaudiostart = () => {
        console.log('🎤 [Dashboard] Audio input started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 [Dashboard] Audio input ended');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 [Dashboard] Voice recognition session ended');
        console.log('🎤 [Dashboard] Set listening state to false');
        console.log('🎤 [Dashboard] Ready for next voice command');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('🎤 [Dashboard] Voice recognition error occurred:', {
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

        console.error('🎤 [Dashboard] User-friendly error message:', errorMessage);
        alert(`🎤 Voice Recognition Error\n\n${errorMessage}\n\nPlease try again.`);
      };

      console.log('🎤 [Dashboard] Starting voice recognition...');
      try {
        recognition.start();
        console.log('🎤 [Dashboard] Recognition.start() called successfully');
      } catch (error) {
        console.error('🎤 [Dashboard] Error starting recognition:', error);
        setIsListening(false);
        alert('Failed to start voice recognition. Please try again.');
      }
    } else {
      console.error('🎤 [Dashboard] SpeechRecognition API not supported');
      console.log('🎤 [Dashboard] Browser compatibility check failed');
      console.log('🎤 [Dashboard] Available APIs:', {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        SpeechRecognition: 'SpeechRecognition' in window,
        userAgent: navigator.userAgent
      });
      alert('🎤 Speech Recognition Not Supported\n\nYour browser does not support voice recognition.\nPlease use Chrome, Edge, or Safari for voice features.');
    }
  };

  const allProjects = [
    { id: 1, name: 'Mobile App Redesign', description: 'UX/UI overhaul for mobile application', status: 'On Track', statusColor: 'bg-green-500/20 text-green-100', progress: 75, team: ['SC', 'MJ', '+3'], progressColor: 'bg-green-400/70' },
    { id: 2, name: 'Website Launch', description: 'Marketing website development', status: 'Behind', statusColor: 'bg-yellow-500/20 text-yellow-100', progress: 45, team: ['AL', 'KL'], progressColor: 'bg-yellow-400/70' },
    { id: 3, name: 'API Integration', description: 'Backend service integration', status: 'Planning', statusColor: 'bg-blue-500/20 text-blue-100', progress: 15, team: ['DJ'], progressColor: 'bg-blue-400/70' },
    { id: 4, name: 'Security Audit', description: 'Comprehensive security review', status: 'On Hold', statusColor: 'bg-gray-500/20 text-gray-100', progress: 30, team: ['RT', 'EW'], progressColor: 'bg-gray-400/70' },
    { id: 5, name: 'Customer Portal', description: 'Self-service customer interface', status: 'In Progress', statusColor: 'bg-blue-500/20 text-blue-100', progress: 60, team: ['LM', 'SC', '+2'], progressColor: 'bg-blue-400/70' },
    { id: 6, name: 'Analytics Dashboard', description: 'Data visualization platform', status: 'Completed', statusColor: 'bg-emerald-500/20 text-emerald-100', progress: 100, team: ['RT', 'MJ'], progressColor: 'bg-emerald-400/70' }
  ];

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };

    if (showProjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectDropdown]);

  const handleProjectToggle = (projectId: number) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else if (selectedProjects.length < 3) {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const recentActivity = [
    { id: 1, action: 'Created project "Mobile App Redesign"', time: '2 hours ago', user: 'You' },
    { id: 2, action: 'Completed task "Design wireframes"', time: '4 hours ago', user: 'Sarah Chen' },
    { id: 3, action: 'Updated project status to "In Progress"', time: '6 hours ago', user: 'Mike Johnson' },
    { id: 4, action: 'Added new team member', time: '1 day ago', user: 'You' },
  ];

  const upcomingTasks = [
    { id: 1, title: 'Review design mockups', project: 'Mobile App Redesign', dueDate: 'Today', priority: 'high' },
    { id: 2, title: 'Team standup meeting', project: 'Website Launch', dueDate: 'Tomorrow', priority: 'medium' },
    { id: 3, title: 'Client presentation', project: 'API Integration', dueDate: 'Oct 5', priority: 'high' },
    { id: 4, title: 'Code review', project: 'Mobile App Redesign', dueDate: 'Oct 6', priority: 'low' },
  ];

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
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <Link
                to="/dashboard"
                className="text-white px-3 py-2 rounded-lg font-medium bg-white/20"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium hover:bg-white/10"
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
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/team"
                className="text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium hover:bg-white/10"
              >
                Team
              </Link>
              <Link
                to="/profile"
                className="text-white hover:text-white transition-colors px-4 py-2 rounded-lg font-medium bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}!
          </h1>
          <p className="text-white/80">Here's what's happening with your projects today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Active Projects</h3>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-white/70 text-sm">+2 this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Tasks Completed</h3>
                <p className="text-2xl font-bold text-white">47</p>
                <p className="text-white/70 text-sm">This week</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Due Today</h3>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-white/70 text-sm">Tasks pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Team Members</h3>
                <p className="text-2xl font-bold text-white">15</p>
                <p className="text-white/70 text-sm">12 active today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Project Overview</h2>
              <div className="flex items-center space-x-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm hover:bg-white/15 transition-colors flex items-center space-x-2"
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span>Select Projects</span>
                  </button>
                  {showProjectDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 min-w-[280px] max-h-[400px] overflow-y-auto shadow-2xl z-[9999]">
                      <p className="text-white/80 text-xs mb-2">Choose up to 3 projects to display:</p>
                      <div className="space-y-2">
                        {allProjects.map((project) => (
                          <label key={project.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white/10">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes(project.id)}
                              onChange={() => handleProjectToggle(project.id)}
                              disabled={!selectedProjects.includes(project.id) && selectedProjects.length >= 3}
                              className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{project.name}</p>
                              <p className="text-white/60 text-xs truncate">{project.description}</p>
                            </div>
                            <div className="w-8 text-white/70 text-xs text-right">{project.progress}%</div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/projects"
                  className="text-white/70 hover:text-white text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>

            {/* Selected Projects Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProjects.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 text-center py-8">
                  <svg className="w-12 h-12 text-white/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-white/70 mb-2">No projects selected</p>
                  <p className="text-white/50 text-sm">Click "Select Projects" to choose which projects to display</p>
                </div>
              ) : (
                allProjects
                  .filter(project => selectedProjects.includes(project.id))
                  .map((project) => (
                    <div key={project.id} className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm truncate">{project.name}</h3>
                          <p className="text-white/70 text-xs truncate">{project.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${project.statusColor}`}>
                          {project.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex -space-x-1">
                          {project.team.map((member, index) => (
                            <div key={index} className={`w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-medium text-white ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 && member.startsWith('+') ? 'bg-purple-500' : 'bg-red-500'
                            }`}>
                              {member}
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold text-sm">{project.progress}%</p>
                        </div>
                      </div>

                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div className={`${project.progressColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {selectedProjects.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  to="/projects/new"
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 py-2 hover:bg-white/15 transition-all duration-300 inline-flex items-center space-x-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Project</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity, Upcoming Tasks, and Weekly Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-white/20 pl-3">
                  <p className="text-white text-sm">{activity.action}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white/60 text-xs">{activity.user}</span>
                    <span className="text-white/60 text-xs">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-100' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-100' :
                      'bg-blue-500/20 text-blue-100'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mb-1">{task.project}</p>
                  <p className="text-white/60 text-xs">{task.dueDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="lg:col-span-1">
            <WeeklyGoalsCardDashboard
              onViewAll={() => setShowWeeklyGoalsModal(true)}
              className="h-fit"
            />
          </div>
        </div>

        {/* Calendar Overview Section */}
        <section className="mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-white">Calendar Overview</h2>
                <h3 className="text-xl font-light text-white/90">October 2025</h3>
              </div>
              <div className="flex space-x-2">
                <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-px mb-4">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="p-3 text-center">
                  <span className="text-white/80 font-medium text-sm">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px">
              {/* Week 1 */}
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white/60 text-sm"></span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">3</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-blue-500/30 rounded px-1 py-0.5 mb-1 truncate">Project Kickoff</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">4</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-purple-500/30 rounded px-1 py-0.5 mb-1 truncate">Design Sprint</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">5</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">6</span>
              </div>

              {/* Week 2 */}
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">7</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">8</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">9</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">10</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-green-500/30 rounded px-1 py-0.5 mb-1 truncate">Team Meeting</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">11</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">12</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-orange-500/30 rounded px-1 py-0.5 mb-1 truncate">Development</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">13</span>
              </div>

              {/* Week 3 */}
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">14</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">15</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">16</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">17</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">18</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-red-500/30 rounded px-1 py-0.5 mb-1 truncate">Testing Phase</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">19</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">20</span>
              </div>

              {/* Week 4 */}
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">21</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">22</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">23</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">24</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">25</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-yellow-500/30 rounded px-1 py-0.5 mb-1 truncate">Launch Prep</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">26</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">27</span>
              </div>

              {/* Week 5 */}
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">28</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">29</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors bg-white/5">
                <span className="text-white text-sm font-medium">30</span>
                <div className="mt-1">
                  <div className="text-xs text-white/90 bg-emerald-500/30 rounded px-1 py-0.5 mb-1 truncate">Product Launch</div>
                </div>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white text-sm font-medium">31</span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white/60 text-sm"></span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white/60 text-sm"></span>
              </div>
              <div className="aspect-square border border-white/20 p-2 relative rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-white/60 text-sm"></span>
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500/30 rounded"></div>
                <span className="text-white/70 text-xs">Project Events</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500/30 rounded"></div>
                <span className="text-white/70 text-xs">Meetings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500/30 rounded"></div>
                <span className="text-white/70 text-xs">Development</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500/30 rounded"></div>
                <span className="text-white/70 text-xs">Testing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500/30 rounded"></div>
                <span className="text-white/70 text-xs">Launches</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Weekly Goals Modal */}
      <WeeklyGoalsModal
        isOpen={showWeeklyGoalsModal}
        onClose={() => setShowWeeklyGoalsModal(false)}
      />
    </div>
  );
};

export default Dashboard;