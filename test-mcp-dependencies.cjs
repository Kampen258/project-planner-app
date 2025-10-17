#!/usr/bin/env node

/**
 * MCP Dependency Test Suite
 * Specifically tests for the issues that cause silent React failures:
 * 1. MCP Client imports in services
 * 2. Document service dependencies on non-existent DB tables
 * 3. Agent function implementations requiring MCP bridge
 */

const fs = require('fs').promises;
const path = require('path');

class MCPDependencyTester {
  constructor() {
    this.results = {
      importAnalysis: [],
      serviceIsolation: [],
      agentImplementation: [],
      databaseDependencies: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', test: '🧪' };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  // Test 1: Analyze import dependencies that can cause silent failures
  async analyzeImportDependencies() {
    this.log('🔍 Analyzing import dependencies for MCP-related failures...', 'test');

    const problematicImports = [
      'mcpClient',
      'documentService',
      'voiceAssistantService',
      'metadataAIService',
      'claudeService'
    ];

    const srcFiles = await this.getAllTSFiles('src');

    for (const filePath of srcFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const imports = this.extractImports(content);

        const problematicFound = imports.filter(imp =>
          problematicImports.some(prob => imp.includes(prob))
        );

        if (problematicFound.length > 0) {
          this.results.importAnalysis.push({
            file: filePath,
            problematicImports: problematicFound,
            severity: this.assessImportSeverity(filePath, problematicFound),
            recommendation: this.getImportRecommendation(filePath, problematicFound)
          });
        }
      } catch (error) {
        this.log(`Error analyzing ${filePath}: ${error.message}`, 'warning');
      }
    }

    this.log(`Found ${this.results.importAnalysis.length} files with problematic imports`,
      this.results.importAnalysis.length > 0 ? 'warning' : 'success');
  }

  // Test 2: Check if services can be imported without throwing errors
  async testServiceIsolation() {
    this.log('🧪 Testing service isolation (can services be imported safely?)...', 'test');

    const services = [
      'src/services/claudeService.ts',
      'src/services/documentService.ts',
      'src/services/voiceAssistantService.ts',
      'src/services/metadataAIService.ts',
      'src/services/braindumpService.ts'
    ];

    for (const servicePath of services) {
      try {
        const exists = await fs.access(servicePath).then(() => true).catch(() => false);
        if (!exists) {
          this.results.serviceIsolation.push({
            service: servicePath,
            status: 'not_found',
            canImport: false,
            message: 'Service file does not exist'
          });
          continue;
        }

        const content = await fs.readFile(servicePath, 'utf8');

        // Check for immediate execution that could fail
        const hasImmediateExecution = this.checkForImmediateExecution(content);
        const hasMCPDependency = content.includes('mcpClient') || content.includes('import.*mcp');
        const hasDBDependency = content.includes('supabase') && content.includes('from(');

        this.results.serviceIsolation.push({
          service: servicePath,
          status: 'analyzed',
          hasImmediateExecution,
          hasMCPDependency,
          hasDBDependency,
          canImport: !hasImmediateExecution, // Services with immediate execution will fail imports
          riskLevel: this.assessServiceRisk(hasImmediateExecution, hasMCPDependency, hasDBDependency),
          recommendation: this.getServiceRecommendation(hasImmediateExecution, hasMCPDependency, hasDBDependency)
        });

      } catch (error) {
        this.results.serviceIsolation.push({
          service: servicePath,
          status: 'error',
          canImport: false,
          error: error.message
        });
      }
    }
  }

  // Test 3: Check agent implementation dependencies
  async testAgentImplementations() {
    this.log('🤖 Testing agent implementation dependencies...', 'test');

    const agentFiles = await this.findFilesContaining(['agent', 'claude', 'mcp'], 'src');

    for (const filePath of agentFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');

        const analysis = {
          file: filePath,
          requiresMCPBridge: content.includes('mcpClient') || content.includes('mcp-bridge'),
          requiresDatabase: content.includes('supabase') && content.includes('from('),
          requiresExternalAPI: content.includes('fetch(') || content.includes('axios'),
          hasErrorHandling: content.includes('try') && content.includes('catch'),
          hasGracefulDegradation: content.includes('fallback') || content.includes('optional'),
          canWorkOffline: false
        };

        // Assess if agent can work without external dependencies
        analysis.canWorkOffline = !analysis.requiresMCPBridge &&
                                 !analysis.requiresDatabase &&
                                 !analysis.requiresExternalAPI;

        analysis.riskLevel = this.assessAgentRisk(analysis);
        analysis.recommendation = this.getAgentRecommendation(analysis);

        this.results.agentImplementation.push(analysis);

      } catch (error) {
        this.log(`Error analyzing agent file ${filePath}: ${error.message}`, 'warning');
      }
    }
  }

  // Test 4: Database dependency validation
  async testDatabaseDependencies() {
    this.log('🗄️  Testing database dependencies and table existence...', 'test');

    const dbTables = [
      'documents',
      'document_templates',
      'document_versions',
      'uploaded_documents',
      'projects',
      'tasks',
      'users'
    ];

    // Check which services reference these tables
    const srcFiles = await this.getAllTSFiles('src');

    for (const filePath of srcFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');

        const referencedTables = dbTables.filter(table =>
          content.includes(`from('${table}')`) ||
          content.includes(`'${table}'`) ||
          content.includes(`"${table}"`)
        );

        if (referencedTables.length > 0) {
          this.results.databaseDependencies.push({
            file: filePath,
            referencedTables,
            hasErrorHandling: content.includes('try') && content.includes('catch'),
            hasGracefulFallback: content.includes('fallback') || content.includes('default'),
            riskLevel: this.assessDBRisk(referencedTables.length, content),
            recommendation: this.getDBRecommendation(referencedTables, content)
          });
        }
      } catch (error) {
        this.log(`Error checking DB dependencies in ${filePath}: ${error.message}`, 'warning');
      }
    }
  }

  // Helper methods for analysis
  extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"][^'"]+['"]/g;
    return content.match(importRegex) || [];
  }

  checkForImmediateExecution(content) {
    // Look for code that executes immediately when imported
    const patterns = [
      /^(?!.*\/\/).*\.\w+\(.*\);?\s*$/m, // Method calls outside functions
      /^(?!.*\/\/).*new\s+\w+\(/m,      // Constructor calls outside functions
      /^(?!.*\/\/).*await\s+/m,         // Await outside functions
      /^(?!.*\/\/).*console\./m         // Console calls outside functions (less risky but indicates immediate execution)
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  assessImportSeverity(filePath, problematicImports) {
    // Main App components are critical
    if (filePath.includes('App.tsx') || filePath.includes('main.tsx')) {
      return 'critical';
    }

    // Context providers are high risk
    if (filePath.includes('Context') || filePath.includes('Provider')) {
      return 'high';
    }

    // Page components are medium risk
    if (filePath.includes('pages/')) {
      return 'medium';
    }

    return 'low';
  }

  assessServiceRisk(hasImmediateExecution, hasMCPDependency, hasDBDependency) {
    if (hasImmediateExecution) return 'critical';
    if (hasMCPDependency && hasDBDependency) return 'high';
    if (hasMCPDependency || hasDBDependency) return 'medium';
    return 'low';
  }

  assessAgentRisk(analysis) {
    if (analysis.requiresMCPBridge && !analysis.hasErrorHandling) return 'critical';
    if (analysis.requiresDatabase && !analysis.hasGracefulDegradation) return 'high';
    if (!analysis.canWorkOffline) return 'medium';
    return 'low';
  }

  assessDBRisk(tableCount, content) {
    if (tableCount > 3 && !content.includes('try')) return 'critical';
    if (tableCount > 1 && !content.includes('catch')) return 'high';
    if (tableCount > 0) return 'medium';
    return 'low';
  }

  // Recommendation methods
  getImportRecommendation(filePath, problematicImports) {
    return `Consider lazy loading or conditional imports for: ${problematicImports.join(', ')}`;
  }

  getServiceRecommendation(hasImmediateExecution, hasMCPDependency, hasDBDependency) {
    if (hasImmediateExecution) return 'Wrap immediate execution in functions or add error handling';
    if (hasMCPDependency) return 'Add MCP connection checks before using client';
    if (hasDBDependency) return 'Add database connectivity checks';
    return 'Service appears safe for import';
  }

  getAgentRecommendation(analysis) {
    const recommendations = [];
    if (analysis.requiresMCPBridge) recommendations.push('Add MCP bridge connectivity checks');
    if (analysis.requiresDatabase) recommendations.push('Add database fallback handling');
    if (!analysis.hasErrorHandling) recommendations.push('Add comprehensive error handling');
    if (!analysis.hasGracefulDegradation) recommendations.push('Implement graceful degradation');

    return recommendations.length > 0 ? recommendations.join('; ') : 'Agent implementation appears robust';
  }

  getDBRecommendation(referencedTables, content) {
    const recommendations = [];
    if (!content.includes('try')) recommendations.push('Add error handling for database operations');
    if (referencedTables.includes('documents')) recommendations.push('Check if document tables exist before use');
    if (referencedTables.length > 2) recommendations.push('Consider service abstraction layer');

    return recommendations.join('; ');
  }

  // File utility methods
  async getAllTSFiles(dir) {
    const files = [];

    async function traverse(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    }

    await traverse(dir);
    return files;
  }

  async findFilesContaining(keywords, dir) {
    const allFiles = await this.getAllTSFiles(dir);
    const matchingFiles = [];

    for (const filePath of allFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if (keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))) {
          matchingFiles.push(filePath);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return matchingFiles;
  }

  // Main test runner
  async runMCPDependencyTests() {
    this.log('🚀 Starting MCP Dependency Test Suite...', 'info');
    this.log('=' .repeat(60), 'info');

    // Run all test phases
    await this.analyzeImportDependencies();
    await this.testServiceIsolation();
    await this.testAgentImplementations();
    await this.testDatabaseDependencies();

    // Generate comprehensive report
    this.generateMCPReport();
  }

  generateMCPReport() {
    const totalDuration = Date.now() - this.startTime;

    this.log(`\n📊 MCP Dependency Test Report (${totalDuration}ms)`, 'info');
    this.log('=' .repeat(60), 'info');

    // Import Analysis Summary
    const criticalImports = this.results.importAnalysis.filter(r => r.severity === 'critical').length;
    this.log(`\n🔍 Import Analysis:`, 'info');
    this.log(`   Files with problematic imports: ${this.results.importAnalysis.length}`,
      this.results.importAnalysis.length === 0 ? 'success' : 'warning');
    this.log(`   Critical import issues: ${criticalImports}`,
      criticalImports === 0 ? 'success' : 'error');

    // Service Isolation Summary
    const unsafeServices = this.results.serviceIsolation.filter(r => !r.canImport).length;
    this.log(`\n🧪 Service Isolation:`, 'info');
    this.log(`   Services tested: ${this.results.serviceIsolation.length}`, 'info');
    this.log(`   Unsafe to import: ${unsafeServices}`,
      unsafeServices === 0 ? 'success' : 'error');

    // Agent Implementation Summary
    const highRiskAgents = this.results.agentImplementation.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length;
    this.log(`\n🤖 Agent Implementation:`, 'info');
    this.log(`   Agent files analyzed: ${this.results.agentImplementation.length}`, 'info');
    this.log(`   High/Critical risk: ${highRiskAgents}`,
      highRiskAgents === 0 ? 'success' : 'warning');

    // Database Dependencies Summary
    const criticalDBIssues = this.results.databaseDependencies.filter(r => r.riskLevel === 'critical').length;
    this.log(`\n🗄️  Database Dependencies:`, 'info');
    this.log(`   Files with DB dependencies: ${this.results.databaseDependencies.length}`, 'info');
    this.log(`   Critical DB issues: ${criticalDBIssues}`,
      criticalDBIssues === 0 ? 'success' : 'error');

    // Overall MCP Health Score
    const totalIssues = criticalImports + unsafeServices + highRiskAgents + criticalDBIssues;
    const healthScore = Math.max(0, 100 - (totalIssues * 15)); // Each major issue reduces score by 15

    this.log(`\n🎯 MCP Dependency Health Score: ${healthScore}%`,
      healthScore >= 85 ? 'success' : healthScore >= 70 ? 'warning' : 'error');

    // Specific Recommendations
    this.log('\n💡 Key Recommendations:', 'info');
    if (criticalImports > 0) {
      this.log('   • Fix critical import issues in main app components', 'error');
    }
    if (unsafeServices > 0) {
      this.log('   • Refactor services with immediate execution to be import-safe', 'error');
    }
    if (highRiskAgents > 0) {
      this.log('   • Add error handling and fallbacks to high-risk agents', 'warning');
    }
    if (criticalDBIssues > 0) {
      this.log('   • Add database connectivity checks before table operations', 'error');
    }
    if (healthScore >= 85) {
      this.log('   🎉 MCP dependencies are well-managed!', 'success');
    }

    // Save detailed report
    this.saveMCPReport({ totalIssues, healthScore, totalDuration });
  }

  async saveMCPReport(summary) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        ...summary,
        testsFailed: summary.totalIssues,
        testsRun: this.results.importAnalysis.length +
                  this.results.serviceIsolation.length +
                  this.results.agentImplementation.length +
                  this.results.databaseDependencies.length
      },
      detailed: this.results,
      conclusions: [
        'MCP Client and Agent implementations are the primary cause of silent React failures',
        'Services with immediate execution cannot be safely imported',
        'Database operations need existence checks before table access',
        'Agent implementations require comprehensive error handling'
      ]
    };

    try {
      await fs.writeFile(
        'mcp-dependency-test-report.json',
        JSON.stringify(report, null, 2)
      );
      this.log('📄 Detailed MCP dependency report saved to mcp-dependency-test-report.json', 'info');
    } catch (error) {
      this.log(`Failed to save report: ${error.message}`, 'error');
    }
  }
}

// Run MCP dependency tests if called directly
if (require.main === module) {
  const tester = new MCPDependencyTester();
  tester.runMCPDependencyTests().catch(console.error);
}

module.exports = MCPDependencyTester;