import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, Linking, Pressable, PermissionsAndroid } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import FieldLabel from '../components/FieldLabel';
import ViewShot from 'react-native-view-shot';
import { ScrollView } from 'react-native-gesture-handler';
import VectorIcons from '../components/VectorIcons';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import { scale } from 'react-native-size-matters';
import CommonButton from '../components/CommonButton';
import Global from './Global';
import moment from 'moment';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Permission, invoiceTempalate } from '../utils/CommonFunctions';
import { PERMISSIONS } from 'react-native-permissions';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';

const PaymentSummary = (props) => {
    const paymentdata = props.route.params.paymentData.appointmentInfo;
    const doctorData = props.route.params.doctorData;
    const orderId = props.route.params.orderId;
    const Mode = props.route.params.doctorData.Mode;
    const navigation = useNavigation();
    const viewShotRef = React.createRef();
    const [imageURI, setImageURI] = useState("");
    const [sendDisable, setSendDisable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [isCapturing, setIsCapturing] = useState(false);
    const [address, setAddress] = useState(Global.userType == "Caregiver" ? Global.patientAddress : Global.userInfo.Address);

    const dialCall = (number) => {
        Linking.openURL(Global.OS === 'android' ? `tel:${number}` : `telprompt:${number}`);
    };

    useEffect(() => {
        setImageURI("");
    }, []);

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
    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    const onDashboardClick = () => {
        navigation.replace("TreatmentData", { selectedTab: "appointments" });
    }

    const dateObj = moment();
    const dateObject = new Date(dateObj);
    const day = ('0' + dateObject.getDate()).slice(-2);
    const monthIndex = dateObject.getMonth();
    const year = dateObject.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[monthIndex];
    const formattedDate = `${month} ${day} ${year}`;

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

    const requestStoragePermission = async () => {
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
                    downloadInvoice();
                } else {
                    DisplayError("Storage permission denied")
                }
            } catch (err) {
                console.warn(err);
            }
        } else if (Global.OS === 'ios') {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                downloadInvoice();
            } else {
                await requestExternalWritePermission();
                if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                    downloadInvoice();
                }
            }
        }
    }

    const downloadInvoice = async () => {
        try {
            setLoading(true);
            const status = "booking";
            const response = await GetInvoiceData();
            const refundedStatus = response.paymentData.refundStatus;
            const appointmentStartDateTime = `${response.paymentData.appointmentStartDate} ${response.paymentData.appointmentStartTime}`;
            let totalPerDayDecimal = Number(response.paymentData.perDayFees).toFixed(2);
            let htmlTemplate = await fetchTemplate(status, refundedStatus);
            htmlTemplate = htmlTemplate.split(`<div class="receipt-container"`)[1];
            htmlTemplate = `<div class="receipt-container"` + htmlTemplate;
            htmlTemplate = htmlTemplate.split(`</body>`)[0];
            htmlTemplate = htmlTemplate.replace('INVOICE_PLACEHOLDER', response.paymentData.orderId);
            htmlTemplate = htmlTemplate.replace('USERTYPE_PLACEHOLDER', props?.route?.params?.doctorData?.Type);
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

    const GetInvoiceData = async () => {
        const body = {
            "id": paymentdata.id.toString(),
            "type": "Doctor",
            "orderId": "",
            "date": paymentdata.date.toString(),
            "invoiceType": "booking",
            "coord": [
                "24.623061",
                "10.830960"
            ],
            "location": "Mumbai",
            "deviceInfo": "android"
        }
        return apiCall('documents/getinvoicedata', body);
    }

    return (
        <ViewShot style={{ flex: 1, backgroundColor: Colors.defaultBackground, }}
            ref={viewShotRef}
            captureMode="mount"
            options={{ format: "jpg", quality: 1.0 }}
            onCapture={capturedURI => {
                setImageURI(capturedURI);
            }}>
            <SafeAreaView style={[GlobalStyles.mainContainer]}>
                <View style={[GlobalStyles.mainBox, { position: "relative" }]}>
                    <ScrollView style={{ marginBottom: widthToDp(25) }}>

                        <View style={GlobalStyles.fixedTopSpacing}>
                            <VectorIcons groupName='AntDesign' iconName="checkcircle" iconsize={40}
                                iconstyle={{
                                    alignSelf: "center",
                                    marginBottom: heightToDp(2),
                                    marginRight: widthToDp(2),
                                    color: Colors.successColor
                                }} />
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, styles.paymentData]}>{`₹ ${Global.doctorAmount} /-`}</Text>
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular_Italic, styles.paymentData]}>{`Paid on ${formattedDate}`}</Text>

                            <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                {doctorData.selectedDoctorDetail.profilePath && doctorData.selectedDoctorDetail.profilePath !== "" ? (
                                    <Image style={styles.profileimage} resizeMode='cover' source={{ uri: doctorData.selectedDoctorDetail.profilePath }} />
                                ) : (
                                    <Image resizeMode='cover' style={styles.profileimage} source={require("../assets/images/profile.png")} />
                                )}
                                <Text style={[GlobalStyles.largeText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(3), marginTop: heightToDp(2) }]}>{doctorData.selectedDoctorDetail.name}</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: Colors.placeholderTextColor, height: 2, marginVertical: heightToDp(2) }}></View>
                        <View>
                            <Text style={[GlobalStyles.largeText, Fonts.Nunito_600SemiBold, styles.paymentData, { marginBottom: heightToDp(1) }]}>Service Confirmed</Text>
                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_400Regular, styles.paymentData, { marginBottom: heightToDp(1) }]}>{`Order number ${orderId}`}</Text>
                        </View>
                        {
                            Mode != "Virtual" && Mode != "Home Visit" &&
                            <View>
                                <FieldLabel text={"Location"} extraStyles={{ marginTop: heightToDp(1) }} />
                                <View style={{ marginTop: heightToDp(1) }}>
                                    <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{doctorData.hospitaldata.name}</Text>
                                </View>
                            </View>
                        }
                        {
                            Mode == "Home Visit" &&
                            <View>
                                <FieldLabel text={"Location"} extraStyles={{ marginTop: heightToDp(1) }} />
                                <View style={{ marginTop: heightToDp(1) }}>
                                    <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{address}</Text>
                                </View>
                            </View>
                        }
                        <FieldLabel text={"Date & Time"} extraStyles={{ marginTop: heightToDp(2) }} />
                        <View style={{ marginTop: heightToDp(1) }}>
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{`${doctorData.SelectedDate} ${doctorData.Time.newTime}`}</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ width: "50%" }}>
                                <FieldLabel text={"Mode"} extraStyles={{ marginTop: heightToDp(2) }} />
                                <View style={{ marginTop: heightToDp(1) }}>
                                    <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{doctorData.Mode}</Text>
                                </View>
                            </View>
                            <View style={{ width: "50%" }}>
                                <FieldLabel text={"Purpose"} extraStyles={{ marginTop: heightToDp(2) }} />
                                <View style={{ marginTop: heightToDp(1) }}>
                                    <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{doctorData.Purpose}</Text>
                                </View>
                            </View>
                        </View>

                        {
                            !isCapturing && (
                                <View collapsable={false} style={[GlobalStyles.rowSpaceBetween, { paddingVertical: heightToDp(3) }]}>
                                    <Pressable onPress={() => dialCall(doctorData.selectedDoctorDetail.mobileNumber)} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                        <VectorIcons groupName='FontAwesome' iconName='phone' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Connect</Text>
                                    </Pressable>
                                    <Pressable onPress={() => { captureViewShot() }} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                        <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Share</Text>
                                    </Pressable>
                                    <Pressable onPress={() => { requestStoragePermission() }} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                        <VectorIcons groupName='Feather' iconName='download' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Invoice</Text>
                                    </Pressable>
                                </View>
                            )
                        }
                    </ScrollView>
                    {
                        !isCapturing && (
                            <CommonButton
                                onPress={() => { onDashboardClick() }}
                                buttonText={"Continue"}
                                visible={true}
                                extraStyles={GlobalStyles.fixbottomcommonButton}
                            />
                        )
                    }

                    {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
                    <Spinner
                        visible={loading}
                        color={Colors.primaryButtonColor}
                        customIndicator={<Loader />}
                        textStyle={{ color: Colors.primaryButtonColor }}
                    />
                </View>
            </SafeAreaView>
        </ViewShot>
    )
}

const styles = StyleSheet.create({
    profileimage: {
        borderWidth: 2,
        borderColor: "black",
        borderRadius: 50,
        height: scale(53),
        width: scale(53)
    },
    paymentData: {
        alignSelf: "center",
        marginBottom: heightToDp(1)
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        padding: widthToDp(2),
        marginTop: heightToDp(1)
    },
})

export default PaymentSummary