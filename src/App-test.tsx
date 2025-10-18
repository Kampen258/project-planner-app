import React from 'react';

// Test 1: Basic React + Router only
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

console.log('🚀 App-test.tsx: Testing basic imports...');

// Simple test component
const TestComponent = ({ message }: { message: string }) => (
  <div style={{
    padding: '20px',
    backgroundColor: '#e8f4fd',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1 style={{ color: '#2563eb' }}>🚀 {message}</h1>
    <p>✅ React Router is working!</p>
    <p>Timestamp: {new Date().toLocaleString()}</p>

    <div style={{ marginTop: '20px' }}>
      <h3>Navigation Test:</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Home</a>
        <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>Test Route</a>
      </div>
    </div>
  </div>
);

// Test App component - minimal version
const AppTest: React.FC = () => {
  console.log('🎬 App-test.tsx: Rendering test app...');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestComponent message="Home Page - App Test" />} />
        <Route path="/test" element={<TestComponent message="Test Route - App Test" />} />
        <Route path="*" element={<TestComponent message="404 - Page Not Found" />} />
      </Routes>
    </Router>
  );
};

export default AppTest;