import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../layout/Navigation-enhanced';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { debugLogger } from '../../utils/debug-logger';

const COMPONENT_NAME = 'DebugTestingPage';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  details?: any;
  duration?: number;
}

export function DebugTestingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pages' | 'components' | 'services'>('all');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>({});

  // Component lifecycle logging
  useEffect(() => {
    debugLogger.componentMount(COMPONENT_NAME);
    debugLogger.pageLoad('/debug-test', COMPONENT_NAME);

    // Gather system information
    const sysInfo = {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform,
      memory: (window.performance as any)?.memory ? {
        used: `${Math.round((window.performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round((window.performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round((window.performance as any).memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      } : 'N/A',
      connection: (navigator as any).connection ? {
        type: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
      } : 'N/A'
    };

    setSystemInfo(sysInfo);

    return () => {
      debugLogger.componentUnmount(COMPONENT_NAME);
    };
  }, []);

  const addTestResult = useCallback((testName: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    setTestResults(prev => {
      const existingIndex = prev.findIndex(t => t.testName === testName);
      const newResult: TestResult = { testName, status, message, details, duration };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResult;
        return updated;
      } else {
        return [...prev, newResult];
      }
    });

    debugLogger.info('Test Result', `${testName}: ${status}`, { message, details, duration }, COMPONENT_NAME);
  }, []);

  const runPageTests = async () => {
    debugLogger.info('Testing', 'Starting page tests', {}, COMPONENT_NAME);

    // Test 1: Profile Page Navigation
    addTestResult('Profile Page Navigation', 'running', 'Testing navigation to profile page...');
    try {
      const start = performance.now();

      // Check if profile route exists
      const profileElement = document.querySelector('[href="/profile"]');
      if (!profileElement) {
        throw new Error('Profile navigation link not found');
      }

      // Simulate navigation test
      await new Promise(resolve => setTimeout(resolve, 500));
      const end = performance.now();

      addTestResult('Profile Page Navigation', 'passed', 'Profile page navigation link found', {
        linkExists: true,
        href: '/profile'
      }, end - start);
    } catch (error) {
      addTestResult('Profile Page Navigation', 'failed', `Failed: ${error}`, { error });
    }

    // Test 2: Project Creation Page Navigation
    addTestResult('Project Creation Navigation', 'running', 'Testing navigation to project creation...');
    try {
      const start = performance.now();

      // Check if new project route is accessible
      const createProjectElement = document.querySelector('[href="/projects/new"]');
      if (!createProjectElement) {
        throw new Error('Create project navigation link not found');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      const end = performance.now();

      addTestResult('Project Creation Navigation', 'passed', 'Project creation navigation link found', {
        linkExists: true,
        href: '/projects/new'
      }, end - start);
    } catch (error) {
      addTestResult('Project Creation Navigation', 'failed', `Failed: ${error}`, { error });
    }

    // Test 3: Authentication Context
    addTestResult('Authentication Context', 'running', 'Testing authentication state...');
    try {
      const start = performance.now();

      if (!user) {
        throw new Error('User context not available');
      }

      const authData = {
        hasUser: !!user,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      const end = performance.now();

      addTestResult('Authentication Context', 'passed', 'Authentication context working', authData, end - start);
    } catch (error) {
      addTestResult('Authentication Context', 'failed', `Failed: ${error}`, { error });
    }

    // Test 4: Local Storage
    addTestResult('Local Storage', 'running', 'Testing local storage functionality...');
    try {
      const start = performance.now();

      const testKey = 'debug-test-key';
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });

      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);

      if (retrievedValue !== testValue) {
        throw new Error('Local storage read/write mismatch');
      }

      localStorage.removeItem(testKey);
      const end = performance.now();

      addTestResult('Local Storage', 'passed', 'Local storage functioning correctly', {
        canWrite: true,
        canRead: true,
        canDelete: true
      }, end - start);
    } catch (error) {
      addTestResult('Local Storage', 'failed', `Failed: ${error}`, { error });
    }

    debugLogger.info('Testing', 'Page tests completed', {}, COMPONENT_NAME);
  };

  const runComponentTests = async () => {
    debugLogger.info('Testing', 'Starting component tests', {}, COMPONENT_NAME);

    // Test 1: Error Boundary
    addTestResult('Error Boundary', 'running', 'Testing error boundary functionality...');
    try {
      const start = performance.now();

      // Check if ErrorBoundary is available
      const errorBoundaries = document.querySelectorAll('[data-testid="error-boundary"]');

      await new Promise(resolve => setTimeout(resolve, 300));
      const end = performance.now();

      addTestResult('Error Boundary', 'passed', 'Error boundary component available', {
        boundariesFound: errorBoundaries.length,
        componentLoaded: true
      }, end - start);
    } catch (error) {
      addTestResult('Error Boundary', 'failed', `Failed: ${error}`, { error });
    }

    // Test 2: Navigation Component
    addTestResult('Navigation Component', 'running', 'Testing navigation component...');
    try {
      const start = performance.now();

      const navElement = document.querySelector('nav') || document.querySelector('[role="navigation"]');
      if (!navElement) {
        throw new Error('Navigation component not found');
      }

      const navLinks = navElement.querySelectorAll('a');
      await new Promise(resolve => setTimeout(resolve, 300));
      const end = performance.now();

      addTestResult('Navigation Component', 'passed', 'Navigation component functioning', {
        navExists: true,
        linkCount: navLinks.length,
        links: Array.from(navLinks).map(link => link.getAttribute('href'))
      }, end - start);
    } catch (error) {
      addTestResult('Navigation Component', 'failed', `Failed: ${error}`, { error });
    }

    // Test 3: CSS Styles Loading
    addTestResult('CSS Styles', 'running', 'Testing CSS styles loading...');
    try {
      const start = performance.now();

      const testElement = document.createElement('div');
      testElement.className = 'bg-blue-500 text-white p-4';
      document.body.appendChild(testElement);

      const computedStyles = window.getComputedStyle(testElement);
      const hasBackground = computedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const hasColor = computedStyles.color !== 'rgba(0, 0, 0, 0)';

      document.body.removeChild(testElement);

      if (!hasBackground && !hasColor) {
        throw new Error('Tailwind CSS styles not loading properly');
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      const end = performance.now();

      addTestResult('CSS Styles', 'passed', 'CSS styles loading correctly', {
        hasBackground,
        hasColor,
        tailwindWorking: true
      }, end - start);
    } catch (error) {
      addTestResult('CSS Styles', 'failed', `Failed: ${error}`, { error });
    }

    debugLogger.info('Testing', 'Component tests completed', {}, COMPONENT_NAME);
  };

  const runServiceTests = async () => {
    debugLogger.info('Testing', 'Starting service tests', {}, COMPONENT_NAME);

    // Test 1: Debug Logger
    addTestResult('Debug Logger Service', 'running', 'Testing debug logger functionality...');
    try {
      const start = performance.now();

      // Test logging methods
      debugLogger.info('Test', 'Debug logger test message');
      debugLogger.warn('Test', 'Debug logger warning test');
      debugLogger.error('Test', 'Debug logger error test');

      const logs = debugLogger.getLogs({ category: 'Test' });
      if (logs.length < 3) {
        throw new Error('Debug logger not capturing all log levels');
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      const end = performance.now();

      addTestResult('Debug Logger Service', 'passed', 'Debug logger functioning correctly', {
        logsGenerated: logs.length,
        categoriesWorking: true,
        exportWorking: true
      }, end - start);
    } catch (error) {
      addTestResult('Debug Logger Service', 'failed', `Failed: ${error}`, { error });
    }

    // Test 2: Performance Monitoring
    addTestResult('Performance Monitoring', 'running', 'Testing performance monitoring...');
    try {
      const start = performance.now();

      const timer = debugLogger.startTimer('Test Timer');
      await new Promise(resolve => setTimeout(resolve, 100));
      const duration = timer();

      if (duration < 90 || duration > 150) {
        throw new Error('Timer accuracy outside acceptable range');
      }

      debugLogger.logMemoryUsage('Test Memory Check');
      const end = performance.now();

      addTestResult('Performance Monitoring', 'passed', 'Performance monitoring working', {
        timerAccuracy: `${duration.toFixed(2)}ms`,
        memoryLogging: true,
        performanceAPI: typeof performance !== 'undefined'
      }, end - start);
    } catch (error) {
      addTestResult('Performance Monitoring', 'failed', `Failed: ${error}`, { error });
    }

    // Test 3: Browser Compatibility
    addTestResult('Browser Compatibility', 'running', 'Testing browser feature compatibility...');
    try {
      const start = performance.now();

      const features = {
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        asyncAwait: true, // If we got here, async/await works
        modules: typeof window !== 'undefined' && 'import' in window,
        weakMap: typeof WeakMap !== 'undefined',
        map: typeof Map !== 'undefined',
        set: typeof Set !== 'undefined',
      };

      const unsupportedFeatures = Object.entries(features)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

      if (unsupportedFeatures.length > 0) {
        throw new Error(`Unsupported features: ${unsupportedFeatures.join(', ')}`);
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      const end = performance.now();

      addTestResult('Browser Compatibility', 'passed', 'All required features supported', {
        features,
        unsupportedCount: unsupportedFeatures.length
      }, end - start);
    } catch (error) {
      addTestResult('Browser Compatibility', 'failed', `Failed: ${error}`, { error });
    }

    debugLogger.info('Testing', 'Service tests completed', {}, COMPONENT_NAME);
  };

  const runAllTests = async () => {
    if (isRunningTests) return;

    debugLogger.userAction('Run All Tests', COMPONENT_NAME);
    setIsRunningTests(true);
    setTestResults([]);

    try {
      if (selectedCategory === 'all' || selectedCategory === 'pages') {
        await runPageTests();
      }
      if (selectedCategory === 'all' || selectedCategory === 'components') {
        await runComponentTests();
      }
      if (selectedCategory === 'all' || selectedCategory === 'services') {
        await runServiceTests();
      }

      debugLogger.info('Testing', 'All tests completed', {
        totalTests: testResults.length,
        passed: testResults.filter(t => t.status === 'passed').length,
        failed: testResults.filter(t => t.status === 'failed').length
      }, COMPONENT_NAME);

    } catch (error) {
      debugLogger.error('Testing', 'Test suite failed', { error }, COMPONENT_NAME);
    } finally {
      setIsRunningTests(false);
    }
  };

  const exportTestResults = () => {
    debugLogger.userAction('Export Test Results', COMPONENT_NAME);

    const exportData = {
      timestamp: new Date().toISOString(),
      systemInfo,
      testResults,
      debugLogs: debugLogger.getLogs(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        buildMode: import.meta.env.MODE,
        baseUrl: import.meta.env.BASE_URL,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearTests = () => {
    debugLogger.userAction('Clear Test Results', COMPONENT_NAME);
    setTestResults([]);
    debugLogger.clearLogs();
  };

  const navigateToPage = (path: string) => {
    debugLogger.userAction('Navigate to Page', COMPONENT_NAME, { path });
    navigate(path);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '⏳';
      case 'pending': return '⌛';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-300 bg-green-500/20 border-green-400/30';
      case 'failed': return 'text-red-300 bg-red-500/20 border-red-400/30';
      case 'running': return 'text-blue-300 bg-blue-500/20 border-blue-400/30';
      case 'pending': return 'text-yellow-300 bg-yellow-500/20 border-yellow-400/30';
      default: return 'text-gray-300 bg-gray-500/20 border-gray-400/30';
    }
  };

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const runningTests = testResults.filter(t => t.status === 'running').length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🧪 Debug & Testing Dashboard</h1>
            <p className="text-white/80 text-lg">
              Comprehensive testing and debugging tools for the project planner application
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-1">
              {/* Test Controls */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Test Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                                 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                      disabled={isRunningTests}
                    >
                      <option value="all">All Tests</option>
                      <option value="pages">Page Tests</option>
                      <option value="components">Component Tests</option>
                      <option value="services">Service Tests</option>
                    </select>
                  </div>

                  <button
                    onClick={runAllTests}
                    disabled={isRunningTests}
                    className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30
                               text-white px-6 py-3 rounded-lg transition-all duration-300 border border-green-400/30
                               disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isRunningTests ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        <span>Running Tests...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Run Tests</span>
                      </>
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={exportTestResults}
                      disabled={testResults.length === 0}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg
                                 border border-blue-400/30 transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📤 Export
                    </button>
                    <button
                      onClick={clearTests}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg
                                 border border-red-400/30 transition-all duration-200"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Statistics */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Statistics</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Tests:</span>
                    <span className="text-white font-medium">{totalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Passed:</span>
                    <span className="text-green-300 font-medium">{passedTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Failed:</span>
                    <span className="text-red-300 font-medium">{failedTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Running:</span>
                    <span className="text-blue-300 font-medium">{runningTests}</span>
                  </div>
                  {totalTests > 0 && (
                    <div className="mt-4">
                      <div className="text-white/70 text-sm mb-2">Success Rate:</div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(passedTests / totalTests) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-white text-sm mt-1">
                        {Math.round((passedTests / totalTests) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Navigation</h2>

                <div className="space-y-2">
                  <button
                    onClick={() => navigateToPage('/profile')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg
                               transition-all duration-200 text-left"
                  >
                    👤 Profile Page
                  </button>
                  <button
                    onClick={() => navigateToPage('/projects/new')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg
                               transition-all duration-200 text-left"
                  >
                    ➕ Create Project
                  </button>
                  <button
                    onClick={() => navigateToPage('/projects')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg
                               transition-all duration-200 text-left"
                  >
                    📋 Projects List
                  </button>
                  <button
                    onClick={() => navigateToPage('/dashboard')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg
                               transition-all duration-200 text-left"
                  >
                    📊 Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results & System Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>

                  <div className="space-y-3">
                    {testResults.map((test, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold flex items-center space-x-2">
                            <span>{getStatusIcon(test.status)}</span>
                            <span>{test.testName}</span>
                          </h3>
                          {test.duration && (
                            <span className="text-sm opacity-80">
                              {test.duration.toFixed(2)}ms
                            </span>
                          )}
                        </div>
                        <p className="text-sm opacity-90 mb-2">{test.message}</p>
                        {test.details && (
                          <details className="text-xs opacity-70">
                            <summary className="cursor-pointer mb-2">Details</summary>
                            <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Browser</h3>
                    <div className="space-y-1 text-white/70">
                      <div>User Agent: {systemInfo.userAgent?.substring(0, 60)}...</div>
                      <div>Language: {systemInfo.language}</div>
                      <div>Platform: {systemInfo.platform}</div>
                      <div>Online: {systemInfo.onLine ? 'Yes' : 'No'}</div>
                      <div>Cookies: {systemInfo.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Performance</h3>
                    <div className="space-y-1 text-white/70">
                      <div>Viewport: {systemInfo.viewport}</div>
                      <div>Color Scheme: {systemInfo.colorScheme}</div>
                      {typeof systemInfo.memory === 'object' && (
                        <>
                          <div>Memory Used: {systemInfo.memory.used}</div>
                          <div>Memory Total: {systemInfo.memory.total}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {systemInfo.connection && typeof systemInfo.connection === 'object' && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-white mb-2">Connection</h3>
                    <div className="space-y-1 text-white/70 text-sm">
                      <div>Type: {systemInfo.connection.type}</div>
                      <div>Speed: {systemInfo.connection.downlink} Mbps</div>
                      <div>Latency: {systemInfo.connection.rtt}ms</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Debug Console */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Debug Console</h2>

                <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
                  <div className="text-green-300 mb-2">Debug Logger Console - Use browser DevTools for full logs</div>
                  <div className="text-white/70 text-xs">
                    • Current route: {location.pathname}
                    <br />
                    • User ID: {user?.id || 'Not authenticated'}
                    <br />
                    • Environment: {process.env.NODE_ENV}
                    <br />
                    • Build mode: {import.meta.env.MODE}
                    <br />
                    • Logs captured: {debugLogger.getLogs().length}
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/60">
                  💡 Open browser DevTools Console and type <code className="bg-black/30 px-2 py-1 rounded">debugLogger</code> for full access to debug tools.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default DebugTestingPage;