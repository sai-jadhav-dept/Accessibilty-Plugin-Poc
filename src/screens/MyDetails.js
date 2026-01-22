import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, BackHandler, KeyboardAvoidingView, Modal, StyleSheet, Text, Pressable } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import CommonButton from '../components/CommonButton';
import DetailsForm from '../components/DetailsForm';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import moment from 'moment';
import Colors from '../utils/Colors';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import { fetchPostalData, uploadFileToS3, uploadProfilePicture, validatePincode } from '../utils/CommonFunctions';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Fonts from '../utils/Fonts';
import VectorIcons from '../components/VectorIcons';
import { scale } from 'react-native-size-matters';

const MyDetails = ({ route }) => {

  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCode, setSelectedCode] = useState(Global.inputType == 'Mobile' ? Global.selectedCountryCode : '+91');
  const [emailAddress, setEmailAddress] = useState(Global.inputType == 'Email' ? Global.inputValue : '');
  const [mobileNo, setMobileNo] = useState(Global.inputType == 'Mobile' ? Global.inputValue : '');
  let [pincode, setPincode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [image, setImage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [address, setAddress] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharImage, setAadharImage] = useState("");
  const [aadharVerified, setAadharVerified] = useState(false);
  const [refId, setRefId] = useState("");
  const validname = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
  const validmobile = /^(?!(\d)\1{9})\d{10}$/;
  const validemail = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})$/;
  let [otp, setOTP] = useState('');
  let [otpError, setOtpError] = useState(false);
  const [aadharVerification, setAadharVerification] = useState(false);
  let [counter, setCounter] = useState(0);
  const DisplayError = (text) => {
    setWarningText(text)
    setShowModal(true);
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    return () => {
      backHandler.remove();
    }
  }, []);

  const triggerApiCall = (endpoint, body) => {
    return new Promise(async (res, rej) => {
      try {
        const response = await apiCall(endpoint, body);
        res(response);
      } catch (error) {
        rej(error);
      }
    })
  };

  const pincodeValidatingApi = async () => {
    setLoading(true);
    await fetchPostalData(pincode);
    setLoading(false);
    if (Global.OS == "ios") {
      await delay(200);
    }
  };

  const validateMyUser = async () => {
    setLoading(true);
    const statusMessage = await validatePincode(pincode);
    setLoading(false);
    if (Global.OS == "ios") {
      await delay(200);
    }
    if (
      firstName.trim() == '' &&
      selectedGender.trim() == '' &&
      dateOfBirth == '' &&
      mobileNo.trim() == "" &&
      pincode.trim() == ""
    ) {
      DisplayError("Please enter all the field");
    } else if (firstName.trim() == '') {
      DisplayError("Please enter first name");
    } else if (!validname.test(firstName.trim())) {
      DisplayError("Please enter a valid first name");
    } else if (mobileNo.trim() == '') {
      DisplayError("Please enter mobile number");
    } else if (!validmobile.test(mobileNo.trim())) {
      DisplayError("Please enter valid Mobile Number.");
    } else if (emailAddress.trim() == '') {
      DisplayError("Please enter Email Address.");
    } else if (!validemail.test(emailAddress.trim())) {
      DisplayError("Please enter valid Email Address.");
    } else if (pincode == '') {
      DisplayError("Please enter Pincode");
    } else if (pincode.length < 6) {
      DisplayError("Please enter 6 digit pincode");
    } else if (isNaN(pincode) || parseInt(pincode) <= 100000) {
      DisplayError("Please enter valid pincode");
    } else if (await pincodeValidatingApi()) {
      DisplayError("Please enter valid pincode")
    } else if (statusMessage) {
      DisplayError(statusMessage)
    } else if (Global.userType === "Patient" && address.trim() == "") {
      DisplayError("Please enter Address.");
    } else if (selectedGender.trim() == '') {
      DisplayError("Please select gender");
    } else if (dateOfBirth == '') {
      DisplayError("Please enter date of birth");
    } else if (aadharNumber.trim() == "") {
      DisplayError("Please Enter Aadhar Number.")
    } else if (aadharNumber.length != 12) {
      DisplayError("Aadhar Number should have to be 12 numbers of length.")
    } else if (aadharNumber !== "" && !/^[2-9]\d{3}\d{4}\d{4}$/.test(aadharNumber)) {
      DisplayError("Enter Valid Aadhar Number.");
    } else if (emailAddress.trim() != "") {
      Global.selectedCountryCode = '';
      if (!validemail.test(emailAddress.trim())) {
        DisplayError("Please enter a valid email address");
      }
      else {
        if (aadharVerified) {
          if (firstName.trim() !== Global.aadharDetails.name) {
            DisplayError("Entered name doesn't match with Aadhaar.")
          } else if (selectedGender !== Global.aadharDetails.gender) {
            DisplayError("Entered gender doesn't match with Aadhaar.")
          } else if (moment(dateOfBirth).format("DD-MM-YYYY") !== Global.aadharDetails.dob) {
            DisplayError("Entered date of birth doesn't match Aadhaar.")
          } else {
            await registerData();
          }
        } else {
          emailVerificationFunction();
        }
      }
    }
    else {
      if (aadharVerified) {
        if (firstName.trim() !== Global.aadharDetails.name) {
          DisplayError("Entered name doesn't match with Aadhaar.")
        } else if (selectedGender !== Global.aadharDetails.gender) {
          DisplayError("Entered gender doesn't match with Aadhaar.")
        } else if (moment(dateOfBirth).format("DD-MM-YYYY") !== Global.aadharDetails.dob) {
          DisplayError("Entered date of birth doesn't match Aadhaar.")
        } else {
          await registerData();
        }
      } else {
        emailVerificationFunction();
      }
    }
  };

  const Updateuser = async () => {
    if (
      firstName.trim() == '' &&
      selectedGender.trim() == '' &&
      dateOfBirth == '' &&
      pincode.trim() == ""
    ) {
      DisplayError("Please enter all the field");
    } else if (firstName.trim() == '') {
      DisplayError("Please enter first name");
    } else if (!validname.test(firstName.trim())) {
      DisplayError("Please enter a valid first name");
    } else if (pincode == '') {
      DisplayError("Please enter Pincode");
    } else if (pincode.length < 6) {
      DisplayError("Please enter 6 digit pincode");
    } else if (isNaN(pincode) || parseInt(pincode) <= 100000) {
      DisplayError("Please enter valid pincode");
    } else if (Global.userType === "Patient" && address.trim() == "") {
      DisplayError("Please enter Address.");
    } else if (selectedGender.trim() == '') {
      DisplayError("Please select gender");
    } else if (dateOfBirth == '') {
      DisplayError("Please enter date of birth");
    } else {
      try {
        const body = {
          "type": "HOPE",
          "userId": Global.userID,
          "firstName": firstName,
          "lastName": "",
          "pinCode": pincode,
          "gender": selectedGender,
          "dob": moment(dateOfBirth).format("DD-MM-YYYY"),
          "address": address.trim(),
          "aadharNumber": aadharNumber,
          "coord": [
            24.623061,
            10.830960
          ],
          "location": "Mumbai",
          "deviceInfo": Global.OS
        };
        setLoading(true);
        await triggerApiCall('registration/updateuser', body);
        Global.userInfo.DOB = moment(dateOfBirth).format('YYYY-MM-DD 00:00:00');
        if (image.uri && (image.uri?.trim() !== "" && !image.uri.includes("http"))) {
          const extension = image.type?.split("/")[1];
          const userType = Global.userType == "Patient" ? "PATIENTS" : "USERS"
          const res = await uploadFileToS3(image, `/${Global.userID}.` + extension, "PROFILE/" + `${userType}`)
          await uploadProfilePicture(res.body.postResponse.location, Global.userID, "0")
        }
        navigation.replace("SettingsPage");
        setLoading(false);
      } catch (error) {
        setLoading(false);
        DisplayError(error.msg || "Something went wrong, please try again");
      }
    }
  }

  const registerUser = async (id) => {
    try {
      const body = {
        "token": Global.fcmToken,
        "userId": id,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": "android"
      }
      await apiCall('pushnotifications/registeruser', body)
    } catch (error) {
      console.log(error);
    }
  }

  const registerData = async () => {
    try {
      const body = {
        "userType": Global.userType == 'Patient' ? "1" : "2",
        "firstName": firstName.trim(),
        "lastName": "",
        "countryCode": selectedCode,
        "mobileNumber": mobileNo,
        "emailAddress": emailAddress,
        "address": address.trim(),
        "pinCode": pincode,
        "gender": selectedGender,
        "dob": moment(dateOfBirth).format("DD-MM-YYYY"),
        "aadharNumber": aadharNumber.toString(),
        "coord": [
          24.623061,
          10.830960
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await apiCall('registration/createuser', body);
      let userProfileId = response.userId.toString();
      Global.userID = userProfileId;
      await registerUser(userProfileId);
      let userImage;
      if (image.uri && (image.uri?.trim() !== "")) {
        const extension = image.type.split("/")[1];
        const userType = Global.userType == "Patient" ? "PATIENTS" : "USERS";
        const res = await uploadFileToS3(image, `/${userProfileId}.` + extension, "PROFILE/" + `${userType}`)
        userImage = res.body.postResponse.location;
        await uploadProfilePicture(res.body.postResponse.location, userProfileId, "0")
      }
      if (aadharImage.uri && (aadharImage.uri?.trim() !== "")) {
        const extension = aadharImage.type.split("/")[1];
        const userType = Global.userType == "Patient" ? "PATIENTS" : "USERS";
        const res = await uploadFileToS3(aadharImage, `/${userProfileId}.` + extension, "AADHAR/" + `${userType}`)
        userImage = res.body.postResponse.location;
      }
      if (body.userType == "1") {
        Global.patientID = response.patientId.toString();
      }
      setLoading(false);
      Global.userID = response.userId.toString();
      Global.patientUserId = response.userId.toString();
      Global.userInfo.firstName = firstName.trim();
      Global.userInfo.DOB = dateOfBirth;
      Global.userInfo.image = userImage;
      Global.userInfo.pincode = pincode;
      Global.userInfo.gender = selectedGender;
      Global.userInfo.email = emailAddress;
      Global.userInfo.mobileNo = mobileNo;
      navigation.navigate('RegisteredSuccessfully');
    }
    catch (e) {
      setLoading(false);
      DisplayError(e.msg || "Something went wrong, please try again");
    }
  }

  const Update = async () => {
    if (route.params?.setting) {
      await Updateuser();
    } else {
      startTimer();
      await validateMyUser();
    }
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

  const regexOtp = /^[0-9]{6}$/;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
  
  const emailVerificationFunction = () => {
    setOtpError(false);
    setOTP("");
    updateUserEmail();
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

  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Header
          headerTitle="My Details"
          onPress={() => { navigation.navigate(route.params?.setting ? "SettingsPage" : 'SelectUserType'); }}
        />
        <KeyboardAvoidingView behavior={Global.OS == "ios" && 'position'} >
          <ScrollView keyboardShouldPersistTaps={"handled"}>
            <DetailsForm
              DisplayError={DisplayError}
              isPatientForm={false}
              fromSetting={route.params?.setting ? true : false}
              getFirstName={(text) => { setFirstName(text) }}
              getCountryCode={(text) => { setSelectedCode(text) }}
              getMobileNo={(text) => { setMobileNo(text) }}
              getEmailAddress={(text) => { setEmailAddress(text) }}
              getPincode={(text) => { setPincode(text) }}
              getGender={(text) => { setSelectedGender(text) }}
              getDateOfBirth={(text) => { setDateOfBirth(text) }}
              getimage={(text) => { setImage(text) }}
              getAadharNumber={(text) => { setAadharNumber(text) }}
              firstname={route?.params?.firstname}
              gender={route?.params?.gender}
              dob={moment(route?.params?.dob).format('DD/MM/YYYY')}
              emailAddress={emailAddress}
              mobileNumber={mobileNo}
              address={address}
              setAddress={setAddress}
            />
            {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
            <CommonButton
              buttonText="Continue"
              onPress={async () => { await Update(); }}
              extraStyles={{
                alignSelf: 'center',
                marginTop: heightToDp(4),
                marginBottom: heightToDp(8)
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
};

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

export default MyDetails;