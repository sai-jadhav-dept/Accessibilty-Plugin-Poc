import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, Keyboard, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Linking, Modal, KeyboardAvoidingView, BackHandler, ToastAndroid } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Logo from '../components/Logo';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import CommonButton from '../components/CommonButton';
import Colors from '../utils/Colors';
import { Dropdown } from 'react-native-element-dropdown';
import countrycode from '../assets/mdm/countrycode.json'
import Global from './Global';
import { useNavigation } from '@react-navigation/native';
import RNFS from "react-native-fs";
import VersionCheck from "react-native-version-check";
import WarningModal from '../components/WarningModal';
import { scale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import VectorIcons from '../components/VectorIcons';
import { ExecuteDBQuery } from '../utils/ExecuteDBQuery';
import ToastMessage from '../components/ToastMessage';
import { useAccessibility } from '../accessibility/AccessibilityContext';

const HEIGHT = Dimensions.get('window').height;
const rnBiometrics = new ReactNativeBiometrics()

const Login = () => {
    const navigation = useNavigation();
    const { fontScale, letterSpacing } = useAccessibility();

    const validPhoneNo = /^(?!.*(\d)\1{5})[6-9]\d{9}$/
    const validemail = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})$/;
    let [selectedCountryCode, setSelectedCountryCode] = useState('IN +91');
    let [selectedCode, setSelectedCode] = useState('+91');
    let [mobileNumber, setMobileNumber] = useState('');
    let [emailAddrress, setEmailAddrress] = useState('');
    let [displayBottomButton, setDisplayBottomButton] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [biometricButton, setBiometricButton] = useState(false);
    const [update, setUpdate] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessageText, setToastMessageText] = useState("");

    useEffect(() => {
        dashboardRefreshere();
        clearCache();
    }, []);

    const successSelectQueryCallback = (txObj, resultSet, resolve, reject) => {
        if (resultSet.rows.length > 0) {
            Global.Biometric_Id = resultSet.rows.item(0).Biometric_Id;
            Global.Biometric_UserId = resultSet.rows.item(0).UserID;
            Global.userID = resultSet.rows.item(0).UserID;
            if (Global.Biometric_Id != '') {
                setBiometricButton(true);
            }
        } else {
            Global.Biometric_Id = '';
        }
        resolve(true);
    };

    const failureCallback = (txObj, error, resolve, reject) => {
        console.log('Table Update Error : ', txObj.message);
        resolve(false);
    };

    const dashboardRefreshere = async () => {
        await ExecuteDBQuery('SELECT * FROM BioMetricTable', successSelectQueryCallback, failureCallback);
    }

    function checkbiometric() {
        rnBiometrics.isSensorAvailable().then((resultObject) => {
            const { available, biometryType } = resultObject
            if (available && biometryType === BiometryTypes.TouchID) { console.log('TouchID is supported') }
            else if (available && biometryType === BiometryTypes.FaceID) { console.log('FaceID is supported') }
            else if (available && biometryType === BiometryTypes.Biometrics) { console.log('Biometrics is supported') }
            else {
                console.log('Biometrics not supported')
            }
        })
        rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' }).then((resultObject) => {
            const { success } = resultObject
            if (success) {
                console.log('successful biometrics provided')
                validateBiometricLogin()
            }
            else {
                console.log('user cancelled biometric prompt')
            }
        }).catch(() => {
            console.log('biometrics failed')
        }
        )
    }

    const validateLogin = async () => {
        try {
            const body = {
                "category": "HOPE",
                "inputType": Global.inputType,
                "inputValue": Global.inputType == "Mobile" ? Global.selectedCountryCode + Global.inputValue : Global.inputValue,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await triggerApiCall('login/generateotp', body);
            setLoading(false);
            navigation.navigate("VerifyOTP", { requestId: response.requestId });
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

    const validateBiometricLogin = async () => {
        try {
            const body = {
                "source": "Biometric",
                "category": "HOPE",
                "userId": Global.userID,
                "hashKey": Global.Biometric_Id,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await triggerApiCall('login/validateuser', body);
            setLoading(false);
            if (response.userData.userType == "Caregiver") {
                Global.patientList = response.patientData;
                Global.patientID = response.patientData[0]?.id;
            } else if (response.userData.userType == 'Patient') {
                Global.patientID = response.patientData[0].id;
                Global.patientUserId = response.patientData[0].patientUserId;
            }
            Global.userID = response.userData.userId;
            if (Global.Biometric_UserId != response.userData.userId) {
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
            navigation.navigate("Dashboard");
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
            removeBiometricsData();
        }
    }

    const successUpdateQueryCallback = (txObj, resultSet, resolve, reject) => {
        if (resultSet.rowsAffected == '1') {
            Global.Biometric_Id = '';
            setBiometricButton(false);
        }
        resolve(true);
    };

    const removeBiometricsData = async () => {
        let updateQuery = "Update BioMetricTable Set Biometric_Id ='', UserID = ''";
        await ExecuteDBQuery(updateQuery, successUpdateQueryCallback, failureCallback);
    }

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }

    const validUser = async () => {
        if (emailAddrress.trim() == "" && mobileNumber.trim() == "") {
            DisplayError("Please enter valid mobile number or email address")
        }
        else if (mobileNumber.trim() == "") {
            if (validemail.test(emailAddrress.trim())) {
                Global.inputType = 'Email';
                Global.inputValue = emailAddrress.trim();
                Global.selectedCountryCode = '';
                validateLogin();
            }
            else {
                DisplayError("Please enter valid email address");
            }
        } else if (emailAddrress.trim() == "") {
            if (validPhoneNo.test(mobileNumber)) {
                Global.inputType = 'Mobile';
                Global.selectedCountryCode = selectedCode;
                Global.inputValue = mobileNumber;
                await validateLogin();
            }
            else {
                DisplayError("Please enter valid Mobile Number.");
            }
        }
    }

    const clearCache = () => {
        const cacheDirectory = RNFS.CachesDirectoryPath;
        RNFS.unlink(cacheDirectory).then(() => {
            console.log(`Cache directory deleted at ${cacheDirectory}`);
        }).catch(error => { console.error(error); });
    }

    const CheckVersion = () => {
        let version = DeviceInfo.getVersion();
        if (Global.OS == 'android') {
            clearCache();
        }
        VersionCheck.getLatestVersion()
            .then(latestVersion => {
                if (version !== "1.0") {
                    let versionNumbers = version.split(".");
                    let latestVersionNumbers = latestVersion.split(".");
                    for (let i = 0; i < versionNumbers.length; i++) {
                        versionNumbers[i] = parseInt(versionNumbers[i]);
                        latestVersionNumbers[i] = parseInt(latestVersionNumbers[i]);
                    }

                    if (versionNumbers[0] >= latestVersionNumbers[0]) {
                        if (versionNumbers[1] >= latestVersionNumbers[1]) {
                            if (versionNumbers[2] >= latestVersionNumbers[2]) {
                                //local version is greater or equal to store version
                                setUpdate(false);
                                console.log("local version is greater or equal to store version", version, latestVersion);
                            } else { //minor
                                if (versionNumbers[0] == latestVersionNumbers[0] && versionNumbers[1] == latestVersionNumbers[1]) {
                                    console.log("minor version change", version, latestVersion);
                                    setUpdate(true);
                                } else {
                                    //local version is greater or equal to store version
                                    setUpdate(false);
                                    console.log("local version is greater or equal to store version", version, latestVersion);
                                }
                            }
                        } else { //secondary major
                            if (versionNumbers[0] == latestVersionNumbers[0]) {
                                console.log("secondary major version change", version, latestVersion);
                                setUpdate(true);
                            } else {
                                //local version is greater or equal to store version
                                setUpdate(false);
                                console.log("local version is greater or equal to store version", version, latestVersion);
                            }
                        }
                    } else { //primary major
                        console.log("primary major version change", version, latestVersion);
                        setUpdate(true);
                    }
                } else {
                    //latestVersion is undefined
                    console.log("latest version is undefined", version, latestVersion);
                    setUpdate(false);
                }
            }).catch(e => {
                DisplayError('Something went wrong, please check your Internet connection');
            });
    }

    useEffect(() => {
        // CheckVersion();
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (() => {
            setDisplayBottomButton(false);
        }));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, []);

    const handleTermsLink = () => {
        if (Linking.canOpenURL("https://www.hopetheapp.com/termsandconditions")) {
            Linking.openURL("https://www.hopetheapp.com/termsandconditions");
        } else {
            DisplayError("Cannot open the website. Linking is not supported on this device.");
        }
    }

    const handlePrivacyPolicyLink = () => {
        if (Linking.canOpenURL("https://www.hopetheapp.com/privacypolicy")) {
            Linking.openURL("https://www.hopetheapp.com/privacypolicy");
        } else {
            DisplayError("Cannot open the website. Linking is not supported on this device.");
        }
    }

    let backPressed = 0;

    useEffect(() => {
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

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <KeyboardAvoidingView behavior={Global.OS == "ios" && 'position'} >
                    <ScrollView keyboardShouldPersistTaps={"handled"}>
                        <View>
                            <Logo />
                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold, { fontSize: GlobalStyles.extrasmallText.fontSize * fontScale, letterSpacing }]}>{Global.languageData.Transparency}</Text>
                            <Image resizeMode='contain' source={require("../assets/images/user.png")} style={styles.usericon} />
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { fontSize: GlobalStyles.extralargeText.fontSize * fontScale, letterSpacing }]}>{Global.languageData.login_heading}</Text>
                        </View>
                        <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                        <View style={GlobalStyles.fixedTopSpacing}>
                            <View style={[GlobalStyles.loginInputContainer, GlobalStyles.inputBoxShadow, styles.inputTextArea]}>
                                <View style={{ width: '35%', flexDirection: 'column', backgroundColor: Colors.boxBackground, borderRadius: 14, marginLeft: widthToDp(1), marginRight: widthToDp(1), marginVertical: heightToDp(1) }}>
                                    <Dropdown
                                        style={[styles.dropdown, Fonts.Nunito_600SemiBold]}
                                        placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(scale(18)) }]}
                                        iconStyle={styles.iconStyle}
                                        data={countrycode}
                                        disable={true}
                                        autoScroll={false}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="label"
                                        value={selectedCountryCode}
                                        onChange={item => {
                                            setSelectedCountryCode(item.label);
                                            setSelectedCode(item.value);
                                        }}
                                    />
                                </View>
                                <View style={{ width: '65%', flexDirection: 'column', borderRadius: 14 }}>
                                    <TextInput
                                        keyboardType='numeric'
                                        maxLength={10}
                                        style={[GlobalStyles.loginMobileTextInput, Fonts.Nunito_600SemiBold]}
                                        placeholder={Global.languageData.Mobile_Number}
                                        placeholderTextColor={Colors.placeholderTextColor}
                                        onChangeText={(text) => {
                                            setMobileNumber(text);
                                            setEmailAddrress("")
                                            if (text.length == 10) Keyboard.dismiss();
                                        }}
                                        value={mobileNumber}
                                    />
                                </View>
                            </View>
                            <Image resizeMode='contain' source={require("../assets/vectors/or_line.png")} style={styles.lineimage} />
                            <TextInput
                                autoCapitalize="none"
                                style={[
                                    GlobalStyles.loginEmailTextInput,
                                    GlobalStyles.inputBoxShadow,
                                    Fonts.Nunito_600SemiBold,
                                    { borderWidth: 0 }
                                ]}
                                placeholder={Global.languageData.Email_Address}
                                placeholderTextColor={Colors.placeholderTextColor}
                                onChangeText={(text) => {
                                    setEmailAddrress(text);
                                    setMobileNumber("")
                                }}
                                value={emailAddrress}
                            />
                        </View>
                        <View style={{ marginTop: heightToDp(3) }}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.loginAgreeTextAlignment, { fontSize: GlobalStyles.normalText.fontSize * fontScale, letterSpacing }]}>{Global.languageData.login_condition}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable onPress={() => handleTermsLink()} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold,
                                    {
                                        marginTop: heightToDp(0.01),
                                        color: Colors.primaryButtonColor,
                                        fontSize: GlobalStyles.normalText.fontSize * fontScale,
                                        letterSpacing
                                    }]}>
                                        {Global.languageData.Terms}
                                    </Text>
                                </Pressable>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold,
                                {
                                    marginTop: heightToDp(0.01),
                                    marginHorizontal: widthToDp(1),
                                    fontSize: GlobalStyles.normalText.fontSize * fontScale,
                                    letterSpacing
                                }]}>
                                    {Global.languageData.and}
                                </Text>
                                <Pressable onPress={() => handlePrivacyPolicyLink()} style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold,
                                    {
                                        marginTop: heightToDp(0.01),
                                        color: Colors.primaryButtonColor,
                                        fontSize: GlobalStyles.normalText.fontSize * fontScale,
                                        letterSpacing
                                    }]}>
                                        {Global.languageData.Privacy_Policy}
                                    </Text>
                                </Pressable>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold,
                                {
                                    marginTop: heightToDp(0.01),
                                    marginHorizontal: widthToDp(0),
                                    marginLeft: - widthToDp(0.5)
                                }
                                ]}>.</Text>
                            </View>
                            {biometricButton &&
                                <View style={styles.biometricBox}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (Global.Biometric_Id != '') {
                                                setBiometricButton(true);
                                                checkbiometric();
                                            }
                                        }}
                                        style={[{
                                            borderWidth: 1,
                                            padding: 10,
                                            alignItems: "center",
                                            marginVertical: heightToDp(3),
                                            color: Colors.primaryTextColor,
                                            width: '23%',
                                            borderColor: Colors.placeholderTextColor,
                                            borderRadius: 14,
                                            backgroundColor: Colors.defaultBackground,
                                        }, GlobalStyles.inputBoxShadow]}
                                    >
                                        <VectorIcons
                                            groupName={Global.OS == 'android' ? "Ionicons" : "Entypo"}
                                            iconName={Global.OS == 'android' ? "finger-print" : "user"}
                                            iconsize={widthToDp(10)}
                                        />
                                    </TouchableOpacity>
                                </View>
                            }

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
            {
                displayBottomButton &&
                <View style={{ marginHorizontal: widthToDp(4) }}>
                    <CommonButton
                        buttonText={Global.languageData.Login}
                        onPress={validUser}
                        extraStyles={GlobalStyles.fixbottomcommonButton}
                    />
                </View>
            }
            <Modal visible={false} transparent={true} animationType={'fade'} >
                <View style={styles.backgroundModal}>
                    <View style={[styles.updateModal, { width: '89%', backgroundColor: Colors.defaultBackground, borderRadius: 14, padding: widthToDp(5) }]}>
                        <View style={{ alignItems: 'center' }}>
                            <VectorIcons groupName={"Feather"} iconName={"alert-triangle"} iconsize={widthToDp(10)} iconstyle={{ color: Colors.red }} />
                            <Text style={[Fonts.Nunito_700Bold, GlobalStyles.mediumText, { paddingVertical: scale(10) }]}>Update Required</Text>
                            <Text style={[Fonts.Nunito_700Bold, GlobalStyles.normalText, { flexWrap: 'wrap', textAlign: 'center' }]}>There is a new version of this app. Kindly update your app to enjoy uninterrupted services.</Text>
                            <CommonButton
                                buttonText={"Update Now"}
                                onPress={() => {
                                    if (Global.OS == 'android') {
                                        clearCache();
                                    }
                                    // Linking.openURL(Global.OS === "android" ? "" : "");
                                }}
                                extraStyles={{ marginTop: heightToDp(4) }}
                            />
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
            <ToastMessage visible={toastVisible} text={toastMessageText} />
        </SafeAreaView>
    );
}
export default Login;

const styles = StyleSheet.create({
    dropdown: {
        fontSize: scale(50),
        height: heightToDp(6.5),
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        paddingHorizontal: widthToDp(2),
    },
    iconStyle: {
        width: widthToDp(4),
        height: heightToDp(2),
    },
    inputTextArea: {
        borderWidth: 0,
        marginTop: HEIGHT <= 550 ? heightToDp(-3) : heightToDp(3),
    },
    usericon: {
        marginTop: 0,
        width: widthToDp(20),
        height: heightToDp(15),
    },
    lineimage: {
        height: heightToDp(10),
        width: '100%',
        alignSelf: 'center',
    },
    loginAgreeTextAlignment: {
        lineHeight: widthToDp(5)
    },
    biometricBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundModal: {
        backgroundColor: Colors.modalBackground,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateModal: {
        backgroundColor: '#fff',
        borderRadius: 14,
        width: '95%',
    }
});