import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, BackHandler, KeyboardAvoidingView, Modal, Pressable, Text, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import DetailsForm from '../components/DetailsForm';
import CommonButton from '../components/CommonButton';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import Global from './Global';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Colors from '../utils/Colors';
import moment from 'moment';
import Loader from '../components/Loader';
import { uploadFileToS3, uploadProfilePicture } from '../utils/CommonFunctions';
import { DeleteMasterData, GetMasterJSONData, InsertMasterData, InsertMasterDataTimeStamp, ValidateExpiry } from '../utils/ExecuteDBQuery';
import VectorIcons from '../components/VectorIcons';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Fonts from '../utils/Fonts';
import { scale } from 'react-native-size-matters';

const PatientDetailsForm = (props) => {
    let viewRelation = props.route.params.viewRelation;
    const [patientRelation, setPatientRelation] = useState([]);
    let [firstName, setFirstName] = useState('');
    let [pincode, setPincode] = useState('');
    let [selectedGender, setSelectedGender] = useState('');
    let [selectedRelation, setSelectedRelation] = useState('');
    let [dateOfBirth, setDateOfBirth] = useState('');
    let [image, setImage] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [aadharNumber, setAadharNumber] = useState("");
    const [aadharImage, setAadharImage] = useState("");
    const [aadharImageType, setAadharImageType] = useState("");
    const [refId, setRefId] = useState("");
    const [aadharVerified, setAadharVerified] = useState(false);
    const validname = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    let [otp, setOTP] = useState('');
    let [otpError, setOtpError] = useState(false);
    const [aadharVerification, setAadharVerification] = useState(false);
    let [counter, setCounter] = useState(0);
    const fromScreen = props?.route.params.fromScreen;
    const setting = props?.route.params?.setting ? true : false;
    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

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

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        return () => {
            backHandler.remove();
        }
    }, []);

    const UpdateUserDocumentPath = async (id) => {
        try {
            const body = {
                "id": id,
                "documentType": "PatientAadhar",
                "documentUrl": aadharImage.uri,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };

            setLoading(true);
            const response = await apiCall('registration/updateuserdocument', body);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const isUnderFiveYears = (dateString) => {
        const givenDate = moment(dateString);
        const fiveYearsAgo = moment().subtract(5, 'years');
        return givenDate.isAfter(fiveYearsAgo);
    };

    const createPatient = async () => {
        if (props.route.params.id == 0) {
            let data = {
                firstName: firstName.trim(),
                lastName: "",
                relation: selectedRelation,
                pincode: pincode,
                gender: selectedGender,
                dob: dateOfBirth,
                status: '',
                address: address
            }
            try {
                const body = {
                    "userId": Global.userID,
                    "relation": data.relation.toString(),
                    "firstName": data.firstName,
                    "lastName": data.lastName,
                    "pinCode": data.pincode,
                    "gender": data.gender,
                    "dob": moment(data.dob).format("DD-MM-YYYY"),
                    "address": address.trim(),
                    "aadharNumber": aadharNumber,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                const response = await apiCall('registration/addpatient', body);
                let patientIdProfile = response.patientId.toString();
                if (image.uri && image.uri.trim() !== "") {
                    const extension = image.type.split("/")[1];
                    const res = await uploadFileToS3(image, `/${patientIdProfile}.` + extension, "PROFILE/PATIENTS")
                    await uploadProfilePicture(res.body.postResponse.location, "0", patientIdProfile);
                    data.profilePicturePath = res.body.postResponse.location;
                }
                data.id = patientIdProfile;
                data.relation = patientRelation.find(obj => obj.id === data.relation).relation;
                Global.patientList.push(data);
                Global.patientID = patientIdProfile;

                if (aadharImage.uri && aadharImage.uri.trim() !== "") {
                    const extension = aadharImage.type.split("/")[1];
                    const res = await uploadFileToS3(aadharImage, `/${patientIdProfile}.` + extension, "AADHAR/PATIENTS")
                    UpdateUserDocumentPath(patientIdProfile);
                }
                setLoading(false);
                props.navigation.replace("PatientDetails", { UserData: data });
                props.route.params.id = data.id;
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        } else {
            try {
                const relationID = patientRelation.find(obj => obj.relation === selectedRelation)?.id;
                const body = {
                    "userId": Global.userID,
                    "patientId": props.route.params.id,
                    "relation": typeof (selectedRelation) == "string" ? relationID.toString() : selectedRelation.toString(),
                    "firstName": firstName,
                    "lastName": "",
                    "pinCode": pincode,
                    "gender": selectedGender,
                    "dob": moment(dateOfBirth).format('DD-MM-YYYY'),
                    "address": address.trim(),
                    "imageUploaded": "Y",
                    "aadharNumber": aadharNumber,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                await apiCall('registration/updatepatient', body);
                if (image.uri && (image.uri?.trim() !== "" && !image.uri?.includes("http"))) {
                    const extension = image.type.split("/")[1];
                    const res = await uploadFileToS3(image, `/${props.route.params.id}.` + extension, "PROFILE/PATIENTS")
                    await uploadProfilePicture(res.body.postResponse.location, "0", props.route.params.id);
                    props.route.params.UserData.profilePicturePath = res.body.postResponse.location;
                }
                if (aadharImage.uri && aadharImage.uri.trim() !== "") {
                    const extension = aadharImage.type.split("/")[1];
                    const res = await uploadFileToS3(aadharImage, `/${props.route.params.id}.` + extension, "AADHAR/PATIENTS")
                    UpdateUserDocumentPath(props.route.params.id);
                }
                if (fromScreen === "CareCircle") {
                    props.navigation.replace("CareCircle");
                } else {
                    props.navigation.replace("PatientDetails", { UserData: props.route.params.UserData });
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
    }

    const editProfileFunction = async () => {
        if (fromScreen == "PatientDetails") {
            await validateNonRigisterPatient();
        } else {
            await validateMyUser()
        }
    }

    const validateNonRigisterPatient = async () => {
        if (pincode == '') {
            DisplayError("Please enter Pincode");
        } else if (pincode.length < 6) {
            DisplayError("Please enter 6 digit pincode");
        } else if (parseInt(pincode) <= 100000) {
            DisplayError("Please enter valid pincode");
        } else if (address.trim() == "") {
            DisplayError("Please enter Address.");
        } else {
            try {
                const relationID = patientRelation.find(obj => obj.relation === selectedRelation)?.id;
                const body = {
                    "userId": Global.userID,
                    "patientId": props.route.params.id,
                    "relation": typeof (selectedRelation) == "string" ? relationID.toString() : selectedRelation.toString(),
                    "firstName": firstName,
                    "lastName": "",
                    "pinCode": pincode,
                    "gender": selectedGender,
                    "dob": moment(dateOfBirth).format('DD-MM-YYYY'),
                    "address": address.trim(),
                    "imageUploaded": "Y",
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                await apiCall('registration/updatepatient', body);
                if (image.uri && (image.uri?.trim() !== "" && !image.uri?.includes("http"))) {
                    const extension = image.type.split("/")[1];
                    const res = await uploadFileToS3(image, `/${props.route.params.id}.` + extension, "PROFILE/PATIENTS")
                    await uploadProfilePicture(res.body.postResponse.location, "0", props.route.params.id);
                    props.route.params.UserData.profilePicturePath = res.body.postResponse.location;
                }
                if (fromScreen === "CareCircle") {
                    props.navigation.replace("CareCircle");
                } else {
                    props.navigation.replace("PatientDetails", { UserData: props.route.params.UserData });
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
    }

    const validateMyUser = async () => {
        startTimer();
        if (
            firstName.trim() == '' &&
            selectedGender.trim() == '' &&
            dateOfBirth == '' &&
            selectedRelation == '' &&
            pincode == ""
        ) {
            DisplayError("Please Enter All the Input")
        } else if (selectedRelation == '') {
            DisplayError("Please select relation with patient")
        } else if (!isNaN(firstName.trim())) {
            DisplayError("Please enter a valid first name")
        } else if (!validname.test(firstName.trim())) {
            DisplayError("Please enter a valid first name");
        } else if (pincode == '') {
            DisplayError("Please enter Pincode");
        } else if (pincode.length < 6) {
            DisplayError("Please enter 6 digit pincode");
        } else if (parseInt(pincode) <= 100000) {
            DisplayError("Please enter valid pincode");
        } else if (address.trim() == "") {
            DisplayError("Please enter Address.");
        } else if (selectedGender == '') {
            DisplayError("Please enter gender")
        } else if (dateOfBirth == '') {
            DisplayError("Please enter valid date.");
        } else if (!setting) {
            if (isUnderFiveYears(dateOfBirth) && aadharNumber.trim() !== "") {
                if (aadharVerified) {
                    if (aadharNumber.trim() == "") {
                        DisplayError("Please Enter Aadhar Number.")
                    } else if (aadharNumber.length != 12) {
                        DisplayError("Aadhar Number should have to be 12 numbers of length.")
                    } else if (aadharNumber !== "" && !/^[2-9]\d{3}\d{4}\d{4}$/.test(aadharNumber)) {
                        DisplayError("Enter Valid Aadhar Number.");
                    } else if (aadharVerified && firstName.trim() !== Global.aadharDetails.name) {
                        DisplayError("Entered name doesn't match with Aadhaar.")
                    } else if (aadharVerified && selectedGender !== Global.aadharDetails.gender) {
                        DisplayError("Entered gender doesn't match with Aadhaar.")
                    } else if (aadharVerified && moment(dateOfBirth).format("DD-MM-YYYY") !== Global.aadharDetails.dob) {
                        DisplayError("Entered date of birth doesn't match Aadhaar.")
                    } else {
                        createPatient();
                    }
                } else {
                    if (aadharNumber.trim() == "") {
                        DisplayError("Please Enter Aadhar Number.")
                    } else if (aadharNumber.length != 12) {
                        DisplayError("Aadhar Number should have to be 12 numbers of length.")
                    } else if (aadharNumber !== "" && !/^[2-9]\d{3}\d{4}\d{4}$/.test(aadharNumber)) {
                        DisplayError("Enter Valid Aadhar Number.");
                    } else {
                        emailVerificationFunction();
                    }
                }
            } else if (!isUnderFiveYears(dateOfBirth)) {
                if (aadharVerified) {
                    if (aadharNumber.trim() == "") {
                        DisplayError("Please Enter Aadhar Number.")
                    } else if (aadharNumber.length != 12) {
                        DisplayError("Aadhar Number should have to be 12 numbers of length.")
                    } else if (aadharNumber !== "" && !/^[2-9]\d{3}\d{4}\d{4}$/.test(aadharNumber)) {
                        DisplayError("Enter Valid Aadhar Number.");
                    } else if (aadharVerified && firstName.trim() !== Global.aadharDetails.name) {
                        DisplayError("Entered name doesn't match with Aadhaar.")
                    } else if (aadharVerified && selectedGender !== Global.aadharDetails.gender) {
                        DisplayError("Entered gender doesn't match with Aadhaar.")
                    } else if (aadharVerified && moment(dateOfBirth).format("DD-MM-YYYY") !== Global.aadharDetails.dob) {
                        DisplayError("Entered date of birth doesn't match Aadhaar.")
                    } else {
                        createPatient()
                    }
                } else {
                    if (aadharNumber.trim() == "") {
                        DisplayError("Please Enter Aadhar Number.")
                    } else if (aadharNumber.length != 12) {
                        DisplayError("Aadhar Number should have to be 12 numbers of length.")
                    } else if (aadharNumber !== "" && !/^[2-9]\d{3}\d{4}\d{4}$/.test(aadharNumber)) {
                        DisplayError("Enter Valid Aadhar Number.");
                    } else {
                        emailVerificationFunction();
                    }
                }
            } else {
                createPatient();
            }
        } else {
            createPatient();
        }
    };
    const onHeaderBackClick = () => {
        if (fromScreen === "PatientDetails") {
            props.navigation.replace("PatientDetails", { UserData: props?.route.params.UserData });
        } else {
            props.navigation.replace("CareCircle");
        }
    };

    const emailVerificationFunction = () => {
        setOtpError(false);
        setOTP("");
        updateUserEmail();
    };

    const validateOTP = async () => {
        if (regexOtp.test(otp)) {
            setAadharVerification(false);
            await delay(200);
            await verifyUserEmail();
        } else {
            if (!isNaN(otp)) {
                setOtpError(false);
            }
            setOtpError(true);
        }
    }

    const startTimer = () => {
        const timer = setInterval(() => {
            setCounter(prevSeconds => {
                if (prevSeconds === 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prevSeconds - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }

    const updateUserEmail = async () => {
        try {
            const body = {
                "aadhaar_number": aadharNumber.trim(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS,
            };
            setLoading(true);
            const response = await apiCall('cashfree/generateaadhaarotp', body);
            setRefId(response.ref_id);
            setLoading(false);
            if (response.status == "INVALID") {
                DisplayError(response.message);
                setAadharVerification(false);
            } else {
                await delay(200);
                setAadharVerification(true);
                setCounter(59);
                startTimer();
            }
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || Global.warningMessage);
        }
    };

    const verifyUserEmail = async () => {
        try {
            const body = {
                "aadhaar_number": aadharNumber.trim(),
                "otp": otp,
                "ref_id": refId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS,
            };
            setLoading(true);
            const response = await apiCall('cashfree/verifyaadhaarotp', body);
            Global.aadharDetails = {
                gender: response.gender == "M" ? "Male" : "Female",
                name: response.name,
                dob: response.dob
            }
            setAadharVerified(true);
            setCounter(0);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || Global.warningMessage);
        }
    }
    const regexOtp = /^[0-9]{6}$/;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header headerTitle="Patient Details" onPress={onHeaderBackClick} />
                <KeyboardAvoidingView behavior={Global.OS == "ios" && 'position'}>
                    <ScrollView keyboardShouldPersistTaps={"handled"} >
                        <DetailsForm
                            DisplayError={DisplayError}
                            isPatientForm={true}
                            fromSetting={props?.route.params?.setting ? true : false}
                            id={props?.route.params?.id}
                            getFirstName={(text) => { setFirstName(text) }}
                            getPincode={(text) => { setPincode(text) }}
                            getGender={(text) => { setSelectedGender(text) }}
                            getSelectedRelation={(text) => { setSelectedRelation(text) }}
                            getDateOfBirth={(text) => { setDateOfBirth(text) }}
                            getimage={(text) => { setImage(text) }}
                            getAadharNumber={(text) => { setAadharNumber(text) }}
                            address={address}
                            setAddress={setAddress}
                            viewRelation={viewRelation}
                        />
                        <CommonButton
                            buttonText="Continue"
                            onPress={async () => { await editProfileFunction() }}
                            extraStyles={{ alignSelf: 'center', marginTop: heightToDp(4), marginBottom: heightToDp(8) }}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <Modal visible={aadharVerification} animationType={'fade'} transparent={true}>
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center" }}>
                    <View style={styles.optionView}>
                        <View style={styles.container}>
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginLeft: widthToDp(4), marginTop: widthToDp(4) }]}>{"Aadhar OTP"}</Text>
                            <Pressable style={styles.closeButton} onPress={() => { setCounter(0); setAadharVerification(false); }}>
                                <VectorIcons groupName='Ionicons' iconName='close' iconsize={scale(22)} />
                            </Pressable>
                        </View>
                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginHorizontal: widthToDp(4), marginTop: widthToDp(2) }]}>Please Enter Otp Recived On Linked Mobile Number</Text>
                        <View style={{ height: heightToDp(12), width: "90%", alignSelf: "center" }}>
                            <OTPInputView
                                style={[GlobalStyles.normalText]}
                                autoFocusOnLoad={false}
                                pinCount={6}
                                code={otp}
                                onCodeChanged={val => {
                                    setOTP(val);
                                    if (val.length == 6) {
                                        setOtpError(false);
                                    }
                                }}
                                keyboardType='number-pad'
                                codeInputFieldStyle={[GlobalStyles.largeText, { height: heightToDp(8), width: widthToDp(13), borderRadius: 14, backgroundColor: Colors.defaultBackground }, GlobalStyles.inputBoxShadow]}
                                editable={true}>
                            </OTPInputView>
                            <Text style={[Fonts.Nunito_600SemiBold, { color: otpError ? Colors.red : Colors.boxBackground, fontSize: responsiveFont(scale(14)), marginTop: -widthToDp(2) }]}>*Please enter valid OTP</Text>
                        </View>
                        <View style={{ justifyContent: "flex-end", alignSelf: "flex-end", marginRight: widthToDp(6), marginTop: -widthToDp(2) }}>
                            <Pressable
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                                disabled={counter > 0}
                                onPress={() => { updateUserEmail(); }}>
                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { color: counter > 0 ? Colors.primaryinactive : Colors.primaryButtonColor }]}>Resend OTP</Text>
                            </Pressable>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={[Fonts.Nunito_700Bold, counter > 0 ? GlobalStyles.buttonsmallText : [GlobalStyles.smallText, { color: Colors.primaryinactive }]]}>
                                    {Math.floor(counter / 60)}:{counter % 60 < 10 ? "0" + counter % 60 : counter % 60}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", width: "100%", justifyContent: "center", marginTop: otpError ? widthToDp(4) : 0 }}>
                            <CommonButton
                                buttonText="Verify"
                                onPress={() => {
                                    validateOTP();
                                }}
                                extraStyles={styles.button}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    optionView: {
        width: "92%",
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        justifyContent: 'space-evenly',
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
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    closeButton: {
        right: heightToDp(2),
        marginTop: heightToDp(1),
        backgroundColor: Colors.defaultBackground,
        borderRadius: 50,
        padding: widthToDp(1.5),
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        width: "40%",
        marginHorizontal: widthToDp(2),
        marginBottom: heightToDp(2),
    },
})

export default PatientDetailsForm;