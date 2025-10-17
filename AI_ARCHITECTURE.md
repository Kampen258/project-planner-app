# AI System Architecture

## Overview

The ProjectFlow AI system implements a progressive loading architecture designed to prevent import dependency failures while providing robust AI capabilities. The system consists of three main layers: Safe Services, Progressive Loading, and Health Monitoring.

## Core Components

### 1. SafeClaudeService (`/src/services/safeClaudeService.ts`)

The primary AI service providing Claude integration with comprehensive safety measures.

**Key Features:**
- Lazy initialization with import timeout protection
- Comprehensive error handling and recovery
- Browser-safe Anthropic SDK integration
- Project-specific AI capabilities

**Core Methods:**
```typescript
// Safe initialization with timeout protection
private async ensureInitialized(): Promise<boolean>

// Direct messaging with Claude
async sendMessage(message: string, options?: any): Promise<ClaudeResponse>

// Project planning capabilities
async generateProjectSuggestions(description: string): Promise<ClaudeResponse>
async generateTaskBreakdown(projectData: any): Promise<ClaudeResponse>
async optimizeProjectTimeline(tasks: any[]): Promise<ClaudeResponse>
```

**Configuration:**
- API Key: `VITE_ANTHROPIC_API_KEY`
- Model: `claude-3-5-sonnet-20241022`
- Browser Mode: Enabled with `dangerouslyAllowBrowser: true`
- Timeout: 30 seconds for imports, 120 seconds for API calls

### 2. SafeMCPService (`/src/services/safeMCPService.ts`)

Model Context Protocol integration for extended AI tooling.

**Bridge Architecture:**
- External MCP Bridge Server: `localhost:3001`
- Protocol Version: `2024-11-05`
- Health monitoring with automatic reconnection

**Available Endpoints:**
```typescript
// Core MCP operations
/health              // Bridge health check
/tools               // List available MCP tools
/tools/call          // Execute MCP tool
/api/planner-projects // Project data access
/api/tasks/{id}      // Task management
```

**Key Methods:**
```typescript
async callMCPTool(toolName: string, params: any): Promise<MCPResponse>
async generateProjectTasks(projectId: string, description: string): Promise<MCPResponse>
async analyzeProject(projectData: any): Promise<MCPResponse>
async getProjectInsights(projectId: string): Promise<MCPResponse>
```

### 3. SafeAILoader (`/src/services/safeAILoader.ts`)

Progressive loading system for AI features with fallback support.

**Loading Levels:**
- **Level 0**: Core React components (always loaded)
- **Level 1**: Claude Integration (basic AI)
- **Level 2**: Voice Assistant (advanced AI)
- **Level 3**: Chat Agent & MCP Bridge (full AI suite)

**Feature Configuration:**
```typescript
interface AIFeatureConfig {
  name: string;
  enabled: boolean;
  loadPriority: number;
  dependencies?: string[];
  fallbackComponent?: () => Promise<React.ComponentType<any>>;
  testMode?: boolean;
}
```

**Safety Features:**
- Import timeout protection (5 seconds)
- Dependency validation before loading
- Automatic fallback component loading
- Graceful degradation on failures

## Health Monitoring System

### Service Status Levels
- **Healthy**: All services operational, full AI capabilities
- **Degraded**: Some services down, fallback components active
- **Failed**: Critical services unavailable, basic functionality only

### Monitoring Components
```typescript
// Real-time health checking
async performHealthCheck(): Promise<{
  overall: 'healthy' | 'degraded' | 'failed';
  features: Record<string, 'loaded' | 'fallback' | 'failed'>;
  services: Record<string, 'healthy' | 'degraded' | 'failed'>;
  recommendations: string[];
}>
```

### Health Indicators in UI
- ✅ Service healthy and operational
- ⚠️ Service degraded, using fallbacks
- ❌ Service failed, functionality limited

## Error Handling Strategy

### 1. Import Safety
All AI components use protected imports with timeouts:
```typescript
const module = await Promise.race([
  import('@anthropic-ai/sdk'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Import timeout')), 10000)
  )
]);
```

### 2. Graceful Degradation
Failed features automatically load fallback components maintaining UI consistency.

### 3. Service Recovery
- Automatic retry with exponential backoff
- Health monitoring with periodic checks
- Manual reset capabilities for stuck services

## Integration Points

### Main Application (`/src/main.tsx`)
- AI Features page at route `/ai-features`
- Real-time service status display
- Feature testing and validation UI

### Project Components
- SafeClaudeService integration in project creation
- Task generation via MCP service
- Timeline optimization through AI analysis

### Development Tools
- Health check endpoints for monitoring
- Service configuration management
- Feature flag controls for testing

## Performance Considerations

### Lazy Loading Benefits
- Reduced initial bundle size
- Faster app startup time
- Progressive enhancement approach

### Memory Management
- Services initialized only when needed
- Automatic cleanup on component unmount
- Health check intervals configured for minimal overhead

### Network Optimization
- Request timeouts prevent hanging
- Retry logic with backoff prevents spam
- Connection pooling through fetch API

## Security Measures

### API Key Protection
```typescript
// Environment variable validation
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
if (!apiKey?.startsWith('sk-')) {
  throw new Error('Invalid or missing Anthropic API key');
}
```

### Browser Safety
- Anthropic SDK configured for browser use
- CORS handling for MCP bridge communication
- Input validation for all AI requests

### Error Information Sanitization
- Sensitive data filtered from error messages
- Safe error reporting to user interface
- Debug information available in development mode

## Testing Strategy

### Unit Testing
- Service initialization testing
- Error handling validation
- Mock responses for AI calls

### Integration Testing
- MCP bridge connectivity
- Claude API communication
- Health monitoring accuracy

### User Testing
- Feature loading in different network conditions
- Fallback component validation
- Service recovery testing

## Deployment Considerations

### Environment Variables Required
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-...  # Claude API access
```

### External Dependencies
- MCP Bridge Server must be running on `localhost:3001`
- Anthropic SDK compatibility with browser environment
- Network access to Claude API endpoints

### Production Optimizations
- Bundle splitting for AI components
- CDN delivery for fallback components
- Service worker caching for improved reliability

## Troubleshooting

### Common Issues
1. **Blank Page**: Usually caused by import failures - check browser console
2. **API Errors**: Verify API key and network connectivity
3. **MCP Bridge Down**: Ensure bridge server is running on port 3001

### Debug Tools
- Browser DevTools for import errors
- Network tab for API call inspection
- AI Features page for comprehensive health status

### Recovery Procedures
1. Check service status on AI Features page
2. Use manual reset buttons if services are stuck
3. Verify environment variables and external services
4. Restart MCP bridge server if needed

## Future Enhancements

### Planned Features
- Voice Assistant integration
- Advanced project analytics via AI
- Custom MCP tool development
- Enhanced error recovery automation

### Architecture Evolution
- Microservice separation for AI components
- Enhanced caching strategies
- Real-time collaboration features
- Advanced health monitoring dashboards