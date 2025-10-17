import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { debugLogger } from '../../utils/debug-logger';
import Navigation from '../common/Navigation';

const COMPONENT_NAME = 'EnhancedProfilePage';

export function EnhancedProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security'>('profile');
  const [success, setSuccess] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
  });

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const startTime = performance.now();

  // Pro/Admin users have full access to voice features
  const hasVoiceAccess = user?.email === 'edovankampen@outlook.com' || user?.email === 'admin@projectflow.com';


  const handleVoiceActivation = () => {
    console.log('🎤 [ProfilePage] Voice activation initiated');
    console.log('🎤 [ProfilePage] User access check:', {
      email: user?.email,
      hasAccess: hasVoiceAccess,
      timestamp: new Date().toISOString()
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      console.log('🎤 [ProfilePage] SpeechRecognition API available, creating instance');

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      console.log('🎤 [ProfilePage] Recognition configuration:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });

      setIsListening(true);
      console.log('🎤 [ProfilePage] Set listening state to true');

      recognition.onstart = () => {
        console.log('🎤 [ProfilePage] Voice recognition started successfully');
        console.log('🎤 [ProfilePage] Microphone is now active and listening...');
      };

      recognition.onresult = (event) => {
        console.log('🎤 [ProfilePage] Voice recognition result received');
        console.log('🎤 [ProfilePage] Full event object:', event);

        const results = event.results;
        const resultIndex = event.resultIndex;
        const transcript = results[resultIndex][0].transcript;
        const confidence = results[resultIndex][0].confidence;

        console.log('🎤 [ProfilePage] Speech detection details:', {
          transcript: transcript,
          confidence: confidence,
          resultIndex: resultIndex,
          totalResults: results.length,
          timestamp: new Date().toISOString()
        });

        console.log('🎤 [ProfilePage] Voice command processed:', transcript);
        alert(`🎤 Voice Command Detected!\n\nTranscript: "${transcript}"\nConfidence: ${Math.round(confidence * 100)}%\n\n✅ Voice agent activated successfully!`);
      };

      recognition.onspeechstart = () => {
        console.log('🎤 [ProfilePage] Speech detected - user is speaking');
      };

      recognition.onspeechend = () => {
        console.log('🎤 [ProfilePage] Speech ended - user stopped speaking');
      };

      recognition.onaudiostart = () => {
        console.log('🎤 [ProfilePage] Audio input started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 [ProfilePage] Audio input ended');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 [ProfilePage] Voice recognition session ended');
        console.log('🎤 [ProfilePage] Set listening state to false');
        console.log('🎤 [ProfilePage] Ready for next voice command');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('🎤 [ProfilePage] Voice recognition error occurred:', {
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

        console.error('🎤 [ProfilePage] User-friendly error message:', errorMessage);
        alert(`🎤 Voice Recognition Error\n\n${errorMessage}\n\nPlease try again.`);
      };

      console.log('🎤 [ProfilePage] Starting voice recognition...');
      try {
        recognition.start();
        console.log('🎤 [ProfilePage] Recognition.start() called successfully');
      } catch (error) {
        console.error('🎤 [ProfilePage] Error starting recognition:', error);
        setIsListening(false);
        alert('Failed to start voice recognition. Please try again.');
      }
    } else {
      console.error('🎤 [ProfilePage] SpeechRecognition API not supported');
      console.log('🎤 [ProfilePage] Browser compatibility check failed');
      console.log('🎤 [ProfilePage] Available APIs:', {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        SpeechRecognition: 'SpeechRecognition' in window,
        userAgent: navigator.userAgent
      });
      alert('🎤 Speech Recognition Not Supported\n\nYour browser does not support voice recognition.\nPlease use Chrome, Edge, or Safari for voice features.');
    }
  };

  // Component lifecycle logging
  useEffect(() => {
    const endTime = performance.now();
    debugLogger.componentMount(COMPONENT_NAME, { user: user?.id });
    debugLogger.pageLoad('/profile', COMPONENT_NAME, { start: startTime, end: endTime });

    return () => {
      debugLogger.componentUnmount(COMPONENT_NAME);
    };
  }, []);

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        debugLogger.debug('Profile Data', 'Initializing profile data', { userId: user?.id }, COMPONENT_NAME);
        setIsLoading(true);

        // Simulate API delay for testing
        await new Promise(resolve => setTimeout(resolve, 500));

        if (user) {
          const mockProfileData = {
            name: user.email?.split('@')[0] || 'Demo User',
            email: user.email || 'demo@example.com',
            bio: 'This is a demo profile for testing the project planner application.',
            location: 'Demo Location',
            website: 'https://demo.example.com',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email?.split('@')[0] || 'Demo User')}&background=random`,
          };

          setProfileData(mockProfileData);
          debugLogger.info('Profile Data', 'Profile data loaded successfully', mockProfileData, COMPONENT_NAME);
        } else {
          debugLogger.warn('Profile Data', 'No user found, using guest data', {}, COMPONENT_NAME);
          setProfileData({
            name: 'Guest User',
            email: 'guest@example.com',
            bio: 'Guest user profile',
            location: 'Unknown',
            website: '',
            avatar: 'https://ui-avatars.com/api/?name=Guest&background=gray',
          });
        }

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        debugLogger.pageError('/profile', COMPONENT_NAME, err as Error);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [user]);

  const handleTabChange = (tab: 'profile' | 'account' | 'security') => {
    debugLogger.userAction('Tab Changed', COMPONENT_NAME, { from: activeTab, to: tab });
    setActiveTab(tab);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      debugLogger.userAction('Profile Update Started', COMPONENT_NAME, {
        fields: Object.keys(profileData)
      });

      setIsLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (!profileData.name.trim()) {
        throw new Error('Name is required');
      }

      if (!profileData.email.trim()) {
        throw new Error('Email is required');
      }

      debugLogger.info('Profile Update', 'Profile updated successfully', profileData, COMPONENT_NAME);
      setSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      debugLogger.error('Profile Update', 'Profile update failed', { error: err }, COMPONENT_NAME);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    debugLogger.verbose('Form Input', `Field ${field} changed`, { field, valueLength: value.length }, COMPONENT_NAME);
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const renderProfileTab = () => {
    debugLogger.debug('Render', 'Rendering profile tab', {}, COMPONENT_NAME);

    return (
      <ErrorBoundary fallback={<div className="text-red-300">Error loading profile tab</div>}>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                         focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                placeholder="City, Country"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                           text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30
                           focus:border-transparent"
                placeholder="https://your-website.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30
                         text-white px-6 py-3 rounded-lg transition-all duration-300 border border-blue-400/30
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </ErrorBoundary>
    );
  };

  const renderAccountTab = () => {
    debugLogger.debug('Render', 'Rendering account tab', {}, COMPONENT_NAME);

    return (
      <ErrorBoundary fallback={<div className="text-red-300">Error loading account tab</div>}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Account Settings</h3>
          <p className="text-white/70">
            Manage your account preferences and settings.
          </p>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-yellow-200">
              🚧 Account settings are coming soon. This section will include subscription management,
              notification preferences, and privacy settings.
            </p>
          </div>
        </div>
      </ErrorBoundary>
    );
  };

  const renderSecurityTab = () => {
    debugLogger.debug('Render', 'Rendering security tab', {}, COMPONENT_NAME);

    return (
      <ErrorBoundary fallback={<div className="text-red-300">Error loading security tab</div>}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Security Settings</h3>
          <p className="text-white/70">
            Manage your account security and authentication preferences.
          </p>

          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <p className="text-blue-200">
              🔒 Security features are coming soon. This will include password changes,
              two-factor authentication, and session management.
            </p>
          </div>
        </div>
      </ErrorBoundary>
    );
  };

  // Early loading state
  if (isLoading && !profileData.name) {
    debugLogger.debug('Render', 'Showing initial loading state', {}, COMPONENT_NAME);
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
        {/* Navigation */}
        <Navigation activeSection="/profile" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-white text-xl flex items-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full"></div>
              <span>Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
        {/* Navigation */}
        <Navigation activeSection="/profile" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Profile & Settings</h1>
            <p className="text-white/80 mt-2 text-lg">Manage your account and preferences</p>
          </div>

          {/* Status Messages */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-xl backdrop-blur-md">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-8">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/20"
                    onError={(e) => {
                      debugLogger.warn('Image Load', 'Avatar failed to load', { src: profileData.avatar }, COMPONENT_NAME);
                      (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=gray';
                    }}
                  />
                  <h2 className="text-xl font-semibold text-white">{profileData.name}</h2>
                  <p className="text-white/70">{profileData.email}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {[
                    { key: 'profile', label: 'Profile', icon: '👤' },
                    { key: 'account', label: 'Account', icon: '⚙️' },
                    { key: 'security', label: 'Security', icon: '🔒' },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => handleTabChange(key as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === key
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'account' && renderAccountTab()}
                {activeTab === 'security' && renderSecurityTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default EnhancedProfilePage;