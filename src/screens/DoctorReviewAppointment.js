import { View, Text, SafeAreaView, StyleSheet, Pressable, Image, Modal, ScrollView, KeyboardAvoidingView, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlobalStyles from '../utils/GlobalStyles';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import VectorIcons from '../components/VectorIcons';
import FieldLabel from '../components/FieldLabel';
import CommonButton from '../components/CommonButton';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from 'react-native-size-matters';
import RadioButton from '../components/RadioButton';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Global from './Global';
import DisclaimerPopup from '../components/DisclaimerPopup';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import DoctorDisclaimerData from "../assets/mdm/DoctorDisclaimerData.json";
import moment from 'moment';
import ViewShot from 'react-native-view-shot';

const DoctorReviewAppointment = (props) => {

    const viewShotRef = React.createRef();
    const allData = props.route.params;
    const amount = Number(allData.Time.fees);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [imageURI, setImageURI] = useState("");
    const [sendDisable, setSendDisable] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const modeId = props.route.params.modeId;
    const Type = props.route.params.Type;
    const purposeId = props.route.params.purposeId;
    const Mode = props.route.params.Mode;
    const hospitalData = props.route.params.hospitaldata;
    const [paymentDisable, setPaymentDisable] = useState(false);
    const [cgst, setCGST] = useState(0);
    const [sgst, setSGST] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState("");
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressText, setAddressText] = useState(Global.userType == "Caregiver" ? Global.patientAddress : Global.userInfo.Address);
    const [updatedAddress, setUpdatedAddress] = useState("");

    const captureViewShot = async () => {
        setIsCapturing(true);
        try {
            const capturedURI = await viewShotRef.current.capture();
            setImageURI(capturedURI);
            shareImage(capturedURI);
        } catch (error) {
            console.error("Error capturing view shot:", error);
        } finally {
            setIsCapturing(false);
        }
    };

    useEffect(() => {
        const onVerify = (orderId) => {
            changeResponseText('orderId is :' + orderId);
            Triggercreateappointment(orderId);
        };

        const onError = async (error, orderId) => {
            await updatePaymentStatus(error, orderId);
            changeResponseText(
                'exception is : ' + JSON.stringify(error) + '\norderId is :' + orderId
            );
            await updatePaymentStatus(error, orderId);
            navigation.navigate("PaymentConfirmation", { orderId: orderId, paymentStatus: false, doctorData: allData, location: props?.route?.params?.location });
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

    const shareImage = async (capturedURI) => {
        if (capturedURI) {
            const options = {
                title: 'Share Image',
                url: capturedURI,
                type: 'image/jpeg',
            };
            Share.open(options)
                .then((res) => {
                    console.log('Shared:', res);
                    setImageURI("");
                })
                .catch((err) => {
                    console.log('Error sharing:', err);
                    setImageURI("");
                });
        } else {
            console.log('No image captured yet.');
        }
        setSendDisable(false);
    };

    useEffect(() => {
        setImageURI("");
        setCGST(amount * 9 / 100);
        setSGST(amount * 9 / 100);
        setTotalAmount(amount);
    }, [])

    function formatDate(dateString) {
        return moment(dateString, 'DD-MMM-YYYY').format('DD/MM/YYYY');
    }
    const Triggercreateappointment = async (orderId) => {
        try {
            const body = {
                "userId": Global.userID.toString(),
                "treatmentCycleId": Global.selectedCycle,
                "type": Type,
                "typeId": allData.selectedDoctorDetail.id,
                "modeId": modeId.toString(),
                "purposeId": purposeId.toString(),
                "date": formatDate(allData.SelectedDate),
                "time": allData.Time.time,
                "endTime": allData.Time.endTime,
                "doctorId": props.route.params.selectedDoctorDetail.id,
                "planDetailsId": allData.Time.planDetailsId.toString(),
                "orderId": orderId,
                "paymentTransactionId": Global.doctorTransactionId.toString(),
                "address": Mode == "Home Visit" ? Global.userType == "Caregiver" ? Global.patientAddress : Global.userInfo.Address : Mode == "In Person" ? allData.hospitaldata?.name : "Virtual",
                "patientName": Global.userType == "Caregiver" ? Global.patientName : Global.userInfo.firstName,
                "providerName": allData.selectedDoctorDetail.name,
                "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : "",
                "templateName": Global.userType == "Caregiver" ? "AppointmentBooking_Caregiver_DR_N" : "AppointmentBooking_DR_N",
                "patientUserId": Global.patientUserId,
                "appointmentType": allData.Mode, // e.g., "New", "Follow-up", etc.
                "appointmentFees": Global.doctorAmount, // e.g., "500"
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall('appointments/createappointment', body);
            setLoading(false);
            navigation.navigate("PaymentConfirmation", { orderId: response.appointmentInfo.orderNumber, paymentStatus: true, doctorData: allData, paymentData: response, finalAmount: (totalAmount + cgst + sgst).toFixed(2), location: props?.route?.params?.location });
        } catch (error) {
            setLoading(false);
            navigation.navigate("PaymentConfirmation", { orderId: "", paymentStatus: false, doctorData: allData, location: props?.route?.params?.location });
        }
    }

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    const confirmBooking = () => {
        setShowDisclaimer(true);
    }
    const handleDoneClick = () => {
        setShowSuccessModal(false);
        navigation.replace("TreatmentData");
    }
    const navigateToPaymentConfirmation = async () => {
        setShowDisclaimer(false);
        try {
            if (Global.OS == "android") {
                setLoading(true);
            }
            await apppointmentBookingApi();
            if (Global.OS == "android") {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const apppointmentBookingApi = async () => {
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
                    "perDayFees": amount.toString(),
                    "order_currency": "INR",
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
                const response = await apiCall('cashfree/createorders', body);
                Global.doctorAmount = (totalAmount + cgst + sgst).toFixed(2);
                Global.doctorTransactionId = response.paymentTransactionId;
                await Payment(response);
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

    const Payment = async (data) => {
        await _startWebCheckout(data);
    }
    const _startWebCheckout = async (data) => {
        try {
            const session = new CFSession(
                `${data.payment_session_id}`,
                `${data.order_id}`,
                CFEnvironment.SANDBOX
            );
            await CFPaymentGatewayService.doWebPayment(JSON.stringify(session));
        } catch (e) {
            console.log(e.message);
        }
    };
    const changeResponseText = (text) => {
        console.log(text);
    };

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
                <View style={[GlobalStyles.mainBox, { position: "relative" }]}>
                    <Header
                        headerTitle="Review Appointment"
                        hideWhatsapp={isCapturing}
                        onPress={() => navigation.navigate("ChooseDateAndTime", { Mode, Purpose: props.route.params.Purpose, doctorData: props.route.params.selectedDoctorDetail, hospitalData, Type: allData.Type, modeId, purposeId, location: props?.route?.params?.location })}
                    />
                    <ScrollView style={{ marginBottom: heightToDp(15) }}>

                        <View style={[styles.card]}>
                            <View style={{ width: "20%" }}>
                                {props.route.params.selectedDoctorDetail.profilePath && props.route.params.selectedDoctorDetail.profilePath !== "" ? (
                                    <Image style={styles.Image} resizeMode='cover' source={{ uri: props.route.params.selectedDoctorDetail.profilePath }} />
                                ) : (
                                    <Image resizeMode='cover' style={styles.Image} source={require("../assets/images/profile.png")} />
                                )}
                            </View>
                            <View style={{ width: "65%" }}>
                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>{allData.selectedDoctorDetail.name}</Text>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{allData.selectedDoctorDetail.serviceType}</Text>
                            </View>
                            {!isCapturing && (
                                <Pressable onPress={captureViewShot} style={[styles.shareButton, { width: "15%" }]}>
                                    <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryButtonColor }]} iconsize={widthToDp(5)} />
                                    <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_600SemiBold]}>Share</Text>
                                </Pressable>
                            )}

                        </View>
                        {
                            Mode != "Virtual" && Mode != "Home Visit" &&
                            <View>
                                <FieldLabel text={"Location"} extraStyles={{ marginTop: heightToDp(2) }} />
                                <View style={{ borderRadius: 14, marginTop: widthToDp(1), flexDirection: 'row' }}>
                                    <View style={styles.packagesDays}>
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{allData.hospitaldata?.name}</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            Mode == "Home Visit" &&
                            <View>
                                <View style={[{ alignItems: "center", flexDirection: "row" }, GlobalStyles.fixedTopSpacing]}>
                                    <FieldLabel text={"Location"} Nospace={true} />
                                    {
                                        !isCapturing && (
                                            <Pressable
                                                onPress={onEditClick}
                                                style={{ marginLeft: widthToDp(2), marginTop: widthToDp(2) }}>
                                                <VectorIcons groupName="FontAwesome" iconName="edit" iconsize={widthToDp(6)} iconstyle={{ color: Colors.primaryButtonColor }} />
                                            </Pressable>
                                        )}
                                </View>
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { marginTop: widthToDp(2) }]}>{addressText}</Text>
                            </View>


                        }

                        <FieldLabel text={"Date & Time"} extraStyles={{ marginTop: heightToDp(2) }} />
                        <View style={{ marginTop: heightToDp(1) }}>
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{`${allData.SelectedDate} ${allData.Time.newTime}`}</Text>
                        </View>
                        <FieldLabel text={"Mode"} extraStyles={{ marginTop: heightToDp(2) }} />
                        <View style={{ marginTop: heightToDp(1) }}>
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{allData.Mode}</Text>
                        </View>
                        <FieldLabel text={"Purpose"} extraStyles={{ marginTop: heightToDp(2) }} />
                        <View style={{ marginTop: heightToDp(1) }}>
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{allData.Purpose}</Text>
                        </View>
                        <FieldLabel text={`Service Fee : ₹ ${amount} /-`} extraStyles={{ marginTop: heightToDp(2) }} />
                        <View style={{ flexDirection: "column", width: "85%" }}>
                            <FieldLabel text={`CGST (9%) : ₹ ${cgst} /- `} />
                        </View>
                        <View style={{ flexDirection: "column", width: "85%" }}>
                            <FieldLabel text={`SGST (9%) : ₹ ${sgst} /- `} />
                        </View>
                        <View style={{ flexDirection: "column", width: "85%" }}>
                            <FieldLabel text={`Final Amount : ₹ ${(totalAmount + cgst + sgst).toFixed(2)} /- `} />
                        </View>

                        <Modal visible={showSuccessModal} transparent={true} animationType={"fade"}>
                            <View style={styles.modalContainer}>
                                <View style={styles.container}>
                                    <View style={styles.messageContainer}>
                                        <View style={GlobalStyles.rowFlexstart}>
                                            <RadioButton selected={true} backgroundColor={Colors.successColor} bigImage={true} />
                                            <Text style={[styles.label, Fonts.Nunito_600SemiBold]}>Success</Text>
                                        </View>
                                    </View>
                                    <View style={[{ marginLeft: widthToDp(4), flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', marginTop: heightToDp(2) }]}>
                                        <Text style={[{ color: Colors.primaryTextColor }, GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold]}>{"Appointment Booked"}</Text>
                                    </View>

                                    <View style={styles.rowContainer}>
                                        <View style={[{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'flex-start', marginLeft: widthToDp(0) }]}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{"Dr."} {allData.selectedDoctorDetail.name}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rowContainer}>
                                        <VectorIcons groupName='FontAwesome' iconName='calendar' iconstyle={styles.icon} />
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{allData.SelectedDate}</Text>
                                    </View>
                                    <View style={styles.rowContainer}>
                                        <VectorIcons groupName='AntDesign' iconName='clockcircle' iconstyle={styles.icon} />
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{allData.Time.time}</Text>
                                    </View>
                                    <View style={styles.rowContainer}>
                                        <VectorIcons groupName='Ionicons' iconName='location-sharp' iconstyle={styles.icon} />
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{allData.Mode}</Text>
                                    </View>
                                    <View style={[GlobalStyles.fixedTopBottomSpacing, GlobalStyles.rowSpaceBetween, { paddingHorizontal: 20 }]}>
                                        <CommonButton buttonText={"Done"}
                                            onPress={() => handleDoneClick()}
                                            extraStyles={{ width: "48%", marginTop: heightToDp(2) }}
                                        />
                                        <CommonButton buttonText={"Invoice"}
                                            extraStyles={{ width: "48%", marginTop: heightToDp(2) }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        <Modal visible={showAddressModal} transparent={true} animationType="slide">
                            <View style={styles.modalBackground}>
                                <KeyboardAvoidingView style={{ width: "100%" }}>
                                    <ScrollView style={{ paddingHorizontal: widthToDp(4) }} keyboardShouldPersistTaps={"always"}>
                                        <View style={{ width: "100%" }}>
                                            <View style={{ backgroundColor: Colors.boxBackground, width: "100%", borderRadius: 14, padding: widthToDp(4) }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                    <FieldLabel text={"Location"} mandatory={true} Nospace={true} />
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
                        {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
                        <Spinner
                            visible={loading}
                            color={Colors.primaryButtonColor}
                            customIndicator={<Loader />}
                            textStyle={{ color: Colors.primaryButtonColor }}
                        />
                    </ScrollView>
                    {showDisclaimer && <DisclaimerPopup
                        type={Type}
                        showDisclaimer={showDisclaimer}
                        setPop={setShowDisclaimer}
                        DisclaimerText={DoctorDisclaimerData[0].DisclaimerP}
                        apppointmentBookingApis={navigateToPaymentConfirmation}
                        maxHeight={"43%"}
                    />}
                    {!isCapturing && (
                        <CommonButton
                            onPress={confirmBooking}
                            buttonText={"Confirm Booking"}
                            disabled={paymentDisable}
                            extraStyles={[GlobalStyles.fixbottomcommonButton, { marginTop: heightToDp(2) }]}
                            visible={true}
                        />
                    )}
                </View>
            </SafeAreaView>
        </ViewShot>
    )
}

const styles = StyleSheet.create({
    CareBuddyDatailHeader: {
        flexDirection: 'row',
        marginTop: heightToDp(1)
    },
    shareButton: {
        alignItems: "center",
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        paddingHorizontal: widthToDp(2),
        paddingVertical: heightToDp(1),
    },
    Image: {
        height: 60,
        width: 60,
        borderWidth: 2,
        borderRadius: 50,
        overflow: 'hidden',
        borderColor: "black",
    },
    packagesDays: {
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: widthToDp(2)
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#f1f1f1',
        opacity: 1,
        borderRadius: 14,
        width: '94%',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: heightToDp(2)
    },
    label: {
        color: Colors.successColor,
        fontSize: scale(22),
        marginLeft: widthToDp(4)
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: widthToDp(4),
        marginTop: heightToDp(2)
    },
    icon: {
        color: Colors.primaryTextColor,
        marginRight: widthToDp(6),
        marginLeft: widthToDp(1)
    },
    card: {
        paddingTop: verticalScale(10),
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14
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
})

export default DoctorReviewAppointment;