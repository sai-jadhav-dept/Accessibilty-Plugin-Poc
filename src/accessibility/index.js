// Main exports for the Accessibility System
export { AccessibilityProvider, useAccessibility } from './AccessibilityContext';
export { default as AccessibilityButton } from './AccessibilityButton';
export { default as AccessibilityModal } from './AccessibilityModal';
export { default as AccessibilityColorWrapper } from './AccessibilityColorWrapper';
export { default as AccessibleText } from './AccessibleText';
export { default as AccessibleButton } from './AccessibleButton';
export { default as AccessibleImage } from './AccessibleImage';

// Export hooks
export { useThemeColors } from './useThemeColors';
export { default as useDynamicColors } from './useDynamicColors';

// Export utilities
export * from './AccessibilityUtils';
export * from './AccessibilityStorage';

// Export services
export { default as NativeAccessibilityBridge } from './NativeAccessibilityBridge';
export { default as TTSService } from './TTSService';
// export { default as DictionaryService } from './DictionaryService';
