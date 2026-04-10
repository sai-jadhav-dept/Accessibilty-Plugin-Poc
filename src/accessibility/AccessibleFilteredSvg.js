/**
 * AccessibleFilteredSvg.js
 * Accessibility + tooltip wrapper for SVG components
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Modal,
    Dimensions,
} from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import Colors, { getColors } from '../utils/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get('window');

const TOOLTIP_WIDTH = 250;
const TOOLTIP_MARGIN = 10;

const AccessibleFilteredSvg = ({
    SvgComponent,
    style,
    width,
    height,
    alt = 'SVG Image',
    showPlaceholder = true,
    showAltTextOnPress = true,
    svgProps = {},
    fillColorKey = 'primaryTextColor',
    strokeColorKey = 'primaryTextColor',
    ...props
}) => {
    const accessibilitySettings = useAccessibility();

    const {
        hideImages,
        imageDescription,
    } = accessibilitySettings;

    const colors = getColors(accessibilitySettings);

    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({
        x: 0,
        y: 0,
    });

    const handlePress = (event) => {
        if (!imageDescription) return;

        if (showAltTextOnPress && alt && alt !== 'SVG Image') {
            const { pageX, pageY } = event.nativeEvent;

            let x = pageX + 10;
            let y = pageY - 30;

            if (
                x + TOOLTIP_WIDTH >
                SCREEN_WIDTH - TOOLTIP_MARGIN
            ) {
                x =
                    SCREEN_WIDTH -
                    TOOLTIP_WIDTH -
                    TOOLTIP_MARGIN;
            }

            if (x < TOOLTIP_MARGIN) {
                x = TOOLTIP_MARGIN;
            }

            if (y < TOOLTIP_MARGIN) {
                y = pageY + 30;
            }

            if (
                y + 80 >
                SCREEN_HEIGHT - TOOLTIP_MARGIN
            ) {
                y = pageY - 80;
            }

            setTooltipPosition({ x, y });
            setShowTooltip(true);

            setTimeout(() => {
                setShowTooltip(false);
            }, 3000);
        }
    };

    // Hide SVGs if accessibility setting is enabled
    if (hideImages) {
        if (!showPlaceholder) return null;

        return (
            <View
                style={[styles.placeholder, style]}
                accessible={true}
                accessibilityLabel={alt}
            />
        );
    }

    const fillColor =
        colors[fillColorKey] ||
        colors.primaryTextColor;

    const strokeColor =
        colors[strokeColorKey] ||
        colors.primaryTextColor;

    const renderedSvg = (
        <View
            accessible={true}
            accessibilityLabel={alt}
            accessibilityRole="image"
            style={style}
        >
            <SvgComponent
                width={width}
                height={height}
                fill={fillColor}
                stroke={strokeColor}
                {...svgProps}
                {...props}
            />
        </View>
    );

    return (
        <>
            <Pressable
                onPress={handlePress}
                style={{ position: 'relative' }}
            >
                {renderedSvg}
            </Pressable>

            {showTooltip && (
                <Modal
                    transparent
                    visible={showTooltip}
                    animationType="fade"
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() =>
                            setShowTooltip(false)
                        }
                    >
                        <View
                            style={[
                                styles.tooltip,
                                {
                                    top: tooltipPosition.y,
                                    left: tooltipPosition.x,
                                },
                            ]}
                        >
                            <Text
                                style={
                                    styles.tooltipText
                                }
                            >
                                {alt}
                            </Text>
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
        backgroundColor:
            'rgba(0, 0, 0, 0.85)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        maxWidth: 250,
        elevation: 8,
    },
    tooltipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default AccessibleFilteredSvg;