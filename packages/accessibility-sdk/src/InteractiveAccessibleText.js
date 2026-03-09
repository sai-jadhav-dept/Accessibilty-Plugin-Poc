import React from 'react';
import { Text as RNText } from 'react-native';
import AccessibilityTextWrapper from './AccessibilityTextWrapper';
import { useAccessibility } from './AccessibilityContext';
import { getAdjustedFontSize, getAdjustedLineHeight } from './AccessibilityUtils';

const InteractiveAccessibleText = ({
  children,
  dictionaryEnabled,
  textMagnifierEnabled,
  ...textProps
}) => {
  const {
    fontScale,
    lineHeight: lineHeightMultiplier,
    letterSpacing: letterSpacingValue,
    textAlignment,
    textColor,
    nativeBoldText,
  } = useAccessibility();

  const adjustedFontSize = getAdjustedFontSize(textProps.baseFontSize ?? 14, fontScale);
  const adjustedLineHeight = getAdjustedLineHeight(
    textProps.baseFontSize ?? 14,
    lineHeightMultiplier,
    fontScale
  );

  const accessibilityStyles = {
    fontSize: adjustedFontSize,
    lineHeight: adjustedLineHeight,
    letterSpacing: letterSpacingValue,
    textAlign: textAlignment,
    ...(textColor && { color: textColor }),
    ...(nativeBoldText && { fontWeight: 'bold' }),
  };

  const { baseFontSize, style, ...restTextProps } = textProps;

  return (
    <AccessibilityTextWrapper
      dictionaryEnabled={dictionaryEnabled}
      textMagnifierEnabled={textMagnifierEnabled}
    >
      <RNText
        {...restTextProps}
        style={[style, accessibilityStyles]}
        accessible={true}
        accessibilityRole="text"
        allowFontScaling={true}
      >
        {children}
      </RNText>
    </AccessibilityTextWrapper>
  );
};

export default InteractiveAccessibleText;