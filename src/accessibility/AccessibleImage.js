import React from 'react';
import { Image as RNImage, View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityContext';

/**
 * Accessibility-aware Image component
 * Respects hide images setting and provides alt text fallback
 */
const AccessibleImage = ({ 
  source,
  style,
  alt = 'Image',
  showPlaceholder = true,
  ...props 
}) => {
  const { hideImages } = useAccessibility();

  if (hideImages) {
    if (!showPlaceholder) {
      return null;
    }
    
    return (
      <View style={[styles.placeholder, style]} accessible={true} accessibilityLabel={alt}>
        <Text style={styles.placeholderText}>🖼️</Text>
        <Text style={styles.altText}>{alt}</Text>
      </View>
    );
  }

  return (
    <RNImage 
      source={source}
      style={style}
      accessible={true}
      accessibilityLabel={alt}
      accessibilityRole="image"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    padding: 16,
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  altText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default AccessibleImage;
