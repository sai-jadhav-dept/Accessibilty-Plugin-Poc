// Accessibility utility functions and constants

export const ACCESSIBILITY_PROFILES = {
  NONE: 'none',
  BLIND: 'blind',
  DYSLEXIA: 'dyslexia',
  LOW_VISION: 'low_vision',
  COGNITIVE: 'cognitive',
  EPILEPSY_SAFE: 'epilepsy_safe',
  ADHD_FOCUS: 'adhd_focus',
};

export const COLOR_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high_contrast',
  SEPIA: 'sepia',
};

export const TEXT_ALIGNMENT = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
  JUSTIFY: 'justify',
};

// Default accessibility state
export const DEFAULT_ACCESSIBILITY_STATE = {
  // Font & Text
  fontScale: 1.0,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlignment: TEXT_ALIGNMENT.LEFT,
  
  // Colors & Display
  highContrast: false,
  whiteHighContrast: false,
  darkHighContrast: false,
  colorInversion: false,
  greyscale: false,
  lowSaturation: false,
  highSaturation: false,
  colorTheme: COLOR_THEMES.LIGHT,
  accentColor: '#007AFF',
  textColor: null,
  backgroundColor: null,
  
  // Visual Aids
  hideImages: false,
  imageDescription: false,
  enlargeButtons: false,
  reducedMotion: false,
  highlightLinks: false,
  
  // Reading Assistance
  readingMask: false,
  readingLine: false,
  textMagnifier: false,
  textToSpeech: false,
  dictionary: false,

  // Accessibility Features
  screenReader: false,
  
  // Native Settings (from system)
  nativeScreenReader: false,
  nativeReducedMotion: false,
  nativeBoldText: false,
  nativeGrayscale: false,
  nativeInvertColors: false,
  nativeReduceTransparency: false,
  
  // Active Profile
  activeProfile: ACCESSIBILITY_PROFILES.NONE,
};

// Profile configurations with detailed feature sets
export const PROFILE_CONFIGS = {
  // Blindness Profile - Screen reader support, high contrast, hide images
  [ACCESSIBILITY_PROFILES.BLIND]: {
    // Screen reader support
    textToSpeech: true,
    screenReader: true,
    // High contrast
    highContrast: true,
    colorTheme: COLOR_THEMES.HIGH_CONTRAST,
    // Hide images to reduce clutter for screen readers
    hideImages: true,
    // Disable visual-only features
    highlightLinks: false,
    // Additional helpful features
    fontScale: 1.2,
    reducedMotion: true,
    enlargeButtons: true,
    dictionary: true,
  },
  
  // Dyslexia Profile - Larger text, increased line height & letter spacing
  [ACCESSIBILITY_PROFILES.DYSLEXIA]: {
    // Larger text
    fontScale: 1.5,
    // Increased line height
    lineHeight: 2.4,
    // Increased letter spacing
    letterSpacing: 0.5,
    // Additional helpful features
    highlightLinks: true,
    enlargeButtons: true,
    colorTheme: COLOR_THEMES.LIGHT,
    textAlignment: TEXT_ALIGNMENT.LEFT,
    readingLine: true,
  },
  
  // Visually Impaired Profile - Maximum text size, high contrast, enlarged buttons
  [ACCESSIBILITY_PROFILES.LOW_VISION]: {
    // Maximum text size
    fontScale: 2.0,
    // High contrast
    highContrast: true,
    whiteHighContrast: true,
    colorTheme: COLOR_THEMES.HIGH_CONTRAST,
    // Enlarged buttons
    enlargeButtons: true,
    // Additional helpful features
    textMagnifier: true,
    lineHeight: 2.2,
    letterSpacing: 0.6,
    highlightLinks: true,
    dictionary: true,
  },
  
  // Cognitive & Learning Profile - Reading aids, reduced motion, highlighted links
  [ACCESSIBILITY_PROFILES.COGNITIVE]: {
    // Reading aids
    readingLine: true,
    readingMask: false,
    dictionary: true,
    // Reduced motion
    reducedMotion: true,
    // Highlighted links
    highlightLinks: true,
    // Additional helpful features
    fontScale: 1.3,
    lineHeight: 2.0,
    letterSpacing: 0.3,
    colorTheme: COLOR_THEMES.LIGHT,
    enlargeButtons: true,
  },
  
  // Epilepsy Safe Profile - No animations, dark mode, reduced saturation
  [ACCESSIBILITY_PROFILES.EPILEPSY_SAFE]: {
    // No animations
    reducedMotion: true,
    // Dark mode
    colorTheme: COLOR_THEMES.DARK,
    // Reduced saturation
    lowSaturation: true,
    greyscale: false,
    // Additional helpful features
    hideImages: false,
    fontScale: 1.1,
    highlightLinks: true,
  },
  
  // ADHD Profile - Reading mask, focus mode, minimal distractions
  [ACCESSIBILITY_PROFILES.ADHD_FOCUS]: {
    // Reading mask for focus
    readingMask: true,
    readingLine: true,
    // Minimal distractions - hide images
    hideImages: true,
    // Focus mode - reduced motion
    reducedMotion: true,
    // Additional helpful features
    fontScale: 1.3,
    lineHeight: 2.0,
    highlightLinks: true,
    enlargeButtons: true,
    colorTheme: COLOR_THEMES.LIGHT,
  },
};

// Apply profile settings
export const applyProfile = (profile) => {
  if (profile === ACCESSIBILITY_PROFILES.NONE) {
    return DEFAULT_ACCESSIBILITY_STATE;
  }
  
  const profileConfig = PROFILE_CONFIGS[profile];
  return {
    ...DEFAULT_ACCESSIBILITY_STATE,
    ...profileConfig,
    activeProfile: profile,
  };
};

// Color theme values
export const COLOR_THEME_VALUES = {
  [COLOR_THEMES.LIGHT]: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#007AFF',
    secondary: '#5856D6',
    border: '#C7C7CC',
  },
  [COLOR_THEMES.DARK]: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    border: '#38383A',
  },
  [COLOR_THEMES.HIGH_CONTRAST]: {
    background: '#000000',
    text: '#FFFF00',
    primary: '#FFFFFF',
    secondary: '#00FF00',
    border: '#FFFFFF',
  },
  [COLOR_THEMES.SEPIA]: {
    background: '#F4ECD8',
    text: '#5C4B37',
    primary: '#8B4513',
    secondary: '#A0522D',
    border: '#D2B48C',
  },
};

// Calculate adjusted font size
export const getAdjustedFontSize = (baseFontSize, fontScale) => {
  return baseFontSize * fontScale;
};

// Calculate adjusted line height
export const getAdjustedLineHeight = (baseFontSize, lineHeightMultiplier, fontScale) => {
  return baseFontSize * fontScale * lineHeightMultiplier;
};

// Get button padding adjustment
export const getButtonPadding = (baseSize, enlargeButtons) => {
  return enlargeButtons ? baseSize * 1.5 : baseSize;
};

// Minimum touch target size (48dp)
export const MIN_TOUCH_TARGET = 48;

// Apply color inversion filter
export const applyColorInversion = (enabled) => {
  return enabled ? 'invert(100%)' : 'none';
};

// Apply greyscale filter
export const applyGreyscale = (enabled) => {
  return enabled ? 'grayscale(100%)' : 'none';
};
