import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Keyboard, StyleSheet, SafeAreaView, Dimensions, BackHandler } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Logo from '../components/Logo';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import OTPInputView from '@twotalltotems/react-native-otp-input';
const { height } = Dimensions.get('window');
import BackgroundTimer from 'react-native-background-timer';
import { useNavigation } from '@react-navigation/native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import Global from './Global';
import { scale } from 'react-native-size-matters'
import FieldLabel from '../components/FieldLabel';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { ExecuteDBQuery } from '../utils/ExecuteDBQuery';

const VerifyOTP = ({ route }) => {
    const navigation = useNavigation();
    let [counter, setCounter] = useState(60);
    let [otp, setOtp] = useState('');
    const [requestId, setRequestId] = useState(0);
    let [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    let [displayBottomButton, setDisplayBottomButton] = useState(true);

    const rnBiometrics = new ReactNativeBiometrics()

    const successCallback = (txObj, resultSet, resolve, reject) => {
        resolve(true);
    };

    const failureCallback = (txObj, error, resolve, reject) => {
        console.log('Table Update Error : ', txObj.message);
        resolve(false);
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        setRequestId(route.params.requestId);
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (() => {
            setDisplayBottomButton(false);
        }));
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            backHandler.remove();
        }
    }, []);

    useEffect(() => {
        BackgroundTimer.runBackgroundTimer(() => {
            if (counter > 0) {
                setCounter(counter - 1);
            }
        },
            1000);
        return () => {
            BackgroundTimer.stopBackgroundTimer();
        }
    }, [counter])

    const InsertData = async (Device_Id) => {
        let updateQuery = "Update BioMetricTable Set Biometric_Id ='" + Device_Id + "', UserID = '" + Global.userID + "'";
        await ExecuteDBQuery(updateQuery, successCallback, failureCallback);
    }

    const checkbiometric = () => {
        let hashKey = '';
        const time = moment()
        DeviceInfo.getUniqueId().then((uniqueId) => {
            let mobile_no = Global.userInfo.mobileNo ? Global.userInfo.mobileNo : Global.inputValue.substring(4, 14);
            hashKey = mobile_no + time.unix() + uniqueId
        })
        rnBiometrics.isSensorAvailable().then((resultObject) => {
            const { available, biometryType } = resultObject
            if (available && biometryType === BiometryTypes.TouchID) { console.log('TouchID is supported') }
            else if (available && biometryType === BiometryTypes.FaceID) { console.log('FaceID is supported') }
            else if (available && biometryType === BiometryTypes.Biometrics) { console.log('Biometrics is supported') }
            else {
                DisplayError('Biometric is not supported on your device');
            }
        });
        rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' }).then(async (resultObject) => {
            const { success } = resultObject
            if (success) {
                try {
                    const body = {
                        "source": "Biometrc",
                        "userId": Global.userID,
                        "hashKey": hashKey,
                        "action": "Enable",
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    }
                    setLoading(true);
                    await apiCall('registration/updatebiometric', body);
                    Global.Biometric_UserId = Global.userID;
                    Global.Biometric_Id = hashKey;
                    setLoading(false);
                    InsertData(hashKey);
                    navigation.navigate("Dashboard");
                } catch (error) {
                    setLoading(false);
                    navigation.navigate("Dashboard");
                }
            }
            else {
                try {
                    const body = {
                        "source": "Biometrc",
                        "userId": Global.userID,
                        "hashKey": "",
                        "action": "Disable",
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    }
                    setLoading(true);
                    await apiCall('registration/updatebiometric', body);
                    Global.Biometric_UserId = 0;
                    Global.Biometric_Id = '';
                    setLoading(false);
                    InsertData('');
                    navigation.navigate("Dashboard");
                } catch (e) {
                    setLoading(false);
                    navigation.navigate("Dashboard");
                }
            }
        }).catch(() => {
            navigation.navigate("Dashboard");
        });
    }

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }
    const resendOtpApi = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            try {
                const body = {
                    "category": "HOPE",
                    "requestId": requestId.toString(),
                    "inputType": Global.inputType,
                    "inputValue": Global.inputType == "Mobile" ? Global.selectedCountryCode + Global.inputValue : Global.inputValue,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                setLoading(true);
                const response = await apiCall('login/resendotp', body);
                setCounter(60);
                setLoading(false);
                setRequestId(response.requestId);
                setOtp("");
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    }

    const registerUser = async (useriddata) => {
        try {
            const body = {
                "header": {
                    "authToken": "authenticationtoken"
                },
                "body": {
                    "token": Global.fcmToken,
                    "userId": useriddata.toString(),
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": "android"
                }
            }
            await apiCall('pushnotifications/registeruser', body)
        } catch (error) {
            console.log(error);
        }
    }

    const regexOtp = /^\d{6}$/;
    const validateOTP = async () => {
        if (regexOtp.test(otp)) {
            try {
                const body = {
                    "requestId": requestId.toString(),
                    "category": "HOPE",
                    "inputType": Global.inputType,
                    "inputValue": Global.inputType == "Mobile" ? Global.selectedCountryCode + Global.inputValue : Global.inputValue,
                    "otp": otp,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                const response = await apiCall('login/verifyuserotp', body);
                //register user
                if (response.userData.userType === "Patient") {
                    let userIddata = response.userData.userId
                    await registerUser(userIddata);
                    Global.userInfo.Address = response.userData.address
                }
                if (!response.userData.userId) {
                    setLoading(false);
                    navigation.navigate("SelectUserType");
                }
                else {
                    let userIddata = response.userData.userId
                    await registerUser(userIddata);
                    setLoading(false);
                    if (response.userData.userType == "Caregiver") {
                        Global.patientList = response.patientData;
                        Global.patientID = response.patientData[0]?.id;
                    } else if (response.userData.userType == 'Patient') {
                        Global.patientID = response.patientData[0].id;
                        Global.patientUserId = response.patientData[0].patientUserId;
                    }
                    Global.userID = response.userData.userId;
                    if (Global.userID != Global.Biometric_UserId) {
                        Global.Biometric_Id = '';
                    }
                    Global.userInfo.firstName = response.userData.firstName;
                    Global.userInfo.lastName = response.userData.lastName;
                    Global.userInfo.pincode = response.userData.pincode;
                    Global.userInfo.gender = response.userData.gender;
                    Global.userInfo.DOB = response.userData.dob;
                    Global.userInfo.mobileNo = response.userData.mobileNumber;
                    Global.userInfo.email = response.userData.emailAddress;
                    Global.userInfo.image = response.userData.profilePicturePath;
                    Global.userType = response.userData.userType;

                    var userInfo = { userID: Global.userID, userName: Global.userInfo.firstName + " " + Global.userInfo.lastName };
                    Global.zim.login(userInfo, '')
                        .then(function () {
                            // Login successful.
                            console.log("zim login success");
                        })
                        .catch(function (err) {
                            // Login failed.
                            console.log("zim login failed", err);
                        });

                    if (Global.Biometric_Id != response.userData.biometricsId) {
                        if (response.userData.biometricsId != '') {
                            checkbiometric();
                        } else {
                            try {
                                Global.Biometric_UserId = 0;
                                Global.Biometric_Id = '';
                                InsertData('');
                                navigation.navigate("Dashboard");
                            } catch (e) {
                                navigation.navigate("Dashboard");
                            }
                        }
                    } else {
                        await getNoShowAppointmentdata();
                    }
                }
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
                setOtp('');
            }
        }
        else {
            if (!isNaN(otp)) {
                setError(false)
            }
            setError(true)
        }
    }

    const getNoShowAppointmentdata = async () => {
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
            if (response.appointmentData.length == 0) {
                navigation.navigate("Dashboard");
            } else {
                navigation.navigate("NoShowAppointmentScreen");
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={[GlobalStyles.mainBox]}>
                <Logo />
                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>Bring Transparency in your Treatment.</Text>
                <ScrollView style={{ maxHeight: heightToDp(90) }}>
                    <View style={{ justifyContent: "flex-start", flex: 1, marginTop: heightToDp(10) }}>
                        <FieldLabel TextType={"ExtraLarge"} text={"Enter verification code"} />
                        <Text style={[Fonts.Nunito_600SemiBold, styles.otpSecondaryText]}>
                            We have sent a 6-digit verification code to your{` ${Global.inputType} `}
                            <Text style={[Fonts.Nunito_700Bold, styles.otpSecondaryText]}>
                                {Global.inputType === 'Mobile'
                                    ? Global.inputValue.replace(/\d(?=\d{2})/g, '*')
                                    : Global.inputValue.replace(
                                        /^(.{1,3})([^@]*)(@.*)$/,
                                        (_, firstPart, middlePart, lastPart) =>
                                            firstPart + '*'.repeat(middlePart.length) + lastPart
                                    )}
                            </Text>
                        </Text>
                        <View style={{ width: '100%', justifyContent: "flex-start", alignItems: "flex-start" }}>
                            <Pressable
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                                onPress={() => navigation.navigate("Login")}>
                                <Text style={[GlobalStyles.buttonsmallText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>Change</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{ height: heightToDp(15), marginTop: heightToDp(8) }}>
                        <View style={{ flex: 1 }}>
                            <OTPInputView
                                style={[GlobalStyles.normalText, styles.inputContainer]}
                                autoFocusOnLoad
                                pinCount={6}
                                code={otp}
                                onCodeChanged={val => {
                                    setOtp(val);
                                    if (val.length == 6) {
                                        setError(false);
                                    }
                                }}
                                keyboardType={'number-pad'}
                                codeInputFieldStyle={[GlobalStyles.largeText, { height: height > 540 ? heightToDp(8) : heightToDp(10), width: widthToDp(13), borderRadius: 14, backgroundColor: Colors.defaultBackground }, GlobalStyles.inputBoxShadow]}
                                editable={true}>
                            </OTPInputView>
                        </View>
                        <Text style={[Fonts.Nunito_600SemiBold, { color: error ? Colors.red : Colors.defaultBackground, fontSize: responsiveFont(scale(14)) }]}>*Please enter valid OTP</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: widthToDp(2), flex: 1, marginTop: heightToDp(2) }}>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Pressable
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                                disabled={counter > 0 ? true : false}
                                onPress={async () => { await resendOtpApi(); }}>
                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { color: counter > 0 ? Colors.primaryinactive : Colors.primaryButtonColor }]}>Resend OTP</Text>
                            </Pressable>
                            <Text style={[Fonts.Nunito_700Bold, counter > 0 ? GlobalStyles.buttonsmallText : [GlobalStyles.smallText, { color: Colors.primaryinactive }]]}>
                                {Math.floor(counter / 60)}:{counter % 60 < 10 ? "0" + counter % 60 : counter % 60}
                            </Text>
                        </View>
                    </View>
                    <View style={{ height: heightToDp(21), justifyContent: "flex-end" }}>
                        {
                            !displayBottomButton &&
                            <CommonButton
                                buttonText="Verify"
                                onPress={async () => { await validateOTP(); }}
                                extraStyles={[GlobalStyles.fixbottomcommonButton]}
                            />
                        }
                    </View>
                </ScrollView>
                {
                    displayBottomButton &&
                    <CommonButton
                        buttonText="Verify"
                        onPress={async () => { await validateOTP(); }}
                        extraStyles={[GlobalStyles.fixbottomcommonButton]}
                    />
                }
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </SafeAreaView>
    );
}
export default VerifyOTP;

const styles = StyleSheet.create({
    otpSecondaryText: {
        paddingTop: heightToDp(1),
        fontSize: scale(14),
        color: Colors.primaryTextColor,
        lineHeight: heightToDp(3),
        marginTop: heightToDp(2),
    }
});
