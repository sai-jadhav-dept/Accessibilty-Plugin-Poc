/**
 * FilteredImage.js
 * Reusable component that applies accessibility color filters to images
 */

import React from 'react';
import { Image } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import {
    Grayscale,
    Saturate,
    Invert,
    Brightness,
    Contrast,
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
    
    // Apply dark high contrast
    if (darkHighContrast) {
        return (
            <Contrast amount={1.5}>
                <Brightness amount={0.8}>
                    <Image
                        source={source}
                        style={style}
                        resizeMode={resizeMode}
                        {...props}
                    />
                </Brightness>
            </Contrast>
        );
    }
    
    // Apply white high contrast
    if (whiteHighContrast) {
        return (
            <Contrast amount={1.5}>
                <Brightness amount={1.2}>
                    <Image
                        source={source}
                        style={style}
                        resizeMode={resizeMode}
                        {...props}
                    />
                </Brightness>
            </Contrast>
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
