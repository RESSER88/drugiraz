import { logger } from './logger';

// Production monitoring utilities
interface MonitoringConfig {
  sentryDsn?: string;
  logRocketAppId?: string;
  enablePerformanceMonitoring?: boolean;
  enableErrorReporting?: boolean;
}

class ProductionMonitoring {
  private config: MonitoringConfig;
  private isInitialized = false;

  constructor(config: MonitoringConfig = {}) {
    this.config = config;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry if DSN is provided
      if (this.config.sentryDsn && this.config.enableErrorReporting) {
        await this.initializeSentry();
      }

      // Initialize LogRocket if App ID is provided
      if (this.config.logRocketAppId) {
        await this.initializeLogRocket();
      }

      // Setup global error handlers
      this.setupGlobalErrorHandlers();

      // Setup performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }

      this.isInitialized = true;
      logger.log('🚀 Production monitoring initialized');

    } catch (error) {
      logger.error('❌ Failed to initialize production monitoring:', error);
    }
  }

  private async initializeSentry() {
    try {
      logger.warn('⚠️ Sentry not installed - install with: npm install @sentry/react');
      // Graceful fallback - no dynamic import to avoid TypeScript errors
    } catch (error) {
      logger.error('❌ Sentry initialization failed:', error);
    }
  }

  private async initializeLogRocket() {
    try {
      logger.warn('⚠️ LogRocket not installed - install with: npm install logrocket');
      // Graceful fallback - no dynamic import to avoid TypeScript errors
    } catch (error) {
      logger.error('❌ LogRocket initialization failed:', error);
    }
  }

  private setupGlobalErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      logger.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection:', event.reason);
    });

    // React Error Boundary integration
    if (typeof window !== 'undefined') {
      (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
        onError: (error: Error) => {
          logger.error('React error boundary:', error);
        }
      };
    }
  }

  private setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              logger.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        logger.error('Performance observer setup failed:', error);
      }
    }

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logger.log('Page hidden - user left tab');
      } else {
        logger.log('Page visible - user returned to tab');
      }
    });
  }

  // Manual error reporting
  reportError(error: Error, context?: Record<string, any>) {
    logger.error('Manual error report:', error, context);
    
    // Send to external services if available
    if (window.Sentry?.captureException) {
      window.Sentry.captureException(error, { extra: context });
    }
  }

  // Manual event tracking
  trackEvent(name: string, properties?: Record<string, any>) {
    logger.log('Event tracked:', name, properties);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', name, properties);
    }
  }

  // Performance measurement
  measurePerformance(name: string, fn: () => Promise<any> | any) {
    const start = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.then((value) => {
          const duration = performance.now() - start;
          logger.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
          return value;
        }).catch((error) => {
          const duration = performance.now() - start;
          logger.error(`Performance [${name}] failed after ${duration.toFixed(2)}ms:`, error);
          throw error;
        });
      } else {
        const duration = performance.now() - start;
        logger.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Performance [${name}] failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
}

// Global instance
export const productionMonitoring = new ProductionMonitoring({
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  // sentryDsn: 'YOUR_SENTRY_DSN', // Add when ready
  // logRocketAppId: 'YOUR_LOGROCKET_APP_ID', // Add when ready
});

// Auto-initialize in production
if (import.meta.env.PROD) {
  productionMonitoring.initialize();
}

// Global declarations for TypeScript
declare global {
  interface Window {
    Sentry?: any;
    gtag?: (...args: any[]) => void;
  }
}

export default ProductionMonitoring;