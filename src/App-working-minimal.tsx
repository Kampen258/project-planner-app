import React from 'react';

console.log('🚀 App.tsx: Starting minimal test app...');

// Minimal App component for debugging
const App: React.FC = () => {
  console.log('🎬 App.tsx: Rendering minimal app...');

  try {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#e8f4fd',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#2563eb' }}>🚀 ProjectFlow - Debug Mode</h1>
        <p>✅ React is working!</p>
        <p>✅ App.tsx is loading correctly!</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>

        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>Debug Info:</h3>
          <ul>
            <li>✅ React: Working</li>
            <li>✅ Vite: Working</li>
            <li>✅ App.tsx: Loading</li>
            <li>Environment: {import.meta.env.MODE}</li>
          </ul>
        </div>

        <button
          onClick={() => alert('Button works!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Test Button
        </button>
      </div>
    );
  } catch (error) {
    console.error('❌ Error in App render:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error in App!</h1>
        <pre>{error?.toString()}</pre>
      </div>
    );
  }
};

export default App;