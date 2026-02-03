import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import { getAdjustedFontSize, getAdjustedLineHeight } from './AccessibilityUtils';

/**
 * Accessibility-aware Text component
 * Automatically applies font scaling, line height, letter spacing, and text alignment
 */
const AccessibleText = ({ 
  style, 
  children, 
  baseFontSize = 14,
  ...props 
}) => {
  const { 
    fontScale, 
    lineHeight: lineHeightMultiplier, 
    letterSpacing: letterSpacingValue,
    textAlignment,
    textColor,
    nativeBoldText,
  } = useAccessibility();

  const adjustedFontSize = getAdjustedFontSize(baseFontSize, fontScale);
  const adjustedLineHeight = getAdjustedLineHeight(baseFontSize, lineHeightMultiplier, fontScale);

  const accessibilityStyles = {
    fontSize: adjustedFontSize,
    lineHeight: adjustedLineHeight,
    letterSpacing: letterSpacingValue,
    textAlign: textAlignment,
    ...(textColor && { color: textColor }),
    ...(nativeBoldText && { fontWeight: 'bold' }),
  };

  return (
    <RNText 
      style={[style, accessibilityStyles]} 
      {...props}
      accessible={true}
      accessibilityRole="text"
      allowFontScaling={true}
    >
      {children}
    </RNText>
  );
};

export default AccessibleText;
