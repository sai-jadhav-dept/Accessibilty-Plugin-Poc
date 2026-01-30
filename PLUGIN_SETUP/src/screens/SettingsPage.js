import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Pressable, ScrollView, Modal, Linking } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Global from './Global';
import Fonts from '../utils/Fonts';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../utils/Colors';
import GeneralSettings from "../assets/mdm/GeneralSettings.json"
import { scale } from 'react-native-size-matters';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import moment from 'moment/moment';
import DeviceInfo from 'react-native-device-info';
import CommonButton from '../components/CommonButton';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import Confirmation from '../components/Confirmation';
import { PERMISSIONS } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Permission, uploadFileToS3, uploadProfilePicture } from '../utils/CommonFunctions';
import ImagePreview from '../components/ImagePreview';
import FastImage from 'react-native-fast-image';
import DisclaimerPopup from '../components/DisclaimerPopup';
import DeactivateUser from '../assets/mdm/DeactivateUser.json';

export default function SettingsPage() {
    const [showModal, setShowModal] = useState(false);
    const [showModalWarning, setShowModalWarning] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const rnBiometrics = new ReactNativeBiometrics()
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState({});
    const [confirmation, setConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [biometricStatus, setBiometricStatus] = useState(Global.Biometric_Id.length > 0 ? true : false);
    const [showOptionDropdown, setShowOptionDropdown] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageResponse, setImageResponse] = useState("");
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const AccountSettings = [
        {
            "id": 1,
            "SettingTitle": "Profile",
            "IconGroup": "FontAwesome",
            "IconName": "user",
            "isActive": false
        },
        {
            "id": 2,
            "SettingTitle": Global.OS == 'android' ? "Fingerprint" : "Face ID",
            "IconGroup": Global.OS == 'android' ? "MaterialCommunityIcons" : "Entypo",
            "IconName": Global.OS == 'android' ? "fingerprint" : "user",
            "isActive": false
        }
    ]

    useEffect(() => {
        GetUser();
    }, [])

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

    const GetUser = async () => {
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
            const response = await triggerApiCall('registration/getuser', body);
            setUserInfo(response.userInfo);
            if (response.userInfo.profilePicturePath !== "") {
                setImageUrl(response.userInfo.profilePicturePath);
                Global.userInfo.image = response.userInfo.profilePicturePath;
            }
            setLoading(false);
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const confirmationSignOut = (action) => {
        if (action == 'Yes') {
            onLogoutClick();
        } else {
            setConfirmation(false);
        }
    }

    const Imageconifrmation = async (action) => {
        if (action == 'Yes') {
            await imageUploading();
            setImageUrl(imageResponse?.uri);
        } else {
            console.log("User Canceled the image")
        }
    }

    const onLogoutClick = async () => {
        await Global.zim.logout();
        Global.userID = 0;
        Global.clicked = false;
        Global.authExpired = false;
        Global.Biometric_UserId = 0;
        Global.Biometric_Id = '';
        Global.messages = [];
        Global.setMessageRefresh = false;
        Global.notificationChannelIds = {};
        Global.VoiceSearchedData = [];
        Global.patientID = 0;
        Global.inputType = '';
        Global.cachedData = {};
        Global.inputValue = '';
        Global.selectedCountryCode = '';
        Global.diseaseID = 0;
        Global.userType = '';
        Global.userInfo = {
            firstName: '',
            lastName: '',
            email: '',
            countryCode: '',
            mobileNo: '',
            gender: '',
            DOB: '',
            pincode: '',
            image: '',
            Biometric_Enabled: 'Enable',
            Device_Id: ''
        }
        Global.DiseaseData = [];
        Global.Biometric_UserId = '';
        Global.Biometric_Id = '';
        Global.appointmentDetails = [];
        Global.patientList = [];
        Global.patientDiseaseDetials = [];
        Global.MedicineData = [];
        Global.trustedDoctorDetails = [];
        Global.trustedLabDetails = [];
        Global.trustedDoctorDetails = [];
        Global.trustedLabDetails = [];
        Global.NurseappointmentDetails = [];
        Global.selectedCycle = "";
        setConfirmation(false);
        navigation.reset({
            index: 0,
            routes: [
                { name: 'Login' }
            ]
        });
    }

    const navigateToScreen = (Pagename) => {
        navigation.navigate(Pagename, { sourcePage: "SettingsPage" })
    };

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModalWarning(true);
    };

    const successCallback = (txObj, resultSet, resolve, reject) => {
        resolve(true);
    };

    const failureCallback = (txObj, error, resolve, reject) => {
        console.log('Table Update Error : ', txObj.message);
        resolve(false);
    };

    const InsertData = async (Device_Id) => {
        let updateQuery = "Update BioMetricTable Set Biometric_Id ='" + Device_Id + "', UserID = '" + Global.userID + "'";
        await ExecuteDBQuery(updateQuery, successCallback, failureCallback);
    }

    const UpadateBiometric = async () => {
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
            await triggerApiCall('registration/updatebiometric', body);
            Global.Biometric_UserId = 0;
            Global.Biometric_Id = '';
            setLoading(false);
            InsertData('');
            Global.Biometric_Id = "";
            setBiometricStatus(false);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const requestPermission = async (permissionType, platformSpecificName) => {
        return await Permission(
            permissionType,
            "request",
            succescallbackfunction,
            failurecallbackfunction,
            platformSpecificName
        );
    };

    const checkPermission = async (permissionType, platformSpecificName) => {
        return await Permission(
            permissionType,
            "check",
            succescallbackfunction,
            failurecallbackfunction,
            platformSpecificName
        );
    };
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
        })
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
                    await triggerApiCall('registration/updatebiometric', body);
                    Global.Biometric_UserId = Global.userID;
                    Global.Biometric_Id = hashKey;
                    setLoading(false);
                    setBiometricStatus(true);
                    InsertData(hashKey);
                } catch (error) {
                    setLoading(false);
                    DisplayError(error.msg || 'Something went wrong, Please try again');
                }
            }
            else {
                console.log('user cancelled biometric prompt')
            }
        }).catch(() => {
            console.log('biometrics failed')
        });
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

    const handleImageSelection = async (type) => {
        setShowOptionDropdown(false);
        let options = {
            saveToPhotos: true,
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: false,
        };
        if (type === "camera") {
            if (Global.OS === "ios") {
                if (await checkPermission(PERMISSIONS.IOS.CAMERA, "Camera") ||
                    await requestPermission(PERMISSIONS.IOS.CAMERA, "Camera")) {

                    if (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos") ||
                        await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) {
                        takePhoto(options);
                    }
                }
            } else {
                const permissionTypeCapture = Global.androidVersion > 12
                    ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                    : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                if (await checkPermission(PERMISSIONS.ANDROID.CAMERA, "Camera") ||
                    await requestPermission(PERMISSIONS.ANDROID.CAMERA, "Camera")) {

                    if (await checkPermission(permissionTypeCapture, "Photos") ||
                        await requestPermission(permissionTypeCapture, "Photos")) {
                        takePhoto(options);
                    }
                }
            }
        } else {
            if (Global.OS === "ios") {
                if (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos") ||
                    await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) {
                    selectPhoto(options);
                }
            } else {
                const permissionTypeSelect = Global.androidVersion > 12
                    ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                    : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                if (await checkPermission(permissionTypeSelect, "Photos") ||
                    await requestPermission(permissionTypeSelect, "Photos")) {
                    selectPhoto(options);
                }
            }
        }
    }

    const checkImage = (response) => {
        if (response.didCancel || response.errorCode == 'camera_unavailable' || response.errorCode == 'permission' || response.errorCode == 'others') {
            return;
        }
        const size = response.assets[0].fileSize
        const type = response.assets[0].type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSizeInBytes = 10 * 1024 * 1024;

        if (Global.OS === "ios" || (checkFileType(type, allowedTypes) && checkFileSize(size, maxSizeInBytes))) {
            setImageResponse(response.assets[0]);
            setShowImageModal(true);
        } else {
            DisplayError('Please choose a valid image (JPEG or PNG) and ensure it is not larger than 10MB.');
        }
    }

    const takePhoto = (options) => {
        launchCamera(options, response => {
            checkImage(response);
        });
    }

    const selectPhoto = (options) => {
        launchImageLibrary(options, response => {
            checkImage(response);
        });
    }

    const checkFileSize = (fileSize, maxSize) => {
        return fileSize <= maxSize;
    };

    const checkFileType = (fileType, allowedTypes) => {
        return allowedTypes.includes(fileType);
    };

    const imageUploading = async () => {
        try {
            setLoading(true);
            const extension = imageResponse.type.split("/")[1];
            const userType = Global.userType == "Patient" ? "PATIENTS" : "USERS";
            const res = await uploadFileToS3(imageResponse, `/${Global.userID}.` + extension, "PROFILE/" + `${userType}`)
            await uploadProfilePicture(res.body.postResponse.location, Global.userID, "0");
            Global.userInfo.image = imageResponse.uri;
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const handleGeneralSettingIcon = (item) => {
        if (item.SettingTitle == 'Deactivate User') {
            setShowDisclaimer(true);
        } else if (item.SettingTitle != 'Sign-out' && item.SettingTitle != 'Terms & Conditions' && item.SettingTitle != 'Privacy Policy') {
            navigateToScreen(item.Pagename);
        } else if (item.SettingTitle == 'Terms & Conditions') {
            Linking.openURL("https://www.hopetheapp.com/termsandconditions");
        }
        else if (item.SettingTitle == 'Privacy Policy') {
            Linking.openURL("https://www.hopetheapp.com/privacypolicy");
        }
        else {
            setConfirmation(true);
        }
    }

    const handleModalClose = () => {
        setShowOptionDropdown(false);
    }

    const navigateToPaymentConfirmation = async () => {
        setShowDisclaimer(false);
        onLogoutClick();
    };

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={"Settings"}
                    onPress={() => { navigation.replace("Dashboard") }}
                />
                <Pressable onPress={() => handleModalClose()} style={[styles.userimagecontainer]}>
                    <Pressable onPress={() => setShowOptionDropdown((pre) => !pre)} style={[{ justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={{
                            borderRadius: 50,
                            backgroundColor: Colors.primaryButtonColor,
                            borderColor: Colors.primaryButtonColor,
                            height: scale(30),
                            width: scale(30),
                            justifyContent: "center",
                            alignItems: "center",
                            position: 'absolute',
                            zIndex: 100,
                            right: widthToDp(0),
                            top: heightToDp(9)
                        }}>
                            <VectorIcons
                                groupName={"MaterialCommunityIcons"}
                                iconName={'camera-plus-outline'}
                                iconsize={22}
                                iconstyle={{ color: Colors.defaultBackground }}
                            />
                        </View>
                        <View style={styles.userimage} />
                        <FastImage
                            resizeMode={FastImage.resizeMode.cover}
                            style={styles.profileimage}
                            source={Global.userInfo.image ?
                                { uri: imageUrl !== "" ? imageUrl : Global.userInfo.image, priority: FastImage.priority.high, cache: 'web' }
                                :
                                imageUrl ? { uri: `${imageUrl}`, priority: FastImage.priority.high, cache: 'web' } : require("../assets/images/profile.png")}
                        />
                    </Pressable>
                    {
                        showOptionDropdown &&
                        <Pressable style={[styles.boxcontainer, GlobalStyles.inputBoxShadow, { zIndex: 100 }]}>
                            <View>
                                <Pressable onPress={() => handleImageSelection("camera")}
                                    style={({ pressed },) => ([
                                        styles.Camera,
                                        {
                                            opacity: pressed ? 0.4 : 1,
                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground
                                        }
                                    ])}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Take Photo</Text>
                                </Pressable>
                            </View>
                            <View>
                                <Pressable
                                    onPress={() => handleImageSelection("photo")}
                                    style={({ pressed },) => ([
                                        styles.Camera, {
                                            opacity: pressed ? 0.4 : 1,
                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                            borderTopWidth: 0,
                                            borderTopLeftRadius: 0,
                                            borderTopRightRadius: 0,
                                            borderBottomLeftRadius: 14,
                                            borderBottomRightRadius: 14
                                        }
                                    ])}
                                >
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Photo Library</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    }
                    {userInfo.firstName && <>
                        <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(2) }]}>{`${userInfo.firstName} ${userInfo.lastName}`}</Text>
                        <Text style={[Fonts.Nunito_400Regular, GlobalStyles.smallText, { color: Colors.modalBackground }]}>{userInfo.userId}</Text>
                    </>}
                </Pressable>
                <ScrollView nestedScrollEnabled={true}>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>Account</Text>
                        {
                            AccountSettings.map((item, index) => {
                                return (
                                    <Pressable key={index} onPress={() => {
                                        if (item.SettingTitle == "Fingerprint" || item.SettingTitle == 'Face ID') {
                                            if (Global.Biometric_Id != '') {
                                                setShowModal(true);
                                            }
                                            else {
                                                checkbiometric();
                                            }
                                        }
                                        if (item.SettingTitle == "Profile") {
                                            navigation.replace("MyDetails", { setting: true })
                                        }
                                    }}>
                                        <View
                                            style={[styles.settingContainer, {
                                                backgroundColor: Colors.boxBackground,
                                            }]}>
                                            <View style={{ flexDirection: 'column', width: '90%' }}>
                                                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                                    <VectorIcons
                                                        groupName={item.IconGroup}
                                                        iconName={item.IconName}
                                                        iconsize={item.IconName == "fingerprint" ? 28 : 35}
                                                        iconstyle={{ color: Colors.primaryTextColor }}
                                                    />
                                                    <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold,
                                                    { paddingHorizontal: widthToDp(4), fontSize: scale(16), color: Colors.primaryTextColor },
                                                    ]}>
                                                        {(item.SettingTitle == "Fingerprint" || item.SettingTitle == 'Face ID') ? (biometricStatus ? "Disable " : "Enable ") : ''}{item.SettingTitle}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{
                                                flexDirection: 'column', width: '10%', alignItems: 'flex-end', justifyContent: "center",
                                            }}>
                                                <VectorIcons
                                                    groupName={"AntDesign"}
                                                    iconName={"right"}
                                                    iconsize={25}
                                                    iconstyle={{ color: Colors.primaryTextColor }}
                                                />
                                            </View>
                                        </View>
                                    </Pressable>)

                            }
                            )
                        }
                    </View>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>General</Text>
                        {
                            GeneralSettings.map((item, index) => {
                                return (
                                    <Pressable key={index} onPress={() => handleGeneralSettingIcon(item)}
                                        style={{ marginBottom: GeneralSettings.length - 1 == index ? heightToDp(5) : 0 }}
                                    >
                                        <View style={[styles.settingContainer, {
                                            backgroundColor: item.SettingTitle == "Deactivate User" ? Colors.red : Colors.boxBackground,
                                        }]}>
                                            <View style={{ flexDirection: 'column', width: '90%' }}>
                                                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                                    <VectorIcons
                                                        groupName={item.IconGroup}
                                                        iconName={item.IconName}
                                                        iconsize={30}
                                                        iconstyle={item.SettingTitle == "Sign-out" ? { color: Colors.secondarybuttonColor } : { color: item.SettingTitle == "Deactivate User" ? Colors.defaultBackground : Colors.primaryTextColor }}
                                                    />
                                                    <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold,
                                                    { paddingHorizontal: widthToDp(4), fontSize: scale(16), color: item.SettingTitle == "Deactivate User" ? Colors.defaultBackground : Colors.primaryTextColor },
                                                    ]}>
                                                        {item.SettingTitle}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{
                                                flexDirection: 'column', width: '10%', alignItems: 'flex-end'
                                            }}>
                                                <VectorIcons
                                                    groupName={"AntDesign"}
                                                    iconName={"right"}
                                                    iconsize={25}
                                                    iconstyle={{ color: item.SettingTitle == "Deactivate User" ? Colors.defaultBackground : Colors.primaryTextColor }}
                                                />
                                            </View>
                                        </View>
                                    </Pressable>)
                            })
                        }

                    </View>
                    <Modal visible={showModal} animationType={'fade'} transparent={true}>
                        <View style={{ flex: 1, backgroundColor: Colors.modalBackground }}>
                            <View style={styles.optionView}>
                                <View style={styles.container}>
                                    <Text style={[styles.warningHeading, Fonts.Nunito_600SemiBold]}>{"Warning!"}</Text>
                                    <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
                                        <VectorIcons groupName='Ionicons' iconName='close' iconsize={widthToDp(9)} />
                                    </Pressable>
                                </View>
                                <Text style={[GlobalStyles.largeText, styles.warningMessage, Fonts.Nunito_600SemiBold]}>
                                    Are you sure you want to disable fingerprint?                              </Text>
                                <View style={{ flexDirection: "row", width: "100%", justifyContent: "center" }}>

                                    <CommonButton
                                        buttonText="OK"
                                        onPress={async () => {
                                            setShowModal(false);
                                            await UpadateBiometric();
                                        }}
                                        extraStyles={styles.button}
                                    />
                                    <CommonButton
                                        buttonText="Cancel"
                                        onPress={() => {
                                            setShowModal(false);
                                        }}
                                        extraStyles={styles.button}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>
            <Footer navigation={navigation} activeScreen={"Settings"} />
            <Confirmation
                confrimation={true}
                modalHeading={"Confirmation"}
                modalText={`Do you really want to sign out from Hope?`}
                transparent={true}
                visible={confirmation}
                setShowConfirmationModal={setConfirmation}
                action={(text) => { confirmationSignOut(text) }}
            />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            {showDisclaimer && <DisclaimerPopup
                type={"Nurse"}
                showDisclaimer={showDisclaimer}
                setPop={setShowDisclaimer}
                apppointmentBookingApis={navigateToPaymentConfirmation}
                DisclaimerText={DeactivateUser[0].DisclaimerP}
                maxHeight={"55%"}
            />}
            <ImagePreview showModal={showImageModal} setShowModal={setShowImageModal} imageUrl={imageUrl} action={(text) => { Imageconifrmation(text) }} imageResponse={imageResponse} />
            <WarningModal showModal={showModalWarning} setShowModal={setShowModalWarning} warningText={warningText} />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    userimagecontainer: {
        marginTop: heightToDp(2),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    userimage: {
        borderWidth: 2,
        borderRadius: 50,
        borderColor: Colors.primaryButtonColor,
        zIndex: 10,
        height: scale(86),
        width: scale(86),
        position: 'absolute',
        top: heightToDp(0),
    },
    profileimage: {
        top: heightToDp(0.5),
        borderRadius: 50,
        height: scale(80),
        width: scale(80),
    },
    settingContainer: {
        flexDirection: "row",
        borderRadius: 14,
        padding: widthToDp(2),
        marginTop: heightToDp(2),
        width: "100%",
    },
    warningMessage: {
        marginTop: heightToDp(2),
        marginBottom: heightToDp(3),
        paddingHorizontal: widthToDp(6),
        textAlign: "auto",
    },
    closeButton: {
        right: heightToDp(2),
        marginTop: heightToDp(1)
    },
    warningHeading: {
        fontSize: scale(32),
        marginTop: heightToDp(1),
        left: heightToDp(2),
        color: Colors.red
    },
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%"
    },
    optionView: {
        minHeight: heightToDp(27),
        width: widthToDp(80),
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: heightToDp(35),
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
    button: {
        width: "40%",
        marginHorizontal: widthToDp(2),
        marginBottom: heightToDp(2),
    },
    boxcontainer: {
        position: 'absolute',
        top: heightToDp(10),
        right: widthToDp(10),
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
    },
    Camera: {
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(1),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(60,60,67,0.1)',
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    }
})