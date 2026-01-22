import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import GlobalStyles from '../utils/GlobalStyles';
import { moderateScale, scale } from 'react-native-size-matters';
import TimePicker from './TimePicker';

const VitalOptions = (props) => {
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [dateObj, setDateObj] = useState(props.date);
    const [timePickerVisibility, setTimePickerVisibility] = useState(false);

    const onDateChange = (date) => {
        const ddmmyy = moment(date).format('DD/MM/YYYY');
        setShowDatePickerModal(false);
        setDateObj(date);
        props.setEditable(props.selectedTreatmentCycleObj, ddmmyy);
        props.setDate(date);
        props.onRefreshBtn(date, props.cycleID);
    }

    return (
        <View style={[GlobalStyles.rowSpaceBetween, props.extraStyles]}>
            {
                props.isReadingsScreen && props.showHistory && (
                    <Pressable
                        style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}
                        onPress={() => { setTimePickerVisibility(true) }}>
                        <Text style={[styles.timetext, Fonts.Nunito_600SemiBold]}>{moment(props.readingTime).format("hh:mm A") || "12:40 PM"}</Text>
                    </Pressable>
                )
            }
            <View style={[styles.sectioncontainer, { marginVertical: props.isReadingsScreen ? heightToDp(0) : heightToDp(0.5) }]}>
                <Pressable
                    disabled={props.isReadingsScreen}
                    onPress={() => setShowDatePickerModal(true)}
                    style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                        opacity: pressed ? 0.4 : 1,
                        marginRight: props.isReadingsScreen ? widthToDp(0) : widthToDp(6),
                        backgroundColor: props.isReadingsScreen ? Colors.boxBackground : Colors.defaultBackground,
                        paddingHorizontal: props.isReadingsScreen ? widthToDp(3) : widthToDp(0),
                        paddingVertical: props.isReadingsScreen ? heightToDp(1) : heightToDp(0),
                        borderRadius: props.isReadingsScreen ? 14 : 0
                    }])}>
                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, !props.isReadingsScreen && { marginRight: widthToDp(2) }]}>
                        {moment(props.date).format('DD/MM/YYYY') == moment(new Date()).format('DD/MM/YYYY') ? "Today" : moment(props.date).format('DD/MM/YYYY')}
                    </Text>
                    {!props.isReadingsScreen &&
                        <VectorIcons groupName='FontAwesome' iconName='calendar' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(20)} />
                    }
                </Pressable>
                {!props.isReadingsScreen &&
                    <>
                        <Pressable hitSlop={15} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1, marginRight: widthToDp(6) }])} onPress={() => { props.onRefreshBtn(dateObj, props.cycleID) }}>
                            <VectorIcons groupName='FontAwesome' iconName='refresh' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(20)} />
                        </Pressable>
                        <Pressable hitSlop={15} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                            onPress={props.ShareData}
                        >
                            <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(22)} />
                        </Pressable>
                    </>
                }
            </View>
            <TimePicker
                timePickerVisibility={timePickerVisibility}
                value={props.readingTime}
                setValue={(time) => {
                    props.setTime(time);
                }}
                setTimePickerVisibility={setTimePickerVisibility}
            />
            <Modal visible={showDatePickerModal} animationType={'fade'} transparent={true}>
                <View style={[GlobalStyles.columnCenter, styles.modalcontainer]}>
                    <View style={styles.calender}>
                        <View style={styles.closeicon}>
                            <Pressable
                                hitSlop={15}
                                onPress={() => { setShowDatePickerModal(false) }}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, styles.closeButton])}>
                                <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(25)} iconstyle={{ color: Colors.placeholderTextColor }} />
                            </Pressable>
                        </View>
                        <CalendarPicker
                            textStyle={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}
                            restrictMonthNavigation={true}
                            selectedDayColor={Colors.primaryButtonColor}
                            selectedDayTextColor={Colors.boxBackground}
                            selectedStartDate={dateObj || moment()}
                            initialDate={dateObj || moment()}
                            minDate={new Date().setFullYear(new Date().getFullYear() - 5)}
                            maxDate={new Date()}
                            onDateChange={onDateChange}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );

}

const styles = StyleSheet.create({
    sectioncontainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
    },
    modalcontainer: {
        backgroundColor: Colors.modalBackground,
        flex: 1,
    },
    calender: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        width: '97%',
        paddingBottom: widthToDp(4),
    },
    closeicon: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    timetext: {
        color: '#e09226',
        fontSize: scale(16),
        marginLeft: widthToDp(2),
    },
    closeButton: {
        marginRight: 8,
        marginTop: widthToDp(4),
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        borderRadius: 50,
        alignItems: "center",
        height: moderateScale(30),
        width: moderateScale(30),
    }
})

export default VitalOptions;