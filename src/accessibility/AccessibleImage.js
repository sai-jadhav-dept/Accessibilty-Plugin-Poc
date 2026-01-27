import React, { useState } from 'react';
import { Image as RNImage, View, Text, StyleSheet, Pressable, Modal, Dimensions } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import Global from '../screens/Global';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOOLTIP_WIDTH = 250;
const TOOLTIP_MARGIN = 10;

/**
 * Accessibility-aware Image component
 * Respects hide images setting and provides alt text fallback
 * Shows alt text tooltip on press
 */
const AccessibleImage = ({ 
  source,
  style,
  alt = 'Image',
  showPlaceholder = true,
  showAltTextOnPress = true,
  ...props 
}) => {
  const { hideImages } = useAccessibility();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handlePress = (event) => {
    // Only show tooltip if imageDescription is enabled in Global settings
    if (!Global.accessibility.imageDescription) {
      return;
    }
    
    if (showAltTextOnPress && alt && alt !== 'Image') {
      const { pageX, pageY } = event.nativeEvent;
      
      // Calculate safe position to keep tooltip on screen
      let x = pageX + 10;
      let y = pageY - 30;
      
      // Check right boundary
      if (x + TOOLTIP_WIDTH > SCREEN_WIDTH - TOOLTIP_MARGIN) {
        x = SCREEN_WIDTH - TOOLTIP_WIDTH - TOOLTIP_MARGIN;
      }
      
      // Check left boundary
      if (x < TOOLTIP_MARGIN) {
        x = TOOLTIP_MARGIN;
      }
      
      // Check top boundary
      if (y < TOOLTIP_MARGIN) {
        y = pageY + 30; // Show below touch point instead
      }
      
      // Check bottom boundary
      if (y + 80 > SCREEN_HEIGHT - TOOLTIP_MARGIN) { // Approximate tooltip height
        y = pageY - 80;
      }
      
      setTooltipPosition({ x, y });
      setShowTooltip(true);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    }
  };

  if (hideImages) {
    if (!showPlaceholder) {
      return null;
    }
    
    return (
      <View style={[styles.placeholder, style]} accessible={true} accessibilityLabel={alt}>
        {/* <Text style={styles.placeholderText}>🖼️</Text> */}
        {/* <Text style={styles.altText}>{alt}</Text> */}
      </View>
    );
  }

  return (
    <>
      <Pressable onPress={handlePress} style={{ position: 'relative' }}>
        <RNImage 
          source={source}
          style={style}
          accessible={true}
          accessibilityLabel={alt}
          accessibilityRole="image"
          {...props}
        />
      </Pressable>
      
      {showTooltip && (
        <Modal transparent visible={showTooltip} animationType="fade">
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowTooltip(false)}
          >
            <View 
              style={[
                styles.tooltip, 
                { 
                  top: tooltipPosition.y, 
                  left: tooltipPosition.x 
                }
              ]}
            >
              <Text style={styles.tooltipText}>{alt}</Text>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    // backgroundColor: 'transparent',
    backgroundColor:  Colors.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#C7C7CC',
    // borderStyle: 'dashed',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AccessibleImage;
