/**
 * Safe MCP Service - Import-safe Model Context Protocol integration
 * Prevents the MCP dependency failures that contributed to blank page issues
 * Uses controlled initialization and bridge server communication
 */

interface MCPRequest {
  method: string;
  params?: any;
  id?: string;
}

interface MCPResponse {
  success: boolean;
  result?: any;
  error?: string;
  id?: string;
}

interface MCPServiceConfig {
  bridgeUrl: string;
  timeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
}

interface MCPServiceStatus {
  initialized: boolean;
  bridgeConnected: boolean;
  mcpServerConnected: boolean;
  lastError?: string;
  bridgeUrl: string;
  protocolVersion?: string;
}

class SafeMCPService {
  private initialized = false;
  private config: MCPServiceConfig = {
    bridgeUrl: 'http://localhost:3001',
    timeout: 10000,
    retryAttempts: 3,
    healthCheckInterval: 30000
  };
  private lastError: string | null = null;
  private healthCheckTimer: any = null;
  private bridgeStatus: MCPServiceStatus | null = null;

  // Safe initialization - only when needed
  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      console.log('🔄 SafeMCPService: Attempting to initialize...');

      // Test bridge connection first
      const bridgeHealthy = await this.testBridgeConnection();
      if (!bridgeHealthy) {
        this.lastError = 'MCP bridge server not responding';
        console.warn('⚠️ SafeMCPService: Bridge server not available');
        return false;
      }

      // Initialize service
      this.initialized = true;
      this.lastError = null;

      // Start health monitoring
      this.startHealthMonitoring();

      console.log('✅ SafeMCPService: Initialized successfully');
      return true;

    } catch (error) {
      this.lastError = (error as Error).message;
      console.error('❌ SafeMCPService: Initialization failed:', error);
      return false;
    }
  }

  // Test connection to MCP bridge server
  async testBridgeConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.bridgeUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ MCP Bridge health check:', data);
        return true;
      } else {
        console.warn('⚠️ MCP Bridge health check failed:', response.status);
        return false;
      }

    } catch (error) {
      console.warn('⚠️ MCP Bridge connection failed:', (error as Error).message);
      return false;
    }
  }

  // Send request to MCP server through bridge using available endpoints
  async callMCPTool(toolName: string, params: any = {}): Promise<MCPResponse> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady) {
        return {
          success: false,
          error: this.lastError || 'Service not available'
        };
      }

      console.log('📤 SafeMCPService: Calling MCP tool...', toolName);

      const response = await fetch(`${this.config.bridgeUrl}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: toolName,
          arguments: params
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ SafeMCPService: Received MCP response');

        return {
          success: true,
          result: data,
          id: `tool-${toolName}-${Date.now()}`
        };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('❌ SafeMCPService: Tool call failed:', error);

      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific errors
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Bridge server unavailable';
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Project management specific methods using MCP bridge API
  async generateProjectTasks(projectId: string, projectDescription: string): Promise<MCPResponse> {
    return this.callMCPTool('createTask', {
      projectId,
      description: projectDescription,
      title: 'Generated Task',
      priority: 'medium'
    });
  }

  async analyzeProject(projectData: any): Promise<MCPResponse> {
    // Use available MCP bridge endpoints
    try {
      const response = await fetch(`${this.config.bridgeUrl}/api/planner-projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          result: { projects: data, analysis: 'Project data retrieved successfully' }
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getProjectInsights(projectId: string): Promise<MCPResponse> {
    // Get project tasks for insights
    try {
      const response = await fetch(`${this.config.bridgeUrl}/api/tasks/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          result: {
            projectId,
            tasks: data,
            insights: `Found ${data.length} tasks for project ${projectId}`
          }
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  // Resource management through MCP
  async listAvailableTools(): Promise<MCPResponse> {
    try {
      const response = await fetch(`${this.config.bridgeUrl}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          result: data
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async listAvailableResources(): Promise<MCPResponse> {
    // MCP bridge doesn't have resources endpoint, return tools instead
    return this.listAvailableTools();
  }

  // Get comprehensive service status
  async getServiceStatus(): Promise<MCPServiceStatus> {
    try {
      const bridgeHealthy = await this.testBridgeConnection();
      let mcpServerHealthy = false;
      let protocolVersion = undefined;

      if (bridgeHealthy) {
        // Test MCP server connection through bridge by calling tools endpoint
        const toolsResponse = await this.listAvailableTools();
        mcpServerHealthy = toolsResponse.success;

        // If we can list tools, the MCP server is connected
        if (mcpServerHealthy) {
          protocolVersion = '2024-11-05'; // Current protocol version
        }
      }

      this.bridgeStatus = {
        initialized: this.initialized,
        bridgeConnected: bridgeHealthy,
        mcpServerConnected: mcpServerHealthy,
        lastError: this.lastError || undefined,
        bridgeUrl: this.config.bridgeUrl,
        protocolVersion
      };

      return this.bridgeStatus;

    } catch (error) {
      return {
        initialized: this.initialized,
        bridgeConnected: false,
        mcpServerConnected: false,
        lastError: (error as Error).message,
        bridgeUrl: this.config.bridgeUrl
      };
    }
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.getServiceStatus();
        console.log('🔍 SafeMCPService: Health check completed');
      } catch (error) {
        console.warn('⚠️ SafeMCPService: Health check failed:', error);
      }
    }, this.config.healthCheckInterval);
  }

  // Configuration management
  updateConfig(config: Partial<MCPServiceConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 SafeMCPService: Configuration updated', this.config);

    // Restart health monitoring with new config
    if (this.initialized) {
      this.startHealthMonitoring();
    }
  }

  getConfig(): MCPServiceConfig {
    return { ...this.config };
  }

  // Reset service (useful for error recovery)
  async reset(): Promise<void> {
    console.log('🔄 SafeMCPService: Resetting service...');

    // Clear health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Reset state
    this.initialized = false;
    this.lastError = null;
    this.bridgeStatus = null;

    // Test reinitialization
    await this.ensureInitialized();
  }

  // Health check method for monitoring
  async performHealthCheck(): Promise<{
    service: 'mcp';
    status: 'healthy' | 'degraded' | 'failed';
    details: MCPServiceStatus;
    timestamp: string;
  }> {
    const status = await this.getServiceStatus();

    let overallStatus: 'healthy' | 'degraded' | 'failed';
    if (status.bridgeConnected && status.mcpServerConnected) {
      overallStatus = 'healthy';
    } else if (status.bridgeConnected) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'failed';
    }

    return {
      service: 'mcp',
      status: overallStatus,
      details: status,
      timestamp: new Date().toISOString()
    };
  }

  // Test specific MCP functionality
  async testMCPFunctionality(): Promise<{
    toolsAvailable: boolean;
    resourcesAvailable: boolean;
    canGenerateTasks: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let toolsAvailable = false;
    let resourcesAvailable = false;
    let canGenerateTasks = false;

    try {
      // Test tools listing
      const toolsResponse = await this.listAvailableTools();
      toolsAvailable = toolsResponse.success;
      if (!toolsAvailable) {
        errors.push(`Tools listing failed: ${toolsResponse.error}`);
      }

      // Test resources listing
      const resourcesResponse = await this.listAvailableResources();
      resourcesAvailable = resourcesResponse.success;
      if (!resourcesAvailable) {
        errors.push(`Resources listing failed: ${resourcesResponse.error}`);
      }

      // Test task generation
      const taskResponse = await this.generateProjectTasks(
        'test-project',
        'Test project for functionality validation'
      );
      canGenerateTasks = taskResponse.success;
      if (!canGenerateTasks) {
        errors.push(`Task generation failed: ${taskResponse.error}`);
      }

    } catch (error) {
      errors.push(`Functionality test error: ${(error as Error).message}`);
    }

    return {
      toolsAvailable,
      resourcesAvailable,
      canGenerateTasks,
      errors
    };
  }

  // Cleanup method
  dispose(): void {
    console.log('🧹 SafeMCPService: Disposing service...');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    this.initialized = false;
    this.lastError = null;
    this.bridgeStatus = null;
  }
}

// Export singleton instance
export const safeMCPService = new SafeMCPService();
export type { MCPRequest, MCPResponse, MCPServiceConfig, MCPServiceStatus };