// Analytics service - logs in development, ready for PostHog in production
const isDev = __DEV__;

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

const eventQueue: AnalyticsEvent[] = [];

export const Analytics = {
  track(event: string, properties?: Record<string, any>) {
    const entry = { name: event, properties, timestamp: new Date().toISOString() };
    eventQueue.push(entry);
    if (isDev) {
      console.log(`[Analytics] ${event}`, properties ?? '');
    }
    // TODO: Replace with posthog.capture(event, properties)
  },

  screen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_view', { screen: screenName, ...properties });
  },

  identify(userId: string, traits?: Record<string, any>) {
    if (isDev) {
      // Redact PII from dev logs
      console.log(`[Analytics] identify: ${userId.slice(0, 8)}...`);
    }
    // TODO: Replace with posthog.identify(userId, traits)
  },

  reset() {
    eventQueue.length = 0;
    // TODO: Replace with posthog.reset()
  },

  getQueue() {
    return [...eventQueue];
  },
};

// Event constants
export const Events = {
  LISTING_VIEWED: 'listing_viewed',
  LISTING_SAVED: 'listing_saved',
  LISTING_UNSAVED: 'listing_unsaved',
  LISTING_CREATED: 'listing_created',
  LISTING_SUBMITTED: 'listing_submitted',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  CHAT_STARTED: 'chat_started',
  MESSAGE_SENT: 'message_sent',
  PHOTO_UPLOADED: 'photo_uploaded',
  CALL_INITIATED: 'call_initiated',
  PROFILE_UPDATED: 'profile_updated',
  AUTH_LOGIN: 'auth_login',
  AUTH_SIGNUP: 'auth_signup',
  AUTH_LOGOUT: 'auth_logout',
};
