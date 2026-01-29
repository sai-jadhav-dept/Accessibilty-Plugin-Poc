// Main exports for the accessibility toolkit
export { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';

// Components
export { default as AccessibilityButton } from './components/AccessibilityButton';
export { default as AccessibilityModal } from './components/AccessibilityModal';
export { default as AccessibleImage } from './components/AccessibleImage';
export { default as AccessibleText } from './components/AccessibleText';
export { default as ReadModal } from './components/ReadModal';
export { default as TextMagnifier } from './components/TextMagnifier';
export { default as DictionaryLookup } from './components/DictionaryLookup';
export { default as ReadingGuide } from './components/ReadingGuide';
export { default as ScreenReaderControls } from './components/ScreenReaderControls';

// Hooks
export { default as useDynamicColors } from './hooks/useDynamicColors';
export { default as usePageRead } from './hooks/usePageRead';
export { default as useThemeColors } from './hooks/useThemeColors';

// Services
export { default as TTSService } from './services/TTSService';
export { default as NativeAccessibilityBridge } from './services/NativeAccessibilityBridge';
export { 
  loadAccessibilityPreferences, 
  saveAccessibilityPreferences 
} from './services/AccessibilityStorage';

// Utils
export {
  ACCESSIBILITY_PROFILES,
  TEXT_ALIGNMENT,
  DEFAULT_ACCESSIBILITY_STATE,
  applyProfile,
  getAdjustedFontSize,
  getAdjustedLineHeight,
} from './utils/AccessibilityUtils';

// Default export for convenience
export default {
  AccessibilityProvider,
  useAccessibility,
  AccessibilityButton,
  AccessibilityModal,
  AccessibleImage,
  AccessibleText,
  ReadModal,
  TextMagnifier,
  DictionaryLookup,
  ReadingGuide,
  ScreenReaderControls,
  useDynamicColors,
  usePageRead,
  useThemeColors,
  TTSService,
  NativeAccessibilityBridge,
};
