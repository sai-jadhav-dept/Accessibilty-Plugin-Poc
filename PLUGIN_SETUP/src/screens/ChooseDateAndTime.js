import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header'
import Colors from '../utils/Colors';
import { scale, verticalScale } from 'react-native-size-matters';
import Fonts from '../utils/Fonts';
import FieldLabel from '../components/FieldLabel';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import Global from './Global';
import { apiCall } from '../utils/ApiUtils';
import moment from 'moment';
import { heightToDp } from '../utils/Responsive';
import CommonButton from '../components/CommonButton';
const ChooseDateAndTime = ({ route }) => {

    const navigation = useNavigation();
    let Purpose = route.params.Purpose || "";
    let Mode = route?.params?.Mode || "";
    let Type = route?.params?.Type || "";
    let modeId = route.params.modeId || "";
    let purposeId = route.params.purposeId || "";
    let hospitaldata = route.params.hospitalData;

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [planData, setPlanData] = useState([])
    const [selectMonth, setSelectMonth] = useState([]);
    const [time, setTime] = useState([]);
    const [selectTime, setSelectTime] = useState("");
    const [newDate, setNewDate] = useState("");
    const [previousTime, setPreviousTime] = useState([]);
    const [date, setDate] = useState("");

    const daysArray = selectMonth ? selectMonth.days?.split(',') : [];

    const GetDoctorPlanData = async () => {
        try {
            const body = {
                "id": route.params.doctorData.id.toString(),
                "mode": Mode.toString(),
                "hospitalId": Mode == "Virtual" || Mode == "Home Visit" ? "0" : hospitaldata.id.toString(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall("appointments/getdoctorplandata", body);
            setPlanData(response.time);
            setSelectMonth(response.time[0]);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again.");
        }
    }

    function convertTo12HourFormat(time) {
        return moment(time, 'HH:mm').format('hh:mm A');
    }

    const GetDoctorPlanDetails = async (item) => {
        if (!Global.clicked) {
            Global.clicked = true;
            const year = selectMonth.year;
            const month = selectMonth.month.substring(0, 3);
            const date = item.length == 1 ? `0${item}` : item;
            const modifiedDate = `${date}-${month}-${year}`;
            setNewDate(modifiedDate);
            try {
                const body = {
                    "id": route.params.doctorData.id.toString(),
                    "mode": Mode.toString(),
                    "appointmentTypeId": purposeId.toString(),
                    "hospitalId": Mode == "Virtual" || Mode == "Home Visit" ? "0" : hospitaldata.id.toString(),
                    "date": modifiedDate.toString(),
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                setLoading(true);
                const response = await apiCall("registration/getdoctorplandetails", body);
                const data = response.time;
                const updatedResponse = data.reduce((prev, item) => {
                    const endTime = moment(item.time, "HH:mm").add(parseInt(item.tentativeTime), "minutes").format("HH:mm");
                    const newItem = {
                        planId: item.planId,
                        planDetailsId: item.planDetailsId,
                        time: item.time,
                        endTime: endTime,
                        mode: item.mode,
                        isAvailable: item.isAvailable,
                        fees: item.fees,
                        newTime: convertTo12HourFormat(item.time),
                    };
                    prev.push(newItem);
                    return prev;
                }, []);
                const currentTime = moment();
                const currentDateTime = currentTime.format("DD-MMM-YYYY");
                if (modifiedDate == currentDateTime) {
                    const currentTime = moment();
                    var previousTime = [];
                    const times = updatedResponse.reduce((prev, item) => {
                        const itemTime = moment(item.newTime, 'hh:mm A');
                        if (itemTime.isAfter(currentTime)) {
                            prev.push(item);
                        } else {
                            previousTime.push(item);
                        }
                        return prev;
                    }, []);
                    setPreviousTime(previousTime)
                    setTime(times);
                } else {
                    setTime(updatedResponse);
                    setPreviousTime([]);
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    }
    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };
    useEffect(() => {
        GetDoctorPlanData();
    }, []);

    const OnMonthPress = (item) => {
        setDate("");
        setPreviousTime([]);
        setTime([]);
        setSelectTime("");
        setSelectMonth(item);
    }
    const onDatePress = async (item) => {
        setSelectTime("");
        setDate(item);
        await GetDoctorPlanDetails(item);
    }
    const onTimePress = (item) => {
        setSelectTime(item);
    }
    const onBookClick = () => {
        navigation.navigate("DoctorReviewAppointment", { selectedDoctorDetail: route.params.doctorData, Type: Type, Mode: Mode, Purpose: Purpose, Time: selectTime, SelectedDate: newDate, hospitaldata: hospitaldata, modeId: modeId, purposeId: purposeId, location: route?.params?.location });
    }
    const onBackClick = () => {
        if (Mode == "Virtual" || Mode == "Home Visit") {
            navigation.navigate("SelectDoctorScreen", { selectedDoctorDetail: route.params.doctorData, Type: Type, Mode: Mode, Purpose: Purpose, modeId: modeId, purposeId: purposeId })
        } else {
            navigation.navigate("QuickAccessList", { selectedDoctorDetail: route.params.doctorData, Type: Type, Mode: Mode, Purpose: Purpose, modeId: modeId, purposeId: purposeId, location: route?.params?.location })
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={[GlobalStyles.mainBox, { position: 'relative' }]}>
                <Header headerTitle="Choose Date & Time"
                    onPress={() =>
                        onBackClick()
                    } />
                <ScrollView style={{ marginBottom: heightToDp(12) }}>
                    <FieldLabel text={"Select Month"} Nospace={true} extraStyles={[styles.selectMonthStyle]} />
                    <View style={[{ flexDirection: "row", flexWrap: "wrap" }]}>
                        {
                            planData.map((item, index) => (
                                <Pressable key={index} style={[styles.monthButtonContainer, selectMonth?.month == item?.month && { backgroundColor: Colors.primaryButtonColor }]} onPress={() => { OnMonthPress(item) }}  >
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.monthButtonText, selectMonth?.month == item?.month && { color: Colors.defaultBackground }]}>
                                        {`${item?.month.substring(0, 3)} ${item.year?.slice(-2)}`}
                                    </Text>
                                </Pressable>
                            ))
                        }
                    </View>
                    {daysArray && <FieldLabel text={"Select Date"} Nospace={true} extraStyles={[styles.selectMonthStyle]} />}
                    <View style={[{ flexDirection: "row", flexWrap: 'wrap' }]}>
                        {
                            daysArray?.map((item, index) => (
                                <Pressable key={index} style={[styles.dateContainer, date == item && { backgroundColor: Colors.primaryButtonColor }]} onPress={async () => { await onDatePress(item) }} >
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { textAlign: "center" }, date == item && { color: Colors.defaultBackground }]}>
                                        {item}
                                    </Text>
                                </Pressable>
                            ))
                        }
                    </View>
                    {date != "" && <FieldLabel text={"Select Time"} Nospace={true} extraStyles={[styles.selectMonthStyle]} />}

                    <View style={[{ flexDirection: "row", flexWrap: "wrap" }]}>
                        {

                            previousTime.map((item, index) => (
                                <Pressable key={index} style={[styles.monthButtonContainer]} >
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.monthButtonText, { color: Colors.primaryinactive }]}>
                                        {item.newTime}
                                    </Text>
                                </Pressable>
                            ))
                        }
                        {
                            time.map((item, index) => (
                                <Pressable key={index} style={[styles.monthButtonContainer, selectTime.time == item.time && { backgroundColor: Colors.primaryButtonColor }]} onPress={() => { item.isAvailable == "Yes" && onTimePress(item) }} >
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.monthButtonText, selectTime.time == item.time && { color: Colors.defaultBackground }, item.isAvailable == "No" && { color: Colors.primaryinactive }]}>
                                        {item.newTime}
                                    </Text>
                                </Pressable>
                            ))
                        }
                    </View>
                </ScrollView>
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                <CommonButton
                    disabled={selectTime == ""}
                    buttonText="Book"
                    onPress={() => { onBookClick() }}
                    extraStyles={[GlobalStyles.fixbottomcommonButton, { marginTop: heightToDp(2), color: Colors.primaryinactive, opacity: selectTime == "" ? 0.5 : 1 }]}
                    visible={true}
                />
            </View>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({
    selectMonthStyle: {
        marginVertical: verticalScale(10),
    },
    monthButtonContainer: {
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(10),
        marginLeft: scale(10),
        borderRadius: scale(10),
        width: "30%",
        marginTop: verticalScale(5)
    },
    monthButtonText: {
        textAlign: "center"
    },
    dateContainer: {
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(10),
        marginLeft: scale(10),
        borderRadius: scale(10),
        width: "13%",
        marginTop: verticalScale(5)
    },
})
export default ChooseDateAndTime;
