import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import { VoiceCommandsProvider } from './contexts/VoiceCommandsContext';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '30px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{ color: '#fff', textAlign: 'center' }}>🚨 Application Error</h1>
            <p>Something went wrong. Please refresh the page.</p>
            <details style={{ marginTop: '20px' }}>
              <summary>Error Details</summary>
              <pre style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '10px'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '15px 30px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div style={{
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }} />
      <p>Loading ProjectFlow...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// Safe lazy loading with fallbacks
const safeLazy = (importFn: () => Promise<any>, fallbackName: string) => {
  return lazy(() =>
    importFn().catch(() => {
      console.error(`❌ Failed to load ${fallbackName}, using fallback`);
      return {
        default: () => (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <h1>⚠️ Page Unavailable</h1>
              <p>The {fallbackName} page is temporarily unavailable.</p>
              <div style={{ marginTop: '20px' }}>
                <a href="/" style={{ color: '#64b5f6' }}>← Back to Home</a>
              </div>
            </div>
          </div>
        )
      };
    })
  );
};

// Safe page imports
const LandingPage = safeLazy(() => import('./components/pages/LandingPage'), 'LandingPage');
const LoginPage = safeLazy(() => import('./components/pages/LoginPage'), 'LoginPage');
const Dashboard = safeLazy(() => import('./components/pages/Dashboard-enhanced'), 'Dashboard');
const ProjectsPage = safeLazy(() => import('./components/pages/ProjectsPage'), 'ProjectsPage');
const ProjectCreatePage = safeLazy(() => import('./components/pages/ProjectCreatePage'), 'ProjectCreatePage');
const ProjectDetailsPage = safeLazy(() => import('./components/pages/ProjectDetailsPage'), 'ProjectDetailsPage');
const TeamPage = safeLazy(() => import('./components/pages/TeamPage-enhanced'), 'TeamPage');
const ProfilePage = safeLazy(() => import('./components/pages/EnhancedProfilePage'), 'ProfilePage');

// Test component for debugging
const TestComponent: React.FC = () => (
  <div style={{
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1>🧪 Test Component - Working!</h1>
    <p>Current route: {window.location.pathname}</p>
    <p>Time: {new Date().toLocaleString()}</p>
    <div style={{ margin: '20px 0' }}>
      <a href="/" style={{ color: '#64b5f6', margin: '0 10px' }}>Home</a>
      <a href="/dashboard" style={{ color: '#64b5f6', margin: '0 10px' }}>Dashboard</a>
      <a href="/projects" style={{ color: '#64b5f6', margin: '0 10px' }}>Projects</a>
    </div>
  </div>
);

// Main App Content
const AppContent: React.FC = () => {
  console.log('🎬 AppContent: Rendering bulletproof version...');

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectCreatePage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/test" element={<TestComponent />} />
          <Route path="*" element={
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minHeight: '100vh',
              color: 'white',
              fontFamily: 'Arial, sans-serif'
            }}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '30px',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)'
              }}>
                <h1 style={{ color: '#fff', textAlign: 'center' }}>🚀 ProjectFlow - Bulletproof Version!</h1>
                <p>✅ All systems operational</p>
                <p>🛡️ Error boundaries active</p>
                <p>⚡ Lazy loading with fallbacks</p>
                <p>🎤 <strong>Voice Functionality Ready!</strong></p>
                <p>🤖 <strong>AI Chat Assistant Ready!</strong></p>

                <div style={{ margin: '20px 0' }}>
                  <h3>Available Pages:</h3>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li><a href="/" style={{ color: '#64b5f6' }}>🏠 Landing Page</a></li>
                    <li><a href="/login" style={{ color: '#64b5f6' }}>🔐 Login</a></li>
                    <li><a href="/dashboard" style={{ color: '#64b5f6' }}>📊 Dashboard</a></li>
                    <li><a href="/projects" style={{ color: '#64b5f6' }}>📋 Projects</a></li>
                    <li><a href="/team" style={{ color: '#64b5f6' }}>👥 Team</a></li>
                    <li><a href="/profile" style={{ color: '#64b5f6' }}>👤 Profile</a></li>
                    <li><a href="/test" style={{ color: '#64b5f6' }}>🧪 Test</a></li>
                  </ul>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

// Safe Context Wrapper
const SafeContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    return (
      <SimpleAuthProvider>
        <VoiceCommandsProvider>
          {children}
        </VoiceCommandsProvider>
      </SimpleAuthProvider>
    );
  } catch (error) {
    console.error('❌ Context initialization failed:', error);
    return (
      <SimpleAuthProvider>
        {children}
      </SimpleAuthProvider>
    );
  }
};

// Main App Component
const App: React.FC = () => {
  console.log('🚀 App.tsx: Bulletproof ProjectFlow App starting...');

  return (
    <ErrorBoundary>
      <SafeContextWrapper>
        <Router>
          <AppContent />
        </Router>
      </SafeContextWrapper>
    </ErrorBoundary>
  );
};

export default App;