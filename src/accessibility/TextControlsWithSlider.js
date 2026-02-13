import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { useAccessibility } from './AccessibilityContext';

const FontSizeControlScreen = () => {
  const { fontScale, lineHeight, letterSpacing, updateSetting } = useAccessibility();

  // Convert fontScale (multiplier) to pixel offset for slider
  const baseFontSize = 16;
  const [fontSize, setFontSize] = useState(baseFontSize * fontScale);
  const [localLineHeight, setLocalLineHeight] = useState(lineHeight);
  const [localLetterSpacing, setLocalLetterSpacing] = useState(letterSpacing);
  const [activeControl, setActiveControl] = useState('biggerText'); // 'biggerText', 'lineHeight', or 'letterSpacing'

  // Sync with context on mount
  useEffect(() => {
    setFontSize(baseFontSize * fontScale);
    setLocalLineHeight(lineHeight);
    setLocalLetterSpacing(letterSpacing);
  }, [fontScale, lineHeight, letterSpacing]);

  const handleFontSizeChange = (value) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setFontSize(newValue);
    // Update context with new fontScale multiplier
    const newFontScale = newValue / baseFontSize;
    updateSetting('fontScale', newFontScale);
  };

  const handleLineHeightChange = (value) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setLocalLineHeight(newValue);
    updateSetting('lineHeight', newValue);
  };

  const handleLetterSpacingChange = (value) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setLocalLetterSpacing(newValue);
    updateSetting('letterSpacing', newValue);
  };

  const handleReset = () => {
    setFontSize(16);
    setLocalLineHeight(1.5);
    setLocalLetterSpacing(0);
    updateSetting('fontScale', 1.0);
    updateSetting('lineHeight', 1.5);
    updateSetting('letterSpacing', 0);
  };

  return (
    <View style={styles.container}>
      {/* Preview Text */}

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            activeControl === 'biggerText' && styles.controlButtonActive,
          ]}
          onPress={() => setActiveControl('biggerText')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.iconText, activeControl === 'biggerText' && styles.iconTextActive]}>T</Text>
          </View>
          <Text style={[styles.controlButtonText, activeControl === 'biggerText' && styles.controlButtonTextActive]}>
            Bigger Text
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            activeControl === 'lineHeight' && styles.controlButtonActive,
          ]}
          onPress={() => setActiveControl('lineHeight')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.iconText, activeControl === 'lineHeight' && styles.iconTextActive]}>☰</Text>
          </View>
          <Text style={[styles.controlButtonText, activeControl === 'lineHeight' && styles.controlButtonTextActive]}>
            Line Height
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            activeControl === 'letterSpacing' && styles.controlButtonActive,
          ]}
          onPress={() => setActiveControl('letterSpacing')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.iconText, activeControl === 'letterSpacing' && styles.iconTextActive, {paddingBottom:10, fontSize: 19}]}>⬌</Text>
          </View>
          <Text style={[styles.controlButtonText, activeControl === 'letterSpacing' && styles.controlButtonTextActive]}>
            Letter Spacing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slider Section */}
      <View style={styles.sliderSection}>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Aa</Text>

          <View style={styles.sliderWrapper} pointerEvents="box-none">
            {activeControl === 'biggerText' ? (
              <Slider
                containerStyle={styles.slider}
                minimumValue={12}
                maximumValue={30}
                step={1}
                value={fontSize}
                onValueChange={handleFontSizeChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5E5"
                thumbTintColor="#007AFF"
                trackStyle={{ height: 4, borderRadius: 2 }}
                thumbStyle={{ height: 28, width: 28, borderRadius: 14, backgroundColor: '#007AFF' }}
                animateTransitions={false}
              />
            ) : activeControl === 'lineHeight' ? (
              <Slider
                containerStyle={styles.slider}
                minimumValue={1.0}
                maximumValue={3.0}
                step={0.1}
                value={localLineHeight}
                onValueChange={handleLineHeightChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5E5"
                thumbTintColor="#007AFF"
                trackStyle={{ height: 4, borderRadius: 2 }}
                thumbStyle={{ height: 28, width: 28, borderRadius: 14, backgroundColor: '#007AFF' }}
                animateTransitions={false}
              />
            ) : (
              <Slider
                containerStyle={styles.slider}
                minimumValue={0}
                maximumValue={5}
                step={0.5}
                value={localLetterSpacing}
                onValueChange={handleLetterSpacingChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5E5"
                thumbTintColor="#007AFF"
                trackStyle={{ height: 4, borderRadius: 2 }}
                thumbStyle={{ height: 28, width: 28, borderRadius: 14, backgroundColor: '#007AFF' }}
                animateTransitions={false}
              />
            )}
          </View>

          <Text style={styles.sliderLabelRight}>Aa</Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetButtonText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FontSizeControlScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  previewText: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
    color: '#333',
    lineHeight: 28,
  },
  controlButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 15,
    // marginBottom: 40,
    // marginTop: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
    // width: "100%"
  },
  controlButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconTextActive: {
    color: '#fff',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: "100%"
    // flex: 1
  },
  controlButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sliderSection: {
    marginTop: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 20,
    fontWeight: '400',
    color: '#999',
  },
  sliderLabelRight: {
    fontSize: 24,
    fontWeight: '400',
    color: '#999',
  },
  sliderWrapper: {
    flex: 1,
    paddingVertical: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
});