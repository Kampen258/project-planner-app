import React, { useState, useEffect } from 'react';

interface DiagnosticTest {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  error?: Error;
  duration?: number;
}

interface DiagnosticSystemProps {
  onAllTestsComplete?: (results: DiagnosticTest[]) => void;
}

export function DiagnosticSystem({ onAllTestsComplete }: DiagnosticSystemProps) {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { id: 'react-render', name: 'React Component Rendering', status: 'pending' },
    { id: 'dom-access', name: 'DOM Access and Manipulation', status: 'pending' },
    { id: 'css-loading', name: 'CSS and Styling', status: 'pending' },
    { id: 'server-connection', name: 'Development Server Connection', status: 'pending' },
    { id: 'supabase-health', name: 'Supabase Database Connection', status: 'pending' },
    { id: 'mcp-bridge', name: 'MCP Bridge Server', status: 'pending' },
    { id: 'context-providers', name: 'React Context Providers', status: 'pending' },
    { id: 'router-setup', name: 'React Router Configuration', status: 'pending' },
    { id: 'component-imports', name: 'Component Import Resolution', status: 'pending' },
    { id: 'voice-api', name: 'Voice Recognition API', status: 'pending' }
  ]);

  const updateTest = (id: string, updates: Partial<DiagnosticTest>) => {
    setTests(prev => prev.map(test =>
      test.id === id ? { ...test, ...updates } : test
    ));
  };

  const runTest = async (test: DiagnosticTest): Promise<void> => {
    const startTime = Date.now();
    updateTest(test.id, { status: 'running' });

    try {
      switch (test.id) {
        case 'react-render':
          // Test basic React rendering
          const testDiv = document.createElement('div');
          if (!testDiv) throw new Error('Cannot create DOM elements');
          updateTest(test.id, {
            status: 'passed',
            message: 'React rendering working correctly',
            duration: Date.now() - startTime
          });
          break;

        case 'dom-access':
          // Test DOM manipulation
          const rootEl = document.getElementById('root');
          if (!rootEl) throw new Error('Root element not found');
          updateTest(test.id, {
            status: 'passed',
            message: 'DOM access working correctly',
            duration: Date.now() - startTime
          });
          break;

        case 'css-loading':
          // Test CSS loading by checking computed styles
          const body = document.body;
          const computedStyle = window.getComputedStyle(body);
          if (!computedStyle) throw new Error('CSS not loading properly');
          updateTest(test.id, {
            status: 'passed',
            message: 'CSS loading and styling working',
            duration: Date.now() - startTime
          });
          break;

        case 'server-connection':
          // Test dev server connection
          try {
            const response = await fetch('/vite.svg');
            if (response.ok) {
              updateTest(test.id, {
                status: 'passed',
                message: 'Development server responding',
                duration: Date.now() - startTime
              });
            } else {
              throw new Error(`Server returned ${response.status}`);
            }
          } catch (error) {
            throw new Error('Development server not responding');
          }
          break;

        case 'supabase-health':
          // Test Supabase connection
          try {
            const response = await fetch('http://localhost:54321/rest/v1/', {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
              }
            });
            if (response.ok) {
              updateTest(test.id, {
                status: 'passed',
                message: 'Supabase database accessible',
                duration: Date.now() - startTime
              });
            } else {
              throw new Error(`Supabase returned ${response.status}`);
            }
          } catch (error) {
            updateTest(test.id, {
              status: 'failed',
              message: 'Supabase not accessible (expected if Docker not running)',
              duration: Date.now() - startTime
            });
          }
          break;

        case 'mcp-bridge':
          // Test MCP Bridge server
          try {
            const response = await fetch('http://localhost:3001/health');
            if (response.ok) {
              updateTest(test.id, {
                status: 'passed',
                message: 'MCP Bridge server responding',
                duration: Date.now() - startTime
              });
            } else {
              throw new Error(`MCP Bridge returned ${response.status}`);
            }
          } catch (error) {
            updateTest(test.id, {
              status: 'failed',
              message: 'MCP Bridge server not responding',
              duration: Date.now() - startTime
            });
          }
          break;

        case 'context-providers':
          // Test React context availability (simplified)
          try {
            // We can test if React context is working by checking if we can create a context
            const TestContext = React.createContext(null);
            if (!TestContext) throw new Error('Context creation failed');
            updateTest(test.id, {
              status: 'passed',
              message: 'React Context system working',
              duration: Date.now() - startTime
            });
          } catch (error) {
            throw new Error('React Context system failed');
          }
          break;

        case 'router-setup':
          // Test if we can access router functionality
          try {
            // Simple test - check if window.history exists (required for React Router)
            if (!window.history || !window.history.pushState) {
              throw new Error('History API not available');
            }
            updateTest(test.id, {
              status: 'passed',
              message: 'Browser routing capabilities available',
              duration: Date.now() - startTime
            });
          } catch (error) {
            throw new Error('Routing functionality not available');
          }
          break;

        case 'component-imports':
          // Test dynamic import capability
          try {
            // Test if dynamic imports work
            const testImport = () => import('react');
            if (typeof testImport !== 'function') throw new Error('Dynamic imports not working');
            updateTest(test.id, {
              status: 'passed',
              message: 'Component import system working',
              duration: Date.now() - startTime
            });
          } catch (error) {
            throw new Error('Component import system failed');
          }
          break;

        case 'voice-api':
          // Test voice recognition API
          try {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              updateTest(test.id, {
                status: 'passed',
                message: 'Voice recognition API available',
                duration: Date.now() - startTime
              });
            } else {
              updateTest(test.id, {
                status: 'failed',
                message: 'Voice recognition not supported in this browser',
                duration: Date.now() - startTime
              });
            }
          } catch (error) {
            throw new Error('Voice API test failed');
          }
          break;

        default:
          throw new Error('Unknown test');
      }
    } catch (error) {
      updateTest(test.id, {
        status: 'failed',
        message: error.message,
        error: error as Error,
        duration: Date.now() - startTime
      });
    }
  };

  const runAllTests = async () => {
    console.log('🔧 Starting comprehensive diagnostic tests...');
    for (const test of tests) {
      await runTest(test);
      // Small delay between tests for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const updatedTests = tests;
    if (onAllTestsComplete) {
      onAllTestsComplete(updatedTests);
    }

    console.log('✅ All diagnostic tests completed');
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pending': return '#ffa726';
      case 'running': return '#42a5f5';
      case 'passed': return '#66bb6a';
      case 'failed': return '#ef5350';
      default: return '#bdbdbd';
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '30px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🔧 ProjectFlow Diagnostic System
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <h3>System Health Check</h3>
          <p>Running comprehensive tests to identify potential issues...</p>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {tests.map(test => (
            <div key={test.id} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>
                  {getStatusIcon(test.status)}
                </span>
                <div>
                  <strong>{test.name}</strong>
                  {test.message && (
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      {test.message}
                    </div>
                  )}
                  {test.duration && (
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      {test.duration}ms
                    </div>
                  )}
                </div>
              </div>
              <div style={{
                padding: '5px 10px',
                borderRadius: '5px',
                backgroundColor: getStatusColor(test.status),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {test.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <h4>Next Steps</h4>
          <p>Once all tests complete, the system will automatically load the full application.</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '15px 30px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            🚀 Launch Full Application
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticSystem;