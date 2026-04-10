/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import { getButtonPadding, MIN_TOUCH_TARGET } from './AccessibilityUtils';
import Global from '../screens/Global';

/**
 * Accessibility-first TouchableOpacity wrapper for buttons.
 * Includes enlarged touch targets, reduced-motion support, and multi-tap guard.
 */
const AccessibleTouchableOpacity = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  style,
  disabled = false,
  basePadding = 10,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityLanguage,
  accessibilityValue,
  activeOpacity = 0.7,
  minTouchTarget = MIN_TOUCH_TARGET,
  preventMultiTap = true,
  announceOnPress,
  testID,
  ...props
}) => {
  const {
    enlargeButtons,
    reducedMotion,
    nativeReducedMotion,
    highlightLinks,
    accentColor,
    announce,
  } = useAccessibility();

  const shouldReduceMotion = reducedMotion || nativeReducedMotion;
  const adjustedPadding = getButtonPadding(basePadding, enlargeButtons);

  const accessibleStyles = {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    paddingVertical: adjustedPadding,
    paddingHorizontal: adjustedPadding * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const highlightedStyle = highlightLinks
    ? {
        borderWidth: 2,
        borderColor: accentColor || '#007AFF',
      }
    : null;

  const handlePress = useCallback(async () => {
    if (disabled || typeof onPress !== 'function') {
      return;
    }

    if (preventMultiTap) {
      if (Global.clicked) {
        return;
      }
      Global.clicked = true;
    }

    try {
      await onPress();

      if (announceOnPress) {
        announce(announceOnPress);
      }
    } finally {
      if (preventMultiTap) {
        Global.clicked = false;
      }
    }
  }, [disabled, onPress, preventMultiTap, announceOnPress, announce]);

  return (
    <TouchableOpacity
      style={[style, accessibleStyles, highlightedStyle, disabled && { opacity: 0.5 }]}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={shouldReduceMotion ? 1 : activeOpacity}
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityLanguage={accessibilityLanguage}
      accessibilityValue={accessibilityValue}
      accessibilityState={{ disabled, ...accessibilityState }}
      testID={testID}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default AccessibleTouchableOpacity;
