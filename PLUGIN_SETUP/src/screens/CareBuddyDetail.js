import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, Pressable, TouchableOpacity, Modal, Keyboard } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Share from 'react-native-share';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from 'react-native-size-matters';
import ViewShot from 'react-native-view-shot';
import Global from './Global';
import moment from 'moment';
import WarningModal from '../components/WarningModal';
import FastImage from 'react-native-fast-image';
import MedicinesDateSelect from '../components/MedicinesDateSelect';
import DropdownPicker from '../components/DropdownPicker';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import FieldLabel from '../components/FieldLabel';

const CareBuddyDetail = (props) => {
    const duration = props.route.params.duration;
    const dateChange = props.route.params.dateChange;
    const viewShotRef = React.createRef();
    const myComponentRef = React.createRef();
    const myComponentFromRef = React.createRef();
    const myComponentToRef = React.createRef();
    const myComponentToMinuteRef = React.createRef();
    const navigation = useNavigation();
    const filteredCareBuddyData = Global.nurseSearchData.find((value) => {
        return value.id === Global.nurseSelecting.CareBuddyId;
    });

    const [specializationData, setSpecializationData] = useState([]);
    const NurseName = filteredCareBuddyData.firstName + " " + filteredCareBuddyData.lastName;
    const NurseFees = filteredCareBuddyData.serviceCharge;
    const NurseImage = filteredCareBuddyData.profilePicturePath;
    const [imageURI, setImageURI] = useState("");
    const [sendDisable, setSendDisable] = useState(false);
    const NurseAvailableDates = filteredCareBuddyData.availability;
    const NurseOrganisation = filteredCareBuddyData.organisationName;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
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
    const [showdata, setShowdata] = useState(false);
    const [valid, setValid] = useState(false);
    const [nightService, setNightService] = useState(false);
    const [changeDate, setChangeDate] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [nurseDetails, setNurseDetails] = useState({});

    const validateDuration = () => {
        const fromMinutes = parseInt(selectedFromHour, 10) * 60 + parseInt(selectedFromMinute, 10);
        const toMinutes = parseInt(selectedToHour, 10) * 60 + parseInt(selectedToMinute, 10);
        let duration;
        if (toMinutes >= fromMinutes) {
            duration = toMinutes - fromMinutes;
        } else {
            duration = (24 * 60 - fromMinutes) + toMinutes;
        }
        const { minutesRange } = Global.NurseappointmentDetails.totalServiceTime;
        if (duration < minutesRange.start || duration > minutesRange.end) {
            return true; // Duration is outside the valid range
        } else {
            return false; // Duration is within the valid range
        }
    };

    const DisplayError = (text) => {
        setWarningText(text);
        if (Global.OS == "ios") {
            setTimeout(() => {
                setShowModal(true);
            }, 100);
        } else {
            setShowModal(true);
        }
    };

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const formattedAvailability = NurseAvailableDates.map(item => ({
        date: moment(item.date, "YYYY-MM-DD").format("DD-MM-YY"),
        time: item.time.map(timeItem => ({
            from: moment(timeItem.from, "HH:mm:ss").format("hh:mm A"),
            to: moment(timeItem.to, "HH:mm:ss").format("hh:mm A")
        }))
    }));

    const onContinueClick = async () => {
        setValid(false)
        const startTime = `${selectedFromHour}:${selectedFromMinute}`;
        const endTime = `${selectedToHour}:${selectedToMinute}`;
        const currentDate = new Date();
        const selectedDateTime = new Date(Global.nurseSelecting.selectedStartDate);
        const [hours, minutes] = startTime.split(':');
        selectedDateTime.setHours(parseInt(hours, 10));
        selectedDateTime.setMinutes(parseInt(minutes, 10));
        const startDates = moment(startDate).format('YYYY-MM-DD');
        const endDates = moment(endDate).format('YYYY-MM-DD');
        const startDateTime = moment(`${startDates} ${startTime}`, "YYYY-MM-DD HH:mm");
        const endDateTime = moment(`${endDates} ${endTime}`, "YYYY-MM-DD HH:mm");
        if (selectedFromHour == "" || selectedFromMinute == "") {
            DisplayError("Please select from service time");
        } else if ((selectedToHour == "" || selectedToMinute == "") && !nightService) {
            DisplayError("Please select to service time");
        } else if (startDate !== "" && endDate == "") {
            DisplayError("Please select end date.");
        } else if (changeDate && (moment(startDate, "DD/MM/YYYY") > moment(endDate, "DD/MM/YYYY"))) {
            DisplayError("end date should be greater then selected start date.");
        } else if (selectedDateTime < currentDate) {
            DisplayError("Start time should be greater than the current date and time.");
        } else if (startDates === endDates && endDateTime.isBefore(startDateTime)) {
            DisplayError("Please select a valid time.");
        } else if (validateDuration()) {
            DisplayError(`Please select Start Time and End Time to be within ${duration} duration`)
        } else {
            if (changeDate && (startDate !== "" && endDate !== "")) {
                Global.nurseSelecting.selectedStartDate = startDate;
                Global.nurseSelecting.selectedEndDate = endDate;
            }
            const startTiming = moment(startTime, 'HH:mm').format('HH:mm A');
            const endTiming = moment(endTime, 'HH:mm').format('HH:mm A');
            Global.nurseSelecting.startTime = startTiming;
            Global.nurseSelecting.endTime = nightService ? startTiming : endTiming;
            await Triggercreatepatientservice();
        }
    };

    const handleModalResponse = (isYes) => {
        setShowModal(false);

        if (isYes) {
            navigation.navigate("AppointmentReview");
        }
    };

    const captureViewShot = async () => {
        setSendDisable(true);
        const capturedURI = await viewShotRef.current.capture(); // Capture the image's URI
        setImageURI(capturedURI); // Set the image URI in the state
        shareImage(capturedURI)
    };

    const shareImage = async (capturedURI) => {
        if (capturedURI) {
            const options = {
                title: 'Share Image',
                url: capturedURI,
                type: 'image/jpeg', // Specify the image type
            };
            Share.open(options)
                .then((res) => {
                    console.log('Shared:', res);
                    setImageURI(""); // Reset the imageURI state after sharing
                })
                .catch((err) => {
                    console.log('Error sharing:', err);
                    setImageURI(""); // Reset the imageURI state even if sharing failed
                });
        } else {
            console.log('No image captured yet.');
        }
        setSendDisable(false);
    };

    useEffect(() => {
        setImageURI("");
        if (dateChange) {
            setChangeDate(true);
            setStartDate(Global.nurseSelecting.selectedStartDate);
            setEndDate(Global.nurseSelecting.selectedEndDate);
        }
    }, []);

    const extractMaxDate = (data) => {
        let maxDate = null;
        data.forEach((item) => {
            const dateString = item.date;
            const currentDate = moment(dateString, "DD-MM-YY");

            if (!maxDate || currentDate.isAfter(maxDate)) {
                maxDate = currentDate;
            }
        });
        return maxDate.format("DD/MM/YYYY");
    };

    const extractMinDate = (data) => {
        let maxDate = null;
        data.forEach((item) => {
            const dateString = item.date;
            const currentDate = moment(dateString, "DD-MM-YY");

            if (!maxDate || currentDate.isBefore(maxDate)) {
                maxDate = currentDate;
            }
        });
        return maxDate.format("DD/MM/YYYY");
    };
    const BookingMaxDate = extractMaxDate(formattedAvailability);
    const BookingMinDate = extractMinDate(formattedAvailability);
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

    const StartTimeHour = () => {
        onLayout()
        Keyboard.dismiss();
        setTimeout(() => {
            setShowFromDropdownPicker(true);
        }, 100);
        setSelectedToHour("");
    }

    const getNurseDetails = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            await getUserDetails();
            Global.clicked = false;
        }
    }
    const getUserDetails = async () => {
        try {
            let body = {
                "userId": filteredCareBuddyData.id,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('registration/getuser', body);
            const nurserId = response.userInfo.id;
            setLoading(false);
            setNurseDetails(response.userInfo);
            getproviderserviceslist(nurserId);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }

    }

    const getproviderserviceslist = async (id) => {
        try {
            const body = {
                "userId": id,
                "status": "Active",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall("registration/getproviderserviceslist", body);
            const newData = response.services.map(service => service.name);
            setSpecializationData(newData)
            setLoading(false);
            setShowInfo(true);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const Triggercreatepatientservice = async () => {
        try {
            const body = {
                "patientId": Global.patientID,
                "providerId": Global.nurseSelecting.CareBuddyId,
                "startDate": moment(Global.nurseSelecting.selectedStartDate).format("DD-MM-YYYY"),
                "endDate": moment(Global.nurseSelecting.selectedEndDate).format("DD-MM-YYYY"),
                "address": Global.userType == "Caregiver" ? Global.patientAddress : Global.userInfo.Address,
                "startTime": Global.nurseSelecting.startTime.split(" ")[0],
                "endTime": nightService && Global.nurseSelecting.startTime.split(" ")[0] == "00:00" ? "23:59" : nightService && Global.nurseSelecting.startTime.split(" ")[0] != "00:00" ? Global.nurseSelecting.startTime.split(" ")[0] : Global.nurseSelecting.endTime.split(" ")[0],
                "serviceAmount": NurseFees,
                "services": Global.nurseSelecting.selectedServicesId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('registration/getproviderslotavailability', body);
           if (response.message == "Valid") {
                setValid(true)
                if (Global.nurseSelecting.Type === "Domestic Caretaker") {
                    DisplayError("Are you Comfortable with Caretaker Available Time ?");
                } else {
                    DisplayError("Are you Comfortable with Nurse Available Time ?");
                }
            }
            else {
                setValid(false)
                DisplayError("Slot unavailable");

            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong , please try again");
        }
    }

    const StartTimeMinute = () => {
        onLayoutFrom()
        Keyboard.dismiss();
        setTimeout(() => {
            setShowFromMinuteDropdown(true);
        }, 100);
        setSelectedToHour("");
    }

    const EndTimeHour = () => {
        onLayoutTo()
        Keyboard.dismiss();
        setTimeout(() => {
            setShowToHourDropdown(true);
        }, 100);
    }

    const EndTimeMinute = () => {
        onLayoutToMinute()
        Keyboard.dismiss();
        setTimeout(() => {
            setShowToMinuteDropdown(true);
        }, 100);
    }

    const StartDateSet = (date) => {
        setStartDate(date);
    }

    let dateUiDisplay = Global.nurseSelecting.selectedStartDate == Global.nurseSelecting.selectedEndDate;

    return (
        <ViewShot style={{ flex: 1, backgroundColor: Colors.defaultBackground }}
            ref={viewShotRef}
            captureMode="mount"
            options={{ format: "jpg", quality: 1.0 }}
            onCapture={capturedURI => {
                setImageURI(capturedURI);
            }}>
            <SafeAreaView style={GlobalStyles.mainContainer}>
                <View style={GlobalStyles.mainBox}>
                    {
                        !sendDisable &&
                        <Header
                            headerTitle="Back"
                            onPress={() => navigation.goBack()}
                            showShareBtn={true}
                        />
                    }
                    <ScrollView>
                        <View>
                            <View style={styles.CareBuddyDatailHeader}>
                                <View>
                                    <FastImage
                                        resizeMode={FastImage.resizeMode.cover}
                                        style={styles.Image}
                                        source={NurseImage == '' ? require("../assets/images/profile.png") : { uri: NurseImage }}
                                    />
                                </View>
                                <View style={styles.headertext}>
                                    <View style={[GlobalStyles.rowSpaceBetween, { width: "100%" }]}>
                                        <View style={[GlobalStyles.rowCenter, { width: "80%", justifyContent: "flex-start" }, sendDisable && { marginTop: heightToDp(2) }]}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{NurseName}</Text>
                                            <Pressable onPress={async () => { await getNurseDetails() }} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                                                <VectorIcons groupName='Feather' iconName='info' iconstyle={{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }} iconsize={scale(25)} />
                                            </Pressable>
                                        </View>
                                        {
                                            !sendDisable && (
                                                <Pressable onPress={() => captureViewShot()} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                                    <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryButtonColor, marginTop: widthToDp(2) }]} iconsize={widthToDp(5)} />
                                                    <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_600SemiBold]}>Share</Text>
                                                </Pressable>
                                            )
                                        }
                                    </View>
                                    <View style={[GlobalStyles.rowSpaceBetween,]}>
                                        <View>
                                            <View style={[GlobalStyles.rowSpaceBetween]}>
                                                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                                    Visiting Fee : <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold]}>₹ {NurseFees} per day</Text>
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.NurseAvailibilty]}>
                                <View style={[styles.NurseAvailibiltyHeading]}>
                                    <Text numberOfLines={1} style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>
                                        Nurse Availability
                                    </Text>
                                </View>
                                <View style={[styles.tableHeader, { justifyContent: "space-between" }]}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>Date</Text>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>Start Time</Text>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>End Time</Text>
                                </View>

                                <FlatList
                                    data={showdata ? formattedAvailability : formattedAvailability.slice(0, 3)}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        item.time.map((i, j) => {
                                            return (
                                                <View style={[styles.tableRow, { justifyContent: "space-between" }]} key={j} >
                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold,]}>{item.date}</Text>
                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginRight: widthToDp(8) }]}>{i.from}</Text>
                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold,]}>{i.to}</Text>
                                                </View>
                                            )
                                        })
                                    )}
                                />



                                {
                                    formattedAvailability.length <= 4 ?
                                        null
                                        :
                                        <View style={{ alignItems: "flex-end" }}>
                                            <TouchableOpacity onPress={() => setShowdata(!showdata)}>
                                                <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_600SemiBold]}>{showdata ? "Show Less" : "Show More"}</Text>
                                            </TouchableOpacity>
                                        </View>
                                }

                            </View>
                            {
                                duration == "12 to 24 hours" &&
                                <View style={[GlobalStyles.rowSpaceBetween, { width: widthToDp(50) }]}>
                                    <FieldLabel TextType={"Medium"} text={"Select 24 Hours"} extraStyles={{ marginBottom: heightToDp(2) }} />
                                    <Pressable onPress={() => setNightService(!nightService)}>
                                        {
                                            nightService ?
                                                <VectorIcons groupName='AntDesign' iconName='checksquare' iconstyle={[{ color: Colors.primaryButtonColor }]} />
                                                :
                                                <VectorIcons groupName='MaterialCommunityIcons' iconName='checkbox-blank-outline' iconstyle={[{ color: Colors.primaryinactive }]} />
                                        }
                                    </Pressable>
                                </View>
                            }
                            <View>
                                {
                                    !sendDisable && (
                                        <View>
                                            <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold, styles.chooseTime]}>
                                                Choose Time
                                            </Text>
                                            <View style={[GlobalStyles.rowSpaceBetween]}>
                                                <View style={[GlobalStyles.rowCenter]}>
                                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { marginLeft: widthToDp(1) }]}>Start Time</Text>
                                                </View>
                                                <View style={[GlobalStyles.rowSpaceBetween, { width: "60%", }]}>
                                                    <Pressable
                                                        ref={myComponentRef}
                                                        onLayout={onLayout}
                                                        onPress={() => StartTimeHour()}
                                                        style={({ pressed }) => ([styles.dropdownSelector, { opacity: pressed ? 0.4 : 1, }])}
                                                    >
                                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: selectedFromHour == "" ? Colors.placeholderTextColor : Colors.primaryTextColor, }]}>
                                                            {selectedFromHour == "" ? "Select" : selectedFromHour}
                                                        </Text>
                                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                                    </Pressable>
                                                    <Pressable
                                                        ref={myComponentFromRef}
                                                        onLayout={onLayoutFrom}
                                                        onPress={() => StartTimeMinute()}
                                                        style={({ pressed }) => ([styles.dropdownSelector, { opacity: pressed ? 0.4 : 1, }])}
                                                    >
                                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: selectedFromMinute == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                                            {selectedFromMinute == "" ? "Select" : selectedFromMinute}
                                                        </Text>
                                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                            {!nightService && <View style={[GlobalStyles.rowSpaceBetween, { marginTop: heightToDp(1), marginBottom: heightToDp(1) }]}>
                                                <View style={[GlobalStyles.rowCenter]}>
                                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { marginLeft: widthToDp(1) }]}>End Time</Text>
                                                </View>
                                                <View style={[GlobalStyles.rowSpaceBetween, { width: "60%" }]}>
                                                    <Pressable
                                                        ref={myComponentToRef}
                                                        onLayout={onLayoutTo}
                                                        onPress={() => EndTimeHour()}
                                                        style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, borderRadius: 14, width: "45%", flexDirection: "row", paddingVertical: heightToDp(1), justifyContent: "space-between", backgroundColor: Colors.boxBackground, alignItems: "center", paddingHorizontal: widthToDp(5), height: 55 })}
                                                    >
                                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: selectedToHour == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                                            {selectedToHour == "" ? "Select" : selectedToHour}
                                                        </Text>
                                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                                    </Pressable>
                                                    <Pressable
                                                        ref={myComponentToMinuteRef}
                                                        onLayout={onLayoutToMinute}
                                                        onPress={() => EndTimeMinute()}
                                                        style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, borderRadius: 14, width: "45%", flexDirection: "row", paddingVertical: heightToDp(1), justifyContent: "space-between", backgroundColor: Colors.boxBackground, alignItems: "center", paddingHorizontal: widthToDp(5), height: 55 })}
                                                    >
                                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: selectedToMinute == "" ? Colors.placeholderTextColor : Colors.primaryTextColor }]}>
                                                            {selectedToMinute == "" ? "Select" : selectedToMinute}
                                                        </Text>
                                                        <VectorIcons groupName='Feather' iconName='chevron-down' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={widthToDp(5)} />
                                                    </Pressable>
                                                </View>
                                            </View>}
                                        </View>
                                    )
                                }
                                {
                                    changeDate ?
                                        <View style={{ marginBottom: "30%" }}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold, { marginLeft: widthToDp(1), marginBottom: heightToDp(1) }]}>
                                                    Choose Date
                                                </Text>
                                                <Pressable onPress={() => { setChangeDate(false); StartDateSet(""); setEndDate("") }} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                                                    <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_700Bold, { marginVertical: verticalScale(5) }]}>Hide Date</Text>
                                                </Pressable>
                                            </View>
                                            <View>
                                                <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: heightToDp(1), width: "100%" }]}>
                                                    <View style={{ width: "40%" }}>
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { marginLeft: widthToDp(1) }]}>
                                                            Start Date
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <MedicinesDateSelect onDateSelect={StartDateSet} selectedDate={startDate} minDate={BookingMinDate} maxDate={BookingMaxDate} extraStyles={{ width: "59%", }} extraTextStyles={GlobalStyles.smallText} extraPlaceholderTextStyles={GlobalStyles.smallText} extraImagestyle={{ width: widthToDp(5), height: heightToDp(7) }} />
                                                    </View>
                                                </View>
                                            </View>
                                            <View>
                                                <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: heightToDp(1), }]}>
                                                    <View style={{ width: "40%" }}>
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { marginLeft: widthToDp(2) }]}>
                                                            End Date
                                                        </Text>
                                                    </View>
                                                    <MedicinesDateSelect onDateSelect={setEndDate} selectedDate={endDate} minDate={startDate} maxDate={BookingMaxDate} extraStyles={{ width: "60%", }} extraTextStyles={GlobalStyles.smallText} extraPlaceholderTextStyles={GlobalStyles.smallText} extraImagestyle={{ width: widthToDp(5), height: heightToDp(7) }} />

                                                </View>
                                            </View>
                                        </View>

                                        :
                                        <View style={[styles.dateChange]}>
                                            {
                                                !dateUiDisplay &&
                                                <Pressable onPress={() => { setChangeDate(true) }} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                                                    <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_700Bold, { marginVertical: verticalScale(5) }]}>Change Date</Text>
                                                </Pressable>
                                            }
                                        </View>
                                }
                            </View>
                        </View>
                        {
                            !sendDisable && (
                                <CommonButton
                                    onPress={onContinueClick}
                                    visible={true}
                                    buttonText={"Continue"}
                                    extraStyles={[GlobalStyles.fixbottomcommonButton,]}
                                />
                            )
                        }
                    </ScrollView>
                </View>
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={toggleModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                                <Text style={[Fonts.Nunito_400Regular]}>Close</Text>
                            </TouchableOpacity>

                            <View style={styles.tableHeader}>
                                <Text style={{ width: "30%" }}>Date</Text>
                                <Text style={{ width: "30%" }}>Start Time</Text>
                                <Text style={{ width: "30%" }}>End Time</Text>
                            </View>

                            <FlatList
                                data={formattedAvailability}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    item.time.map((i, j) => {
                                        return (
                                            <View style={styles.tableRow} key={j} >
                                                <Text style={{ width: "30%" }}>{item.date}</Text>
                                                <Text style={{ width: "30%" }}>{i.from}</Text>
                                                <Text style={{ width: "30%" }}>{i.to}</Text>
                                            </View>
                                        )
                                    })
                                )}
                            />
                        </View>
                    </View>
                </Modal>
                <Modal visible={showInfo} transparent={true} animationType="slide" >
                    <View style={styles.nurseInfoModal}>
                        <View style={styles.nurseInfoParentContainer}>
                            <Pressable style={styles.modalCloseButton} onPress={() => setShowInfo(false)}>
                                <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(25)} iconstyle={{ color: Colors.placeholderTextColor }} />
                            </Pressable>
                            <View style={styles.nurseInfoContainer}>
                                <FastImage
                                    resizeMode={FastImage.resizeMode.cover}
                                    style={styles.nurseInfoImage}
                                    source={nurseDetails.profilePicturePath == '' ? require("../assets/images/profile.png") : { uri: nurseDetails.profilePicturePath }}
                                />
                                <View style={{ marginLeft: widthToDp(5) }}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{`${nurseDetails.firstName} ${nurseDetails.lastName}`}</Text>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{nurseDetails.userId}</Text>
                                </View>
                            </View>
                            <View style={styles.nurseInfoHeader}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Gender</Text>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.nurseInfoDetails]}>{nurseDetails.gender}</Text>
                            </View>
                            <View style={styles.nurseInfoHeader}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Specialisation</Text>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.nurseInfoDetails]}>{specializationData.join(', ')}</Text>
                            </View>
                            {
                                NurseOrganisation.length != 0 &&
                                <View style={styles.nurseInfoHeader}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Service Provider Organisation</Text>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.nurseInfoDetails]}>{NurseOrganisation}</Text>
                                </View>
                            }
                        </View>
                    </View>
                </Modal>
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                {<WarningModal onPress={handleModalResponse} extrabuttons={valid} showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
                {
                    !sendDisable &&
                    <Footer navigation={navigation} />
                }
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
        </ViewShot>
    );
}

const styles = StyleSheet.create({
    Image: {
        height: 80,
        width: 80,
        borderWidth: 3,
        borderRadius: 50,
        overflow: 'hidden',
    },
    CareBuddyDatailHeader: {
        flexDirection: 'row',
        marginTop: heightToDp(2),
    },
    headertext: {
        paddingHorizontal: widthToDp(4),
        width: "80%"
    },
    nurseInfoParentContainer: {
        width: "95%",
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
        padding: widthToDp(5),
        position: "relative"
    },
    nurseInfoModal: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        justifyContent: "center",
        alignItems: "center"
    },
    nurseInfoContainer: {
        width: "100%",
        alignItems: "center",
        flexDirection: "row"
    },
    tagListStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: heightToDp(2),
    },
    boxContainer: {
        flexDirection: "column",
        width: "33%"
    },
    nurseInfoImage: {
        width: widthToDp(20),
        height: widthToDp(20),
        backgroundColor: Colors.boxBackground,
        borderRadius: widthToDp(30)
    },
    modalCloseButton: {
        position: "absolute",
        backgroundColor: Colors.boxBackground,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        right: widthToDp(4),
        top: widthToDp(4),
        zIndex: 999,
    },
    TaGBox: {
        backgroundColor: Colors.boxBackground,
        paddingVertical: heightToDp(1),
        borderRadius: 14,
        marginHorizontal: 2,
        alignItems: 'center',
    },
    medalSection: {
        width: "50%",
        flexDirection: "row"
    },
    packageStyle: {
        backgroundColor: Colors.boxBackground,
        padding: widthToDp(2),
        margin: widthToDp(2),
        borderRadius: 14
    },
    imageTitle: {
        backgroundColor: Colors.primaryButtonColor,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        width: "100%",
        paddingVertical: heightToDp(0.5)
    },
    shareButton: {
        alignItems: "center",
        borderRadius: 14,
        paddingVertical: heightToDp(0.5),
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    nurseInfoHeader: {
        marginTop: heightToDp(1)
    },
    nurseInfoDetails: {
        padding: widthToDp(3),
        backgroundColor: Colors.lightblue,
        borderRadius: 14, width: "100%",
        marginTop: heightToDp(1)
    },
    modalContent: {
        width: '80%',
        maxHeight: "50%",
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 14,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: heightToDp(2)
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    NurseAvailibilty: {
        width: "95%",
        marginTop: heightToDp(2),
        alignSelf: "center"
    },
    NurseAvailibiltyHeading: {
        flexDirection: 'row',
        width: "100%",
        marginBottom: heightToDp(1)
    },
    chooseTime: {
        marginLeft: widthToDp(1),
        marginBottom: heightToDp(1)
    },
    dropdownSelector: {
        borderRadius: 14,
        width: "45%",
        flexDirection: "row",
        paddingVertical: heightToDp(1),
        justifyContent: "space-between",
        backgroundColor: Colors.boxBackground,
        alignItems: "center",
        paddingHorizontal: widthToDp(5),
        height: 55
    },
    dateChange: {
        justifyContent: "flex-end",
        alignItems: "flex-end",
        marginBottom: '25%'
    }
});

export default CareBuddyDetail;