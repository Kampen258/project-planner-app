import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

console.log('🚀 App-router-test.tsx: Testing React Router specifically...');

// Absolutely minimal components with inline styles (no CSS imports)
const TestPage = ({ title }: { title: string }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1 style={{ color: '#000' }}>🎯 {title}</h1>
    <p>✅ Router is working!</p>
    <p>Timestamp: {new Date().toLocaleString()}</p>
    <div style={{ marginTop: '20px' }}>
      <a href="/" style={{ marginRight: '10px', color: 'blue' }}>Home</a>
      <a href="/test" style={{ color: 'blue' }}>Test</a>
    </div>
  </div>
);

// Main App component
const AppRouterTest: React.FC = () => {
  console.log('🎬 App-router-test.tsx: Rendering router test app...');

  try {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<TestPage title="Home Page - Router Test" />} />
          <Route path="/test" element={<TestPage title="Test Page - Router Test" />} />
          <Route path="*" element={<TestPage title="404 - Page Not Found" />} />
        </Routes>
      </Router>
    );
  } catch (error) {
    console.error('❌ Error in AppRouterTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Router Error!</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
};

export default AppRouterTest;