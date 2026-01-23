import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ACCESSIBILITY_STATE } from './AccessibilityUtils';

const STORAGE_KEY = '@accessibility_preferences';

// Save accessibility preferences
export const saveAccessibilityPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving accessibility preferences:', error);
    return false;
  }
};

// Load accessibility preferences
export const loadAccessibilityPreferences = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_ACCESSIBILITY_STATE;
  } catch (error) {
    console.error('Error loading accessibility preferences:', error);
    return DEFAULT_ACCESSIBILITY_STATE;
  }
};

// Clear accessibility preferences
export const clearAccessibilityPreferences = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing accessibility preferences:', error);
    return false;
  }
};
