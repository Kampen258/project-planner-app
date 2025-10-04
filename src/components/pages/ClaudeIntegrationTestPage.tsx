import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../layout/Navigation-enhanced';
import { EnhancedVoiceAssistant } from '../EnhancedVoiceAssistant';
import { EnhancedClaudeIntegration } from '../EnhancedClaudeIntegration';
import { modernClaudeService } from '../../services/modern-claude-service';
import { speechToTextService } from '../../services/speech-to-text-service';
import { automatedTaskCreationService } from '../../services/automated-task-creation-service';
import type { Project, Task } from '../../types';
import type { MCPTask } from '../../mcpClient';

export function ClaudeIntegrationTestPage() {
  const [testResults, setTestResults] = useState<{
    speechRecognition: 'pending' | 'pass' | 'fail';
    claudeService: 'pending' | 'pass' | 'fail';
    taskCreation: 'pending' | 'pass' | 'fail';
    integration: 'pending' | 'pass' | 'fail';
  }>({
    speechRecognition: 'pending',
    claudeService: 'pending',
    taskCreation: 'pending',
    integration: 'pending',
  });

  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [generatedMCPTasks, setGeneratedMCPTasks] = useState<MCPTask[]>([]);

  // Mock project for testing
  const mockProject: Project = {
    id: 'test-project-1',
    user_id: 'test-user',
    title: 'Claude Integration Test Project',
    description: 'A comprehensive test project for testing Claude AI integration with speech-to-text capabilities',
    status: 'in_progress',
    progress: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ai_generated: true,
  };

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Claude Integration Test] ${message}`);
    }
  }, []);

  const runComprehensiveTests = async () => {
    setIsTestingInProgress(true);
    setTestLogs([]);
    addLog('Starting comprehensive Claude AI integration tests...');

    // Reset test results
    setTestResults({
      speechRecognition: 'pending',
      claudeService: 'pending',
      taskCreation: 'pending',
      integration: 'pending',
    });

    try {
      // Test 1: Speech Recognition
      addLog('Testing speech recognition support...');
      const speechStatus = speechToTextService.getStatus();

      if (speechStatus.isSupported) {
        addLog('✓ Speech recognition is supported');
        setTestResults(prev => ({ ...prev, speechRecognition: 'pass' }));
      } else {
        addLog('✗ Speech recognition not supported in this browser');
        setTestResults(prev => ({ ...prev, speechRecognition: 'fail' }));
      }

      // Test 2: Claude Service
      addLog('Testing Claude AI service...');
      try {
        const testTaskGeneration = await modernClaudeService.generateTasks({
          name: 'Test Project',
          description: 'A simple test project to verify Claude integration',
        });

        if (testTaskGeneration.tasks.length > 0) {
          addLog(`✓ Claude generated ${testTaskGeneration.tasks.length} test tasks`);
          setTestResults(prev => ({ ...prev, claudeService: 'pass' }));
        } else {
          addLog('✗ Claude did not generate any tasks');
          setTestResults(prev => ({ ...prev, claudeService: 'fail' }));
        }
      } catch (error) {
        addLog(`✗ Claude service error: ${error}`);
        setTestResults(prev => ({ ...prev, claudeService: 'fail' }));
      }

      // Test 3: Task Creation Service
      addLog('Testing automated task creation service...');
      try {
        await automatedTaskCreationService.initialize();
        addLog('✓ Task creation service initialized successfully');

        const sessionStatus = automatedTaskCreationService.getSessionStatus();
        addLog(`Task creation service status: ${sessionStatus.isActive ? 'Ready' : 'Inactive'}`);

        setTestResults(prev => ({ ...prev, taskCreation: 'pass' }));
      } catch (error) {
        addLog(`✗ Task creation service error: ${error}`);
        setTestResults(prev => ({ ...prev, taskCreation: 'fail' }));
      }

      // Test 4: Integration Test
      addLog('Testing voice input processing...');
      try {
        const testVoiceInput = 'Create a high priority task to implement user authentication';
        const processedInput = await modernClaudeService.processVoiceInput(
          testVoiceInput,
          { projectId: mockProject.id, projectName: mockProject.title }
        );

        if (processedInput.intent === 'create_task' && processedInput.data) {
          addLog('✓ Voice input processing successful');
          addLog(`Extracted task: "${processedInput.data.title}" (Priority: ${processedInput.data.priority})`);
          setTestResults(prev => ({ ...prev, integration: 'pass' }));
        } else {
          addLog('✗ Voice input processing failed or returned unexpected result');
          setTestResults(prev => ({ ...prev, integration: 'fail' }));
        }
      } catch (error) {
        addLog(`✗ Integration test error: ${error}`);
        setTestResults(prev => ({ ...prev, integration: 'fail' }));
      }

      addLog('Comprehensive testing completed!');

    } catch (error) {
      addLog(`Fatal test error: ${error}`);
    } finally {
      setIsTestingInProgress(false);
    }
  };

  const handleTaskCreated = (task: Task) => {
    setCreatedTasks(prev => [...prev, task]);
    addLog(`New task created: "${task.title}"`);
  };

  const handleMCPTasksGenerated = (tasks: MCPTask[]) => {
    setGeneratedMCPTasks(tasks);
    addLog(`Claude generated ${tasks.length} MCP tasks`);
  };

  const handleError = (error: string) => {
    addLog(`Error: ${error}`);
  };

  const clearLogs = () => {
    setTestLogs([]);
  };

  const getTestStatusIcon = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'pending': return '⏳';
    }
  };

  const getTestStatusColor = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass': return 'text-green-300';
      case 'fail': return 'text-red-300';
      case 'pending': return 'text-yellow-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧪 Claude AI Integration Test Lab
          </h1>
          <p className="text-white/80 text-lg">
            Comprehensive testing suite for Claude 3.5 Sonnet integration and speech-to-text functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🎛️ Test Controls</h2>

              {/* Run Tests Button */}
              <button
                onClick={runComprehensiveTests}
                disabled={isTestingInProgress}
                className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30
                           text-white px-6 py-3 rounded-lg transition-all duration-300 border border-green-400/30
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-4"
              >
                {isTestingInProgress ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span>Running Tests...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10v20m0-20L8 7m4-3l4 3" />
                    </svg>
                    <span>Run All Tests</span>
                  </>
                )}
              </button>

              {/* Test Results */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Test Results:</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span className="text-white/80">Speech Recognition</span>
                    <span className={`${getTestStatusColor(testResults.speechRecognition)}`}>
                      {getTestStatusIcon(testResults.speechRecognition)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span className="text-white/80">Claude Service</span>
                    <span className={`${getTestStatusColor(testResults.claudeService)}`}>
                      {getTestStatusIcon(testResults.claudeService)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span className="text-white/80">Task Creation</span>
                    <span className={`${getTestStatusColor(testResults.taskCreation)}`}>
                      {getTestStatusIcon(testResults.taskCreation)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <span className="text-white/80">Integration</span>
                    <span className={`${getTestStatusColor(testResults.integration)}`}>
                      {getTestStatusIcon(testResults.integration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Created Tasks:</span>
                  <span className="text-white">{createdTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Generated MCP Tasks:</span>
                  <span className="text-white">{generatedMCPTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Log Entries:</span>
                  <span className="text-white">{testLogs.length}</span>
                </div>
              </div>

              {/* Clear Logs Button */}
              {testLogs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg
                             transition-all duration-300 border border-white/20 text-sm"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {/* Test Logs */}
            {testLogs.length > 0 && (
              <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📝 Test Logs</h3>
                <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-1">
                    {testLogs.map((log, index) => (
                      <div key={index} className="text-xs text-white/80 font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Testing Components */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Voice Assistant */}
            <EnhancedVoiceAssistant
              currentProject={mockProject}
              onTaskCreated={handleTaskCreated}
              onError={handleError}
            />

            {/* Enhanced Claude Integration */}
            <EnhancedClaudeIntegration
              project={{
                id: mockProject.id,
                name: mockProject.title,
                description: mockProject.description,
              } as any}
              onTasksGenerated={handleMCPTasksGenerated}
              onTaskCreated={handleTaskCreated}
              onError={handleError}
            />

            {/* Created Tasks Display */}
            {createdTasks.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  ✅ Successfully Created Tasks ({createdTasks.length})
                </h3>
                <div className="space-y-3">
                  {createdTasks.map((task, index) => (
                    <div key={task.id || index} className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-white/70 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-500/20 text-red-300'
                            : task.priority === 'low'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-white/50 text-xs">
                          Status: {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}