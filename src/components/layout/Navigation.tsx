import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);

  if (!user) return null;

  // Pro/Admin users have full access to voice features
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';

  const isActive = (path: string) => location.pathname === path;

  const stopVoiceRecognition = () => {
    console.log('🎤 [Navigation] Stopping voice recognition manually');
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setVoiceFeedback('');
    setRecognition(null);
  };

  const handleVoiceActivation = () => {
    console.log('🎤 [Navigation] Voice activation initiated');
    console.log('🎤 [Navigation] User access check:', {
      email: user?.email,
      hasAccess: hasVoiceAccess,
      timestamp: new Date().toISOString()
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      console.log('🎤 [Navigation] SpeechRecognition API available, creating instance');

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log('🎤 [Navigation] Recognition configuration:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });

      setIsListening(true);
      setVoiceFeedback('🎤 Initializing voice recognition...');
      setRecognition(recognition);
      console.log('🎤 [Navigation] Set listening state to true');

      recognition.onstart = () => {
        console.log('🎤 [Navigation] Voice recognition started successfully');
        console.log('🎤 [Navigation] Microphone is now active and listening...');
        setVoiceFeedback('🎤 Listening... Speak now!');
      };

      recognition.onresult = (event) => {
        console.log('🎤 [Navigation] Voice recognition result received');
        console.log('🎤 [Navigation] Full event object:', event);

        const results = event.results;
        const resultIndex = event.resultIndex;
        const transcript = results[resultIndex][0].transcript;
        const confidence = results[resultIndex][0].confidence;

        console.log('🎤 [Navigation] Speech detection details:', {
          transcript: transcript,
          confidence: confidence,
          resultIndex: resultIndex,
          totalResults: results.length,
          timestamp: new Date().toISOString()
        });

        console.log('🎤 [Navigation] Voice command processed:', transcript);

        // Generate AI agent response
        const generateAgentResponse = (userInput: string) => {
          const input = userInput.toLowerCase().trim();

          // Project management related responses
          if (input.includes('project') || input.includes('task')) {
            if (input.includes('create') || input.includes('new')) {
              return "✅ Creating new project! Taking you to the projects page where you can add a new project.";
            } else if (input.includes('status') || input.includes('update')) {
              return "✅ Checking project status! Opening your dashboard to show all project updates and progress.";
            }
            return "✅ Opening projects page! Here you can manage all your projects and tasks.";
          }

          // Navigation related responses
          if (input.includes('go to') || input.includes('navigate') || input.includes('open') || input.includes('show me')) {
            if (input.includes('dashboard') || input.includes('home')) {
              return "✅ Navigating to dashboard! You'll see your project overview and recent activity.";
            } else if (input.includes('project')) {
              return "✅ Opening projects page! Here you can view and manage all your projects.";
            } else if (input.includes('team')) {
              return "✅ Taking you to the team page! You can see team members and collaboration details.";
            } else if (input.includes('profile') || input.includes('settings')) {
              return "✅ Opening your profile! You can update your settings and personal information here.";
            }
            return "🤔 I can navigate you to: Dashboard, Projects, Team, or Profile. Try saying 'go to dashboard' for example.";
          }

          // Direct page name commands
          if (input.includes('dashboard') && !input.includes('show')) {
            return "✅ Opening dashboard! Your project overview and activity feed await.";
          } else if ((input.includes('project') || input.includes('projects')) && !input.includes('show')) {
            return "✅ Loading projects page! Manage your projects and create new ones here.";
          } else if (input.includes('team')) {
            return "✅ Accessing team page! Connect and collaborate with your team members.";
          } else if (input.includes('profile')) {
            return "✅ Opening profile settings! Update your account and preferences.";
          }

          // Help and assistance
          if (input.includes('help') || input.includes('what can you do') || input.includes('assist')) {
            return "🤖 I'm your ProjectFlow AI assistant! I can help you:\n\n• Navigate: 'Go to dashboard', 'Open projects', 'Show team'\n• Projects: 'Create new project', 'Project status' \n• Quick access: Just say 'Dashboard', 'Projects', 'Team', or 'Profile'\n\nTry any command and I'll take action!";
          }

          // Greetings
          if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            return `👋 Hello ${user?.email?.split('@')[0] || 'there'}! I'm your ProjectFlow assistant. I can help you navigate and manage your projects. Try saying 'go to dashboard' or 'help' to get started!`;
          }

          // Current page status
          if (input.includes('where am i') || input.includes('current page')) {
            const currentPage = location.pathname.replace('/', '') || 'home';
            return `📍 You're currently on the ${currentPage} page. Say 'go to [page name]' to navigate anywhere else!`;
          }

          // Default response for unrecognized commands
          return `🎯 I heard: "${userInput}"\n\n🤖 I'm still learning! Try these commands:\n• "Go to dashboard" - View your overview\n• "Open projects" - Manage projects\n• "Show team" - See team members\n• "Help" - See all commands`;
        };

        const agentResult = generateAgentResponse(transcript);
        let agentResponse = agentResult;
        let shouldNavigate = false;
        let navigationTarget = '';

        // Parse the response and check for navigation actions
        const input = transcript.toLowerCase().trim();

        if (input.includes('go to') || input.includes('navigate') || input.includes('open') ||
            input.includes('dashboard') || input.includes('project') || input.includes('team') || input.includes('profile')) {

          if (input.includes('dashboard') || input.includes('home')) {
            shouldNavigate = true;
            navigationTarget = '/dashboard';
          } else if (input.includes('project')) {
            shouldNavigate = true;
            navigationTarget = '/projects';
          } else if (input.includes('team')) {
            shouldNavigate = true;
            navigationTarget = '/team';
          } else if (input.includes('profile') || input.includes('settings')) {
            shouldNavigate = true;
            navigationTarget = '/profile';
          }
        }

        const feedbackMessage = shouldNavigate
          ? `📝 Voice Summary:\n"${transcript}"\nConfidence: ${Math.round(confidence * 100)}%\n\n🤖 AI Agent Reply:\n${agentResponse}\n\n🧭 Navigating in 2 seconds...`
          : `📝 Voice Summary:\n"${transcript}"\nConfidence: ${Math.round(confidence * 100)}%\n\n🤖 AI Agent Reply:\n${agentResponse}`;

        setVoiceFeedback(feedbackMessage);

        // Perform navigation after showing the message
        if (shouldNavigate && navigationTarget) {
          console.log('🎤 [Navigation] AI Agent navigating to:', navigationTarget);
          setTimeout(() => {
            setVoiceFeedback(feedbackMessage + '\n\n✅ Navigation complete!');
            navigate(navigationTarget);
            // Clear feedback after navigation
            setTimeout(() => setVoiceFeedback(''), 2000);
          }, 2000); // Navigate after showing the message for 2 seconds
        } else {
          // Clear feedback after 5 seconds for non-navigation responses
          setTimeout(() => setVoiceFeedback(''), 5000);
        }
      };

      recognition.onspeechstart = () => {
        console.log('🎤 [Navigation] Speech detected - user is speaking');
        setVoiceFeedback('🗣️ Speech detected... Processing...');
      };

      recognition.onspeechend = () => {
        console.log('🎤 [Navigation] Speech ended - user stopped speaking');
      };

      recognition.onaudiostart = () => {
        console.log('🎤 [Navigation] Audio input started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 [Navigation] Audio input ended');
      };

      recognition.onend = () => {
        setIsListening(false);
        setRecognition(null);
        setTimeout(() => setVoiceFeedback(''), 3000); // Clear feedback after 3 seconds
        console.log('🎤 [Navigation] Voice recognition session ended');
        console.log('🎤 [Navigation] Set listening state to false');
        console.log('🎤 [Navigation] Ready for next voice command');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('🎤 [Navigation] Voice recognition error occurred:', {
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

        console.error('🎤 [Navigation] User-friendly error message:', errorMessage);
        setVoiceFeedback(`❌ Error: ${errorMessage}\n\nClick to try again.`);
        setTimeout(() => setVoiceFeedback(''), 5000); // Clear error after 5 seconds
      };

      console.log('🎤 [Navigation] Starting voice recognition...');
      try {
        recognition.start();
        console.log('🎤 [Navigation] Recognition.start() called successfully');
      } catch (error) {
        console.error('🎤 [Navigation] Error starting recognition:', error);
        setIsListening(false);
        setVoiceFeedback('❌ Failed to start voice recognition. Please try again.');
        setTimeout(() => setVoiceFeedback(''), 3000);
      }
    } else {
      console.error('🎤 [Navigation] SpeechRecognition API not supported');
      console.log('🎤 [Navigation] Browser compatibility check failed');
      console.log('🎤 [Navigation] Available APIs:', {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        SpeechRecognition: 'SpeechRecognition' in window,
        userAgent: navigator.userAgent
      });
      setVoiceFeedback('🚫 Speech Recognition Not Supported\n\nYour browser does not support voice recognition.\nPlease use Chrome, Edge, or Safari for voice features.');
      setTimeout(() => setVoiceFeedback(''), 8000);
    }
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* LEFT: Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
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
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium ${
                isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium ${
                isActive('/projects') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
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

              {/* Voice Feedback Dropdown */}
              {(isListening || voiceFeedback) && (
                <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 z-50">
                  {/* Pointer pointing up to microphone */}
                  <div className="relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/15 backdrop-blur-md border-t border-l border-white/20 rotate-45"></div>

                    {/* Dropdown content */}
                    <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[320px] shadow-xl animate-in fade-in duration-200">
                      {/* Header with stop button */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
                          <span className="text-white font-medium text-sm">
                            {isListening ? 'Voice Assistant Active' : 'Voice Complete'}
                          </span>
                        </div>
                        {isListening && (
                          <button
                            onClick={stopVoiceRecognition}
                            className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 hover:text-red-100 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 6h12v12H6z"/>
                            </svg>
                            <span>Stop</span>
                          </button>
                        )}
                      </div>

                      {/* Feedback text */}
                      <div className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                        {voiceFeedback || 'Ready to listen...'}
                      </div>

                      {/* Visual indicator for listening */}
                      {isListening && (
                        <div className="flex items-center justify-center mt-3 pt-2 border-t border-white/10">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RIGHT NAVIGATION */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/team"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg font-medium ${
                isActive('/team') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Team
            </Link>
            <Link
              to="/profile"
              className={`text-white hover:text-white transition-colors px-4 py-2 rounded-lg font-medium bg-blue-500/20 border border-blue-400/30 ${
                isActive('/profile') ? 'bg-blue-500/40' : 'hover:bg-blue-500/30'
              }`}
            >
              Profile
            </Link>
            <button
              onClick={signOut}
              className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/dashboard"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/projects') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Projects
            </Link>

            {/* Mobile Voice Microphone Icon - Only for paid subscriptions */}
            {hasVoiceAccess && (
              <button
                onClick={handleVoiceActivation}
                className={`relative p-2 rounded-full transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500/30 border-2 border-red-400 shadow-lg animate-pulse'
                    : 'bg-white/20 border-2 border-white/30 hover:bg-white/30 hover:border-white/50'
                }`}
                title={isListening ? "Listening..." : "Click to activate voice commands"}
              >
                <svg
                  className={`w-4 h-4 transition-colors ${
                    isListening ? 'text-red-200' : 'text-white'
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

                {/* Listening indicator */}
                {isListening && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                )}
              </button>

              {/* Mobile Voice Feedback Dropdown */}
              {(isListening || voiceFeedback) && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/15 backdrop-blur-md border-t border-l border-white/20 rotate-45"></div>
                    <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 min-w-[280px] shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
                          <span className="text-white font-medium text-xs">
                            {isListening ? 'Listening' : 'Complete'}
                          </span>
                        </div>
                        {isListening && (
                          <button
                            onClick={stopVoiceRecognition}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-2 py-1 rounded text-xs"
                          >
                            Stop
                          </button>
                        )}
                      </div>
                      <div className="text-white/90 text-xs leading-relaxed whitespace-pre-line">
                        {voiceFeedback || 'Ready...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            )}

            <Link
              to="/team"
              className={`text-white/90 hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/team') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Team
            </Link>
            <Link
              to="/profile"
              className={`text-white hover:text-white transition-colors px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/20 border border-blue-400/30 ${
                isActive('/profile') ? 'bg-blue-500/40' : 'hover:bg-blue-500/30'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;