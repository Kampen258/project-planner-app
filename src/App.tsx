import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Temporarily using SimpleAuthContext to debug the blank page issue
import { SimpleAuthProvider, useAuth } from './contexts/SimpleAuthContext';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './components/pages/Dashboard-enhanced';
import ProjectsPage from './components/pages/ProjectsPage-enhanced';
import TeamPage from './components/pages/TeamPage-enhanced';
import EnhancedProfilePage from './components/pages/EnhancedProfilePage';

console.log('🚀 App.tsx: Loading App with Enhanced Pages...');

// App Content with All Pages
function AppContent() {
  const { user } = useAuth();
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);

  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/profile" element={<EnhancedProfilePage />} />
        <Route path="/analytics" element={<Dashboard />} />
        <Route path="*" element={
          <div style={{ padding: '20px', backgroundColor: '#e8f4fd', minHeight: '100vh' }}>
            <h1 style={{ color: '#2563eb' }}>🚀 ProjectFlow - Full Featured App!</h1>
            <p>✅ All pages are now available</p>
            <p>🎤 <strong>Voice Functionality Available!</strong></p>

            <div style={{ margin: '20px 0' }}>
              <h3>Available Pages:</h3>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li><a href="/" style={{ color: 'blue' }}>🏠 Landing Page</a></li>
                <li><a href="/login" style={{ color: 'blue' }}>🔐 Login Page</a></li>
                <li><a href="/dashboard" style={{ color: 'blue' }}>📊 Dashboard</a></li>
                <li><a href="/projects" style={{ color: 'blue' }}>📋 Projects</a></li>
                <li><a href="/team" style={{ color: 'blue' }}>👥 Team</a></li>
                <li><a href="/profile" style={{ color: 'blue' }}>👤 Profile</a></li>
              </ul>
            </div>

            <button
              onClick={() => {
                if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
                  const recognition = new SpeechRecognition();
                  recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    alert(`🎤 Voice detected: "${transcript}"\n\nVoice functionality is working!`);
                  };
                  recognition.start();
                } else {
                  alert('Speech recognition not supported in this browser');
                }
              }}
              style={{
                padding: '15px 30px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                margin: '10px 0',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🎤 TEST VOICE RECOGNITION
            </button>
          </div>
        } />
      </Routes>
    </div>
  );
}

// Main App component
const App: React.FC = () => {
  console.log('🎬 App.tsx: Rendering App with Voice Features...');

  return (
    <SimpleAuthProvider>
      <Router>
        <AppContent />
      </Router>
    </SimpleAuthProvider>
  );
};

export default App;