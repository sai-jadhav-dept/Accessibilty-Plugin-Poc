import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, SafeAreaView, Modal } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import VectorIcons from '../components/VectorIcons';
import { widthToDp, heightToDp } from '../utils/Responsive';
import { moderateScale, scale } from 'react-native-size-matters';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import MedicineReminderCard from '../components/MedicineReminderCard';
import Global from './Global';

const Timeline = (props) => {
    const [medicineReminderData, setMedicineReminderData] = useState([]);
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [dateObj, setDateObj] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 6);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);

    const toggleItem = (item) => {
        const newData = medicineReminderData.map((accItem) =>
            accItem.dataType === item.dataType ? { ...accItem, expanded: !accItem.expanded } : accItem
        );
        setMedicineReminderData(newData);
    };

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const onDateChange = (date) => {
        setDateObj(date);
        setShowDatePickerModal(false);
    }

    const MedicineCardHeader = ({ item, index, paddingBottom }) => {
        return (
            <Pressable
                style={({ pressed }) => ([GlobalStyles.rowFlexstart, { width: '100%', opacity: pressed ? 0.5 : 1, paddingBottom: paddingBottom ? 0 : heightToDp(5) }])}
                onPress={() => toggleItem(item)}
            >
                <VectorIcons groupName='MaterialCommunityIcons' iconName='checkbox-blank-circle' iconstyle={[{ color: index == 0 ? Colors.primaryButtonColor : Colors.lightblue, marginRight: widthToDp(4) }]} />
                <Text style={[GlobalStyles.normalText, { marginRight: widthToDp(4) }, Fonts.Nunito_700Bold]}>{item.dataType}</Text>
                <View style={[{ borderBottomWidth: 1, borderBottomColor: 'rgba(60, 60, 67, 0.36)', flex: 1 }]} />
                <View hitSlop={10}>
                    <VectorIcons groupName='AntDesign' iconName='down' iconstyle={[{ color: Colors.primaryTextColor, marginLeft: widthToDp(3) }]} />
                </View>
            </Pressable>
        );
    };

    const getTimelinedata = async () => {
        try {
            const body = {
                "treatmentCycleId": props.cycleID.toString(),
                "date": moment(dateObj).format("DD/MM/YYYY"),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall("appointments/gettimelinedata", body);
            const combineData = [];
            response.appointmentInfo.forEach((values, i) => {
                values.dataType = "Appointments";
                combineData.push(values);
            });
            response.medicationInfo.forEach((values, i) => {
                values.dataType = "Medication";
                combineData.push(values);
            });
            setMedicineReminderData(combineData);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const cancelMedication = async (data) => {
        try {
            const body = {
                "medicationId": "1",
                "date": moment(dateObj).format("DD/MM/YYYY"),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await apiCall("medications/cancelmedication", body);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        getTimelinedata();
    }, [props.cycleID, dateObj]);

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold]}>
                        Your Timeline
                    </Text>
                    <Pressable
                        onPress={() => setShowDatePickerModal(true)}
                        style={({ pressed }) => ([{
                            opacity: pressed ? 0.4 : 1,
                            flexDirection: 'row',
                            width: "auto",
                            maxWidth: "40%",
                            justifyContent: "space-between",
                            padding: widthToDp(2),
                            borderRadius: 14,
                            backgroundColor: Colors.boxBackground
                        }, GlobalStyles.inputBoxShadow])}>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                            {moment(dateObj).format("DD/MM/YYYY") === moment(new Date()).format("DD/MM/YYYY") ? "Today" : moment(dateObj).format("DD/MM/YYYY")}
                        </Text>
                        <VectorIcons groupName='FontAwesome' iconName='calendar' iconstyle={[{ color: Colors.primaryTextColor, marginLeft: widthToDp(2) }]} iconsize={scale(20)} />
                    </Pressable>
                </View>
                <View>
                    {medicineReminderData.length > 0 ?
                        <FlatList
                            style={[GlobalStyles.fixedTopSpacing, { height: heightToDp(56) }]}
                            data={medicineReminderData}
                            keyExtractor={(item, index) => index + "Key"}
                            renderItem={({ item, index }) => {
                                const isFirstItem = index === 0 || item.dataType !== medicineReminderData[index - 1].dataType;
                                return (
                                    <View style={[GlobalStyles.columnFlexstart, { marginBottom: medicineReminderData.length - 1 == index ? heightToDp(33) : 0 }]}>
                                        {isFirstItem && <MedicineCardHeader item={item} index={index} paddingBottom={!item.expanded} />}
                                        {!item.expanded && <View style={{ borderLeftWidth: medicineReminderData.length == index ? 0 : 1, borderLeftColor: Colors.primaryButtonColor, width: '100%', marginLeft: widthToDp(5.5), paddingRight: widthToDp(4), paddingTop: heightToDp(2) }}>
                                            {item.dataType == "Medication" ? (
                                                <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, marginLeft: -widthToDp(10) }])}                                                >
                                                    <MedicineReminderCard item={item} responseMedicationReminder={medicineReminderData} isTimeLine={true} cancelMedication={cancelMedication} />
                                                </Pressable>
                                            ) : (
                                                <Pressable style={({ pressed }) => ([styles.medicineDataCard, { opacity: pressed ? 0.5 : 1 }])}>
                                                    <View style={[styles.medicineCardHeader]}>
                                                        <View style={{ marginLeft: widthToDp(3) }}>
                                                            <Text style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                                {item.type == "Doctor Visit" ? `Dr. ${item.name}` : item.name}
                                                            </Text>
                                                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                                                {item.specialization}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ flexDirection: "row", marginHorizontal: widthToDp(6), marginTop: heightToDp(2) }}>
                                                        <VectorIcons groupName={"AntDesign"} iconName={"clockcircle"} iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(20)} />
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(4) }]}>
                                                            {item.time}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: "row", marginHorizontal: widthToDp(6), marginTop: heightToDp(2) }}>
                                                        <VectorIcons groupName={"Ionicons"} iconName={"location-sharp"} iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(20)} />
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(4) }]}>
                                                            {item.mode}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: "row", marginHorizontal: widthToDp(7), marginTop: heightToDp(2), marginBottom: heightToDp(4) }}>
                                                        <VectorIcons groupName={"FontAwesome5"} iconName={"notes-medical"} iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(18)} />
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(4) }]} >{item.type}</Text>
                                                    </View>
                                                </Pressable>
                                            )}
                                        </View>}
                                    </View>)
                            }}
                        /> :
                        <View style={{ width: "100%", height: "80%", justifyContent: "center", alignItems: "center" }}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>No data</Text>
                        </View>
                    }

                </View>
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
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
                                minDate={minDate}
                                maxDate={maxDate}
                                onDateChange={onDateChange}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    medicineDataCard: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: Colors.defaultBackground,
        borderWidth: 1,
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        marginLeft: widthToDp(6),
        marginRight: widthToDp(2),
    },
    medicineCardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: "center",
        marginLeft: widthToDp(4),
        marginTop: heightToDp(2),
        width: "87%",
        marginBottom: heightToDp(1)
    },
    imgg: {
        height: widthToDp(16),
        width: widthToDp(16),
        borderRadius: 50,
        overflow: "hidden"
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
    daytext: {
        marginRight: widthToDp(2),
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
    },
    rescheduleBtn: {
        borderRadius: 14,
        paddingVertical: heightToDp(2),
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%'
    }
});
export default Timeline;