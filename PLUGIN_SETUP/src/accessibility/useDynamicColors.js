/**
 * useDynamicColors.js
 * Hook to get colors that respect accessibility settings
 */

import { useMemo } from 'react';
import { useAccessibility } from './AccessibilityContext';
import { getColors } from '../utils/Colors';

export const useDynamicColors = () => {
  const accessibilitySettings = useAccessibility();

  const colors = useMemo(() => {
    return getColors(accessibilitySettings);
  }, [
    accessibilitySettings.colorTheme,
    accessibilitySettings.darkMode,
    accessibilitySettings.highContrast,
    accessibilitySettings.darkHighContrast,
    accessibilitySettings.whiteHighContrast,
    accessibilitySettings.colorInversion,
    accessibilitySettings.greyscale,
    accessibilitySettings.lowSaturation,
    accessibilitySettings.highSaturation,
    accessibilitySettings.textColor,
    accessibilitySettings.backgroundColor,
  ]);

  return colors;
};

export default useDynamicColors;
