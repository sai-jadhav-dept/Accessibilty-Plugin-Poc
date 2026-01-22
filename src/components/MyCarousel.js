import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Pressable, ImageBackground, Text, Image, PermissionsAndroid, Modal } from 'react-native';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import { heightToDp, widthToDp } from '../utils/Responsive';
import CommonButton from './CommonButton';
import VectorIcons from './VectorIcons';
import GlobalStyles from '../utils/GlobalStyles';
import moment from 'moment';
import Global from '../screens/Global';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Permission, invoiceTempalate } from '../utils/CommonFunctions';
import { PERMISSIONS } from 'react-native-permissions';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import FieldLabel from './FieldLabel';
import { scale, verticalScale } from 'react-native-size-matters';

const windowWidth = Dimensions.get('window').width;
let currentOffsetValue = 0;
let ITEM_WIDTH = widthToDp(90);
let ITEM_MARGIN = 0;
let CAROUSEL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

const MyCarousel = ({ DATA, setShowConfirmationModal, setPopUpData, viewabilityConfig, cancelNurseAppointment, getpatientappointmentlist }) => {

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [noShowAppointmentPatientDetails, setNoShowAppointmentPatientDetails] = useState('');
  const [selectedReason, setSelectedReason] = useState(Global.userType === "Caregiver" ? 0 : 1);
  const [reasonText, setReasonText] = useState('');
  const [reasons, setReason] = useState('');
  const [selectedType, setSelectedType] = useState('');

  let snapIntervalAmount = DATA.length > 1 ? widthToDp(80) + ITEM_MARGIN * 2 : CAROUSEL_WIDTH;

  const handleScrollToOffset = (offsetValue) => {
    viewabilityConfig.current.scrollToOffset({ offset: offsetValue, animated: true });
  }

  const forWardFlatList = () => {
    if (currentIndex != (DATA.length - 1)) {
      currentOffsetValue = currentOffsetValue + widthToDp(80);
      handleScrollToOffset(currentOffsetValue);
      setCurrentIndex(currentIndex + 1);
    }
  }

  const backWardFlatList = () => {
    if (currentIndex != 0) {
      currentOffsetValue = currentOffsetValue - widthToDp(80);
      handleScrollToOffset(currentOffsetValue);
      setCurrentIndex(currentIndex - 1);
    }
  }

  if (DATA.length > 1) {
    ITEM_WIDTH = widthToDp(80);
    CAROUSEL_WIDTH = widthToDp(80) + ITEM_MARGIN * 2;
  } else {
    ITEM_WIDTH = widthToDp(90);
    CAROUSEL_WIDTH = widthToDp(90) + ITEM_MARGIN * 2;
  }

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / CAROUSEL_WIDTH);
    currentOffsetValue = index * widthToDp(80);
    setCurrentIndex(index);
  };

  const handleCancelButton = (item) => {
    cancelNurseAppointment(item);
  }

  const DisplayError = (text) => {
    setWarningText(text);
    setShowModal(true);
  };

  const fetchTemplate = async (status, responseStatus, type) => {
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
      booking = await invoiceTempalate(type == "Nurse" || type == "Domestic Caretaker" ? "booking_uat" : "doctor_booking_uat");
      htmlContent = booking;
    }
    return htmlContent;
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

  const succescallbackfunction = (resolve, reject) => {
    resolve(true);
  }

  const failurecallbackfunction = (resolve, reject, message) => {
    if (message) {
      DisplayError(message);
    }
    resolve(false);
  }

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
      if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction, "Photos")) {
        downloadInvoice(item);
      } else {
        await requestExternalWritePermission();
        if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction, "Photos")) {
          downloadInvoice(item);
        }
      }
    }
  }

  const downloadInvoice = async (item) => {
    try {
      setLoading(true);
      const status = "booking";
      const response = await GetInvoiceData(item);
      const refundedStatus = response.paymentData.refundStatus;
      const appointmentStartDateTime = `${response.paymentData.appointmentStartDate} ${response.paymentData.appointmentStartTime}`;
      let totalPerDayDecimal = Number(response.paymentData.perDayFees).toFixed(2);
      let htmlTemplate = await fetchTemplate(status, refundedStatus, item.type);
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
      "type": item.type,
      "orderId": item.invoiceNumber.toString(),
      "date": item.date.toString(),
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
  const handleCancelCrossbutton = () => {
    setShowAppointmentModal(false);
  };

  const handleNoShowApi = (item) => {
    const reasons = Global.userType === "Caregiver" ? [
      {
        key: 0,
        reason: `${item.patientName} not available`,
      },
      {
        key: 1,
        reason: `${item.type} not available`,
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
          reason: `${item.type} not available`,
        },
      ];
    setSelectedType(item.type);
    setReason(reasons);
    setSelectedReason(0);
    setReasonText(reasons[0].reason)
    setNoShowAppointmentPatientDetails(item);
    setShowAppointmentModal(true);
  };
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
        if (selectedType == "Doctor" || selectedType == "Nutritionist") {
          const body = {
            "userId": Global.userID.toString(),
            "appointmentId": noShowAppointmentPatientDetails.id.toString(),
            "status": "No Show",
            "statusReason": "I am not available",
            "refundAmount": noShowAppointmentPatientDetails.totalAmount.toString(),
            "refundId": `refund_${new Date().getTime()}`,
            "orderId": noShowAppointmentPatientDetails.invoiceNumber.toString(),
            "patientName": noShowAppointmentPatientDetails.patientName,
            "providerName": noShowAppointmentPatientDetails.name,
            "date": noShowAppointmentPatientDetails.date,
            "time": noShowAppointmentPatientDetails.time,
            "address": noShowAppointmentPatientDetails.address,
            "caregiverName": noShowAppointmentPatientDetails.careGiverName,
            "caregiverId": Global.userType == "Caregiver" ? Global.userID : noShowAppointmentPatientDetails.createdBy,
            "address": noShowAppointmentPatientDetails.address,
            "appointmentType": noShowAppointmentPatientDetails.mode,
            "patientUserId": noShowAppointmentPatientDetails.patientUserId,
            "providerId": noShowAppointmentPatientDetails.providerId,
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
          getpatientappointmentlist(noShowAppointmentPatientDetails, "yes");
        } else {
          const body = {
            "id": noShowAppointmentPatientDetails.id,
            "userId": Global.userID,
            "statusReason": "I am not available",
            "refundAmount": "0",
            "status": '4',
            "address": noShowAppointmentPatientDetails.address,
            "serviceType": noShowAppointmentPatientDetails.serviceType,
            "startTime": noShowAppointmentPatientDetails.time,
            "startDate": noShowAppointmentPatientDetails.date,
            "cancellationReason": "I am not available",
            "providerId": noShowAppointmentPatientDetails.providerId,
            "patientUserId": noShowAppointmentPatientDetails.patientUserId,
            "caregiverId": Global.userType == "Caregiver" ? Global.userID : noShowAppointmentPatientDetails.createdBy,
            "patientName": noShowAppointmentPatientDetails.patientName,
            "caregiverName": noShowAppointmentPatientDetails.careGiverName,
            "providerName": noShowAppointmentPatientDetails.name,
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
          getpatientappointmentlist(noShowAppointmentPatientDetails, "yes");
        }
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
          "type": noShowAppointmentPatientDetails.type,
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
          "caregiverId": Global.userType == "Caregiver" ? Global.userID : noShowAppointmentPatientDetails.createdBy,
          "providerId": noShowAppointmentPatientDetails.providerId,
          "orderNumber": noShowAppointmentPatientDetails.orderNumber,
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
        getpatientappointmentlist(noShowAppointmentPatientDetails, 'No Show');
      } catch (error) {
        setLoading(false);
        DisplayError(error.msg || "Something went wrong, please try again");
      }
    }
  }

  return (
    <View style={styles.container}>
      {currentIndex != 0 && <Pressable style={({ pressed }) => ([styles.leftArrowBtn, { opacity: pressed ? 0.5 : 1 }])}
        onPress={backWardFlatList}>
        <VectorIcons groupName="AntDesign" iconName="caretleft" iconsize={widthToDp(5)} iconstyle={styles.ArrowIcon} />
      </Pressable>}
      {(DATA.length - 1) != currentIndex && <Pressable style={({ pressed }) => ([styles.rightArrowBtn, { opacity: pressed ? 0.5 : 1 }])}
        onPress={forWardFlatList}>
        <VectorIcons groupName="AntDesign" iconName="caretright" iconsize={widthToDp(5)} iconstyle={styles.ArrowIcon} />
      </Pressable>}
      <FlatList
        data={DATA}
        ref={viewabilityConfig}
        horizontal
        snapToInterval={snapIntervalAmount}
        decelerationRate={"fast"}
        onScroll={handleScroll}
        contentContainerStyle={[styles.contentContainer, currentIndex == 0 && { paddingLeft: -widthToDp(6) }]}
        keyExtractor={(item, index) => index}
        renderItem={({ item }) => (
          <View style={[styles.item, { width: DATA.length > 1 ? widthToDp(80) : widthToDp(90) }]}>
            <View style={{ margin: 0, padding: 0, width: windowWidth - widthToDp(DATA.length == 1 ? 14 : 20) }}>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <ImageBackground resizeMode="cover" source={require('../assets/vectors/blue_slice.png')} style={styles.sliceImage}>
                    <View style={styles.appointmentContainer}>
                      <View style={{ padding: 20 }}>
                        <Text numberOfLines={2} style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_600SemiBold, { height: heightToDp(6) }]}>{Global.userType == "Patient" ? "Your" : item.patientName + "'s"} Appointment with {item.type == "Doctor" ? "Doctor" : item.type == "Nutritionist" ? "Nutritionist" : item.type == "Nurse" ? "Nurse" : "Caretaker"} {item.name}</Text>
                        <Image resizeMode="contain" source={require('../assets/images/doctor_conversation.png')} style={styles.addFileImage} />
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                          <View style={styles.detailsContainer}>
                            <VectorIcons groupName="FontAwesome" iconName="calendar" iconsize={widthToDp(5)} iconstyle={styles.detailsIcon} />
                            <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_700Bold]}>{moment(item.date).format('D MMM YYYY')}</Text>
                          </View>
                          <View style={[styles.detailsContainer, { paddingHorizontal: widthToDp(4) }]}>
                            <VectorIcons groupName="Ionicons" iconName="location-sharp" iconsize={widthToDp(5)} iconstyle={styles.detailsIcon} />
                            {
                              item.type == "Lab" ?
                                <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_700Bold]}>In Person Visit</Text>
                                :
                                <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_700Bold]}>{item.mode == "" ? item.address : item.mode}</Text>
                            }
                          </View>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                          <View style={styles.detailsContainer}>
                            <VectorIcons groupName="AntDesign" iconName="clockcircle" iconsize={widthToDp(5)} iconstyle={styles.detailsIcon} />
                            <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_700Bold]}>{moment(item.time, 'HH:mm').format('hh:mm A')}</Text>
                          </View>
                          {
                            item.Mode == 'Face to Face' || item.Type == "Lab" ?
                              <View style={[styles.detailsContainer, { paddingHorizontal: widthToDp(4) }]}>
                                <VectorIcons groupName="Ionicons" iconName="location-sharp" iconsize={widthToDp(5)} iconstyle={styles.detailsIcon} />
                                <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_700Bold]}>{item.Location}</Text>
                              </View>
                              : null
                          }
                        </View>
                        <View style={styles.ButtonContainer}>
                          <View style={[{ width: "100%" }, GlobalStyles.rowSpaceBetween]}>
                            <CommonButton
                              buttonText="Invoice"
                              onPress={() => requestStoragePermission(item)}
                              extraStyles={styles.Button}
                              extraTextStyles={{ color: Colors.primaryButtonColor }}
                            />
                            {
                              (() => {
                                const currentDate = moment().format("DD-MMM-YYYY"); // Get today's date
                                const appointmentDateTime = moment(`${currentDate} ${item?.time}`, "DD-MMM-YYYY HH:mm");
                                const now = moment();
                                const minutesDifference = now.diff(appointmentDateTime, "minutes");
                                if (minutesDifference >= 10 && minutesDifference <= 180) {
                                  return (
                                    <CommonButton
                                      buttonText="No Show"
                                      onPress={() => { handleNoShowApi(item); }}
                                      extraStyles={styles.Button}
                                      extraTextStyles={{ color: Colors.primaryButtonColor }}
                                    />
                                  );
                                } else {
                                  return (
                                    <CommonButton
                                      buttonText="Cancel"
                                      onPress={() => handleCancelButton(item)}
                                      extraStyles={styles.Button}
                                      extraTextStyles={{ color: Colors.primaryButtonColor }}
                                    />
                                  )
                                }
                              })()
                            }
                          </View>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      />
      {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: "visible",
    zIndex: -1
  },
  contentContainer: {
    paddingHorizontal: ITEM_MARGIN,
    margin: 0,
    paddingLeft: widthToDp(6),
  },
  item: {
    width: ITEM_WIDTH
  },
  appointmentContainer: {
    backgroundColor: Colors.primaryButtonColor,
    width: '100%',
    borderRadius: 14,
    marginTop: -heightToDp(1)
  },
  sliceImage: {
    width: '99%',
    borderRadius: 14,
    marginTop: heightToDp(2)
  },
  addFileImage: {
    height: heightToDp(18),
    marginVertical: heightToDp(4),
    width: '100%',
  },
  appointmentHeading: {
    width: "95%",
  },
  detailsContainer: {
    flexDirection: 'row',
    marginTop: heightToDp(2),
    alignItems: 'center',
    width: '50%',
  },
  detailsIcon: {
    color: Colors.secondarybuttonColor,
    marginRight: widthToDp(2),
  },
  Button: {
    height: heightToDp(5),
    width: '45%',
    backgroundColor: Colors.boxBackground,
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-around",
    marginTop: heightToDp(2)
  },
  leftArrowBtn: {
    position: "absolute",
    zIndex: 10,
    top: "50%",
    left: 0,
    paddingVertical: widthToDp(10),
    paddingHorizontal: widthToDp(2),
    backgroundColor: `${Colors.lightblue}90`,
    borderRadius: 14
  },
  rightArrowBtn: {
    position: "absolute",
    zIndex: 10,
    top: "50%",
    right: 0,
    paddingVertical: widthToDp(10),
    paddingHorizontal: widthToDp(2),
    backgroundColor: `${Colors.lightblue}90`,
    borderRadius: 14
  },
  ArrowIcon: {
    color: Colors.primaryButtonColor
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
});

export default MyCarousel;