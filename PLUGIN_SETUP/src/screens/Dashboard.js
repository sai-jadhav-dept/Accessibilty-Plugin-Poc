import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, Image, ImageBackground, BackHandler, Pressable, SafeAreaView, Modal, StyleSheet, ToastAndroid, FlatList } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import CommonButton from '../components/CommonButton';
import { BlurView } from '@react-native-community/blur';
import MyCarousel from '../components/MyCarousel';
import VectorIcons from '../components/VectorIcons';
import Global from './Global';
import Confirmation from '../components/Confirmation';
import { scale, verticalScale } from 'react-native-size-matters';
import TimeLeftApointmentList from '../components/TimeLeftApointmentList';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import moment from 'moment';
import ToastMessage from '../components/ToastMessage';
import NoShowWarningModal from '../components/NoShowWarningModal';

const Dashboard = () => {
  const navigation = useNavigation();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [popUpData, setPopUpData] = useState('');
  const [appointmentData, setappointmentData] = useState([]);
  const viewabilityConfig = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lappsedAppointments, setLappsedAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [noshowModal, setNoshowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [loading, setLoading] = useState(false);
  const [diseaseData, setDiseaseData] = useState([]);
  const modalOptions1 = [
    {
      optionName: 'Timeline',
      key: 0,
      id: 1,
    },
    {
      optionName: 'Forum',
      key: 1,
      id: 2,
    },
    {
      optionName: 'Appointments',
      key: 2,
      id: 3,
    },
  ];
  const modalOptions2 = [
    {
      optionName: 'Documents',
      key: 0,
      id: 1,
    },
    {
      optionName: 'Medications',
      key: 1,
      id: 2,
    },
    {
      optionName: 'People',
      key: 2,
      id: 3,
    },
  ];
  const [selectedModalOption1, setSelectedModalOption1] = useState('Timeline');
  const [selectedModalOption2, setSelectedModalOption2] = useState('Medications');
  const timelineData = [];
  const medicationData = [];
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessageText, setToastMessageText] = useState("");
  const [cancellingDetails, setCancellingDetails] = useState([]);
  const [selectedCancel, setSelectedCancel] = useState([]);
  const [valid, setValid] = useState(false);
  const [initiateRefund, setInitiateRefund] = useState(false);
  const [appointmentType, setAppointmentType] = useState("");
  const [textChanger, setTextChanger] = useState(false);

  const DisplayError = (text) => {
    setWarningText(text)
    setShowModal(true);
  }
  const DisplayErrorNoShow = (text, textChanger) => {
    setTextChanger(textChanger)
    setWarningText(text)
    setNoshowModal(true);
  }

  const dashboardRefreshere = () => {
    const today = new Date();
    const mylappsedAppointments = [];
    appointmentData.forEach((appointment) => {
      const selectedDate = new Date(appointment.Date + ' ' + appointment.Time);
      selectedDate.setHours(parseInt(selectedDate.getHours()) + 1);
      if (selectedDate < today) {
        mylappsedAppointments.push(appointment);
        setShowPopup(true);
      }
    });
    setLappsedAppointments(mylappsedAppointments);
    navigation.addListener("focus", () => {
      filterByTodayDate();
      getpatientappointmentlist();
    });
  }

  const filterByTodayDate = () => {
    const today = new Date();
    const todayDate = today.getDate();
    const filterDataArray = Global.appointmentDetails.filter((value, i) => {
      const ddmmyy = value.date.split(" ");
      return todayDate == ddmmyy[0] && value.Status != "Cancelled" && value.Status != "Completed" && value.Status != "Skiped";
    });
    // setAppointmentData(filterDataArray);
  }


  const getTemplateName = (initiateRefund) => {
    let templateName;
    if (Global.userType == "Patient") {
      if (cancellingDetails.type == "Nurse" || cancellingDetails.type == "Domestic Caretaker") {
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
      if (cancellingDetails.type == "Nurse" || cancellingDetails.type == "Domestic Caretaker") {
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

  const cancelAppointmentFromApi = async (reason) => {
    if (Global.clicked) {
      Global.clicked = true;
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
          "providerName": cancellingDetails.name,
          "date": cancellingDetails.date,
          "time": cancellingDetails.time,
          "address": cancellingDetails.address,
          "appointmentType": cancellingDetails.mode,
          "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : "",
          "patientUserId": cancellingDetails.patientUserId,
          "providerId": cancellingDetails.providerId,
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
        await getpatientappointmentlist();
        if (initiateRefund) {
          DisplayError(`Appointment with ${cancellingDetails.name} has been canceled. Refund of ₹${cancellingDetails.totalAmount} will be processed within 7 to 10 business days.`)
        } else {
          DisplayError(`Appointment with ${cancellingDetails.name} has been canceled.\n No Refund Available.`)
        }
      } catch (error) {
        setLoading(false);
        DisplayError(error.msg || "Something went wrong, please try again");
      }
      Global.clicked = false;
    }
  }

  const cancelAppointment = async (action, reason) => {
    const selectedIndex = appointmentData.findIndex((val, i) => val.id == popUpData.id);
    if (action == 'Yes') {
      if (appointmentType == "Doctor" || appointmentType == "Nutritionist") {
        await cancelAppointmentFromApi(reason);
      } else {
        cancelPatientService(reason);
      }

      const globalDataUpdate = Global.appointmentDetails.filter((value, index) => {
        if (value.ID == popUpData.ID) {
          value.Status = 'Cancelled';
          value.statusReason = reason;
        }
        return value.Status == "Confirmed";
      });
      if (globalDataUpdate.length - 1 >= 0 && (appointmentData.length - 1) == selectedIndex) {
        viewabilityConfig.current.scrollToIndex({ index: globalDataUpdate.length - 1, animated: true });
      }
      filterByTodayDate();
    }
    setShowConfirmationModal(false);
  }

  const CheckStatus = () => {
    Global.patientList.forEach(
      (e) => {
        if (e.id == Global.patientID) {
          if (e.status == "Approved") {
            navigation.replace("MyTreatment")
          }
          else {
            DisplayError("Patient is not Aprroved")
          }
        }
      }
    )
  }

  const getpatientappointmentlist = async (noShowAppointmentPatientDetails, text) => {
    try {
      const body = {
        "userId": Global.userType == "Patient" ? "0" : Global.userID.toString(),
        "patientId": Global.userType == "Patient" ? Global.patientID.toString() : "0",
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      }
      setLoading(true);
      const response = await apiCall('appointments/getpatientappointmentlist', body);
      setLoading(false);
      setappointmentData(response.appointmentInfo);
      if (text == "yes") {
        if (Global.userType === "Caregiver") {
          DisplayErrorNoShow(`Appointment has been marked as No-Show as Patient was unavailable at the scheduled time`, `Please contact support@hopetheapp.com if you need assistance.`)
        } else {
          DisplayErrorNoShow(`Appointment has been marked as No-Show as Patient was unavailable at the scheduled time.`, `Please contact support@hopetheapp.com if you need assistance.`)
        }
      } else if (text == "No Show") {
        DisplayErrorNoShow(`Appointment has been marked as No-Show as Service Provider was unavailable at the scheduled time. Our support team will investigate further and determine if a refund has to be issued.`, `Please contact support@hopetheapp.com if you need assistance.`)
      }
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  let backPressed = 0;

  useEffect(() => {
    dashboardRefreshere();
    const handleBackPress = () => {
      if (backPressed + 2000 > new Date().getTime()) {
        BackHandler.exitApp();
      } else {
        ToastMessagerFunction("Press back again to exit");
        backPressed = new Date().getTime();
      }
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (Global.userType === 'Caregiver') {
        await careGiverDiseaseDetails();
      } else {
        await Triggergetpatientdiseasedetails();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchData();
    });
    return () => {
      unsubscribeFocus();
    };
  }, [navigation]);

  const handleShowAlert = (msg) => {
    setToastVisible(true);
    setToastMessageText(msg);
    setTimeout(() => {
      setToastVisible(false);
    }, 1500);
  };

  const ToastMessagerFunction = (msg) => {
    if (Global.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    } else {
      handleShowAlert(msg)
    }
  }

  const cancelNurseAppointment = (data) => {
    setAppointmentType(data.type)
    setCancellingDetails(data);
    setSelectedCancel(data);
    const timeFormat = 'HH:mm:ss';
    const appointmentDateTime = moment(`${data.date} ${data.time}`, `YYYY-MM-DD ${timeFormat}`);
    const currentDateTime = moment();
    const timeDifference = appointmentDateTime.diff(currentDateTime, 'hours');
    setValid(true);
    if (timeDifference < 24) {
      setInitiateRefund(false);
      DisplayError(`Are you sure you want to cancel the appointment for ${data.name} on ${moment(data.date).format("DD-MMM-YYYY")}? \n No Amount will be refunded.`);
    } else {
      setInitiateRefund(true);
      DisplayError(`Are you sure you want to cancel appointment for ${data.name} for ${moment(data.date).format("DD-MMM-YYYY")}? \n₹${data.perDayFees} Amount will be refunded in your account within 7 to 10 working days`);
    }

  };

  const handleModalResponse = async (isYes) => {
    setShowModal(false);
    setValid(false);
    if (isYes) {
      setShowConfirmationModal(true)
    }
  };

  const cancelPatientService = async (reason) => {
    try {
      const body = {
        "id": cancellingDetails.id,
        "userId": Global.userID,
        "refundId": initiateRefund ? `refund_${new Date().getTime()}` : "",
        "refundAmount": initiateRefund ? cancellingDetails.totalAmount.toString() : "0",
        "statusReason": reason,
        "status": "0",
        "address": cancellingDetails.address,
        "serviceType": cancellingDetails.serviceType,
        "startTime": cancellingDetails.time,
        "startDate": cancellingDetails.date,
        "cancellationReason": reason,
        "providerId": cancellingDetails.providerId,
        "patientUserId": cancellingDetails.patientUserId,
        "caregiverId": Global.userType == "Caregiver" ? Global.userID : "",
        "patientName": cancellingDetails.patientName,
        "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : "",
        "providerName": cancellingDetails.name,
        "orderNumber": cancellingDetails.orderNumber,
        "templateName": initiateRefund ? "CancelAppointment_Refund_P_N_DC" : "CancelAppointment_NoRefund_P_N_DC",
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
      if (initiateRefund) {
        DisplayError(`Appointment with ${cancellingDetails.name} has been canceled. Refund of ₹${selectedCancel.perDayFees} will be processed within 7 to 10 business days.`)
      } else {
        DisplayError(`${Global.userType != "Patient" ? cancellingDetails.name : ""} Appointment with ${cancellingDetails.name} has been canceled.\n No Refund Available.`)
      }
      await getpatientappointmentlist();
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  };
  const handleDiseasePageNavigation = (item) => {
    Global.patientID = item.id;
    Global.patientUserId = item.patientUserId;
    Global.patientName = item.patientName;
    navigation.replace("PatientDashboard", { personData: item, from: 'Dashboard' })
  };

  const handlePatientPageNavigation = (item) => {
    navigation.navigate("YourTreatments", { diseaseData: item, from: 'Dashboard' })
  };

  const handlediseaseNameId = (values) => {
    Global.selectedCycle = values.id;
    Global.selectedDiseaseName = values.name;
    navigation.navigate("TreatmentData", { selectedTab: "vitals", fromCareCircle: false, from: "Dashboard" })
  }


  const Triggergetpatientdiseasedetails = async () => {
    try {
      const body = {
        "patientId": Global.patientID,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await triggerApiCall('carecircle/getpatientdiseasedetails', body)
      setDiseaseData(response.diseaseData);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      DisplayError(e.msg || "Something went wrong, please try again");
    }
  }

  const careGiverDiseaseDetails = async () => {
    try {
      const body = {
        "userId": Global.userID,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await triggerApiCall('treatment/getpatientlatesttreatmentlist', body);
      setDiseaseData(response.treatments);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      DisplayError(e.msg || "Something went wrong, please try again");
    }
  }

  const triggerApiCall = (endpoint, body) => {
    return new Promise(async (res, rej) => {
      try {
        const response = await apiCall(endpoint, body);
        res(response);
      } catch (error) {
        rej(error);
      }
    })
  }

  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Logo
          visible={true}
          profile={true}
          setToastVisible={setToastVisible}
          setToastMessageText={setToastMessageText}
          bellFn={() => navigation.navigate('Notifications', { sourcePage: "Dashboard" })}
          chatFn={() => navigation.navigate('HopeConnect', { selectedOption: "CHAT" })}
        />
        <ScrollView contentContainerStyle={{}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={"handled"}>
          <View style={GlobalStyles.mainContainer}>
            <View style={{ marginTop: heightToDp(1) }}>
              <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>Manage your Treatment</Text>
              <Text style={[GlobalStyles.smallText, styles.headingDesc, Fonts.Nunito_600SemiBold]}>Managing your day to day activities and health is now simple & better.</Text>
            </View>
            <View style={GlobalStyles.fixedTopSpacing}>
              <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>Today’s Activities</Text>
              {appointmentData.length > 0 ? (
                <MyCarousel DATA={appointmentData} setShowConfirmationModal={setShowConfirmationModal} popUpData={popUpData} setPopUpData={setPopUpData} viewabilityConfig={viewabilityConfig} cancelNurseAppointment={cancelNurseAppointment} getpatientappointmentlist={getpatientappointmentlist} />
              )
                : (
                  <View style={{ width: '100%', marginTop: 15 }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <View style={styles.appointmentContainer}>
                        <View style={{ paddingLeft: 20 }}>
                          <ImageBackground resizeMode="cover" source={require('../assets/vectors/blue_slice.png')} style={styles.sliceImage}>
                            <Text style={[GlobalStyles.backgroundsmallText, Fonts.Nunito_600SemiBold]}>You don’t have any activity</Text>
                            <Image resizeMode="contain" source={require('../assets/vectors/add_files.png')} style={styles.addFileImage} />
                          </ImageBackground>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              }
            </View>

            <Modal
              style={{ flex: 1 }}
              animationType="fade"
              transparent={true}
              visible={showPopup}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setShowPopup(false);
              }}>
              <View style={styles.menucontainer}>
                <View style={styles.boxcontainer}>
                  <View style={{ marginHorizontal: widthToDp(4), flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                    <View style={styles.appointmentHeading}>
                      <View>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Lappsed Appointments</Text>
                      </View>
                    </View>
                    <View style={styles.closeiconcontainer}>
                      <Pressable onPress={() => {
                        skipedShowedAppointment();
                        setShowPopup(false);
                      }}>
                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.buttonnormalText]}>Skip </Text>
                      </Pressable>
                    </View>
                  </View>
                  <TimeLeftApointmentList DATA={lappsedAppointments} setPopUpData={setPopUpData} setShowConfirmationModal={setShowConfirmationModal} />
                </View>
              </View>
            </Modal>
            {Global.userType !== "Caregiver" &&
              <View style={GlobalStyles.fixedTopSpacing}>
                <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>My Treatments</Text>
                <Text style={[GlobalStyles.smallText, styles.headingDesc, Fonts.Nunito_600SemiBold]}>HOPE will help you to manage your Treatment</Text>
                {
                  diseaseData.length != 0 ?
                    <View>
                      <FlatList
                        keyExtractor={(item, index) => "key" + index}
                        data={diseaseData}
                        horizontal
                        renderItem={({ item, index }) => {
                          return (
                            <View key={index} style={[{ marginVertical: heightToDp(1) }]}>
                              <Pressable
                                style={({ pressed }) => ([GlobalStyles.inputBoxShadow, {
                                  opacity: pressed ? 0.5 : 1,
                                  backgroundColor: Colors.primaryButtonColor,
                                  overflow: "hidden",
                                  width: 280,
                                  marginRight: scale(15),
                                  borderRadius: 14,
                                  padding: widthToDp(6),
                                }])}
                                onPress={() => {
                                  handlePatientPageNavigation(item);
                                }}
                              >

                                <>
                                  <Image resizeMode='contain' style={styles.sliceImage_new} source={require("../assets/vectors/Fill_7.png")} />
                                  <Image resizeMode='contain' style={styles.BluetriangleImage} source={require("../assets/vectors/Fill_8.png")} />
                                  <Image resizeMode='contain' style={styles.BluesecondarysliceImage} source={require("../assets/vectors/Fill_7.png")} />
                                </>
                                <View style={[styles.diseaseContainer]}>
                                  <View style={[styles.BoxLeft]}>
                                    <View style={{ width: '80%' }}>
                                      <Text style={[Fonts.Nunito_600SemiBold,
                                      GlobalStyles.mediumText,
                                      { color: Colors.defaultBackground, fontSize: responsiveFont(scale(18)), width: "80%", marginBottom: verticalScale(10) }]}>
                                        {item.name}
                                      </Text>
                                      <Text style={[Fonts.Nunito_600SemiBold,
                                      GlobalStyles.mediumText,
                                      { color: Colors.defaultBackground, fontSize: responsiveFont(scale(18)), width: "80%" }]}>
                                        {item.diseaseName}
                                      </Text>
                                    </View>
                                    <View style={{ position: "absolute", right: 0 }}>
                                      <Image style={styles.doctorImage} resizeMode='cover' source={require('../assets/vectors/heartbeat_white.png')}></Image>
                                    </View>
                                  </View>
                                  <View>
                                    {(item.hasStages != "No") &&
                                      <View style={styles.stage}>
                                        <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { fontSize: responsiveFont(scale(12)) }]}>Stage {item.stage}</Text>
                                      </View>
                                    }
                                    {
                                      item.cycles?.map((values, i) => {
                                        return (
                                          <Pressable key={i} style={({ pressed }) => ([styles.cycleBtn, { opacity: pressed ? 0.5 : 1, marginTop: i == 0 ? heightToDp(3) : heightToDp(1) }])}
                                            onPress={() => {
                                              handlediseaseNameId(values)
                                              Global.diseaseID = item.id;
                                            }}>
                                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: Colors.defaultBackground }]}>
                                              {values.name}
                                            </Text>
                                          </Pressable>
                                        )
                                      })
                                    }
                                  </View>
                                </View>
                              </Pressable>
                            </View>
                          )
                        }}
                      />
                    </View>
                    :
                    (
                      <View style={{ width: '100%' }}>
                        <Pressable style={({ pressed }) => [{ opacity: 1 }]}>
                          <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: heightToDp(2) }}>
                            <ImageBackground
                              resizeMode="cover"
                              source={require('../assets/vectors/orange_slice.png')}
                              style={[{ width: '99%' }]}>
                              <View style={{ backgroundColor: 'rgba(255,203,1,0.8)', width: '100%', borderRadius: 14 }}>
                                <View style={{ padding: 20 }}>
                                  <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                    You don’t have any treatment plans set up to track
                                  </Text>
                                  <Image
                                    resizeMode="contain"
                                    source={require('../assets/vectors/add_files.png')}
                                    style={[
                                      {
                                        height: heightToDp(18),
                                        marginVertical: heightToDp(2),
                                        width: '100%'
                                      }
                                    ]}
                                  />
                                  <View style={{}}>
                                    <CommonButton
                                      onPress={() => {
                                        if (Global.userType != "Patient") {
                                          CheckStatus()
                                        }
                                        else {
                                          navigation.replace("MyTreatment")
                                        }
                                      }}
                                      buttonText="Add Treatment Plan"
                                      visiblePlus={true}
                                      extraStylesPlus={{ color: Colors.boxBackground }}
                                      extraStyles={styles.button}
                                      extraTextStyles={{ color: Colors.boxBackground, fontSize: scale(18) }}
                                    />
                                  </View>
                                </View>
                              </View>
                            </ImageBackground>
                          </View>
                        </Pressable>
                      </View>
                    )}
              </View>
            }

            {Global.userType == "Caregiver" &&
              <View style={GlobalStyles.fixedTopSpacing}>
                <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>My Treatments</Text>
                <Text style={[GlobalStyles.smallText, styles.headingDesc, Fonts.Nunito_600SemiBold]}>HOPE will help you to manage your Treatment</Text>
                {
                  diseaseData.length != 0 ?
                    <View>
                      <FlatList
                        keyExtractor={(item, index) => "key" + index}
                        data={diseaseData}
                        horizontal
                        renderItem={({ item, index }) => {
                          return (
                            <View key={index} style={[{ marginVertical: heightToDp(1) }]}>
                              <Pressable
                                style={({ pressed }) => ([GlobalStyles.inputBoxShadow, {
                                  opacity: pressed ? 0.5 : 1,
                                  backgroundColor: Colors.primaryButtonColor,
                                  overflow: "hidden",
                                  width: 280,
                                  marginRight: scale(15),
                                  borderRadius: 14,
                                  padding: widthToDp(6),
                                }])}
                                onPress={() => {
                                  handleDiseasePageNavigation(item);
                                }}
                              >

                                <>
                                  <Image resizeMode='contain' style={styles.sliceImage_new} source={require("../assets/vectors/Fill_7.png")} />
                                  <Image resizeMode='contain' style={styles.BluetriangleImage} source={require("../assets/vectors/Fill_8.png")} />
                                  <Image resizeMode='contain' style={styles.BluesecondarysliceImage} source={require("../assets/vectors/Fill_7.png")} />
                                </>
                                <View style={[styles.diseaseContainer]}>
                                  <View style={[styles.BoxLeft]}>
                                    <View style={{ width: '80%' }}>
                                      <Text style={[Fonts.Nunito_600SemiBold,
                                      GlobalStyles.mediumText,
                                      { color: Colors.defaultBackground, fontSize: responsiveFont(scale(18)), width: "80%", marginBottom: verticalScale(10) }]}>
                                        {item.patientName}
                                      </Text>
                                      <Text style={[Fonts.Nunito_600SemiBold,
                                      GlobalStyles.mediumText,
                                      { color: Colors.defaultBackground, fontSize: responsiveFont(scale(18)), width: "80%" }]}>
                                        {item.diseaseName}
                                      </Text>
                                    </View>
                                    <View style={{ position: "absolute", right: 0 }}>
                                      <Image style={styles.doctorImage} resizeMode='cover' source={require('../assets/vectors/heartbeat_white.png')}></Image>
                                    </View>
                                  </View>
                                  <View>
                                    {(item.hasStages != "No") &&
                                      <View style={styles.stage}>
                                        <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { fontSize: responsiveFont(scale(12)) }]}>Stage {item.stage}</Text>
                                      </View>
                                    }
                                    {
                                      item.cycles?.map((values, i) => {
                                        return (
                                          <Pressable key={i} style={({ pressed }) => ([styles.cycleBtn, { opacity: pressed ? 0.5 : 1, marginTop: i == 0 ? heightToDp(3) : heightToDp(1) }])}
                                            onPress={() => {
                                              // treatmentNavigation(values, item.name, item.id)
                                            }}>
                                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: Colors.defaultBackground }]}>
                                              {values.name}
                                            </Text>
                                          </Pressable>
                                        )
                                      })
                                    }
                                  </View>
                                </View>
                              </Pressable>
                            </View>
                          )
                        }}
                      />
                    </View>
                    :
                    (
                      <View style={{ width: '100%' }}>
                        <Pressable style={({ pressed }) => [{ opacity: 1 }]}>
                          <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: heightToDp(2) }}>
                            <ImageBackground
                              resizeMode="cover"
                              source={require('../assets/vectors/orange_slice.png')}
                              style={[{ width: '99%' }]}>
                              <View style={{ backgroundColor: 'rgba(255,203,1,0.8)', width: '100%', borderRadius: 14 }}>
                                <View style={{ padding: 20 }}>
                                  <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                    You don’t have any treatment plans set up to track
                                  </Text>
                                  <Image
                                    resizeMode="contain"
                                    source={require('../assets/vectors/add_files.png')}
                                    style={[
                                      {
                                        height: heightToDp(18),
                                        marginVertical: heightToDp(2),
                                        width: '100%'
                                      }
                                    ]}
                                  />
                                  <View style={{}}>
                                    <CommonButton
                                      onPress={() => {
                                        if (Global.userType != "Patient") {
                                          CheckStatus()
                                        }
                                        else {
                                          navigation.replace("MyTreatment")
                                        }
                                      }}
                                      buttonText="Add Treatment Plan"
                                      visiblePlus={true}
                                      extraStylesPlus={{ color: Colors.boxBackground }}
                                      extraStyles={styles.button}
                                      extraTextStyles={{ color: Colors.boxBackground, fontSize: scale(18) }}
                                    />
                                  </View>
                                </View>
                              </View>
                            </ImageBackground>
                          </View>
                        </Pressable>
                      </View>
                    )}
              </View>
            }




            <View style={{ marginTop: heightToDp(3) }}>
              <Text style={[styles.heading, Fonts.Nunito_700Bold]}>Connect</Text>
              <View style={[styles.connectContainer, GlobalStyles.inputBoxShadow]}>
                <Text style={[GlobalStyles.mediumText, { marginTop: heightToDp(1) }, Fonts.Nunito_700Bold]}>HOPE Connect</Text>
                <Image resizeMode="contain" source={require('../assets/images/Avatars.png')} style={styles.image} />
                <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.4 : 1 }, styles.connectButton]}
                  onPress={() => { navigation.navigate("HopeConnect", { selectedOption: "CHAT" }); }}>
                  <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>
                    Connect with People
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{ marginTop: heightToDp(5) }}>
              <Text style={[styles.heading, Fonts.Nunito_700Bold]}>Forum</Text>
              <View style={[GlobalStyles.inputBoxShadow, styles.connectContainer]}>
                <Image resizeMode="contain" source={require('../assets/vectors/chat_question.png')} style={styles.image} />
                <Text style={[GlobalStyles.mediumText, { marginTop: heightToDp(1) }, Fonts.Nunito_700Bold]}>
                  HOPE Forum
                </Text>
                <Pressable style={({ pressed }) => [styles.connectButton, { opacity: pressed ? 0.4 : 1 }]}
                  onPress={() => { navigation.navigate("HopeConnect", { selectedOption: "FORUM" }); }}>
                  <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>
                    Join the Discussions
                  </Text>
                </Pressable>
              </View>
            </View>

            {
              Global.userType == "Caregiver" ? null :
                <View style={{ paddingHorizontal: widthToDp(4), marginVertical: heightToDp(3) }}>
                  <CommonButton
                    buttonText="Book Care Buddy Service"
                    extraStyles={{
                      width: '100%',
                      backgroundColor: Colors.primaryButtonColor
                    }}
                    extraTextStyles={{ color: Colors.boxBackground }}
                    onPress={() => {
                      Global.nurseSelecting.Type = 'Nurse';
                      Global.nurseSelecting.userTypeId = '3';
                      navigation.navigate("AddServices")
                    }}
                  />
                </View>
            }

            <View style={GlobalStyles.fixedTopSpacing}></View>
          </View>
        </ScrollView>
      </View>
      <Modal animationType={'fade'} visible={showSearchModal} transparent={true}>
        <Pressable
          onPress={() => setShowSearchModal(false)}
          style={[{
            flex: 1,
            backgroundColor: Colors.modalBackground,
            justifyContent: 'center',
            alignItems: 'center'
          }]}>
          <BlurView style={[{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }]}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor={Colors.boxBackground} />
          <View style={[GlobalStyles.columnFlexstart, { width: '90%' }]}>
            <View style={[GlobalStyles.columnFlexstart, { backgroundColor: Colors.boxBackground, width: '100%', borderRadius: 14 }]}>
              <View style={[GlobalStyles.columnFlexstart, { width: '100%' }]}>
                <View style={[{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: heightToDp(2)
                }]}>
                  {modalOptions1.map((item, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedModalOption1(item.optionName)}
                      style={({ pressed }) => [{
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: item.optionName == selectedModalOption1 ? Colors.primaryButtonColor : Colors.boxBackground,
                        paddingVertical: heightToDp(1),
                        paddingHorizontal: widthToDp(4),
                        borderRadius: 14
                      }]}>
                      <Text style={[{
                        color: item.optionName == selectedModalOption1 ? Colors.boxBackground : Colors.primaryTextColor,
                        fontSize: scale(14)
                      },
                      Fonts.Nunito_400Regular
                      ]}>
                        {item.optionName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={[{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: heightToDp(2),
                  marginBottom: heightToDp(4)
                }]}>
                  {modalOptions2.map((item, index) => (
                    <Pressable key={index}
                      onPress={() => setSelectedModalOption2(item.optionName)}
                      style={({ pressed }) => [{
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: item.optionName == selectedModalOption2 ? Colors.primaryButtonColor : Colors.boxBackground,
                        paddingVertical: heightToDp(1),
                        paddingHorizontal: widthToDp(4),
                        borderRadius: 14
                      }]}>
                      <Text style={[{
                        color: item.optionName == selectedModalOption2 ? Colors.boxBackground : Colors.primaryTextColor,
                        fontSize: scale(14)
                      },
                      Fonts.Nunito_400Regular
                      ]}>
                        {item.optionName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            <View style={[{
              backgroundColor: Colors.boxBackground,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: heightToDp(2),
              borderRadius: 14
            }]}>
              <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
                <Text style={[{
                  color: 'rgba(60, 60, 67, 0.6)',
                  fontSize: scale(12),
                  paddingTop: heightToDp(1.5),
                  paddingLeft: widthToDp(3),
                  paddingBottom: heightToDp(1),
                  backgroundColor: Colors.boxBackground,
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 14,
                  width: '100%'
                },
                Fonts.Nunito_400Regular
                ]}>
                  TIMELINE
                </Text>
                <View style={[GlobalStyles.columnFlexstart, { width: '100%' }]}>
                  {timelineData.map((item, index) => (
                    <Pressable key={index}
                      style={({ pressed }) => [GlobalStyles.rowSpaceBetween, {
                        backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                        width: '100%',
                        paddingHorizontal: widthToDp(4),
                        paddingVertical: heightToDp(1),
                        borderBottomWidth: index == timelineData.length - 1 ? 0 : 1,
                        borderBottomColor: Colors.primaryinactive
                      }]}>
                      <View style={GlobalStyles.rowFlexstart}>
                        <Image resizeMode="contain" source={item.icon} style={styles.icon} />
                        <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                          <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.time, Fonts.Nunito_600SemiBold]}>
                            {item.time}
                          </Text>
                        </View>
                      </View>
                      <VectorIcons groupName="AntDesign" iconName="right" iconsize={widthToDp(4)} iconstyle={{ color: Colors.textInputBorder }} />
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[GlobalStyles.columnFlexstart, { width: '100%' }]}>
                <Text style={[{
                  color: 'rgba(60, 60, 67, 0.6)',
                  fontSize: scale(12),
                  paddingTop: heightToDp(1.5),
                  paddingLeft: widthToDp(3),
                  paddingBottom: heightToDp(1),
                  backgroundColor: Colors.boxBackground,
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 14,
                  width: '100%'
                },
                Fonts.Nunito_400Regular
                ]}>
                  MEDICATIONS
                </Text>
                <View style={[GlobalStyles.columnFlexstart, { width: '100%' }]}>
                  {medicationData.map((item, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [GlobalStyles.rowFlexstart, {
                        backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                        width: '100%',
                        paddingHorizontal: widthToDp(4),
                        paddingVertical: heightToDp(1),
                        borderBottomWidth: index == medicationData.length - 1 ? 0 : 1,
                        borderBottomColor: Colors.primaryinactive,
                        borderBottomLeftRadius: index == medicationData.length - 1 ? 15 : 0,
                        borderBottomRightRadius: index == medicationData.length - 1 ? 15 : 0
                      }]}>
                      <Image resizeMode="contain" source={item.icon} style={styles.icon} />
                      <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.time, Fonts.Nunito_600SemiBold]}>
                          {item.dosage}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
      <Confirmation
        modalHeading={"Confirmation"}
        modalText={`Are you sure you want to cancel the Appointment ${cancellingDetails.type == "Doctor" ? "with Dr." : "at"} ${cancellingDetails.name} on ${moment(cancellingDetails.date).format('D MMM YYYY')} at ${moment(cancellingDetails.time, 'HH:mm').format('hh:mm A')} ? `}
        transparent={true}
        visible={showConfirmationModal}
        setShowConfirmationModal={setShowConfirmationModal}
        action={async (text, reason) => { await cancelAppointment(text, reason) }}
      />
      <Spinner
        visible={loading}
        color={Colors.primaryButtonColor}
        customIndicator={<Loader />}
        textStyle={{ color: Colors.primaryButtonColor }}
      />
      <Footer activeScreen={"Home"} />
      <WarningModal showModal={showModal} onPress={handleModalResponse} setShowModal={setShowModal} warningText={warningText} extrabuttons={valid} />
      <NoShowWarningModal noshowModal={noshowModal} onPress={handleModalResponse} setNoshowModal={setNoshowModal} warningText={warningText} extrabuttons={valid} textChanger={textChanger} />
      <ToastMessage visible={toastVisible} text={toastMessageText} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  patientContainer: {
    flexDirection: 'row',
    width: '100%'
  },
  heading: [
    GlobalStyles.mediumText,
    Fonts.Nunito_700Bold,
    {
      color: Colors.primaryButtonColor,
    }
  ],
  profileImage: {
    marginTop: heightToDp(1),
    height: scale(54),
    width: scale(54),
    borderColor: Colors.primaryButtonColor,
    borderWidth: 3,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: heightToDp(0.5)
  },
  profileName: {
    marginBottom: heightToDp(1),
    color: Colors.primaryTextColor,
    textAlign: "center",
    fontSize: scale(12),
    width: '85%'
  },
  addpatientContainer: {
    backgroundColor: Colors.textInputBorder,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: scale(54),
    width: scale(54),
    marginLeft: widthToDp(2)
  },
  addpatientText: {
    textAlign: 'center',
    fontSize: scale(12),
    color: Colors.primaryTextColor,
    flexWrap: 'wrap'
  },
  listContainer: {
    alignItems: 'center', alignContent: 'center', justifyContent: 'center',
    width: widthToDp(15),
    marginHorizontal: widthToDp(1)
  },
  listItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: "center"
  },
  listItemround: {
    borderWidth: 2,
    borderRadius: 50,
    overflow: "hidden"
  },
  headingDesc: {
    marginTop: heightToDp(1),
    flexWrap: 'wrap'
  },
  contentContainer: {
    padding: 0,
    margin: 0,
    paddingLeft: widthToDp(2),
    marginHorizontal: widthToDp(3)
  },
  appointmentContainer: {
    backgroundColor: Colors.primaryButtonColor,
    width: '100%',
    borderRadius: 14
  },
  sliceImage: {
    width: '100%',
    marginTop: heightToDp(2)
  },
  addFileImage: {
    height: heightToDp(18),
    marginVertical: heightToDp(4),
    width: '100%'
  },
  appointmentHeading: {
    color: Colors.boxBackground,
    width: "95%",
    flexWrap: 'wrap'
  },
  Button: {
    height: heightToDp(5),
    width: '100%',
    backgroundColor: Colors.boxBackground
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-around",
    marginTop: heightToDp(2)
  },
  rowCenter: {
    flexDirection: 'row',
    marginTop: heightToDp(2),
    alignItems: 'center'
  },
  button: {
    height: heightToDp(5),
    width: '100%',
    backgroundColor: Colors.primaryButtonColor,
    borderColor: Colors.boxBackground
  },
  connectContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: heightToDp(2),
    backgroundColor: Colors.defaultBackground,
    borderRadius: 14
  },
  connectButton: {
    backgroundColor: Colors.lightblue,
    width: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: heightToDp(2),
    borderRadius: 14,
    marginTop: heightToDp(2),
    marginBottom: heightToDp(2)
  },
  image: {
    height: heightToDp(5),
    width: widthToDp(50),
    marginTop: heightToDp(2)
  },
  time: {
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: scale(12),
    marginTop: heightToDp(0.5)
  },
  icon: {
    width: widthToDp(8),
    height: heightToDp(5),
    marginRight: widthToDp(2)
  },
  sliceImage_new: {
    position: 'absolute',
    height: heightToDp(15),
    right: -54,
    bottom: -25,
  },
  BluetriangleImage: {
    position: 'absolute',
    height: heightToDp(15),
    left: 67,
    top: -25,
  },
  BluesecondarysliceImage: {
    position: 'absolute',
    left: -13,
    bottom: -70,
    transform: [{ rotate: '300deg' }],
    width: widthToDp(27),
    height: heightToDp(27)
  },
  diseaseContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: "space-between",
  },
  BoxRight: {
    width: "100%",
  },
  BoxLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  doctorImage: {
    width: widthToDp(11),
    height: widthToDp(11),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  stage: {
    backgroundColor: "white",
    width: widthToDp(22),
    height: heightToDp(4),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: widthToDp(2),
    borderRadius: 14,
    marginTop: heightToDp(1)
  },
  cycleBtn: {
    backgroundColor: `${Colors.defaultBackground}55`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: widthToDp(2),
    borderRadius: 14,
    marginVertical: heightToDp(1)
  }


})

export default Dashboard;
