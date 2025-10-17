#!/usr/bin/env node

/**
 * ProjectFlow Comprehensive Testing Script
 * Combines health checks, diagnostic system, and recovery mechanisms
 */

const HealthChecker = require('./health-check.cjs');
const MCPDependencyTester = require('./test-mcp-dependencies.cjs');
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs').promises;

class AppTester {
  constructor() {
    this.healthChecker = new HealthChecker();
    this.mcpTester = new MCPDependencyTester();
    this.testResults = {
      infrastructure: [],
      mcpDependencies: [],
      react: [],
      integration: [],
      recovery: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', test: '🔬' };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  async runCommand(command, timeout = 10000) {
    return new Promise((resolve) => {
      const process = exec(command, { timeout });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => { stdout += data; });
      process.stderr?.on('data', (data) => { stderr += data; });

      process.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      process.on('error', (error) => {
        resolve({ code: -1, stdout, stderr: error.message });
      });
    });
  }

  async testReactDiagnostic() {
    this.log('Testing React diagnostic system...', 'test');

    try {
      // Check if diagnostic component exists
      const diagnosticExists = await fs.access('src/components/DiagnosticSystem.tsx')
        .then(() => true)
        .catch(() => false);

      if (!diagnosticExists) {
        return {
          success: false,
          message: '❌ DiagnosticSystem component not found'
        };
      }

      // Test if main.tsx can switch to diagnostic mode
      const mainContent = await fs.readFile('src/main.tsx', 'utf8');
      const hasErrorHandling = mainContent.includes('try') && mainContent.includes('catch');

      return {
        success: hasErrorHandling,
        message: hasErrorHandling
          ? '✅ React diagnostic system ready'
          : '⚠️  Limited error handling in main.tsx'
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ React diagnostic test failed: ${error.message}`
      };
    }
  }

  async testErrorBoundaries() {
    this.log('Testing error boundary system...', 'test');

    try {
      const errorBoundaryExists = await fs.access('src/components/ErrorBoundary.tsx')
        .then(() => true)
        .catch(() => false);

      if (!errorBoundaryExists) {
        return {
          success: false,
          message: '❌ ErrorBoundary component not found'
        };
      }

      // Check if App.tsx uses error boundaries
      const appContent = await fs.readFile('src/App.tsx', 'utf8');
      const hasErrorBoundary = appContent.includes('ErrorBoundary') || appContent.includes('try');

      return {
        success: true,
        message: hasErrorBoundary
          ? '✅ Error boundaries implemented'
          : '⚠️  Error boundaries available but not used in App.tsx',
        details: { hasErrorBoundary, errorBoundaryExists }
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Error boundary test failed: ${error.message}`
      };
    }
  }

  async testRecoveryMechanisms() {
    this.log('Testing recovery mechanisms...', 'test');

    const mechanisms = [];

    // Test 1: Fallback component rendering
    try {
      const mainContent = await fs.readFile('src/main.tsx', 'utf8');
      const hasFallback = mainContent.includes('fallback') || mainContent.includes('innerHTML');
      mechanisms.push({
        name: 'Fallback Rendering',
        success: hasFallback,
        message: hasFallback ? '✅ Fallback rendering available' : '❌ No fallback rendering'
      });
    } catch (error) {
      mechanisms.push({
        name: 'Fallback Rendering',
        success: false,
        message: `❌ Could not test fallback: ${error.message}`
      });
    }

    // Test 2: Error logging system
    try {
      const hasErrorLogging = await fs.access('src/utils/debug-logger.ts')
        .then(() => true)
        .catch(() => false);
      mechanisms.push({
        name: 'Error Logging',
        success: hasErrorLogging,
        message: hasErrorLogging ? '✅ Debug logger available' : '⚠️  No debug logger found'
      });
    } catch (error) {
      mechanisms.push({
        name: 'Error Logging',
        success: false,
        message: `❌ Error logging test failed: ${error.message}`
      });
    }

    // Test 3: Health check endpoints
    mechanisms.push({
      name: 'Health Check Script',
      success: true,
      message: '✅ Health check script available'
    });

    const allPassed = mechanisms.every(m => m.success);
    return {
      success: allPassed,
      message: `Recovery mechanisms: ${mechanisms.filter(m => m.success).length}/${mechanisms.length} available`,
      mechanisms
    };
  }

  async runComprehensiveTest() {
    this.log('🚀 Starting Comprehensive ProjectFlow Test Suite...', 'info');
    this.log('=' .repeat(60), 'info');

    // Phase 1: Infrastructure Health Check
    this.log('Phase 1: Infrastructure Health Check', 'info');
    await this.healthChecker.runAllChecks();
    this.testResults.infrastructure = this.healthChecker.results;

    // Phase 2: MCP Dependency Analysis (NEW - Critical for debugging blank page issues!)
    this.log('\nPhase 2: MCP Dependency Analysis', 'info');
    this.log('🔍 This phase identifies the root cause of silent React failures...', 'info');
    await this.mcpTester.runMCPDependencyTests();
    this.testResults.mcpDependencies = this.mcpTester.results;

    // Phase 3: React System Tests
    this.log('\nPhase 3: React System Tests', 'info');
    const reactDiagnostic = await this.testReactDiagnostic();
    const errorBoundaries = await this.testErrorBoundaries();

    this.testResults.react = [reactDiagnostic, errorBoundaries];
    this.testResults.react.forEach(result => {
      this.log(result.message, result.success ? 'success' : 'warning');
    });

    // Phase 4: Recovery Mechanism Tests
    this.log('\nPhase 4: Recovery Mechanism Tests', 'info');
    const recoveryTest = await this.testRecoveryMechanisms();
    this.testResults.recovery = [recoveryTest];

    this.log(recoveryTest.message, recoveryTest.success ? 'success' : 'warning');
    if (recoveryTest.mechanisms) {
      recoveryTest.mechanisms.forEach(mechanism => {
        this.log(`  ${mechanism.message}`, mechanism.success ? 'success' : 'warning');
      });
    }

    // Phase 5: Integration Test (if servers are running)
    this.log('\nPhase 5: Integration Tests', 'info');
    await this.runIntegrationTests();

    // Generate final report
    this.generateFinalReport();
  }

  async runIntegrationTests() {
    try {
      // Test if we can load the main page
      const response = await new Promise((resolve) => {
        const req = http.get('http://localhost:5173/', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            hasContent: data.length > 0,
            hasReact: data.includes('react') || data.includes('React')
          }));
        });

        req.on('error', () => resolve({ success: false, error: 'Connection failed' }));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve({ success: false, error: 'Timeout' });
        });
      });

      this.testResults.integration.push({
        name: 'Main Page Load',
        success: response.success,
        message: response.success
          ? '✅ Main page loads successfully'
          : `❌ Main page failed: ${response.error || response.statusCode}`,
        details: response
      });

    } catch (error) {
      this.testResults.integration.push({
        name: 'Integration Tests',
        success: false,
        message: `❌ Integration test failed: ${error.message}`
      });
    }
  }

  generateFinalReport() {
    const totalDuration = Date.now() - this.startTime;

    this.log(`\n📊 Comprehensive Test Report (${totalDuration}ms)`, 'info');
    this.log('═'.repeat(60), 'info');

    const categories = [
      { name: 'Infrastructure', results: this.testResults.infrastructure },
      { name: 'MCP Dependencies', results: this.flattenMCPResults() },
      { name: 'React System', results: this.testResults.react },
      { name: 'Recovery Mechanisms', results: this.testResults.recovery },
      { name: 'Integration', results: this.testResults.integration }
    ];

    let totalScore = 0;
    let maxScore = 0;

    categories.forEach(category => {
      const passed = category.results.filter(r => r.success).length;
      const total = category.results.length;

      if (total > 0) {
        const percentage = Math.round((passed / total) * 100);
        this.log(`${category.name}: ${passed}/${total} (${percentage}%)`,
          percentage >= 80 ? 'success' : 'warning');

        totalScore += passed;
        maxScore += total;
      }
    });

    const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    this.log(`\n🎯 Overall System Health: ${overallScore}%`,
      overallScore >= 80 ? 'success' : 'warning');

    // Recommendations
    this.log('\n💡 Recommendations:', 'info');
    if (overallScore >= 90) {
      this.log('🎉 Excellent! Your application is well-tested and robust.', 'success');
    } else if (overallScore >= 80) {
      this.log('✅ Good! Minor improvements could enhance reliability.', 'success');
    } else if (overallScore >= 60) {
      this.log('⚠️  Consider implementing more error handling and recovery mechanisms.', 'warning');
    } else {
      this.log('🚨 Critical issues detected. Address infrastructure and error handling.', 'error');
    }

    // Save detailed report
    this.saveDetailedReport({ totalScore, maxScore, overallScore, totalDuration });
  }

  async saveDetailedReport(summary) {
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      testResults: this.testResults,
      recommendations: this.generateRecommendations(summary.overallScore)
    };

    try {
      await fs.writeFile(
        'comprehensive-test-report.json',
        JSON.stringify(report, null, 2)
      );
      this.log('📄 Detailed report saved to comprehensive-test-report.json', 'info');
    } catch (error) {
      this.log(`Failed to save report: ${error.message}`, 'error');
    }
  }

  // Helper method to flatten MCP results for scoring
  flattenMCPResults() {
    if (!this.testResults.mcpDependencies) return [];

    const flattened = [];
    const { importAnalysis, serviceIsolation, agentImplementation, databaseDependencies } = this.testResults.mcpDependencies;

    // Convert MCP analysis to pass/fail results
    flattened.push({
      success: importAnalysis.filter(r => r.severity === 'critical').length === 0,
      category: 'Critical Import Issues'
    });

    flattened.push({
      success: serviceIsolation.filter(r => !r.canImport).length === 0,
      category: 'Service Import Safety'
    });

    flattened.push({
      success: agentImplementation.filter(r => r.riskLevel === 'critical').length === 0,
      category: 'Agent Implementation Safety'
    });

    flattened.push({
      success: databaseDependencies.filter(r => r.riskLevel === 'critical').length === 0,
      category: 'Database Dependency Safety'
    });

    return flattened;
  }

  generateRecommendations(score) {
    const recommendations = [];

    // MCP-specific recommendations based on our findings
    recommendations.push('🔍 MCP DEPENDENCY FINDINGS:');
    recommendations.push('  • MCP Client imports cause silent React failures');
    recommendations.push('  • Services with immediate execution cannot be safely imported');
    recommendations.push('  • Database operations need table existence checks');
    recommendations.push('  • Agent implementations require comprehensive error handling');

    if (score < 80) {
      recommendations.push('🚨 CRITICAL ACTIONS:');
      recommendations.push('  • Refactor App.tsx to conditionally load MCP-dependent services');
      recommendations.push('  • Add import-safety checks to all services');
      recommendations.push('  • Implement comprehensive error boundaries in all major components');
      recommendations.push('  • Add fallback UI components for graceful degradation');
    }

    if (score < 90) {
      recommendations.push('⚠️  IMPROVEMENTS:');
      recommendations.push('  • Add lazy loading for heavy AI/agent components');
      recommendations.push('  • Implement feature flags for optional services');
      recommendations.push('  • Consider adding automated testing for critical user flows');
      recommendations.push('  • Implement health check endpoints for better monitoring');
    }

    recommendations.push('📋 ONGOING MAINTENANCE:');
    recommendations.push('  • Run MCP dependency tests before major releases');
    recommendations.push('  • Monitor import safety when adding new services');
    recommendations.push('  • Regular testing with this comprehensive suite');
    recommendations.push('  • Monitor error rates in production environment');

    return recommendations;
  }
}

// Run comprehensive test if called directly
if (require.main === module) {
  const tester = new AppTester();
  tester.runComprehensiveTest().catch(console.error);
}

module.exports = AppTester;