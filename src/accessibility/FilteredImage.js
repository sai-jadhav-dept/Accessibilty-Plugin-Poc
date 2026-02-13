/**
 * FilteredImage.js
 * Reusable component that applies accessibility color filters to images
 */

import React from 'react';
import { Image, Platform } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import {
    Grayscale,
    Saturate,
    Invert,
    Brightness,
    Contrast,
    ColorMatrix,
} from 'react-native-color-matrix-image-filters';

const FilteredImage = ({ source, style, resizeMode = 'contain', ...props }) => {
    const { 
        colorInversion, 
        greyscale, 
        lowSaturation, 
        highSaturation, 
        whiteHighContrast, 
        darkHighContrast 
    } = useAccessibility();
    
    // Apply greyscale
    if (greyscale) {
        return (
            <Grayscale>
                <Image
                    source={source}
                    style={style}
                    resizeMode={resizeMode}
                    {...props}
                />
            </Grayscale>
        );
    }
    
    // Apply color inversion
    if (colorInversion) {
        return (
            <Invert>
                <Image
                    source={source}
                    style={style}
                    resizeMode={resizeMode}
                    {...props}
                />
            </Invert>
        );
    }
    
    // Apply low saturation (30%)
    if (lowSaturation) {
        return (
            <Saturate amount={0.3}>
                <Image
                    source={source}
                    style={style}
                    resizeMode={resizeMode}
                    {...props}
                />
            </Saturate>
        );
    }
    
    // Apply high saturation (200%)
    if (highSaturation) {
        return (
            <Saturate amount={2.0}>
                <Image
                    source={source}
                    style={style}
                    resizeMode={resizeMode}
                    {...props}
                />
            </Saturate>
        );
    }
    
    // Apply dark high contrast - strong contrast + saturation like high saturation mode
    if (darkHighContrast) {
        // On iOS, use simplified filter to avoid rendering issues
        if (Platform.OS === 'ios') {
            return (
                <Saturate amount={2.0}>
                    <Contrast amount={1.5}>
                        <Image
                            source={source}
                            style={style}
                            resizeMode={resizeMode}
                            {...props}
                        />
                    </Contrast>
                </Saturate>
            );
        }
        // Android can handle all three filters
        return (
            <Saturate amount={2.0}>
                <Contrast amount={2.0}>
                    <Brightness amount={0.9}>
                        <Image
                            source={source}
                            style={style}
                            resizeMode={resizeMode}
                            {...props}
                        />
                    </Brightness>
                </Contrast>
            </Saturate>
        );
    }
    
    // Apply white high contrast - strong contrast + saturation
    if (whiteHighContrast) {
        // On iOS, use simplified filter to avoid rendering issues
        if (Platform.OS === 'ios') {
            return (
                <Saturate amount={2.0}>
                    <Contrast amount={1.5}>
                        <Image
                            source={source}
                            style={style}
                            resizeMode={resizeMode}
                            {...props}
                        />
                    </Contrast>
                </Saturate>
            );
        }
        // Android can handle all three filters
        return (
            <Saturate amount={2.0}>
                <Contrast amount={2.0}>
                    <Brightness amount={1.1}>
                        <Image
                            source={source}
                            style={style}
                            resizeMode={resizeMode}
                            {...props}
                        />
                    </Brightness>
                </Contrast>
            </Saturate>
        );
    }
    
    // No filter - normal image
    return (
        <Image
            source={source}
            style={style}
            resizeMode={resizeMode}
            {...props}
        />
    );
};

export default FilteredImage;
