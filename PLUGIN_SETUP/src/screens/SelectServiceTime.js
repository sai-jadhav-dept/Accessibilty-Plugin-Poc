import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Keyboard } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import FieldLabel from '../components/FieldLabel';
import { Dropdown } from 'react-native-element-dropdown';
import { scale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';
import Global from './Global';
import DropdownPicker from '../components/DropdownPicker';
import VectorIcons from '../components/VectorIcons';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';

const SelectServiceTime = () => {
    const navigation = useNavigation();

    const myComponentRef = React.createRef();
    const myComponentFromRef = React.createRef();
    const myComponentToRef = React.createRef();
    const myComponentToMinuteRef = React.createRef();
    const [scrollViewPosition, setScrollViewPosition] = useState({ x: 0, y: 0 });
    const [scrollViewFromPosition, setScrollViewFromPosition] = useState({ x: 0, y: 0 });
    const [scrollViewToPosition, setScrollViewToPosition] = useState({ x: 0, y: 0 });
    const [scrollViewToMinutePosition, setScrollViewToMinutePosition] = useState({ x: 0, y: 0 });
    const [showToHourDropdown, setShowToHourDropdown] = useState(false);
    const [showToMinuteDropdown, setShowToMinuteDropdown] = useState(false);
    const [showFromDropdownPicker, setShowFromDropdownPicker] = useState(false);
    const [showFromMinuteDropdown, setShowFromMinuteDropdown] = useState(false);
    const [selectedFromHour, setSelectedFromHour] = useState("");
    const [selectedFromMinute, setSelectedFromMinute] = useState(Global.MinutesOptions[0].value);
    const [selectedToHour, setSelectedToHour] = useState("");
    const [selectedToMinute, setSelectedToMinute] = useState(Global.MinutesOptions[0].value);
    const [difference, setDifference] = useState("");
    const [showScreen, setShowScreen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [selectedMinutesRange, setSelectedMinutesRange] = useState("");

    const timeDuration = [
        { label: "Upto 1 hour", value: "1", minutesRange: { start: 0, end: 60 } },
        { label: "1 to 2 hours", value: "2", minutesRange: { start: 60, end: 120 } },
        { label: "2 to 4 hours", value: "4", minutesRange: { start: 120, end: 240 } },
        { label: "4 to 6 hours", value: "6", minutesRange: { start: 240, end: 360 } },
        { label: "6 to 8 hours", value: "8", minutesRange: { start: 360, end: 480 } },
        { label: "8 to 10 hours", value: "10", minutesRange: { start: 480, end: 600 } },
        { label: "10 to 12 hours", value: "12", minutesRange: { start: 600, end: 720 } },
        { label: "12 to 24 hours", value: "24", minutesRange: { start: 720, end: 1440 } },
    ];

    const [showModal, setShowModal] = useState(false);
    const [nightService, setNightService] = useState(false);
    const [warningText, setWarningText] = useState("");

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };
    const isEndTimeSameAsStartTime = () => {
        const fromTime = `${selectedFromHour}:${selectedFromMinute}`;
        const toTime = `${selectedToHour}:${selectedToMinute}`;

        const startTime = new Date(`2000-01-01 ${fromTime}`);
        const endTime = new Date(`2000-01-01 ${toTime}`);

        return endTime.getTime() === startTime.getTime();
    };

    const onContinueClick = () => {
        const startTime = `${selectedFromHour}:${selectedFromMinute}`;
        const endTime = `${selectedToHour}:${selectedToMinute}`
        if (selectedDuration == "") {
            DisplayError("Please select nurse range");
        } else if (selectedFromHour == "" || selectedFromMinute == "") {
            DisplayError("Please select from service time");
        } else if (!nightService && (selectedToHour == "" || selectedToMinute == "")) {
            DisplayError("Please select to service time");
        }
        else if ((isEndTimeSameAsStartTime) && !nightService && selectedDuration == "12 to 24 hours") {
            DisplayError("Please select valid from and to time");
        }

        else {
            if (!nightService) {
                if (difference >= selectedMinutesRange.start && difference <= selectedMinutesRange.end) {
                    const startTiming = moment(startTime, 'HH:mm').format('hh:mm A');
                    const endTiming = moment(endTime, 'HH:mm').format('hh:mm A');
                    Global.nurseSelecting.startTime = startTiming;
                    Global.nurseSelecting.endTime = nightService ? startTiming : endTiming;
                    navigation.navigate("SelectCareBuddy");
                } else {
                    DisplayError("Please select duration in range");
                }

            } else {
                const startTiming = moment(startTime, 'HH:mm').format('hh:mm A');
                const endTiming = moment(endTime, 'HH:mm').format('hh:mm A');
                Global.nurseSelecting.startTime = startTiming;
                Global.nurseSelecting.endTime = nightService ? startTiming : endTiming;
                navigation.navigate("SelectCareBuddy");

            }

        }
    }

    const onLayout = () => {
        if (myComponentRef.current) {
            myComponentRef.current.measure((x, y, width, height, pageX, pageY) => {
                setScrollViewPosition({ x: pageX, y: pageY, z: width });
            });
        }
    };

    const onLayoutFrom = () => {
        if (myComponentFromRef.current) {
            myComponentFromRef.current.measure((x, y, width, height, pageX, pageY) => {
                setScrollViewFromPosition({ x: pageX, y: pageY, z: width });
            });
        }
    };

    const onLayoutTo = () => {
        if (myComponentToRef.current) {
            myComponentToRef.current.measure((x, y, width, height, pageX, pageY) => {
                setScrollViewToPosition({ x: pageX, y: pageY, z: width });
            });
        }
    };

    const onLayoutToMinute = () => {
        if (myComponentToMinuteRef.current) {
            myComponentToMinuteRef.current.measure((x, y, width, height, pageX, pageY) => {
                setScrollViewToMinutePosition({ x: pageX, y: pageY, z: width });
            });
        }
    };

    function formatTime(hour, minute) {
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        const formattedMinute = minute.toString().padStart(2, "0");
        return `${formattedHour}:${formattedMinute} ${period}`;
    }

    const manuallySelectedStartTime = formatTime(selectedFromHour, selectedFromMinute);
    const manuallySelectedEndTime = formatTime(selectedToHour, selectedToMinute);

    const convertTimeToMinutes = (time) => {
        const [hourString, minuteString] = time.split(':');
        const hour = parseInt(hourString, 10);
        const minuteIndex = minuteString.indexOf(' ');
        const minute = parseInt(minuteString.substring(0, minuteIndex), 10);
        const ampm = minuteString.substring(minuteIndex + 1);

        let hour24;
        if (ampm === 'AM') {
            hour24 = hour === 12 ? 0 : hour;
        } else if (ampm === 'PM') {
            hour24 = hour === 12 ? 12 : hour + 12;
        }
        return hour24 * 60 + minute;
    };

    useEffect(() => {
        const manuallySelectedTimeInMinutes = convertTimeToMinutes(manuallySelectedStartTime);
        const manuallySelectedEndTimeInMinutes = convertTimeToMinutes(manuallySelectedEndTime);
        setDifference(manuallySelectedEndTimeInMinutes - manuallySelectedTimeInMinutes);
    }, [manuallySelectedStartTime, manuallySelectedEndTime]);

    const DropDownValues = (item) => {
        setSelectedDuration(item.label);
        Global.NurseappointmentDetails.totalServiceTime = item
        setSelectedMinutesRange(item.minutesRange);
    }

    useEffect(() => {
        if (Global.OS == "ios") {
            setTimeout(() => {
                setSelectedFromHour(Global.HoursIn24Format[0].value);
                setSelectedFromHour('');
                setSelectedToHour(Global.HoursIn24Format[0].value);
                setSelectedToHour('');
                setSelectedFromMinute(Global.MinutesOptions[0].value);
                setSelectedFromMinute('');
                setSelectedToMinute(Global.MinutesOptions[0].value);
                setSelectedToMinute('');
            }, 700);
        }
    }, [])
    useEffect(() => {
        if (Global.OS === "ios") {
            setLoading(true);
            setTimeout(() => {
                setShowScreen(true);
                setLoading(false);
            }, 2000);
        }
        else {
            setShowScreen(true);
        }
    }, [])

    const StartTimeHour = () => {
        Keyboard.dismiss();
        setShowFromDropdownPicker(true);
        setSelectedToHour("");
    }
    return (
        <>
            <SafeAreaView style={GlobalStyles.mainContainer}>
                <View style={GlobalStyles.mainBox}>
                    <Header
                        headerTitle="Back"
                        onPress={() => navigation.goBack()}
                    />
                    {showScreen && <View style={GlobalStyles.mainContainer}>
                        <FieldLabel text={"Select range"} />
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.primaryTextColor, marginTop: heightToDp(2) }]}>Select the duration of the care buddy service, ranging from 1 hour to several hours.
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                style={[styles.dropdown]}
                                placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor }]}
                                selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                inputSearchStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                iconStyle={{ width: 20, height: 20, marginRight: widthToDp(2) }}
                                itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                itemContainerStyle={{ paddingHorizontal: 5, margin: -5 }}
                                data={timeDuration}
                                placeholder="Select Nurse Range*"
                                maxHeight={300}
                                labelField="label"
                                valueField="label"
                                value={selectedDuration}
                                onChange={(item) => DropDownValues(item)}
                            />
                        </View>
                        <FieldLabel text={"Select service time"} />
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.primaryTextColor, marginVertical: heightToDp(2) }]}>Please choose the tentative Start and End time you would like to schedule your care buddy service.
                        </Text>
                        <View>{selectedDuration == "12 to 24 hours" &&
                            <View style={{ flexDirection: "row", alignItems: "center", width: widthToDp(50), justifyContent: "space-between" }}>
                                <FieldLabel TextType={"Medium"} text={"Select 24 Hours"} extraStyles={{ marginBottom: heightToDp(2) }} />
                                <Pressable onPress={() => setNightService(!nightService)}>
                                    {
                                        nightService ?
                                            <VectorIcons groupName='AntDesign' iconName='checksquare' iconstyle={[{ color: Colors.primaryButtonColor }]} />
                                            :
                                            <VectorIcons groupName='MaterialCommunityIcons' iconName='checkbox-blank-outline' iconstyle={[{ color: Colors.primaryinactive }]} />
                                    }
                                </Pressable>
                            </View>}

                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}>From</Text>
                                    <Text style={[GlobalStyles.mediumText, { color: Colors.red }, Fonts.Nunito_700Bold]}>*</Text>
                                </View>
                                <View style={[{ flexDirection: "row", justifyContent: "space-between", width: "80%" }]}>
                                    <Pressable
                                        ref={myComponentRef}
                                        onLayout={onLayout}
                                        onPress={() => StartTimeHour()}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, borderRadius: 14, width: "48%", flexDirection: "row", paddingVertical: heightToDp(1), justifyContent: "space-between", backgroundColor: Colors.boxBackground, alignItems: "center", paddingHorizontal: widthToDp(5), height: 58 })}
                                    >
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.mediumText, { color: selectedFromHour == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                            {selectedFromHour == "" ? "Select" : selectedFromHour}
                                        </Text>
                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                    </Pressable>
                                    <Pressable
                                        ref={myComponentFromRef}
                                        onLayout={onLayoutFrom}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setShowFromMinuteDropdown(true);
                                            setSelectedToHour("");
                                            setSelectedToMinute(Global.MinutesOptions[0].value);
                                        }}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, borderRadius: 14, width: "48%", flexDirection: "row", paddingVertical: heightToDp(1), justifyContent: "space-between", backgroundColor: Colors.boxBackground, alignItems: "center", paddingHorizontal: widthToDp(5), height: 58 })}
                                    >
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.mediumText, { color: selectedFromMinute == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                            {selectedFromMinute == "" ? "Select" : selectedFromMinute}
                                        </Text>
                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                    </Pressable>
                                </View>
                            </View>
                            {!nightService && <View style={{ flexDirection: "row", marginTop: heightToDp(2), alignItems: "center", justifyContent: "space-between", marginBottom: heightToDp(2) }}>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}>To</Text>
                                    <Text style={[GlobalStyles.mediumText, { color: Colors.red }, Fonts.Nunito_700Bold]}>*</Text>
                                </View>
                                <View style={[{ flexDirection: "row", justifyContent: "space-between", width: "80%" }]}>
                                    <Pressable
                                        ref={myComponentToRef}
                                        onLayout={onLayoutTo}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setShowToHourDropdown(true);
                                        }}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, borderRadius: 14, width: "48%", flexDirection: "row", paddingVertical: heightToDp(1), justifyContent: "space-between", backgroundColor: Colors.boxBackground, alignItems: "center", paddingHorizontal: widthToDp(5), height: 58 })}
                                    >
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.mediumText, { color: selectedToHour == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                            {selectedToHour == "" ? "Select" : selectedToHour}
                                        </Text>
                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                    </Pressable>
                                    <Pressable
                                        ref={myComponentToMinuteRef}
                                        onLayout={onLayoutToMinute}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setShowToMinuteDropdown(true);
                                        }}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, borderRadius: 14, width: "48%", flexDirection: "row", paddingVertical: heightToDp(1), justifyContent: "space-between", backgroundColor: Colors.boxBackground, alignItems: "center", paddingHorizontal: widthToDp(5), height: 58 })}
                                    >
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.mediumText, { color: selectedToMinute == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                            {selectedToMinute == "" ? "Select" : selectedToMinute}
                                        </Text>
                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                    </Pressable>
                                </View>
                            </View>}
                        </View>
                    </View>}
                    <CommonButton
                        buttonText={"Continue"}
                        extraStyles={{ marginVertical: heightToDp(5) }}
                        onPress={onContinueClick} />
                    <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                    <Spinner
                        visible={loading}
                        color={Colors.primaryButtonColor}
                        customIndicator={<Loader />}
                        textStyle={{ color: Colors.primaryButtonColor }}
                    />
                </View>
            </SafeAreaView>
            {
                showFromDropdownPicker &&
                <DropdownPicker
                    showDropdownPicker={showFromDropdownPicker}
                    setShowDropdownPicker={setShowFromDropdownPicker}
                    data={Global.HoursIn24Format}
                    selectedValue={selectedFromHour}
                    scrollViewPosition={scrollViewPosition}
                    maxDropdownHeight={200}
                    setOtherValue={() => {
                        if (selectedFromMinute == "") {
                            setSelectedFromMinute("00")
                        }
                    }}
                    onValueSelect={setSelectedFromHour}
                />
            }
            {
                showFromMinuteDropdown &&
                <DropdownPicker
                    showDropdownPicker={showFromMinuteDropdown}
                    setShowDropdownPicker={setShowFromMinuteDropdown}
                    data={Global.MinutesOptions}
                    selectedValue={selectedFromMinute}
                    scrollViewPosition={scrollViewFromPosition}
                    onValueSelect={setSelectedFromMinute}
                    maxDropdownHeight={150}
                />
            }
            {
                showToHourDropdown &&
                <DropdownPicker
                    showDropdownPicker={showToHourDropdown}
                    setShowDropdownPicker={setShowToHourDropdown}
                    data={Global.HoursIn24Format}
                    selectedValue={selectedToHour}
                    scrollViewPosition={scrollViewToPosition}
                    onValueSelect={setSelectedToHour}
                    maxDropdownHeight={150}
                    setOtherValue={() => {
                        if (selectedToMinute == "") {
                            setSelectedToMinute("00")
                        }
                    }}
                />
            }
            {
                showToMinuteDropdown &&
                <DropdownPicker
                    showDropdownPicker={showToMinuteDropdown}
                    setShowDropdownPicker={setShowToMinuteDropdown}
                    data={Global.MinutesOptions}
                    selectedValue={selectedToMinute}
                    scrollViewPosition={scrollViewToMinutePosition}
                    onValueSelect={setSelectedToMinute}
                    maxDropdownHeight={150}
                />
            }
        </>
    );
}

const styles = StyleSheet.create({
    timeSlot: {
        width: widthToDp(40),
        paddingVertical: heightToDp(2),
        borderRadius: 14,
        alignSelf: "center",
        marginVertical: heightToDp(1)
    },
    doseInput: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(2),
        marginVertical: heightToDp(1)
    },
    timePickerText: {
        fontSize: scale(10),
    },
    dropdown: {
        fontSize: scale(50),
        height: heightToDp(6.5),
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        marginLeft: widthToDp(2)
    },
    dropdownContainer: {
        width: '100%',
        flexDirection: 'column',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginTop: heightToDp(2),
        marginBottom: heightToDp(0.2),
        paddingVertical: widthToDp(1),
        paddingHorizontal: widthToDp(2)
    },
});

export default SelectServiceTime;