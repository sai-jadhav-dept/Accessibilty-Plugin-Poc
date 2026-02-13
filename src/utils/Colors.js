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

// Helper to determine if a color is light or dark
const isLightColor = (hex) => {
    if (hex.startsWith('rgba')) return true; // Default to light for rgba
    const rgb = hexToRgb(hex);
    if (!rgb) return true;
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5;
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
            // Dark high contrast - HDFC Bank style: white text on black background
            colors = {
                ...colors,
                defaultBackground: '#000000', // Pure black background
                primaryTextColor: '#FFFFFF', // White text (HDFC Bank standard)
                boxBackground: '#000000', // Pure black for box elements
                // Keep original button colors for brand consistency
                primaryButtonColor: BASE_COLORS.primaryButtonColor, // Original purple
                secondarybuttonColor: BASE_COLORS.secondarybuttonColor, // Original orange
                textInputBorder: '#FFFFFF', // White borders
                successColor: '#00FF00', // Bright green for success
                red: '#FF0000', // Pure red for errors/alerts
                lightblue: '#FFFFFF', // White
                primaryinactive: '#808080', // Gray for inactive
                placeholderTextColor: '#CCCCCC', // Light gray for placeholders
            };
        } else {
            // White/Light high contrast - HDFC Bank style: black text on white background
            colors = {
                ...colors,
                defaultBackground: '#FFFFFF', // Pure white background
                primaryTextColor: '#000000', // Black text
                boxBackground: '#FFFFFF', // Pure white for box elements
                // Keep original button colors for brand consistency
                primaryButtonColor: BASE_COLORS.primaryButtonColor, // Original purple
                secondarybuttonColor: BASE_COLORS.secondarybuttonColor, // Original orange
                textInputBorder: '#000000', // Black borders
                successColor: '#006600', // Dark green for success
                red: '#CC0000', // Dark red for errors
            };
        }
    }

    // Apply color filters (grayscale, saturation, inversion)
    const processedColors = processColors(colors, settings);
    
    // Set button text color to contrast with button background (not screen background)
    // Default button text color should be white for better contrast with colored buttons
    if (settings.highContrast && (settings.colorTheme === 'dark' || settings.darkMode)) {
        // Dark high contrast mode - white text on original colored buttons
        processedColors.buttonTextColor = '#FFFFFF'; // White text on colored buttons
    } else if (settings.highContrast) {
        // Light high contrast mode - white text on original colored buttons
        processedColors.buttonTextColor = '#FFFFFF'; // White text on colored buttons
    } else if (settings.colorTheme === 'dark' || settings.darkMode) {
        // In dark mode, use white text for buttons
        processedColors.buttonTextColor = '#FFFFFF';
    } else {
        // In light mode, use white text for buttons (works well with colored button backgrounds)
        processedColors.buttonTextColor = '#FFFFFF';
    }
    
    // Apply custom text and background color overrides (these take priority)
    if (settings.textColor) {
        processedColors.primaryTextColor = settings.textColor;
        // Only override button text if user explicitly set a text color
        processedColors.buttonTextColor = settings.textColor;
    }
    
    if (settings.backgroundColor) {
        processedColors.defaultBackground = settings.backgroundColor;
        // If background is set but text isn't, ensure button text contrasts
        if (!settings.textColor) {
            // Keep white for buttons regardless of screen background
            // since buttons have their own colored backgrounds
            processedColors.buttonTextColor = '#FFFFFF';
        }
    }
    
    return processedColors;
};

// Export default for backward compatibility (returns base colors)
export default BASE_COLORS;

