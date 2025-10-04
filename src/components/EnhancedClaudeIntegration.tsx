import { useState, useCallback, useRef } from 'react';
import { mcpClient } from '../mcpClient';
import { modernClaudeService } from '../services/modern-claude-service';
import { EnhancedVoiceAssistant } from './EnhancedVoiceAssistant';
import type { MCPTask, Project } from '../mcpClient';
import type { Task } from '../types';

interface EnhancedClaudeIntegrationProps {
  project: Project;
  onTasksGenerated: (tasks: MCPTask[]) => void;
  onTaskCreated?: (task: Task) => void;
  onError?: (error: string) => void;
}

export function EnhancedClaudeIntegration({
  project,
  onTasksGenerated,
  onTaskCreated,
  onError
}: EnhancedClaudeIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClaudePanel, setShowClaudePanel] = useState(false);
  const [context, setContext] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<MCPTask[]>([]);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [analysisResults, setAnalysisResults] = useState<{
    insights: string[];
    recommendations: string[];
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
    };
  } | null>(null);
  const [useModernClaude, setUseModernClaude] = useState(true);
  const [sessionId] = useState(`session_${Date.now()}`);
  const streamingRef = useRef<HTMLDivElement>(null);

  const handleGenerateTasks = useCallback(async () => {
    if (useModernClaude) {
      await handleModernClaudeGeneration();
    } else {
      await handleMCPGeneration();
    }
  }, [useModernClaude, project, context]);

  const handleModernClaudeGeneration = async () => {
    try {
      setIsGenerating(true);
      setStreamingResponse('');

      const projectContext = {
        name: project.name,
        description: project.description,
        additionalContext: context,
      };

      const result = await modernClaudeService.generateTasks(projectContext, sessionId);

      // Convert modern Claude tasks to MCP format for compatibility
      const mcpTasks: MCPTask[] = result.tasks.map((task, index) => ({
        id: `claude_task_${Date.now()}_${index}`,
        name: task.title,
        description: task.description,
        priority: task.priority,
        estimated_effort: task.estimated_effort,
        category: task.category,
        project_id: project.id,
        ai_suggested: true,
        order_index: index,
      }));

      setGeneratedTasks(mcpTasks);
      onTasksGenerated(mcpTasks);

      // Show success notification
      showNotification(
        `✨ Claude 3.5 Sonnet generated ${mcpTasks.length} task suggestions!`,
        'success'
      );

    } catch (error) {
      handleError(`Failed to generate tasks with Claude: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStreamingGeneration = async () => {
    try {
      setIsGenerating(true);
      setStreamingResponse('');

      const projectContext = {
        name: project.name,
        description: project.description,
        additionalContext: context,
      };

      let fullResponse = '';

      const response = await modernClaudeService.generateTasksWithStreaming(
        projectContext,
        (chunk: string) => {
          fullResponse += chunk;
          setStreamingResponse(fullResponse);

          // Auto-scroll to bottom
          if (streamingRef.current) {
            streamingRef.current.scrollTop = streamingRef.current.scrollHeight;
          }
        },
        sessionId
      );

      // Parse the complete response into tasks
      const parsedTasks = parseStreamingResponseToTasks(response);
      const mcpTasks: MCPTask[] = parsedTasks.map((task, index) => ({
        id: `claude_stream_${Date.now()}_${index}`,
        name: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        estimated_effort: task.estimated_effort || '2-4 hours',
        project_id: project.id,
        ai_suggested: true,
        order_index: index,
      }));

      setGeneratedTasks(mcpTasks);
      onTasksGenerated(mcpTasks);

    } catch (error) {
      handleError(`Failed to stream tasks: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMCPGeneration = async () => {
    if (!mcpClient.isClientConnected()) {
      handleError('Claude MCP is not connected. Please check your connection.');
      return;
    }

    try {
      setIsGenerating(true);

      const suggestions = await mcpClient.generateTaskSuggestions(
        project.id,
        context || `Project: ${project.name}. Description: ${project.description}`
      );

      setGeneratedTasks(suggestions);
      onTasksGenerated(suggestions);

      showNotification(
        `✨ Claude MCP generated ${suggestions.length} task suggestions!`,
        'success'
      );

    } catch (error) {
      handleError(`Failed to generate tasks: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeProject = async () => {
    try {
      setIsGenerating(true);

      // Mock tasks for analysis (in real app, get from project)
      const mockTasks: Task[] = [
        {
          id: '1',
          project_id: project.id,
          user_id: 'user',
          title: 'Setup Project',
          status: 'done',
          priority: 'high',
          ai_suggested: false,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const projectData = {
        id: project.id,
        title: project.name,
        description: project.description,
        status: 'in_progress' as const,
        progress: 50,
        user_id: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_generated: false,
      };

      const analysis = await modernClaudeService.analyzeProject(projectData, mockTasks);
      setAnalysisResults(analysis);

      showNotification('📊 Project analysis completed!', 'success');

    } catch (error) {
      handleError(`Failed to analyze project: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleError = (error: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    onError?.(error);
    showNotification(error, 'error');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500/20 border-green-400/30 text-green-100' : 'bg-red-500/20 border-red-400/30 text-red-100';

    notification.innerHTML = `
      <div class="fixed top-4 right-4 ${bgColor} backdrop-blur-sm border px-4 py-2 rounded-lg z-50 animate-fade-in">
        ${message}
      </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  const parseStreamingResponseToTasks = (response: string): Array<{
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    estimated_effort?: string;
  }> => {
    // Simple parsing - in production, this would be more sophisticated
    const tasks = [];
    const lines = response.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^\d+\./)) {
        const title = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
        const description = lines[i + 1]?.trim() || '';

        tasks.push({
          title,
          description,
          priority: 'medium' as const,
          estimated_effort: '2-4 hours',
        });
      }
    }

    return tasks.length > 0 ? tasks : [{
      title: 'Generated Task',
      description: response.slice(0, 200) + (response.length > 200 ? '...' : ''),
      priority: 'medium' as const,
      estimated_effort: '2-4 hours',
    }];
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Voice Assistant */}
      <EnhancedVoiceAssistant
        currentProject={{
          id: project.id,
          title: project.name,
          description: project.description,
        } as any}
        onTaskCreated={onTaskCreated}
        onError={onError}
      />

      {/* Claude Integration Panel */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Enhanced Claude Integration
          </h3>

          <div className="flex items-center space-x-2">
            <label className="flex items-center text-white/80 text-sm">
              <input
                type="checkbox"
                checked={useModernClaude}
                onChange={(e) => setUseModernClaude(e.target.checked)}
                className="mr-2"
              />
              Use Claude 3.5 Sonnet
            </label>
          </div>
        </div>

        {/* Context Input */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/30
                       focus:border-transparent resize-none"
            placeholder="Tell Claude more about your project needs... (e.g., 'Focus on backend development tasks' or 'Include testing and deployment steps')"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleGenerateTasks}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg
                       hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Tasks</span>
              </>
            )}
          </button>

          {useModernClaude && (
            <button
              onClick={handleStreamingGeneration}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg
                         hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300 border border-green-400/30
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2M7 4H5a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h6M9 6h2m-2 4h6m-6 4h6m-6 4h4" />
              </svg>
              <span>Stream Tasks</span>
            </button>
          )}

          {useModernClaude && (
            <button
              onClick={handleAnalyzeProject}
              disabled={isGenerating}
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg
                         hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 border border-orange-400/30
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analyze Project</span>
            </button>
          )}
        </div>

        {/* Streaming Response Display */}
        {streamingResponse && (
          <div className="mb-6">
            <h4 className="text-white/80 text-sm font-medium mb-2">Live Generation:</h4>
            <div
              ref={streamingRef}
              className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto"
            >
              <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono">
                {streamingResponse}
              </pre>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults && (
          <div className="mb-6 space-y-4">
            <h4 className="text-white text-lg font-semibold">📊 Project Analysis</h4>

            {/* Risk Assessment */}
            <div className="bg-black/20 rounded-lg p-4">
              <h5 className="text-white/90 font-medium mb-2">Risk Assessment</h5>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisResults.riskAssessment.level === 'high'
                    ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                    : analysisResults.riskAssessment.level === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                    : 'bg-green-500/20 text-green-300 border border-green-400/30'
                }`}>
                  {analysisResults.riskAssessment.level.toUpperCase()} RISK
                </span>
              </div>
              <ul className="text-white/70 text-sm space-y-1">
                {analysisResults.riskAssessment.factors.map((factor, index) => (
                  <li key={index}>• {factor}</li>
                ))}
              </ul>
            </div>

            {/* Insights */}
            <div className="bg-black/20 rounded-lg p-4">
              <h5 className="text-white/90 font-medium mb-2">💡 Key Insights</h5>
              <ul className="text-white/70 text-sm space-y-1">
                {analysisResults.insights.map((insight, index) => (
                  <li key={index}>• {insight}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-black/20 rounded-lg p-4">
              <h5 className="text-white/90 font-medium mb-2">🎯 Recommendations</h5>
              <ul className="text-white/70 text-sm space-y-1">
                {analysisResults.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Generated Tasks Display */}
        {generatedTasks.length > 0 && (
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">
              ✨ Generated Tasks ({generatedTasks.length})
            </h4>
            <div className="space-y-3">
              {generatedTasks.map((task) => (
                <div key={task.id} className="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{task.name}</h5>
                      {task.description && (
                        <p className="text-white/70 text-sm mt-1">{task.description}</p>
                      )}
                      {task.estimated_effort && (
                        <p className="text-white/50 text-xs mt-2">
                          Estimated effort: {task.estimated_effort}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-500/20 text-red-300'
                          : task.priority === 'low'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {task.priority}
                      </span>
                      {task.category && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}