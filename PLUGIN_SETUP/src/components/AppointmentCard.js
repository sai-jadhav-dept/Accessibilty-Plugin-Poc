import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Linking, PermissionsAndroid, Modal, ImageBackground } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import Share from 'react-native-share';
import Confirmation from './Confirmation';
import Global from '../screens/Global';
import { scale, verticalScale } from 'react-native-size-matters';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import moment from 'moment';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Permission, invoiceTempalate } from '../utils/CommonFunctions';
import { PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import FieldLabel from './FieldLabel';
import CommonButton from './CommonButton';
import NoShowWarningModal from './NoShowWarningModal';

const AppointmentCard = (props) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedID, setSelectedID] = useState(0);
    const [cancelData, setCancelData] = useState('');
    const [cancellingDetails, setCancellingDetails] = useState([]);
    const [valid, setValid] = useState(false);
    const [initiateRefund, setInitiateRefund] = useState(false);
    const [appointmentType, setAppointmentType] = useState("");
    const today = new Date().toISOString().split('T')[0]
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [noShowAppointmentPatientDetails, setNoShowAppointmentPatientDetails] = useState('');
    const [selectedReason, setSelectedReason] = useState(Global.userType === "Caregiver" ? 0 : 1);
    const [reasonText, setReasonText] = useState('');
    const [reasons, setReason] = useState('');
    const [textChanger, setTextChanger] = useState(false);
    const [noShowedBy, setNoShowedBy] = useState([]);
    const [modalNoShow, setmodalNoShow] = useState(false);
    const [noshowModal, setNoshowModal] = useState(false);

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };
    const DisplayErrorNoShow = (text, textChanger) => {
        setTextChanger(textChanger)
        setWarningText(text)
        setNoshowModal(true);
    }

    const moreData = [
        {
            key: 0,
            name: 'Contact',
            id: 1,
            groupName: "FontAwesome",
            icon: 'phone',
        },
        {
            key: 2,
            name: 'Completed',
            id: 3,
            groupName: "AntDesign",
            icon: 'checkcircle',
        },
    ];

    const filteredMoreData = [
        {
            key: 0,
            name: 'Contact',
            id: 1,
            groupName: "FontAwesome",
            icon: 'phone',
        },
    ];


    let dropdownData = props.selectedFilter == "Completed" ? filteredMoreData : moreData;

    const updateAppointmentStatus = async (status, id, reason) => {
        if (!Global.clicked) {
            Global.clicked = true;
            setShowConfirmationModal(false);
            try {
                const body = {
                    "userId": Global.userID,
                    "appointmentId": id.toString(),
                    "status": status,
                    "refundAmount": "0",
                    "statusReason": reason || " ",
                    "patientName": cancellingDetails.patientName,
                    "providerName": cancellingDetails.providerName,
                    "date": cancellingDetails.date,
                    "time": cancellingDetails.time,
                    "address": cancellingDetails.address,
                    "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : "",
                    "address": cancellingDetails.address,
                    "appointmentType": cancellingDetails.mode,
                    "patientUserId": cancellingDetails.patientUserId,
                    "providerId": cancellingDetails.providerId,
                    "orderNumber": cancellingDetails.orderNumber,
                    "templateName": getTemplateName(initiateRefund),
                    "caregiverId": Global.userType == "Caregiver" ? Global.userID : cancellingDetails.createdBy,
                    "coord": ["24.623061", "10.830960"],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                setLoading(true);
                await apiCall('appointments/updateappointmentstatus', body);
                await props.GetAppointmentList();
                setLoading(false);
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    };

    const ShareData = (item) => {

        let message;
        if (item.mode == "Virtual") {
            message = `Upcoming appointment with :\n${item.name}\nDate : ${item.date}\nTime : ${item.time}\nService Type : ${item.type}\nMode : ${item.mode}`;
        } else if (item.mode == "In Person") {
            message = `Upcoming appointment with :\n${item.name}\nDate : ${item.date}\nTime : ${item.time}\nHospital : ${item.hospitalName}\nLocation : ${item.address}\nService Type : ${item.type}\nMode : ${item.mode}`;
        } else {
            message = `Upcoming appointment with :\n${item.name}\nDate : ${item.date}\nTime : ${item.time}\nLocation : ${item.address}\nMode : ${item.mode}\nService Type : ${item.type}`;
        }
        Share.open({
            title: 'Sharing Doctors Details',
            message: message,
        }).then((res) => {
            console.log(res);
        })
            .catch((err) => {
                err && console.log("share chatch if error", err);
            });
    }

    const filterClick = (item) => {
        if (selectedID == item.id) {
            setShowMoreModal(!showMoreModal);
        }
        else {
            setSelectedID(item.id);
            setShowMoreModal(true);
        }
    }

    const moreClick = async (item, number) => {
        if (item.name == "Completed") {
            setShowMoreModal(false)
            await updateAppointmentStatus("Completed", selectedID);
        } else if (item.name == "Contact") {
            contactDrbyId(number.contactNumber)
        }
    }

    const contactDrbyId = (number) => {
        dialCall(number.contactNumber);

    }

    const dialCall = (number) => {
        Linking.openURL(Global.OS === 'android' ? `tel:${number}` : `telprompt:${number}`);
    };


    const formatTime = (timeStr) => {
        const timeObj = new Date('2023-07-24T' + timeStr);
        const timeFormatter = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: true });
        return timeFormatter.format(timeObj);
    }

    const succescallbackfunction = (resolve, reject) => {
        resolve(true);
    }

    const failurecallbackfunction = (resolve, reject) => {
        resolve(false);
    }

    const fetchTemplate = async (status, responseStatus) => {
        let htmlContent, successRefund, booking, pendingRefund;
        if (status == 'Cancelled') {
            if (responseStatus == "0") {
                pendingRefund = await invoiceTempalate("refundpending");
                htmlContent = pendingRefund;
            } else {
                successRefund = await invoiceTempalate("refundsuccess");
                htmlContent = successRefund;
            }
        } else {
            booking = await invoiceTempalate("doctor_booking_uat");
            htmlContent = booking;
        }
        return htmlContent;
    }

    const requestExternalWritePermission = async () => {
        if (Global.OS === "android") {
            const permisionType = Global.androidVersion > 12 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
            if (await Permission(permisionType, "request", succescallbackfunction, failurecallbackfunction)) {
                return;
            } else {
                return false
            }
        }
        else {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "request", succescallbackfunction, failurecallbackfunction)) {
                return;
            } else {
                return false
            }
        }
    };

    const requestStoragePermission = async (item) => {
        if (Global.OS === 'android') {
            const permissionType = Global.androidVersion > 12 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
            try {
                const granted = await PermissionsAndroid.request(
                    permissionType,
                    {
                        title: 'Image Permission',
                        message: 'HOPE App needs access to your images so you can download images.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    downloadInvoice(item);
                } else {
                    DisplayError("Storage permission denied")
                }
            } catch (err) {
                console.warn(err);
            }
        } else if (Global.OS === 'ios') {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                downloadInvoice(item);
            } else {
                await requestExternalWritePermission();
                if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                    downloadInvoice(item);
                }
            }
        }
    }

    const downloadInvoice = async (item) => {
        try {
            setLoading(true);
            const status = props.selectedFilter == "Cancelled" ? "Cancelled" : "booking";
            const response = await GetInvoiceData(item);
            const refundedStatus = response.paymentData.refundStatus;
            const appointmentStartDateTime = `${response.paymentData.appointmentStartDate} ${response.paymentData.appointmentStartTime}`;
            let totalPerDayDecimal = Number(response.paymentData.perDayFees).toFixed(2);
            let htmlTemplate = await fetchTemplate(status, refundedStatus);
            htmlTemplate = htmlTemplate.split(`<div class="receipt-container"`)[1];
            htmlTemplate = `<div class="receipt-container"` + htmlTemplate;
            htmlTemplate = htmlTemplate.split(`</body>`)[0];
            htmlTemplate = htmlTemplate.replace('INVOICE_PLACEHOLDER', response.paymentData.orderId);
            htmlTemplate = htmlTemplate.replace('USERTYPE_PLACEHOLDER', item.type);
            htmlTemplate = htmlTemplate.replace('RECEIPT_PLACEHOLDER', response.paymentData.receiptNumber);
            htmlTemplate = htmlTemplate.replace('DATE_PAID_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.cancellationDate : moment(response.paymentData.datePaid).format('DD MMMM YYYY, h:mm A'));
            htmlTemplate = htmlTemplate.replace('PAYMENT_METHOD_PLACEHOLDER', response.paymentData.paymentMethod.toUpperCase());
            htmlTemplate = htmlTemplate.replace('EMAIL_PLACEHOLDER', response.paymentData.customerDetails.email);
            htmlTemplate = htmlTemplate.replace('NAME_PLACEHOLDER', response.paymentData.customerDetails.name);
            htmlTemplate = htmlTemplate.replace('PHONE_NUM_PLACEHOLDER', response.paymentData.customerDetails.mobileNumber);
            htmlTemplate = htmlTemplate.replace('AMOUNT_PAID_ON_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.perDayFees);
            htmlTemplate = htmlTemplate.replace('AMOUNT_PAID_ON_DATE_TIME_PLACEHOLDER', status == 'Cancelled' ? '' : response.paymentData.datePaid);
            htmlTemplate = htmlTemplate.replace('DURATION_PLACEHOLDER', response.paymentData.duration);
            htmlTemplate = htmlTemplate.replace('BOOKING_DATE_PLACEHOLDER', moment(appointmentStartDateTime).format('DD MMMM YYYY, h:mm A'));
            htmlTemplate = htmlTemplate.replace('FEES_CHARGED_PER_DAY_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : totalPerDayDecimal);
            htmlTemplate = htmlTemplate.replace('ROW_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.perDayFees);
            htmlTemplate = htmlTemplate.replace('SUBTOTAL_ROW_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.perDayFees);
            htmlTemplate = htmlTemplate.replace('TOTAL_FINAL_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.totalAmount);
            htmlTemplate = htmlTemplate.replace('TOTAL_FINAL_PAID_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.totalAmount);
            htmlTemplate = htmlTemplate.replace('CGST_AMOUNT_PLACEHOLDER', response.paymentData.cgst);
            htmlTemplate = htmlTemplate.replace('SGST_AMOUNT_PLACEHOLDER', response.paymentData.sgst);

            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours().toString().padStart(2, '0');
            const minute = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            const formattedDate = `${year}${month}${day}_${hour}${minute}${seconds}`;

            let options = {
                html: htmlTemplate,
                fileName: response.paymentData.orderId + "_" + formattedDate,
                directory: 'HOPE_Invoices',
                height: 842,
                width: 595
            }

            await RNHTMLtoPDF.convert(options);
            setLoading(false);
            DisplayError("File downloaded successfully in Document/HOPE_Invoices");
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const GetInvoiceData = async (item) => {
        const body = {
            "id": item.id.toString(),
            "type": "Doctor",
            "orderId": item.invoiceNumber.toString(),
            "date": item.date.toString(),
            "invoiceType": props.selectedFilter == "Cancelled" ? "cancellation" : "booking",
            "coord": [
                "24.623061",
                "10.830960"
            ],
            "location": "Mumbai",
            "deviceInfo": "android"
        }
        return apiCall('documents/getinvoicedata', body);
    }

    const cancelNurseAppointment = (data) => {
        setAppointmentType(data.providerType)
        setCancellingDetails(data);
        const timeFormat = 'HH:mm:ss';
        const appointmentDateTime = moment(`${data.date} ${data.time}`, `YYYY-MM-DD ${timeFormat}`);
        const currentDateTime = moment();
        const timeDifference = appointmentDateTime.diff(currentDateTime, 'hours');
        setValid(true);
        if (timeDifference < 24) {
            setInitiateRefund(false);
            DisplayError(`Are you sure you want to cancel the appointment for ${data.providerName} on ${moment(data.date).format("DD-MMM-YYYY")}? \n No Amount will be refunded.`);
        } else {
            setInitiateRefund(true);
            DisplayError(`Are you sure you want to cancel appointment for ${data.providerName} for ${moment(data.date).format("DD-MMM-YYYY")}? \n₹${data.totalAmount} Amount will be refunded in your account within 7 to 10 working days`);
        }
    };

    const getTemplateName = (initiateRefund) => {
        let templateName;
        if (Global.userType == "Patient") {
            if (initiateRefund) {
                templateName = "CancelAppointment_Refund_P_DR_N";
            } else {
                templateName = "CancelAppointment_NoRefund_P_DR_N";
            }
        } else {
            if (cancellingDetails.isRegistered == "Yes") {
                if (initiateRefund) {
                    templateName = "CancelAppointment_Refund_caregiver_DR_N";
                } else {
                    templateName = "CancelAppointment_NoRefund_caregiver_DR_N";
                }
            } else {
                if (initiateRefund) {
                    templateName = "CancelAppointment_Refund_caregiver_NR_DR_N";
                } else {
                    templateName = "CancelAppointment_NoRefund_caregiver_NR_DR_N";
                }
            }
        }
        return templateName;
    }

    const cancelAppointmentFromApi = async (reason) => {
        setShowConfirmationModal(false);
        try {
            const body = {
                "userId": Global.userID,
                "appointmentId": cancellingDetails.id.toString(),
                "status": "Cancelled",
                "statusReason": reason || " ",
                "refundAmount": initiateRefund ? cancellingDetails.totalAmount.toString() : "0",
                "refundId": initiateRefund ? `refund_${new Date().getTime()}` : "",
                "orderId": cancellingDetails.invoiceNumber.toString(),
                "patientName": Global.userType == "Caregiver" ? Global.patientName : Global.userInfo.firstName,
                "providerName": cancellingDetails.providerName,
                "date": cancellingDetails.date,
                "time": cancellingDetails.time,
                "address": cancellingDetails.address,
                "caregiverName": cancellingDetails.careGiverName,
                "address": cancellingDetails.address,
                "appointmentType": cancellingDetails.mode,
                "patientUserId": cancellingDetails.patientUserId,
                "providerId": cancellingDetails.providerId,
                "orderNumber": cancellingDetails.orderNumber,
                "templateName": getTemplateName(initiateRefund),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true)
            await apiCall('appointments/updateappointmentstatus', body);
            if (initiateRefund) {
                DisplayError(`Appointment with ${cancellingDetails.providerName} has been canceled. Refund of ₹${cancellingDetails.totalAmount} will be processed within 7 to 10 business days.`)
            } else {
                DisplayError(`${Global.userType != "Patient" ? cancellingDetails.patientName : ""} Appointment with ${cancellingDetails.providerName} has been canceled.\n No Refund Available.`)
            }
            props.GetAppointmentList();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const handleModalResponse = async (isYes) => {
        setShowModal(false);
        setValid(false);
        if (isYes) {
            setShowConfirmationModal(true)
        }
    };

    const cancelAppointment = async (action, reason) => {
        if (Global.clicked) {
            Global.clicked = true;
            if (action == 'Yes') {
                if (appointmentType == "Doctor" || appointmentType == "Nutritionist") {
                    await cancelAppointmentFromApi(reason);
                }
            }
        }
        setShowConfirmationModal(false);
        Global.clicked = false;
    }

    const handelDoctorNote = (outerItem) => {
        navigation.navigate("DoctorNotes", { appointmentId: outerItem.id });
    }

    const handleNoShowApi = (item) => {
        const reasons = Global.userType === "Caregiver" ? [
            {
                key: 0,
                reason: `${item.patientName} not available`,
            },
            {
                key: 1,
                reason: `${item.providerType} not available`,
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
                    reason: `${item.providerType} not available`,
                },
            ];
        setReason(reasons);
        setSelectedReason(0);
        setReasonText(reasons[0].reason)
        setNoShowAppointmentPatientDetails(item);
        setShowAppointmentModal(true);
    };

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
        setShowAppointmentModal(false);
        if (selectedReason == 0) {
            try {
                const body = {
                    "userId": Global.userID,
                    "appointmentId": noShowAppointmentPatientDetails.id,
                    "status": "No Show",
                    "statusReason": "I am not available",
                    "refundAmount": noShowAppointmentPatientDetails.totalAmount,
                    "refundId": `refund_${new Date().getTime()}`,
                    "orderId": noShowAppointmentPatientDetails.invoiceNumber,
                    "patientName": noShowAppointmentPatientDetails.patientName,
                    "providerName": noShowAppointmentPatientDetails.providerName,
                    "date": noShowAppointmentPatientDetails.date,
                    "time": noShowAppointmentPatientDetails.time,
                    "address": noShowAppointmentPatientDetails.address,
                    "caregiverName": noShowAppointmentPatientDetails.careGiverName,
                    "caregiverId": Global.userType == "Caregiver" ? Global.userID : noShowAppointmentPatientDetails.createdBy,
                    "address": noShowAppointmentPatientDetails.address,
                    "appointmentType": noShowAppointmentPatientDetails.mode,
                    "patientUserId": noShowAppointmentPatientDetails.patientUserId,
                    "providerId": noShowAppointmentPatientDetails.providerId,
                    "orderNumber": noShowAppointmentPatientDetails.orderNumber,
                    "templateName": Global.userType == "Caregiver" ? "NOSHOW_BY_CG_PATIENT_UNAVAILABILITY_DR_N" : "NOSHOW_BY_PATIENT_OWN_UNAVAILABILITY_DR_N",
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                setLoading(true);
                await apiCall("appointments/updateappointmentstatus", body);
                setLoading(false);
                await props.GetAppointmentList();
                DisplayErrorNoShow(`Appointment has been marked as No-Show as Patient was unavailable at the scheduled time.`, `Please contact support@hopetheapp.com if you need assistance.`)
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
        else {
            try {
                const body = {
                    "id": noShowAppointmentPatientDetails.id.toString(),
                    "comment": reasonText,
                    "userId": Global.userID.toString(),
                    "type": noShowAppointmentPatientDetails.providerType,
                    "orderNumber": noShowAppointmentPatientDetails.orderNumber,
                    "date": noShowAppointmentPatientDetails.date,
                    "time": noShowAppointmentPatientDetails.time,
                    "address": noShowAppointmentPatientDetails.address,
                    "appointmentType": noShowAppointmentPatientDetails.providerType == "Nurse" || noShowAppointmentPatientDetails.providerType == "Domestic Caretaker" ? "" : noShowAppointmentPatientDetails.mode,
                    "serviceType": noShowAppointmentPatientDetails.providerType == "Nurse" ? noShowAppointmentPatientDetails.serviceType : noShowAppointmentPatientDetails.providerType == "Domestic Caretaker" ? noShowAppointmentPatientDetails.providerType : "",
                    "patientName": noShowAppointmentPatientDetails.patientName,
                    "patientEmail": noShowAppointmentPatientDetails.patientEmail,
                    "patientMobileNumber": noShowAppointmentPatientDetails.patientMobileNumber,
                    "caregiverName": noShowAppointmentPatientDetails.careGiverName,
                    "caregiverEmail": noShowAppointmentPatientDetails.careGiverEmail,
                    "caregiverMobileNumber": noShowAppointmentPatientDetails.careGiverMobileNumber,
                    "providerName": noShowAppointmentPatientDetails.providerName,
                    "providerEmail": noShowAppointmentPatientDetails.providerEmail,
                    "providerMobileNumber": noShowAppointmentPatientDetails.providerMobileNumber,
                    "templateName": getNoShowTemplateName(noShowAppointmentPatientDetails),
                    "patientUserId": noShowAppointmentPatientDetails.patientUserId,
                    "caregiverId": Global.userType == "Caregiver" ? Global.userID : "",
                    "providerId": noShowAppointmentPatientDetails.providerId,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": "android"
                }
                setLoading(true);
                await apiCall('appointments/createnoshowaction', body);
                setLoading(false);
                await props.GetAppointmentList();
                DisplayErrorNoShow(`Appointment has been marked as No-Show as Service Provider was unavailable at the scheduled time. Our support team will investigate further and determine if a refund has to be issued.`, `Please contact support@hopetheapp.com if you need assistance.`)
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
    }

    const handleSelectedReason = (item) => {
        setSelectedReason(item.key);
        setReasonText(item.reason);
    };

    const handleCancelCrossbutton = () => {
        setShowAppointmentModal(false);
    };

    const GetNoShowAppointmentData = async (id) => {
        try {
            const body = {
                "type": "HOPE",
                "appointmentId": id,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall("appointments/getnoshowappointmentdata", body);
            setNoShowedBy(response.noShowData[0]);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const noShowAppointmentInfo = async (item) => {
        setCancellingDetails(item);
        // setSelectedCancel(item);
        if (!Global.clicked) {
            Global.clicked = true;
            await GetNoShowAppointmentData(item.id);
            Global.clicked = false;
            setmodalNoShow(true);
        }
    };

    return (
        <View>
            <FlatList
                style={[{ position: "relative" }, props.extraStyles]}
                keyExtractor={(outerItem, outerIndex) => "outerKey" + outerIndex}
                data={props.appointmentsData}
                renderItem={({ item: outerItem, index: outerIndex }) => {
                    return (
                        <Pressable style={{ position: 'relative' }} key={outerIndex} onPress={() => setShowMoreModal(false)}>
                            <View style={[styles.filterbutton, GlobalStyles.inputBoxShadow, {
                                marginBottom: outerIndex + 1 == props.appointmentsData.length ? heightToDp(26) : heightToDp(2), backgroundColor: Colors.primaryButtonColor,
                            }]}>
                                <ImageBackground resizeMode="cover" source={require('../assets/vectors/blue_slice.png')} style={styles.sliceImage}>
                                    <View style={[styles.appointmentContainer, { paddingBottom: props.selectedFilter == 'Cancelled' ? 0 : heightToDp(2), alignSelf: 'center' }]}>
                                        <View style={[styles.doctorContainer]}>
                                            <Text style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_700Bold]}>
                                                {outerItem.providerName} {outerItem.providerType == "Nutritionist" ? "(Nutritionist)" : "(Doctor)"}
                                            </Text>
                                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>{outerItem.specialization}</Text>
                                        </View>
                                        {
                                            today == outerItem.date && props.selectedFilter != "No Show" ?
                                                <View>
                                                    <Pressable onPress={() => filterClick(outerItem)} hitSlop={15} style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}>
                                                        {props.selectedFilter !== 'Cancelled' &&
                                                            <VectorIcons groupName='Entypo' iconName='dots-three-horizontal' iconstyle={[{ color: Colors.boxBackground }]} />
                                                        }
                                                    </Pressable>
                                                </View>
                                                :
                                                <View>
                                                    {
                                                        props.selectedFilter == "No Show" ?
                                                            <Pressable
                                                                onPress={async () => { await noShowAppointmentInfo(outerItem) }}>
                                                                <VectorIcons iconsize={30} groupName='Feather' iconName='info' iconstyle={[{ color: Colors.boxBackground }]} />
                                                            </Pressable>
                                                            :
                                                            <Pressable onPress={() => contactDrbyId(selectedID)}>
                                                                <View style={{ flexDirection: 'row' }}>
                                                                    <VectorIcons groupName='FontAwesome' iconName='phone' iconstyle={[{ color: Colors.boxBackground }]} />
                                                                    <FieldLabel text={"Contact"} extraStyles={{ marginHorizontal: scale(5), fontSize: responsiveFont(18), color: Colors.boxBackground }} Nospace={true} />
                                                                </View>
                                                            </Pressable>
                                                    }

                                                </View>
                                        }
                                    </View>
                                    {showMoreModal && selectedID == outerItem.id && (
                                        <View style={{ zIndex: 999, position: 'absolute', top: 60, right: 20, }}>
                                            <Pressable onPress={() => setShowMoreModal(false)}>
                                                <FlatList
                                                    data={dropdownData}
                                                    keyExtractor={(innerItem, innerIndex) => "innerKey" + innerIndex}
                                                    style={[styles.moreContainer, GlobalStyles.inputBoxShadow]}
                                                    renderItem={({ item: innerItem, index: innerIndex }) => {
                                                        if (props.selectedFilter != "Cancelled") {
                                                            return (
                                                                <Pressable
                                                                    style={({ pressed }) => ([
                                                                        styles.Button, {
                                                                            opacity: pressed ? 0.4 : 1,
                                                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                                                            borderTopLeftRadius: innerIndex == 0 ? 14 : 0,
                                                                            borderTopRightRadius: innerIndex == 0 ? 14 : 0,
                                                                            borderBottomLeftRadius: props.selectedFilter == "Completed" ? innerIndex == filteredMoreData.length - 1 ? 14 : 0 : innerIndex == moreData.length - 1 ? 14 : 0,
                                                                            borderBottomRightRadius: props.selectedFilter == "Completed" ? innerIndex == filteredMoreData.length - 1 ? 14 : 0 : innerIndex == moreData.length - 1 ? 14 : 0,
                                                                        }
                                                                    ])}
                                                                    onPress={async () => await moreClick(innerItem, outerItem)}
                                                                >
                                                                    <VectorIcons
                                                                        groupName={innerItem.groupName}
                                                                        iconName={innerItem.icon}
                                                                        iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]}
                                                                        iconsize={innerItem.name == "Completed" ? widthToDp(5) : null}
                                                                    />
                                                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, , { color: Colors.primaryButtonColor }]}>{innerItem.name}</Text>
                                                                </Pressable>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </Pressable>
                                        </View>
                                    )}
                                    <View style={styles.dateTimeContainer}>
                                        <View style={GlobalStyles.rowSpaceBetween}>
                                            <VectorIcons groupName='FontAwesome' iconName='calendar' iconstyle={[{ color: Colors.boxBackground, marginRight: widthToDp(4), marginBottom: 2 }]} />
                                            <Text style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(scale(16)) }]}>{moment(outerItem.date).format('D MMM YYYY')}</Text>
                                        </View>
                                        <View style={[GlobalStyles.rowSpaceAround, { marginLeft: widthToDp(3) }]}>
                                            <VectorIcons groupName='AntDesign' iconName='clockcircle' iconstyle={[{ color: Colors.boxBackground }]} />
                                            <Text style={[GlobalStyles.backgroundnormalText, { marginLeft: widthToDp(2), fontSize: responsiveFont(scale(16)) }, Fonts.Nunito_600SemiBold]}>{formatTime(outerItem.time)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailsContainer}>
                                        <View style={[GlobalStyles.rowSpaceBetween,]}>
                                            <View style={GlobalStyles.rowFlexstart}>
                                                <VectorIcons groupName='Ionicons' iconName='location-sharp' iconstyle={[{ color: Colors.boxBackground }]} iconsize={widthToDp(7)} />
                                                {
                                                    outerItem.type == "Lab" ?
                                                        <Text style={[GlobalStyles.backgroundnormalText, { marginLeft: widthToDp(4) }, Fonts.Nunito_600SemiBold]}>{"In Person Visit"}</Text>
                                                        :
                                                        <Text style={[GlobalStyles.backgroundnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>{outerItem.mode}</Text>
                                                }
                                            </View>
                                            {props.selectedFilter != "Cancelled" ?
                                                <View style={[GlobalStyles.rowFlexstart, { marginTop: heightToDp(1) }]}>
                                                    <VectorIcons groupName='AntDesign' iconName='checkcircle' iconstyle={[{ color: Colors.boxBackground }]} />
                                                    <Text style={[GlobalStyles.backgroundnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>{props.selectedFilter}</Text>
                                                </View> :
                                                <Pressable
                                                    onPress={() => requestStoragePermission(outerItem)}
                                                    style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                                    <VectorIcons groupName='Feather' iconName='download' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                                    <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Invoice</Text>
                                                </Pressable>
                                            }
                                        </View>
                                    </View>

                                    <View style={[props.selectedFilter != "Cancelled" && GlobalStyles.rowSpaceAround, { marginBottom: verticalScale(15), width: "100%", paddingHorizontal: scale(15) }]}>
                                        <View>
                                            {
                                                !props.isCompleted &&
                                                <Pressable onPress={() => ShareData(outerItem)} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                                    <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                                    <Text style={[GlobalStyles.buttonsmallText, Fonts.Nunito_600SemiBold]}>Share</Text>
                                                </Pressable>
                                            }
                                        </View>
                                        <View>
                                            {props.selectedFilter != "Cancelled" &&
                                                <Pressable
                                                    onPress={() => requestStoragePermission(outerItem)}
                                                    style={({ pressed }) => ([props.selectedFilter != "Cancelled" ? styles.shareButton : styles.invoiceButton, { opacity: pressed ? 0.4 : 1, marginHorizontal: scale(18) }])}>
                                                    <VectorIcons groupName='Feather' iconName='download' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                                    <Text style={[GlobalStyles.buttonsmallText, Fonts.Nunito_600SemiBold]}>Invoice</Text>
                                                </Pressable>
                                            }
                                        </View>
                                        <View>
                                            {(() => {
                                                const currentDate = moment().format("DD-MMM-YYYY");
                                                const appointmentDateTime = moment(`${currentDate} ${outerItem.time}`, "DD-MMM-YYYY HH:mm");
                                                const now = moment();
                                                const minutesDifference = now.diff(appointmentDateTime, "minutes");
                                                const formattedDate = now.format('YYYY-MM-DD');
                                                if (minutesDifference >= 10 && minutesDifference <= 180 && props.selectedFilter == "Confirmed" && (formattedDate === outerItem.date)) {
                                                    return (
                                                        <Pressable
                                                            onPress={() => {
                                                                handleNoShowApi(outerItem);
                                                            }}
                                                            style={({ pressed }) => [
                                                                styles.shareButton,
                                                                { opacity: pressed ? 0.4 : 1 },
                                                            ]}
                                                        >
                                                            <VectorIcons
                                                                groupName="Ionicons"
                                                                iconName="close"
                                                                iconstyle={{ color: Colors.primaryButtonColor }}

                                                            />
                                                            <Text style={[GlobalStyles.buttonsmallText, Fonts.Nunito_600SemiBold]}>
                                                                No Show
                                                            </Text>
                                                        </Pressable>
                                                    );
                                                }

                                                if (props.selectedFilter !== "Cancelled" && props.selectedFilter !== "Completed" && props.selectedFilter !== "No Show") {
                                                    return (
                                                        <Pressable
                                                            onPress={() => cancelNurseAppointment(outerItem)}
                                                            style={({ pressed }) => [
                                                                styles.shareButton,
                                                                { opacity: pressed ? 0.4 : 1 },
                                                            ]}
                                                        >
                                                            <VectorIcons
                                                                groupName="Ionicons"
                                                                iconName="close"
                                                                iconstyle={{ color: Colors.primaryButtonColor }}
                                                            />
                                                            <Text style={[GlobalStyles.buttonsmallText, Fonts.Nunito_600SemiBold]}>
                                                                Cancel
                                                            </Text>
                                                        </Pressable>
                                                    );
                                                }

                                                return null;
                                            })()}

                                        </View>
                                        <View>
                                            {
                                                (props.selectedFilter == "Cancelled" && outerItem.cancelReason.length != 0) &&
                                                <View style={[{ flexDirection: "row" }]}>
                                                    <Text style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_700Bold, { width: "25%" }]}>Reason :</Text>
                                                    <Text style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_600SemiBold, { width: "75%" }]}>{outerItem.cancelReason}</Text>
                                                </View>
                                            }
                                        </View>
                                        <View>
                                            {
                                                props.selectedFilter == "Completed" &&
                                                <Pressable onPress={() => { handelDoctorNote(outerItem); }}
                                                    style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}
                                                >
                                                    <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>View Doctor Notes</Text>
                                                </Pressable>
                                            }
                                        </View>
                                    </View>
                                </ImageBackground>
                            </View>
                        </Pressable>
                    );
                }}
            />

            {
                <Confirmation
                    modalHeading={"Confirmation"}
                    modalText={`Are you sure you want to cancel the Appointment with ${cancellingDetails.providerType === "Doctor" ? "Dr." : "Nutritionist"} ${cancellingDetails.providerName} on ${moment(cancellingDetails.date).format('D MMM YYYY')} at ${moment(cancellingDetails.time, 'HH:mm').format('hh:mm A')}?`}
                    transparent={true}
                    visible={showConfirmationModal}
                    setShowConfirmationModal={setShowConfirmationModal}
                    action={async (text, reason) => { await cancelAppointment(text, reason) }}
                />
            }
            {<WarningModal showModal={showModal} onPress={handleModalResponse} setShowModal={setShowModal} warningText={warningText} extrabuttons={valid} />}
            <NoShowWarningModal noshowModal={noshowModal} onPress={handleModalResponse} setNoshowModal={setNoshowModal} warningText={warningText} extrabuttons={valid} textChanger={textChanger} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <Modal transparent={true} visible={showAppointmentModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <FieldLabel text={'Please Select Reason'} Nospace={true} extraStyles={[GlobalStyles.largeText, { marginBottom: verticalScale(10) }]} mandatory={true} />
                            <View>
                                <Pressable style={styles.modalCloseButton} onPress={() => handleCancelCrossbutton()}>
                                    <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                </Pressable>
                            </View>
                        </View>
                        <View>
                            <FlatList
                                keyExtractor={(item, index) => "key" + index}
                                extraData={reasons}
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
                                                    backgroundColor: item.key == selectedReason ? Colors.primaryButtonColor : Colors.boxBackground,
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
                                onPress={onSubmit}
                            >
                            </CommonButton>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalNoShow} animationType={'fade'} transparent={true}>
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center" }}>
                    <View style={[styles.optionView]}>
                        {
                            noShowedBy?.initiatedUserType === "Patient" || noShowedBy?.initiatedUserType === "Caregiver" ? (
                                <View>
                                    {noShowedBy.cancelReason != "I am not available" ? (
                                        <View style={styles.modalLastContent}>
                                            <View>
                                                <View>
                                                    {
                                                        noShowedBy.refundStatus == '' ?
                                                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                Appointment has been marked as No-Show as Service Provider was unavailable at the scheduled time. Our support team will investigate further and determine if a refund has to be issued. Please contact support@hopetheapp.com if you need assistance
                                                            </Text>
                                                            :
                                                            noShowedBy.refundStatus == 'In Processs' ?
                                                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                    You are eligible to receive a refund. Your refund will be issued within 7-10 working days.
                                                                    Please contact support@hopetheapp.com if you need assistance.
                                                                </Text>
                                                                :
                                                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                    Refund has been completed.
                                                                </Text>
                                                    }

                                                    {noShowedBy.refundAmount != 0 && (
                                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                            Refund Amount: {noShowedBy.refundAmount}
                                                        </Text>
                                                    )}

                                                    {noShowedBy.adminComment?.length !== 0 && (
                                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                            Admin Comment: {noShowedBy.adminComment}
                                                        </Text>
                                                    )}
                                                </View>

                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.modalLastContent}>
                                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                Appointment has been marked as No-Show as Patient was unavailable at the scheduled time.
                                                Please contact support@hopetheapp.com if you need assistance.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )
                                :

                                (
                                    <View>
                                        <View>
                                            {
                                                noShowedBy.userComment === "Nurse not available" ? (
                                                    <View style={[styles.modalLastContent]}>
                                                        <View style={[styles.modalLastContent]}>
                                                            {
                                                                noShowedBy.refundStatus == 'In Processs' ?
                                                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                        The patient has marked this appointment as No-Show by indicating your unavailability.
                                                                        Our support team will investigate further and determine if a refund has to be issued.
                                                                        Please contact support@hopetheapp.com if you need assistance.
                                                                    </Text>
                                                                    :
                                                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                        Refund has been initiated to patient.
                                                                    </Text>
                                                            }
                                                            {noShowedBy.refundAmount != 0 && (
                                                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                    Refund Amount: {noShowedBy.refundAmount}
                                                                </Text>
                                                            )}
                                                            {noShowedBy.adminComment?.length !== 0 && (
                                                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                    Admin Comment: {noShowedBy.adminComment}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View style={[styles.modalLastContent]}>
                                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                            Appointment has been marked as No-Show as Service Provider was unavailable at the scheduled time.
                                                            Refund will be issued in 7-10 working days.
                                                            Please contact support@hopetheapp.com if you need assistance.
                                                        </Text>
                                                        {noShowedBy.refundAmount != 0 && (
                                                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>
                                                                Refund Amount: {noShowedBy.refundAmount}
                                                            </Text>
                                                        )}
                                                    </View>
                                                )
                                            }
                                        </View>
                                    </View>
                                )
                        }
                        <View style={styles.cancelButton}>
                            <CommonButton
                                extraStyles={{ width: "100%" }}
                                buttonText={"Ok"}
                                onPress={() => {
                                    setmodalNoShow(false);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create(
    {
        filterbutton: {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '98%',
            alignSelf: 'center',
            backgroundColor: Colors.boxBackground,
            borderRadius: 14,
            marginBottom: heightToDp(5),
            marginTop: heightToDp(2),
            overflow: 'hidden'
        },
        appointmentContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '90%',
            paddingTop: heightToDp(2),
        },
        doctorContainer: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '70%',
        },
        moreContainer: {
            flexDirection: 'column',
            backgroundColor: Colors.boxBackground,
            borderRadius: 14,
        },
        Button: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: widthToDp(4),
            paddingVertical: heightToDp(1),
            width: widthToDp(40),
        },
        dateTimeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: scale(15),
        },
        detailsContainer: {
            width: '100%',
            paddingVertical: heightToDp(1),
            paddingHorizontal: scale(10),
        },
        shareButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.defaultBackground,
            borderRadius: 14,
            paddingHorizontal: widthToDp(2),
            paddingVertical: heightToDp(1),
        },
        invoiceButton: {
            width: "35%",
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.defaultBackground,
            borderRadius: 14,
            paddingHorizontal: widthToDp(2),
            paddingVertical: heightToDp(1),
        },
        CancelButton: {
            backgroundColor: Colors.primaryButtonColor,
            borderRadius: 14,
            paddingVertical: heightToDp(2),
            justifyContent: 'center',
            alignItems: 'center',
            width: '90%'
        },
        cancelButton: {
            width: "40%",
            marginBottom: widthToDp(4),
            marginTop: "2%"
        },
        modalContainer: {
            flex: 1,
            backgroundColor: Colors.modalBackground,
            alignItems: "center",
            justifyContent: "center"
        },
        modalContent: {
            width: widthToDp(80),
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
        modalBottomBtnBox: {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around"
        },
        modalCloseButton: {
            backgroundColor: Colors.defaultBackground,
            borderRadius: 50,
            padding: widthToDp(1.5),
            justifyContent: "center",
            alignItems: "center"
        },
        modalBtn: {
            width: "50%",
            height: heightToDp(6),
            paddingHorizontal: widthToDp(4),
            backgroundColor: Colors.primaryButtonColor,
            borderRadius: 14
        },
        ReasonContainer: {
            width: 20,
            height: 20,
            borderRadius: 50,
            borderWidth: 1.5,
            borderColor: Colors.primaryButtonColor,
            justifyContent: 'center',
            alignItems: 'center'
        }, reasonButton: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: heightToDp(0.5)
        },
        modalLastContent: {
            flexDirection: 'column',
            marginTop: heightToDp(2),
            width: '100%',
            paddingHorizontal: widthToDp(4)
        },
        buttonMain: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: heightToDp(2),
            marginHorizontal: widthToDp(4)
        },
        ReasonContainer: {
            width: 20,
            height: 20,
            borderRadius: 50,
            borderWidth: 1.5,
            borderColor: Colors.primaryButtonColor,
            justifyContent: 'center',
            alignItems: 'center'
        }, reasonButton: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: heightToDp(0.5)
        },
        modalContainer: {
            flex: 1,
            backgroundColor: Colors.modalBackground,
            alignItems: "center",
            justifyContent: "center"
        },
        optionView: {
            minHeight: heightToDp(24),
            width: "80%",
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
        sliceImage: {
            width: '100%',
        },
    }
)

export default AppointmentCard;