const isDev = __DEV__;

interface ErrorEntry {
  error: Error | string;
  context?: Record<string, any>;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
}

const errorLog: ErrorEntry[] = [];

export const ErrorReporter = {
  captureException(error: Error, context?: Record<string, any>) {
    const entry: ErrorEntry = {
      error,
      context,
      timestamp: new Date().toISOString(),
      level: 'error',
    };
    errorLog.push(entry);
    if (isDev) {
      console.error(`[ErrorReporter] ${error.message}`, context ?? '');
    }
    // TODO: Replace with Sentry.captureException(error, { extra: context })
  },

  captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info', context?: Record<string, any>) {
    const entry: ErrorEntry = {
      error: message,
      context,
      timestamp: new Date().toISOString(),
      level,
    };
    errorLog.push(entry);
    if (isDev) {
      console.log(`[ErrorReporter:${level}] ${message}`, context ?? '');
    }
    // TODO: Replace with Sentry.captureMessage(message, level)
  },

  setUser(id: string, email?: string) {
    if (isDev) {
      console.log(`[ErrorReporter] setUser: ${id}`, email ?? '');
    }
    // TODO: Replace with Sentry.setUser({ id, email })
  },

  getLog() {
    return [...errorLog];
  },
};
