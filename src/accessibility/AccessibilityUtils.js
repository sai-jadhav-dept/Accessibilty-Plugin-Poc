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

// Profile configurations
export const PROFILE_CONFIGS = {
  [ACCESSIBILITY_PROFILES.BLIND]: {
    fontScale: 1.2,
    highContrast: true,
    textToSpeech: true,
    screenReader: true,
    reducedMotion: true,
    enlargeButtons: true,
    colorTheme: COLOR_THEMES.HIGH_CONTRAST,
    hideImages: true,
    highlightLinks: true,
  },
  [ACCESSIBILITY_PROFILES.DYSLEXIA]: {
    fontScale: 1.4,
    lineHeight: 2.2,
    letterSpacing: 0.4,
    highlightLinks: true,
    enlargeButtons: true,
    colorTheme: COLOR_THEMES.LIGHT,
    textAlignment: TEXT_ALIGNMENT.LEFT,
  },
  [ACCESSIBILITY_PROFILES.LOW_VISION]: {
    fontScale: 1.6,
    highContrast: true,
    whiteHighContrast: true,
    textMagnifier: true,
    enlargeButtons: true,
    lineHeight: 2.0,
    letterSpacing: 0.5,
    colorTheme: COLOR_THEMES.HIGH_CONTRAST,
    highlightLinks: true,
  },
  [ACCESSIBILITY_PROFILES.COGNITIVE]: {
    fontScale: 1.3,
    reducedMotion: true,
    highlightLinks: true,
    lineHeight: 2.0,
    letterSpacing: 0.3,
    colorTheme: COLOR_THEMES.LIGHT,
    readingLine: true,
    hideImages: false,
  },
  [ACCESSIBILITY_PROFILES.EPILEPSY_SAFE]: {
    reducedMotion: true,
    colorTheme: COLOR_THEMES.DARK,
    hideImages: false,
    lowSaturation: true,
    greyscale: false,
  },
  [ACCESSIBILITY_PROFILES.ADHD_FOCUS]: {
    readingMask: true,
    reducedMotion: true,
    hideImages: true,
    fontScale: 1.2,
    lineHeight: 1.8,
    highlightLinks: true,
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
