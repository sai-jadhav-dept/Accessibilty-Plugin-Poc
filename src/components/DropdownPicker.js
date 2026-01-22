import React from 'react';
import { Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';

const DropdownPicker = ({ showDropdownPicker, setShowDropdownPicker, data, onValueSelect, scrollViewPosition, maxDropdownHeight, setOtherValue }) => {

    const handlePress = (item) => {
        onValueSelect(item.value);
        if (setOtherValue) {
            setOtherValue();
        }
        setShowDropdownPicker(false);
    };

    return (
        <Pressable onPress={() => setShowDropdownPicker(false)} style={{ width: "100%", position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
            {showDropdownPicker && (
                <ScrollView
                    keyboardShouldPersistTaps={'handled'}
                    style={[styles.modalContent, GlobalStyles.inputBoxShadow, { top: scrollViewPosition.y, left: scrollViewPosition.x, maxHeight: maxDropdownHeight ? maxDropdownHeight : heightToDp(30), width: scrollViewPosition.z }]}
                >
                    {data.map((item, index) => (
                        <Pressable
                            key={index}
                            style={({ pressed }) => ({ backgroundColor: pressed ? Colors.boxBackground : Colors.defaultBackground, paddingVertical: heightToDp(2), paddingHorizontal: widthToDp(4), zIndex: 999 })}
                            onPress={() => handlePress(item)}
                        >
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}>{item.value}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        marginTop: heightToDp(8),
        maxHeight: heightToDp(30),
        overflow: "hidden",
        backgroundColor: Colors.defaultBackground,
        position: 'absolute',
        width: '36%',
    }
});

export default DropdownPicker;