export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  pageSize: 20,
  maxPhotos: 20,
  minPhotos: 6,
  maxPhotoSizeMB: 10,
  maxAvatarSizeMB: 5,
  otpLength: 6,
  otpExpirySeconds: 120,
  listingExpiryDays: 90,
  offerExpiryHours: 48,
  defaultCurrency: 'INR',
  supportedLanguages: ['en', 'hi', 'ur'] as const,
} as const;

export const queryConfig = {
  staleTime: {
    listings: 30 * 1000,
    listingDetail: 60 * 1000,
    similarListings: 5 * 60 * 1000,
    masterData: Infinity,
    conversations: 10 * 1000,
    messages: 0,
    profile: 5 * 60 * 1000,
    savedCars: 60 * 1000,
    offers: 30 * 1000,
  },
  gcTime: {
    listings: 5 * 60 * 1000,
    listingDetail: 10 * 60 * 1000,
    masterData: Infinity,
    conversations: 5 * 60 * 1000,
    messages: 5 * 60 * 1000,
    profile: 30 * 60 * 1000,
  },
} as const;
