/**
 * AccessibleFilteredImage.js
 * Unified component combining color filters and accessibility features
 * Combines FilteredImage (color matrix filters) and AccessibleImage (hide images, tooltips)
 */

import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, Pressable, Modal, Dimensions } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import Colors from '../utils/Colors';
import {
    Grayscale,
    Saturate,
    Invert,
    Brightness,
    Contrast,
} from 'react-native-color-matrix-image-filters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOOLTIP_WIDTH = 250;
const TOOLTIP_MARGIN = 10;

const AccessibleFilteredImage = ({ 
    source,
    style,
    resizeMode = 'contain',
    alt = 'Image',
    showPlaceholder = true,
    showAltTextOnPress = true,
    ...props 
}) => {
    const { 
        hideImages,
        imageDescription,
        colorInversion, 
        greyscale, 
        lowSaturation, 
        highSaturation, 
        whiteHighContrast, 
        darkHighContrast 
    } = useAccessibility();

    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const handlePress = (event) => {
        // Only show tooltip if image descriptions are enabled
        if (!imageDescription) {
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

    // Handle hideImages accessibility setting
    if (hideImages) {
        if (!showPlaceholder) {
            return null;
        }
        
        return (
            <View style={[styles.placeholder, style]} accessible={true} accessibilityLabel={alt}>
                {/* Placeholder when images are hidden */}
            </View>
        );
    }

    // Create the base image component with accessibility features
    const baseImage = (
        <Image 
            source={source}
            style={style}
            resizeMode={resizeMode}
            accessible={true}
            accessibilityLabel={alt}
            accessibilityRole="image"
            {...props}
        />
    );

    // Apply color filters based on accessibility settings
    let filteredImage = baseImage;

    if (greyscale) {
        filteredImage = <Grayscale>{baseImage}</Grayscale>;
    } else if (colorInversion) {
        filteredImage = <Invert>{baseImage}</Invert>;
    } else if (lowSaturation) {
        filteredImage = <Saturate amount={0.3}>{baseImage}</Saturate>;
    } else if (highSaturation) {
        filteredImage = <Saturate amount={2.0}>{baseImage}</Saturate>;
    } else if (darkHighContrast) {
        filteredImage = (
            <Contrast amount={1.5}>
                <Brightness amount={0.8}>
                    {baseImage}
                </Brightness>
            </Contrast>
        );
    } else if (whiteHighContrast) {
        filteredImage = (
            <Contrast amount={1.5}>
                <Brightness amount={1.2}>
                    {baseImage}
                </Brightness>
            </Contrast>
        );
    }

    return (
        <>
            <Pressable onPress={handlePress} style={{ position: 'relative' }}>
                {filteredImage}
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
        backgroundColor: Colors.boxBackground,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
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

export default AccessibleFilteredImage;
