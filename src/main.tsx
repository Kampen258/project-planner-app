import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Back to main app with debugging
import App from './App.tsx'

console.log('🚀 main.tsx: Starting React application...');

const rootElement = document.getElementById('root');
console.log('📦 main.tsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ main.tsx: Root element not found!');
  throw new Error('Root element not found');
}

console.log('🎯 main.tsx: Creating React root...');
const root = createRoot(rootElement);

console.log('🎨 main.tsx: Rendering App component...');

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffe6e6', minHeight: '100vh' }}>
          <h1>⚠️ Something went wrong!</h1>
          <pre style={{ background: '#fff', padding: '10px', border: '1px solid #ddd' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', marginTop: '10px' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  console.log('✅ main.tsx: App rendered successfully!');
} catch (error) {
  console.error('❌ main.tsx: Error rendering App:', error);
}
