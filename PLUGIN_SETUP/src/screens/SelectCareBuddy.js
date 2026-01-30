import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, TouchableOpacity, Modal, ScrollView, TextInput, Keyboard, Linking } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from "@react-native-community/blur";
import { Dropdown } from 'react-native-element-dropdown';
import { scale, verticalScale } from 'react-native-size-matters';
import FieldLabel from '../components/FieldLabel';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import CommonButton from '../components/CommonButton';
import Global from './Global';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import MedicinesDateSelect from '../components/MedicinesDateSelect';
import { responsiveFont } from '../utils/Responsive';
import { fetchPostalData, validatePincode } from '../utils/CommonFunctions';

const SelectCareBuddy = (props) => {
    const SelectedServices = Global.nurseSelecting.SelectedServices;
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [pinCode, setPinCode] = useState(Global.userInfo.pincode);
    const [validPincode, setValidPincode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [firstTime, setFirstTime] = useState(false);
    const genderArray = [
        { value: "No preference" },
        { value: "Male" },
        { value: "Female" },
    ];
    const [selectedGender, setSelectedGender] = useState("No preference");
    const [CareBuddyDetails, setCareBuddyDetails] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedDuration, setSelectedDuration] = useState("");
    const [valid, setValid] = useState(false);
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

    const [serviceTypeId, setServiceTypeId] = useState("");
    const [searchDuration, setSearchDuration] = useState({});
    useEffect(() => {
        setFirstTime(true)
        if (props.route.params.userType == 'Domestic Caretaker') {
            providerTypeList();
        } else {
            setServiceTypeId(props.route.params.providerTypeId)
        }
    }, [])

    const providerTypeList = async () => {
        try {
            const body = {
                "userTypeId": '6',
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall('registration/getprovidertypelist', body, true);
            Global.nurseSelecting.selectedServicesId = [response.providerType[0].services[0].id];
            setServiceTypeId(response.providerType[0].id);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const pincodeValidatingApi = async () => {
        setLoading(true);
        await fetchPostalData(pinCode);
        setLoading(false);
        if (Global.OS == "ios") {
            await delay(200);
        }
    };

    const onContinueClick = async () => {
        setLoading(true);
        const statusMessage = await validatePincode(pinCode);
        setLoading(false);
        if (Global.OS == "ios") {
            await delay(200);
        }
        if (pinCode.length == "") {
            DisplayError("Please enter pincode");
        } else if (pinCode.length < 6 || parseInt(pinCode) <= 100000) {
            DisplayError("Please enter valid pincode");
        }
        else if (!/^\d+$/.test(pinCode)) {
            DisplayError("Pincode should contain only numbers");
        } else if (await pincodeValidatingApi()) {
            DisplayError("Please enter valid pincode");
        } else if (statusMessage) {
            DisplayError(statusMessage)
        }
        else if (selectedDuration == "") {
            DisplayError("Please select range");
        }
        else if (startDate === "" || endDate === "") {
            DisplayError("Please select valid start date or end date.");
        } else if (moment(startDate, "DD/MM/YYYY") > moment(endDate, "DD/MM/YYYY")) {
            DisplayError("end date should be greater then selected start date.");
        } else {
            Global.nurseSelecting.selectedStartDate = startDate;
            Global.nurseSelecting.selectedEndDate = endDate;
            Global.NurseappointmentDetails.totalServiceTime = searchDuration;
            await getcarebuddylist();
        }
    };

    const isAllDatesAvailable = (availability,) => {
        const startMoment = moment(startDate).startOf('day');
        const endMoment = moment(endDate).startOf('day');
        let currentDate = startMoment.clone();
        while (currentDate.isSameOrBefore(endMoment)) {
            const dateString = currentDate.format("YYYY-MM-DD");
            const isDateAvailable = availability.some(item => item.date === dateString);
            if (!isDateAvailable) {
                return false;
            }
            currentDate.add(1, 'day');
        }
        return true;
    };

    const onMoreDetailsClick = (item) => {
        Global.nurseSelecting.CareBuddyId = item.id;
        Global.nurseSelecting.providerName = item.firstName;
        const availabilityDates = item.availability.map(entry => moment(entry.date, "YYYY-MM-DD"));
        // Sort the availability dates in ascending order
        availabilityDates.sort((a, b) => a - b);
        let minDate, maxDate = "";
        if (availabilityDates.length > 0) {
            let startDate = availabilityDates[0];
            let endDate = availabilityDates[0];
            // Iterate over the sorted availability dates to find gaps
            for (let i = 1; i < availabilityDates.length; i++) {
                if (availabilityDates[i].diff(endDate, 'days') > 1) {
                    // Gap found, update minDate and maxDate
                    minDate = startDate.format("DD/MM/YYYY");
                    maxDate = endDate.format("DD/MM/YYYY");
                    break;
                }
                endDate = availabilityDates[i];
            }
            // If no gap found, use the first and last dates
            if (!minDate && !maxDate) {
                minDate = startDate.format("DD/MM/YYYY");
                maxDate = endDate.format("DD/MM/YYYY");
            }
        }
        Global.nurseSelecting.selectedStartDate = moment(minDate, "DD/MM/YYYY").toISOString();
        Global.nurseSelecting.selectedEndDate = moment(maxDate, "DD/MM/YYYY").toISOString();
        if (isAllDatesAvailable(item.availability)) {
            navigation.navigate("CareBuddyDetail", { duration: Global.NurseappointmentDetails.totalServiceTime.label });
        } else {
            setValid(true);
            DisplayError("This Nurse is not available on all of your selected dates. Do you still want to proceed?");
        }
    };

    const customMessage = "Hello, this is my custom message for support.";
    const encodedCustomMessage = encodeURIComponent(customMessage);
    const emailUrl = `mailto:Support@hopetheapp.com?subject=Hello&body=${encodedCustomMessage}`;
    const DropDownValues = (item) => {
        setSelectedDuration(item.label);
        setSearchDuration(item);
    }
    const getcarebuddylist = async () => {
        try {
            const body =
            {
                "pincode": pinCode.toString(),
                "providerTypeId": serviceTypeId.toString(),
                "gender": selectedGender == "No preference" ? "Both" : selectedGender,
                "startDate": moment(startDate).format("DD-MM-YYYY"),
                "shiftDuration": Global.NurseappointmentDetails.totalServiceTime.value,
                "endDate": moment(endDate).format("DD-MM-YYYY"),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": "android"
            }
            setLoading(true);
            const response = await apiCall("registration/getcarebuddylist", body);
            if (response.providerdata.length == 0) {
                setFirstTime(false);
            }
            setCareBuddyDetails(response.providerdata);
            Global.nurseSearchData = response.providerdata;
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleDateString('en-US', { day: 'numeric' });
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day} ${month}`;
    }

    const handleModalResponse = (isYes) => {
        setShowModal(false);
        setValid(false);
        if (isYes) {
            navigation.navigate("CareBuddyDetail", { duration: Global.NurseappointmentDetails.totalServiceTime.label, dateChange: true });
        }
    };

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Back"
                    onPress={() => navigation.goBack()}
                />
                <ScrollView>
                    <View style={{ marginTop: heightToDp(2) }}>
                        <View>
                            <FieldLabel Nospace={true} TextType={"ExtraLarge"} text={"Select Care Buddy"} extraStyles={[{ fontSize: responsiveFont(24) }]} />
                            <FieldLabel Nospace={true} TextType={"small"} extraStyles={[Fonts.Nunito_600SemiBold, { marginTop: heightToDp(2), fontSize: responsiveFont(14) }]}
                                text={"Browse our list of available care buddies and select the one that best meets your needs."} />
                        </View>

                    </View>
                    <View style={{ marginBottom: heightToDp(1), }}>
                        <View style={[GlobalStyles.rowSpaceBetween, GlobalStyles.fixedTopSpacing]}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.label, { fontSize: responsiveFont(16) }]}>
                                Pin code
                            </Text>
                            <View style={{ width: "70%" }}>
                                <View style={{}}>
                                    <TextInput
                                        numberOfLines={1}
                                        value={pinCode}
                                        maxLength={6}
                                        placeholderTextColor={[Colors.placeholderTextColor]}
                                        style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, styles.pincodetxtInput, { fontSize: responsiveFont(14), height: Global.OS == "ios" ? verticalScale(35) : null }]}
                                        placeholder={"Pincode"}
                                        onChangeText={text => { setPinCode(text); }}
                                    />

                                </View>

                            </View>
                        </View>
                    </View>
                    <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: heightToDp(1) }]}>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.label, { fontSize: responsiveFont(16) }]}>
                            Gender
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                style={[styles.dropdown, { paddingBottom: verticalScale(10) }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(1), fontSize: responsiveFont(14) }]}
                                inputSearchStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}
                                iconStyle={[styles.dropdownIcon]}
                                itemTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold,]}
                                itemContainerStyle={[styles.itemContainerStyle]}
                                containerStyle={[styles.dropDownContainer]}
                                data={genderArray}
                                placeholder="Select Gender"
                                maxHeight={300}
                                labelField="value"
                                valueField="value"
                                value={selectedGender}
                                onChange={item => {
                                    setSelectedGender(item.value);
                                }}
                            />
                        </View>
                    </View>
                    <View>
                        <View style={[GlobalStyles.rowSpaceBetween, styles.bottomSpace]}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.label, { fontSize: responsiveFont(16) }]}>
                                Start date
                            </Text>
                            <MedicinesDateSelect onDateSelect={setStartDate} selectedDate={startDate} maxDate={endDate} mainDateContainer={true} extraTextStyles={[GlobalStyles.smallText, { fontSize: responsiveFont(14) }]} extraPlaceholderTextStyles={[GlobalStyles.smallText, { fontSize: responsiveFont(14) }]} extraImagestyle={[styles.calenderImageStyle]} />
                        </View>
                    </View>
                    <View>
                        <View style={[GlobalStyles.rowSpaceBetween, styles.bottomSpace]}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.label, { fontSize: responsiveFont(16) }]}>
                                End date
                            </Text>
                            <MedicinesDateSelect onDateSelect={setEndDate} selectedDate={endDate} minDate={startDate} mainDateContainer={true} extraTextStyles={[GlobalStyles.smallText, { fontSize: responsiveFont(14) }]} extraPlaceholderTextStyles={[GlobalStyles.smallText, { fontSize: responsiveFont(14) }]} extraImagestyle={[styles.calenderImageStyle]} />

                        </View>
                    </View>
                    <View style={[GlobalStyles.rowSpaceBetween, styles.bottomSpace]}>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.label, { fontSize: responsiveFont(16) }]}>
                            Duration
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                style={[styles.dropdown, { paddingBottom: verticalScale(10) }]}
                                placeholderStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, styles.dropdownPlaceholder, { fontSize: responsiveFont(14) }]}
                                selectedTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(1), fontSize: responsiveFont(14) }]}
                                inputSearchStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold,]}
                                iconStyle={[styles.dropdownIcon]}
                                itemTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold,]}
                                itemContainerStyle={[styles.itemContainerStyle]}
                                containerStyle={[styles.dropDownContainer]}
                                data={timeDuration}
                                placeholder="Select Range"
                                maxHeight={300}
                                labelField="label"
                                valueField="label"
                                value={selectedDuration}
                                onChange={(item) => DropDownValues(item)}
                            />
                        </View>
                    </View>
                    <CommonButton
                        extraTextStyles={{ fontSize: responsiveFont(18) }}
                        extraStyles={{ marginTop: verticalScale(15) }}
                        onPress={async () => { await onContinueClick(); }}
                        buttonText={"Search"} />

                    {(CareBuddyDetails.length > 0 ? CareBuddyDetails.map((item, index) => (
                        <TouchableOpacity
                            key={`key${index}`}
                            onPress={() => onMoreDetailsClick(item)}
                            style={{ marginBottom: CareBuddyDetails.length - 1 == index && heightToDp(4) }}
                        >
                            <View style={[styles.container]}>
                                <View style={[styles.rowContainer]}>
                                    <View style={styles.doctorCardDetails}>
                                        <View style={styles.doctorImageContainer}>
                                            <FastImage
                                                resizeMode={FastImage.resizeMode.cover}
                                                style={[styles.doctorImage]}
                                                source={item.profilePicturePath == '' ? require("../assets/images/profile.png") : { uri: item.profilePicturePath }}
                                            />
                                        </View>
                                        <View style={{ paddingHorizontal: widthToDp(4) }}>
                                            <View style={[GlobalStyles.rowSpaceBetween]}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{`${item.firstName} ${item.lastName}`}</Text>
                                            </View>
                                            <View style={{ width: "87%" }}>
                                                <Text numberOfLines={3} style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                                    {SelectedServices?.map((value, index) => (index > 0 ? `, ${value}` : value)).join('')}
                                                </Text>
                                            </View>
                                            <View style={[styles.chargeContainer]}>
                                                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold]}>
                                                    Charge :
                                                </Text>
                                                <View style={{ flexDirection: "column" }}>
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                                        <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold, { color: Colors.primaryButtonColor }]}> ₹ {item.serviceCharge} per day</Text>
                                                    </Text>
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold, { color: Colors.secondarybuttonColor }]}>(Exclusive of GST)</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.chargeContainer, { width: "87%", marginTop: heightToDp(0) }]}>
                                                <Text numberOfLines={1} style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold, { width: "100%" }]}>
                                                    Available: {item.availability.map((data, index) => (
                                                        <Text key={index}>
                                                            {formatDate(data.date)}
                                                            {index < item.availability.length - 1 && ', '}
                                                        </Text>
                                                    ))}
                                                </Text>

                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )) : !firstTime && <View style={[styles.notAvailableContainer]}>

                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>No Care Buddy available for your requested date. Please contact</Text>
                        <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])} onPress={() => { Linking.openURL(emailUrl) }}>
                            <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>Support@hopetheapp.com</Text>
                        </Pressable>
                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>for further assistance.</Text>

                    </View>)}
                </ScrollView>
            </View>
            <Footer navigation={navigation} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal onPress={handleModalResponse} extrabuttons={valid} showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <Pressable style={styles.centeredView}>
                    <BlurView
                        style={[styles.blurViewStyle]}
                        blurType="dark"
                        blurAmount={20}
                        reducedTransparencyFallbackColor={Colors.boxBackground}
                    />
                    <View style={styles.modalView}>
                        <View style={[styles.rowModalView]}>
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, styles.modalViewText]}>Enter your Pincode</Text>
                            <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}
                                onPress={() => setModalVisible(false)}>
                                <VectorIcons groupName='Ionicons' iconName='close' iconsize={20} />
                            </Pressable>
                        </View>
                        <View style={[styles.pinCodeContainer]}>
                            <TextInput
                                style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, styles.input]}
                                maxLength={6}
                                onChangeText={(text) => {
                                    setPinCode(text.replace(/[^0-9]/g, ''));
                                    if (text.length == 6 || text.length > 6) {
                                        Keyboard.dismiss();
                                        setValidPincode(false);
                                    }
                                }}
                                value={pinCode.toString()}
                                placeholder="Enter your Pincode"
                                underlineColorAndroid="transparent"
                                keyboardType='number-pad'
                                placeholderTextColor={Colors.placeholderTextColor}
                                autoFocus={true}
                            />
                            {
                                validPincode &&
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText, styles.validPincode]}>Please Enter 6 digit pincode</Text>
                            }
                            <View style={[styles.commonButtonContainer, GlobalStyles.fixedBottomSpacing]}>
                                <CommonButton
                                    buttonText="Continue"
                                    onPress={onContinueClick}
                                    extraStyles={styles.Button}
                                    extraTextStyles={{ color: Colors.boxBackground }}
                                />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pincodetxtInput: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        paddingLeft: widthToDp(4),
        padding: scale(5)
    },
    optionContainer: {
        width: "90%",
        alignSelf: "center"
    },
    doctorImageContainer: {
        width: widthToDp(24),
        marginTop: heightToDp(1)
    },
    doctorCardContainer: {
        backgroundColor: Colors.modalBackground,
        width: "100%",
        marginTop: heightToDp(2),
        borderRadius: 14,
        marginBottom: heightToDp(0)
    },
    imageTitle: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        alignSelf: "center",
        width: "80%",
        paddingVertical: heightToDp(0.5)
    },
    doctorImage: {
        width: "100%",
        height: heightToDp(30),
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    doctorCardDetails: {
        backgroundColor: Colors.boxBackground,
        padding: 12,
        width: "100%",
        borderRadius: 14,
        flexDirection: "row"
    },
    dataBelowDoctorDetailsContainer: {
        flexDirection: "row",
        marginTop: heightToDp(1),
        paddingBottom: heightToDp(1),
    },
    moreDetails: {
        flexDirection: "row",
        alignItems: "center",
    },
    dropdownContainer: {
        width: '70%',
        flexDirection: "column",
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        padding: widthToDp(2),
        height: heightToDp(5),
    },
    dropdown: {
        width: "100%",
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: 4,
        color: Colors.placeholderTextColor,
    },
    placeholderStyle: {
        marginLeft: widthToDp(2),
        fontSize: scale(14),
        color: Colors.placeholderTextColor,
    },
    icon: {
        color: Colors.primaryButtonColor,
        marginLeft: widthToDp(2)
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.modalBackground
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        width: "80%",
        shadowColor: Colors.primaryTextColor,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        height: 50,
        borderWidth: 1,
        padding: 10,
        width: "80%",
        borderRadius: 14,
        marginTop: heightToDp(2)
    },
    Button: {
        height: heightToDp(5),
    },
    label: {
        width: '25%',
        fontSize: responsiveFont(16),
    }, bottomSpace: {
        marginBottom: heightToDp(1)
    },
    dropDownContainer: {
        paddingHorizontal: scale(5),
        marginTop: -verticalScale(5)
    },
    calenderImageStyle: {
        width: widthToDp(5),
        height: heightToDp(5)
    },
    dropdownPlaceholder: {
        color: Colors.placeholderTextColor,
        marginLeft: widthToDp(2),
    },
    dropdownIcon: {
        width: 20,
        height: 20,
    },
    itemContainerStyle: {
        paddingHorizontal: 5,
        margin: -5
    },
    container: {
        backgroundColor: Colors.boxBackground,
        marginVertical: heightToDp(2),
        borderRadius: 14,
    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: -heightToDp(1),
    },
    doctorImage: {
        height: heightToDp(13),
        width: widthToDp(24),
        borderRadius: 14,
    },
    chargeContainer: {
        flexDirection: 'row',
        marginTop: heightToDp(1),
    },
    notAvailableContainer: {
        alignItems: "center",
        marginTop: heightToDp(8)
    },
    blurViewStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    rowModalView: {
        justifyContent: 'space-between',
        flexDirection: "row",
        padding: 9,
        borderBottomWidth: 2,
        borderBottomColor: Colors.placeholderTextColor,
        marginTop: heightToDp(1)
    },
    modalViewText: {
        width: "90%",
        marginLeft: widthToDp(2)
    },
    pinCodeContainer: {
        justifyContent: "center",
        alignItems: "center"
    },
    validPincode: {
        color: Colors.red,
        marginLeft: -widthToDp(14)
    },
    commonButtonContainer: {
        width: '40%',
        marginTop: heightToDp(1)
    }
});

export default SelectCareBuddy;