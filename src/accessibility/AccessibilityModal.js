import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Switch,
    Dimensions,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import Slider from '@react-native-community/slider';
import { useAccessibility } from './AccessibilityContext';
import {
    ACCESSIBILITY_PROFILES,
    TEXT_ALIGNMENT,
} from './AccessibilityUtils';
import TTSService from './TTSService';
import Global from '../screens/Global';
import TextControlsWithSlider from './TextControlsWithSlider';
import Fonts from '../utils/Fonts';
import { heightToDp } from '../utils/Responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AccessibilityModal = () => {
    const [imageDescriptionEnabled, setImageDescriptionEnabled] = useState(false);
    const [textMagnifierEnabled, setTextMagnifierEnabled] = useState(false);
    const [dictionaryEnabled, setDictionaryEnabled] = useState(false);
    const [readingMaskEnabled, setReadingMaskEnabled] = useState(false);
    const [readingLineEnabled, setReadingLineEnabled] = useState(false);
    const [enlargeButtonsEnabled, setEnlargeButtonsEnabled] = useState(false);
    const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);
    const {
        isModalVisible,
        closeModal,
        fontScale,
        lineHeight,
        letterSpacing,
        textAlignment,
        highContrast,
        colorInversion,
        greyscale,
        lowSaturation,
        highSaturation,
        colorTheme,
        accentColor,
        textColor,
        backgroundColor,
        hideImages,
        imageDescription,
        enlargeButtons,
        reducedMotion,
        highlightLinks,
        readingMask,
        readingLine,
        textMagnifier,
        textToSpeech,
        dictionary,
        screenReader,
        nativeScreenReader,
        nativeReducedMotion,
        nativeGrayscale,
        nativeInvertColors,
        activeProfile,
        updateSetting,
        setProfile,
        resetToDefault,
        announce,
    } = useAccessibility();

    // Sync local states with context values when they change (including on app restart)
    useEffect(() => {
        setImageDescriptionEnabled(hideImages);
        setTextMagnifierEnabled(textMagnifier);
        setDictionaryEnabled(dictionary);
        setReadingMaskEnabled(readingMask);
        setReadingLineEnabled(readingLine);
        setEnlargeButtonsEnabled(enlargeButtons);
        setReducedMotionEnabled(reducedMotion);
    }, [hideImages, textMagnifier, dictionary, readingMask, readingLine, enlargeButtons, reducedMotion]);

    const [expandedSection, setExpandedSection] = useState('content');
    const [activeTextControl, setActiveTextControl] = useState('biggerText'); // 'biggerText', 'lineHeight', 'letterSpacing'

    // Handle reset to default values
    const handleReset = () => {
        // Reset all accessibility settings
        resetToDefault();
        
        // Reset local states
        setImageDescriptionEnabled(false);
        setTextMagnifierEnabled(false);
        setDictionaryEnabled(false);
        setReadingMaskEnabled(false);
        setReadingLineEnabled(false);
        setEnlargeButtonsEnabled(false);
        setReducedMotionEnabled(false);
        
        // Reset Global accessibility object
        Global.accessibility = {
            ...Global.accessibility,
            pageRead: false,
            imageDescription: false,
            textMagnifier: false,
            dictionary: false,
            readingMask: false,
            readingLine: false,
            enlargeButtons: false,
            reducedMotion: false,
            highlightLinks: false,
            textAlignment: 'left',
            highlightLinks: false,
        };
        
        // Announce reset for screen reader users
        announce && announce('All accessibility settings have been reset to default');
    };

    const getSliderConfig = () => {
        switch (activeTextControl) {
            case 'biggerText':
                return {
                    value: fontScale,
                    min: 0.8,
                    max: 2.0,
                    onChange: (val) => updateSetting('fontScale', val),
                };
            case 'lineHeight':
                return {
                    value: lineHeight,
                    min: 1.0,
                    max: 3.0,
                    onChange: (val) => updateSetting('lineHeight', val),
                };
            case 'letterSpacing':
                return {
                    value: letterSpacing,
                    min: 0,
                    max: 2.0,
                    onChange: (val) => updateSetting('letterSpacing', val),
                };
            default:
                return { value: fontScale, min: 0.8, max: 2.0, onChange: () => { } };
        }
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const renderSectionHeader = (title, section) => (
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(section)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${title} section`}
            accessibilityState={{ expanded: expandedSection === section }}
        >
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionIcon}>
                {expandedSection === section ? '▲' : '▼'}
            </Text>
        </TouchableOpacity>
    );

    const renderContentSection = () => {
        if (expandedSection !== 'content') return null;

        const sliderConfig = getSliderConfig();

        return (
            <View style={styles.sectionContent}>
                {/* Text Control Buttons Row 1 */}
                {/* <View style={styles.textControlRow}>
                    <TouchableOpacity
                        style={[
                            styles.textControlButton,
                            activeTextControl === 'biggerText' && styles.textControlButtonActive,
                        ]}
                        onPress={() => setActiveTextControl('biggerText')}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <Text style={styles.textControlIcon}>🔤</Text>
                        <Text style={styles.textControlLabel}>Bigger Text</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.textControlButton,
                            activeTextControl === 'lineHeight' && styles.textControlButtonActive,
                        ]}
                        onPress={() => setActiveTextControl('lineHeight')}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <Text style={styles.textControlIcon}>☰</Text>
                        <Text style={styles.textControlLabel}>Line Height</Text>
                    </TouchableOpacity>
                </View> */}
                {
                    <TextControlsWithSlider />
                }

                {/* Text Control Buttons Row 2 */}
                {/* <View style={styles.textControlRow}>
                    <TouchableOpacity
                        style={[
                            styles.textControlButton,
                            activeTextControl === 'letterSpacing' && styles.textControlButtonActive,
                        ]}
                        onPress={() => setActiveTextControl('letterSpacing')}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <Text style={styles.textControlIcon}>⬌</Text>
                        <Text style={styles.textControlLabel}>Letter Spacing</Text>
                    </TouchableOpacity>
                </View> */}

                {/* Single Slider with Aa labels */}
                {/* <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabelSmall}>Aa</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={sliderConfig.min}
                        maximumValue={sliderConfig.max}
                        step={0.1}
                        value={sliderConfig.value}
                        onValueChange={sliderConfig.onChange}
                        minimumTrackTintColor="#007AFF"
                        maximumTrackTintColor="#C7C7CC"
                        thumbTintColor="#007AFF"
                        accessible={true}
                    />
                    <Text style={styles.sliderLabelLarge}>Aa</Text>
                </View> */}

                {/* Reset Button */}
                {/* <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetToDefault}
                    accessible={true}
                    accessibilityRole="button"
                >
                    <Text style={styles.resetButtonText}>RESET</Text>
                </TouchableOpacity> */}

                {/* Text Alignment */}
                {/* <View style={styles.alignmentSection}>
                    <Text style={styles.featureTitle}>Text Alignment</Text>
                    <View style={styles.alignmentButtons}>
                        <TouchableOpacity
                            style={[styles.alignmentButton, textAlignment === TEXT_ALIGNMENT.LEFT && styles.alignmentButtonActive]}
                            onPress={() => {
                                updateSetting('textAlignment', TEXT_ALIGNMENT.LEFT);
                                Global.accessibility.textAlignment = 'left';
                            }}
                        >
                            <Text style={styles.alignmentIcon}>≡</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.alignmentButton, textAlignment === TEXT_ALIGNMENT.CENTER && styles.alignmentButtonActive]}
                            onPress={() => {
                                updateSetting('textAlignment', TEXT_ALIGNMENT.CENTER);
                                Global.accessibility.textAlignment = 'center';
                            }}
                        >
                            <Text style={styles.alignmentIcon}>☰</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.alignmentButton, textAlignment === TEXT_ALIGNMENT.RIGHT && styles.alignmentButtonActive]}
                            onPress={() => {
                                updateSetting('textAlignment', TEXT_ALIGNMENT.RIGHT);
                                Global.accessibility.textAlignment = 'right';
                            }}
                        >
                            <Text style={styles.alignmentIcon}>≣</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.alignmentButton, textAlignment === TEXT_ALIGNMENT.JUSTIFY && styles.alignmentButtonActive]}
                            onPress={() => {
                                updateSetting('textAlignment', TEXT_ALIGNMENT.JUSTIFY);
                                Global.accessibility.textAlignment = 'justify';
                            }}
                        >
                            <Text style={styles.alignmentIcon}>⬌</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}

                {/* Icon Buttons Row 1 */}
                <View style={styles.iconButtonRow}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            if (textToSpeech) {
                                TTSService.stop();
                                updateSetting('textToSpeech', false);
                                Global.accessibility.pageRead = false;
                                closeModal();
                            } else {
                                updateSetting('textToSpeech', true);
                                Global.accessibility.pageRead = true;
                                closeModal();
                                announce('Text to speech enabled');
                            }
                        }}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconCircle, textToSpeech && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>🔊</Text>
                        </View>
                        <Text style={styles.iconButtonLabel}>Page Read / TTS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            const newValue = !dictionaryEnabled;
                            Global.accessibility.dictionary = newValue;
                            setDictionaryEnabled(newValue);
                            updateSetting('dictionary', newValue);
                            announce(newValue ? 'Dictionary enabled' : 'Dictionary disabled');
                            closeModal();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconCircle, dictionaryEnabled && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>📖</Text>
                        </View>
                        <Text style={styles.iconButtonLabel}>Dictionary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            const newValue = !imageDescriptionEnabled;
                            Global.accessibility.imageDescription = newValue;
                            setImageDescriptionEnabled(newValue);
                            updateSetting('imageDescription', newValue);
                            announce(newValue ? 'Image descriptions enabled' : 'Image descriptions disabled');
                            closeModal();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconCircle, imageDescriptionEnabled && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>🖼️</Text>
                        </View>
                        <Text style={styles.iconButtonLabel}>Image Description</Text>
                    </TouchableOpacity>
                </View>

                {/* Icon Buttons Row 2 */}
                <View style={styles.iconButtonRow}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            updateSetting('hideImages', !hideImages);
                            closeModal();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconCircle, hideImages && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>🚫</Text>
                        </View>
                        <Text style={styles.iconButtonLabel}>Hide Images</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            const newValue = !textMagnifierEnabled;
                            Global.accessibility.textMagnifier = newValue;
                            setTextMagnifierEnabled(newValue);
                            updateSetting('textMagnifier', newValue);
                            announce(newValue ? 'Text magnifier enabled' : 'Text magnifier disabled');
                            closeModal();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconCircle, textMagnifierEnabled && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>🔍</Text>
                        </View>
                        <Text style={styles.iconButtonLabel}>Text Magnifier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                            const newValue = !enlargeButtonsEnabled;
                            Global.accessibility.enlargeButtons = newValue;
                            setEnlargeButtonsEnabled(newValue);
                            updateSetting('enlargeButtons', newValue);
                            closeModal();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconCircle, enlargeButtonsEnabled && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>⊕</Text>
                        </View>
                        <Text style={styles.iconButtonLabel}>Enlarge Buttons</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderColorsSection = () => {
        if (expandedSection !== 'colors') return null;

        // Helper function to handle color mode selection (only one at a time)
        const handleColorModeSelect = (mode) => {
            // Turn off all color modes first
            updateSetting('colorInversion', false);
            updateSetting('greyscale', false);
            updateSetting('lowSaturation', false);
            updateSetting('highSaturation', false);
            updateSetting('highContrast', false);
            updateSetting('colorTheme', 'light');
            
            // Then activate the selected mode
            switch(mode) {
                case 'darkMode':
                    updateSetting('colorTheme', 'dark');
                    break;
                case 'colorInversion':
                    updateSetting('colorInversion', true);
                    break;
                case 'lowSaturation':
                    updateSetting('lowSaturation', true);
                    break;
                case 'highSaturation':
                    updateSetting('highSaturation', true);
                    break;
                case 'greyscale':
                    updateSetting('greyscale', true);
                    break;
                case 'darkHighContrast':
                    updateSetting('highContrast', true);
                    updateSetting('colorTheme', 'dark');
                    break;
                case 'whiteHighContrast':
                    updateSetting('highContrast', true);
                    updateSetting('colorTheme', 'light');
                    break;
                case 'none':
                    // All already turned off
                    break;
            }
        };

        // Check which mode is currently active
        const getActiveMode = () => {
            if (colorInversion) return 'colorInversion';
            if (greyscale) return 'greyscale';
            if (lowSaturation) return 'lowSaturation';
            if (highSaturation) return 'highSaturation';
            if (highContrast && colorTheme === 'dark') return 'darkHighContrast';
            if (highContrast && colorTheme === 'light') return 'whiteHighContrast';
            if (colorTheme === 'dark') return 'darkMode';
            return 'none';
        };

        const activeMode = getActiveMode();

        return (
            <View style={styles.sectionContent}>
                {/* Row 1 */}
                <View style={styles.colorGrid}>
                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'darkMode' ? 'none' : 'darkMode')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle dark mode"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'darkMode' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>🌙</Text>
                        </View>
                        <Text style={styles.colorLabel}>Dark Mode</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'colorInversion' ? 'none' : 'colorInversion')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle color inversion"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'colorInversion' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>🔄</Text>
                        </View>
                        <Text style={styles.colorLabel}>Invert Color</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'lowSaturation' ? 'none' : 'lowSaturation')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle low saturation"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'lowSaturation' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>🎨</Text>
                        </View>
                        <Text style={styles.colorLabel}>Low Saturation</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.colorGrid}>
                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'highSaturation' ? 'none' : 'highSaturation')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle high saturation"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'highSaturation' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>🎨</Text>
                        </View>
                        <Text style={styles.colorLabel}>High Saturation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'greyscale' ? 'none' : 'greyscale')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle grayscale"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'greyscale' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>⚫</Text>
                        </View>
                        <Text style={styles.colorLabel}>Grayscale</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'darkHighContrast' ? 'none' : 'darkHighContrast')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle dark high contrast"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'darkHighContrast' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>⚫</Text>
                        </View>
                        <Text style={styles.colorLabel}>Dark High Contrast</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 3 - Centered */}
                <View style={styles.colorGridCenter}>
                    <TouchableOpacity
                        style={styles.colorButton}
                        onPress={() => handleColorModeSelect(activeMode === 'whiteHighContrast' ? 'none' : 'whiteHighContrast')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle white high contrast"
                    >
                        <View style={[styles.colorIconCircle, activeMode === 'whiteHighContrast' && styles.colorIconCircleActive]}>
                            <Text style={styles.colorIcon}>⚪</Text>
                        </View>
                        <Text style={styles.colorLabel}>White High Contrast</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderProfilesSection = () => {
        if (expandedSection !== 'profiles') return null;

        const profiles = [
            { 
                key: ACCESSIBILITY_PROFILES.BLIND, 
                icon: '👁️', 
                label: 'Blindness Profile', 
                description: 'Screen reader support, high contrast, hide images',
                features: '• Screen reader & TTS enabled\n• High contrast mode\n• Images hidden\n• Enlarged buttons'
            },
            { 
                key: ACCESSIBILITY_PROFILES.DYSLEXIA, 
                icon: '📖', 
                label: 'Dyslexia Profile', 
                description: 'Larger text, increased line height & letter spacing',
                features: '• 1.5x larger text\n• 2.4x line height\n• Wide letter spacing\n• Reading line aid'
            },
            { 
                key: ACCESSIBILITY_PROFILES.COGNITIVE, 
                icon: '🧠', 
                label: 'Cognitive & Learning Profile', 
                description: 'Reading aids, reduced motion, highlighted links',
                features: '• Reading line guide\n• No animations\n• Links highlighted\n• Dictionary lookup'
            },
            { 
                key: ACCESSIBILITY_PROFILES.EPILEPSY_SAFE, 
                icon: '⚡', 
                label: 'Epilepsy Safe Profile', 
                description: 'No animations, dark mode, reduced saturation',
                features: '• All animations off\n• Dark theme\n• Low saturation\n• Reduced visual triggers'
            },
            { 
                key: ACCESSIBILITY_PROFILES.ADHD_FOCUS, 
                icon: '🎯', 
                label: 'ADHD Profile', 
                description: 'Reading mask, focus mode, minimal distractions',
                features: '• Reading mask enabled\n• Images hidden\n• No animations\n• Enhanced focus mode'
            },
        ];

        return (
            <View style={styles.sectionContent}>
                {/* Reset Profile Button */}
                {activeProfile !== ACCESSIBILITY_PROFILES.NONE && (
                    <TouchableOpacity
                        style={styles.resetProfileButton}
                        onPress={() => setProfile(ACCESSIBILITY_PROFILES.NONE)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Reset to default settings"
                    >
                        <Text style={styles.resetProfileText}>✕ Reset Active Profile</Text>
                    </TouchableOpacity>
                )}
                
                {profiles.map((profile) => (
                    <View key={profile.key}>
                        <TouchableOpacity
                            style={[
                                styles.profileButton,
                                activeProfile === profile.key && styles.profileButtonActive,
                            ]}
                            onPress={() => {
                                setProfile(profile.key);
                                announce(`${profile.label} activated`);
                            }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={profile.label}
                            accessibilityHint={profile.description}
                            accessibilityState={{ selected: activeProfile === profile.key }}
                        >
                            <View style={[
                                styles.profileIconContainer,
                                activeProfile === profile.key && styles.profileIconContainerActive,
                            ]}>
                                <Text style={styles.profileIcon}>{profile.icon}</Text>
                            </View>
                            <View style={styles.profileTextContainer}>
                                <Text style={[
                                    styles.profileLabel,
                                    activeProfile === profile.key && styles.profileLabelActive,
                                ]}>{profile.label}</Text>
                                <Text style={[
                                    styles.profileDescription,
                                    activeProfile === profile.key && styles.profileDescriptionActive,
                                ]}>{profile.description}</Text>
                            </View>
                            {activeProfile === profile.key && (
                                <View style={styles.profileCheckmark}>
                                    <Text style={styles.profileCheckmarkIcon}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        
                        {/* Show features when profile is active */}
                        {activeProfile === profile.key && (
                            <View style={styles.profileFeaturesContainer}>
                                <Text style={styles.profileFeaturesTitle}>Active Features:</Text>
                                <Text style={styles.profileFeaturesText}>{profile.features}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    const renderColorAdjustmentSection = () => {
        if (expandedSection !== 'colorAdjustment') return null;

        const colorOptions = [
            { color: '#0076b4', label: 'Blue' },
            { color: '#7a549c', label: 'Purple' },
            { color: '#c83733', label: 'Red' },
            { color: '#d07021', label: 'Orange' },
            { color: '#26999f', label: 'Teal' },
            { color: '#4d7831', label: 'Green' },
            { color: '#ffffff', label: 'White' },
            { color: '#000000', label: 'Black' },
        ];

        return (
            <View style={styles.sectionContent}>
                {/* Text Color Adjustment */}
                <Text style={styles.colorAdjustTitle}>Adjust Text Color</Text>
                <View style={styles.colorPickerRow}>
                    {colorOptions.map((option) => (
                        <TouchableOpacity
                            key={`text-${option.color}`}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: option.color },
                                textColor === option.color && {
                                    borderColor: '#007AFF',
                                    borderWidth: 3,
                                },
                                option.color === '#ffffff' && {
                                    borderColor: textColor === option.color ? '#007AFF' : '#C7C7CC',
                                },
                            ]}
                            onPress={() => {
                                updateSetting('textColor', option.color);
                                announce(`Text color changed to ${option.label}`);
                            }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Set text color to ${option.label}`}
                            accessibilityState={{ selected: textColor === option.color }}
                        />
                    ))}
                </View>
                <TouchableOpacity
                    style={styles.colorResetButton}
                    onPress={() => {
                        updateSetting('textColor', null);
                        announce('Text color reset to default');
                    }}
                    accessible={true}
                    accessibilityRole="button"
                >
                    <Text style={styles.colorResetText}>RESET</Text>
                </TouchableOpacity>

                {/* Background Color Adjustment */}
                <Text style={styles.colorAdjustTitle}>Adjust Background Color</Text>
                <View style={styles.colorPickerRow}>
                    {colorOptions.map((option) => (
                        <TouchableOpacity
                            key={`bg-${option.color}`}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: option.color },
                                backgroundColor === option.color && {
                                    borderColor: '#007AFF',
                                    borderWidth: 3,
                                },
                                option.color === '#ffffff' && {
                                    borderColor: backgroundColor === option.color ? '#007AFF' : '#C7C7CC',
                                },
                            ]}
                            onPress={() => {
                                updateSetting('backgroundColor', option.color);
                                announce(`Background color changed to ${option.label}`);
                            }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Set background color to ${option.label}`}
                            accessibilityState={{ selected: backgroundColor === option.color }}
                        />
                    ))}
                </View>
                <TouchableOpacity
                    style={styles.colorResetButton}
                    onPress={() => {
                        updateSetting('backgroundColor', null);
                        announce('Background color reset to default');
                    }}
                    accessible={true}
                    accessibilityRole="button"
                >
                    <Text style={styles.colorResetText}>RESET</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderNavigationSection = () => {
        if (expandedSection !== 'navigation') return null;

        return (
            <View style={[styles.sectionContent, { marginBottom: heightToDp(8) }]}>
                {/* Row 1 */}
                <View style={styles.iconButtonRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        // Toggle: if already in "reading line only" mode, turn off, otherwise enable only reading line
                        const isCurrentlyActive = readingLineEnabled && !readingMaskEnabled;
                        const newReadingLineValue = !isCurrentlyActive;
                        
                        Global.accessibility.readingLine = newReadingLineValue;
                        Global.accessibility.readingMask = false;
                        setReadingLineEnabled(newReadingLineValue);
                        setReadingMaskEnabled(false);
                        updateSetting('readingLine', newReadingLineValue);
                        updateSetting('readingMask', false);
                        closeModal();
                    }}>
                        <View style={[styles.iconCircle, (readingLineEnabled && !readingMaskEnabled) && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>☰</Text>
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.iconButtonLabel]}>Reading Line</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        const newValue = !highlightLinks;
                        Global.accessibility.highlightLinks = newValue;
                        updateSetting('highlightLinks', newValue);
                        closeModal();
                    }}>
                        <View style={[styles.iconCircle, highlightLinks && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>⚙️</Text>
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.iconButtonLabel]}>Highlight Links</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        // Toggle: if already in "reading mask only" mode, turn off, otherwise enable only reading mask
                        const isCurrentlyActive = readingMaskEnabled && !readingLineEnabled;
                        const newReadingMaskValue = !isCurrentlyActive;
                        
                        Global.accessibility.readingMask = newReadingMaskValue;
                        Global.accessibility.readingLine = false;
                        setReadingMaskEnabled(newReadingMaskValue);
                        setReadingLineEnabled(false);
                        updateSetting('readingMask', newReadingMaskValue);
                        updateSetting('readingLine', false);
                        closeModal();
                    }}>
                        <View style={[styles.iconCircle, (readingMaskEnabled && !readingLineEnabled) && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>📄</Text>
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.iconButtonLabel]}>Reading{' '}Mask</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.iconButtonRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        // Toggle both reading line and mask together
                        const newValue = !(readingLineEnabled && readingMaskEnabled);
                        Global.accessibility.readingLine = newValue;
                        Global.accessibility.readingMask = newValue;
                        setReadingLineEnabled(newValue);
                        setReadingMaskEnabled(newValue);
                        updateSetting('readingLine', newValue);
                        updateSetting('readingMask', newValue);
                        closeModal();
                    }}>
                        <View style={[styles.iconCircle, (readingLineEnabled && readingMaskEnabled) && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>📊</Text>
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.iconButtonLabel]}>Reading{' '}Mask & Line</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        const newValue = !reducedMotionEnabled;
                        Global.accessibility.reducedMotion = newValue;
                        setReducedMotionEnabled(newValue);
                        updateSetting('reducedMotion', newValue);
                        closeModal();
                    }}>
                        <View style={[styles.iconCircle, reducedMotionEnabled && styles.iconCircleActive]}>
                            <Text style={styles.iconButtonIcon}>⏸️</Text>
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.iconButtonLabel]}>Pause{' '}Animation</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (!isModalVisible) return null;

    return (
        <View style={styles.modalOverlay} pointerEvents="box-none">
            <SafeAreaView style={styles.modalContent} edges={['bottom']} pointerEvents="auto">
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Accessibility Menu</Text>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                onPress={handleReset}
                                style={styles.resetIconButton}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Reset all accessibility settings to default"
                            >
                                <Icon name="refresh" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={closeModal}
                                style={styles.closeButton}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel="Close accessibility menu"
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Scrollable Content */}
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        {/* Content Section */}
                        {renderSectionHeader('Content', 'content')}
                        {renderContentSection()}

                        {/* Colors Section */}
                        {renderSectionHeader('Colors', 'colors')}
                        {renderColorsSection()}

                        {/* Profiles Section */}
                        {renderSectionHeader('Profiles', 'profiles')}
                        {renderProfilesSection()}

                        {/* Color Adjustment Section */}
                        {renderSectionHeader('Color Adjustment', 'colorAdjustment')}
                        {renderColorAdjustmentSection()}

                        {/* Navigation Section */}
                        {renderSectionHeader('Navigation', 'navigation')}
                        {renderNavigationSection()}
                    </ScrollView>
                </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#F2F2F7',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: SCREEN_HEIGHT * 0.65,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#007AFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resetIconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    refreshButton: {
        padding: 8,
    },
    refreshIcon: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#C7C7CC',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
    },
    sectionIcon: {
        fontSize: 12,
        color: '#8E8E93',
    },
    sectionContent: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#C7C7CC',
    },
    textControlRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    textControlButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F2F2F7',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    textControlButtonActive: {
        backgroundColor: '#E3F2FF',
        borderColor: '#007AFF',
    },
    textControlIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    textControlLabel: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    // sliderContainer: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     marginVertical: 16,
    // },
    // sliderLabelSmall: {
    //     fontSize: 16,
    //     color: '#8E8E93',
    //     marginRight: 8,
    // },
    // slider: {
    //     flex: 1,
    //     height: 40,
    // },
    // sliderLabelLarge: {
    //     fontSize: 24,
    //     color: '#8E8E93',
    //     marginLeft: 8,
    // },
    resetButton: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    resetButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14,
    },
    alignmentSection: {
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
    },
    alignmentButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    alignmentButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    alignmentButtonActive: {
        backgroundColor: '#007AFF',
    },
    alignmentIcon: {
        fontSize: 20,
        color: '#000000',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    switchLabel: {
        fontSize: 14,
        color: '#000000',
        flex: 1,
    },
    iconButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    iconButton: {
        alignItems: 'center',
        width: 90,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconCircleActive: {
        backgroundColor: '#007AFF',
    },
    iconButtonIcon: {
        fontSize: 24,
    },
    iconButtonLabel: {
        fontSize: 11,
        textAlign: 'center',
        color: '#000000',
         width:'100%'
    },
    colorGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    colorGridCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    colorButton: {
        alignItems: 'center',
        width: 90,
    },
    colorIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#C7C7CC',
    },
    colorIconCircleActive: {
        borderColor: '#007AFF',
        borderWidth: 3,
    },
    colorIcon: {
        fontSize: 24,
    },
    colorLabel: {
        fontSize: 11,
        textAlign: 'center',
        color: '#000000',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    switchLabel: {
        fontSize: 15,
        color: '#000000',
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 16,
        marginBottom: 12,
    },
    themeButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    themeButton: {
        flex: 1,
        minWidth: '45%',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#C7C7CC',
        alignItems: 'center',
    },
    themeButtonActive: {
        borderColor: '#007AFF',
        borderWidth: 3,
    },
    themeButtonText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    resetProfileButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#FF3B30',
        marginBottom: 16,
        alignItems: 'center',
    },
    resetProfileText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    profileButton: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    profileButtonActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#007AFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    profileIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#E5E5EA',
    },
    profileIconContainerActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    profileIcon: {
        fontSize: 24,
    },
    profileTextContainer: {
        flex: 1,
    },
    profileLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 4,
    },
    profileLabelActive: {
        color: '#007AFF',
    },
    profileDescription: {
        fontSize: 12,
        color: '#8E8E93',
        lineHeight: 16,
    },
    profileDescriptionActive: {
        color: '#666666',
    },
    profileCheckmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    profileCheckmarkIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    profileFeaturesContainer: {
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        marginBottom: 12,
        marginLeft: 12,
        marginRight: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    profileFeaturesTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 8,
    },
    profileFeaturesText: {
        fontSize: 12,
        color: '#333333',
        lineHeight: 18,
        fontWeight: '500',
    },
    colorAdjustTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 12,
        marginTop: 8,
    },
    colorPickerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorResetButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    colorResetText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
    },
    infoText: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
});

export default AccessibilityModal;
