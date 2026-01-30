import { View, Text, SafeAreaView, StyleSheet, Pressable, ScrollView, Dimensions, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import CommonButton from '../components/CommonButton'
import Footer from '../components/Footer';
import VectorIcons from '../components/VectorIcons';
import Global from './Global';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import FieldLabel from '../components/FieldLabel';
import FastImage from 'react-native-fast-image';

export default function CareCircle() {
    const navigation = useNavigation();
    const windowHeight = Dimensions.get('window').height;
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [requestList, setRequestList] = useState([]);
    const [familyList, setFamilyList] = useState([]);
    const [pendingUserList, setPendingUserList] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [selectedUserInfo, setSelectedUserInfo] = useState({});

    const updatecarecirclerequest = async (item, status) => {
        if (!Global.clicked) {
            Global.clicked = true;
            try {
                const body = {
                    "requestId": item.requestId,
                    "status": status,
                    "userId": Global.userID,
                    "caregiverId": item.id,
                    "caregiverName": Global.userType == "Caregiver" ? Global.userInfo.firstName : item.firstName,
                    "patientName": Global.userType == "Caregiver" ? item.firstName : Global.userInfo.firstName,
                    "templateName": status == "2" ? "PATIENT_DENIED_REQUEST" : "PATIENT_ACCEPTING_REQUEST",
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };

                setLoading(true);
                await apiCall('carecircle/updatecarecirclerequest', body);
                getInitailData();
                setLoading(false);
            } catch (e) {
                console.log(e, 'e');

                setLoading(false);
                DisplayError(e.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    };

    const getPendingCareCirleRequestList = async () => {
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
            const response = await apiCall('carecircle/getpendingcarecirclerequestlist', body);
            setRequestList(response.userData)
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const getcarecirclelist = async () => {
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
            const response = await apiCall('carecircle/getcarecirclelist', body);
            const updatedFamilyList = [];
            const pendingList = [];
            response.userData.forEach(item => {
                if (item.status === "Rejected" || item.status === "" || item.status === "Pending") {
                    pendingList.push(item);
                } else {
                    updatedFamilyList.push(item);
                }
            });
            setFamilyList(updatedFamilyList);
            setPendingUserList(pendingList);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const getcarecirclepatientlist = async () => {
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
            const response = await apiCall("carecircle/getcarecirclepatientlist", body);
            const updatedFamilyList = [];
            const pendingList = [];
            response.patientData.forEach(item => {
                if (item.status === "Rejected" || item.status === "" || item.status === "Pending") {
                    pendingList.push(item);
                } else {
                    updatedFamilyList.push(item);
                }
            });
            setFamilyList(updatedFamilyList);
            setPendingUserList(pendingList);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    };

    const getInitailData = async () => {
        await getPendingCareCirleRequestList();
        if (Global.userType === "Patient") {
            await getcarecirclelist();
        } else {
            await getcarecirclepatientlist();
        }
    }

    useEffect(() => {
        getInitailData();
    }, []);

    const PatientDashboardNavigation = (item) => {
        if (Global.userType != "Patient") {
            Global.patientID = item.id;
            Global.patientName = item.firstName;
            Global.patientUserId = item.patientUserId;
            Global.NR_Patient = item.isRegistered;
            navigation.replace("PatientDashboard", { personData: item })
        } else {
            setSelectedUserInfo(item);
            setShowInfo(true);
        }
    };

    const onReSendClick = (item) => {
        navigation.replace("PatientDetails", { UserData: item, fromScreen: "CareCircle" });
    };

    const formatDate = (requestedOn) => {
        const currentDate = new Date();
        const requestedDate = new Date(requestedOn);
        const timeDiff = currentDate.getTime() - requestedDate.getTime();
        const oneDayInMillis = 24 * 60 * 60 * 1000;

        if (timeDiff < oneDayInMillis) {
            const hours = requestedDate.getHours();
            const minutes = requestedDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes.toString().padStart(2, '0');
            return `${formattedHours}:${formattedMinutes} ${ampm}`;
        } else if (timeDiff < 2 * oneDayInMillis) {
            return 'Yesterday';
        } else {
            const day = requestedDate.getDate().toString().padStart(2, '0');
            const month = requestedDate.toLocaleString('default', { month: 'long' });
            const year = requestedDate.getFullYear();
            return `${day} ${month} ${year}`;
        }
    };

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={Global.userType == "Caregiver" ? "My Patients" : "Care Circle"}
                    onPress={() => { navigation.navigate("Dashboard") }}
                />
                <View style={{ marginBottom: heightToDp(2) }}>
                    <ScrollView keyboardShouldPersistTaps={"handled"} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: windowHeight - 100 }} nestedScrollEnabled={true}>
                        {
                            requestList.length > 0 && (
                                requestList.map((item, index) => {
                                    return (
                                        <View style={[styles.mainContainer]} key={index}>
                                            <View style={[{ flexDirection: 'row', justifyContent: 'flex-start' }, GlobalStyles.inputBoxShadow]}>
                                                <View style={[{
                                                    position: 'relative',
                                                    width: widthToDp(14),
                                                    height: heightToDp(6),
                                                }]}>
                                                    <FastImage
                                                        resizeMode={FastImage.resizeMode.contain}
                                                        style={styles.profileImage}
                                                        source={item.profilePath !== "" ? { uri: item.profilePath, priority: FastImage.priority.high, cache: 'web' } : require('../assets/images/profile.png')}
                                                    />
                                                    <View style={styles.underline} />
                                                </View>
                                                <View style={styles.profileContainer}>
                                                    <View style={[{
                                                        flexDirection: 'column',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'flex-start',
                                                        flex: 1,
                                                        marginRight: widthToDp(2),
                                                        borderBottomRightRadius: 0,
                                                        borderBottomLeftRadius: 0
                                                    }]}>
                                                        <View style={{ flexDirection: 'row', width: '97%', justifyContent: 'space-between' }}>
                                                            <Text style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                                {item.firstName} {item.lastName}
                                                            </Text>
                                                            <Text style={[{ color: 'rgba(45, 49, 66, 0.8)', fontSize: scale(12) }, Fonts.Nunito_600SemiBold]}>
                                                                {formatDate(item.requestedOn)}
                                                            </Text>
                                                        </View>
                                                        <Text numberOfLines={3} style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                                                            {item.firstName} {item.lastName} wants to be in your connection as {item.relation}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginLeft: '20%', marginVertical: heightToDp(1) }}>
                                                <Pressable
                                                    onPress={async () => {
                                                        await updatecarecirclerequest(item, "2");
                                                    }}
                                                    style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                                        paddingHorizontal: widthToDp(4),
                                                        paddingVertical: heightToDp(2),
                                                        backgroundColor: pressed ? Colors.textInputBorder : Colors.defaultBackground,
                                                        borderRadius: 14
                                                    },
                                                    GlobalStyles.inputBoxShadow
                                                    ])}>
                                                    <VectorIcons groupName='Ionicons' iconName='close' iconsize={scale(17)} iconstyle={[{ color: Colors.red }]} />
                                                    <Text style={[{ marginLeft: 4, color: Colors.red, fontSize: scale(12) }, Fonts.Nunito_600SemiBold]}>
                                                        Decline
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={async () => {
                                                        await updatecarecirclerequest(item, "1");
                                                    }}
                                                    style={({ pressed }) => ([GlobalStyles.rowFlexstart,
                                                    {
                                                        paddingHorizontal: widthToDp(4),
                                                        paddingVertical: heightToDp(2),
                                                        backgroundColor: pressed ? Colors.textInputBorder : Colors.primaryButtonColor,
                                                        borderRadius: 14,
                                                        marginLeft: widthToDp(4)
                                                    },
                                                    GlobalStyles.inputBoxShadow
                                                    ])}>
                                                    <VectorIcons groupName='Feather' iconName='check' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.boxBackground }]} />
                                                    <Text style={[GlobalStyles.backgroundextrasmallText, { marginLeft: 4 }, Fonts.Nunito_600SemiBold]}>
                                                        Accept
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    )
                                })
                            )
                        }
                        {familyList.length > 0 && (
                            <View>
                                {
                                    familyList.map((item, index) => {
                                        return (
                                            <View key={index}>
                                                <Pressable style={({ pressed }) => ([{ opacity: pressed && Global.userType != "Patient" ? 0.4 : 1, alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: heightToDp(2) }])}
                                                    onPress={() => { PatientDashboardNavigation(item); }}
                                                >
                                                    <View style={{ width: "80%" }}>
                                                        <Text numberOfLines={1} style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>{item.firstName} {item.lastName}</Text>
                                                        <View>
                                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, styles.Cardheading]}>{item.relation}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ width: "20%" }}>
                                                        <FastImage
                                                            resizeMode={FastImage.resizeMode.cover}
                                                            style={styles.profileimage}
                                                            source={item.profilePath !== "" ? { uri: item.profilePath, priority: FastImage.priority.high, cache: 'web' } : require('../assets/images/profile.png')}
                                                        />
                                                        {Global.userType == "Caregiver" && <Pressable style={{ width: "100%" }} onPress={() => { navigation.navigate("PatientDetailsForm", { UserData: item, id: item.id, fromScreen: "CareCircle", viewRelation: true, setting: true }) }}>
                                                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold, { color: Colors.primaryButtonColor, textAlign: "center", marginTop: widthToDp(2) }]}>Edit profile</Text>
                                                        </Pressable>}
                                                    </View>
                                                </Pressable>
                                                <View style={{ alignSelf: "center", width: "100%", height: 2, backgroundColor: Colors.textInputBorder, marginTop: heightToDp(2) }}></View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        )}
                        {pendingUserList.length > 0 && (
                            <View style={{ marginTop: heightToDp(2) }}>
                                <FieldLabel text={"Consent Status"} extraStyles={[GlobalStyles.buttonlargeText]} />
                                {
                                    pendingUserList.map((item, index) => {
                                        return (
                                            <View key={index}>
                                                <Pressable style={({ pressed }) => ([{ opacity: pressed && Global.userType == "Patient" ? 0.4 : 1, alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: heightToDp(2) }])}>
                                                    <FastImage
                                                        resizeMode={FastImage.resizeMode.cover}
                                                        style={styles.profileimage}
                                                        source={item.profilePath !== "" ? { uri: item.profilePath, priority: FastImage.priority.high, cache: 'web' } : require('../assets/images/profile.png')}
                                                    />
                                                    <View style={{ width: "80%", height: "100%", flexDirection: "row" }}>
                                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { width: "67%" }]}>{item.firstName} {item.lastName}</Text>
                                                        {item.status === "" ? (
                                                            <View>
                                                                <Pressable style={({ pressed }) => ([styles.resendBtn, { opacity: pressed ? 0.5 : 1 }])}
                                                                    onPress={() => onReSendClick(item)}
                                                                >
                                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { color: Colors.lightblue, width: widthToDp(20), textAlign: "center" }]}>Request Consent</Text>
                                                                </Pressable>
                                                            </View>
                                                        ) : item.status === "Pending" ? (
                                                            <View style={{ width: "33%", height: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                                                <View style={{ paddingHorizontal: widthToDp(2), justifyContent: "center", }}>
                                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>Pending</Text>
                                                                </View>
                                                            </View>
                                                        ) :
                                                            <View style={{ width: "33%", height: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                                <View style={{ justifyContent: "center", alignItems: "center" }}>
                                                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { paddingHorizontal: widthToDp(2), color: Colors.red }]}>Rejected</Text>
                                                                    <Pressable style={({ pressed }) => ([styles.resendBtn, { opacity: pressed ? 0.5 : 1, paddingHorizontal: widthToDp(4) }])}
                                                                        onPress={() => onReSendClick(item)}
                                                                    >
                                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { color: Colors.lightblue }]}>Re send</Text>
                                                                    </Pressable>
                                                                </View>
                                                            </View>}
                                                    </View>
                                                </Pressable>
                                                <View style={{ alignSelf: "center", width: "100%", height: 2, backgroundColor: Colors.textInputBorder, marginTop: heightToDp(2) }} />
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        )}
                        {requestList.length > 0 || familyList.length > 0 || pendingUserList.length > 0 ? null :
                            <View style={styles.appointmenttext}>
                                <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                    Click&nbsp;
                                </Text>
                                <VectorIcons groupName='MaterialIcons' iconName='search' iconsize={18} />
                                <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                    &nbsp;to Add New Care Circle
                                </Text>
                            </View>
                        }
                    </ScrollView>
                    <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                    <Spinner
                        visible={loading}
                        color={Colors.primaryButtonColor}
                        customIndicator={<Loader />}
                        textStyle={{ color: Colors.primaryButtonColor }}
                    />
                </View>
            </View>
            <View style={{ marginHorizontal: widthToDp(4) }}>
                <CommonButton
                    buttonText={Global.userType === "Patient" ? "Add Caregiver" : "Add Patient"}
                    onPress={() => {
                        navigation.replace("CareCircleSearch", { fromCareCircle: true })
                    }}
                    extraStyles={[{ marginVertical: heightToDp(6) }]}
                />
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Footer navigation={navigation} activeScreen={"Family"} />
            <Modal visible={showInfo} transparent={true} animationType="slide" >
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: "95%", backgroundColor: Colors.defaultBackground, borderRadius: 14, padding: widthToDp(5), position: "relative" }}>
                        <Pressable style={styles.modalCloseButton} onPress={() => setShowInfo(false)}>
                            <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(25)} iconstyle={{ color: Colors.placeholderTextColor }} />
                        </Pressable>
                        <View style={{ width: "100%", alignItems: "center", flexDirection: "row" }}>
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={{ width: widthToDp(20), height: widthToDp(20), backgroundColor: Colors.boxBackground, borderRadius: widthToDp(30) }}
                                source={selectedUserInfo.profilePath !== "" ? { uri: selectedUserInfo.profilePath, priority: FastImage.priority.high, cache: 'web' } : require('../assets/images/profile.png')}
                            />
                            <View style={{ marginLeft: widthToDp(5) }}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{`${selectedUserInfo.firstName} ${selectedUserInfo.lastName}`}</Text>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{selectedUserInfo.applicationId}</Text>
                            </View>
                        </View>
                        {selectedUserInfo.email && <View style={{ marginTop: heightToDp(2), flexDirection: "row", alignItems: "center" }}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "25%" }]}>Email :</Text>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { padding: widthToDp(2), paddingHorizontal: widthToDp(4), backgroundColor: Colors.lightblue, borderRadius: 14, flex: 1 }]}>{selectedUserInfo.email}</Text>
                        </View>}
                        {selectedUserInfo.mobileNumber && <View style={{ marginTop: heightToDp(2), flexDirection: "row", alignItems: "center" }}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "25%" }]}>Phone :</Text>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { padding: widthToDp(2), paddingHorizontal: widthToDp(4), backgroundColor: Colors.lightblue, borderRadius: 14, flex: 1 }]}>{`${selectedUserInfo.countryCode} ${selectedUserInfo.mobileNumber}`}</Text>
                        </View>}
                        <View style={{ marginTop: heightToDp(2), flexDirection: "row", alignItems: "center" }}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { width: "25%" }]}>Relation :</Text>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { padding: widthToDp(2), paddingHorizontal: widthToDp(4), backgroundColor: Colors.lightblue, borderRadius: 14, flex: 1 }]}>{selectedUserInfo.relation}</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    heading: {
        marginTop: heightToDp(2),
        color: Colors.primaryButtonColor,
    },
    Cardheading: {
        marginTop: heightToDp(1),
        color: Colors.primaryButtonColor,
    },
    profileimage: {
        alignSelf: "center",
        borderRadius: 50,
        height: scale(53),
        width: scale(53),
        backgroundColor: Colors.boxBackground
    },
    searchContainer: {
        flex: 1,
        marginHorizontal: widthToDp(1),
        width: "90%",
        alignSelf: "center"
    },
    mainContainer: {
        alignItems: 'center',
        padding: widthToDp(2),
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginTop: heightToDp(2)
    },
    profileImage: {
        width: widthToDp(11),
        height: heightToDp(6),
        marginRight: widthToDp(2),
    },
    underline: {
        position: "absolute",
        backgroundColor: Colors.primaryButtonColor,
        height: 12,
        width: 12,
        borderRadius: 50,
        bottom: 0,
        right: widthToDp(3),
        zIndex: 999
    },
    profileContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    startBtn: {
        position: "absolute",
        bottom: heightToDp(13),
        right: widthToDp(5),
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primaryButtonColor,
        padding: widthToDp(2),
        borderRadius: 14,
        minWidth: widthToDp(45)
    },
    appointmenttext: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: heightToDp(25)
    },
    appointmentdesc: {
        color: Colors.primaryinactive,
        fontSize: scale(16),
    },
    modalCloseButton: {
        position: "absolute",
        backgroundColor: Colors.boxBackground,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        right: widthToDp(4),
        top: widthToDp(4),
        zIndex: 999,
    },
    resendBtn: {
        backgroundColor: Colors.primaryButtonColor,
        paddingVertical: widthToDp(2),
        paddingHorizontal: widthToDp(2),
        borderRadius: 14,
        marginTop: widthToDp(1)
    }
});