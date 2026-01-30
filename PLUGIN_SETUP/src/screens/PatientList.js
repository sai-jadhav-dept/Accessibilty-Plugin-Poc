import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import GlobalStyles from "../utils/GlobalStyles";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useNavigation } from '@react-navigation/native';
import Global from "./Global";
import { apiCall } from "../utils/ApiUtils";
import WarningModal from "../components/WarningModal";
import Spinner from "react-native-loading-spinner-overlay";
import Colors from "../utils/Colors";
import Loader from "../components/Loader";
import FastImage from "react-native-fast-image";
import { scale } from "react-native-size-matters";
import { heightToDp } from "../utils/Responsive";
import Fonts from "../utils/Fonts";
import Footer from "../components/Footer";

export default function PatientList(props) {
    const navigation = useNavigation();
    const [familyList, setFamilyList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getcarecirclepatientlist();
    }, []);

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    };

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
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const selectedPatient = (item) => {
        Global.patientID = item.id;
        Global.patientName = item.firstName;
        Global.patientUserId = item.patientUserId;
        Global.NR_Patient = item.isRegistered;
        if (props.route.params.userType == "Nurse") {
            Global.nurseSelecting.Type = "Nurse";
            Global.nurseSelecting.userTypeId = "3";
            navigation.navigate("AddServices");
        } else if (props.route.params.userType == "Domestic Caretaker") {
            Global.nurseSelecting.Type = "Domestic Caretaker";
            Global.nurseSelecting.userTypeId = '6';
            navigation.navigate("SelectCareBuddy", { userType: props.route.params.userType });
        } else if (props.route.params.userType == "Nutrionist") {
            Global.nurseSelecting.Type = "Nutrionist";
            Global.nurseSelecting.userTypeId = '6';
            navigation.navigate("AppointmentType", { Type: "Nutritionist" });
        }
    };

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={"Select Patient"}
                    onPress={() => { navigation.navigate("Dashboard") }}
                />
                <View style={{ marginBottom: heightToDp(8) }}>
                    <ScrollView keyboardShouldPersistTaps={"handled"} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                        {familyList.length > 0 && (
                            <View>
                                {
                                    familyList.map((item, index) => {
                                        return (
                                            <View key={index}>
                                                <Pressable style={({ pressed }) => ([{ opacity: pressed && Global.userType != "Patient" ? 0.4 : 1 }, styles.topContainer])}
                                                    onPress={() => { selectedPatient(item); }}
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
                                                    </View>
                                                </Pressable>
                                                <View style={styles.middleContainer}></View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
            <Footer navigation={navigation} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </SafeAreaView>
    )

}
const styles = StyleSheet.create({
    profileimage: {
        alignSelf: "center",
        borderRadius: 50,
        height: scale(53),
        width: scale(53),
        backgroundColor: Colors.boxBackground
    },
    topContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: heightToDp(2)
    },
    middleContainer: {
        alignSelf: "center",
        width: "100%",
        height: 2,
        backgroundColor: Colors.textInputBorder,
        marginTop: heightToDp(2)
    },
    Cardheading: {
        marginTop: heightToDp(1),
        color: Colors.primaryButtonColor,
    },
});