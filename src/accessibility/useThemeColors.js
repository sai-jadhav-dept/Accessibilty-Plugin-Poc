/**
 * useThemeColors.js
 * Hook to get dynamic colors based on accessibility settings
 */

import { useMemo } from 'react';
import { useAccessibility } from './AccessibilityContext';

// Helper to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Helper to convert RGB to hex
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Apply grayscale to a color
const applyGrayscale = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return rgbToHex(gray, gray, gray);
};

// Apply saturation adjustment
const applySaturation = (hex, factor) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const gray = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  const r = Math.max(0, Math.min(255, gray + factor * (rgb.r - gray)));
  const g = Math.max(0, Math.min(255, gray + factor * (rgb.g - gray)));
  const b = Math.max(0, Math.min(255, gray + factor * (rgb.b - gray)));
  
  return rgbToHex(r, g, b);
};

// Invert a color
const invertColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
};

export const useThemeColors = () => {
  const {
    colorTheme,
    highContrast,
    colorInversion,
    greyscale,
    lowSaturation,
    highSaturation,
  } = useAccessibility();

  const colors = useMemo(() => {
    const isDark = colorTheme === 'dark';
    
    // Base colors
    let baseColors;
    
    if (highContrast) {
      // High contrast colors
      if (isDark) {
        baseColors = {
          background: '#000000',
          text: '#FFFFFF',
          primary: '#FFFFFF',
          secondary: '#FFFF00',
          border: '#FFFFFF',
          card: '#1A1A1A',
          placeholder: '#CCCCCC',
        };
      } else {
        baseColors = {
          background: '#FFFFFF',
          text: '#000000',
          primary: '#0000FF',
          secondary: '#000080',
          border: '#000000',
          card: '#F5F5F5',
          placeholder: '#666666',
        };
      }
    } else {
      // Normal colors
      if (isDark) {
        baseColors = {
          background: '#1E1E1E',
          text: '#FFFFFF',
          primary: '#007AFF',
          secondary: '#5856D6',
          border: '#3A3A3C',
          card: '#2C2C2E',
          placeholder: '#8E8E93',
        };
      } else {
        baseColors = {
          background: '#FFFFFF',
          text: '#000000',
          primary: '#007AFF',
          secondary: '#5856D6',
          border: '#C7C7CC',
          card: '#F2F2F7',
          placeholder: '#8E8E93',
        };
      }
    }

    // Apply color transformations
    let processedColors = { ...baseColors };

    // Apply grayscale
    if (greyscale) {
      processedColors = Object.keys(processedColors).reduce((acc, key) => {
        acc[key] = applyGrayscale(processedColors[key]);
        return acc;
      }, {});
    }

    // Apply saturation adjustments
    if (lowSaturation && !greyscale) {
      processedColors = Object.keys(processedColors).reduce((acc, key) => {
        if (key !== 'background' && key !== 'text') {
          acc[key] = applySaturation(processedColors[key], 0.3);
        } else {
          acc[key] = processedColors[key];
        }
        return acc;
      }, {});
    }

    if (highSaturation && !greyscale && !lowSaturation) {
      processedColors = Object.keys(processedColors).reduce((acc, key) => {
        if (key !== 'background' && key !== 'text') {
          acc[key] = applySaturation(processedColors[key], 2.0);
        } else {
          acc[key] = processedColors[key];
        }
        return acc;
      }, {});
    }

    // Apply color inversion
    if (colorInversion) {
      processedColors = Object.keys(processedColors).reduce((acc, key) => {
        acc[key] = invertColor(processedColors[key]);
        return acc;
      }, {});
    }

    return processedColors;
  }, [colorTheme, highContrast, colorInversion, greyscale, lowSaturation, highSaturation]);

  return colors;
};

export default useThemeColors;
