import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [viewMode, setViewMode] = useState('grid');
  const [isListening, setIsListening] = useState(false);

  const handleSignOut = () => {
    navigate('/');
  };

  // Pro/Admin users have full access to voice features
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';

  const handleVoiceActivation = () => {
    console.log('🎤 [TeamPage] Voice activation initiated');
    console.log('🎤 [TeamPage] User access check:', {
      email: user?.email,
      hasAccess: hasVoiceAccess,
      timestamp: new Date().toISOString()
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      console.log('🎤 [TeamPage] SpeechRecognition API available, creating instance');

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log('🎤 [TeamPage] Recognition configuration:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });

      setIsListening(true);
      console.log('🎤 [TeamPage] Set listening state to true');

      recognition.onstart = () => {
        console.log('🎤 [TeamPage] Voice recognition started successfully');
        console.log('🎤 [TeamPage] Microphone is now active and listening...');
      };

      recognition.onresult = (event) => {
        console.log('🎤 [TeamPage] Voice recognition result received');
        console.log('🎤 [TeamPage] Full event object:', event);

        const results = event.results;
        const resultIndex = event.resultIndex;
        const transcript = results[resultIndex][0].transcript;
        const confidence = results[resultIndex][0].confidence;

        console.log('🎤 [TeamPage] Speech detection details:', {
          transcript: transcript,
          confidence: confidence,
          resultIndex: resultIndex,
          totalResults: results.length,
          timestamp: new Date().toISOString()
        });

        console.log('🎤 [TeamPage] Voice command processed:', transcript);
        alert(`🎤 Voice Command Detected!\n\nTranscript: "${transcript}"\nConfidence: ${Math.round(confidence * 100)}%\n\n✅ Voice agent activated successfully!`);
      };

      recognition.onspeechstart = () => {
        console.log('🎤 [TeamPage] Speech detected - user is speaking');
      };

      recognition.onspeechend = () => {
        console.log('🎤 [TeamPage] Speech ended - user stopped speaking');
      };

      recognition.onaudiostart = () => {
        console.log('🎤 [TeamPage] Audio input started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 [TeamPage] Audio input ended');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 [TeamPage] Voice recognition session ended');
        console.log('🎤 [TeamPage] Set listening state to false');
        console.log('🎤 [TeamPage] Ready for next voice command');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('🎤 [TeamPage] Voice recognition error occurred:', {
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

        console.error('🎤 [TeamPage] User-friendly error message:', errorMessage);
        alert(`🎤 Voice Recognition Error\n\n${errorMessage}\n\nPlease try again.`);
      };

      console.log('🎤 [TeamPage] Starting voice recognition...');
      try {
        recognition.start();
        console.log('🎤 [TeamPage] Recognition.start() called successfully');
      } catch (error) {
        console.error('🎤 [TeamPage] Error starting recognition:', error);
        setIsListening(false);
        alert('Failed to start voice recognition. Please try again.');
      }
    } else {
      console.error('🎤 [TeamPage] SpeechRecognition API not supported');
      console.log('🎤 [TeamPage] Browser compatibility check failed');
      console.log('🎤 [TeamPage] Available APIs:', {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        SpeechRecognition: 'SpeechRecognition' in window,
        userAgent: navigator.userAgent
      });
      alert('🎤 Speech Recognition Not Supported\n\nYour browser does not support voice recognition.\nPlease use Chrome, Edge, or Safari for voice features.');
    }
  };

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'Product Designer',
      department: 'Design',
      status: 'active',
      avatar: 'SC',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      projectsCount: 4,
      tasksCompleted: 127,
      skills: ['UI/UX', 'Figma', 'Prototyping', 'User Research'],
      currentProjects: ['Mobile App Redesign', 'Customer Portal'],
      location: 'San Francisco, CA',
      timezone: 'PST'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Frontend Developer',
      department: 'Engineering',
      status: 'active',
      avatar: 'MJ',
      joinDate: '2023-08-20',
      lastActive: '30 minutes ago',
      projectsCount: 3,
      tasksCompleted: 89,
      skills: ['React', 'TypeScript', 'CSS', 'Node.js'],
      currentProjects: ['Mobile App Redesign', 'Website Launch'],
      location: 'New York, NY',
      timezone: 'EST'
    },
    {
      id: 3,
      name: 'Alex Liu',
      email: 'alex.liu@company.com',
      role: 'Backend Developer',
      department: 'Engineering',
      status: 'busy',
      avatar: 'AL',
      joinDate: '2024-03-10',
      lastActive: '1 hour ago',
      projectsCount: 2,
      tasksCompleted: 67,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      currentProjects: ['API Integration', 'Website Launch'],
      location: 'Seattle, WA',
      timezone: 'PST'
    },
    {
      id: 4,
      name: 'Kate Lopez',
      email: 'kate.lopez@company.com',
      role: 'Project Manager',
      department: 'Operations',
      status: 'active',
      avatar: 'KL',
      joinDate: '2023-05-12',
      lastActive: '15 minutes ago',
      projectsCount: 6,
      tasksCompleted: 203,
      skills: ['Agile', 'Scrum', 'Risk Management', 'Leadership'],
      currentProjects: ['Website Launch', 'Customer Portal', 'Security Audit'],
      location: 'Austin, TX',
      timezone: 'CST'
    },
    {
      id: 5,
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'DevOps Engineer',
      department: 'Engineering',
      status: 'away',
      avatar: 'DK',
      joinDate: '2023-11-08',
      lastActive: '2 days ago',
      projectsCount: 3,
      tasksCompleted: 156,
      skills: ['AWS', 'Kubernetes', 'Jenkins', 'Terraform'],
      currentProjects: ['Security Audit', 'API Integration'],
      location: 'Remote',
      timezone: 'PST'
    },
    {
      id: 6,
      name: 'Emma Wilson',
      email: 'emma.wilson@company.com',
      role: 'QA Engineer',
      department: 'Quality',
      status: 'active',
      avatar: 'EW',
      joinDate: '2024-02-01',
      lastActive: '4 hours ago',
      projectsCount: 4,
      tasksCompleted: 94,
      skills: ['Test Automation', 'Selenium', 'Jest', 'Manual Testing'],
      currentProjects: ['Mobile App Redesign', 'Customer Portal'],
      location: 'London, UK',
      timezone: 'GMT'
    },
    {
      id: 7,
      name: 'Ryan Torres',
      email: 'ryan.torres@company.com',
      role: 'Data Analyst',
      department: 'Analytics',
      status: 'offline',
      avatar: 'RT',
      joinDate: '2023-09-15',
      lastActive: '1 day ago',
      projectsCount: 2,
      tasksCompleted: 78,
      skills: ['SQL', 'Python', 'Tableau', 'Statistics'],
      currentProjects: ['Dashboard Analytics'],
      location: 'Toronto, CA',
      timezone: 'EST'
    },
    {
      id: 8,
      name: 'Lisa Martinez',
      email: 'lisa.martinez@company.com',
      role: 'Marketing Manager',
      department: 'Marketing',
      status: 'active',
      avatar: 'LM',
      joinDate: '2023-07-03',
      lastActive: '1 hour ago',
      projectsCount: 3,
      tasksCompleted: 112,
      skills: ['Content Strategy', 'SEO', 'Social Media', 'Analytics'],
      currentProjects: ['Website Launch', 'Customer Portal'],
      location: 'Miami, FL',
      timezone: 'EST'
    }
  ];

  const departments = [
    { name: 'Engineering', count: 4, color: 'bg-blue-500/20 text-blue-100' },
    { name: 'Design', count: 1, color: 'bg-purple-500/20 text-purple-100' },
    { name: 'Operations', count: 1, color: 'bg-green-500/20 text-green-100' },
    { name: 'Quality', count: 1, color: 'bg-orange-500/20 text-orange-100' },
    { name: 'Analytics', count: 1, color: 'bg-indigo-500/20 text-indigo-100' },
    { name: 'Marketing', count: 1, color: 'bg-pink-500/20 text-pink-100' }
  ];

  const recentActivity = [
    { id: 1, user: 'Sarah Chen', action: 'completed design review for Mobile App', time: '2 hours ago', type: 'task' },
    { id: 2, user: 'Mike Johnson', action: 'pushed code to Website Launch repository', time: '3 hours ago', type: 'code' },
    { id: 3, user: 'Kate Lopez', action: 'scheduled team meeting for next week', time: '4 hours ago', type: 'meeting' },
    { id: 4, user: 'Alex Liu', action: 'deployed API changes to staging', time: '6 hours ago', type: 'deployment' },
    { id: 5, user: 'Emma Wilson', action: 'reported 3 bugs in Mobile App testing', time: '8 hours ago', type: 'bug' },
    { id: 6, user: 'Lisa Martinez', action: 'updated marketing campaign materials', time: '10 hours ago', type: 'content' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      default:
        return 'Offline';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'code':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
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
                className="text-white px-3 py-2 rounded-md text-sm font-medium bg-white/20"
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

      {/* Team Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Team</h1>
            <p className="text-white/80">Manage your team members and collaboration</p>
          </div>
          <button className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white px-6 py-3 hover:bg-white/20 transition-all duration-300 inline-flex items-center space-x-2 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Invite Member</span>
          </button>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Total Members</h3>
                <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                <p className="text-white/70 text-sm">Across {departments.length} departments</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Active Now</h3>
                <p className="text-2xl font-bold text-white">{teamMembers.filter(m => m.status === 'active').length}</p>
                <p className="text-white/70 text-sm">Online and available</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Active Projects</h3>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-white/70 text-sm">With team members</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Tasks This Week</h3>
                <p className="text-2xl font-bold text-white">147</p>
                <p className="text-white/70 text-sm">Completed by team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'members' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'departments' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'activity' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Recent Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'members' && (
          <div>
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Team Members */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {teamMembers.map((member) => (
                <div key={member.id} className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}>
                  {/* Member Header */}
                  <div className={`flex items-center ${viewMode === 'list' ? 'space-x-4 flex-shrink-0' : 'mb-4'}`}>
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{member.avatar}</span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white/20`}></div>
                    </div>
                    <div className={viewMode === 'list' ? '' : 'ml-4'}>
                      <h3 className="text-white font-bold">{member.name}</h3>
                      <p className="text-white/70 text-sm">{member.role}</p>
                      <p className="text-white/60 text-xs">{getStatusText(member.status)} • {member.lastActive}</p>
                    </div>
                  </div>

                  {viewMode === 'grid' && (
                    <>
                      {/* Member Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-white/60 text-xs">Department</p>
                          <p className="text-white text-sm">{member.department}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">Location</p>
                          <p className="text-white text-sm">{member.location}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">Projects</p>
                          <p className="text-white text-sm">{member.projectsCount}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">Tasks Done</p>
                          <p className="text-white text-sm">{member.tasksCompleted}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <p className="text-white/60 text-xs mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-white/20 text-white px-2 py-1 rounded-lg text-xs">
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="text-white/60 text-xs">+{member.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      {/* Current Projects */}
                      <div className="mb-4">
                        <p className="text-white/60 text-xs mb-2">Current Projects</p>
                        <div className="space-y-1">
                          {member.currentProjects.slice(0, 2).map((project, index) => (
                            <p key={index} className="text-white text-xs bg-white/10 rounded px-2 py-1">
                              {project}
                            </p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {viewMode === 'list' && (
                    <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-white/60 text-xs">Department</p>
                        <p className="text-white">{member.department}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Location</p>
                        <p className="text-white">{member.location}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Projects</p>
                        <p className="text-white">{member.projectsCount}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Tasks Done</p>
                        <p className="text-white">{member.tasksCompleted}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className={`flex ${viewMode === 'list' ? 'space-x-2 flex-shrink-0' : 'justify-between pt-4 border-t border-white/10'}`}>
                    <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${dept.color}`}>
                    {dept.count} members
                  </span>
                </div>
                <div className="space-y-2">
                  {teamMembers
                    .filter(member => member.department === dept.name)
                    .map(member => (
                      <div key={member.id} className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{member.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{member.name}</p>
                          <p className="text-white/70 text-xs">{member.role}</p>
                        </div>
                        <div className={`w-2 h-2 ${getStatusColor(member.status)} rounded-full`}></div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Team Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-white/10 last:border-b-0">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-white/60 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;