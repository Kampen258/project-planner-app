import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import ProjectsPage from './components/pages/ProjectsPage-enhanced';
import HomePage from './components/pages/HomePage-Planner';
import Dashboard from './components/pages/Dashboard-KPI';
import ProjectDetailsPage from './components/pages/ProjectDetailsPage';
import IconShowcase from './components/pages/IconShowcase';
import NotFoundPage from './components/pages/NotFoundPage';

const App: React.FC = () => {
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
          <Route path="/icon-showcase" element={<IconShowcase />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </SimpleAuthProvider>
  );
};

export default App;
