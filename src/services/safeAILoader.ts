/**
 * Safe AI Feature Loader
 * Provides controlled loading of AI features with error isolation
 * Prevents import-related failures that cause blank pages
 */

interface AIFeatureConfig {
  name: string;
  enabled: boolean;
  loadPriority: number;
  dependencies?: string[];
  fallbackComponent?: () => Promise<React.ComponentType<any>>;
  testMode?: boolean;
}

interface AILoadResult {
  success: boolean;
  component?: React.ComponentType<any>;
  error?: string;
  fallbackUsed?: boolean;
}

class SafeAILoader {
  private featureFlags = new Map<string, boolean>();
  private loadedFeatures = new Map<string, AILoadResult>();
  private loadingQueue = new Set<string>();

  // Default feature configurations
  private readonly defaultFeatures: Record<string, AIFeatureConfig> = {
    'claude-integration': {
      name: 'Claude Integration',
      enabled: false,
      loadPriority: 1,
      dependencies: ['@anthropic-ai/sdk'],
      testMode: true,
      fallbackComponent: () => import('../components/fallbacks/ClaudeFallback').then(m => m.default)
    },
    'voice-assistant': {
      name: 'Voice Assistant',
      enabled: false,
      loadPriority: 2,
      dependencies: ['claude-integration'],
      testMode: true,
      fallbackComponent: () => import('../components/fallbacks/VoiceAssistantFallback').then(m => m.default)
    },
    'chat-agent': {
      name: 'Chat Agent',
      enabled: false,
      loadPriority: 3,
      dependencies: ['claude-integration', '@modelcontextprotocol/sdk'],
      testMode: true,
      fallbackComponent: () => import('../components/fallbacks/ChatAgentFallback').then(m => m.default)
    },
    'mcp-bridge': {
      name: 'MCP Bridge',
      enabled: false,
      loadPriority: 4,
      dependencies: ['@modelcontextprotocol/sdk'],
      testMode: true,
      fallbackComponent: () => import('../components/fallbacks/MCPBridgeFallback').then(m => m.default)
    }
  };

  constructor() {
    // Initialize all features as disabled by default
    Object.keys(this.defaultFeatures).forEach(key => {
      this.featureFlags.set(key, false);
    });
  }

  // Check if feature can be safely loaded
  async canLoadFeature(featureKey: string): Promise<boolean> {
    const config = this.defaultFeatures[featureKey];
    if (!config) return false;

    // Check if feature is enabled
    if (!config.enabled && !config.testMode) return false;

    // Check if already loading
    if (this.loadingQueue.has(featureKey)) return false;

    // Check dependencies
    if (config.dependencies) {
      for (const dep of config.dependencies) {
        if (dep.startsWith('@')) {
          // External package dependency - test import safety
          try {
            const testResult = await this.testPackageImport(dep);
            if (!testResult.safe) {
              console.warn(`🚫 Feature ${featureKey} blocked: unsafe dependency ${dep}`);
              return false;
            }
          } catch (error) {
            console.warn(`🚫 Feature ${featureKey} blocked: dependency test failed for ${dep}`, error);
            return false;
          }
        } else {
          // Internal feature dependency
          const depResult = this.loadedFeatures.get(dep);
          if (!depResult || !depResult.success) {
            console.warn(`🚫 Feature ${featureKey} blocked: missing dependency ${dep}`);
            return false;
          }
        }
      }
    }

    return true;
  }

  // Test if a package can be safely imported
  private async testPackageImport(packageName: string): Promise<{ safe: boolean; error?: string }> {
    try {
      // Create a test worker/context to avoid polluting main thread
      const testImport = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Import test timeout'));
        }, 5000);

        // Try dynamic import in isolated context
        import(/* @vite-ignore */ packageName)
          .then(() => {
            clearTimeout(timeoutId);
            resolve({ safe: true });
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            resolve({ safe: false, error: error.message });
          });
      });

      const result = await testImport as { safe: boolean; error?: string };
      return result;
    } catch (error) {
      return { safe: false, error: (error as Error).message };
    }
  }

  // Load a specific AI feature safely
  async loadFeature(featureKey: string): Promise<AILoadResult> {
    const config = this.defaultFeatures[featureKey];
    if (!config) {
      return { success: false, error: `Unknown feature: ${featureKey}` };
    }

    // Check if already loaded
    if (this.loadedFeatures.has(featureKey)) {
      return this.loadedFeatures.get(featureKey)!;
    }

    // Check if can load
    const canLoad = await this.canLoadFeature(featureKey);
    if (!canLoad) {
      const result: AILoadResult = { success: false, error: 'Feature cannot be loaded safely' };
      this.loadedFeatures.set(featureKey, result);
      return result;
    }

    // Mark as loading
    this.loadingQueue.add(featureKey);

    try {
      let component: React.ComponentType<any> | undefined;

      // Attempt to load the actual feature component
      switch (featureKey) {
        case 'claude-integration':
          component = await this.loadClaudeIntegration();
          break;
        case 'voice-assistant':
          component = await this.loadVoiceAssistant();
          break;
        case 'chat-agent':
          component = await this.loadChatAgent();
          break;
        case 'mcp-bridge':
          component = await this.loadMCPBridge();
          break;
        default:
          throw new Error(`No loader implemented for ${featureKey}`);
      }

      const result: AILoadResult = { success: true, component };
      this.loadedFeatures.set(featureKey, result);
      this.featureFlags.set(featureKey, true);

      console.log(`✅ Successfully loaded AI feature: ${config.name}`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to load AI feature ${config.name}:`, error);

      // Try to use fallback if available
      if (config.fallbackComponent) {
        try {
          const fallbackComponent = await config.fallbackComponent();
          const result: AILoadResult = {
            success: true,
            component: fallbackComponent,
            fallbackUsed: true
          };
          this.loadedFeatures.set(featureKey, result);
          return result;
        } catch (fallbackError) {
          console.error(`Failed to load fallback for ${featureKey}:`, fallbackError);
        }
      }

      const result: AILoadResult = { success: false, error: (error as Error).message };
      this.loadedFeatures.set(featureKey, result);
      return result;
    } finally {
      this.loadingQueue.delete(featureKey);
    }
  }

  // Specific feature loaders with safe import handling
  private async loadClaudeIntegration(): Promise<React.ComponentType<any>> {
    try {
      // Try to dynamically import the Claude integration component
      const module = await import('../components/ClaudeIntegration');
      return module.default || module.ClaudeIntegration;
    } catch (error) {
      console.warn('ClaudeIntegration component not found, using fallback');
      // Return fallback component
      const fallback = await import('../components/fallbacks/ClaudeFallback');
      return fallback.default;
    }
  }

  private async loadVoiceAssistant(): Promise<React.ComponentType<any>> {
    try {
      const module = await import('../components/VoiceAssistant');
      return module.default || module.VoiceAssistant;
    } catch (error) {
      console.warn('VoiceAssistant component not found, using fallback');
      const fallback = await import('../components/fallbacks/VoiceAssistantFallback');
      return fallback.default;
    }
  }

  private async loadChatAgent(): Promise<React.ComponentType<any>> {
    try {
      const module = await import('../components/ChatAgent');
      return module.default || module.ChatAgent;
    } catch (error) {
      console.warn('ChatAgent component not found, using fallback');
      // This is expected - ChatAgent caused the original blank page issue
      const fallback = await import('../components/fallbacks/ChatAgentFallback');
      return fallback.default;
    }
  }

  private async loadMCPBridge(): Promise<React.ComponentType<any>> {
    try {
      const module = await import('../components/MCPBridge');
      return module.default || module.MCPBridge;
    } catch (error) {
      console.warn('MCPBridge component not found, using fallback');
      const fallback = await import('../components/fallbacks/MCPBridgeFallback');
      return fallback.default;
    }
  }

  // Feature flag management
  enableFeature(featureKey: string, enabled: boolean = true): void {
    if (this.defaultFeatures[featureKey]) {
      this.defaultFeatures[featureKey].enabled = enabled;
      console.log(`🎛️  Feature ${featureKey} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  enableTestMode(featureKey: string, testMode: boolean = true): void {
    if (this.defaultFeatures[featureKey]) {
      this.defaultFeatures[featureKey].testMode = testMode;
      console.log(`🧪 Test mode ${testMode ? 'enabled' : 'disabled'} for ${featureKey}`);
    }
  }

  // Get current status of all features
  getFeatureStatus(): Record<string, { enabled: boolean; loaded: boolean; canLoad: boolean }> {
    const status: Record<string, { enabled: boolean; loaded: boolean; canLoad: boolean }> = {};

    Object.keys(this.defaultFeatures).forEach(key => {
      const config = this.defaultFeatures[key];
      const loadResult = this.loadedFeatures.get(key);

      status[key] = {
        enabled: config.enabled || config.testMode || false,
        loaded: loadResult?.success || false,
        canLoad: false // Will be set asynchronously if needed
      };
    });

    return status;
  }

  // Batch load features by priority (optimized)
  async loadFeaturesByPriority(): Promise<Record<string, AILoadResult>> {
    const results: Record<string, AILoadResult> = {};

    // Sort features by priority
    const sortedFeatures = Object.entries(this.defaultFeatures)
      .filter(([_, config]) => config.enabled || config.testMode)
      .sort(([_, a], [__, b]) => a.loadPriority - b.loadPriority);

    // Load high-priority features in parallel (priority 1-2)
    const highPriorityFeatures = sortedFeatures.filter(([_, config]) => config.loadPriority <= 2);
    const lowPriorityFeatures = sortedFeatures.filter(([_, config]) => config.loadPriority > 2);

    // Load high-priority features concurrently
    if (highPriorityFeatures.length > 0) {
      console.log('🚀 Loading high-priority AI features concurrently');
      const highPriorityPromises = highPriorityFeatures.map(async ([key, _]) => {
        const result = await this.loadFeature(key);
        return { key, result };
      });

      const highPriorityResults = await Promise.allSettled(highPriorityPromises);
      highPriorityResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[result.value.key] = result.value.result;
        } else {
          const key = highPriorityFeatures[index][0];
          results[key] = { success: false, error: 'Failed to load in parallel batch' };
        }
      });
    }

    // Load low-priority features sequentially to avoid resource contention
    for (const [key, _] of lowPriorityFeatures) {
      console.log(`🔄 Loading low-priority feature: ${key}`);
      results[key] = await this.loadFeature(key);

      // Minimal delay to prevent blocking UI thread
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`✅ Feature loading complete: ${Object.keys(results).length} features processed`);
    return results;
  }

  // Health check for AI system
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'failed';
    features: Record<string, 'loaded' | 'fallback' | 'failed'>;
    services: Record<string, 'healthy' | 'degraded' | 'failed'>;
    recommendations: string[];
  }> {
    const features: Record<string, 'loaded' | 'fallback' | 'failed'> = {};
    const services: Record<string, 'healthy' | 'degraded' | 'failed'> = {};
    let loadedCount = 0;
    let fallbackCount = 0;
    let failedCount = 0;

    // Check feature status
    for (const [key, _] of Object.entries(this.defaultFeatures)) {
      const result = this.loadedFeatures.get(key);
      if (!result) {
        features[key] = 'failed';
        failedCount++;
      } else if (result.success && result.fallbackUsed) {
        features[key] = 'fallback';
        fallbackCount++;
      } else if (result.success) {
        features[key] = 'loaded';
        loadedCount++;
      } else {
        features[key] = 'failed';
        failedCount++;
      }
    }

    // Check service health
    try {
      // Check SafeClaudeService
      const { safeClaudeService } = await import('./safeClaudeService');
      const claudeHealth = await safeClaudeService.performHealthCheck();
      services['claude'] = claudeHealth.status;
    } catch (error) {
      services['claude'] = 'failed';
    }

    try {
      // Check SafeMCPService
      const { safeMCPService } = await import('./safeMCPService');
      const mcpHealth = await safeMCPService.performHealthCheck();
      services['mcp'] = mcpHealth.status;
    } catch (error) {
      services['mcp'] = 'failed';
    }

    // Determine overall health
    const totalFeatures = Object.keys(this.defaultFeatures).length;
    const serviceHealthy = Object.values(services).some(status => status === 'healthy');
    let overall: 'healthy' | 'degraded' | 'failed';
    const recommendations: string[] = [];

    if (loadedCount === totalFeatures && serviceHealthy) {
      overall = 'healthy';
    } else if (loadedCount + fallbackCount >= totalFeatures * 0.5 || serviceHealthy) {
      overall = 'degraded';
      recommendations.push('Some AI features are using fallback components');
      if (failedCount > 0) {
        recommendations.push(`${failedCount} features failed to load - check dependencies`);
      }
      if (services['claude'] !== 'healthy') {
        recommendations.push('Claude service not available - check API key');
      }
      if (services['mcp'] !== 'healthy') {
        recommendations.push('MCP bridge not connected - check server status');
      }
    } else {
      overall = 'failed';
      recommendations.push('Majority of AI features failed to load');
      recommendations.push('Check SafeClaudeService and SafeMCPService status');
      recommendations.push('Verify MCP bridge server is running on localhost:3001');
      recommendations.push('Check network connectivity and API keys');
    }

    return { overall, features, services, recommendations };
  }
}

// Export singleton instance
export const safeAILoader = new SafeAILoader();
export type { AIFeatureConfig, AILoadResult };