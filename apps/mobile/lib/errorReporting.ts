/**
 * Error reporting utility.
 *
 * For production, integrate Sentry:
 *   npm install @sentry/react-native
 *   Sentry.init({ dsn: 'YOUR_DSN', tracesSampleRate: 0.2 });
 *
 * For now, this module provides a consistent API so all error
 * capture calls can be upgraded to Sentry in one place.
 */

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Error]', error, context);
  }
  // TODO: Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (__DEV__) {
    console.log(`[${level.toUpperCase()}]`, message);
  }
  // TODO: Sentry.captureMessage(message, level);
}

export function setUser(id: string | null, email?: string) {
  if (__DEV__) {
    console.log('[User]', id, email);
  }
  // TODO: Sentry.setUser(id ? { id, email } : null);
}
