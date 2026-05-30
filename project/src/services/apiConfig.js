import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolves the backend server API base URL dynamically.
 * During development with Expo Go, this automatically extracts the host IP address 
 * of your computer, allowing physical iOS/Android devices and emulators to connect 
 * to your backend server seamlessly without manual IP updates.
 */
const getBaseUrl = () => {
  try {
    // 1. Try to extract the host IP from the Expo development server URI
    const hostUri = Constants.expoConfig?.hostUri; 
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        if (__DEV__) {
          console.log(`[API Config] Dynamically resolved dev host IP: http://${ip}:5000`);
        }
        return `http://${ip}:5000`;
      }
    }
  } catch (error) {
    console.warn('[API Config] Failed to parse Expo hostUri:', error);
  }

  // 2. Standard Fallbacks for standalone builds, production, web, or emulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000'; // Android emulator loophole to host machine
  }
  return 'http://localhost:5000'; // iOS simulator and Web standard
};

export const API_BASE_URL = getBaseUrl();
