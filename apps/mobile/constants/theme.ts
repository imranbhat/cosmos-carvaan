export const colors = {
  primary: '#0A6C6E',
  primaryLight: '#0E9598',
  primaryDark: '#074D4F',
  primaryMuted: 'rgba(10, 108, 110, 0.08)',

  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',

  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#E2E8F0',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const typography = {
  hero: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  price: { fontSize: 20, fontWeight: '800' as const, lineHeight: 26, letterSpacing: -0.3 },
  priceSmall: { fontSize: 16, fontWeight: '700' as const, lineHeight: 22 },
  tag: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.3, textTransform: 'uppercase' as const },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;
