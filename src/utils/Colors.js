/**
 * Colors.js
 * Dynamic color provider that respects accessibility settings
 */

// Base color definitions
const BASE_COLORS = {
    primaryButtonColor: '#8B63FF',
    secondarybuttonColor: '#FF974F',
    primaryTextColor: '#2D3142',
    primaryinactive: '#9c9eb9',
    textInputBorder: '#d6d9e0',
    successColor: '#4fab53',
    placeholderTextColor: "#A9B2C2",
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    red: "#ff3b30",
    defaultBackground: '#FFFFFF',
    boxBackground: '#F4F6FA', 
    lightblue: '#E4DFFF',
};

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
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

// Apply grayscale to a color
const applyGrayscale = (hex) => {
    if (hex.startsWith('rgba')) return hex; // Skip rgba colors
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
    return rgbToHex(gray, gray, gray);
};

// Apply saturation adjustment
const applySaturation = (hex, factor) => {
    if (hex.startsWith('rgba')) return hex; // Skip rgba colors
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const gray = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    const r = gray + factor * (rgb.r - gray);
    const g = gray + factor * (rgb.g - gray);
    const b = gray + factor * (rgb.b - gray);
    
    return rgbToHex(r, g, b);
};

// Invert a color
const invertColor = (hex) => {
    if (hex.startsWith('rgba')) return hex; // Skip rgba colors
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
};

// Process colors based on accessibility settings
const processColors = (colors, settings) => {
    if (!settings) return colors;

    let processed = { ...colors };

    // Apply grayscale
    if (settings.greyscale) {
        processed = Object.keys(processed).reduce((acc, key) => {
            acc[key] = applyGrayscale(processed[key]);
            return acc;
        }, {});
    }

    // Apply saturation adjustments
    if (settings.lowSaturation && !settings.greyscale) {
        processed = Object.keys(processed).reduce((acc, key) => {
            if (key !== 'modalBackground') {
                acc[key] = applySaturation(processed[key], 0.3);
            } else {
                acc[key] = processed[key];
            }
            return acc;
        }, {});
    }

    if (settings.highSaturation && !settings.greyscale && !settings.lowSaturation) {
        processed = Object.keys(processed).reduce((acc, key) => {
            if (key !== 'modalBackground') {
                acc[key] = applySaturation(processed[key], 2.0);
            } else {
                acc[key] = processed[key];
            }
            return acc;
        }, {});
    }

    // Apply color inversion
    if (settings.colorInversion) {
        processed = Object.keys(processed).reduce((acc, key) => {
            if (key !== 'modalBackground') {
                acc[key] = invertColor(processed[key]);
            } else {
                acc[key] = processed[key];
            }
            return acc;
        }, {});
    }

    return processed;
};

// Get colors with accessibility transformations applied
export const getColors = (accessibilitySettings) => {
    const settings = accessibilitySettings || {};
    
    // Apply dark mode first
    let colors = { ...BASE_COLORS };
    if (settings.colorTheme === 'dark' || settings.darkMode) {
        colors = {
            ...colors,
            primaryTextColor: '#FFFFFF',
            defaultBackground: '#1E1E1E',
            boxBackground: '#2C2C2E',
            textInputBorder: '#3A3A3C',
            placeholderTextColor: '#8E8E93',
            primaryinactive: '#6E6E73',
        };
    }

    // Apply high contrast
    if (settings.highContrast) {
        if (settings.colorTheme === 'dark' || settings.darkMode) {
            // Dark high contrast
            if (settings.darkHighContrast) {
                colors = {
                    ...colors,
                    defaultBackground: '#000000',
                    primaryTextColor: '#FFFFFF',
                    boxBackground: '#1A1A1A',
                    primaryButtonColor: '#FFFFFF',
                    secondarybuttonColor: '#FFFF00',
                    textInputBorder: '#FFFFFF',
                };
            }
        } else {
            // White/Light high contrast
            if (settings.whiteHighContrast) {
                colors = {
                    ...colors,
                    defaultBackground: '#FFFFFF',
                    primaryTextColor: '#000000',
                    boxBackground: '#F5F5F5',
                    primaryButtonColor: '#0000FF',
                    secondarybuttonColor: '#000080',
                    textInputBorder: '#000000',
                };
            }
        }
    }

    // Apply color filters (grayscale, saturation, inversion)
    return processColors(colors, settings);
};

// Export default for backward compatibility (returns base colors)
export default BASE_COLORS;

