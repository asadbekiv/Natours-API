import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Natours',
  slug: 'natours',
  scheme: 'natours',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.natours.app',
  },
  android: {
    package: 'com.natours.app',
    adaptiveIcon: { backgroundColor: '#55c57a' },
  },
  plugins: ['expo-router'],
  experiments: { typedRoutes: true },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  },
};

export default config;
