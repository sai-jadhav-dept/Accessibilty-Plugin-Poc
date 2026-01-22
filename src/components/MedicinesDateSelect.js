import React, { useState } from 'react';
import { Pressable, Image, View, Text, Modal, StyleSheet } from 'react-native';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import moment from 'moment';
import CalendarPicker from 'react-native-calendar-picker';
import VectorIcons from './VectorIcons';
import { scale } from 'react-native-size-matters';
import Fonts from '../utils/Fonts';
import GlobalStyles from '../utils/GlobalStyles';

export default function MedicinesDateSelect(props) {
    const threeMonthsFromNow = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const minDate = props.minDate ? props.minDate : new Date();
    const maxDate = props.maxDate ? moment(props.maxDate, "DD/MM/YYYY") : (props.fromNurseAppointment) ? oneYearFromNow : threeMonthsFromNow;

    const onDateChange = (date) => {
        setShowDatePickerModal(false);
        props.onDateSelect(date);
    };

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const minSelectableDate = props.showNextDay ? nextDay : minDate;

    if (props.fromNurseAppointment) {
        minDate.setFullYear(minDate.getFullYear() - 1);
    }

    return (
        <View style={{ width: props.mainDateContainer ? "70%" : "100%" }}>
            <Pressable
                onPress={() => { setShowDatePickerModal(true) }}
                style={({ pressed }) => ([styles.mainDateContainer, props.extraStyles, { opacity: pressed ? 0.5 : 1 }])}
            >
                {props.placeholderDisplay &&
                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { color: Colors.placeholderTextColor, marginLeft: widthToDp(2), width: "20%" }]}>{props.placeholderDisplay}</Text>
                }
                {props.selectedDate ? <Text style={[styles.textInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, props.extraTextStyles]}>
                    {props.selectedDate ? moment(props.selectedDate).format("DD/MM/YYYY") : ""}
                </Text> :
                    <Text style={[styles.textInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, props.extraPlaceholderTextStyles, { color: Colors.placeholderTextColor }]}>
                        Please select date
                    </Text>}
                <View
                    style={styles.button}
                >
                    <Image resizeMode="contain" style={[styles.icon, props.extraImagestyle]} source={require('../assets/vectors/calender_icon.png')} />
                </View>
            </Pressable>
            <Modal
                visible={showDatePickerModal}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.modalcontainer}>
                    <View style={styles.boxcontainer}>
                        <View style={styles.selectcontainer}>
                            <Pressable
                                hitSlop={15}
                                onPress={() => setShowDatePickerModal(false)}
                                style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.4 : 1 }]}
                            >
                                <VectorIcons groupName="Ionicons" iconName="close" iconsize={widthToDp(6)} iconstyle={{ color: Colors.primaryTextColor }} />
                            </Pressable>
                        </View>
                        <CalendarPicker
                            textStyle={[{ fontSize: responsiveFont(scale(16)), color: Colors.primaryTextColor }, Fonts.Nunito_700Bold]}
                            selectedDayColor={Colors.primaryButtonColor}
                            selectedDayTextColor={Colors.boxBackground}
                            selectedStartDate={props.showNextDay ? nextDay : props.selectedDate || undefined}
                            initialDate={props.showNextDay ? nextDay : props.selectedDate || new Date()}
                            onDateChange={onDateChange}
                            minDate={minSelectableDate}
                            maxDate={maxDate}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainDateContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
    },
    textInput: {
        flex: 1,
        paddingLeft: widthToDp(4),
        fontSize: 16,
        color: Colors.primaryTextColor,
    },
    modalcontainer: {
        backgroundColor: Colors.modalBackground,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxcontainer: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        width: '97%',
        paddingBottom: widthToDp(4),
    },
    selectcontainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        borderRadius: 14,
        paddingHorizontal: widthToDp(2),
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    icon: {
        width: widthToDp(7),
        height: heightToDp(7),
        marginRight: widthToDp(2),
    },
    closeButton: {
        marginRight: widthToDp(3),
        marginVertical: heightToDp(1),
        backgroundColor: Colors.boxBackground,
        justifyContent: 'center',
        borderRadius: 50,
        alignItems: 'center',
        height: heightToDp(5),
        width: widthToDp(7),
    },
    calendarText: {
        fontSize: 16,
        color: Colors.primaryTextColor,
    }
});
