// Comprehensive Debug Logging System for Project Planner App

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  component?: string;
  route?: string;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  categories: string[];
  enableConsole: boolean;
  enableStorage: boolean;
  enableNetwork: boolean;
  maxStorageEntries: number;
  environment: 'development' | 'production' | 'testing';
}

class DebugLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.VERBOSE : LogLevel.WARN,
      categories: ['all'],
      enableConsole: true,
      enableStorage: process.env.NODE_ENV === 'development',
      enableNetwork: false,
      maxStorageEntries: 1000,
      environment: (process.env.NODE_ENV as any) || 'development',
    };

    this.initializeLogger();
  }

  private initializeLogger(): void {
    // Load persisted config from localStorage
    const savedConfig = this.loadConfig();
    if (savedConfig) {
      this.config = { ...this.config, ...savedConfig };
    }

    // Set up global error handlers
    window.addEventListener('error', (event) => {
      this.error('Global Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', event.reason, {
        promise: event.promise,
        reason: event.reason,
      });
    });

    // Initialize performance monitoring
    if (typeof window.performance !== 'undefined') {
      this.info('Performance', 'Performance monitoring enabled', {
        navigation: performance.navigation,
        timing: performance.timing,
      });
    }

    this.info('Logger', `Debug logger initialized with session ID: ${this.sessionId}`, {
      config: this.config,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  // Core logging methods
  error(category: string, message: string, data?: any, component?: string): void {
    this.log(LogLevel.ERROR, category, message, data, component);
  }

  warn(category: string, message: string, data?: any, component?: string): void {
    this.log(LogLevel.WARN, category, message, data, component);
  }

  info(category: string, message: string, data?: any, component?: string): void {
    this.log(LogLevel.INFO, category, message, data, component);
  }

  debug(category: string, message: string, data?: any, component?: string): void {
    this.log(LogLevel.DEBUG, category, message, data, component);
  }

  verbose(category: string, message: string, data?: any, component?: string): void {
    this.log(LogLevel.VERBOSE, category, message, data, component);
  }

  // Specialized logging methods for common scenarios
  pageLoad(route: string, component: string, timing?: { start: number; end: number }): void {
    this.info('Page Load', `Loading ${route}`, {
      component,
      route,
      timing,
      performance: timing ? `${timing.end - timing.start}ms` : undefined,
    }, component);
  }

  pageError(route: string, component: string, error: Error | string): void {
    this.error('Page Error', `Error in ${route}`, {
      component,
      route,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }, component);
  }

  componentMount(component: string, props?: any): void {
    this.debug('Component Lifecycle', `${component} mounted`, {
      component,
      props: this.sanitizeProps(props),
    }, component);
  }

  componentUnmount(component: string): void {
    this.debug('Component Lifecycle', `${component} unmounted`, {
      component,
    }, component);
  }

  componentError(component: string, error: Error, errorInfo?: any): void {
    this.error('Component Error', `Error in ${component}`, {
      component,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
    }, component);
  }

  apiCall(method: string, url: string, status?: number, timing?: number): void {
    const level = status && status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, 'API Call', `${method} ${url}`, {
      method,
      url,
      status,
      timing: timing ? `${timing}ms` : undefined,
    });
  }

  userAction(action: string, component: string, data?: any): void {
    this.info('User Action', action, {
      component,
      data: this.sanitizeUserData(data),
      timestamp: Date.now(),
    }, component);
  }

  routeChange(from: string, to: string, component?: string): void {
    this.info('Navigation', `Route changed from ${from} to ${to}`, {
      from,
      to,
      component,
      timestamp: Date.now(),
    });
  }

  authEvent(event: string, userId?: string, success?: boolean): void {
    this.info('Authentication', event, {
      userId: userId ? this.hashUserId(userId) : 'anonymous',
      success,
      timestamp: Date.now(),
    });
  }

  // Core logging implementation
  private log(level: LogLevel, category: string, message: string, data?: any, component?: string): void {
    if (!this.shouldLog(level, category)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: this.sanitizeData(data),
      component,
      route: this.getCurrentRoute(),
      sessionId: this.sessionId,
    };

    this.logs.push(entry);

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Storage
    if (this.config.enableStorage) {
      this.saveToStorage(entry);
    }

    // Network logging (if configured)
    if (this.config.enableNetwork) {
      this.sendToNetwork(entry);
    }

    // Cleanup old logs
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs = this.logs.slice(-this.config.maxStorageEntries);
    }
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    if (level > this.config.level) {
      return false;
    }

    if (this.config.categories.includes('all')) {
      return true;
    }

    return this.config.categories.includes(category.toLowerCase());
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}] [${entry.category}]${entry.component ? ` [${entry.component}]` : ''}`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.VERBOSE:
        console.log(message, entry.data);
        break;
    }
  }

  private saveToStorage(entry: LogEntry): void {
    try {
      const key = `debug_log_${this.sessionId}`;
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');
      existingLogs.push(entry);

      // Keep only recent logs
      const recentLogs = existingLogs.slice(-this.config.maxStorageEntries);
      localStorage.setItem(key, JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to save log to storage:', error);
    }
  }

  private sendToNetwork(entry: LogEntry): void {
    // Network logging implementation would go here
    // For now, just a placeholder
    if (this.config.environment === 'development') {
      console.debug('Network logging not implemented:', entry);
    }
  }

  // Utility methods
  private getCurrentRoute(): string {
    return window.location.pathname;
  }

  private sanitizeProps(props: any): any {
    if (!props) return undefined;

    // Remove sensitive data from props
    const sanitized = { ...props };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;

    return sanitized;
  }

  private sanitizeUserData(data: any): any {
    if (!data) return undefined;

    const sanitized = { ...data };

    // Remove or hash sensitive user data
    if (sanitized.email) {
      sanitized.email = this.hashEmail(sanitized.email);
    }

    delete sanitized.password;
    delete sanitized.creditCard;
    delete sanitized.ssn;

    return sanitized;
  }

  private sanitizeData(data: any): any {
    if (!data) return undefined;

    try {
      // Create a deep copy and sanitize
      const sanitized = JSON.parse(JSON.stringify(data));
      return this.recursiveSanitize(sanitized);
    } catch (error) {
      return { error: 'Failed to sanitize data', original: String(data) };
    }
  }

  private recursiveSanitize(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.recursiveSanitize(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      if (lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('key') ||
          lowerKey.includes('secret')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.recursiveSanitize(value);
      }
    }

    return sanitized;
  }

  private hashUserId(userId: string): string {
    // Simple hash for user privacy
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash).toString(36)}`;
  }

  private hashEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.charAt(0)}***@${domain}`;
  }

  // Configuration methods
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.saveConfig();
    this.info('Logger', `Log level changed to ${LogLevel[level]}`);
  }

  setCategories(categories: string[]): void {
    this.config.categories = categories;
    this.saveConfig();
    this.info('Logger', `Categories changed to: ${categories.join(', ')}`);
  }

  enableCategory(category: string): void {
    if (!this.config.categories.includes(category) && !this.config.categories.includes('all')) {
      this.config.categories.push(category);
      this.saveConfig();
    }
  }

  disableCategory(category: string): void {
    this.config.categories = this.config.categories.filter(cat => cat !== category);
    this.saveConfig();
  }

  // Export/Import methods
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      config: this.config,
      logs: this.logs,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  getLogs(filters?: {
    level?: LogLevel;
    category?: string;
    component?: string;
    since?: Date;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level <= filters.level!);
      }

      if (filters.category) {
        filteredLogs = filteredLogs.filter(log =>
          log.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters.component) {
        filteredLogs = filteredLogs.filter(log =>
          log.component?.toLowerCase().includes(filters.component!.toLowerCase())
        );
      }

      if (filters.since) {
        filteredLogs = filteredLogs.filter(log =>
          new Date(log.timestamp) >= filters.since!
        );
      }
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
    const key = `debug_log_${this.sessionId}`;
    localStorage.removeItem(key);
    this.info('Logger', 'All logs cleared');
  }

  // Configuration persistence
  private saveConfig(): void {
    try {
      localStorage.setItem('debug_logger_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save logger config:', error);
    }
  }

  private loadConfig(): Partial<LoggerConfig> | null {
    try {
      const saved = localStorage.getItem('debug_logger_config');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load logger config:', error);
      return null;
    }
  }

  // Performance monitoring
  startTimer(name: string): () => number {
    const start = performance.now();
    this.debug('Performance', `Timer started: ${name}`, { start });

    return () => {
      const end = performance.now();
      const duration = end - start;
      this.info('Performance', `Timer completed: ${name}`, {
        start,
        end,
        duration: `${duration.toFixed(2)}ms`
      });
      return duration;
    };
  }

  // Memory monitoring
  logMemoryUsage(context?: string): void {
    if (typeof window.performance !== 'undefined' && 'memory' in window.performance) {
      const memory = (window.performance as any).memory;
      this.info('Performance', 'Memory usage', {
        context,
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Development tools - attach to window for console access
if (process.env.NODE_ENV === 'development') {
  (window as any).debugLogger = debugLogger;
}

// Export convenience functions
export const {
  error,
  warn,
  info,
  debug,
  verbose,
  pageLoad,
  pageError,
  componentMount,
  componentUnmount,
  componentError,
  apiCall,
  userAction,
  routeChange,
  authEvent,
} = debugLogger;