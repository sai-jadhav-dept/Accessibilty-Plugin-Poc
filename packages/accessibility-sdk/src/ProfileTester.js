/**
 * Profile Test Component
 * 
 * This component can be temporarily added to your app to verify
 * that all accessibility profiles are working correctly.
 * 
 * Usage:
 * 1. Import this component in your App.js or main screen
 * 2. Add <ProfileTester /> to your render method
 * 3. Test each profile and verify the output
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAccessibility } from './AccessibilityContext';
import { ACCESSIBILITY_PROFILES } from './AccessibilityUtils';

const ProfileTester = () => {
  const {
    activeProfile,
    fontScale,
    lineHeight,
    letterSpacing,
    highContrast,
    hideImages,
    enlargeButtons,
    reducedMotion,
    highlightLinks,
    readingMask,
    readingLine,
    textMagnifier,
    textToSpeech,
    dictionary,
    screenReader,
    colorTheme,
    lowSaturation,
    whiteHighContrast,
    setProfile,
  } = useAccessibility();

  const profileNames = {
    [ACCESSIBILITY_PROFILES.NONE]: 'None (Default)',
    [ACCESSIBILITY_PROFILES.BLIND]: 'Blindness',
    [ACCESSIBILITY_PROFILES.LOW_VISION]: 'Visually Impaired',
    [ACCESSIBILITY_PROFILES.COGNITIVE]: 'Cognitive & Learning',
    [ACCESSIBILITY_PROFILES.EPILEPSY_SAFE]: 'Epilepsy Safe',
    [ACCESSIBILITY_PROFILES.ADHD_FOCUS]: 'ADHD Focus',
  };

  const renderFeatureStatus = (feature, value) => {
    const displayValue = typeof value === 'boolean' 
      ? (value ? '✅ ON' : '❌ OFF')
      : `📊 ${value}`;
      
    return (
      <View style={styles.featureRow} key={feature}>
        <Text style={styles.featureLabel}>{feature}:</Text>
        <Text style={styles.featureValue}>{displayValue}</Text>
      </View>
    );
  };

  const renderProfileButton = (profileKey) => {
    const isActive = activeProfile === profileKey;
    return (
      <TouchableOpacity
        key={profileKey}
        style={[styles.profileTestButton, isActive && styles.activeProfileButton]}
        onPress={() => setProfile(profileKey)}
      >
        <Text style={[styles.profileButtonText, isActive && styles.activeProfileText]}>
          {isActive && '✓ '}{profileNames[profileKey]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Profile Tester</Text>
        <Text style={styles.subtitle}>Current Profile: {profileNames[activeProfile]}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Profile Switcher</Text>
        <View style={styles.buttonGrid}>
          {Object.values(ACCESSIBILITY_PROFILES).map(renderProfileButton)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Features Status</Text>
        
        <Text style={styles.categoryTitle}>Text & Typography</Text>
        {renderFeatureStatus('Font Scale', fontScale)}
        {renderFeatureStatus('Line Height', lineHeight)}
        {renderFeatureStatus('Letter Spacing', letterSpacing)}

        <Text style={styles.categoryTitle}>Visual Features</Text>
        {renderFeatureStatus('High Contrast', highContrast)}
        {renderFeatureStatus('White High Contrast', whiteHighContrast)}
        {renderFeatureStatus('Low Saturation', lowSaturation)}
        {renderFeatureStatus('Hide Images', hideImages)}
        {renderFeatureStatus('Color Theme', colorTheme)}

        <Text style={styles.categoryTitle}>Interactive Features</Text>
        {renderFeatureStatus('Enlarge Buttons', enlargeButtons)}
        {renderFeatureStatus('Highlight Links', highlightLinks)}
        {renderFeatureStatus('Reduced Motion', reducedMotion)}

        <Text style={styles.categoryTitle}>Reading Assistance</Text>
        {renderFeatureStatus('Reading Mask', readingMask)}
        {renderFeatureStatus('Reading Line', readingLine)}
        {renderFeatureStatus('Text Magnifier', textMagnifier)}
        {renderFeatureStatus('Dictionary', dictionary)}

        <Text style={styles.categoryTitle}>Accessibility Services</Text>
        {renderFeatureStatus('Text-to-Speech', textToSpeech)}
        {renderFeatureStatus('Screen Reader', screenReader)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Definitions</Text>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>👁️ Blindness Profile</Text>
          <Text style={styles.profileFeatures}>
            • Screen reader + TTS{'\n'}
            • High contrast{'\n'}
            • Hide images{'\n'}
            • 1.2x font size
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}> Visually Impaired Profile</Text>
          <Text style={styles.profileFeatures}>
            • 2.0x font size (max){'\n'}
            • High contrast{'\n'}
            • Enlarged buttons{'\n'}
            • Text magnifier
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>🧠 Cognitive & Learning Profile</Text>
          <Text style={styles.profileFeatures}>
            • Reading line{'\n'}
            • Dictionary{'\n'}
            • No animations{'\n'}
            • Highlighted links
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>⚡ Epilepsy Safe Profile</Text>
          <Text style={styles.profileFeatures}>
            • No animations{'\n'}
            • Dark mode{'\n'}
            • Low saturation{'\n'}
            • No flashing
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>🎯 ADHD Profile</Text>
          <Text style={styles.profileFeatures}>
            • Reading mask{'\n'}
            • Hide images{'\n'}
            • No animations{'\n'}
            • Focus mode
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ℹ️ This tester is for development only.{'\n'}
          Remove from production builds.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#007AFF',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  featureLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileTestButton: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeProfileButton: {
    backgroundColor: '#007AFF',
  },
  profileButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  activeProfileText: {
    color: '#FFFFFF',
  },
  profileInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000000',
  },
  profileFeatures: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FFF3CD',
    margin: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfileTester;
