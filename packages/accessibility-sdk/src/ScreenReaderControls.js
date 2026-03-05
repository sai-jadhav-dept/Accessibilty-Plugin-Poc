import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TTSService from './TTSService';
import Fonts from './Fonts';
import { widthToDp, heightToDp } from './Responsive';

const ScreenReaderControls = ({ onVoiceSettingsChange }) => {
    const [voices, setVoices] = useState([]);
    const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [rate, setRate] = useState(0.5);
    const [pitch, setPitch] = useState(1.0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Load available voices
    useEffect(() => {
        loadVoices();
    }, []);

    const loadVoices = async () => {
        try {
            const availableVoices = await TTSService.getVoices();
            // Filter for English voices (similar to script-tc.js)
            const englishVoices = availableVoices.filter(voice => 
                voice.language.startsWith('en-') || voice.language.startsWith('hi-')
            );
            setVoices(englishVoices.length > 0 ? englishVoices : availableVoices);
            
            // Try to find a preferred voice (Google UK English Male equivalent)
            const preferredIndex = englishVoices.findIndex(v => 
                v.name.toLowerCase().includes('google') && 
                (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('en-gb'))
            );
            if (preferredIndex >= 0) {
                setSelectedVoiceIndex(preferredIndex);
            }
        } catch (error) {
            console.error('Error loading voices:', error);
        }
    };

    const handleVoiceChange = (direction) => {
        const newIndex = direction === 'next' 
            ? (selectedVoiceIndex + 1) % voices.length
            : (selectedVoiceIndex - 1 + voices.length) % voices.length;
        setSelectedVoiceIndex(newIndex);
        notifySettingsChange();
    };

    const notifySettingsChange = () => {
        if (onVoiceSettingsChange) {
            onVoiceSettingsChange({
                voice: voices[selectedVoiceIndex],
                volume,
                rate,
                pitch,
            });
        }
    };

    const testSpeak = async () => {
        const selectedVoice = voices[selectedVoiceIndex];
        await TTSService.speak(
            `Testing voice. This is ${selectedVoice?.name || 'default voice'}`,
            {
                language: selectedVoice?.language || 'en-US',
                rate: rate,
                pitch: pitch,
            }
        );
    };

    const stopSpeaking = () => {
        TTSService.stop();
        setIsSpeaking(false);
    };

    return (
        <View style={styles.container}>
            <Text style={[Fonts.Nunito_700Bold, styles.title]}>
                🎙️ Voice Controls
            </Text>

            {/* Voice Selection */}
            <View style={styles.controlGroup}>
                <Text style={[Fonts.Nunito_600SemiBold, styles.label]}>Voice:</Text>
                <View style={styles.voiceSelector}>
                    <TouchableOpacity 
                        style={styles.arrowButton}
                        onPress={() => handleVoiceChange('prev')}
                    >
                        <Text style={styles.arrowText}>◀</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.voiceNameContainer}>
                        <Text style={[Fonts.Nunito_400Regular, styles.voiceName]} numberOfLines={1}>
                            {voices[selectedVoiceIndex]?.name || 'Loading...'}
                        </Text>
                        <Text style={[Fonts.Nunito_400Regular, styles.voiceLanguage]}>
                            {voices[selectedVoiceIndex]?.language || ''}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.arrowButton}
                        onPress={() => handleVoiceChange('next')}
                    >
                        <Text style={styles.arrowText}>▶</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Volume Control */}
            <View style={styles.controlGroup}>
                <Text style={[Fonts.Nunito_600SemiBold, styles.label]}>
                    Volume: {Math.round(volume * 100)}%
                </Text>
                <View style={styles.buttonControlRow}>
                    <TouchableOpacity 
                        style={styles.minusButton}
                        onPress={() => {
                            const newVolume = Math.max(0, volume - 0.1);
                            setVolume(newVolume);
                            notifySettingsChange();
                        }}
                    >
                        <Text style={styles.buttonControlText}>−</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${volume * 100}%`, backgroundColor: '#4CAF50' }]} />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.plusButton}
                        onPress={() => {
                            const newVolume = Math.min(1, volume + 0.1);
                            setVolume(newVolume);
                            notifySettingsChange();
                        }}
                    >
                        <Text style={styles.buttonControlText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Speed Control */}
            <View style={styles.controlGroup}>
                <Text style={[Fonts.Nunito_600SemiBold, styles.label]}>
                    Speed: {Math.round(rate * 100)}%
                </Text>
                <View style={styles.buttonControlRow}>
                    <TouchableOpacity 
                        style={styles.minusButton}
                        onPress={() => {
                            const newRate = Math.max(0.1, rate - 0.1);
                            setRate(newRate);
                            notifySettingsChange();
                        }}
                    >
                        <Text style={styles.buttonControlText}>−</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${(rate / 1) * 100}%`, backgroundColor: '#2196F3' }]} />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.plusButton}
                        onPress={() => {
                            const newRate = Math.min(1, rate + 0.1);
                            setRate(newRate);
                            notifySettingsChange();
                        }}
                    >
                        <Text style={styles.buttonControlText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pitch Control */}
            <View style={styles.controlGroup}>
                <Text style={[Fonts.Nunito_600SemiBold, styles.label]}>
                    Pitch: {Math.round(pitch * 100)}%
                </Text>
                <View style={styles.buttonControlRow}>
                    <TouchableOpacity 
                        style={styles.minusButton}
                        onPress={() => {
                            const newPitch = Math.max(0.5, pitch - 0.1);
                            setPitch(newPitch);
                            notifySettingsChange();
                        }}
                    >
                        <Text style={styles.buttonControlText}>−</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((pitch - 0.5) / 1.5) * 100}%`, backgroundColor: '#FF9800' }]} />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.plusButton}
                        onPress={() => {
                            const newPitch = Math.min(2, pitch + 0.1);
                            setPitch(newPitch);
                            notifySettingsChange();
                        }}
                    >
                        <Text style={styles.buttonControlText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Control Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity 
                    style={[styles.controlButton, { backgroundColor: '#4CAF50' }]}
                    onPress={testSpeak}
                >
                    <Text style={[Fonts.Nunito_600SemiBold, styles.buttonText]}>
                        ▶ Test
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.controlButton, { backgroundColor: '#F44336' }]}
                    onPress={stopSpeaking}
                >
                    <Text style={[Fonts.Nunito_600SemiBold, styles.buttonText]}>
                        ■ Stop
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: widthToDp(4),
        marginVertical: heightToDp(2),
        borderWidth: 2,
        borderColor: '#9C27B0',
    },
    title: {
        fontSize: widthToDp(4.5),
        marginBottom: heightToDp(2),
        color: '#333',
    },
    controlGroup: {
        marginBottom: heightToDp(2),
    },
    label: {
        fontSize: widthToDp(3.5),
        color: '#555',
        marginBottom: heightToDp(0.5),
    },
    voiceSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: widthToDp(2),
        borderWidth: 1,
        borderColor: '#DDD',
    },
    arrowButton: {
        padding: widthToDp(2),
    },
    arrowText: {
        fontSize: widthToDp(5),
        color: '#9C27B0',
    },
    voiceNameContainer: {
        flex: 1,
        marginHorizontal: widthToDp(2),
    },
    voiceName: {
        fontSize: widthToDp(3.5),
        color: '#333',
    },
    voiceLanguage: {
        fontSize: widthToDp(3),
        color: '#888',
    },
    buttonControlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthToDp(2),
    },
    minusButton: {
        width: widthToDp(12),
        height: heightToDp(6),
        backgroundColor: '#F44336',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusButton: {
        width: widthToDp(12),
        height: heightToDp(6),
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonControlText: {
        fontSize: widthToDp(8),
        color: 'white',
        fontWeight: 'bold',
    },
    progressBar: {
        flex: 1,
        height: heightToDp(4),
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: heightToDp(1),
    },
    controlButton: {
        flex: 1,
        padding: widthToDp(3),
        borderRadius: 8,
        marginHorizontal: widthToDp(1),
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: widthToDp(3.5),
    },
});

export default ScreenReaderControls;
