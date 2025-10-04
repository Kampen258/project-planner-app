import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SimpleAuthProvider, useAuth } from './contexts/SimpleAuthContext';
import Navigation from './components/layout/Navigation-enhanced';
import ErrorBoundary from './components/ErrorBoundary';

// Page Components - Enhanced versions
import LandingPage from './components/pages/LandingPage';
import Dashboard from './components/pages/Dashboard-enhanced';
import ProjectsPage from './components/pages/ProjectsPage-enhanced';
import TeamPage from './components/pages/TeamPage-enhanced';
import ProfilePage from './components/pages/EnhancedProfilePage';
import LoginPage from './components/pages/LoginPage';

// Project Management Components
import ProjectCreation from './components/projects/EnhancedProjectCreation';
import AIProjectCreation from './components/projects/EnhancedAIProjectCreation';
import ProjectDetailView from './components/ProjectDetailView';

// Admin and Special Pages
import AdminSetup from './components/admin/AdminSetup';
import ClaudeIntegrationTestPage from './components/pages/ClaudeIntegrationTestPage';
import DebugTestingPage from './components/pages/DebugTestingPage';

// Voice and AI Components
import EnhancedVoiceAssistant from './components/EnhancedVoiceAssistant';
import VoiceCommandsModal from './components/VoiceCommandsModal';
import EnhancedClaudeIntegration from './components/EnhancedClaudeIntegration';

// Notification System
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Main Layout Component
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);

  // Public routes that don't need navigation
  const isPublicRoute = ['/', '/login', '/admin/setup'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  // Add sample notifications
  useEffect(() => {
    if (user) {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          title: 'Welcome to ProjectFlow',
          message: 'Your comprehensive project management platform is ready!',
          timestamp: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'success',
          title: 'AI Assistant Active',
          message: 'Voice commands and AI project creation are available.',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          read: false
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation - only show for authenticated routes */}
      {!isPublicRoute && (
        <Navigation
          notifications={notifications}
          unreadCount={unreadCount}
          onVoiceCommands={() => setShowVoiceCommands(true)}
        />
      )}

      {/* Main Content */}
      <main className={isLandingPage ? '' : 'pt-16'}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Voice Assistant - only for authenticated users */}
      {user && !isPublicRoute && (
        <>
          <EnhancedVoiceAssistant />
          <VoiceCommandsModal
            isOpen={showVoiceCommands}
            onClose={() => setShowVoiceCommands(false)}
          />
        </>
      )}

      {/* Global Claude Integration */}
      {user && !isPublicRoute && (
        <EnhancedClaudeIntegration />
      )}
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Main App Content with Routes
function AppContent() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showAICreation, setShowAICreation] = useState(false);

  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin/setup" element={
          <AdminRoute>
            <AdminSetup />
          </AdminRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } />

        <Route path="/projects/new" element={
          <ProtectedRoute>
            <ProjectCreation
              onComplete={(project) => {
                console.log('Project created:', project);
                // Handle project creation completion
              }}
              onCancel={() => {
                // Handle cancellation
              }}
            />
          </ProtectedRoute>
        } />

        <Route path="/projects/ai-create" element={
          <ProtectedRoute>
            <AIProjectCreation
              onComplete={(project) => {
                console.log('AI Project created:', project);
                setShowAICreation(false);
              }}
              onCancel={() => {
                setShowAICreation(false);
              }}
            />
          </ProtectedRoute>
        } />

        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetailView />
          </ProtectedRoute>
        } />

        <Route path="/team" element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Development/Testing Routes */}
        <Route path="/dev/claude" element={
          <ProtectedRoute>
            <ClaudeIntegrationTestPage />
          </ProtectedRoute>
        } />

        <Route path="/dev/debug" element={
          <ProtectedRoute>
            <DebugTestingPage />
          </ProtectedRoute>
        } />

        {/* Task Management Routes */}
        <Route path="/projects/:projectId/tasks" element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Task Management</h1>
              <p className="text-gray-600">Advanced task management interface coming soon...</p>
            </div>
          </ProtectedRoute>
        } />

        {/* Timeline/Calendar Routes */}
        <Route path="/projects/:projectId/timeline" element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Project Timeline</h1>
              <p className="text-gray-600">Gantt chart and calendar view coming soon...</p>
            </div>
          </ProtectedRoute>
        } />

        {/* Analytics Routes */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
              <p className="text-gray-600">Project analytics and reporting coming soon...</p>
            </div>
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

// Main App Component
function ComprehensiveApp() {
  return (
    <SimpleAuthProvider>
      <Router>
        <AppContent />
      </Router>
    </SimpleAuthProvider>
  );
}

export default ComprehensiveApp;