import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext-safe';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import Dashboard from './components/pages/Dashboard';
import ProjectsPage from './components/pages/ProjectsPage';
import TeamPage from './components/pages/TeamPage';
import ProfilePage from './components/pages/ProfilePage';
import ProjectCreation from './components/projects/ProjectCreation';
import AdminSetup from './components/admin/AdminSetup';

function App() {
  console.log('Full App component rendering...');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Setup */}
          <Route path="/admin/setup" element={<AdminSetup />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects/new" element={<ProjectCreation />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;