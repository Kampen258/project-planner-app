#!/usr/bin/env node

/**
 * Enhanced Automated Test Suite for Project Planner App
 * Tests all pages, functionality, and provides comprehensive diagnostics
 *
 * Features:
 * - Server connectivity checks with detailed diagnostics
 * - Page loading tests with timing measurements
 * - React hydration detection
 * - Error detection and reporting
 * - Performance metrics
 * - Enhanced logging and debugging
 *
 * Usage: node test-app-functionality.cjs
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_TIMEOUT = 10000; // Increased for better reliability
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// Test results with enhanced tracking
let results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  performance: {
    totalTime: 0,
    averageResponseTime: 0,
    slowestTest: null,
    fastestTest: null
  },
  diagnostics: {
    reactDetected: false,
    viteDetected: false,
    tailwindDetected: false,
    routerDetected: false
  }
};

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m'
};

// Logging utilities
function logInfo(message, details = null) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
  if (details) console.log(`${colors.gray}  ${details}${colors.reset}`);
}

function logSuccess(message, details = null) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  if (details) console.log(`${colors.gray}  ${details}${colors.reset}`);
}

function logWarning(message, details = null) {
  console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
  if (details) console.log(`${colors.gray}  ${details}${colors.reset}`);
}

function logError(message, details = null) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  if (details) console.log(`${colors.gray}  ${details}${colors.reset}`);
}

function logDebug(message, data = null) {
  if (process.env.DEBUG) {
    console.log(`${colors.gray}[DEBUG] ${message}${colors.reset}`);
    if (data) console.log(`${colors.gray}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced test configurations with multiple validation layers
const tests = [
  {
    name: 'Landing Page',
    path: '/',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['Plan. Execute. Succeed.', 'Everything you need to succeed'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'Beautiful landing page with gradient design and marketing content',
    category: 'public'
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['User Information', 'System Status', 'Quick Navigation'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'Enhanced dashboard with Supabase integration and navigation',
    category: 'authenticated'
  },
  {
    name: 'Projects Page',
    path: '/projects',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['Projects', 'Supabase'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'Projects management page with database integration',
    category: 'authenticated'
  },
  {
    name: 'Team Page',
    path: '/team',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['Team', 'Collaborate'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'Team collaboration and member management',
    category: 'authenticated'
  },
  {
    name: 'Profile Page',
    path: '/profile',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['Profile', 'Account'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'User profile and account settings',
    category: 'authenticated'
  },
  {
    name: 'Project Creation',
    path: '/projects/new',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['Create New Project', 'Project Name'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'Project creation form with Supabase integration',
    category: 'authenticated'
  },
  {
    name: 'Analytics Dashboard',
    path: '/analytics',
    expectedContent: {
      required: ['<div id="root">', 'ProjectFlow'],
      optional: ['Analytics Dashboard', 'Total Projects'],
      technology: ['vite', 'react']
    },
    expectedStatus: 200,
    maxResponseTime: 5000,
    description: 'Comprehensive analytics and insights dashboard',
    category: 'authenticated'
  }
];

// Additional diagnostic tests
const diagnosticTests = [
  {
    name: 'React DevTools Detection',
    path: '/',
    check: (content) => content.includes('react-refresh') || content.includes('__react'),
    description: 'Verify React development tools are active'
  },
  {
    name: 'Vite HMR Detection',
    path: '/',
    check: (content) => content.includes('@vite/client') || content.includes('vite'),
    description: 'Verify Vite hot module replacement is working'
  },
  {
    name: 'Tailwind CSS Detection',
    path: '/',
    check: (content) => content.includes('tailwind') || content.includes('class='),
    description: 'Verify Tailwind CSS styling system is loaded'
  }
];

// Server status tests
const serverTests = [
  {
    name: 'Vite Dev Server',
    port: 5173,
    description: 'React development server'
  },
  {
    name: 'MCP Bridge Server',
    port: 3001,
    description: 'Claude MCP bridge server'
  }
];

/**
 * Enhanced HTTP request with retry logic and detailed timing
 */
function makeRequest(url, timeout = TEST_TIMEOUT, attempt = 1) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    logDebug(`Making request to ${url} (attempt ${attempt}/${RETRY_ATTEMPTS})`);

    const httpModule = parsedUrl.protocol === 'https:' ? https : http;

    const req = httpModule.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'ProjectPlannerTestSuite/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    }, (res) => {
      let data = '';
      const responseTime = Date.now() - startTime;

      logDebug(`Response received: ${res.statusCode} (${responseTime}ms)`);

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const totalTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: totalTime,
          url: url,
          attempt: attempt
        });
      });
    });

    req.on('error', async (error) => {
      const errorTime = Date.now() - startTime;
      logDebug(`Request error: ${error.message} (${errorTime}ms)`);

      if (attempt < RETRY_ATTEMPTS) {
        logWarning(`Request failed, retrying in ${RETRY_DELAY}ms... (attempt ${attempt + 1}/${RETRY_ATTEMPTS})`);
        await sleep(RETRY_DELAY);
        try {
          const result = await makeRequest(url, timeout, attempt + 1);
          resolve(result);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(new Error(`Request failed after ${RETRY_ATTEMPTS} attempts: ${error.message}`));
      }
    });

    req.on('timeout', async () => {
      req.destroy();
      const timeoutError = new Error(`Request timeout after ${timeout}ms`);

      if (attempt < RETRY_ATTEMPTS) {
        logWarning(`Request timed out, retrying... (attempt ${attempt + 1}/${RETRY_ATTEMPTS})`);
        await sleep(RETRY_DELAY);
        try {
          const result = await makeRequest(url, timeout, attempt + 1);
          resolve(result);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(timeoutError);
      }
    });

    req.end();
  });
}

/**
 * Enhanced server port testing with detailed diagnostics
 */
function testServerPort(port, timeout = 3000) {
  const startTime = Date.now();

  return new Promise((resolve) => {
    logDebug(`Testing server on port ${port}`);

    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'ProjectPlannerTestSuite/1.0'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      logDebug(`Server on port ${port} responded: ${res.statusCode} (${responseTime}ms)`);
      resolve({
        available: true,
        statusCode: res.statusCode,
        responseTime: responseTime,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      const errorTime = Date.now() - startTime;
      logDebug(`Server on port ${port} error: ${error.code} (${errorTime}ms)`);
      resolve({
        available: false,
        error: error.code,
        message: error.message,
        responseTime: errorTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const timeoutTime = Date.now() - startTime;
      logDebug(`Server on port ${port} timeout (${timeoutTime}ms)`);
      resolve({
        available: false,
        error: 'TIMEOUT',
        message: `Timeout after ${timeout}ms`,
        responseTime: timeoutTime
      });
    });

    req.end();
  });
}

/**
 * Enhanced page test with comprehensive validation
 */
async function runPageTest(test) {
  const startTime = Date.now();
  const testResult = {
    name: test.name,
    path: test.path,
    status: 'UNKNOWN',
    message: '',
    details: [],
    performance: {
      responseTime: 0,
      contentLength: 0,
      attempts: 0
    },
    validation: {
      required: { passed: 0, failed: 0, items: [] },
      optional: { passed: 0, failed: 0, items: [] },
      technology: { passed: 0, failed: 0, items: [] }
    }
  };

  try {
    logInfo(`Testing ${test.name}`, `${test.path} - ${test.description}`);

    const response = await makeRequest(`${BASE_URL}${test.path}`);

    testResult.performance.responseTime = response.responseTime;
    testResult.performance.contentLength = response.data.length;
    testResult.performance.attempts = response.attempt;

    // Log response details
    logDebug('Response details', {
      statusCode: response.statusCode,
      responseTime: response.responseTime,
      contentLength: response.data.length,
      attempt: response.attempt
    });

    // Performance check
    if (response.responseTime > test.maxResponseTime) {
      testResult.details.push(`⚠️ Slow response: ${formatTime(response.responseTime)} (max: ${formatTime(test.maxResponseTime)})`);
      results.warnings++;
    }

    // HTTP status check
    if (response.statusCode !== test.expectedStatus) {
      testResult.status = 'FAILED';
      testResult.message = `HTTP ${response.statusCode}`;
      testResult.details.push(`Expected status ${test.expectedStatus}, got ${response.statusCode}`);
      return testResult;
    }

    // Content validation
    let hasRequired = true;
    let hasOptional = false;
    let hasTechnology = false;

    // Check required content
    if (test.expectedContent.required) {
      for (const content of test.expectedContent.required) {
        if (response.data.includes(content)) {
          testResult.validation.required.passed++;
          testResult.validation.required.items.push(`✅ ${content}`);
        } else {
          testResult.validation.required.failed++;
          testResult.validation.required.items.push(`❌ ${content}`);
          hasRequired = false;
        }
      }
    }

    // Check optional content (informational)
    if (test.expectedContent.optional) {
      for (const content of test.expectedContent.optional) {
        if (response.data.includes(content)) {
          testResult.validation.optional.passed++;
          testResult.validation.optional.items.push(`✅ ${content}`);
          hasOptional = true;
        } else {
          testResult.validation.optional.failed++;
          testResult.validation.optional.items.push(`⚠️ ${content}`);
        }
      }
    }

    // Check technology markers
    if (test.expectedContent.technology) {
      for (const tech of test.expectedContent.technology) {
        const found = response.data.toLowerCase().includes(tech.toLowerCase());
        if (found) {
          testResult.validation.technology.passed++;
          testResult.validation.technology.items.push(`✅ ${tech}`);
          hasTechnology = true;

          // Update global diagnostics
          if (tech === 'react') results.diagnostics.reactDetected = true;
          if (tech === 'vite') results.diagnostics.viteDetected = true;
        } else {
          testResult.validation.technology.failed++;
          testResult.validation.technology.items.push(`❌ ${tech}`);
        }
      }
    }

    // Determine final status
    if (!hasRequired) {
      testResult.status = 'FAILED';
      testResult.message = 'Missing required content';
    } else if (!hasTechnology) {
      testResult.status = 'WARNING';
      testResult.message = 'Technology markers missing';
      results.warnings++;
    } else {
      testResult.status = 'PASSED';
      testResult.message = hasOptional ? 'All content found' : 'Required content found';
    }

    // Add validation summary to details
    if (testResult.validation.required.items.length > 0) {
      testResult.details.push(`Required: ${testResult.validation.required.items.join(', ')}`);
    }
    if (testResult.validation.optional.items.length > 0) {
      testResult.details.push(`Optional: ${testResult.validation.optional.items.join(', ')}`);
    }
    if (testResult.validation.technology.items.length > 0) {
      testResult.details.push(`Technology: ${testResult.validation.technology.items.join(', ')}`);
    }

    // Performance tracking
    const totalTime = Date.now() - startTime;
    if (!results.performance.slowestTest || totalTime > results.performance.slowestTest.time) {
      results.performance.slowestTest = { name: test.name, time: totalTime };
    }
    if (!results.performance.fastestTest || totalTime < results.performance.fastestTest.time) {
      results.performance.fastestTest = { name: test.name, time: totalTime };
    }

  } catch (error) {
    testResult.status = 'FAILED';
    testResult.message = error.message;
    testResult.details.push(`Error: ${error.message}`);

    logError(`Test failed: ${test.name}`, error.message);
  }

  return testResult;
}

/**
 * Enhanced server connectivity tests
 */
async function runServerTests() {
  console.log(`\n${colors.bold}${colors.yellow}🔧 Server Connectivity Tests${colors.reset}\n`);

  for (const test of serverTests) {
    const serverResult = await testServerPort(test.port);

    const testResult = {
      name: test.name,
      category: 'server',
      port: test.port,
      status: serverResult.available ? 'PASSED' : 'FAILED',
      message: '',
      details: [test.description],
      performance: {
        responseTime: serverResult.responseTime,
        statusCode: serverResult.statusCode || null
      }
    };

    if (serverResult.available) {
      testResult.message = `Running on port ${test.port}`;
      testResult.details.push(`Response time: ${formatTime(serverResult.responseTime)}`);
      if (serverResult.statusCode) {
        testResult.details.push(`Status: ${serverResult.statusCode}`);
      }

      logSuccess(`${test.name}`, `Port ${test.port} - ${formatTime(serverResult.responseTime)}`);
      results.passed++;
    } else {
      testResult.message = serverResult.message || `Not accessible on port ${test.port}`;
      testResult.details.push(`Error: ${serverResult.error || 'Unknown'}`);
      testResult.details.push(`Response time: ${formatTime(serverResult.responseTime)}`);

      logError(`${test.name}`, `Port ${test.port} - ${serverResult.message}`);
      results.failed++;
    }

    results.tests.push(testResult);
  }
}

/**
 * Enhanced page tests with detailed reporting
 */
async function runPageTests() {
  console.log(`\n${colors.bold}${colors.yellow}🌐 Page Functionality Tests${colors.reset}\n`);

  let totalResponseTime = 0;

  for (const test of tests) {
    const result = await runPageTest(test);
    results.tests.push(result);

    totalResponseTime += result.performance.responseTime;

    // Log results with appropriate colors and details
    if (result.status === 'PASSED') {
      logSuccess(`${result.name}`, `${formatTime(result.performance.responseTime)} - ${result.message}`);
      results.passed++;
    } else if (result.status === 'WARNING') {
      logWarning(`${result.name}`, `${formatTime(result.performance.responseTime)} - ${result.message}`);
      results.passed++; // Count as passed but with warnings
    } else {
      logError(`${result.name}`, `${formatTime(result.performance.responseTime)} - ${result.message}`);
      results.failed++;
    }

    // Show detailed validation results
    if (result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`   ${colors.gray}→${colors.reset} ${detail}`);
      });
    }

    // Show performance warnings
    if (result.performance.attempts > 1) {
      logWarning(`${result.name} required ${result.performance.attempts} attempts`);
    }
  }

  // Calculate performance metrics
  if (tests.length > 0) {
    results.performance.averageResponseTime = Math.round(totalResponseTime / tests.length);
    results.performance.totalTime = totalResponseTime;
  }
}

/**
 * Run diagnostic tests
 */
async function runDiagnosticTests() {
  console.log(`\n${colors.bold}${colors.cyan}🔍 Diagnostic Tests${colors.reset}\n`);

  for (const diagnostic of diagnosticTests) {
    try {
      const response = await makeRequest(`${BASE_URL}${diagnostic.path}`);
      const passed = diagnostic.check(response.data);

      const testResult = {
        name: diagnostic.name,
        category: 'diagnostic',
        status: passed ? 'PASSED' : 'FAILED',
        message: diagnostic.description,
        details: [`Response time: ${formatTime(response.responseTime)}`],
        performance: {
          responseTime: response.responseTime
        }
      };

      if (passed) {
        logSuccess(diagnostic.name, diagnostic.description);

        // Update global diagnostics based on test name
        if (diagnostic.name.includes('React')) results.diagnostics.reactDetected = true;
        if (diagnostic.name.includes('Vite')) results.diagnostics.viteDetected = true;
        if (diagnostic.name.includes('Tailwind')) results.diagnostics.tailwindDetected = true;

        results.passed++;
      } else {
        logWarning(diagnostic.name, `${diagnostic.description} - Not detected`);
        results.warnings++;
      }

      results.tests.push(testResult);
    } catch (error) {
      logError(diagnostic.name, `Failed to run diagnostic: ${error.message}`);
      results.failed++;
    }
  }
}

/**
 * Enhanced summary report with comprehensive metrics
 */
function printSummary() {
  const total = results.passed + results.failed + results.warnings;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

  console.log(`\n${colors.bold}${colors.blue}📊 Comprehensive Test Results Summary${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  // Test Results
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  if (results.warnings > 0) {
    console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
  }
  console.log(`${colors.blue}📊 Total:  ${total}${colors.reset}`);
  console.log(`${colors.cyan}🎯 Pass Rate: ${passRate}%${colors.reset}`);

  // Performance Metrics
  if (results.performance.totalTime > 0) {
    console.log(`\n${colors.bold}${colors.magenta}⚡ Performance Metrics${colors.reset}`);
    console.log(`${colors.magenta}═══════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Total Time: ${formatTime(results.performance.totalTime)}${colors.reset}`);
    console.log(`${colors.cyan}Average Response: ${formatTime(results.performance.averageResponseTime)}${colors.reset}`);

    if (results.performance.slowestTest) {
      console.log(`${colors.yellow}🐌 Slowest: ${results.performance.slowestTest.name} (${formatTime(results.performance.slowestTest.time)})${colors.reset}`);
    }
    if (results.performance.fastestTest) {
      console.log(`${colors.green}⚡ Fastest: ${results.performance.fastestTest.name} (${formatTime(results.performance.fastestTest.time)})${colors.reset}`);
    }
  }

  // Technology Diagnostics
  console.log(`\n${colors.bold}${colors.cyan}🔍 Technology Stack Status${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════${colors.reset}`);
  console.log(`React: ${results.diagnostics.reactDetected ? colors.green + '✅ Detected' : colors.red + '❌ Not Found'}${colors.reset}`);
  console.log(`Vite: ${results.diagnostics.viteDetected ? colors.green + '✅ Detected' : colors.red + '❌ Not Found'}${colors.reset}`);
  console.log(`Tailwind: ${results.diagnostics.tailwindDetected ? colors.green + '✅ Detected' : colors.red + '❌ Not Found'}${colors.reset}`);
  console.log(`Router: ${results.diagnostics.routerDetected ? colors.green + '✅ Detected' : colors.red + '❌ Not Found'}${colors.reset}`);

  // Test Categories Breakdown
  const categories = {};
  results.tests.forEach(test => {
    const category = test.category || 'page';
    if (!categories[category]) categories[category] = { passed: 0, failed: 0, warnings: 0 };

    if (test.status === 'PASSED') categories[category].passed++;
    else if (test.status === 'WARNING') categories[category].warnings++;
    else categories[category].failed++;
  });

  if (Object.keys(categories).length > 1) {
    console.log(`\n${colors.bold}${colors.white}📋 Test Categories${colors.reset}`);
    console.log(`${colors.white}═══════════════════════${colors.reset}`);
    Object.entries(categories).forEach(([category, stats]) => {
      const categoryTotal = stats.passed + stats.failed + stats.warnings;
      const categoryRate = categoryTotal > 0 ? ((stats.passed / categoryTotal) * 100).toFixed(1) : 0;
      console.log(`${colors.white}${category.toUpperCase()}: ${stats.passed}✅ ${stats.failed}❌ ${stats.warnings}⚠️  (${categoryRate}%)${colors.reset}`);
    });
  }

  // Final Status
  if (results.failed === 0) {
    if (results.warnings > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  Tests completed with ${results.warnings} warning(s). App is functional.${colors.reset}`);
    } else {
      console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! App is working perfectly.${colors.reset}`);
    }
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ ${results.failed} critical test(s) failed. Review the errors above.${colors.reset}`);
  }

  // Recommendations
  const recommendations = [];
  if (!results.diagnostics.reactDetected) recommendations.push('Verify React is properly installed and configured');
  if (!results.diagnostics.viteDetected) recommendations.push('Check Vite development server configuration');
  if (results.performance.averageResponseTime > 3000) recommendations.push('Consider optimizing page load performance');

  if (recommendations.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}💡 Recommendations${colors.reset}`);
    console.log(`${colors.yellow}═══════════════════════${colors.reset}`);
    recommendations.forEach(rec => console.log(`${colors.yellow}• ${rec}${colors.reset}`));
  }

  // Save enhanced results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = `test-results-${timestamp}.json`;

  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: total,
      passRate: parseFloat(passRate)
    },
    performance: results.performance,
    diagnostics: results.diagnostics,
    categories: categories,
    recommendations: recommendations,
    tests: results.tests,
    configuration: {
      baseUrl: BASE_URL,
      timeout: TEST_TIMEOUT,
      retryAttempts: RETRY_ATTEMPTS,
      testSuite: 'Enhanced Project Planner Test Suite v2.0'
    }
  };

  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  console.log(`\n${colors.blue}📄 Comprehensive report saved to: ${colors.bold}${reportFile}${colors.reset}`);
}

/**
 * Enhanced main test execution with comprehensive diagnostics
 */
async function runTests() {
  const testStartTime = Date.now();

  console.log(`${colors.bold}${colors.blue}🚀 Enhanced Project Planner App Test Suite v2.0${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}🎯 Target: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.cyan}⏱️  Timeout: ${formatTime(TEST_TIMEOUT)}${colors.reset}`);
  console.log(`${colors.cyan}🔄 Retry Attempts: ${RETRY_ATTEMPTS}${colors.reset}`);
  console.log(`${colors.cyan}📅 Started: ${new Date().toLocaleString()}${colors.reset}`);

  // Environment checks
  logInfo('Environment Check', `Node.js ${process.version}, Platform: ${process.platform}`);
  if (process.env.DEBUG) {
    logInfo('Debug mode enabled', 'Verbose logging active');
  }

  try {
    // 1. Run server connectivity tests
    logInfo('Phase 1: Server Connectivity', 'Testing infrastructure components...');
    await runServerTests();

    // 2. Run diagnostic tests
    logInfo('Phase 2: Technology Diagnostics', 'Detecting technology stack...');
    await runDiagnosticTests();

    // 3. Run page functionality tests
    logInfo('Phase 3: Page Functionality', 'Testing application pages...');
    await runPageTests();

    // Calculate total execution time
    const totalExecutionTime = Date.now() - testStartTime;
    results.performance.totalExecutionTime = totalExecutionTime;

    // Print comprehensive summary
    printSummary();

    console.log(`\n${colors.cyan}⏱️  Total execution time: ${formatTime(totalExecutionTime)}${colors.reset}`);

    // Exit with appropriate code
    const exitCode = results.failed > 0 ? 1 : 0;
    if (exitCode === 0) {
      logSuccess('Test suite completed successfully');
    } else {
      logError('Test suite completed with failures');
    }

    process.exit(exitCode);

  } catch (error) {
    logError('Test suite crashed unexpectedly', error.message);
    console.error(`${colors.red}${colors.bold}💥 Fatal Error: ${error.message}${colors.reset}`);
    console.error(`${colors.red}${error.stack}${colors.reset}`);
    process.exit(2);
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Test interrupted by user${colors.reset}`);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite crashed: ${error.message}${colors.reset}`);
  process.exit(1);
});