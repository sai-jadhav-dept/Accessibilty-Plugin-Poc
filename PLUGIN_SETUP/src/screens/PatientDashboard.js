import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Image, ScrollView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import Global from '../screens/Global';
import Logo from '../components/Logo';
import { scale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';
import Loader from '../components/Loader';
import Spinner from 'react-native-loading-spinner-overlay';
import { apiCall } from '../utils/ApiUtils';
import CommonButton from '../components/CommonButton';
import FastImage from 'react-native-fast-image';
import ToastMessage from '../components/ToastMessage';

const PatientDashboard = (props) => {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessageText, setToastMessageText] = useState("");
    let PatientsData = props?.route?.params?.personData;
    const [diseaseData, setDiseaseData] = useState([]);
    const patientOption = [{ "name": "Nurse Appointment" }];
    Global.patientAddress = PatientsData?.address;
    let PatientName = PatientsData?.firstName + " " + PatientsData?.lastName;
    let profilePathPatient = PatientsData?.profilePath;

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    };

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
            const response = await triggerApiCall('carecircle/getpatientdiseasedetails', body);
            setDiseaseData(response.diseaseData);
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

    useEffect(() => {
        Triggergetpatientdiseasedetails();
    }, []);

    const handleCareCircleNavigation = () => {
        if (props.route.params.from === "Dashboard") {
            navigation.navigate("Dashboard");
        } else {
            navigation.navigate("CareCircle");
        }
    }


    const handleNotificationsnavigation = () => {
        navigation.navigate('Notifications');
    }

    const handleHopeConnectnavigation = () => {
        navigation.navigate('HopeConnect', { selectedOption: "CHAT" });
    }

    const getTreatmentList = async () => {
        try {
            const body = {
                "patientId": Global.patientID,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('treatment/gettreatmentlist', body);
            setLoading(false);
            setDiseaseData(response.treatments);
            Global.patientDiseaseDetials = response.treatments;
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }

    }

    const handleDisease = () => {
        Global.fromCareCircle = true;
        navigation.replace("DiseaseSearch", { fromCareCircle: true, personData: props?.route?.params?.personData });
    }

    const handleBookService = () => {
        Global.fromCareCircle = true;
        Global.nurseSelecting.Type = "Nurse";
        Global.nurseSelecting.userTypeId = "3";
        navigation.navigate("AddServices");
    }

    const handleDiseasePageNavigation = async (item) => {
        if (!Global.clicked) {
            Global.clicked = true;
            Global.diseaseID = item.id;
            await getTreatmentList()
            Global.fromCareCircle = true;
            navigation.replace('YourTreatments', { diseaseData: item, fromCareCircle: true, personData: props?.route?.params?.personData });
            Global.clicked = false;
        }
    }

    const treatmentNavigation = async (value, name, diseaseId) => {
        Global.diseaseID = diseaseId;
        Global.selectedCycle = value.id
        Global.selectedDiseaseName = name;
        Global.selectedTreatmentType = value.name.split(" - ")[0];
        Global.fromCareCircle = true;
        navigation.replace("TreatmentData", { selectedTab: "vitals", fromCareCircle: true, personData: props?.route?.params?.personData });
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <Logo
                visible={true}
                profile={true}
                setToastVisible={setToastVisible}
                setToastMessageText={setToastMessageText}
                extraStyles={{ paddingLeft: widthToDp(2) }}
                bellFn={() => handleNotificationsnavigation()}
                chatFn={() => handleHopeConnectnavigation()}
            />
            <View style={GlobalStyles.mainBox}>
                <View style={styles.headerContainer}>
                    <Pressable
                        style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, styles.headerBackArrowContainer])}
                        onPress={() => handleCareCircleNavigation()}>
                        <VectorIcons groupName='AntDesign' iconName="arrowleft" iconstyle={{ color: Colors.primaryTextColor }} />
                    </Pressable>
                    <View style={{ flexDirection: 'column', marginLeft: widthToDp(2) }}>
                        <FastImage
                            resizeMode={FastImage.resizeMode.cover}
                            style={{
                                marginTop: heightToDp(1),
                                height: scale(40),
                                width: scale(40),
                                borderColor: Colors.primaryButtonColor,
                                borderWidth: 3,
                                borderRadius: 50,
                                overflow: 'hidden',
                                marginBottom: heightToDp(0.5)
                            }}
                            source={profilePathPatient !== "" ? { uri: `${profilePathPatient}` } : require('../assets/images/profile.png')}
                        />
                    </View>
                    <Text numberOfLines={2} style={[GlobalStyles.largeText, styles.headerTitle, Fonts.Nunito_700Bold, {
                        fontSize: responsiveFont(20), width: "79%"
                    }]}>
                        {`${props?.route?.params?.personData?.patientName || PatientName}`}'s Dashboard
                    </Text>

                </View>

                <ScrollView>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <FlatList
                            keyExtractor={(item, index) => "key" + index}
                            data={diseaseData}
                            renderItem={({ item, index }) => {
                                return (
                                    <View key={index} style={[{ marginVertical: heightToDp(1) }]}>
                                        <Pressable
                                            style={({ pressed }) => ([GlobalStyles.inputBoxShadow, {
                                                opacity: pressed ? 0.5 : 1,
                                                backgroundColor: Colors.primaryButtonColor,
                                                overflow: "hidden",
                                                width: '100%',
                                                borderRadius: 14,
                                                padding: widthToDp(6),
                                            }])}
                                            onPress={async () => {
                                                await handleDiseasePageNavigation(item);
                                            }}
                                        >
                                            <>
                                                <Image resizeMode='contain' style={styles.sliceImage} source={require("../assets/vectors/Fill_7.png")} />
                                                <Image resizeMode='contain' style={styles.BluetriangleImage} source={require("../assets/vectors/Fill_8.png")} />
                                                <Image resizeMode='contain' style={styles.BluesecondarysliceImage} source={require("../assets/vectors/Fill_7.png")} />
                                            </>
                                            <View style={[styles.diseaseContainer]}>
                                                <View style={[styles.BoxLeft]}>
                                                    <Text style={[Fonts.Nunito_600SemiBold,
                                                    GlobalStyles.mediumText,
                                                    { color: Colors.defaultBackground, fontSize: responsiveFont(scale(18)), width: "80%" }]}>
                                                        {item.name}
                                                    </Text>
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
                                                                        treatmentNavigation(values, item.name, item.id)
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
                        <FlatList
                            keyExtractor={(item, index) => "key" + index}
                            data={patientOption}
                            renderItem={({ item, index }) => {
                                return (
                                    <View key={index} style={[{ marginVertical: heightToDp(1), marginBottom: widthToDp(6) }]}>
                                        <Pressable
                                            style={({ pressed }) => ([GlobalStyles.inputBoxShadow, {
                                                opacity: pressed ? 0.5 : 1,
                                                backgroundColor: Colors.primaryButtonColor,
                                                overflow: "hidden",
                                                width: '100%',
                                                borderRadius: 14,
                                                padding: widthToDp(6),
                                            }])}
                                            onPress={() => {
                                                navigation.navigate("NurseAppointmentScreen", { fromCareCircle: true, personData: PatientsData });
                                            }}
                                        >
                                            <>
                                                <Image resizeMode='contain' style={styles.sliceImage} source={require("../assets/vectors/Fill_7.png")} />
                                                <Image resizeMode='contain' style={styles.BluetriangleImage} source={require("../assets/vectors/Fill_8.png")} />
                                                <Image resizeMode='contain' style={styles.BluesecondarysliceImage} source={require("../assets/vectors/Fill_7.png")} />
                                            </>
                                            <View style={[styles.diseaseContainer]}>
                                                <View style={[styles.BoxLeft]}>
                                                    <Text style={[Fonts.Nunito_600SemiBold,
                                                    GlobalStyles.mediumText,
                                                    { color: Colors.defaultBackground, fontSize: responsiveFont(scale(18)), width: "80%" }]}>
                                                        {item.name}
                                                    </Text>
                                                    <View style={{ position: "absolute", right: 0 }}>
                                                        <Image style={styles.doctorImage} resizeMode='cover' source={require('../assets/vectors/apointment_white.png')}></Image>
                                                    </View>
                                                </View>
                                                <View>
                                                    <View style={{ marginTop: widthToDp(2) }}>
                                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText, { fontSize: responsiveFont(scale(12)), color: Colors.defaultBackground }]}>More Details</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </Pressable>
                                    </View>
                                )
                            }}
                        />
                    </View>
                </ScrollView>
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                {
                    Global.userType == "Caregiver" &&
                    <CommonButton
                        buttonText={"Book Care Buddy Service"}
                        onPress={() => { handleBookService(); }}
                        extraStyles={{ marginTop: heightToDp(2) }}
                    />
                }
                <CommonButton
                    buttonText={"Create New Treatment"}
                    onPress={() => { handleDisease(); }}
                    extraStyles={{ marginBottom: heightToDp(6), marginTop: heightToDp(2) }}
                />
            </View>
            <Footer navigation={navigation} />
            <ToastMessage visible={toastVisible} text={toastMessageText} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: 50
    },
    headerTitle: {
        marginLeft: widthToDp(3),
    },
    sliceImage: {
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
    cycleBtn: {
        backgroundColor: `${Colors.defaultBackground}55`,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: widthToDp(2),
        borderRadius: 14,
        marginVertical: heightToDp(1)
    }
});

export default PatientDashboard;