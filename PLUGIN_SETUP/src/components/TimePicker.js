import React from "react";
import { Text, Pressable, View, Modal, StyleSheet, SafeAreaView, } from 'react-native';
import Colors from "../utils/Colors";
import Global from "../screens/Global";
import DateTimePicker from "@react-native-community/datetimepicker";
import { widthToDp, heightToDp } from "../utils/Responsive";
import GlobalStyles from "../utils/GlobalStyles";
import Fonts from "../utils/Fonts";

const TimePicker = (props) => {
    const handleTimeChange = (event, time) => {
        if (time !== undefined) {
            props.setValue(time);
        }
        if (Global.OS === "android") {
            props.setTimePickerVisibility(false);
        }
    };

    return (
        <>
            {
                Global.OS === "android" && props.timePickerVisibility ?
                    <DateTimePicker
                        value={props.value}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleTimeChange}
                    />
                    :
                    <Modal visible={props.timePickerVisibility} animationType="fade" transparent={true}>
                        <SafeAreaView style={[styles.mainModalContainer,]}>
                            <View style={[styles.popupContainer]}>
                                <View style={[styles.datePickerContainer,]}>
                                    <DateTimePicker
                                        value={props.value}
                                        mode="time"
                                        is24Hour={true}
                                        display="default"
                                        onChange={handleTimeChange}
                                    />
                                </View>
                                <View style={[styles.doneButtonContainer]}>
                                    <Pressable
                                        onPress={() => props.setTimePickerVisibility(false)}
                                        style={({ pressed }) => ([
                                            {
                                                opacity: pressed ? 0.5 : 1,
                                            }
                                        ])}>
                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold,]}>
                                            DONE
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
            }
        </>
    )
}

export default TimePicker;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.defaultBackground,
    },
    doneButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: heightToDp(25),
    },
    mainModalContainer: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        justifyContent: 'center',
        alignItems: 'center'
    },
    datePickerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        width: '90%',
        backgroundColor: Colors.defaultBackground,
        paddingTop: heightToDp(2),
        borderRadius: 14,
        paddingHorizontal: widthToDp(4),
        paddingBottom: heightToDp(2),
    }
})