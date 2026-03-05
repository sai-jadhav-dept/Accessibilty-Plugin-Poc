// Main exports for the Accessibility System
export { AccessibilityProvider, useAccessibility } from './AccessibilityContext';
export { default as AccessibilityButton } from './AccessibilityButton';
export { default as AccessibilityModal } from './AccessibilityModal';
export { default as AccessibilityColorWrapper } from './AccessibilityColorWrapper';
export { default as AccessibleText } from './AccessibleText';
export { default as AccessibleButton } from './AccessibleButton';
export { default as AccessibleImage } from './AccessibleImage';
export { default as TextMagnifier } from './TextMagnifier';
export { default as DictionaryLookup } from './DictionaryLookup';
export { default as ReadingGuide } from './ReadingGuide';
export { default as EnlargedTouchable } from './EnlargedTouchable';
export { default as AlignedText } from './AlignedText';
export { default as FilteredImage } from './FilteredImage';
export { default as AccessibleFilteredImage } from './AccessibleFilteredImage';
export { default as ReadModal } from './ReadModal';
export { default as ScreenReaderControls } from './ScreenReaderControls';
export { default as TextControlsWithSlider } from './TextControlsWithSlider';
export { default as ProfileTester } from './ProfileTester';

// Export hooks
export { useThemeColors } from './useThemeColors';
export { default as useDynamicColors } from './useDynamicColors';
export { usePageRead } from './usePageRead';

// Export utilities
export * from './AccessibilityUtils';
export * from './AccessibilityStorage';

// Export services
export { default as NativeAccessibilityBridge } from './NativeAccessibilityBridge';
export { default as TTSService } from './TTSService';
export { default as AccessibilityRuntime, setRuntime } from './AccessibilityRuntime';
export { default as Colors, getColors } from './Colors';
export { default as Fonts } from './Fonts';
// export { default as DictionaryService } from './DictionaryService';
