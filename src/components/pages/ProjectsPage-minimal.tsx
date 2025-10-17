import React from 'react';
import { Link } from 'react-router-dom';

const ProjectsPageMinimal: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #22d3ee, #3b82f6, #f97316)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🐛 Minimal Projects Page Test
        </h1>

        <div style={{ marginBottom: '2rem' }}>
          <p>✅ React component rendering successfully</p>
          <p>✅ CSS styles applying correctly</p>
          <p>✅ No JavaScript errors (if you can see this)</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Navigation Test:</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              🏠 Home
            </Link>
            <Link
              to="/dashboard"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              📊 Dashboard
            </Link>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          <p><strong>This is a minimal test page.</strong></p>
          <p>If you can see this content, React Router and basic rendering work.</p>
          <p>The issue with the enhanced projects page is likely:</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Dynamic import issue with ProjectService</li>
            <li>Supabase client initialization problem</li>
            <li>Authentication context error</li>
            <li>Missing dependency or circular import</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPageMinimal;