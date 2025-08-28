import * as Sentry from '@sentry/react';
import { config } from '../config/environment';

export class MonitoringService {
  private static initialized = false;

  static initialize() {
    if (this.initialized || !config.features.enableSentry) return;

    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: config.isProduction ? 'production' : 'development',
      tracesSampleRate: config.isProduction ? 0.1 : 1.0,
      beforeSend(event, hint) {
        // 민감한 정보 필터링
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            event.exception.values?.[0]?.stacktrace?.frames?.forEach(frame => {
              if (frame.filename?.includes('node_modules')) {
                frame.in_app = false;
              }
            });
          }
        }
        return event;
      },
    });

    this.initialized = true;
  }

  static captureError(error: Error, context?: Record<string, any>) {
    if (config.features.enableSentry) {
      Sentry.withScope(scope => {
        if (context) {
          scope.setContext('additional', context);
        }
        Sentry.captureException(error);
      });
    } else {
      console.error('[Monitoring]', error, context);
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (config.features.enableSentry) {
      Sentry.captureMessage(message, level);
    } else {
      console[level === 'warning' ? 'warn' : level]('[Monitoring]', message);
    }
  }

  static setUser(user: { id: string; email?: string }) {
    if (config.features.enableSentry) {
      Sentry.setUser(user);
    }
  }
}

export default MonitoringService;