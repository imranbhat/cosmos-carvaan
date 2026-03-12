/**
 * Analytics utility.
 *
 * For production, integrate PostHog or Expo Analytics:
 *   npm install posthog-react-native
 *
 * This module provides a consistent API so all tracking calls
 * can be upgraded to a real provider in one place.
 */

type EventProperties = Record<string, string | number | boolean | null>;

export function trackEvent(event: string, properties?: EventProperties) {
  if (__DEV__) {
    console.log('[Analytics]', event, properties);
  }
  // TODO: posthog.capture(event, properties);
}

export function trackScreen(screenName: string) {
  if (__DEV__) {
    console.log('[Screen]', screenName);
  }
  // TODO: posthog.screen(screenName);
}

export function identifyUser(userId: string, traits?: EventProperties) {
  if (__DEV__) {
    console.log('[Identify]', userId, traits);
  }
  // TODO: posthog.identify(userId, traits);
}

// Pre-defined event names for consistency
export const Events = {
  LISTING_VIEWED: 'listing_viewed',
  LISTING_SAVED: 'listing_saved',
  LISTING_UNSAVED: 'listing_unsaved',
  LISTING_CREATED: 'listing_created',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  CHAT_STARTED: 'chat_started',
  MESSAGE_SENT: 'message_sent',
  SELL_STEP_COMPLETED: 'sell_step_completed',
  PHOTO_UPLOADED: 'photo_uploaded',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
} as const;
