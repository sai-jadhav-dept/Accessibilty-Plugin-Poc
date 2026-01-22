/**
 * AccessibilityColorWrapper.js
 * Applies accessibility color settings to the entire app
 * Works with React Native by changing StatusBar and providing visual feedback
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useAccessibility } from './AccessibilityContext';

const AccessibilityColorWrapper = ({ children, style }) => {
  const {
    colorTheme,
    colorInversion,
    greyscale,
    lowSaturation,
    highSaturation,
    highContrast,
  } = useAccessibility();

  // Determine if dark mode is active
  const isDarkMode = colorTheme === 'dark';
  const isHighContrast = highContrast || (colorTheme === 'light' && highContrast) || (colorTheme === 'dark' && highContrast);

  // Update StatusBar based on theme
  useEffect(() => {
    if (Platform.OS !== 'web') {
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(
          isDarkMode 
            ? (isHighContrast ? '#000000' : '#1E1E1E')
            : (isHighContrast ? '#FFFFFF' : '#F5F5F5'),
          true
        );
      }
    }
  }, [isDarkMode, isHighContrast]);

  // Calculate container style
  const containerStyle = useMemo(() => {
    const baseStyle = {
      flex: 1,
    };

    // Apply background color based on theme
    if (isDarkMode) {
      baseStyle.backgroundColor = isHighContrast ? '#000000' : '#1E1E1E';
    } else {
      baseStyle.backgroundColor = isHighContrast ? '#FFFFFF' : '#FFFFFF';
    }

    // For web, we can use CSS filters
    if (Platform.OS === 'web') {
      const filters = [];
      
      if (colorInversion) filters.push('invert(100%)');
      if (greyscale) filters.push('grayscale(100%)');
      if (lowSaturation) filters.push('saturate(30%)');
      if (highSaturation) filters.push('saturate(200%)');
      if (isHighContrast) filters.push('contrast(150%)');
      
      if (filters.length > 0) {
        baseStyle.filter = filters.join(' ');
      }
    }

    return baseStyle;
  }, [colorTheme, colorInversion, greyscale, lowSaturation, highSaturation, isHighContrast, isDarkMode]);

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

export default AccessibilityColorWrapper;
