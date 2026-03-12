import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Carvaan',
  slug: 'cosmos-carvaan',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'carvaan',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0D7377',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.cosmos.carvaan',
    infoPlist: {
      NSCameraUsageDescription: 'Carvaan needs camera access to take photos of your car for listings.',
      NSPhotoLibraryUsageDescription: 'Carvaan needs photo library access to select car photos for listings.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundColor: '#0D7377',
    },
    package: 'com.cosmos.carvaan',
    permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE'],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-image-picker',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0D7377',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // @ts-ignore — newArchEnabled recognized at runtime by Expo SDK 52+
    newArchEnabled: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
  },
});
