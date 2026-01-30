import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, FlatList, Modal, Linking, PermissionsAndroid, ImageBackground } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { scale, verticalScale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import moment from 'moment';
import Global from './Global';
import MedicinesDateSelect from '../components/MedicinesDateSelect';
import ReadMore from 'react-native-read-more-text';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Permission, invoiceTempalate } from '../utils/CommonFunctions';
import { PERMISSIONS } from 'react-native-permissions';
import FieldLabel from '../components/FieldLabel';
import Confirmation from '../components/Confirmation';
import { Dropdown } from 'react-native-element-dropdown';

const NurseAppointmentScreen = (props) => {
    const fromCareCircle = props.route.params.fromCareCircle;
    const patientInfo = props?.route.params?.personData;
    const navigation = useNavigation();
    const [nurseInfoModal, setNurseInfoModal] = useState(false);
    const [valid, setValid] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [appointmentList, setAppointmentList] = useState([]);
    const [canceledBy, setCanceledBy] = useState({});
    const [cancellingDetails, setCancellingDetails] = useState([]);
    const [selectedCancel, setSelectedCancel] = useState([]);
    const [initiateRefund, setInitiateRefund] = useState(false);
    const [startDateOfPlan, setStartDateOfPlan] = useState('');
    const [endDateOfPlan, setEndDateOfPlan] = useState('');
    const [noShowAppointmentPatientDetails, setNoShowAppointmentPatientDetails] = useState('');
    const [selectedReason, setSelectedReason] = useState(Global.userType === "Caregiver" ? 0 : 1);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedFilterData, setSelectedFilterData] = useState([]);
    const [reasons, setReason] = useState();
    const [noShowedBy, setNoShowedBy] = useState([]);
    const [noShowModal, setNoShowModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState({
        showValue: "All",
        value: "All"
    });
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [reasonText, setReasonText] = useState('');
    const [patientUserName, setPatientUserName] = useState([]);
    const [dropdownValue, setDropDownValue] = useState('All');


    const appointmentFilterData = [
        {
            key: 0,
            name: "All",
            value: "All",
            id: 5,
        },
        {
            key: 1,
            name: 'Confirmed',
            value: 'Upcoming',
            id: 1,
        },
        {
            key: 2,
            name: 'Completed',
            value: 'Completed',
            id: 2,
        },
        {
            key: 3,
            name: 'Cancelled',
            value: 'Cancelled',
            id: 3,
        },
        {
            key: 4,
            name: "In Progress",
            value: "In Progress",
            id: 4,
        },
        {
            key: 5,
            name: "No Show",
            value: "No Show",
            id: 5,
        },
    ];

    const renderItem = ({ item, index }, serviceList) => (
        <View style={[styles.flatListStyle]}>
            <Text style={[
                GlobalStyles.normalText,
                Fonts.Nunito_600SemiBold,
                { color: Colors.defaultBackground, marginRight: scale(4) }
            ]}>
                {item.name.trim()}{index !== serviceList?.length - 1 ? ',' : ''}
            </Text>
        </View>
    );

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const validateDate = async () => {
        if (startDateOfPlan == '') {
            DisplayError("Please Select Start Date")
        } else if (endDateOfPlan == '') {
            DisplayError("Please Select End Date")
        } else {
            setSelectedFilter({
                showValue: "All",
                value: "All"
            })
            setDropDownValue("All")
            getMyAppointmentList();
        }
    }

    const getMyAppointmentList = async () => {
        try {
            const body = {
                "providerId": "0",
                "patientId": Global.userType == "Patient" ? Global.patientID : '0',
                "startDate": moment(startDateOfPlan).format('DD-MMM-YYYY'),
                "endDate": moment(endDateOfPlan).format('DD-MMM-YYYY'),
                "caregiverId": Global.userType == "Caregiver" ? Global.userID : '0',
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall("registration/getmyappointmentlist", body);
            const uniquePatients = response.serviceData.filter((item, index, self) =>
                index === self.findIndex((t) => t.patientName === item.patientName)
            );
            setPatientUserName(
                uniquePatients.map(item => ({
                    label: item.patientName,
                    value: item.patientName
                }))
            );
            setAppointmentList(response.serviceData);
            setSelectedFilterData(response.serviceData);
            setSelectedFilter({
                showValue: "All",
                value: "All"
            })
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const cancelAppointmentFromApi = async (reason) => {
        setShowConfirmationModal(false);
        try {
            const body = {
                "userId": Global.userID,
                "appointmentId": cancellingDetails.planId.toString(),
                "status": "Cancelled",
                "statusReason": reason || " ",
                "refundAmount": initiateRefund ? cancellingDetails.perDayFees.toString() : "0",
                "refundId": initiateRefund ? `refund_${new Date().getTime()}` : "",
                "orderId": cancellingDetails.transactionId.toString(),
                "patientName": cancellingDetails.patientName,
                "providerName": cancellingDetails.providerName,
                "date": cancellingDetails.startDate,
                "time": cancellingDetails.startTime,
                "address": cancellingDetails.address,
                "appointmentType": cancellingDetails.mode,
                "caregiverName": cancellingDetails.careGiverName,
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
            setLoading(false);
            await getMyAppointmentList();
            if (initiateRefund) {
                DisplayError(`Appointment with ${cancellingDetails.providerName} has been canceled. Refund of ₹${cancellingDetails.perDayFees} will be processed within 7 to 10 business days.`)
            } else {
                DisplayError(`Appointment with ${cancellingDetails.providerName} has been canceled.\n No Refund Available.`)
            }
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const cancelAppointmentReason = async (action, reason) => {
        if (Global.clicked) {
            Global.clicked = true;
            if (action == 'Yes') {
                if (cancellingDetails.providerType == "Doctor" || cancellingDetails.providerType == "Nutritionist") {
                    await cancelAppointmentFromApi(reason);
                } else {
                    cancelPatientService(reason)
                }
            }
        }
        setShowConfirmationModal(false);
        Global.clicked = false;
    }

    const cancelAppointment = (data) => {
        setCancellingDetails(data);
        setSelectedCancel(data);
        const timeFormat = 'HH:mm:ss';
        const appointmentDateTime = moment(`${data.startDate} ${data.startTime}`, `YYYY-MM-DD ${timeFormat}`);
        const currentDateTime = moment();
        const timeDifference = appointmentDateTime.diff(currentDateTime, 'hours');
        setValid(true);
        if (timeDifference < 24) {
            setInitiateRefund(false);
            DisplayError(`Are you sure you want to cancel the appointment for ${data.providerName} on ${moment(data.startDate).format("DD-MMM-YYYY")}? \n No Amount will be refunded.`);
        } else {
            setInitiateRefund(true);
            DisplayError(`Are you sure you want to cancel appointment for ${data.providerName} for ${moment(data.startDate).format("DD-MMM-YYYY")}? \n₹${data.perDayFees} Amount will be refunded in your account within 7 to 10 working days`);
        }
    };
    const GetNoShowAppointmentData = async (item) => {
        try {
            const body = {
                "planId": (item.providerType.toUpperCase() == "NURSE" || item.providerType.toUpperCase() == "Domestic Caretaker") ? item.planId : "0",
                "type": "HOPE",
                "appointmentId": (item.providerType.toUpperCase() == "DOCTOR" || item.providerType.toUpperCase() == "NUTRITIONIST") ? item.planId : "0",
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

    const appointmentInfo = async (start) => {
        if (!Global.clicked) {
            Global.clicked = true;
            setCancellingDetails(start);
            setSelectedCancel(start);
            await getPatientServiceCancelData(start.planId);
            setNurseInfoModal(true);
            Global.clicked = false;
        }
    };
    const noShowAppointmentInfo = async (item) => {
        setCancellingDetails(item);
        setSelectedCancel(item);
        if (!Global.clicked) {
            Global.clicked = true;
            await GetNoShowAppointmentData(item);
            Global.clicked = false;
            setNoShowModal(true);
        }
    };

    const cancelPatientService = async (reason) => {
        try {
            const body = {
                "id": cancellingDetails.planId,
                "id2": cancellingDetails.planId2 ?? "",
                "userId": Global.userID,
                "refundId": initiateRefund ? `refund_${new Date().getTime()}` : "",
                "refundAmount": initiateRefund ? "10" : "0",//cancellingDetails.perDayFees
                "statusReason": reason,
                "status": '0',
                "address": cancellingDetails.address,
                "serviceType": cancellingDetails.services.map(service => service.name).join(", "),
                "startTime": cancellingDetails.startTime,
                "startDate": cancellingDetails.startDate,
                "providerId": cancellingDetails.providerId,
                "patientUserId": cancellingDetails.patientUserId,
                "caregiverId": Global.userType == "Caregiver" ? Global.userID : cancellingDetails.createdBy,
                "patientName": cancellingDetails.patientName,
                "caregiverName": cancellingDetails.careGiverName,
                "providerName": cancellingDetails.providerName,
                "orderNumber": cancellingDetails.orderNumber,
                "templateName": getTemplateName(initiateRefund),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall("carebuddy/cancelpatientservice", body);
            setLoading(false);
            if (initiateRefund) {
                DisplayError(`Appointment with ${cancellingDetails.providerName} has been canceled. Refund of ₹${selectedCancel.perDayFees} will be processed within 7 to 10 business days.`)
            } else {
                DisplayError(`${Global.userType != "Patient" ? cancellingDetails.patientName : ""} Appointment with ${cancellingDetails.providerName} has been canceled.\n No Refund Available.`)
            }
            getMyAppointmentList()
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const getPatientServiceCancelData = async (id) => {
        try {
            const body = {
                "id": id,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall("carebuddy/getpatientservicecanceldata", body);
            setCanceledBy(response);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const fetchTemplate = async (status, responseStatus, item) => {
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
            booking = await invoiceTempalate(item.type == "Nurse" || item.type == "Domestic Caretaker" ? "booking_uat" : "doctor_booking_uat");
            htmlContent = booking;
        }
        return htmlContent;
    }

    const getTemplateName = (initiateRefund) => {
        let templateName;
        if (Global.userType == "Patient") {
            if (cancellingDetails.providerType == "Nurse" || cancellingDetails.providerType == "Domestic Caretaker") {
                if (initiateRefund) {
                    templateName = "CancelAppointment_Refund_P_N_DC";
                } else {
                    templateName = "CancelAppointment_NoRefund_P_N_DC";
                }
            } else {
                if (initiateRefund) {
                    templateName = "CancelAppointment_Refund_P_DR_N";
                } else {
                    templateName = "CancelAppointment_NoRefund_P_DR_N";
                }
            }
        } else {
            if (cancellingDetails.providerType == "Nurse" || cancellingDetails.providerType == "Domestic Caretaker") {
                if (cancellingDetails.isRegistered == "Yes") {
                    if (initiateRefund) {
                        templateName = "CancelAppointment_Refund_caregiver_N_DC";
                    } else {
                        templateName = "CancelAppointment_NoRefund_caregiver_N_DC";
                    }
                } else {
                    if (initiateRefund) {
                        templateName = "CancelAppointment_Refund_caregiver_NR_N_DC";
                    } else {
                        templateName = "CancelAppointment_NoRefund_caregiver_NR_N_DC";
                    }
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
        }
        return templateName;
    }

    const getInvoiceDetails = async (orderNo, status, invoiceDownloadDate) => {
        const body = {
            "orderId": orderNo,
            "invoiceType": status == 'Cancelled' ? "cancellation" : "booking",
            "date": invoiceDownloadDate,
            "type": "Nurse",
            "coord": [
                "24.623061",
                "10.830960"
            ],
            "location": "Mumbai",
            "deviceInfo": Global.OS
        }
        return apiCall('documents/getinvoicedata', body);
    }

    const requestStoragePermission = async (orderNo, status, invoiceDate) => {
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
                    await downloadInvoice(orderNo, status, invoiceDate);
                } else {
                    DisplayError("Storage permission denied")
                }
            } catch (err) {
                console.warn(err);
            }
        } else if (Global.OS === 'ios') {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction, "Photos")) {
                await downloadInvoice(orderNo, status, invoiceDate);
            } else {
                await requestExternalWritePermission();
                if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction, "Photos")) {
                    await downloadInvoice(orderNo, status, invoiceDate);
                }
            }
        }
    }

    const succescallbackfunction = (resolve, reject) => {
        resolve(true);
    }

    const failurecallbackfunction = (resolve, reject, message) => {
        if (message) {
            DisplayError(message);
        }
        resolve(false);
    }

    const requestExternalWritePermission = async () => {
        if (Global.OS === "android") {
            const permisionType = Global.androidVersion > 12 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
            if (await Permission(permisionType, "request", succescallbackfunction, failurecallbackfunction, "Photos")) {
                return;
            } else {
                return false
            }
        }
        else {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "request", succescallbackfunction, failurecallbackfunction, "Photos")) {
                return;
            } else {
                return false
            }
        }
    };

    const downloadInvoice = async (orderNo, status, invoiceDate) => {
        try {
            setLoading(true);
            const combinedStartDateTime = `${invoiceDate.startDate} ${invoiceDate.startTime}`;
            const combinedEndDateTime = `${invoiceDate.endDate} ${invoiceDate.endTime}`;
            const invoiceDownloadDate = invoiceDate.startDate;
            const response = await getInvoiceDetails(orderNo, status, invoiceDownloadDate);
            const refundedStatus = response.paymentData.refundStatus;
            let totalAmountDecimal = Number(response.paymentData.baseAmount).toFixed(2);
            let totalPerDayDecimal = Number(response.paymentData.perDayFees).toFixed(2);
            let htmlTemplate = await fetchTemplate(status, refundedStatus, invoiceDate);
            htmlTemplate = htmlTemplate.split(`<div class="receipt-container"`)[1];
            htmlTemplate = `<div class="receipt-container"` + htmlTemplate;
            htmlTemplate = htmlTemplate.split(`</body>`)[0];
            htmlTemplate = htmlTemplate.replace('INVOICE_PLACEHOLDER', response.paymentData.orderId);
            htmlTemplate = htmlTemplate.replace('RECEIPT_PLACEHOLDER', response.paymentData.receiptNumber);
            htmlTemplate = htmlTemplate.replace('DATE_PAID_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.cancellationDate : moment(response.paymentData.datePaid).format('DD MMMM YYYY, h:mm A'));
            htmlTemplate = htmlTemplate.replace('PAYMENT_METHOD_PLACEHOLDER', response.paymentData.paymentMethod.toUpperCase());
            htmlTemplate = htmlTemplate.replace('EMAIL_PLACEHOLDER', response.paymentData.customerDetails.email);
            htmlTemplate = htmlTemplate.replace('NAME_PLACEHOLDER', response.paymentData.customerDetails.name);
            htmlTemplate = htmlTemplate.replace('PHONE_NUM_PLACEHOLDER', response.paymentData.customerDetails.mobileNumber);
            htmlTemplate = htmlTemplate.replace('AMOUNT_PAID_ON_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.totalAmount);
            htmlTemplate = htmlTemplate.replace('AMOUNT_PAID_ON_DATE_TIME_PLACEHOLDER', status == 'Cancelled' ? '' : response.paymentData.datePaid);
            htmlTemplate = htmlTemplate.replace('DURATION_PLACEHOLDER', response.paymentData.duration);
            htmlTemplate = htmlTemplate.replace('BOOKING_DATE_PLACEHOLDER', moment(combinedStartDateTime).format('DD MMMM YYYY, h:mm A') + "<br/>To<br/>" + moment(combinedEndDateTime).format('DD MMMM YYYY, h:mm A'));
            htmlTemplate = htmlTemplate.replace('FEES_CHARGED_PER_DAY_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : totalPerDayDecimal);
            htmlTemplate = htmlTemplate.replace('ROW_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : totalAmountDecimal);
            htmlTemplate = htmlTemplate.replace('SUBTOTAL_ROW_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : totalAmountDecimal);
            htmlTemplate = htmlTemplate.replace('TOTAL_FINAL_PAID_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.totalAmount);
            htmlTemplate = htmlTemplate.replace('TOTAL_FINAL_AMOUNT_PLACEHOLDER', status == 'Cancelled' ? response.paymentData.refundAmount : response.paymentData.totalAmount);
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
            "id": item.planId.toString(),
            "type": item.type,
            "orderId": item.transactionId.toString(),
            "date": item.startDate.toString(),
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

    const downloadInvoiceDoctor = async (item) => {
        try {
            setLoading(true);
            const status = props.selectedFilter == "Cancelled" ? "Cancelled" : "booking";
            const response = await GetInvoiceData(item);
            const refundedStatus = response.paymentData.refundStatus;
            const appointmentStartDateTime = `${response.paymentData.appointmentStartDate} ${response.paymentData.appointmentStartTime}`;
            let totalPerDayDecimal = Number(response.paymentData.perDayFees).toFixed(2);
            let htmlTemplate = await fetchTemplate(status, refundedStatus, item);
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
                directory: Global.OS === 'ios' ? 'Documents' : "HOPE_Invoices",
                height: 842,
                width: 595
            }

            await RNHTMLtoPDF.convert(options);
            setLoading(false);
            DisplayError(`File downloaded successfully in ${Global.OS === 'ios' ? 'Documents' : "HOPE_Invoices"}`);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }
    const handleModalResponse = async (isYes) => {
        setShowModal(false);
        setValid(false);
        if (isYes) {
            setShowConfirmationModal(true)
        }
    };

    const handleDateStartSelect = (text) => {
        setStartDateOfPlan(text)
    }

    const handleDateEndSelect = (text) => {
        setEndDateOfPlan(text)
    }

    const dialCall = (number) => {
        Linking.openURL(Global.OS === 'android' ? `tel:${number}` : `telprompt:${number}`);
    };

    const _renderTruncatedFooter = handlePress => {
        return (
            <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_600SemiBold, { marginTop: -widthToDp(1) }]}
                onPress={handlePress}>
                See more
            </Text>
        );
    };

    const _renderRevealedFooter = handlePress => {
        return (
            <Text style={[GlobalStyles.buttonextrasmallText, Fonts.Nunito_600SemiBold, { marginTop: -widthToDp(1) }]}
                onPress={handlePress}>
                See less
            </Text>
        );
    };

    const onBackPress = () => {
        if (fromCareCircle) {
            navigation.navigate("PatientDashboard", { fromCareCircle: fromCareCircle, personData: props?.route.params?.personData });
        } else {
            navigation.navigate("Dashboard");
        }
    }

    const handleSelectedReason = (item) => {
        setSelectedReason(item.key);
        setReasonText(item.reason);
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
                if (selectedType?.toUpperCase() == "DOCTOR" || selectedType?.toUpperCase() == "NUTRITIONIST") {
                    const body = {
                        "userId": Global.userID.toString(),
                        "appointmentId": noShowAppointmentPatientDetails.planId.toString(),
                        "status": "No Show",
                        "statusReason": "I am not available",
                        "refundAmount": noShowAppointmentPatientDetails.perDayFees.toString(),
                        "refundId": `refund_${new Date().getTime()}`,
                        "orderId": noShowAppointmentPatientDetails.transactionId.toString(),
                        "patientName": noShowAppointmentPatientDetails.patientName,
                        "providerName": noShowAppointmentPatientDetails.providerName,
                        "date": noShowAppointmentPatientDetails.startDate,
                        "time": noShowAppointmentPatientDetails.startTime,
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
                    getMyAppointmentList();
                } else {
                    const body = {
                        "id": noShowAppointmentPatientDetails.planId,
                        "userId": Global.userID,
                        "statusReason": "I am not available",
                        "refundAmount": "0",
                        "status": '4',
                        "address": noShowAppointmentPatientDetails.address,
                        "serviceType": noShowAppointmentPatientDetails.services.map(service => service.name).join(", "),
                        "startTime": noShowAppointmentPatientDetails.startTime,
                        "startDate": noShowAppointmentPatientDetails.startDate,
                        "providerId": noShowAppointmentPatientDetails.providerId,
                        "patientUserId": noShowAppointmentPatientDetails.patientUserId,
                        "caregiverId": Global.userType == "Caregiver" ? Global.userID : "",
                        "patientName": noShowAppointmentPatientDetails.patientName,
                        "caregiverName": noShowAppointmentPatientDetails.careGiverName,
                        "caregiverId": Global.userType == "Caregiver" ? Global.userID : noShowAppointmentPatientDetails.createdBy,
                        "providerName": noShowAppointmentPatientDetails.providerName,
                        "orderNumber": noShowAppointmentPatientDetails.orderNumber,
                        "templateName": Global.userType == "Caregiver" ? "NOSHOW_BY_CG_PATIENT_UNAVAILABILITY_N_DC" : "NOSHOW_BY_PATIENT_OWN_UNAVAILABILITY_N_DC",
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    };
                    setLoading(true);
                    await apiCall("carebuddy/cancelpatientservice", body);
                    setLoading(false);
                    getMyAppointmentList();
                    DisplayError(`Your appointment with ${noShowAppointmentPatientDetails.name} has been moved to No Show by yourself. No Refund has been issued. Please contact support@hopetheapp.com for further assistance.`)
                }
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
        else {
            try {
                const body = {
                    "id": noShowAppointmentPatientDetails.planId.toString(),
                    "comment": reasonText,
                    "userId": Global.userID.toString(),
                    "type": noShowAppointmentPatientDetails.providerType,
                    "orderNumber": noShowAppointmentPatientDetails.orderNumber,
                    "date": noShowAppointmentPatientDetails.startDate,
                    "time": noShowAppointmentPatientDetails.startTime,
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
                    "patientUserId": noShowAppointmentPatientDetails.patientUserId,
                    "caregiverId": Global.userType == "Caregiver" ? Global.userID : "",
                    "providerId": noShowAppointmentPatientDetails.providerId,
                    "templateName": getNoShowTemplateName(noShowAppointmentPatientDetails),
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
                getMyAppointmentList();
                DisplayError("Your appointment has been cancelled as the service provider is currently unavailable. We apologize for the inconvenience and appreciate your understanding. HOPE will initiate a refund, if applicable, after further coordination with the service provider. Please contact support@hopetheapp.com for further assistance.")
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
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
        setSelectedType(item.providerType);
        setReason(reasons);
        setSelectedReason(0);
        setReasonText(reasons[0].reason)
        setNoShowAppointmentPatientDetails(item);
        setShowAppointmentModal(true);
    };
    const handleCancelCrossbutton = () => {
        setShowAppointmentModal(false);
    };
    const filterAppointmentData = (text) => {
        let updatedAppointments;
        if (text.value == "All") {
            return setSelectedFilterData(appointmentList)
        }
        if (dropdownValue == "All") {
            updatedAppointments = appointmentList?.filter(appointment => {
                return appointment.status == text.value;
            }
            );
        } else {
            updatedAppointments = appointmentList?.filter(appointment => {
                return appointment.status == text.value && appointment.patientName == dropdownValue
            }
            );
        }
        setSelectedFilterData(updatedAppointments)
    }

    const requestStoragePermissionDoctor = async (item) => {
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
                    downloadInvoiceDoctor(item);
                } else {
                    DisplayError("Storage permission denied")
                }
            } catch (err) {
                console.warn(err);
            }
        } else if (Global.OS === 'ios') {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                downloadInvoiceDoctor(item);
            } else {
                await requestExternalWritePermission();
                if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                    downloadInvoiceDoctor(item);
                }
            }
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={[GlobalStyles.mainBox, { marginHorizontal: heightToDp(0) }]}>
                <Header
                    headerTitle="My Appointments"
                    onPress={() => { onBackPress(); }}
                    extraStyles={{ marginHorizontal: widthToDp(4) }}
                />
                <ScrollView>
                    <View style={[GlobalStyles.rowSpaceBetween]}>
                        <View style={{ width: "85%", }}>
                            <View style={{ marginHorizontal: widthToDp(4), display: "flex", flexDirection: "row" }}>
                                <FieldLabel text={"From"} extraStyles={[GlobalStyles.largeText, { width: "20%" }]} />
                                <View style={{ width: "80%" }}>
                                    <MedicinesDateSelect fromNurseAppointment={true} onDateSelect={handleDateStartSelect} selectedDate={startDateOfPlan} extraTextStyles={[GlobalStyles.normalText]} />
                                </View>
                            </View>
                            <View style={{ marginVertical: heightToDp(1), marginHorizontal: widthToDp(4) }}>
                                <View style={[GlobalStyles.rowSpaceBetween]}>
                                    <FieldLabel text={"To"} extraStyles={[GlobalStyles.largeText, { width: "20%" }]} />
                                    <View style={{ width: "80%" }}>
                                        <MedicinesDateSelect onDateSelect={handleDateEndSelect} selectedDate={endDateOfPlan} minDate={startDateOfPlan} extraTextStyles={[GlobalStyles.normalText]} />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ width: "15%", alignItems: 'center' }}>
                            <Pressable
                                onPress={async () => { await validateDate(); }}
                            >
                                <VectorIcons groupName="EvilIcons" iconName={"search"} iconsize={scale(50)} iconstyle={{ color: Colors.primaryButtonColor }} />
                            </Pressable>
                        </View>
                    </View>
                    {
                        appointmentList.length != 0 &&
                        <View>
                            <FieldLabel text={"Filter By"} extraStyles={[GlobalStyles.largeText, { width: "100%", marginHorizontal: widthToDp(4) }]} />
                            <View style={[{ marginHorizontal: widthToDp(4), marginBottom: verticalScale(4) }]}>
                                <View style={[styles.container]}>
                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { marginHorizontal: scale(5) }]}>Status</Text>
                                    <Pressable
                                        onPress={() => setShowFilterDropdown(preValue => !preValue)}
                                        style={({ pressed }) => ([styles.filtercontainer, { opacity: pressed ? 0.4 : 1, width: (selectedFilter == 'Filter') ? widthToDp(28) : widthToDp(32) }])}
                                    >
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(14) }]}>
                                            {selectedFilter.showValue}
                                        </Text>
                                        <VectorIcons groupName='MaterialCommunityIcons' iconName='filter-variant' iconstyle={[{ color: Colors.primaryTextColor, marginHorizontal: widthToDp(2) }]} />
                                    </Pressable>
                                    {showFilterDropdown &&
                                        <View style={[styles.boxcontainer, GlobalStyles.inputBoxShadow]}>
                                            {appointmentFilterData.map((item, index) => {
                                                const isFirst = index === 0;
                                                const isLast = index === appointmentFilterData.length - 1;
                                                return (
                                                    <Pressable
                                                        key={"key" + index}
                                                        onPress={() => {
                                                            filterAppointmentData(item);
                                                            setShowFilterDropdown(false);
                                                            setSelectedFilter({
                                                                showValue: item.value,
                                                                value: item.name
                                                            });
                                                        }}
                                                        style={({ pressed }) => ([{
                                                            opacity: pressed ? 0.4 : 1,
                                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                                            paddingHorizontal: widthToDp(6),
                                                            paddingVertical: verticalScale(6),
                                                            borderTopWidth: isFirst ? 1 : 0,
                                                            borderBottomWidth: 1,
                                                            borderLeftWidth: 1,
                                                            borderColor: 'rgba(60,60,67,0.1)',
                                                            borderTopLeftRadius: isFirst ? 14 : 0,
                                                            borderTopRightRadius: isFirst ? 14 : 0,
                                                            borderBottomLeftRadius: isLast ? 14 : 0,
                                                            borderBottomRightRadius: isLast ? 14 : 0
                                                        }])}
                                                    >
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                                            {item.value}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    }
                                </View>

                                {
                                    Global.userType == "Caregiver" && patientUserName != '' &&
                                    <View style={[{ flexDirection: 'row', width: '100%', padding: 10, alignItems: 'center' }]}>
                                        <View style={{ width: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { marginHorizontal: scale(5), width: '40%' }]}>Patient Name</Text>
                                            <Dropdown
                                                style={{
                                                    borderRadius: 14,
                                                    paddingHorizontal: 10,
                                                    minHeight: 40,
                                                    justifyContent: 'center',
                                                    width: '60%',
                                                    backgroundColor: Colors.boxBackground
                                                }}
                                                iconColor={Colors.primaryTextColor}
                                                itemTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(14) }]}
                                                selectedTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(14) }]}
                                                inputSearchStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(14) }]}
                                                data={[
                                                    { label: 'All', value: 'All' },
                                                    ...patientUserName,
                                                ]}
                                                value={dropdownValue}
                                                placeholder='All'
                                                placeholderStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.primaryTextColor, fontSize: responsiveFont(14) }]}
                                                maxHeight={300}
                                                labelField="label"
                                                valueField="value"
                                                onChange={(item) => {
                                                    setShowFilterDropdown(false);
                                                    setDropDownValue(item.value);
                                                    if (item.value === 'All') {
                                                        if (selectedFilter.value == "All") {
                                                            setSelectedFilterData(appointmentList);
                                                        } else {
                                                            const updatedAppointments = appointmentList?.filter(appointment => {
                                                                return appointment.status === selectedFilter.value;
                                                            });
                                                            setSelectedFilterData(updatedAppointments);
                                                        }
                                                    } else {
                                                        if (item.value == "All") {
                                                            const updatedAppointments = appointmentList?.filter(
                                                                appointment => appointment.patientName === item.value
                                                            );
                                                            setSelectedFilterData(updatedAppointments);
                                                        } else {
                                                            const updatedAppointments = appointmentList?.filter(appointment => {
                                                                return (appointment.patientName === item.value && appointment.status === selectedFilter.value);
                                                            });

                                                            setSelectedFilterData(updatedAppointments);
                                                        }
                                                    }
                                                }}
                                                renderRightIcon={() => (
                                                    <VectorIcons groupName='Ionicons' iconName="filter-sharp" iconsize={20} iconstyle={{ color: Colors.primaryTextColor, marginHorizontal: widthToDp(3) }} />
                                                )}
                                            />
                                        </View>
                                    </View>
                                }
                            </View>
                        </View>

                    }
                    {
                        selectedFilterData?.length == 0 &&
                        <View style={{ justifyContent: "center", alignItems: "center", marginTop: "45%", zIndex: -1 }}>
                            <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>No Appointments</Text>
                        </View>
                    }
                    {selectedFilterData?.map((item1, index) =>
                        <View key={index} style={{ paddingHorizontal: widthToDp(4), paddingVertical: widthToDp(2), zIndex: -1 }}>
                            <View style={[GlobalStyles.inputBoxShadow, styles.containerStart, { marginBottom: index == appointmentList?.length - 1 ? heightToDp(4) : null, backgroundColor: Colors.primaryButtonColor }]}>
                                <ImageBackground resizeMode="cover" source={require('../assets/vectors/blue_slice.png')} style={{ width: '100%', backgroundColor: Colors.primaryButtonColor }}>

                                    {
                                        (item1?.providerType?.toUpperCase() == "NURSE" || item1?.providerType?.toUpperCase() == "DOMESTIC CARETAKER") ?
                                            <View>
                                                <View style={[GlobalStyles.rowSpaceBetween, { marginTop: heightToDp(2), paddingHorizontal: scale(10) }]}>
                                                    <View style={{ flexDirection: "row", width: "66%" }}>
                                                        <FastImage
                                                            resizeMode={FastImage.resizeMode.cover}
                                                            style={[styles.profileimage, { borderWidth: 1 }]}
                                                            source={item1.providerProfilePath !== "" ? { uri: item1.providerProfilePath } : require("../assets/images/profile.png")}
                                                        />
                                                        <View style={{ marginLeft: widthToDp(3), width: "95%" }}>
                                                            <View style={{ width: "75%", marginTop: item1.address == "" && heightToDp(2) }}>
                                                                <Text numberOfLines={2} style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { color: Colors.boxBackground }]}>{item1.providerName}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: "row", width: "95%" }}>
                                                                <ReadMore
                                                                    numberOfLines={2}
                                                                    renderTruncatedFooter={_renderTruncatedFooter}
                                                                    renderRevealedFooter={_renderRevealedFooter}>
                                                                    <Text style={[GlobalStyles.normalText, { margin: widthToDp(10), lineHeight: 20, color: Colors.boxBackground }, Fonts.Nunito_600SemiBold]}>
                                                                        {item1.providerType}
                                                                    </Text>
                                                                </ReadMore>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <View style={{ marginRight: widthToDp(2) }}>
                                                        <Pressable
                                                            onPress={() => dialCall(item1.mobileNumber)}
                                                            style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
                                                        >
                                                            <VectorIcons groupName='FontAwesome' iconName="phone" iconsize={widthToDp(7)} iconstyle={{ color: Colors.boxBackground }} />
                                                        </Pressable>
                                                    </View>
                                                </View>
                                                {
                                                    Global.userType == "Caregiver" &&
                                                    <View style={{ marginTop: heightToDp(2), justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                        <View style={{ width: '45%', paddingHorizontal: widthToDp(4) }}>
                                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>Patient Name:</Text>
                                                        </View>
                                                        <View style={{ width: '55%', justifyContent: 'space-between', paddingHorizontal: widthToDp(4) }}>
                                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.patientName}</Text>
                                                        </View>
                                                    </View>
                                                }
                                                {
                                                    (item1.startDate != item1.endDate) &&
                                                    <View style={{ marginTop: heightToDp(2), justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                        <View style={{ width: '45%', paddingHorizontal: widthToDp(4) }}>
                                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>From</Text>
                                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{moment(item1.startDate).format("DD-MMM-YYYY")}</Text>
                                                        </View>
                                                        <View style={{ width: '55%', paddingHorizontal: widthToDp(4) }}>
                                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>To</Text>
                                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{moment(item1.endDate).format("DD-MMM-YYYY")}</Text>
                                                        </View>
                                                    </View>
                                                }

                                                <View style={{ marginTop: heightToDp(2), justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                    <View style={{ width: '45%', paddingHorizontal: widthToDp(4) }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{moment(item1.startDate).format("DD-MMM-YYYY")}</Text>
                                                    </View>
                                                    <View style={{ width: '55%', justifyContent: 'space-between', paddingHorizontal: widthToDp(4) }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{moment(item1.startTime, "HH:mm:ss").format("hh:mm A")}-{moment(item1.endTime, "HH:mm:ss").format("hh:mm A")}</Text>
                                                    </View>
                                                </View>

                                                <View style={{ marginTop: heightToDp(1), width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { paddingHorizontal: widthToDp(4), paddingVertical: widthToDp(1), borderRadius: 14, opacity: item1.status == "Cancelled" ? 0.85 : 1, color: Colors.defaultBackground }]}>{item1.status}</Text>
                                                        {
                                                            item1.status == 'Cancelled' ?
                                                                (<View style={{ paddingVertical: widthToDp(1) }}>
                                                                    <Pressable
                                                                        onPress={async () => { await appointmentInfo(item1) }}>
                                                                        <VectorIcons iconsize={heightToDp(3)} groupName='Feather' iconName='info' iconstyle={{ color: Colors.defaultBackground }} />
                                                                    </Pressable>
                                                                </View>) : <View></View>
                                                        }
                                                        {
                                                            item1.status == 'No Show' ?
                                                                (<View style={{ paddingVertical: widthToDp(1) }}>
                                                                    <Pressable
                                                                        onPress={async () => { await noShowAppointmentInfo(item1) }}>
                                                                        <VectorIcons iconsize={heightToDp(3)} groupName='Feather' iconName='info' iconstyle={{ color: Colors.defaultBackground }} />
                                                                    </Pressable>
                                                                </View>) : <View></View>
                                                        }

                                                    </View>
                                                </View>
                                                <View style={{ marginTop: heightToDp(1), paddingHorizontal: widthToDp(4), width: '100%' }}>
                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.address}</Text>
                                                </View>
                                                {
                                                    item1.services[0]?.name && item1?.services?.length != 0 &&
                                                    <FlatList
                                                        data={item1.services}
                                                        renderItem={({ item, index }) => renderItem({ item, index }, item1.services)}
                                                        keyExtractor={item => item.key}
                                                        horizontal={false}
                                                        style={{ marginHorizontal: widthToDp(4), marginTop: heightToDp(1) }}
                                                        numColumns={2}
                                                    />
                                                }
                                            </View>
                                            :
                                            <View>
                                                <View style={[GlobalStyles.rowSpaceBetween, { marginTop: heightToDp(2), paddingHorizontal: scale(10) }]}>
                                                    <View style={{ flexDirection: "row", width: "66%" }}>
                                                        <FastImage
                                                            resizeMode={FastImage.resizeMode.cover}
                                                            style={[styles.profileimage, { borderWidth: 1 }]}
                                                            source={item1.providerProfilePath !== "" ? { uri: item1.providerProfilePath } : require("../assets/images/profile.png")}
                                                        />
                                                        <View style={{ marginLeft: widthToDp(3), width: "95%" }}>
                                                            <View style={{ width: "100%", marginTop: item1.address == "" && heightToDp(2) }}>
                                                                <Text numberOfLines={2} style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { color: Colors.boxBackground }]}>{item1.providerName}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: "row", width: "95%" }}>
                                                                <ReadMore
                                                                    numberOfLines={2}
                                                                    renderTruncatedFooter={_renderTruncatedFooter}
                                                                    renderRevealedFooter={_renderRevealedFooter}>
                                                                    <Text style={[GlobalStyles.normalText, { margin: widthToDp(10), lineHeight: 20, color: Colors.boxBackground }, Fonts.Nunito_600SemiBold]}>
                                                                        {item1.services[0].name}
                                                                    </Text>
                                                                </ReadMore>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                {
                                                    Global.userType == "Caregiver" &&
                                                    <View style={{ marginTop: heightToDp(2), justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                        <View style={{ width: '45%', paddingHorizontal: widthToDp(4) }}>
                                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>Patient Name:</Text>
                                                        </View>
                                                        <View style={{ width: '55%', justifyContent: 'space-between', paddingHorizontal: widthToDp(4) }}>
                                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.patientName}</Text>
                                                        </View>
                                                    </View>
                                                }
                                                <View style={{ marginTop: heightToDp(2), justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                    <View style={{ width: '45%', paddingHorizontal: widthToDp(4) }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{moment(item1.startDate).format("DD-MMM-YYYY")}</Text>
                                                    </View>
                                                    <View style={{ width: '55%', justifyContent: 'space-between' }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground, paddingHorizontal: widthToDp(4) }]}>{moment(item1.startTime, "HH:mm:ss").format("hh:mm A")}-{moment(item1.endTime, "HH:mm:ss").format("hh:mm A")}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: heightToDp(2), justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                    <View style={{ width: '45%', paddingHorizontal: widthToDp(4) }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.purpose}</Text>
                                                    </View>
                                                    <View style={{ width: '55%', paddingHorizontal: widthToDp(4) }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.mode}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: heightToDp(1), width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { paddingHorizontal: widthToDp(4), paddingVertical: widthToDp(1), borderRadius: 14, opacity: item1.status == "Cancelled" ? 0.85 : 1, color: Colors.defaultBackground }]}>{item1.status}</Text>
                                                        {
                                                            item1.status == 'Cancelled' ?
                                                                (<View style={{ paddingVertical: widthToDp(1) }}>
                                                                    <Pressable
                                                                        onPress={async () => { await appointmentInfo(item1) }}>
                                                                        <VectorIcons iconsize={heightToDp(3)} groupName='Feather' iconName='info' iconstyle={{ color: Colors.defaultBackground }} />
                                                                    </Pressable>
                                                                </View>) : <View></View>
                                                        }
                                                        {
                                                            item1.status == 'No Show' ?
                                                                (<View style={{ paddingVertical: widthToDp(1) }}>
                                                                    <Pressable
                                                                        onPress={async () => { await noShowAppointmentInfo(item1) }}>
                                                                        <VectorIcons iconsize={heightToDp(3)} groupName='Feather' iconName='info' iconstyle={{ color: Colors.defaultBackground }} />
                                                                    </Pressable>
                                                                </View>) : <View></View>
                                                        }

                                                    </View>
                                                </View>
                                                <View style={{ paddingHorizontal: widthToDp(4), width: '100%', marginTop: heightToDp(1) }}>
                                                    {
                                                        item1.hospitalName != '' &&
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.hospitalName},</Text>
                                                    }
                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.defaultBackground }]}>{item1.address}</Text>
                                                </View>
                                            </View>
                                    }

                                    <View style={[styles.buttonMain]}>
                                        {
                                            !(item1.status === "Cancelled" && item1.refundAmount == "") &&
                                            <CommonButton
                                                onPress={async () => (item1.providerType.toUpperCase() == "NURSE" || item1.providerType.toUpperCase() == "Domestic Caretaker") ? await requestStoragePermission(item1.transactionId, item1.status, item1) : requestStoragePermissionDoctor(item1)}
                                                buttonText={"Invoice"}
                                                extraStyles={{ width: (item1.status != "Upcoming") ? "100%" : "49%", backgroundColor: Colors.defaultBackground }}
                                                extraTextStyles={{ color: Colors.primaryButtonColor }}
                                            />
                                        }
                                        {
                                            (() => {
                                                const currentDate = moment().format("DD-MMM-YYYY"); // Get today's date
                                                const appointmentDateTime = moment(`${currentDate} ${item1?.startTime}`, "DD-MMM-YYYY HH:mm");
                                                const now = moment();
                                                const formattedDate = now.format('YYYY-MM-DD');
                                                const minutesDifference = now.diff(appointmentDateTime, "minutes");
                                                if (minutesDifference >= 10 && minutesDifference <= 180 && (item1.status == "Upcoming") && (formattedDate === item1.startDate)) {
                                                    return (
                                                        <CommonButton
                                                            onPress={() => { handleNoShowApi(item1) }}
                                                            buttonText={"No Show"}
                                                            extraStyles={{ width: "49%", backgroundColor: Colors.defaultBackground }}
                                                            extraTextStyles={{ color: Colors.primaryButtonColor }}
                                                        />
                                                    );
                                                } else {
                                                    if (item1.status === "Upcoming") {
                                                        return (
                                                            <CommonButton
                                                                onPress={() => { cancelAppointment(item1) }}
                                                                buttonText={"Cancel"}
                                                                extraStyles={{ width: "49%", backgroundColor: Colors.defaultBackground }}
                                                                extraTextStyles={{ color: Colors.primaryButtonColor }}
                                                            />
                                                        )
                                                    }
                                                }
                                            })()
                                        }
                                    </View>
                                </ImageBackground>
                            </View>
                        </View>
                    )
                    }
                </ScrollView>
                <WarningModal onPress={handleModalResponse} showModal={showModal} setShowModal={setShowModal} warningText={warningText} extrabuttons={valid} />
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
            </View>
            <Modal visible={nurseInfoModal} animationType={'fade'} transparent={true}>
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center" }}>
                    <View style={[styles.optionView]}>
                        <View style={[styles.modalLastContent]}>
                            {
                                Global.userType == "Patient" ?
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>Appointment with {selectedCancel.providerName} has been canceled.</Text>
                                    :
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>{patientInfo?.patientName} Appointment with {selectedCancel?.providerName} has been canceled.</Text>
                            }
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { marginTop: '2%' }]}>cancelledBy by {cancellingDetails.cancelledBy}</Text>
                            {
                                (canceledBy?.status == "Refund" && canceledBy?.refundStatus == "Completed") ?
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { marginTop: '2%' }]}>Refund has been processed.</Text>
                                    :
                                    (canceledBy?.status == "Refund" ?
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { marginTop: '2%' }]}>Refund of ₹{selectedCancel.perDayFees} will be processed within 7 to 10 business days.</Text>
                                        :
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { marginTop: '2%' }]}>No Refund Available.</Text>
                                    )
                            }
                        </View>
                        <View style={styles.cancelButton}>
                            <CommonButton
                                extraStyles={{ width: "100%" }}
                                buttonText={"Ok"}
                                onPress={() => {
                                    setNurseInfoModal(false);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

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
            <Modal visible={noShowModal} animationType={'fade'} transparent={true}>
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
                                    setNoShowModal(false);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <Confirmation
                modalHeading={"Confirmation"}
                modalText={`Are you sure you want to cancel the Appointment ${cancellingDetails.providerName} on ${moment(cancellingDetails.startDate).format('D MMM YYYY')} at ${moment(cancellingDetails.startTime, 'HH:mm').format('hh:mm A')} ?`}
                transparent={true}
                visible={showConfirmationModal}
                setShowConfirmationModal={setShowConfirmationModal}
                action={async (text, reason) => { await cancelAppointmentReason(text, reason) }}
            />
            <Footer navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    profileimage: {
        top: heightToDp(0.5),
        borderRadius: 50,
        height: scale(50),
        width: scale(50),
        borderColor: Colors.defaultBackground
    },
    flatListStyle: {
        paddingVertical: scale(5),
    },
    insideContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "50%",
        marginTop: heightToDp(2),
    },
    containerStart: {
        width: '100%',
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        overflow: "hidden"
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
    modalImage: {
        marginRight: widthToDp(2),
        height: widthToDp(15),
        width: widthToDp(15),
        borderRadius: 50,
    },
    cancelButton: {
        width: "40%",
        marginBottom: widthToDp(4),
        marginTop: "2%"
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
    modalCloseButton: {
        backgroundColor: Colors.defaultBackground,
        borderRadius: 50,
        padding: widthToDp(1.5),
        justifyContent: "center",
        alignItems: "center"
    },
    filtercontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(1),
        borderRadius: 14,
    },
    container: {
        position: "relative",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: widthToDp(1),
        zIndex: 99,
    },
    boxcontainer: {
        position: 'absolute',
        top: heightToDp(5),
        right: 0,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        zIndex: 10
    },
    dropdown: {
        height: heightToDp(6),
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: scale(15),
        color: Colors.placeholderTextColor,
    },
});

export default NurseAppointmentScreen;