import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
// Adding back the working page components
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './components/pages/Dashboard-KPI';
import ProjectsPage from './components/pages/ProjectsPage-enhanced';
import HomePage from './components/pages/HomePage-Planner';
import TeamPage from './components/pages/TeamPage-enhanced';
import ProfilePage from './components/pages/EnhancedProfilePage';
import DesignSystemPage from './components/pages/DesignSystemPageSafe';
import ProjectDetailsPage from './components/pages/ProjectDetailsPage';
import ProjectCreatePage from './components/pages/ProjectCreatePage';
import NewAgileProjectPage from './components/pages/NewAgileProjectPage';

console.log('🚀 App.tsx: Starting with Router and Auth...');

// Simple test page component
const TestPage = ({ title, color = '#2563eb' }: { title: string; color?: string }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#e8f4fd',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1 style={{ color }}>🚀 {title}</h1>
    <p>✅ React Router is working!</p>
    <p>✅ SimpleAuth is working!</p>
    <p>Timestamp: {new Date().toLocaleString()}</p>

    <div style={{ marginTop: '20px' }}>
      <h3>Navigation Test:</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Home</a>
        <a href="/dashboard" style={{ color: 'blue', textDecoration: 'underline' }}>Dashboard</a>
        <a href="/projects" style={{ color: 'blue', textDecoration: 'underline' }}>Projects</a>
      </div>
    </div>
  </div>
);

// Main App component
const App: React.FC = () => {
  console.log('🎬 App.tsx: Rendering with Router and Auth...');

  try {
    return (
      <SimpleAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/create" element={<ProjectCreatePage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/new-agile" element={<NewAgileProjectPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<TestPage title="404 - Page Not Found" color="#f59e0b" />} />
          </Routes>
        </Router>
      </SimpleAuthProvider>
    );
  } catch (error) {
    console.error('❌ Error in App render:', error);
    return (
      <div style={{ padding: '20px', color: 'red', backgroundColor: 'white' }}>
        <h1>🚫 App Error!</h1>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {error?.toString()}
        </pre>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
};

export default App;