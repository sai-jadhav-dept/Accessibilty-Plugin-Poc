/**
 * NativeAccessibilityBridge.js
 * Bridge between React Native native accessibility features and custom implementation
 */

import { AccessibilityInfo, Platform } from 'react-native';

class NativeAccessibilityBridge {
  listeners = [];

  /**
   * Initialize native accessibility detection
   */
  async initialize(updateCallback) {
    try {
      // Detect Screen Reader
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // Detect Reduced Motion (iOS only)
      let reducedMotionEnabled = false;
      if (Platform.OS === 'ios') {
        reducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      }

      // Detect Bold Text (iOS only)
      let boldTextEnabled = false;
      if (Platform.OS === 'ios') {
        boldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      }

      // Detect Grayscale (iOS only)
      let grayscaleEnabled = false;
      if (Platform.OS === 'ios') {
        grayscaleEnabled = await AccessibilityInfo.isGrayscaleEnabled();
      }

      // Detect Invert Colors (iOS only)
      let invertColorsEnabled = false;
      if (Platform.OS === 'ios') {
        invertColorsEnabled = await AccessibilityInfo.isInvertColorsEnabled();
      }

      // Detect Reduce Transparency (iOS only)
      let reduceTransparencyEnabled = false;
      if (Platform.OS === 'ios') {
        reduceTransparencyEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
      }

      // Update with native settings
      updateCallback({
        nativeScreenReader: screenReaderEnabled,
        nativeReducedMotion: reducedMotionEnabled,
        nativeBoldText: boldTextEnabled,
        nativeGrayscale: grayscaleEnabled,
        nativeInvertColors: invertColorsEnabled,
        nativeReduceTransparency: reduceTransparencyEnabled,
      });

      // Setup listeners
      this.setupListeners(updateCallback);

      return {
        screenReaderEnabled,
        reducedMotionEnabled,
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
        reduceTransparencyEnabled,
      };
    } catch (error) {
      console.error('Error initializing native accessibility:', error);
      return null;
    }
  }

  /**
   * Setup event listeners for native accessibility changes
   */
  setupListeners(updateCallback) {
    // Screen Reader changed
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        updateCallback({ nativeScreenReader: enabled });
      }
    );
    this.listeners.push(screenReaderListener);

    // Reduced Motion changed (iOS)
    if (Platform.OS === 'ios') {
      const reducedMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => {
          updateCallback({ nativeReducedMotion: enabled });
        }
      );
      this.listeners.push(reducedMotionListener);

      // Bold Text changed
      const boldTextListener = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        (enabled) => {
          updateCallback({ nativeBoldText: enabled });
        }
      );
      this.listeners.push(boldTextListener);

      // Grayscale changed
      const grayscaleListener = AccessibilityInfo.addEventListener(
        'grayscaleChanged',
        (enabled) => {
          updateCallback({ nativeGrayscale: enabled });
        }
      );
      this.listeners.push(grayscaleListener);

      // Invert Colors changed
      const invertColorsListener = AccessibilityInfo.addEventListener(
        'invertColorsChanged',
        (enabled) => {
          updateCallback({ nativeInvertColors: enabled });
        }
      );
      this.listeners.push(invertColorsListener);
    }
  }

  /**
   * Announce message for screen readers
   */
  announce(message, options = {}) {
    AccessibilityInfo.announceForAccessibility(message);
  }

  /**
   * Announce message for screen readers (with queue option for iOS)
   */
  announceForAccessibilityWithOptions(message, options = {}) {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibilityWithOptions(
        message,
        options // { queue: true/false }
      );
    } else {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  /**
   * Set accessibility focus to a specific element
   */
  setAccessibilityFocus(reactTag) {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    this.listeners.forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      }
    });
    this.listeners = [];
  }
}

export default new NativeAccessibilityBridge();
