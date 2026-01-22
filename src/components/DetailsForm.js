import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, SafeAreaView, Keyboard } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';
import ProfileBar from './ProfileBar';
import { Dropdown } from 'react-native-element-dropdown';
import countrycode from '../assets/mdm/countrycode.json';
import DateSelect from './DateSelect';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import RadioButton from './RadioButton';
import Global from '../screens/Global';
import FieldLabel from './FieldLabel';
import { scale } from 'react-native-size-matters';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from './Loader';
import WarningModal from './WarningModal';
import { DeleteMasterData, GetMasterJSONData, InsertMasterData, InsertMasterDataTimeStamp, ValidateExpiry } from '../utils/ExecuteDBQuery';

const DetailsForm = (props) => {
  const [firstName, setFirstName] = useState('');
  const [image, setImage] = useState('');
  const [showOptionDropdown, setShowOptionDropdown] = useState(false);
  let [selectedGender, setSelectedGender] = useState('');
  let [pincode, setPincode] = useState('');
  let [selectedRelation, setSelectedRelation] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [address, setAddress] = useState("");
  const [patientRelation, setPatientRelation] = useState([]);
  const [aadharNumber, setAadharNumber] = useState("");
  const GenderOptions = [
    {
      option: 'Male',
    },
    {
      option: 'Female',
    },
  ];
  const SelectedCountryCode = Global.selectedCountryCode;
  const mobileNo = props.mobileNumber ? props.mobileNumber : Global.inputValue;
  const emailAddress = props.emailAddress ? props.emailAddress : "";

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

  const setGenderData = async (data) => {
    const males = [];
    const females = [];
    data.forEach(item => {
      if (item.genderCategory === 'Both') {
        males.push(item);
        females.push(item);
      } else if (item.genderCategory === 'Male') {
        males.push(item);
      } else if (item.genderCategory === 'Female') {
        females.push(item);
      }
    });
    setPatientRelation(Global.userInfo.gender == "Male" ? males : females);
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
        setGenderData(JSON.parse(masterJsonData));
      }
      setLoading(false);
    }
  }

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
      await setGenderData(response.relation)
      setLoading(false);
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  const DisplayError = (text) => {
    setWarningText(text)
    setShowModal(true);
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
      }
      setLoading(true);
      const response = await triggerApiCall('registration/getuser', body);
      props.getAadharNumber(response.userInfo.aadharNumber);
      setAadharNumber(response.userInfo.aadharNumber);
      props.getMobileNo(response.userInfo.mobileNumber);
      props.getEmailAddress(response.userInfo.emailAddress);
      setFirstName(response.userInfo.firstName);
      props.getFirstName(response.userInfo.firstName);
      setSelectedGender(response.userInfo.gender);
      props.getGender(response.userInfo.gender);
      setDob(response.userInfo.dob);
      props.getDateOfBirth(response.userInfo.dob);
      setPincode(response.userInfo.pincode);
      props.getPincode(response.userInfo.pincode);
      setAddress(response.userInfo.address);
      props.setAddress(response.userInfo.address);
      setImage(response.userInfo.profilePicturePath);
      props.getimage(response.userInfo.profilePicturePath);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
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

  const getPatientData = async () => {
    try {
      const body = {
        "patientId": props.id,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await apiCall('registration/getpatientdata', body);
      const patientData = response.patientData;
      if (patientData.firstName) {
        props.getAadharNumber(patientData.aadharNumber);
        setAadharNumber(patientData.aadharNumber);
        setFirstName(patientData.firstName);
        props.getFirstName(patientData.firstName);
        setSelectedRelation(patientData.relation);
        props.getSelectedRelation(patientData.relation == "Self" ? 1 : patientData.relation);
        setSelectedGender(patientData.gender);
        props.getGender(patientData.gender);
        setDob(patientData.dob);
        props.getDateOfBirth(patientData.dob);
        setImage(patientData.profilePicturePath);
        props.getimage(patientData.profilePicturePath);
        setPincode(patientData.pincode);
        props.getPincode(patientData.pincode);
        setAddress(patientData.address);
        props.setAddress(patientData.address);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  useEffect(() => {
    getDataFromMaster();
    if (props.isPatientForm && props.id != "0") {
      getPatientData();
    }
  }, []);

  useEffect(() => {
    if (props.fromSetting && !props.viewRelation) {
      GetUser();
    }
  }, []);

  useEffect(() => {
    const showKeyboard = Keyboard.addListener('keyboardDidShow', () => {
      setShowOptionDropdown(false);
    });
    return () => {
      showKeyboard.remove();
    };
  }, []);

  const onGenderSelect = (item) => {
    setSelectedGender(item.option);
    setShowOptionDropdown(false);
    props.getGender(item.option);
    Keyboard.dismiss();
  };


  const handleModalClose = () => {
    setShowOptionDropdown(false);
  }
  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <Pressable onPress={() => handleModalClose()}>
        <ProfileBar
          isPatientProfile={props.isPatientForm}
          isProfileExists={false}
          showOptionDropdown={showOptionDropdown}
          setshowOptionDropdown={setShowOptionDropdown}
          image={image}
          getimage={(text) => { props.getimage(text) }}
        />
        {(props.isPatientForm && props.viewRelation) && (
          <>
            <FieldLabel text={"I am"} mandatory={true} />
            <View style={styles.dropdownContainer}>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                inputSearchStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                iconStyle={{ width: 20, height: 20 }}
                itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                itemContainerStyle={{ paddingHorizontal: 5, margin: -5 }}
                data={patientRelation}
                placeholder="Select*"
                maxHeight={300}
                labelField="relation"
                valueField="relation"
                value={selectedRelation}
                onChange={item => {
                  setSelectedRelation(item.relation);
                  props.getSelectedRelation(item.id);
                }}
                disable={props.fromSetting}
              />
            </View>
          </>
        )}
        <FieldLabel text="Please Enter Details As Per The Aadhar Card" TextType={"small"} extraStyles={{ color: Colors.secondarybuttonColor }} />
        <FieldLabel text={props.isPatientForm ? "Patient's Name" : 'Name'} mandatory={true} />
        <TextInput
          keyboardType="default"
          placeholder="Name*"
          editable={!props.fromSetting}
          placeholderTextColor={Colors.placeholderTextColor}
          style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
          value={props.isPatientForm ? firstName : props.fromSetting ? firstName : props.firstName}
          onChangeText={text => {
            setFirstName(text);
            props.getFirstName(text);
          }}
        />
        {!props.isPatientForm && (
          <View>
            <FieldLabel text={"Mobile Number"} mandatory={true} />
            <View
              style={{
                width: '95%',
                flexDirection: 'row',
                backgroundColor: Colors.boxBackground,
                borderRadius: 14,
                margin: 5,
                alignItems: 'center',
                paddingVertical: heightToDp(1),
                marginTop: heightToDp(2)
              }}>
              <Dropdown
                style={{
                  height: heightToDp(4),
                  borderColor: Colors.primaryinactive,
                  borderRadius: 14,
                  paddingHorizontal: 8,
                  width: '31%',
                  marginLeft: '2%',
                  color: Colors.boxBackground
                }}
                placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(scale(18)) }]}
                selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(scale(18)) }]}
                placeholderTextColor={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(scale(18)) }]}
                iconStyle={{ width: 20, height: 20 }}
                data={countrycode}
                placeholder={"IN +91"}
                autoScroll={false}
                maxHeight={300}
                labelField="label"
                valueField="label"
                itemTextStyle={[GlobalStyles.mediumText]}
                disable={true}
                value={SelectedCountryCode}
                onChange={item => { props.getCountryCode(item.value) }}
              />
              <TextInput
                keyboardType="numeric"
                placeholder="Enter Mobile No."
                maxLength={10}
                placeholderTextColor={Colors.placeholderTextColor}
                style={[GlobalStyles.normalText, { marginTop: -widthToDp(1), paddingLeft: 15, width: "65%" }]}
                editable={props.fromSetting ? false : Global.inputType != "Mobile"}
                value={mobileNo}
                onChangeText={text => { props.getMobileNo(text) }} />
            </View>
            <FieldLabel text={"Email Address"} mandatory={true} />
            <TextInput
              autoCapitalize="none"
              keyboardType="default"
              placeholder="Enter E-Mail Address"
              placeholderTextColor={Colors.placeholderTextColor}
              style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
              editable={props.fromSetting ? false : Global.inputType != "Email"}
              value={emailAddress}
              onChangeText={text => { props.getEmailAddress(text); }}
            />
          </View>
        )}
        <FieldLabel text={"Pincode"} mandatory={true} />
        <TextInput
          keyboardType="numeric"
          placeholder="Enter Pincode"
          maxLength={6}
          placeholderTextColor={Colors.placeholderTextColor}
          style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
          value={pincode}
          onChangeText={text => {
            setPincode(text)
            props.getPincode(text);
            if (text.length == 6) Keyboard.dismiss();
          }}
        />
        {(props.isPatientForm || Global.userType === "Patient") && (
          <>
            <FieldLabel text={"Address"} mandatory={true} />
            <TextInput
              autoCapitalize="none"
              keyboardType="default"
              placeholder="Enter Address"
              maxLength={500}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor={Colors.placeholderTextColor}
              style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
              value={address}
              onChangeText={text => {
                props.setAddress(text);
                setAddress(text);
              }}
            />
          </>
        )}
        <FieldLabel text={props.isPatientForm ? "Patient's Gender" : 'Gender'} extraStyles={{ marginVertical: widthToDp(2) }} mandatory={true} />
        <View style={styles.optioncontainer}>
          {GenderOptions.map((item, index) => (
            <Pressable key={index}
              onPress={() => !props.fromSetting && onGenderSelect(item)}
              style={({ pressed }) => [{ opacity: pressed ? 0.4 : 1 }, styles.optionBox]}>
              <View style={{ flexDirection: 'column', alignItems: 'center', width: '70%', marginLeft: -widthToDp(2) }}>
                <Text
                  style={[{
                    color: item.option == selectedGender ? Colors.primaryButtonColor : Colors.placeholderTextColor,
                    fontSize: responsiveFont((18)),
                    marginHorizontal: widthToDp(1)
                  },
                  Fonts.Nunito_600SemiBold
                  ]}>
                  {item.option}
                </Text>
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                {item.option == selectedGender ? (
                  <RadioButton selected={true} backgroundColor={Colors.primaryButtonColor} />
                ) : (
                  <RadioButton selected={false} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <FieldLabel text={props.isPatientForm ? "Patient's Date of Birth" : 'Date of Birth'} extraStyles={{ marginVertical: widthToDp(2) }} mandatory={true} />
        <DateSelect
          DisplayError={props.DisplayError}
          extraStyles={{ width: '95%', alignSelf: 'center', marginTop: heightToDp(2) }}
          isPatientForm={props.isPatientForm}
          fromSetting={props.fromSetting}
          SelectedRelation={selectedRelation}
          dob={dob}
          addingPatient={props.addingPatient}
          setaddingPatient={props.setaddingPatient}
          getDateOfBirth={props.getDateOfBirth}
        />

        {
          !props.fromSetting &&
          <View>
            <FieldLabel text={"Aadhar Number"} />
            {
              props.viewRelation &&
              <FieldLabel TextType={"small"} text={"(Mandatory for above 5 years)"} Nospace={true} />
            }
            <View style={[styles.adharInputContainer]}>
              <TextInput
                keyboardType="numeric"
                placeholder="12 Digit Aadhar Number"
                editable={!props.fromSetting}
                maxLength={12}
                placeholderTextColor={Colors.placeholderTextColor}
                style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { width: "100%" }]}
                value={aadharNumber}
                onChangeText={text => {
                  props.getAadharNumber(text);
                  setAadharNumber(text)
                }}
              />
            </View>
          </View>
        }

        {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
        <Spinner
          visible={loading}
          color={Colors.primaryButtonColor}
          customIndicator={<Loader />}
          textStyle={{ color: Colors.primaryButtonColor }}
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: heightToDp(7),
    borderColor: Colors.primaryinactive,
    borderRadius: 14,
    paddingHorizontal: 10,
    color: Colors.placeholderTextColor
  },
  placeholderStyle: {
    marginLeft: widthToDp(2),
    fontSize: scale(18),
    color: Colors.placeholderTextColor
  },
  optioncontainer: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: heightToDp(2)
  },
  optionBox: {
    width: "46.5%",
    backgroundColor: Colors.boxBackground,
    borderRadius: 14,
    paddingVertical: heightToDp(2),
    paddingHorizontal: widthToDp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdownContainer: {
    width: '95%',
    flexDirection: 'column',
    backgroundColor: Colors.boxBackground,
    borderRadius: 14,
    margin: 7,
    marginTop: heightToDp(2),
    marginBottom: heightToDp(0.2),
    paddingVertical: widthToDp(1)
  },
  adharInputContainer: {
    flexDirection: "row",
    width: "95%", alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between"
  },
  inputtype: {
    borderRadius: 14,
    backgroundColor: Colors.boxBackground,
    marginTop: heightToDp(2),
    width: '95%',
    alignSelf: 'center',
    padding: widthToDp(4),
  },
});
export default DetailsForm;