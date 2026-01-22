import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Text, Modal, TextInput, Image, Keyboard, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import ProfileBar from '../components/ProfileBar';
import CommonButton from '../components/CommonButton';
import { heightToDp, widthToDp, responsiveFont } from '../utils/Responsive';
import NoteBox from '../components/NoteBox';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import PatientDetailsInfoModal from '../components/PatientDetailsInfoModal';
import { Dropdown } from 'react-native-element-dropdown';
import countrycode from '../assets/mdm/countrycode.json';
import RadioButton from '../components/RadioButton';
import WarningModal from '../components/WarningModal';
import Global from './Global';
import moment from 'moment';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import { scale } from 'react-native-size-matters';
import Loader from '../components/Loader';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import { DeleteMasterData, GetMasterJSONData, InsertMasterData, InsertMasterDataTimeStamp, ValidateExpiry } from '../utils/ExecuteDBQuery';
const HEIGHT = Dimensions.get('window').height;

const PatientDetails = (props) => {
    const [patientRelation, setPatientRelation] = useState([]);
    const propUserData = props.route.params.UserData;
    const isRegistered = props.route.params.UserData.isRegistered === "NO";
    const minerPateint = props.route.params.UserData.dob ? moment(props.route.params.UserData.dob) > new Date().setFullYear(new Date().getFullYear() - 18) : false;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [userStatus, setUserStatus] = useState('');
    const [userData, setUserData] = useState({});
    const [form, setForm] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState('IN  +91');
    const [mobileNumber, setMobileNumber] = useState('');
    const [emailAddrress, setEmailAddrress] = useState('');
    const [displayBottomButton, setDisplayBottomButton] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const validmobile = /^(?!(\d)\1{9})\d{10}$/;
    const validemail = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})$/;
    const dateNow = new Date();

    const updateMasterData = async (data) => {
        try {
            if (DeleteMasterData('RelationList')) {
                console.log('Deleted successfully');
                if (InsertMasterData('RelationList', data, true)) {
                    console.log('Data Inserted');
                    if (InsertMasterDataTimeStamp('RelationList')) {
                        console.log('Time Stamp updated successfully');
                    }
                }
            }
        } catch (error) {
            console.log("Error while inserting Master Data to RelationList: " + error);
        }
    }

    useEffect(() => {
        getDataFromMaster();
    }, [])

    const getRelationList = async () => {
        try {
            const body = {
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall("registration/getrelationlist", body);
            await updateMasterData(response.relation);
            setPatientRelation(response.relation);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const getDataFromMaster = async () => {
        setLoading(true);
        if (await ValidateExpiry('RelationList')) {
            await getRelationList();
        }
        else {
            let masterJsonData = await GetMasterJSONData('RelationList');
            if (masterJsonData.length == 0) {
                await getRelationList();
            }
            else {
                setPatientRelation(JSON.parse(masterJsonData));
            }
            setLoading(false);
        }
    }

    const HideInfoModal = () => {
        setShowInfoModal(false);
    }

    const triggerApiCall = async (endpoint, body) => {
        try {
            const response = await apiCall(endpoint, body);
            setLoading(false);
            setUserData(response.patientData);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        if (isRegistered) {
            const body = {
                "patientId": props.route.params.UserData.id,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            triggerApiCall('registration/getpatientdata', body);
        }
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

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }

    const validatePatientData = async () => {
        if (emailAddrress.trim() === "" && mobileNumber.trim() === "") {
            DisplayError("Please enter valid mobile number or email address");
        } else if (mobileNumber.trim() === "") {
            if (validemail.test(emailAddrress) === true) {
                try {
                    const body = {
                        "inputType": "EMAIL",
                        "inputValue": emailAddrress,
                        "patientId": props.route.params.UserData.id,
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    };
                    setLoading(true);
                    await apiCall('registration/sendconsent2', body);
                    setLoading(false);
                } catch (error) {
                    setLoading(false);
                    DisplayError(error.msg || "Something went wrong, please try again");
                }
                setUserStatus(form ? 'Pending' : userStatus);
                Global.patientList.forEach((o, i) => {
                    if (o.id === props.route.params.UserData.id) {
                        Global.patientList[i].status = 'Pending';
                        Global.patientList[i].AppointmentDate = moment(dateNow).format('DD/MM/YYYY');
                        Global.patientList[i].AppointmentTime = moment().format('LT');
                        Global.patientList[i].Consent_Type = emailAddrress;
                    }
                });
            } else {
                DisplayError("Please enter valid email address");
            }
        } else if (emailAddrress.trim() === "") {
            if (validmobile.test(mobileNumber.trim())) {
                try {
                    const body = {
                        "inputType": "MOBILE",
                        "inputValue": mobileNumber,
                        "patientId": props.route.params.UserData.id,
                        "coord": [
                            "24.623061",
                            "10.830960"
                        ],
                        "location": "Mumbai",
                        "deviceInfo": Global.OS
                    };
                    setLoading(true);
                    await apiCall('registration/sendconsent2', body);
                    setLoading(false);
                } catch (error) {
                    setLoading(false);
                    DisplayError(error.msg || "Something went wrong, please try again");
                }
                setUserStatus(form ? 'Pending' : userStatus);
                Global.patientList.forEach((o, i) => {
                    if (o.id === props.route.params.UserData.id) {
                        Global.patientList[i].status = 'Pending';
                        Global.patientList[i].AppointmentDate = moment(dateNow).format('DD/MM/YYYY');
                        Global.patientList[i].AppointmentTime = moment().format('LT');
                        Global.patientList[i].Consent_Type = mobileNumber;
                    }
                });
            } else {
                DisplayError("Please enter valid Mobile Number.");
            }
        }
    };

    useEffect(() => {
        setUserStatus(props.route.params.UserData.status);
        if (props.route.params.UserData.status === "Rejected") {
            setDisplayBottomButton(false);
        }
    }, []);

    const onContinueClick = async () => {
        if (userStatus != '') {
            navigation.replace("CareCircle");
        } else if (form) {
            await validatePatientData();
        } else {
            if (minerPateint) {
                navigation.navigate("DisclaimerScreen", { patientId: props.route.params.UserData.id, UserData: props.route.params.UserData });
            } else {
                setForm(true);
            }
        }
    };

    const sendcarecirclerequest = async (selectedPerson) => {
        const selectedRelation = patientRelation.find((values, i) => values.relation === selectedPerson.relation);
        try {
            const body = {
                "userId": Global.userID,
                "careCircleId": selectedPerson.userId,
                "relationId": selectedRelation.id.toString(),
                "patientName": Global.userType == "Caregiver" ? selectedPerson?.firstName : Global.userInfo.firstName,
                "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : selectedPerson?.firstName,
                "templateName": "CG_ADDING_REGISTERED_PATIENT",
                "coord": ["24.623061", "10.830960"],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await apiCall("carecircle/sendcarecirclerequest", body);
            setLoading(false);
            navigation.navigate("CareCircle");
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const resentConsent = () => {
        if (props.route.params.UserData.isRegistered === "YES") {
            sendcarecirclerequest(props.route.params.UserData);
        } else {
            setForm(true);
            setUserStatus('');
        }
    };

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={{ flex: 1 }}>
                <View style={[GlobalStyles.mainBox]}>
                    <Header
                        headerTitle="Patient Details"
                        onPress={() => { navigation.replace("CareCircle") }}
                    />
                    <ScrollView keyboardShouldPersistTaps={"handled"}>
                        <ProfileBar
                            data={props.route.params.UserData}
                            userData={isRegistered ? userData : propUserData}
                            isProfileExists={true}
                            userStatus={userStatus}
                            IS_REGISTERED={props.route.params.UserData.IS_REGISTERED}
                        />
                        {userStatus != "" ?
                            <View style={styles.consentContainer}>
                                <View style={[GlobalStyles.boxMainContainer, GlobalStyles.inputBoxShadow, styles.consent]}>
                                    <Text style={[GlobalStyles.boxTitleText, Fonts.Nunito_600SemiBold]}>
                                        Consent {userStatus == "Rejected" && props.route.params.fromScreen == 'CareCircle' ? "Rejected" : "Approval"}
                                    </Text>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                                        {(() => {
                                            if (minerPateint) {
                                                return `Consent was approved by ${Global.userInfo.firstName || ""} (${userData.relation || ""}) , on behalf of ${userData.firstName || ""} (child), on ${moment(userData.updatedDate).format("DD/MM/YYYY") || ""} at ${moment(userData.updatedDate).format("hh:mm a") || ""}`
                                            }
                                            return userStatus == "Approved" ? `Consent was approved by ${userData.firstName || ""} on ${moment(userData.updatedDate).format("DD/MM/YYYY") || ""} at ${moment(userData.updatedDate).format("hh:mm a") || ""}` : userStatus == "Pending" ? `We have successfully sent the consent request to ${props.route.params.UserData.firstName || ""}'s ${props.route.params.UserData.Consent_Type || ""}.` : `Consent was denied by ${propUserData.firstName || ""} on ${moment(propUserData.updatedOn).format("DD/MM/YYYY") || ""} at ${moment(propUserData.updatedOn).format("hh:mm a") || ""}`
                                        })()}
                                    </Text>
                                    <View style={styles.StatusContainer}>
                                        {
                                            userStatus == "Approved" ?
                                                <RadioButton selected={true} backgroundColor={Colors.successColor} extraStyles={{ marginTop: -1, marginLeft: 0 }} />
                                                :
                                                <Image
                                                    source={userStatus == "Pending" ? require('../assets/vectors/Pending_approval.png') : require('../assets/vectors/error_red.png')}
                                                    style={{ marginRight: widthToDp(4), width: 20, height: 20 }}
                                                    resizeMode='contain'
                                                />
                                        }
                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { marginLeft: 10 }]}>
                                            {userStatus}
                                        </Text>
                                    </View>
                                </View>
                                {
                                    userStatus == "Rejected" &&
                                    <View>
                                        <Pressable
                                            onPress={resentConsent}
                                            style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1, marginTop: heightToDp(10) }])}>
                                            <Text style={[GlobalStyles.buttonnormalText, styles.howItWorksText, Fonts.Nunito_600SemiBold]}>Resend Consent</Text>
                                        </Pressable>
                                    </View>
                                }
                            </View>
                            :
                            form &&
                            <View>
                                <Text style={[GlobalStyles.normalText, styles.boxContainer, Fonts.Nunito_600SemiBold]}>Please provide {props.route.params.UserData.firstName}'s Valid Mobile number or E-Mail ID</Text>
                                <View style={{ marginVertical: heightToDp(4) }}>
                                    <View style={[GlobalStyles.loginInputContainer, GlobalStyles.inputBoxShadow, { borderTopWidth: 0 }]}>
                                        <View style={styles.MobileContainer}>
                                            <Dropdown
                                                style={[styles.dropdown, Fonts.Nunito_600SemiBold]}
                                                placeholderStyle={GlobalStyles.mediumText}
                                                selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                                inputSearchStyle={styles.inputSearchStyle}
                                                itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                                iconStyle={styles.iconStyle}
                                                placeholder={selectedCountryCode}
                                                data={countrycode}
                                                maxHeight={300}
                                                labelField="label"
                                                valueField="label"
                                                searchPlaceholder="Search..."
                                                value={selectedCountryCode}
                                                onChange={item => { setSelectedCountryCode(item.label) }}
                                                disable={true}
                                            />
                                        </View>
                                        <View style={styles.MobileContainerRight}>
                                            <TextInput
                                                keyboardType='numeric'
                                                maxLength={10}
                                                style={[GlobalStyles.loginMobileTextInput, Fonts.Nunito_600SemiBold]}
                                                placeholder="Mobile Number"
                                                placeholderTextColor={Colors.placeholderTextColor}
                                                onChangeText={(text) => {
                                                    setMobileNumber(text);
                                                    setEmailAddrress('');
                                                    if (text.length == 10) {
                                                        Keyboard.dismiss()
                                                    }
                                                }}
                                                value={mobileNumber} />
                                        </View>
                                    </View>
                                    <Image resizeMode='contain' source={require("../assets/vectors/or_line.png")} style={styles.LineImage} />
                                    <TextInput
                                        autoCapitalize="none"
                                        style={[GlobalStyles.loginEmailTextInput, GlobalStyles.inputBoxShadow, Fonts.Nunito_600SemiBold, { borderTopWidth: 0 }]}
                                        placeholder='Email Address'
                                        placeholderTextColor={Colors.placeholderTextColor}
                                        onChangeText={(text) => {
                                            setEmailAddrress(text);
                                            setMobileNumber('')
                                        }}
                                        value={emailAddrress}
                                    />
                                </View>
                            </View>
                        }
                        <View>
                            {userStatus == '' &&
                                !form &&
                                <View style={[styles.NoteContainer]}>
                                    <NoteBox />
                                    <View style={{ marginTop: heightToDp(2) }}>
                                        <Pressable
                                            onPress={() => setShowInfoModal(true)}
                                            style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                                        >
                                            <Text style={[GlobalStyles.normalText, { color: Colors.primaryButtonColor }, styles.howItWorksText, Fonts.Nunito_700Bold]}>Tell me how it works?</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            }
                        </View>
                        {(displayBottomButton) &&
                            <CommonButton
                                buttonText={userStatus == "Pending" ? "My Patient" : form ? "Send Consent Request" : "Continue"}
                                onPress={onContinueClick}
                                extraStyles={{}} />
                        }
                    </ScrollView>
                    <Modal visible={showInfoModal} animationType={'fade'} transparent={true}>
                        <PatientDetailsInfoModal functionPropNameHere={() => HideInfoModal()} />
                    </Modal>
                    <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                    <Spinner
                        visible={loading}
                        color={Colors.primaryButtonColor}
                        customIndicator={<Loader />}
                        textStyle={{ color: Colors.primaryButtonColor }}
                    />
                </View>
                <Footer navigation={navigation} activeScreen={"Family"} />
            </View>
        </SafeAreaView>
    );
}

export default PatientDetails;

const styles = StyleSheet.create({
    dropdown: {
        height: heightToDp(6),
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        paddingHorizontal: widthToDp(2),
    },
    iconStyle: {
        width: widthToDp(4),
        height: heightToDp(2),
    },
    inputSearchStyle: {
        height: 40,
        fontSize: scale(16),
    },
    howItWorksText: {
        textAlign: 'center',
    },
    emailModal: {
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
    emailModalBtn: {
        flex: 1,
        backgroundColor: "rgba(52,52,52,0.1)",
        alignItems: "center",
        justifyContent: "center"
    },
    tncHeading: [{
        lineHeight: heightToDp(3),
        fontSize: responsiveFont(scale(18)),
        marginBottom: heightToDp(1),
        color: Colors.primaryTextColor
    }, Fonts.Nunito_700Bold],
    emailModalBtnText: [{
        width: "100%",
        lineHeight: heightToDp(3),
        fontSize: responsiveFont(scale(16)),
        color: Colors.primaryTextColor,
        marginTop: heightToDp(1),
    }, Fonts.Nunito_600SemiBold],
    checkBoxStyle: {
        width: "100%",
        height: heightToDp(10),
        borderRadius: heightToDp(1),
        flexDirection: "row",
        paddingVertical: heightToDp(2),
    },
    checkIconContainer: {
        backgroundColor: "#e5e5e5",
        width: widthToDp(5),
        height: widthToDp(5),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: heightToDp(1),
        marginRight: widthToDp(2),
        marginTop: heightToDp(0.25),
        overflow: "hidden"
    },
    AgreeTxt: [{
        width: widthToDp(60),
        height: heightToDp(8),
        fontSize: responsiveFont(scale(13)),
        color: Colors.primaryTextColor
    }, Fonts.Nunito_700Bold],
    modalBottomBtnBox: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    modalBtn: {
        width: "40%",
        height: heightToDp(6),
        paddingHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
    consentContainer: {
        height: HEIGHT - heightToDp(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    consent: {
        width: '95%',
        alignSelf: 'center'
    },
    StatusContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: heightToDp(10),
        marginHorizontal: widthToDp(2),
    },
    boxContainer: {
        marginTop: heightToDp(2),
        lineHeight: heightToDp(3),
    },
    MobileContainer: {
        width: '40%',
        flexDirection: 'column',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginHorizontal: widthToDp(1),
        marginVertical: heightToDp(0.5)
    },
    MobileContainerRight: {
        width: '60%',
        flexDirection: 'column',
        borderRadius: 14,
    },
    LineImage: {
        height: heightToDp(10),
        width: '100%',
        alignSelf: 'center',
    },
    NoteContainer: {
        marginTop: HEIGHT <= 550 ? heightToDp(1) : heightToDp(4),
        height: HEIGHT - heightToDp(40),
        alignItems: 'center',
        justifyContent: 'center'
    }
});