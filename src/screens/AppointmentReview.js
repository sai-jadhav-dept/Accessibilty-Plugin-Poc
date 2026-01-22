import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Share from 'react-native-share';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import FieldLabel from '../components/FieldLabel';
import DisclaimerPopup from '../components/DisclaimerPopup';
import DisclaimerData from '../assets/mdm/DisclaimerData.json';
import VectorIcons from '../components/VectorIcons';
import ViewShot from 'react-native-view-shot';
import Global from './Global';
import moment from 'moment';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import { apiCall } from '../utils/ApiUtils';
import FastImage from 'react-native-fast-image';

const AppointmentReview = () => {
    const viewShotRef = React.createRef();
    const navigation = useNavigation();
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [addressText, setAddressText] = useState(Global.userType == "Caregiver" ? Global.patientAddress : Global.userInfo.Address);
    const [updatedAddress, setUpdatedAddress] = useState("");
    const [showAddressModal, setShowAddressModal] = useState(false);
    const filteredCareBuddyData = Global.nurseSearchData.find((value) => {
        return value.id === Global.nurseSelecting.CareBuddyId;
    });
    const SelectedServices = Global.nurseSelecting.SelectedServices;
    const Specialisation = Global.nurseSelecting.Type;
    const inputStartDate = Global.nurseSelecting.selectedStartDate;
    const formattedStartDate = moment(inputStartDate).format("DD-MM-YYYY");
    const selectedStartDate = formattedStartDate;
    const inputEndDate = Global.nurseSelecting.selectedEndDate;
    const formattedEndDate = moment(inputEndDate).format("DD-MM-YYYY");
    const selectedEndDate = formattedEndDate;
    const startTimeDetails = Global.nurseSelecting.startTime;
    const endTimeDetails = Global.nurseSelecting.endTime;
    const [time, period] = startTimeDetails.split(' ');
    const formattedTime = moment.utc(time + ' ' + period, "hh:mm A").format("HH:mm");
    const resultstarttime = formattedTime;
    const [endTimeperiod, endperiod] = endTimeDetails.split(' ');
    const formattedEndTime = moment.utc(endTimeperiod + ' ' + endperiod, "hh:mm A").format("HH:mm");
    const resultEndTime = formattedEndTime;
    const [dayChecker, setDayChecker] = useState(false);
    const startTime = Global.nurseSelecting.startTime;
    const endTime = Global.nurseSelecting.endTime;
    const totalServiceTime = Global.NurseappointmentDetails.totalServiceTime;
    const NurseName = filteredCareBuddyData.firstName + " " + filteredCareBuddyData.lastName;
    const NurseImage = filteredCareBuddyData.profilePicturePath;
    const NurseProfessionalLevel = filteredCareBuddyData.type;
    const gender = filteredCareBuddyData?.gender;
    const [nurseFees, setNurseFees] = useState(filteredCareBuddyData.serviceCharge);
    const bookingDuration = Global.NurseappointmentDetails.totalServiceTime.label;
    const [imageURI, setImageURI] = useState("");
    const [sendDisable, setSendDisable] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [paymentDisable, setPaymentDisable] = useState(false);
    const [cgst, setCGST] = useState(0);
    const [sgst, setSGST] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState("");

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
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
        const startDate = moment(Global.nurseSelecting.selectedStartDate).format('YYYY-MM-DD');
        const endDate = moment(Global.nurseSelecting.selectedEndDate).format('YYYY-MM-DD');
        const startTime = Global.nurseSelecting.startTime;
        const endTime = Global.nurseSelecting.endTime;
        const startTime24 = moment(startTime, 'hh:mm A').format('HH:mm');
        const endTime24 = moment(endTime, 'hh:mm A').format('HH:mm');
        const startDateTime = moment(`${startDate}T${startTime24}:00.000Z`);
        const endDateTime = moment(`${endDate}T${endTime24}:00.000Z`);
        const hoursDifference = Math.max(1, endDateTime.diff(startDateTime, 'hours'));
        const daysDifference = Math.ceil(hoursDifference / 24);
        let totalFees = nurseFees * daysDifference;
        setCGST(totalFees * 9 / 100);
        setSGST(totalFees * 9 / 100);
        setTotalAmount(totalFees);
        const startMomentDate = moment(Global.nurseSelecting.selectedStartDate);
        const endMomentDate = moment(Global.nurseSelecting.selectedEndDate);
        const daysDifferenceAlt = Math.max(1, endMomentDate.diff(startMomentDate, 'days') + 1);
        if (startTime == "00:00 AM" && endTime == "00:00 AM" && startDate !== endDate) {
            setDayChecker(true);
            totalFees = nurseFees * daysDifferenceAlt;
            setNurseFees(totalFees);
            setCGST(totalFees * 9 / 100);
            setSGST(totalFees * 9 / 100);
            setTotalAmount(totalFees);
        } else {
            setDayChecker(false)
            setNurseFees(totalFees);
        }
    }, [])

    const onEditClick = () => {
        setUpdatedAddress(addressText);
        setShowAddressModal(true);
    }

    const onSaveAddress = () => {
        setAddressText(updatedAddress);
        if (Global.userType == "Caregiver") {
            Global.patientAddress = updatedAddress;
        } else {
            Global.userInfo.Address = updatedAddress;
        }
        setShowAddressModal(false);
    };

    const CheckAddress = () => {
        if (addressText?.length > 0) {
            setShowDisclaimer(true);
        }
        else {
            DisplayError("Please Enter Address.");
        }
    }

    const createpatientservice = async (orderNumber) => {
        try {
            const body = {
                "userId": Global.userID,
                "patientId": Global.patientID,
                "providerId": Global.nurseSelecting.CareBuddyId,
                "startDate": selectedStartDate,
                "endDate": selectedEndDate,
                "address": Global.userType == "Caregiver" ? Global.patientAddress : Global.userInfo.Address,
                "startTime": resultstarttime,
                "endTime": resultEndTime,
                "serviceAmount": Global.doctorAmount,
                "orderId": orderNumber,
                "transactionId": orderNumber,
                "services": Global.nurseSelecting.selectedServicesId,
                "paymentTransactionId": Global.NurseappointmentDetails.paymentTransactionId.toString(),
                "cfOrderId": Global.NurseappointmentDetails.cfOrderId.toString(),
                "patientName": Global.userType == "Caregiver" ? Global.patientName : Global.userInfo.firstName,
                "providerName": Global.nurseSelecting.providerName,
                "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : "",
                "serviceType": Global.nurseSelecting.Type,
                "templateName": Global.userType == "Caregiver" ? (Global.NR_Patient == "YES" ? "AppointmentBooking_Caregiver_N_DC" : "AppointmentBooking_NR_N_DC") : "AppointmentBooking_N_DC",
                "patientUserId": Global.patientUserId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('carebuddy/createpatientservice', body);
            setLoading(false);
            navigation.navigate("PaymentConfirmation", { orderId: response.orderNumber, paymentStatus: true, finalAmount: finalAmount });
        } catch (error) {
            setLoading(false);
            navigation.navigate("PaymentConfirmation", { orderId: "", paymentStatus: false });
        }
    }

    useEffect(() => {
        const onVerify = (orderID) => {
            changeResponseText('orderId is :' + orderID);
            setOrderId(orderID);
            createpatientservice(orderID);
        };

        const onError = async (error, orderID) => {
            await updatePaymentStatus(error, orderID);
            changeResponseText(
                'exception is : ' + JSON.stringify(error) + '\norderId is :' + orderID
            );
            navigation.navigate("PaymentConfirmation", { orderId: orderID, paymentStatus: false });
        };
        CFPaymentGatewayService.setCallback({ onVerify, onError });
        return () => {
            CFPaymentGatewayService.removeCallback();
        };
    }, []);


    const updatePaymentStatus = async (userPaymnetStatus, invoiceNumber) => {
        try {
            const body = {
                "invoiceNumber": invoiceNumber,
                "statusReason": userPaymnetStatus.message,
                "status": userPaymnetStatus.status,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            if (Global.OS == "android") {
                setLoading(true);
            }
            await apiCall('carebuddy/updatepaymentstatus', body);
            if (Global.OS == "android") {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || Global.warningMessage);
        }
    }

    const _startWebCheckout = async (data) => {
        try {
            const session = new CFSession(
                `${data.payment_session_id}`,
                `${data.order_id}`,
                CFEnvironment.SANDBOX
            );
            CFPaymentGatewayService.doWebPayment(JSON.stringify(session));
        } catch (e) {
            console.log(e.message);
        }
    };

    const changeResponseText = (text) => {
        console.log(text);
    };

    const Payment = async (data) => {
        await _startWebCheckout(data);
    }

    const navigateToPaymentConfirmation = async () => {
        setShowDisclaimer(false);
        try {
            await apppointmentBookingApi();
        } catch (error) {
            DisplayError(error.msg || Global.warningMessage);
        }
    };

    const apppointmentBookingApi = async () => {
        const foundObject = Global.nurseSearchData.find(item => item.id === Global.nurseSelecting.CareBuddyId);
        return new Promise(async (res, rej) => {
            try {
                if (Global.OS == "android") {
                    setLoading(true);
                } else {
                    setPaymentDisable(true);
                }
                setFinalAmount((totalAmount + cgst + sgst).toFixed(2));
                const body = {
                    "base_amount": totalAmount.toString(),
                    "cgst": (cgst).toFixed(2),
                    "sgst": (sgst).toFixed(2),
                    "order_amount": (totalAmount + cgst + sgst).toFixed(2),
                    "perDayFees": foundObject.serviceCharge,
                    "order_currency": "INR",
                    "duration": bookingDuration,
                    "customer_details": {
                        "customer_id": Global.userID,
                        "customer_name": Global.userInfo.firstName + ' ' + Global.userInfo.lastName,
                        "customer_email": Global?.userInfo?.email == "" ? "" : Global.userInfo.email,
                        "customer_phone": Global.userInfo.mobileNo,
                    },
                    "order_meta": {
                        "notify_url": "https://webhook.site/c75b847b-c1b5-41bc-9a93-6f607cf58aa0"
                    }
                };
                Global.doctorAmount = (totalAmount + cgst + sgst).toFixed(2);
                const response = await apiCall('cashfree/createorders', body);
                await Payment(response);
                Global.NurseappointmentDetails = {
                    FormatedSelectedServices: Global.nurseSelecting.SelectedServices,
                    Specialisation: Specialisation,
                    selectedStartDate: selectedStartDate,
                    selectedEndDate: selectedEndDate,
                    startTime: Global.nurseSelecting.startTime,
                    endTime: Global.nurseSelecting.endTime,
                    CareBuddyID: Global.nurseSelecting.CareBuddyId,
                    NurseName: NurseName,
                    gender: gender,
                    NurseFees: nurseFees,
                    NurseDetails: filteredCareBuddyData.about,
                    NurseImage: NurseImage,
                    NurseExperience: filteredCareBuddyData.Experience,
                    NurseRating: filteredCareBuddyData.Rating,
                    NurseWeeklyFees: filteredCareBuddyData.WeeklyFees,
                    NurseMonthlyFees: filteredCareBuddyData.MonthlyFees,
                    NurseProfessionalLevel: NurseProfessionalLevel,
                    totalServiceTime: totalServiceTime,
                    orderID: orderId,
                    paymentTransactionId: response.paymentTransactionId,
                    cfOrderId: response.cf_order_id
                };
                if (Global.OS == "android") {
                    setLoading(false);
                } else {
                    setPaymentDisable(false);
                }
                res();
            } catch (error) {
                if (Global.OS == "android") {
                    setLoading(false);
                } else {
                    setPaymentDisable(false);
                }
                rej(error);
            }
        })
    }

    let labelText;
    if (selectedStartDate === selectedEndDate) {
        labelText = "Package Day";
    } else if (dayChecker) {
        labelText = "Package Days";
    } else {
        labelText = "Package Day";
    }

    return (
        <ViewShot
            style={{ flex: 1, backgroundColor: Colors.defaultBackground }}
            ref={viewShotRef}
            captureMode="mount"
            options={{ format: "jpg", quality: 1.0 }}
            onCapture={capturedURI => {
                setImageURI(capturedURI);
            }}>
            <SafeAreaView style={GlobalStyles.mainContainer}>
                <View style={GlobalStyles.mainBox}>
                    <Header
                        headerTitle="Review Appointment"
                        hideWhatsapp={sendDisable}
                        onPress={() => navigation.goBack()}
                    />

                    <ScrollView>
                        <View style={styles.CareBuddyDatailHeader}>
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={styles.Image}
                                source={NurseImage == '' ? require("../assets/images/profile.png") : { uri: NurseImage }}
                            />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "80%" }}>
                                <View style={{ marginTop: -heightToDp(1), marginLeft: widthToDp(4) }}>
                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>{NurseName}</Text>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>{Specialisation}</Text>
                                </View>
                                {
                                    !sendDisable &&
                                    <Pressable onPress={() => captureViewShot()} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                        <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryButtonColor }]} iconsize={widthToDp(5)} />
                                        <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_600SemiBold]}>Share</Text>
                                    </Pressable>
                                }
                            </View>
                        </View>
                        {
                            (Specialisation != 'Domestic Caretaker' || Specialisation != 'Caretaker') &&
                            <View style={{ flexDirection: "column", width: "100%" }}>
                                <FieldLabel text={"Services"} />
                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginTop: widthToDp(2) }]}>{SelectedServices?.join(', ')}</Text>
                            </View>
                        }
                        <FieldLabel text={labelText} extraStyles={{ marginTop: heightToDp(2) }} />
                        <View style={{ borderRadius: 14, marginTop: widthToDp(2), flexDirection: 'row' }}>
                            <View style={styles.packagesDays}>
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText]}>{selectedStartDate}</Text>
                            </View>
                            {
                                (selectedStartDate != selectedEndDate) &&
                                <>
                                    <View style={styles.packagesDays}>
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText]}>To</Text>
                                    </View>
                                    <View style={styles.packagesDays}>
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText]}>{selectedEndDate}</Text>
                                    </View>
                                </>
                            }
                        </View>

                        <View style={{ marginTop: widthToDp(2), flexDirection: 'row', alignItems: "center", }}>
                            <FieldLabel text={"Time Slot : "} extraStyles={{ marginRight: widthToDp(2) }} />
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(2) }]}>{startTime} To {endTime}</Text>
                        </View>
                        <View style={[{ alignItems: "center", flexDirection: "row" }, GlobalStyles.fixedTopSpacing]}>
                            <FieldLabel text={"Address"} Nospace={true} />
                            {
                                !sendDisable && (
                                    <Pressable
                                        onPress={onEditClick}
                                        style={{ marginLeft: widthToDp(2), marginTop: widthToDp(2) }}>
                                        <VectorIcons groupName="FontAwesome" iconName="edit" iconsize={widthToDp(6)} iconstyle={{ color: Colors.primaryButtonColor }} />
                                    </Pressable>
                                )
                            }
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText, { marginTop: widthToDp(2) }]}>{addressText}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <FieldLabel text={`Package Fee : ₹ ${nurseFees} /- `} />
                            <View style={{ marginTop: widthToDp(2) }}>
                            </View>
                        </View>
                        <View style={{ flexDirection: "column", width: "85%" }}>
                            <FieldLabel text={`CGST (9%) : ₹ ${cgst} /-`} />
                        </View>
                        <View style={{ flexDirection: "column", width: "85%" }}>
                            <FieldLabel text={`SGST (9%) : ₹ ${sgst} /- `} />
                        </View>
                        <View style={{ flexDirection: "column", width: "85%" }}>
                            <FieldLabel text={`Final Amount : ₹ ${(totalAmount + cgst + sgst).toFixed(2)} /- `} />
                        </View>
                        {
                            !sendDisable &&
                            <CommonButton
                                onPress={() => CheckAddress()}
                                extraStyles={{ marginTop: heightToDp(4), marginBottom: heightToDp(8) }}
                                visible={true}
                                disabled={paymentDisable}
                                buttonText={"Confirm Booking"}
                            />
                        }
                    </ScrollView>
                    {showDisclaimer && <DisclaimerPopup
                        type={"Nurse"}
                        showDisclaimer={showDisclaimer}
                        setPop={setShowDisclaimer}
                        apppointmentBookingApis={navigateToPaymentConfirmation}
                        DisclaimerText={DisclaimerData[0].DisclaimerP}
                        maxHeight={"65%"}
                    />}
                </View>
                <Modal visible={showAddressModal} transparent={true} animationType="slide">
                    <View style={styles.modalBackground}>
                        <KeyboardAvoidingView style={{ width: "100%" }}>
                            <ScrollView style={{ paddingHorizontal: widthToDp(4) }} keyboardShouldPersistTaps={"always"}>
                                <View style={{ width: "100%" }}>
                                    <View style={{ backgroundColor: Colors.boxBackground, width: "100%", borderRadius: 14, padding: widthToDp(4) }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <FieldLabel text={"Address"} mandatory={true} Nospace={true} />
                                            <Pressable
                                                hitSlop={10}
                                                onPress={() => { setShowAddressModal(false) }}
                                            >
                                                <VectorIcons groupName='Ionicons' iconName='close' iconsize={widthToDp(8)} />
                                            </Pressable>
                                        </View>
                                        <View style={[{ width: "100%" }, GlobalStyles.fixedTopSpacing]}>
                                            <TextInput
                                                placeholder='Enter Address.'
                                                placeholderTextColor={Colors.placeholderTextColor}
                                                style={[styles.NotesInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                                value={updatedAddress}
                                                maxLength={500}
                                                multiline={true}
                                                numberOfLines={4}
                                                onChangeText={(text) => setUpdatedAddress(text)}
                                            />
                                        </View>
                                        <CommonButton
                                            onPress={onSaveAddress}
                                            extraStyles={{ marginTop: heightToDp(4) }}
                                            buttonText={"Save Address"}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                {
                    !sendDisable &&
                    <Footer navigation={navigation} />
                }
            </SafeAreaView>
        </ViewShot>
    );
}

const styles = StyleSheet.create({
    CareBuddyDatailHeader: {
        flexDirection: 'row',
    },
    Image: {
        height: 60,
        width: 60,
        borderWidth: 3,
        borderRadius: 50,
        overflow: 'hidden',
    },
    imageTitle: {
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14,
        alignItems: "center",
        paddingHorizontal: widthToDp(2),
        paddingVertical: heightToDp(0.5)
    },
    headertext: {
        paddingHorizontal: widthToDp(4),
        width: "80%",
        marginTop: heightToDp(2)
    },
    packagesDays: {
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: widthToDp(2)
    },
    shareButton: {
        alignItems: "center",
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        paddingHorizontal: widthToDp(2),
        paddingVertical: heightToDp(1),
    },
    NotesInput: {
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        marginRight: widthToDp(2),
        textAlignVertical: 'top',
        paddingLeft: widthToDp(4),
        width: '100%',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default AppointmentReview;