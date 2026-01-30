import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, FlatList, Text, Pressable, Modal } from 'react-native';
import Header from '../components/Header';
import GlobalStyles from '../utils/GlobalStyles';
import { scale, verticalScale } from 'react-native-size-matters';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import FieldLabel from '../components/FieldLabel';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Global from './Global';
import { useNavigation } from '@react-navigation/native';
import VectorIcons from '../components/VectorIcons';

const NoShowAppointmentScreen = () => {
    const navigation = useNavigation();
    const [noShowAppointmentData, setNoShowAppointmentData] = useState([]);
    const [selectedAppointment, SetSelectedAppointment] = useState("");
    const [selectedReason, setSelectedReason] = useState("");
    const [selectedReasonKey, setSelectedReasonKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [showModal, setShowModal] = useState("");
    const [successModal, setSuccessModal] = useState(false);
    const [takeActionModal, setTakeActionModal] = useState(false);

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    const reasons = Global.userType === "Caregiver" ? [
        {
            key: 0,
            reason: `${selectedAppointment.patientName} not available`,
        },
        {
            key: 1,
            reason: `${selectedAppointment.providerType} not available`,
        },
    ]
        :
        [
            {
                key: 0,
                reason: "I am not available",
            },
            {
                key: 1,
                reason: `${selectedAppointment.providerType} not available`,
            },
        ];

    useEffect(() => {
        getNoShowAppointmentdata();
    }, []);

    const getNoShowAppointmentdata = async (data) => {
        try {
            const body = {
                "userType": Global.userType.toString(),
                "userId": Global.userID.toString(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": "android"
            }
            setLoading(true);
            let response = await apiCall("appointments/getmynoshowappointmentslist", body);
            setNoShowAppointmentData(response.appointmentData);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const getNoShowTemplateName = (data) => {
        let templateName;
        if (Global.userType == "Patient") {
            if (data.providerType == "Nurse" || data.providerType == "Domestic Caretaker") {
                templateName = "NOSHOW_BY_PATIENT_PROVIDER_UNAVAILABILITY_N_DC";
            } else {
                templateName = "NOSHOW_BY_PATIENT_PROVIDER_UNAVAILABILITY_DR_N";
            }
        } else {
            if (data.providerType == "Nurse" || data.providerType == "Domestic Caretaker") {
                templateName = "NOSHOW_BY_CG_PROVIDER_UNAVAILABILITY_N_DC";
            } else {
                templateName = "NOSHOW_BY_CG_PROVIDER_UNAVAILABILITY_DR_N";
            }
        }
        return templateName;
    };

    const onSubmit = async () => {
        if (selectedReasonKey != 0) {
            try {
                const body = {
                    "id": selectedAppointment.id,
                    "comment": selectedReason,
                    "userId": Global.userID.toString(),
                    "type": selectedAppointment.providerType,
                    "orderNumber": selectedAppointment.orderNumber,
                    "date": selectedAppointment.appointmentDate,
                    "time": selectedAppointment.startTime,
                    "address": selectedAppointment.address,
                    "appointmentType": selectedAppointment.providerType == "Nurse" || selectedAppointment.providerType == "Domestic Caretaker" ? "" : selectedAppointment.mode,
                    "serviceType": selectedAppointment.providerType == "Nurse" ? selectedAppointment.serviceType : selectedAppointment.providerType == "Domestic Caretaker" ? selectedAppointment.providerType : "",
                    "patientName": selectedAppointment.patientName,
                    "patientEmail": selectedAppointment.patientEmail,
                    "patientMobileNumber": selectedAppointment.patientMobileNumber,
                    "caregiverName": selectedAppointment.careGiverName,
                    "caregiverEmail": selectedAppointment.careGiverEmail,
                    "caregiverMobileNumber": selectedAppointment.careGiverMobileNumber,
                    "providerName": selectedAppointment.providerName,
                    "providerEmail": selectedAppointment.providerEmail,
                    "providerMobileNumber": selectedAppointment.providerMobileNumber,
                    "templateName": getNoShowTemplateName(selectedAppointment),
                    "patientUserId": selectedAppointment.patientUserId,
                    "caregiverId": Global.userType == "Caregiver" ? Global.userID : "",
                    "providerId": selectedAppointment.providerId,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": "android"
                }
                setTakeActionModal(false);
                setLoading(true);
                await apiCall('appointments/createnoshowaction', body);
                setLoading(false);
                await getNoShowAppointmentdata();
                setSuccessModal(true);
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        } else {
            if (selectedAppointment.providerType == "Nurse" || selectedAppointment.providerType == "Domestic Caretaker") {
                try {
                    const body = {
                        "id": selectedAppointment.id.toString(),
                        "userId": Global.userID.toString(),
                        "statusReason": "I am not available",
                        "refundAmount": "0",
                        "address": selectedAppointment.address,
                        "serviceType": selectedAppointment.serviceType,
                        "startTime": selectedAppointment.startTime,
                        "startDate": selectedAppointment.appointmentDate,
                        "providerId": selectedAppointment.providerId,
                        "patientUserId": selectedAppointment.patientUserId,
                        "caregiverId": Global.userType == "Caregiver" ? Global.userID : selectedAppointment.createdBy,
                        "patientName": selectedAppointment.patientName,
                        "caregiverName": selectedAppointment.careGiverName,
                        "providerName": selectedAppointment.providerName,
                        "orderNumber": selectedAppointment.orderNumber,
                        "templateName": Global.userType == "Caregiver" ? "NOSHOW_BY_CG_PATIENT_UNAVAILABILITY_N_DC" : "NOSHOW_BY_PATIENT_OWN_UNAVAILABILITY_N_DC",
                        "status": '4',
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    };
                    setTakeActionModal(false);
                    setLoading(true);
                    await apiCall('carebuddy/cancelpatientservice', body);
                    await getNoShowAppointmentdata();
                    setLoading(false);
                    setSuccessModal(true);
                } catch (error) {
                    setLoading(false);
                    DisplayError(error.msg || "Something went wrong, please try again");
                }
            } else {
                try {
                    const body = {
                        "userId": Global.userID.toString(),
                        "appointmentId": selectedAppointment.id.toString(),
                        "status": "No Show",
                        "statusReason": "I am not available",
                        "refundAmount": "0",
                        "orderId": selectedAppointment.invoiceNumber.toString(),
                        "patientName": selectedAppointment.patientName,
                        "providerName": selectedAppointment.providerName,
                        "date": selectedAppointment.appointmentDate,
                        "time": selectedAppointment.startTime,
                        "address": selectedAppointment.address,
                        "caregiverName": selectedAppointment.careGiverName,
                        "caregiverId": Global.userType == "Caregiver" ? Global.userID : selectedAppointment.createdBy,
                        "address": selectedAppointment.address,
                        "appointmentType": selectedAppointment.mode,
                        "patientUserId": selectedAppointment.patientUserId,
                        "providerId": selectedAppointment.providerId,
                        "orderNumber": selectedAppointment.orderNumber,
                        "templateName": Global.userType == "Caregiver" ? "NOSHOW_BY_CG_PATIENT_UNAVAILABILITY_DR_N" : "NOSHOW_BY_PATIENT_OWN_UNAVAILABILITY_DR_N",
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    }
                    setTakeActionModal(false);
                    setLoading(true);
                    await apiCall('appointments/updateappointmentstatus', body);
                    await getNoShowAppointmentdata();
                    setLoading(false);
                    setSuccessModal(true);
                } catch (error) {
                    setLoading(false);
                    DisplayError(error.msg || "Something went wrong, please try again");
                }
            }
        }
    }

    const handleSelectedReason = (item) => {
        setSelectedReason(item.reason);
        setSelectedReasonKey(item.key);
    };
    const onModalClick = () => {
        if (noShowAppointmentData.length == 0) {
            setSuccessModal(false);
            navigation.replace("Dashboard");
        } else {
            setSelectedReasonKey(0);
            setSuccessModal(false);
        }
    }
    const onCardAction = (item) => {
        if (Global.userType == "Caregiver") {
            setSelectedReason(`${item.patientName} not available`);
        } else {
            setSelectedReason("I am not available");
        }
        SetSelectedAppointment(item);
        setTakeActionModal(true);
    }
    const handleCancelCrossbutton = () => {
        setTakeActionModal(false);
        setSelectedReasonKey(0);
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header headerTitle="No Show Appointments" onPress={() => { navigation.navigate("Login") }} />
                <FlatList
                    keyExtractor={(item, index) => "key" + index}
                    style={{ marginBottom: heightToDp(2) }}
                    data={noShowAppointmentData}
                    renderItem={({ item, index }) =>
                        <View style={{ marginTop: heightToDp(2) }}>
                            <View style={styles.modalContent}>
                                {
                                    item.mode == "Home Visit" || item.providerType == "Nurse" || item.providerType == "Domestic Caretaker" ?
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { marginBottom: verticalScale(2) }]}>{item.address}</Text>
                                        :
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { marginBottom: verticalScale(2) }]}>{item.hospitalName}</Text>
                                }
                                <View style={[GlobalStyles.rowSpaceBetween, { width: "100%", marginVertical: verticalScale(2) }]}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "45%" }]}>Provider Name :</Text>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "55%" }]}>{`${item.providerName}`}</Text>
                                </View>
                                <View style={[GlobalStyles.rowSpaceBetween, { width: "100%", marginVertical: verticalScale(2) }]}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "40%" }]}>Provider Type : </Text>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "60%" }]}>{`${item.providerType}`}</Text>
                                </View>
                                {
                                    item.providerType != "Nurse" && item.providerType != "Domestic Caretaker" &&
                                    <View>
                                        <View style={[GlobalStyles.rowSpaceBetween, { width: "100%", marginVertical: verticalScale(2) }]}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "25%" }]}>Purpose :</Text>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "75%" }]}>{` ${item.purpose}`}</Text>
                                        </View>
                                        <View style={[GlobalStyles.rowSpaceBetween, { width: "100%" }]}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "20%" }]}>Mode :</Text>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "78%" }]}>{`${item.mode}`}</Text>
                                        </View>
                                    </View>
                                }
                                <View style={[GlobalStyles.rowSpaceBetween, { width: "100%", marginVertical: verticalScale(2) }]}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "20%" }]}>Date  :</Text>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "80%" }]}>{`${item.appointmentDate}`}</Text>
                                </View>
                                <View>
                                    <View style={[GlobalStyles.rowSpaceBetween, { width: "100%", marginVertical: verticalScale(2) }]}>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "35%" }]}>Start Time :</Text>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "65%" }]}>{`${item.startTime}`}</Text>
                                    </View>
                                    <View style={[GlobalStyles.rowSpaceBetween, { width: "100%", marginVertical: verticalScale(2) }]}>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { width: "30%" }]}>End Time :</Text>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "70%" }]}>{`${item.endTime}`}</Text>
                                    </View>
                                </View>
                                <CommonButton extraStyles={[styles.modalBtn, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(2) }]}
                                    buttonText={"Take Action"}
                                    onPress={() => { onCardAction(item) }}>
                                </CommonButton>
                            </View>
                        </View>
                    }
                />
                {
                    Global.userType == "Caregiver" &&
                    <CommonButton buttonText={"Go to Dashboard"}
                        extraStyles={styles.skipBtn}
                        onPress={() => { navigation.navigate("Dashboard") }}
                    />
                }
                <Modal visible={successModal} animationType={'fade'} transparent={true}>
                    <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center" }}>
                        <View style={styles.optionView}>
                            <Text style={[GlobalStyles.mediumText, styles.warningMessage, Fonts.Nunito_600SemiBold]}>
                                {
                                    selectedReasonKey == 0 ?
                                        `Appointment has been marked as No-Show as Patient was unavailable at the scheduled time. Please contact support@hopetheapp.com if you need assistance.`
                                        :
                                        `Appointment has been marked as No-Show as Service Provider was unavailable at the scheduled time. Our support team will investigate further and determine if a refund has to be issued. Please contact support@hopetheapp.com if you need assistance.`
                                }
                            </Text>
                            <View>
                                <CommonButton buttonText={"Ok"}
                                    extraStyles={styles.dashboardBtn}
                                    onPress={() => {
                                        onModalClick();
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal transparent={true} visible={takeActionModal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <FieldLabel text={'Please select reason'} Nospace={true} extraStyles={[GlobalStyles.largeText, { marginBottom: verticalScale(10) }]} mandatory={true} />
                                <View>
                                    <Pressable style={styles.modalCloseButton} onPress={() => handleCancelCrossbutton()}>
                                        <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                    </Pressable>
                                </View>
                            </View>
                            <View>
                                <FlatList
                                    keyExtractor={(item, index) => "key" + index}
                                    data={reasons}
                                    renderItem={({ item, index }) =>
                                        <Pressable
                                            onPress={() => handleSelectedReason(item)}
                                            style={({ pressed }) => ([styles.reasonButton, { opacity: pressed ? 0.5 : 1 }])}
                                        >
                                            <View style={styles.ReasonContainer}>
                                                <View
                                                    style={[{
                                                        width: 13,
                                                        height: 13,
                                                        backgroundColor: item.key == selectedReasonKey ? Colors.primaryButtonColor : Colors.boxBackground,
                                                        borderRadius: 50
                                                    }]}
                                                />
                                            </View>
                                            <Text style={[GlobalStyles.normalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                                {item.reason}
                                            </Text>
                                        </Pressable>
                                    }
                                />
                            </View>
                            <View style={styles.modalBottomBtnBox}>
                                <CommonButton extraStyles={[styles.modalBtn, Fonts.Nunito_600SemiBold, GlobalStyles.fixedTopSpacing]}
                                    buttonText={"Submit"}
                                    onPress={onSubmit}>
                                </CommonButton>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ReasonContainer: {
        width: 20,
        height: 20,
        borderRadius: 50,
        borderWidth: 1.5,
        borderColor: Colors.primaryButtonColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reasonButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: heightToDp(0.5)
    },
    modalBottomBtnBox: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around"
    },
    modalBtn: {
        width: "50%",
        height: heightToDp(6),
        paddingHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
    modalContent: {
        width: widthToDp(90),
        backgroundColor: Colors.boxBackground,
        padding: widthToDp(4),
        shadowColor: Colors.primaryTextColor,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.41,
        shadowRadius: 9.11,
        elevation: 14,
        borderRadius: 14,
        height: "auto"
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        alignItems: "center",
        justifyContent: "center"
    },
    optionView: {
        minHeight: heightToDp(24),
        width: widthToDp(90),
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        justifyContent: 'space-around',
        alignItems: 'center',
        alignSelf: "center",
        shadowColor: Colors.primaryTextColor,
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
    },
    warningMessage: {
        marginTop: heightToDp(2),
        paddingHorizontal: widthToDp(6),
        textAlign: "center",
    },
    dashboardBtn: {
        alignSelf: 'center',
        width: widthToDp(20),
        height: heightToDp(6),
        marginVertical: heightToDp(2)
    },
})

export default NoShowAppointmentScreen;