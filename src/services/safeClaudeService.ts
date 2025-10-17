/**
 * Safe Claude Service - Import-safe AI integration
 * Prevents the import dependency failures that caused blank page issues
 * Uses dynamic imports and lazy initialization to avoid immediate execution
 */

interface ClaudeConfig {
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClaudeResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

interface ClaudeServiceStatus {
  initialized: boolean;
  connected: boolean;
  apiKeyValid: boolean;
  lastError?: string;
  model?: string;
}

class SafeClaudeService {
  private client: any = null;
  private initialized = false;
  private config: ClaudeConfig = {
    model: 'claude-3-haiku-20240307',
    maxTokens: 1000,
    temperature: 0.7
  };
  private lastError: string | null = null;
  private responseCache = new Map<string, { response: ClaudeResponse; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Safe initialization - only when needed
  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      console.log('🔄 SafeClaudeService: Attempting to initialize...');

      // Check for API key first (fail fast)
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        this.lastError = 'API key not configured';
        console.warn('⚠️ SafeClaudeService: No API key found in environment');
        return false;
      }

      // Dynamic import with timeout protection
      const importPromise = import('@anthropic-ai/sdk');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Import timeout after 10 seconds')), 10000)
      );

      const { Anthropic } = await Promise.race([importPromise, timeoutPromise]) as any;

      console.log('✅ SafeClaudeService: Successfully imported Anthropic SDK');

      // Safe client initialization
      this.client = new Anthropic({
        apiKey,
        // Add any additional safe configuration
        dangerouslyAllowBrowser: true // Required for browser usage
      });

      this.config.apiKey = apiKey;
      this.initialized = true;
      this.lastError = null;

      console.log('✅ SafeClaudeService: Client initialized successfully');
      return true;

    } catch (error) {
      this.lastError = (error as Error).message;
      console.error('❌ SafeClaudeService: Initialization failed:', error);

      // Detailed error logging for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.slice(0, 300)
        });
      }

      return false;
    }
  }

  // Test connection to Claude API
  async testConnection(): Promise<ClaudeServiceStatus> {
    const isInitialized = await this.ensureInitialized();

    if (!isInitialized) {
      return {
        initialized: false,
        connected: false,
        apiKeyValid: false,
        lastError: this.lastError || 'Failed to initialize',
        model: this.config.model
      };
    }

    try {
      // Simple test message to validate connection
      const testMessage: ClaudeMessage[] = [
        {
          role: 'user',
          content: 'Hello! Please respond with just "Connection test successful"'
        }
      ];

      const response = await this.sendMessage(testMessage);

      return {
        initialized: true,
        connected: response.success,
        apiKeyValid: response.success,
        lastError: response.error || null,
        model: this.config.model
      };

    } catch (error) {
      return {
        initialized: true,
        connected: false,
        apiKeyValid: false,
        lastError: (error as Error).message,
        model: this.config.model
      };
    }
  }

  // Cache management
  private getCacheKey(content: string, config?: any): string {
    return `${content}-${JSON.stringify(config || {})}`;
  }

  private getCachedResponse(key: string): ClaudeResponse | null {
    const cached = this.responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('📦 Using cached Claude response');
      return cached.response;
    }
    // Clean up expired cache entry
    if (cached) {
      this.responseCache.delete(key);
    }
    return null;
  }

  private setCachedResponse(key: string, response: ClaudeResponse): void {
    // Only cache successful responses
    if (response.success && response.content) {
      this.responseCache.set(key, {
        response,
        timestamp: Date.now()
      });

      // Limit cache size
      if (this.responseCache.size > 50) {
        const oldestKey = this.responseCache.keys().next().value;
        this.responseCache.delete(oldestKey);
      }
    }
  }

  // Send message to Claude (with caching) with comprehensive error handling
  async sendMessage(
    messages: ClaudeMessage[],
    options?: Partial<ClaudeConfig>
  ): Promise<ClaudeResponse> {
    try {
      const isReady = await this.ensureInitialized();
      if (!isReady) {
        return {
          success: false,
          error: this.lastError || 'Service not available'
        };
      }

      // Create cache key from messages and options
      const cacheKey = this.getCacheKey(JSON.stringify(messages), options);

      // Check cache first
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      console.log('📤 SafeClaudeService: Sending message to Claude...');

      // Merge configuration
      const requestConfig = { ...this.config, ...options };

      // Prepare the request
      const response = await this.client.messages.create({
        model: requestConfig.model,
        max_tokens: requestConfig.maxTokens,
        temperature: requestConfig.temperature,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      console.log('✅ SafeClaudeService: Received response from Claude');

      const claudeResponse: ClaudeResponse = {
        success: true,
        content: response.content[0]?.text || '',
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0
        }
      };

      // Cache the successful response
      this.setCachedResponse(cacheKey, claudeResponse);

      return claudeResponse;

    } catch (error) {
      console.error('❌ SafeClaudeService: Message sending failed:', error);

      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific API errors
        if (error.message.includes('api_key')) {
          errorMessage = 'Invalid API key';
        } else if (error.message.includes('rate_limit')) {
          errorMessage = 'Rate limit exceeded';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout';
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Project-specific AI assistance methods
  async generateProjectSuggestions(description: string): Promise<ClaudeResponse> {
    const messages: ClaudeMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful project management assistant. Generate practical suggestions for the given project description. Keep responses concise and actionable.'
      },
      {
        role: 'user',
        content: `Please provide 3-5 practical suggestions for this project: "${description}"`
      }
    ];

    return this.sendMessage(messages, { maxTokens: 500 });
  }

  async generateTaskBreakdown(projectDescription: string): Promise<ClaudeResponse> {
    const messages: ClaudeMessage[] = [
      {
        role: 'system',
        content: 'You are a project management expert. Break down projects into manageable tasks. Format as a simple list.'
      },
      {
        role: 'user',
        content: `Break down this project into 5-8 specific, actionable tasks: "${projectDescription}"`
      }
    ];

    return this.sendMessage(messages, { maxTokens: 600 });
  }

  async improveTaskDescription(taskTitle: string, currentDescription?: string): Promise<ClaudeResponse> {
    const basePrompt = currentDescription
      ? `Improve this task description. Title: "${taskTitle}", Current description: "${currentDescription}"`
      : `Create a clear, actionable description for this task: "${taskTitle}"`;

    const messages: ClaudeMessage[] = [
      {
        role: 'system',
        content: 'You are a task management expert. Create clear, actionable task descriptions with specific acceptance criteria when appropriate.'
      },
      {
        role: 'user',
        content: basePrompt
      }
    ];

    return this.sendMessage(messages, { maxTokens: 400 });
  }

  // Configuration management
  updateConfig(config: Partial<ClaudeConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 SafeClaudeService: Configuration updated', this.config);
  }

  getConfig(): ClaudeConfig {
    return { ...this.config };
  }

  // Service status and health
  getStatus(): ClaudeServiceStatus {
    return {
      initialized: this.initialized,
      connected: this.initialized && !this.lastError,
      apiKeyValid: this.initialized && !!this.config.apiKey,
      lastError: this.lastError || undefined,
      model: this.config.model
    };
  }


  // Health check method for monitoring
  async performHealthCheck(): Promise<{
    service: 'claude';
    status: 'healthy' | 'degraded' | 'failed';
    details: ClaudeServiceStatus;
    timestamp: string;
  }> {
    const status = await this.testConnection();

    let overallStatus: 'healthy' | 'degraded' | 'failed';
    if (status.connected && status.apiKeyValid) {
      overallStatus = 'healthy';
    } else if (status.initialized) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'failed';
    }

    return {
      service: 'claude',
      status: overallStatus,
      details: status,
      timestamp: new Date().toISOString()
    };
  }

  // Clear response cache
  clearCache(): void {
    this.responseCache.clear();
    console.log('🗑️ SafeClaudeService: Response cache cleared');
  }

  // Get cache statistics
  getCacheStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.responseCache.size,
      maxSize: 50,
      ttl: this.CACHE_TTL
    };
  }


  // Cleanup method
  dispose(): void {
    console.log('🧹 SafeClaudeService: Disposing service...');
    this.client = null;
    this.initialized = false;
    this.lastError = null;
    this.clearCache();
  }
}

// Export singleton instance
export const safeClaudeService = new SafeClaudeService();
export type { ClaudeConfig, ClaudeMessage, ClaudeResponse, ClaudeServiceStatus };