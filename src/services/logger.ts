/**
 * Frontend logging service for Agent 007
 * Captures errors, user actions, and performance metrics
 * Sends logs to backend for centralized logging and S3 storage
 */

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  category: string;
  context?: Record<string, any>;
  sessionId?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

class FrontendLogger {
  private sessionId: string;
  private userId?: string;
  private logBuffer: LogEntry[] = [];
  private performanceBuffer: PerformanceMetric[] = [];
  private maxBufferSize = 50;
  private flushInterval = 30000; // 30 seconds
  private apiBaseUrl: string;

  constructor(apiBaseUrl?: string) {
    this.sessionId = this.generateSessionId();
    this.apiBaseUrl = apiBaseUrl || this.getApiBaseUrl();
    
    // Setup automatic flushing
    setInterval(() => this.flush(), this.flushInterval);
    
    // Setup global error handlers
    this.setupGlobalErrorHandlers();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Log session start
    this.info('Session started', 'session', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  private generateSessionId(): string {
    return `frontend_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getApiBaseUrl(): string {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    return window.location.origin.includes('localhost') 
      ? 'http://localhost:8000' 
      : window.location.origin;
  }

  private setupGlobalErrorHandlers(): void {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript error', 'global_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', 'promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Capture React error boundary errors (if using error boundaries)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('Warning')) {
        this.warn('React warning/error', 'react', { message });
      }
      originalConsoleError.apply(console, args);
    };
  }

  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          
          this.logPerformance('page_load', loadTime, {
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: timing.responseEnd - timing.navigationStart,
            resourcesLoaded: timing.loadEventEnd - timing.domContentLoadedEventEnd
          });
        }
      }, 1000);
    });

    // Monitor long tasks (if supported)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Log tasks longer than 50ms
              this.logPerformance('long_task', entry.duration, {
                name: entry.name,
                startTime: entry.startTime
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }
    }
  }

  // Logging methods
  public debug(message: string, category: string = 'general', context?: Record<string, any>): void {
    this.addLogEntry('debug', message, category, context);
  }

  public info(message: string, category: string = 'general', context?: Record<string, any>): void {
    this.addLogEntry('info', message, category, context);
  }

  public warn(message: string, category: string = 'general', context?: Record<string, any>): void {
    this.addLogEntry('warn', message, category, context);
  }

  public error(message: string, category: string = 'general', context?: Record<string, any>): void {
    this.addLogEntry('error', message, category, context);
  }

  // Specialized logging methods
  public logUserAction(action: string, details?: Record<string, any>): void {
    this.info(`User action: ${action}`, 'user_action', details);
  }

  public logApiCall(endpoint: string, method: string, duration?: number, success?: boolean, error?: any, requestId?: string): void {
    this.info('API call', 'api', {
      endpoint,
      method,
      duration,
      success,
      request_id: requestId,
      error: error ? { message: error.message, status: error.status } : undefined
    });
  }

  public logNavigation(from: string, to: string): void {
    this.info('Navigation', 'navigation', { from, to });
  }

  public logComponentError(componentName: string, error: Error, errorInfo?: any): void {
    this.error(`Component error in ${componentName}`, 'component_error', {
      componentName,
      error: {
        message: error.message,
        stack: error.stack
      },
      errorInfo
    });
  }

  public logPerformance(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    this.performanceBuffer.push(metric);
    
    if (this.performanceBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private addLogEntry(level: LogEntry['level'], message: string, category: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      context,
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add to buffer
    this.logBuffer.push(logEntry);
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'debug' ? console.debug : 
                           level === 'info' ? console.info :
                           level === 'warn' ? console.warn : console.error;
      consoleMethod(`[${category}] ${message}`, context);
    }

    // Flush if buffer is full or if it's an error
    if (this.logBuffer.length >= this.maxBufferSize || level === 'error') {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.logBuffer.length === 0 && this.performanceBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    const metricsToSend = [...this.performanceBuffer];
    
    // Clear buffers
    this.logBuffer = [];
    this.performanceBuffer = [];

    try {
      // Send logs to backend
      if (logsToSend.length > 0) {
        await fetch(`${this.apiBaseUrl}/api/logs/frontend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToSend,
            sessionId: this.sessionId
          })
        });
      }

      // Send performance metrics
      if (metricsToSend.length > 0) {
        await fetch(`${this.apiBaseUrl}/api/logs/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: metricsToSend,
            sessionId: this.sessionId
          })
        });
      }
    } catch (error) {
      // Silently fail - don't want logging errors to break the app
      console.warn('Failed to send logs to backend:', error);
      
      // Add logs back to buffer for retry (up to max size)
      this.logBuffer = [...logsToSend.slice(-this.maxBufferSize), ...this.logBuffer];
      this.performanceBuffer = [...metricsToSend.slice(-this.maxBufferSize), ...this.performanceBuffer];
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    this.info('User ID set', 'auth', { userId });
  }

  public clearUserId(): void {
    const oldUserId = this.userId;
    this.userId = undefined;
    this.info('User logged out', 'auth', { previousUserId: oldUserId });
  }
}

// Create global logger instance
const logger = new FrontendLogger();

// Export both the class and instance
export { FrontendLogger, logger };
export default logger;