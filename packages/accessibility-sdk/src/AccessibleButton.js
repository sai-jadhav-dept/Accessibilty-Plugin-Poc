import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import { getButtonPadding, MIN_TOUCH_TARGET } from './AccessibilityUtils';

/**
 * Accessibility-aware Button component
 * Automatically applies enlarged touch targets and respects reduced motion settings
 */
const AccessibleButton = ({ 
  style, 
  children, 
  basePadding = 12,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...props 
}) => {
  const { enlargeButtons, reducedMotion, nativeReducedMotion } = useAccessibility();

  // Use native reduced motion if available
  const shouldReduceMotion = reducedMotion || nativeReducedMotion;

  const adjustedPadding = getButtonPadding(basePadding, enlargeButtons);
  const minHeight = enlargeButtons ? MIN_TOUCH_TARGET : 40;

  const accessibilityStyles = {
    paddingVertical: adjustedPadding,
    paddingHorizontal: adjustedPadding * 1.5,
    minHeight: minHeight,
    minWidth: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Respect reduced motion preference
  const activeOpacity = shouldReduceMotion ? 1 : 0.7;

  return (
    <TouchableOpacity 
      style={[styles.button, style, accessibilityStyles, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AccessibleButton;
