import { View, StyleSheet, Pressable, Text, Platform, Dimensions } from 'react-native'
import React, { useState } from 'react'
import Draggable from 'react-native-draggable';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import { usePageRead } from './usePageRead';
import Global from '../screens/Global';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ReadModal = ({ activeModal }) => {
    const pageRead = usePageRead(Global.pageReadText);
    const [isMinimized, setIsMinimized] = useState(false);
    
    if (!activeModal) return null;
    
    if (isMinimized) {
        return (
            <Draggable
                x={SCREEN_WIDTH - 70}
                y={SCREEN_HEIGHT / 2}
                minX={0}
                minY={0}
                maxX={SCREEN_WIDTH - 60}
                maxY={SCREEN_HEIGHT - 60}
            >
                <Pressable 
                    style={styles.minimizedButton}
                    onPress={() => setIsMinimized(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Expand page reader"
                >
                    <Text style={styles.minimizedIcon}>🔊</Text>
                </Pressable>
            </Draggable>
        );
    }
    
    return (
        <Draggable
            x={10}
            y={SCREEN_HEIGHT - 200}
            minX={0}
            minY={0}
            maxX={SCREEN_WIDTH}
            maxY={SCREEN_HEIGHT}
            isCircle={true}
        >
            <Pressable style={styles.modalContainer}>
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
                            pageRead.stop();
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
                    <Text style={[Fonts.Nunito_600SemiBold,styles.headerTitle]}>Page Reader</Text>
                </View>

                {/* Control Buttons */}
                <View style={styles.controlsRow}>
                    <PageReadButton
                        icon="▶"
                        label="Start"
                        onPress={pageRead.start}
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
            </Pressable>
        </Draggable>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        width: 340,
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
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 4,
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

