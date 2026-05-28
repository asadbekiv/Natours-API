import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Natours',
  slug: 'natours',
  scheme: 'natours',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  // Some 0.81 libs still trip the new arch's feature-flag checks
  // (e.g. ReactNativeFeatureFlags.enableOptimisedVirtualizedCells). Keep off
  // for now; can be re-enabled once the ecosystem stabilises.
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.natours.app',
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        'Allow Natours to access your photos so you can update your profile picture.',
    },
  },
  android: {
    package: 'com.natours.app',
    adaptiveIcon: { backgroundColor: '#55c57a' },
  },
  plugins: ['expo-router', 'expo-asset', 'expo-font'],
  experiments: { typedRoutes: true },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  },
};

export default config;
