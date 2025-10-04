import React, { useState, useEffect, useCallback } from 'react';
import {
  automatedTaskCreationService,
  type PendingTask,
  type VoiceSession
} from '../services/automated-task-creation-service';
import { speechToTextService } from '../services/speech-to-text-service';
import { modernClaudeService } from '../services/modern-claude-service';
import type { Task, Project } from '../types';

interface EnhancedVoiceAssistantProps {
  currentProject?: Project;
  onTaskCreated?: (task: Task) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function EnhancedVoiceAssistant({
  currentProject,
  onTaskCreated,
  onError,
  className = ''
}: EnhancedVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'listening' | 'processing' | 'idle'>('idle');
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [sessionStatus, setSessionStatus] = useState<{
    isActive: boolean;
    pendingTasksCount: number;
    sessionDuration?: number;
    projectContext?: { projectId: string; projectName: string };
  }>({ isActive: false, pendingTasksCount: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [transcription, setTranscription] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(0);

  // Initialize voice assistant
  useEffect(() => {
    const initializeVoiceAssistant = async () => {
      try {
        await automatedTaskCreationService.initialize();

        // Set up callbacks
        automatedTaskCreationService.setCallbacks({
          onPendingTask: (task: PendingTask) => {
            setPendingTasks(prev => [...prev, task]);
          },
          onTaskCreated: (task: Task) => {
            onTaskCreated?.(task);
            setPendingTasks(prev => prev.filter(t => t.id !== task.id));
          },
          onConfirmationNeeded: (task: PendingTask) => {
            setPendingTasks(prev => [...prev, task]);
          },
          onError: (error: string) => {
            onError?.(error);
          },
          onStatusChange: (newStatus: 'listening' | 'processing' | 'idle') => {
            setStatus(newStatus);
            setIsListening(newStatus === 'listening');
          },
        });

        // Set up speech-to-text callbacks for real-time feedback
        speechToTextService.setCallbacks({
          onResult: (result) => {
            if (result.isFinal) {
              setTranscription(result.text);
              setConfidenceLevel(result.confidence);
            }
          },
          onError: (error) => {
            onError?.(`Speech recognition error: ${error.error}`);
          },
        });

        // Check if speech recognition is supported
        const speechStatus = speechToTextService.getStatus();
        setIsSupported(speechStatus.isSupported);

      } catch (error) {
        setIsSupported(false);
        onError?.(`Failed to initialize voice assistant: ${error}`);
      }
    };

    initializeVoiceAssistant();

    // Update session status periodically
    const statusInterval = setInterval(() => {
      const currentSessionStatus = automatedTaskCreationService.getSessionStatus();
      setSessionStatus(currentSessionStatus);
      setPendingTasks(automatedTaskCreationService.getPendingTasks());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      automatedTaskCreationService.destroy();
    };
  }, [onTaskCreated, onError]);

  const startVoiceTaskCreation = useCallback(async () => {
    try {
      const projectContext = currentProject ? {
        projectId: currentProject.id,
        projectName: currentProject.title,
      } : undefined;

      await automatedTaskCreationService.startVoiceTaskCreation(projectContext);
      setTranscription('');
      setConfidenceLevel(0);
    } catch (error) {
      onError?.(`Failed to start voice task creation: ${error}`);
    }
  }, [currentProject, onError]);

  const stopVoiceTaskCreation = useCallback(() => {
    automatedTaskCreationService.stopVoiceTaskCreation();
    setTranscription('');
  }, []);

  const confirmPendingTask = useCallback(async (taskId: string) => {
    try {
      await automatedTaskCreationService.confirmAndCreateTask(taskId);
    } catch (error) {
      onError?.(`Failed to confirm task: ${error}`);
    }
  }, [onError]);

  const rejectPendingTask = useCallback((taskId: string) => {
    automatedTaskCreationService.rejectPendingTask(taskId);
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const clearAllPendingTasks = useCallback(() => {
    automatedTaskCreationService.clearPendingTasks();
    setPendingTasks([]);
  }, []);

  if (!isSupported) {
    return (
      <div className={`bg-red-500/20 border border-red-400/30 rounded-lg p-4 ${className}`}>
        <p className="text-red-200 text-sm">
          🎤 Voice recognition is not supported in your browser.
          Please use Chrome, Edge, or Safari for voice features.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Control Panel */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            🎤 Voice Task Creator
            {currentProject && (
              <span className="ml-2 text-sm text-white/70">
                for {currentProject.title}
              </span>
            )}
          </h3>

          <div className="flex items-center space-x-2">
            {status === 'listening' && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-300 text-sm">Listening...</span>
              </div>
            )}
            {status === 'processing' && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-blue-300 text-sm">Processing...</span>
              </div>
            )}
            {status === 'idle' && (
              <span className="text-white/50 text-sm">Ready</span>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3 mb-4">
          {!sessionStatus.isActive ? (
            <button
              onClick={startVoiceTaskCreation}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30
                         text-white px-6 py-3 rounded-lg transition-all duration-300 border border-green-400/30
                         flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Start Voice Tasks</span>
            </button>
          ) : (
            <button
              onClick={stopVoiceTaskCreation}
              className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30
                         text-white px-6 py-3 rounded-lg transition-all duration-300 border border-red-400/30
                         flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>Stop Listening</span>
            </button>
          )}

          {pendingTasks.length > 0 && (
            <button
              onClick={clearAllPendingTasks}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg
                         transition-all duration-300 border border-white/20"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Session Status */}
        {sessionStatus.isActive && (
          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">
                Session Duration: {Math.round((sessionStatus.sessionDuration || 0) / 1000)}s
              </span>
              <span className="text-white/70">
                Pending Tasks: {sessionStatus.pendingTasksCount}
              </span>
            </div>
            {sessionStatus.projectContext && (
              <div className="text-xs text-white/50 mt-1">
                Project: {sessionStatus.projectContext.projectName}
              </div>
            )}
          </div>
        )}

        {/* Real-time Transcription */}
        {transcription && (
          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Latest Voice Input:</span>
              <span className="text-white/50 text-xs">
                Confidence: {Math.round(confidenceLevel * 100)}%
              </span>
            </div>
            <p className="text-white text-sm italic">"{transcription}"</p>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="bg-black/20 rounded-lg p-3">
          <h4 className="text-white/80 text-sm font-medium mb-2">Voice Commands:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/60">
            <div>• "Create task [task name]"</div>
            <div>• "Add high priority task [name]"</div>
            <div>• "New task due tomorrow [name]"</div>
            <div>• "Make urgent task [name]"</div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📝 Pending Tasks ({pendingTasks.length})
          </h3>

          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="bg-black/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-white/70 text-sm mt-1">{task.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        : 'bg-green-500/20 text-green-300 border border-green-400/30'
                    }`}>
                      {task.priority}
                    </span>

                    <span className="text-xs text-white/50">
                      {Math.round(task.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">
                    "{task.rawSpeechText}"
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => confirmPendingTask(task.id)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300
                                 px-3 py-1 rounded text-xs border border-green-400/30
                                 transition-all duration-200"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={() => rejectPendingTask(task.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300
                                 px-3 py-1 rounded text-xs border border-red-400/30
                                 transition-all duration-200"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>

                {task.needsConfirmation && (
                  <div className="mt-2 bg-yellow-500/10 border border-yellow-400/20 rounded p-2">
                    <p className="text-yellow-200 text-xs">
                      ⚠️ This task needs confirmation before being created.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}