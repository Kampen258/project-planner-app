import { speechToTextService, type SpeechRecognitionResult } from './speech-to-text-service';
import { modernClaudeService } from './modern-claude-service';
import { TaskService } from './taskService';
import { ProjectService } from './projectService';
import type { Project, Task } from '../types';

export interface VoiceTaskCreationConfig {
  enableAutoSave: boolean;
  confirmBeforeSaving: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
  sessionTimeout: number; // milliseconds
  enableWakeWord: boolean;
  wakeWords: string[];
}

export interface VoiceSession {
  id: string;
  projectContext?: {
    projectId: string;
    projectName: string;
  };
  startTime: number;
  lastActivity: number;
  isActive: boolean;
  pendingTasks: PendingTask[];
}

export interface PendingTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  projectId?: string;
  confidence: number;
  rawSpeechText: string;
  timestamp: number;
  needsConfirmation: boolean;
}

export interface TaskCreationCallbacks {
  onPendingTask: (task: PendingTask) => void;
  onTaskCreated: (task: Task) => void;
  onConfirmationNeeded: (task: PendingTask) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'listening' | 'processing' | 'idle') => void;
}

export class AutomatedTaskCreationService {
  private config: VoiceTaskCreationConfig;
  private currentSession: VoiceSession | null = null;
  private callbacks: Partial<TaskCreationCallbacks> = {};
  private status: 'listening' | 'processing' | 'idle' = 'idle';
  private isInitialized: boolean = false;

  constructor(config: Partial<VoiceTaskCreationConfig> = {}) {
    this.config = {
      enableAutoSave: false,
      confirmBeforeSaving: true,
      defaultPriority: 'medium',
      sessionTimeout: 300000, // 5 minutes
      enableWakeWord: true,
      wakeWords: ['hey planner', 'create task', 'add task', 'new task'],
      ...config,
    };
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Setup speech recognition callbacks
      speechToTextService.setCallbacks({
        onResult: this.handleSpeechResult.bind(this),
        onError: this.handleSpeechError.bind(this),
        onStart: this.handleSpeechStart.bind(this),
        onEnd: this.handleSpeechEnd.bind(this),
      });

      // Configure speech recognition for task creation
      speechToTextService.updateConfig({
        language: 'en-US',
        continuous: true,
        interimResults: true,
        maxAlternatives: 3,
        grammars: speechToTextService.createTaskGrammar(),
      });

      this.isInitialized = true;

      if (process.env.NODE_ENV === 'development') {
        console.log('AutomatedTaskCreationService initialized');
      }
    } catch (error) {
      throw new Error(`Failed to initialize automated task creation: ${error}`);
    }
  }

  /**
   * Start voice-activated task creation
   */
  async startVoiceTaskCreation(projectContext?: {
    projectId: string;
    projectName: string;
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.currentSession = {
      id: `session_${Date.now()}`,
      projectContext,
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      pendingTasks: [],
    };

    await speechToTextService.startListening();
    this.updateStatus('listening');

    if (process.env.NODE_ENV === 'development') {
      console.log('Voice task creation started', { projectContext });
    }
  }

  /**
   * Stop voice-activated task creation
   */
  stopVoiceTaskCreation(): void {
    if (this.currentSession?.isActive) {
      this.currentSession.isActive = false;
    }

    speechToTextService.stopListening();
    this.updateStatus('idle');

    if (process.env.NODE_ENV === 'development') {
      console.log('Voice task creation stopped');
    }
  }

  /**
   * Process pending task and create it
   */
  async confirmAndCreateTask(pendingTaskId: string): Promise<Task | null> {
    const pendingTask = this.findPendingTask(pendingTaskId);
    if (!pendingTask) {
      this.callbacks.onError?.('Pending task not found');
      return null;
    }

    try {
      this.updateStatus('processing');

      // Create the task
      const taskData = {
        title: pendingTask.title,
        description: pendingTask.description || '',
        priority: pendingTask.priority,
        status: 'todo' as const,
        project_id: pendingTask.projectId,
        user_id: 'current-user', // This should come from auth context
      };

      const createdTask = await TaskService.createTask(taskData);

      // Remove from pending tasks
      if (this.currentSession) {
        this.currentSession.pendingTasks = this.currentSession.pendingTasks.filter(
          task => task.id !== pendingTaskId
        );
      }

      this.callbacks.onTaskCreated?.(createdTask);
      this.updateStatus('idle');

      return createdTask;
    } catch (error) {
      this.callbacks.onError?.(`Failed to create task: ${error}`);
      this.updateStatus('idle');
      return null;
    }
  }

  /**
   * Reject a pending task
   */
  rejectPendingTask(pendingTaskId: string): void {
    if (this.currentSession) {
      this.currentSession.pendingTasks = this.currentSession.pendingTasks.filter(
        task => task.id !== pendingTaskId
      );
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): {
    isActive: boolean;
    pendingTasksCount: number;
    sessionDuration?: number;
    projectContext?: { projectId: string; projectName: string };
  } {
    if (!this.currentSession) {
      return { isActive: false, pendingTasksCount: 0 };
    }

    return {
      isActive: this.currentSession.isActive,
      pendingTasksCount: this.currentSession.pendingTasks.length,
      sessionDuration: Date.now() - this.currentSession.startTime,
      projectContext: this.currentSession.projectContext,
    };
  }

  /**
   * Set callbacks for various events
   */
  setCallbacks(callbacks: Partial<TaskCreationCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VoiceTaskCreationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): PendingTask[] {
    return this.currentSession?.pendingTasks || [];
  }

  /**
   * Clear all pending tasks
   */
  clearPendingTasks(): void {
    if (this.currentSession) {
      this.currentSession.pendingTasks = [];
    }
  }

  // Private methods

  private async handleSpeechResult(result: SpeechRecognitionResult): Promise<void> {
    if (!this.currentSession?.isActive || !result.isFinal) {
      return;
    }

    this.updateLastActivity();

    const speechText = result.text.trim();
    if (speechText.length < 3) return;

    // Check for wake words if enabled
    if (this.config.enableWakeWord && !this.containsWakeWord(speechText)) {
      return;
    }

    // Check if it's a task creation command
    if (speechToTextService.isTaskCommand(speechText)) {
      await this.processTaskCreationCommand(speechText, result.confidence);
    } else if (speechToTextService.isProjectCommand(speechText)) {
      await this.processProjectCreationCommand(speechText, result.confidence);
    }
  }

  private async processTaskCreationCommand(speechText: string, confidence: number): Promise<void> {
    try {
      this.updateStatus('processing');

      // Use Claude to process the voice input
      const processedInput = await modernClaudeService.processVoiceInput(
        speechText,
        this.currentSession?.projectContext
      );

      if (processedInput.intent === 'create_task' && processedInput.data) {
        const pendingTask: PendingTask = {
          id: `pending_${Date.now()}`,
          title: processedInput.data.title || 'Untitled Task',
          description: processedInput.data.description,
          priority: processedInput.data.priority || this.config.defaultPriority,
          projectId: processedInput.data.project_id || this.currentSession?.projectContext?.projectId,
          confidence,
          rawSpeechText: speechText,
          timestamp: Date.now(),
          needsConfirmation: this.config.confirmBeforeSaving || confidence < 0.8,
        };

        this.addPendingTask(pendingTask);

        if (pendingTask.needsConfirmation) {
          this.callbacks.onConfirmationNeeded?.(pendingTask);
        } else if (this.config.enableAutoSave) {
          await this.confirmAndCreateTask(pendingTask.id);
        } else {
          this.callbacks.onPendingTask?.(pendingTask);
        }
      } else if (processedInput.clarification) {
        // Handle clarification needed
        this.callbacks.onError?.(processedInput.clarification);
      }

    } catch (error) {
      this.callbacks.onError?.(`Failed to process speech: ${error}`);
    } finally {
      this.updateStatus('listening');
    }
  }

  private async processProjectCreationCommand(speechText: string, confidence: number): Promise<void> {
    try {
      this.updateStatus('processing');

      const processedInput = await modernClaudeService.processVoiceInput(speechText);

      if (processedInput.intent === 'create_project' && processedInput.data) {
        // For now, just create a pending task to create the project
        const pendingTask: PendingTask = {
          id: `pending_project_${Date.now()}`,
          title: `Create Project: ${processedInput.data.title || 'New Project'}`,
          description: `Create a new project${processedInput.data.description ? `: ${processedInput.data.description}` : ''}`,
          priority: 'high',
          confidence,
          rawSpeechText: speechText,
          timestamp: Date.now(),
          needsConfirmation: true,
        };

        this.addPendingTask(pendingTask);
        this.callbacks.onConfirmationNeeded?.(pendingTask);
      }

    } catch (error) {
      this.callbacks.onError?.(`Failed to process project command: ${error}`);
    } finally {
      this.updateStatus('listening');
    }
  }

  private handleSpeechError(error: SpeechRecognitionErrorEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('Speech recognition error:', error.error);
    }

    if (error.error === 'no-speech') {
      // Continue listening silently
      return;
    }

    this.callbacks.onError?.(`Speech recognition error: ${error.error}`);
  }

  private handleSpeechStart(): void {
    this.updateStatus('listening');
  }

  private handleSpeechEnd(): void {
    // Check if session should continue
    if (this.currentSession?.isActive && this.shouldContinueSession()) {
      // Restart listening after a short delay
      setTimeout(() => {
        if (this.currentSession?.isActive) {
          speechToTextService.startListening().catch(error => {
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to restart listening:', error);
            }
          });
        }
      }, 500);
    } else {
      this.updateStatus('idle');
    }
  }

  private containsWakeWord(text: string): boolean {
    if (!this.config.enableWakeWord) return true;

    const lowerText = text.toLowerCase();
    return this.config.wakeWords.some(wakeWord =>
      lowerText.includes(wakeWord.toLowerCase())
    );
  }

  private addPendingTask(task: PendingTask): void {
    if (this.currentSession) {
      this.currentSession.pendingTasks.push(task);
    }
  }

  private findPendingTask(taskId: string): PendingTask | undefined {
    return this.currentSession?.pendingTasks.find(task => task.id === taskId);
  }

  private updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
    }
  }

  private shouldContinueSession(): boolean {
    if (!this.currentSession) return false;

    const timeSinceActivity = Date.now() - this.currentSession.lastActivity;
    return timeSinceActivity < this.config.sessionTimeout;
  }

  private updateStatus(status: 'listening' | 'processing' | 'idle'): void {
    if (this.status !== status) {
      this.status = status;
      this.callbacks.onStatusChange?.(status);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopVoiceTaskCreation();
    speechToTextService.destroy();
    this.callbacks = {};
    this.currentSession = null;
    this.isInitialized = false;
  }
}

// Singleton instance
export const automatedTaskCreationService = new AutomatedTaskCreationService();