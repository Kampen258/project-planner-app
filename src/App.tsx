import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import ProjectsPage from './components/pages/ProjectsPage-enhanced';
import HomePage from './components/pages/HomePage-Planner';
import Dashboard from './components/pages/Dashboard-KPI';
import ProjectDetailsPage from './components/pages/ProjectDetailsPage';

console.log('🚀 App.tsx: TESTING PROJECTDETAILSPAGE IMPORT');

// Simple test component
const TestPage = ({ title }: { title: string }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#e8f4fd',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1 style={{ color: '#2563eb' }}>🚀 {title}</h1>
    <p>✅ React Router is working!</p>
    <p>Timestamp: {new Date().toLocaleString()}</p>
    <div style={{ marginTop: '20px' }}>
      <a href="/" style={{ marginRight: '10px' }}>Home</a>
      <a href="/test" style={{ marginRight: '10px' }}>Test</a>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  </div>
);

// Testing ProjectDetailsPage Route
const App: React.FC = () => {
  console.log('🎬 App.tsx: Testing ProjectDetailsPage Route...');

  return (
    <SimpleAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/test" element={<TestPage title="Test Page - ProjectDetailsPage Added!" />} />
          <Route path="*" element={<TestPage title="404 - ProjectDetailsPage Added!" />} />
        </Routes>
      </Router>
    </SimpleAuthProvider>
  );
};

export default App;