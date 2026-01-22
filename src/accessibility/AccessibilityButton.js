import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import { MIN_TOUCH_TARGET } from './AccessibilityUtils';

const AccessibilityButton = () => {
  const { openModal, enlargeButtons } = useAccessibility();

  const buttonSize = enlargeButtons ? MIN_TOUCH_TARGET * 1.2 : MIN_TOUCH_TARGET;

  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
      ]}
      onPress={openModal}
      accessible={true}
      accessibilityLabel="Open Accessibility Menu"
      accessibilityHint="Opens a menu with accessibility options like text size, contrast, and display settings"
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Text style={[styles.buttonIcon, { fontSize: enlargeButtons ? 28 : 24 }]}>
          ♿
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 9999,
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AccessibilityButton;
