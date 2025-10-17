#!/usr/bin/env node

/**
 * ProjectFlow Health Check Script
 * Automated system health verification before running the application
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class HealthChecker {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  async checkUrl(url, timeout = 5000, expectedStatus = 200) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const client = url.startsWith('https://') ? https : http;

      const req = client.get(url, (res) => {
        const duration = Date.now() - startTime;
        const success = res.statusCode === expectedStatus;

        resolve({
          success,
          status: res.statusCode,
          duration,
          message: success
            ? `✅ ${url} responded with ${res.statusCode} in ${duration}ms`
            : `❌ ${url} returned ${res.statusCode}, expected ${expectedStatus}`
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        resolve({
          success: false,
          error: error.message,
          duration,
          message: `❌ ${url} failed: ${error.message}`
        });
      });

      req.setTimeout(timeout, () => {
        req.destroy();
        resolve({
          success: false,
          duration: timeout,
          message: `❌ ${url} timed out after ${timeout}ms`
        });
      });
    });
  }

  async checkFileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return {
        success: true,
        message: `✅ File exists: ${filePath}`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ File missing: ${filePath}`
      };
    }
  }

  async checkPackageJson() {
    const packagePath = path.join(process.cwd(), 'package.json');
    try {
      const packageContent = await fs.promises.readFile(packagePath, 'utf8');
      const packageData = JSON.parse(packageContent);

      const requiredScripts = ['dev', 'build', 'mcp-bridge'];
      const missingScripts = requiredScripts.filter(script => !packageData.scripts[script]);

      if (missingScripts.length > 0) {
        return {
          success: false,
          message: `❌ Missing package.json scripts: ${missingScripts.join(', ')}`
        };
      }

      return {
        success: true,
        message: '✅ package.json configuration valid',
        data: {
          name: packageData.name,
          version: packageData.version,
          scripts: Object.keys(packageData.scripts)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ package.json error: ${error.message}`
      };
    }
  }

  async runAllChecks() {
    this.log('🚀 Starting ProjectFlow Health Check...', 'info');

    // Check critical files
    this.log('📁 Checking critical files...', 'info');
    const fileChecks = await Promise.all([
      this.checkFileExists('package.json'),
      this.checkFileExists('src/main.tsx'),
      this.checkFileExists('src/App.tsx'),
      this.checkFileExists('index.html'),
      this.checkFileExists('.env'),
    ]);

    fileChecks.forEach(result => {
      this.log(result.message, result.success ? 'success' : 'error');
      this.results.push({ category: 'files', ...result });
    });

    // Check package.json configuration
    this.log('📦 Checking package.json configuration...', 'info');
    const packageCheck = await this.checkPackageJson();
    this.log(packageCheck.message, packageCheck.success ? 'success' : 'error');
    this.results.push({ category: 'config', ...packageCheck });

    // Check development servers
    this.log('🌐 Checking server connectivity...', 'info');
    const serverChecks = await Promise.all([
      this.checkUrl('http://localhost:5173/', 3000, 200),
      this.checkUrl('http://localhost:3001/health', 3000).catch(() => ({
        success: false,
        message: '⚠️  MCP Bridge server not responding (may not be started yet)'
      })),
      this.checkUrl('http://localhost:54321/rest/v1/', 3000).catch(() => ({
        success: false,
        message: '⚠️  Supabase not accessible (Docker may not be running)'
      })),
    ]);

    serverChecks.forEach(result => {
      this.log(result.message, result.success ? 'success' : 'warning');
      this.results.push({ category: 'servers', ...result });
    });

    // Generate summary report
    this.generateReport();
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const categories = ['files', 'config', 'servers'];

    this.log(`\n📊 Health Check Summary (${totalDuration}ms)`, 'info');
    this.log('═'.repeat(50), 'info');

    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.success).length;
      const total = categoryResults.length;

      this.log(`${category.toUpperCase()}: ${passed}/${total} checks passed`,
        passed === total ? 'success' : 'warning');
    });

    const totalPassed = this.results.filter(r => r.success).length;
    const totalChecks = this.results.length;
    const healthScore = Math.round((totalPassed / totalChecks) * 100);

    this.log(`\n🎯 Overall Health Score: ${healthScore}%`,
      healthScore >= 80 ? 'success' : 'warning');

    // Recommendations
    this.log('\n💡 Recommendations:', 'info');
    if (healthScore === 100) {
      this.log('🎉 All systems healthy! Ready to run the application.', 'success');
    } else if (healthScore >= 80) {
      this.log('⚠️  Some optional services are down, but core functionality should work.', 'warning');
    } else {
      this.log('🚨 Critical issues detected. Please resolve before running the application.', 'error');
    }

    // Write detailed report to file
    this.writeReportFile();
  }

  async writeReportFile() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        healthScore: Math.round((this.results.filter(r => r.success).length / this.results.length) * 100)
      }
    };

    try {
      await fs.promises.writeFile(
        'health-check-report.json',
        JSON.stringify(report, null, 2)
      );
      this.log('📄 Detailed report saved to health-check-report.json', 'info');
    } catch (error) {
      this.log(`Failed to write report: ${error.message}`, 'error');
    }
  }
}

// Run health check if called directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = HealthChecker;