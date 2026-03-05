const BASE_COLORS = {
  primaryButtonColor: '#8B63FF',
  secondarybuttonColor: '#FF974F',
  primaryTextColor: '#2D3142',
  primaryinactive: '#9c9eb9',
  textInputBorder: '#d6d9e0',
  successColor: '#4fab53',
  placeholderTextColor: '#A9B2C2',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  red: '#ff3b30',
  defaultBackground: '#FFFFFF',
  boxBackground: '#F4F6FA',
  lightblue: '#E4DFFF',
  lighter: '#F4F6FA'
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};

const rgbToHex = (r, g, b) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hx = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hx.length === 1 ? '0' + hx : hx;
      })
      .join('')
  );
};

const applyGrayscale = (hex) => {
  if (hex.startsWith('rgba')) return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return rgbToHex(gray, gray, gray);
};

const applySaturation = (hex, factor) => {
  if (hex.startsWith('rgba')) return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const gray = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return rgbToHex(
    gray + factor * (rgb.r - gray),
    gray + factor * (rgb.g - gray),
    gray + factor * (rgb.b - gray)
  );
};

const invertColor = (hex) => {
  if (hex.startsWith('rgba')) return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
};

const processColors = (colors, settings) => {
  if (!settings) return colors;

  let processed = { ...colors };

  if (settings.greyscale) {
    processed = Object.keys(processed).reduce((acc, key) => {
      acc[key] = applyGrayscale(processed[key]);
      return acc;
    }, {});
  }

  if (settings.lowSaturation && !settings.greyscale) {
    processed = Object.keys(processed).reduce((acc, key) => {
      acc[key] = key !== 'modalBackground' ? applySaturation(processed[key], 0.3) : processed[key];
      return acc;
    }, {});
  }

  if (settings.highSaturation && !settings.greyscale && !settings.lowSaturation) {
    processed = Object.keys(processed).reduce((acc, key) => {
      acc[key] = key !== 'modalBackground' ? applySaturation(processed[key], 2.0) : processed[key];
      return acc;
    }, {});
  }

  if (settings.colorInversion) {
    processed = Object.keys(processed).reduce((acc, key) => {
      acc[key] = key !== 'modalBackground' ? invertColor(processed[key]) : processed[key];
      return acc;
    }, {});
  }

  return processed;
};

export const getColors = (accessibilitySettings) => {
  const settings = accessibilitySettings || {};

  let colors = { ...BASE_COLORS };
  if (settings.colorTheme === 'dark' || settings.darkMode) {
    colors = {
      ...colors,
      primaryTextColor: '#FFFFFF',
      defaultBackground: '#1E1E1E',
      boxBackground: '#2C2C2E',
      textInputBorder: '#3A3A3C',
      placeholderTextColor: '#8E8E93',
      primaryinactive: '#6E6E73'
    };
  }

  if (settings.highContrast) {
    if (settings.colorTheme === 'dark' || settings.darkMode) {
      colors = {
        ...colors,
        defaultBackground: '#000000',
        primaryTextColor: '#FFFFFF',
        boxBackground: '#000000',
        primaryButtonColor: BASE_COLORS.primaryButtonColor,
        secondarybuttonColor: BASE_COLORS.secondarybuttonColor,
        textInputBorder: '#FFFFFF',
        successColor: '#00FF00',
        red: '#FF0000',
        lightblue: '#FFFFFF',
        primaryinactive: '#808080',
        placeholderTextColor: '#CCCCCC'
      };
    } else {
      colors = {
        ...colors,
        defaultBackground: '#FFFFFF',
        primaryTextColor: '#000000',
        boxBackground: '#FFFFFF',
        primaryButtonColor: BASE_COLORS.primaryButtonColor,
        secondarybuttonColor: BASE_COLORS.secondarybuttonColor,
        textInputBorder: '#000000',
        successColor: '#006600',
        red: '#CC0000'
      };
    }
  }

  const processedColors = processColors(colors, settings);
  processedColors.buttonTextColor = '#FFFFFF';

  if (settings.textColor) {
    processedColors.primaryTextColor = settings.textColor;
    processedColors.buttonTextColor = settings.textColor;
  }

  if (settings.backgroundColor) {
    processedColors.defaultBackground = settings.backgroundColor;
    if (!settings.textColor) {
      processedColors.buttonTextColor = '#FFFFFF';
    }
  }

  return processedColors;
};

export default BASE_COLORS;
