import { View, StyleSheet, Pressable, Text, Platform, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import Draggable from 'react-native-draggable';
import { Slider } from '@miblanchard/react-native-slider';
import { Dropdown } from 'react-native-element-dropdown';
import Colors from '../utils/Colors';
import { usePageRead } from './usePageRead';
import { useAccessibility } from './AccessibilityContext';
import Global from '../screens/Global';
import Fonts from '../utils/Fonts';
import TTSService from './TTSService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReadModal = ({ activeModal }) => {
    const [textToRead, setTextToRead] = useState(Global.pageReadText || '');
    const pageRead = usePageRead(textToRead);
    const { setReadingText, clearReadingText, updateSetting } = useAccessibility();
    const [isMinimized, setIsMinimized] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [volume, setVolume] = useState(1.0);
    const [rate, setRate] = useState(0.5);
    const [pitch, setPitch] = useState(1.0);
    const [speakerDragging, setSpeakerDragging] = useState(false);

    // Monitor Global.pageReadText changes
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (Global.pageReadText && Global.pageReadText !== textToRead) {
                setTextToRead(Global.pageReadText);
                // Stop current reading when new text is selected
                pageRead.stop();
            }
        }, 100);
        return () => clearInterval(checkInterval);
    }, [textToRead, pageRead]);

    useEffect(() => {
        const loadVoices = async () => {
            try {
                // Initialize TTS first
                await TTSService.init();

                const availableVoices = await TTSService.getVoices();
                // Filter only English voices
                const englishVoices = availableVoices.filter(voice =>
                    voice.language && voice.language.toLowerCase().startsWith('en')
                );
                setVoices(englishVoices);
                if (englishVoices.length > 0) {
                    setSelectedVoice(englishVoices[0].id);
                }
            } catch (error) {
                console.log('Error loading voices:', error);
            }
        };
        loadVoices();
    }, []);

    // Apply TTS settings whenever they change
    useEffect(() => {
        const applySettings = async () => {
            try {
                const Tts = (await import('react-native-tts')).default;

                // iOS specific setup
                if (Platform.OS === 'ios') {
                    await Tts.setIgnoreSilentSwitch('ignore');
                    await Tts.setDucking(true);
                }

                if (selectedVoice) {
                    await Tts.setDefaultVoice(selectedVoice);
                }
                await Tts.setDefaultRate(rate);
                await Tts.setDefaultPitch(pitch);
            } catch (error) {
                console.log('Error applying TTS settings:', error);
            }
        };
        applySettings();
    }, [selectedVoice, rate, pitch]);

    // Track current reading text in context
    useEffect(() => {
        if (pageRead.isSpeaking && textToRead) {
            setReadingText(textToRead);
        } else {
            clearReadingText();
        }
    }, [pageRead.isSpeaking, textToRead, setReadingText, clearReadingText]);

    // Reset minimized state when modal is opened/closed
    useEffect(() => {
        if (!activeModal) {
            setIsMinimized(false);
        }
    }, [activeModal]);

    // useEffect(() => {
    //     console.log('Speaker dragging state:', speakerDragging);
    // }, [speakerDragging]);

    if (!activeModal) return null;

    if (isMinimized) {
        return (
            <View style={styles.absoluteContainer} pointerEvents="box-none">
                <Draggable
                    x={SCREEN_WIDTH - 80}
                    y={200}
                    minX={0}
                    maxX={SCREEN_WIDTH - 20}
                    minY={0}
                    maxY={SCREEN_HEIGHT - 100}
                    shouldReverse={false}
                    disabled={false}
                    onShortPressRelease={() => setIsMinimized(false)}
                    onDrag={() => {
                        console.log('Dragging minimized button');
                        Global.accessibility.isSpeakerDragging = true;
                    }}
                    onPressIn={() => { }}
                    onPressOut={() => { }}
                    onRelease={() => {
                        console.log("Draggedd release");
                        Global.accessibility.isSpeakerDragging = false;
                    }}
                >
                    <Pressable
                        style={styles.minimizedButton}
                        onPress={() => setIsMinimized(false)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Tap to expand page reader"
                    >
                        <Text style={styles.minimizedIcon}>🔊</Text>
                    </Pressable>
                </Draggable>
            </View>
        );
    }

    return (
        <View style={styles.absoluteContainer} pointerEvents="box-none">
            <Draggable
                // x={20}
                y={100}
                // x={SCREEN_WIDTH - 80}
                //     y={200}
                minX={0}
                maxX={SCREEN_WIDTH - 20}
                minY={0}
                maxY={SCREEN_HEIGHT - 80}
                shouldReverse={false}
                disabled={false}
                onDrag={() => { }}
                onPressIn={() => { }}
                onPressOut={() => { }}
                onRelease={() => { }}
            >
                <View style={styles.modalContainer} pointerEvents="auto">
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <Pressable
                            style={styles.minimizeButton}
                            onPress={() => setIsMinimized(true)}
                            accessibilityRole="button"
                            accessibilityLabel="Minimize page reader"
                        >
                            <Text style={styles.actionIcon}>━</Text>
                        </Pressable>
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => {
                                Global.accessibility.pageRead = false;
                                updateSetting('textToSpeech', false);
                                pageRead.stop();
                                clearReadingText();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Close page reader"
                        >
                            <Text style={styles.actionIcon}>✕</Text>
                        </Pressable>
                    </View>

                    {/* Title */}
                    <View style={styles.headerSection}>
                        <Text style={styles.headerIcon}>🔊</Text>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.headerTitle]}>Page Reader</Text>
                    </View>

                    {/* Voice/Accent Picker */}
                    <View style={styles.settingSection}>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.settingLabel]}>
                            Voice/Accent
                        </Text>
                        <Dropdown
                            style={styles.dropdown}
                            data={voices.map(v => ({
                                label: v.name || v.language || 'Unknown',
                                value: v.id
                            }))}
                            labelField="label"
                            valueField="value"
                            placeholder="Select voice"
                            value={selectedVoice}
                            onChange={item => setSelectedVoice(item.value)}
                            containerStyle={styles.dropdownContainer}
                            selectedTextStyle={styles.dropdownText}
                            placeholderStyle={styles.dropdownText}
                        />
                    </View>

                    {/* Volume Slider */}
                    <View style={styles.settingSection}>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.settingLabel]}>
                            Volume: {Math.round(volume * 100)}%
                        </Text>
                        <Slider
                            containerStyle={styles.sliderContainer}
                            minimumValue={0}
                            maximumValue={1}
                            value={volume}
                            onValueChange={(val) => setVolume(val[0])}
                            minimumTrackTintColor="#4CAF50"
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor="#2E7D32"
                            thumbStyle={styles.thumbStyle}
                            trackStyle={styles.trackStyle}
                            step={0.01}
                        />
                    </View>

                    {/* Rate Slider */}
                    <View style={styles.settingSection}>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.settingLabel]}>
                            Speed: {Math.round(rate * 100)}%
                        </Text>
                        <Slider
                            containerStyle={styles.sliderContainer}
                            minimumValue={0.1}
                            maximumValue={0.8}
                            value={rate}
                            onValueChange={(val) => setRate(val[0])}
                            minimumTrackTintColor="#2196F3"
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor="#1565C0"
                            thumbStyle={styles.thumbStyle}
                            trackStyle={styles.trackStyle}
                            step={0.01}
                        />
                    </View>

                    {/* Pitch Slider */}
                    <View style={styles.settingSection}>
                        <Text style={[Fonts.Nunito_600SemiBold, styles.settingLabel]}>
                            Pitch: {Math.round(pitch * 100)}%
                        </Text>
                        <Slider
                            containerStyle={styles.sliderContainer}
                            minimumValue={0}
                            maximumValue={1}
                            value={pitch}
                            onValueChange={(val) => setPitch(val[0])}
                            minimumTrackTintColor="#FF9800"
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor="#E65100"
                            thumbStyle={styles.thumbStyle}
                            trackStyle={styles.trackStyle}
                            step={0.01}
                        />
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.controlsRow}>
                        <PageReadButton
                            icon="▶"
                            label="Start"
                            onPress={async () => {
                                try {
                                    const Tts = (await import('react-native-tts')).default;

                                    // iOS specific setup
                                    if (Platform.OS === 'ios') {
                                        await Tts.setIgnoreSilentSwitch('ignore');
                                        await Tts.setDucking(true);
                                    }

                                    if (selectedVoice) {
                                        await Tts.setDefaultVoice(selectedVoice);
                                    }
                                    await Tts.setDefaultRate(rate);
                                    await Tts.setDefaultPitch(pitch);
                                    pageRead.start();
                                } catch (error) {
                                    console.log('Error setting TTS:', error);
                                    pageRead.start();
                                }
                            }}
                            accessibilityLabel="Start reading"
                        />
                        <PageReadButton
                            icon="⏸"
                            label="Pause"
                            onPress={pageRead.pause}
                            accessibilityLabel="Pause reading"
                        />
                        <PageReadButton
                            icon="▶▶"
                            label="Resume"
                            onPress={pageRead.resume}
                            accessibilityLabel="Resume reading"
                        />
                        <PageReadButton
                            icon="⏹"
                            label="Stop"
                            onPress={pageRead.stop}
                            accessibilityLabel="Stop reading"
                        />
                    </View>
                </View>
            </Draggable>
        </View>
    )
}
const styles = StyleSheet.create({
    absoluteContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 9999,
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.92,
        backgroundColor: Colors.defaultBackground,
        borderRadius: 16,
        paddingTop: 30,
        paddingBottom: 12,
        paddingHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
            },
            android: {
                elevation: 15,
            },
        }),
    },
    actionButtons: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        gap: 8,
        zIndex: 10,
    },
    minimizeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF3CD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 14,
        color: '#666',
        fontWeight: '700',
    },
    minimizedButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0B3B91',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    minimizedIcon: {
        fontSize: 28,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 6,
    },
    headerIcon: {
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    settingSection: {
        marginBottom: 12,
    },
    settingLabel: {
        fontSize: 13,
        color: '#0B3B91',
        marginBottom: 6,
        fontWeight: '600',
    },
    dropdown: {
        height: 40,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
    },
    dropdownContainer: {
        borderRadius: 8,
        marginTop: 4,
    },
    dropdownText: {
        fontSize: 12,
        color: '#1a1a1a',
    },
    sliderContainer: {
        width: '100%',
        height: 45,
    },
    thumbStyle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    trackStyle: {
        height: 8,
        borderRadius: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 4,
        marginTop: 4,
    },
    pageReadButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 12,
        backgroundColor: '#0B3B91',
        ...Platform.select({
            ios: {
                shadowColor: '#0B3B91',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    buttonIcon: {
        fontSize: 14,
        marginBottom: 2,
        color: 'white',
    },
    pageReadButtonText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default ReadModal;

function PageReadButton({ icon, label, onPress, accessibilityLabel }) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.pageReadButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }
            ]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Text style={styles.buttonIcon}>{icon}</Text>
            <Text style={[Fonts.Nunito_600SemiBold, styles.pageReadButtonText]}>{label}</Text>
        </Pressable>
    );
}

