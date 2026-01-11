import { Platform } from 'react-native';

// Tailwind styles are required for Expo Web.
if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./global.css');
}

export { default } from 'expo-router/entry';
