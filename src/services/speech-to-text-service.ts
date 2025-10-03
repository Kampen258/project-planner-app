// Enhanced Speech-to-Text Service with 2025 best practices
export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: SpeechGrammarList;
}

export interface SpeechRecognitionCallbacks {
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: SpeechRecognitionErrorEvent) => void;
  onStart: () => void;
  onEnd: () => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onNoMatch: () => void;
}

export class EnhancedSpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;
  private isListening: boolean = false;
  private config: SpeechRecognitionConfig;
  private callbacks: Partial<SpeechRecognitionCallbacks> = {};
  private silenceTimer: NodeJS.Timeout | null = null;
  private commandPhrases: string[] = [];

  constructor(config: Partial<SpeechRecognitionConfig> = {}) {
    this.isSupported = this.checkSupport();
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      ...config,
    };

    if (this.isSupported) {
      this.initializeRecognition();
    }

    this.loadCommandPhrases();
  }

  /**
   * Check if speech recognition is supported
   */
  private checkSupport(): boolean {
    return !!(
      'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window
    );
  }

  /**
   * Initialize speech recognition
   */
  private initializeRecognition(): void {
    if (!this.isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    if (this.config.grammars) {
      this.recognition.grammars = this.config.grammars;
    }

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alternative = result[0];

        const speechResult: SpeechRecognitionResult = {
          text: alternative.transcript,
          confidence: alternative.confidence || 0,
          isFinal: result.isFinal,
          timestamp: Date.now(),
        };

        this.callbacks.onResult?.(speechResult);

        // Reset silence timer on speech detection
        this.resetSilenceTimer();
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Speech recognition error:', event.error);
      }
      this.callbacks.onError?.(event);

      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setTimeout(() => {
          if (this.isListening) {
            this.startListening();
          }
        }, 1000);
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart?.();
      this.startSilenceTimer();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd?.();
      this.clearSilenceTimer();
    };

    this.recognition.onspeechstart = () => {
      this.callbacks.onSpeechStart?.();
    };

    this.recognition.onspeechend = () => {
      this.callbacks.onSpeechEnd?.();
    };

    this.recognition.onnomatch = () => {
      this.callbacks.onNoMatch?.();
    };
  }

  /**
   * Start listening for speech
   */
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (!this.recognition) {
        reject(new Error('Speech recognition not initialized'));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.clearSilenceTimer();
  }

  /**
   * Abort current recognition session
   */
  abortListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
    this.clearSilenceTimer();
  }

  /**
   * Set callbacks for speech recognition events
   */
  setCallbacks(callbacks: Partial<SpeechRecognitionCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
    }
  }

  /**
   * Get current listening status
   */
  getStatus(): {
    isSupported: boolean;
    isListening: boolean;
    config: SpeechRecognitionConfig;
  } {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening,
      config: this.config,
    };
  }

  /**
   * Check if text contains task-related commands
   */
  isTaskCommand(text: string): boolean {
    const taskKeywords = [
      'create task', 'add task', 'new task', 'make task',
      'add to do', 'create to do', 'add todo', 'create todo',
      'remind me', 'schedule', 'plan', 'organize'
    ];

    const lowerText = text.toLowerCase();
    return taskKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Check if text contains project-related commands
   */
  isProjectCommand(text: string): boolean {
    const projectKeywords = [
      'create project', 'new project', 'start project',
      'begin project', 'make project', 'add project'
    ];

    const lowerText = text.toLowerCase();
    return projectKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Extract task details from speech text
   */
  extractTaskDetails(text: string): {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  } {
    const details: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      dueDate?: string;
    } = {};

    // Extract priority
    const lowerText = text.toLowerCase();
    if (lowerText.includes('high priority') || lowerText.includes('urgent')) {
      details.priority = 'high';
    } else if (lowerText.includes('low priority') || lowerText.includes('minor')) {
      details.priority = 'low';
    } else {
      details.priority = 'medium';
    }

    // Extract due date patterns
    const datePatterns = [
      /(?:due|by|before)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(?:due|by|before)\s+(\d{1,2}(?:st|nd|rd|th)?)/i,
      /(?:in|after)\s+(\d+)\s+(hours?|days?|weeks?)/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        details.dueDate = match[1];
        break;
      }
    }

    // Extract title (simplified approach)
    let title = text;

    // Remove command phrases
    title = title.replace(/(?:create|add|new|make)\s+(?:task|todo|to do)\s*(?:to|for)?\s*/gi, '');

    // Remove priority mentions
    title = title.replace(/\b(?:high|low|medium)\s+priority\b/gi, '');
    title = title.replace(/\burgent\b/gi, '');

    // Remove due date mentions
    title = title.replace(/\b(?:due|by|before)\s+\w+/gi, '');
    title = title.replace(/\b(?:in|after)\s+\d+\s+\w+/gi, '');

    details.title = title.trim();

    // If title is too short, use the original text
    if (details.title.length < 3) {
      details.title = text.replace(/(?:create|add|new|make)\s+(?:task|todo|to do)\s*/gi, '').trim();
    }

    return details;
  }

  /**
   * Create custom grammars for better recognition
   */
  createTaskGrammar(): SpeechGrammarList | null {
    if (!('SpeechGrammarList' in window)) return null;

    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const grammarList = new SpeechGrammarList();

    const grammar = `
      #JSGF V1.0; grammar commands;
      public <command> = <task_command> | <project_command> | <query_command>;
      <task_command> = (create | add | new | make) (task | todo | to do) <task_content>;
      <project_command> = (create | add | new | start) project <project_content>;
      <query_command> = (show | list | get) (tasks | projects | status);
      <task_content> = <text>;
      <project_content> = <text>;
      <text> = * ;
    `;

    grammarList.addFromString(grammar, 1);
    return grammarList;
  }

  /**
   * Start silence timer to auto-stop after silence
   */
  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.isListening) {
        this.stopListening();
      }
    }, 10000); // 10 seconds of silence
  }

  /**
   * Reset silence timer
   */
  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    this.startSilenceTimer();
  }

  /**
   * Clear silence timer
   */
  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Load command phrases for better recognition
   */
  private loadCommandPhrases(): void {
    this.commandPhrases = [
      // Task commands
      'create task', 'add task', 'new task', 'make task',
      'create todo', 'add todo', 'new todo', 'make todo',
      'create to do', 'add to do', 'new to do', 'make to do',

      // Project commands
      'create project', 'new project', 'start project', 'begin project',

      // Query commands
      'show tasks', 'list tasks', 'get tasks', 'display tasks',
      'show projects', 'list projects', 'get projects', 'display projects',

      // Priority keywords
      'high priority', 'low priority', 'medium priority', 'urgent',

      // Time keywords
      'due today', 'due tomorrow', 'by today', 'by tomorrow',
      'this week', 'next week', 'this month', 'next month',
    ];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
      'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW',
      'ru-RU', 'ar-SA', 'hi-IN', 'th-TH', 'vi-VN',
    ];
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopListening();
    this.clearSilenceTimer();
    this.callbacks = {};
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onstart = null;
      this.recognition.onend = null;
      this.recognition = null;
    }
  }
}

// Global type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    SpeechGrammarList: any;
    webkitSpeechGrammarList: any;
  }
}

// Singleton instance
export const speechToTextService = new EnhancedSpeechToTextService();