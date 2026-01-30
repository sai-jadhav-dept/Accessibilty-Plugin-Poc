import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Pressable, StyleSheet, FlatList, TextInput, Modal } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import VoiceSearch from '../components/VoiceSearch';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { scale, verticalScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader';
import Spinner from 'react-native-loading-spinner-overlay';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Global from './Global';
import RadioButton from '../components/RadioButton';
import CommonButton from '../components/CommonButton';
import FieldLabel from '../components/FieldLabel';
import VectorIcons from '../components/VectorIcons';
import FastImage from 'react-native-fast-image';
import { DeleteMasterData, GetMasterJSONData, InsertMasterData, InsertMasterDataTimeStamp, ValidateExpiry } from '../utils/ExecuteDBQuery';
import { Dropdown } from 'react-native-element-dropdown';
import countrycode from '../assets/mdm/countrycode.json'


const CareCircleSearch = (props) => {
    const [patientRelation, setPatientRelation] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [inviteModal, setInviteModal] = useState(false);
    const [noResult, setNoResult] = useState(false)
    const fromCareCircle = props?.route?.params?.fromCareCircle;
    const fromConnect = props?.route?.params?.fromConnect;
    const [userList, setUserList] = useState([]);
    const [buttonStatus, setButtonStatus] = useState(false);
    const [locationActive, setLocationActive] = useState(false);
    const [idActive, setIdActive] = useState(false);
    const [genderActive, setGenderActive] = useState(false);
    const [name, setName] = useState("");
    const [pincode, setPincode] = useState("");
    const [userId, setUserId] = useState("");
    const [gender, setGender] = useState("");
    const [relationModal, setRelationModal] = useState(false);
    const [selectedRelation, setSelectedRelation] = useState("");
    const [selectedPerson, setSelectedPerson] = useState({});
    let [selectedCountryCode, setSelectedCountryCode] = useState('IN +91');

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
        setPatientRelation(Global.userInfo.gender == "Male" ? males : females)
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
            await setGenderData(response.relation)
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

    const Triggergetuserlist = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            try {
                const body = {
                    "userId": Global.userID,
                    "name": name.trim(),
                    "gender": gender.trim(),
                    "pincode": pincode.toString(),
                    "applicationId": userId,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                setLoading(true);
                const response = await triggerApiCall('connect/getuserlist', body);
                setUserList(response.userData);
                setButtonStatus(true);
                Global.VoiceSearchedData = response.userData;
                setLoading(false);
                setNoResult(response.userData.length == 0 ? true : false);
            } catch (e) {
                setLoading(false);
                DisplayError(e.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    }

    const askForRelation = (personData) => {
        setSelectedPerson(personData);
        setRelationModal(true);
    }

    const Triggercreateconnetrequest = async (item) => {
        try {
            const body = {
                "userId": Global.userID,
                "peopleId": item.id,
                "patientName": Global.userType == "Caregiver" ? item.firstName : Global.userInfo.firstName,
                "userName": Global.userInfo.firstName,
                "templateName": "ConnectRequest",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            await triggerApiCall('connect/createconnetrequest', body);
            setLoading(false);
            inviteFunction();
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const sendcarecirclerequest = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            try {
                const body = {
                    "userId": Global.userID,
                    "careCircleId": selectedPerson.id,
                    "relationId": selectedRelation.toString(),
                    "patientName": Global.userType == "Caregiver" ? selectedPerson.firstName : Global.userInfo.firstName,
                    "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : selectedPerson.firstName,
                    "templateName": "CG_ADDING_REGISTERED_PATIENT",
                    "coord": ["24.623061", "10.830960"],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                await triggerApiCall("carecircle/sendcarecirclerequest", body);
                setLoading(false);
                inviteFunction();
            } catch (e) {
                setLoading(false);
                DisplayError(e.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    };

    const searchByPhoneNumber = async (searchValue) => {
        try {
            const body = {
                "userId": Global.userID,
                "userTypeId": Global.userType == "Caregiver" ? "1" : "2",
                "mobileNumber": searchValue,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await triggerApiCall('carecircle/searchcarecircleuser', body);
            setUserList(response.userData);
            setLoading(false);
            setNoResult(response.userData.length == 0 ? true : false);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const onSendInvite = async (item) => {
        if (fromCareCircle) {
            askForRelation(item);
        } else {
            if (!Global.clicked) {
                Global.clicked = true;
                await Triggercreateconnetrequest(item);
                Global.clicked = false;
            }
        }
    }

    const careCircleData = ({ item }) => {
        return (
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: widthToDp(2), alignItems: "center", width: '100%', }}>
                <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, flexDirection: "row", alignItems: "center", flex: 1, }]} >
                    <FastImage
                        resizeMode={FastImage.resizeMode.cover}
                        style={[styles.profileimage, { marginBottom: !fromCareCircle ? (item.firstName.length > 10 || item.lastName.length > 10 ? heightToDp(3) : null) : null }]}
                        source={item.profilePath !== "" ? { uri: item.profilePath } : require("../assets/images/profile.png")}
                    />
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: widthToDp(4), }}>
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.normalText,]}>
                                {item.firstName + " "}
                            </Text>
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.normalText,]}>
                                {item.lastName}
                            </Text>
                        </View>
                        {item.userId &&
                            <View style={{ marginLeft: widthToDp(4) }}>
                                <Text style={[Fonts.Nunito_400Regular, GlobalStyles.smallText, { color: Colors.modalBackground }]}>
                                    {item.userId}
                                </Text>
                            </View>
                        }
                    </View>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, }]}
                    onPress={async () => await onSendInvite(item)}>
                    <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.buttonnormalText]}>
                        Send Invite
                    </Text>
                </Pressable>
            </View>
        )
    }

    let userListApiCall = async () => {
        if (!fromCareCircle) {
            if (userList.length === 0 && name.trim() === "" && !buttonStatus) {
                DisplayError('Enter a Keyword to Search.');
                return;
            } else if (name.trim().length < 3 && name.trim().length > 0) {
                DisplayError('Please enter a name with at least three characters.');
                return;
            } else if (name.trim() === "" && !idActive && !genderActive && !locationActive) {
                DisplayError("Enter a Keyword to Search.");
                return;
            } else if (name.trim().length === 0 && userId.trim().length === 0 && pincode.trim().length === 0 && gender.trim().length === 0) {
                DisplayError("All search bars are empty");
                return;
            }
            else {
                await Triggergetuserlist();
            }
        }
        else if (fromCareCircle) {
            if (name.trim().length < 10) {
                DisplayError("Please Enter a valid mobile number with at least 10 digits ");
                return;
            }
            searchByPhoneNumber(name.trim());
        }
    }

    const inviteFunction = () => {
        setInviteModal(true);
        setTimeout(() => {
            setInviteModal(false);
            if (fromCareCircle) {
                navigation.navigate("CareCircle");
            } else {
                navigation.navigate('HopeConnect', { selectedOption: "CHAT" });
            }
        }, 2000);
    };

    const onBackPress = () => {
        if (fromCareCircle) {
            navigation.navigate("CareCircle")
        } else {
            navigation.navigate('HopeConnect', { selectedOption: "CHAT" })
        }
    }
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={fromCareCircle ? "Care Circle" : "Connect"}
                    onPress={onBackPress} />
                <View style={{ padding: verticalScale(6), width: '100%', flexDirection: 'row', backgroundColor: Colors.boxBackground, alignItems: 'center', justifyContent: 'space-between', borderRadius: scale(8) }}>
                    <Dropdown
                        style={[{ backgroundColor: Colors.defaultBackground }, styles.dropdown, Fonts.Nunito_600SemiBold]}
                        placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                        selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                        itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(scale(18)) }]}
                        iconStyle={styles.iconStyle}
                        data={countrycode}
                        // disable={true}
                        autoScroll={false}
                        maxHeight={300}
                        labelField="label"
                        valueField="label"
                        value={selectedCountryCode}
                        onChange={item => {
                            setSelectedCountryCode(item.label);
                        }}
                    />
                    <VoiceSearch
                        placeholderText={fromCareCircle ? "Phone Number" : "Search by name"}
                        getName={(text) => { setName(text) }}
                        data={userList}
                        isSearchButtonNeed={buttonStatus ? false : true}
                        onSearch={userListApiCall}
                        extraStyles={{
                            height: Global.OS == "ios" ? verticalScale(45) : null,
                            width: '65%',
                        }}
                        isMicNeeded={false}
                        keyboardType={fromCareCircle ? "numeric" : "default"}
                        isAutofocusRequired={fromCareCircle || fromConnect}
                    />
                </View>
                {!fromCareCircle &&
                    locationActive &&
                    <TextInput
                        keyboardType="numeric"
                        placeholder="Search by Pincode"
                        placeholderTextColor={Colors.placeholderTextColor}
                        style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, GlobalStyles.inputBoxShadow]}
                        value={pincode}
                        onChangeText={text => setPincode(text)}
                        maxLength={6}
                    />
                }
                {genderActive &&
                    <TextInput
                        keyboardType="default"
                        placeholder="Search by Gender"
                        placeholderTextColor={Colors.placeholderTextColor}
                        style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, GlobalStyles.inputBoxShadow]}
                        value={gender}
                        onChangeText={text => setGender(text.trim())}
                    />
                }
                {idActive &&
                    <TextInput
                        keyboardType="default"
                        placeholder="Search by Id"
                        placeholderTextColor={Colors.placeholderTextColor}
                        style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, GlobalStyles.inputBoxShadow]}
                        value={userId.toUpperCase()}
                        onChangeText={text => setUserId(text.toUpperCase())}
                    />
                }
                {
                    buttonStatus &&
                    !fromCareCircle &&
                    <View style={{ flexDirection: "row", marginVertical: heightToDp(2) }}>
                        <Pressable
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, backgroundColor: Colors.boxBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: Colors.boxBackground }]}
                        >
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>
                                Name
                            </Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, backgroundColor: locationActive ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: locationActive ? Colors.boxBackground : Colors.primaryinactive }]}
                            onPress={() => {
                                setLocationActive(!locationActive);
                                setPincode("");
                            }}
                        >
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>
                                Pincode
                            </Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, backgroundColor: genderActive ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: genderActive ? Colors.boxBackground : Colors.primaryinactive }]}
                            onPress={() => {
                                setGenderActive(!genderActive);
                                setGender("");
                            }}
                        >
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>
                                Gender
                            </Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [{ width: widthToDp(10), alignItems: "center", opacity: pressed ? 0.6 : 1, backgroundColor: idActive ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: idActive ? Colors.boxBackground : Colors.primaryinactive }]}
                            onPress={() => {
                                setIdActive(!idActive);
                                setUserId("");
                            }}>
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>
                                Id
                            </Text>
                        </Pressable>
                        <CommonButton
                            buttonText={"Search"}
                            extraStyles={[{ marginLeft: widthToDp(3), width: "25%", height: heightToDp(4), backgroundColor: Colors.primaryButtonColor }, GlobalStyles.extrasmallText]}
                            onPress={async () => await userListApiCall()}
                        />
                    </View>
                }
                <ScrollView style={{ marginTop: heightToDp(2) }}>
                    <FlatList
                        data={userList}
                        keyExtractor={(item, index) => 'key' + index}
                        renderItem={careCircleData}
                    />
                    {noResult &&
                        <View style={{ justifyContent: "center", alignItems: "center", marginTop: heightToDp(30) }}>
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold]}>No user found !</Text>
                        </View>
                    }
                </ScrollView>
                {Global.userType === "Caregiver" && <CommonButton
                    buttonText={"Add New Patient"}
                    extraStyles={[GlobalStyles.fixbottomcommonButton]}
                    onPress={() => { navigation.navigate("PatientDetailsForm", { id: 0, viewRelation: true, setting: false }) }}
                />}
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Modal visible={inviteModal} animationType={'fade'} transparent={true} style={{ height: heightToDp(20) }}>
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center", alignItems: "center" }}>
                    <View style={[styles.optionView, { justifyContent: "center", alignItems: "center" }]}>
                        <Text style={[GlobalStyles.largeText, styles.inviteMessage, Fonts.Nunito_600SemiBold]}>
                            Invite Sent
                        </Text>
                        <RadioButton selected={true} bigImage={true} backgroundColor={Colors.successColor} extraStyles={{ width: widthToDp(10), height: widthToDp(10), marginTop: heightToDp(2) }} />
                    </View>
                </View>
            </Modal>
            <Modal visible={relationModal} animationType={'fade'} transparent={true} style={{ height: heightToDp(20) }}>
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center", alignItems: "center" }}>
                    <View style={styles.optionView}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <FieldLabel text={"I am"} TextType={""} extraStyles={{ marginTop: -heightToDp(0), marginBottom: heightToDp(2) }} />
                            <Pressable
                                onPress={() => {
                                    setRelationModal(false);
                                    setSelectedRelation("");
                                }}>
                                <VectorIcons groupName='AntDesign' iconName='closecircle' iconstyle={[{ color: Colors.textInputBorder }]} />
                            </Pressable>
                        </View>
                        {patientRelation.map((value, i) => (
                            <Pressable style={styles.inviteOption}
                                onPress={() => setSelectedRelation(value.id)}>
                                <RadioButton selected={selectedRelation === value.id} backgroundColor={Colors.successColor} extraStyles={{ width: widthToDp(6), height: widthToDp(6) }} />
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { marginLeft: widthToDp(5) }]}>{value.relation}</Text>
                            </Pressable>
                        ))
                        }
                        <CommonButton
                            disabled={selectedRelation === ""}
                            buttonText={"Send invite"}
                            extraStyles={{ marginTop: heightToDp(2), backgroundColor: selectedRelation === "" ? Colors.textInputBorder : Colors.primaryButtonColor }}
                            onPress={async () => {
                                setRelationModal(false);
                                await sendcarecirclerequest();
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        marginTop: heightToDp(2),
        width: '95%',
        alignSelf: 'center',
        padding: widthToDp(4),
    },
    profileimage: {
        alignSelf: "flex-end",
        borderRadius: 50,
        height: scale(45),
        width: scale(45)
    },
    inviteMessage: {
        marginTop: heightToDp(2),
        paddingHorizontal: widthToDp(6),
        textAlign: "center",
    },
    optionView: {
        minHeight: heightToDp(18),
        width: widthToDp(80),
        padding: widthToDp(5),
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        shadowColor: Colors.primaryTextColor,
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
    },
    inviteOption: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: heightToDp(1)
    },
    dropdown: {
        fontSize: scale(50),
        height: heightToDp(7),
        borderRadius: 14,
        paddingHorizontal: widthToDp(2),
        marginHorizontal: scale(2),
        width: '35%',
    },
    iconStyle: {
        width: widthToDp(6),
        height: heightToDp(4),
    },
});

export default CareCircleSearch;
