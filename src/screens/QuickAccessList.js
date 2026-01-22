import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView } from "react-native";
import Header from "../components/Header";
import { scale, verticalScale } from "react-native-size-matters";
import { useNavigation } from '@react-navigation/native';
import FieldLabel from "../components/FieldLabel";
import GlobalStyles from "../utils/GlobalStyles";
import Fonts from "../utils/Fonts";
import Colors from "../utils/Colors";
import CommonButton from "../components/CommonButton";
import { heightToDp } from "../utils/Responsive";
import WarningModal from "../components/WarningModal";

const QuickAccessList = (props) => {
    const data = props?.route.params?.location;
    const navigation = useNavigation();
    const [locationData, setLocationData] = useState(data);
    const [showModal, setShowModal] = useState("");
    const [warningText, setWarningText] = useState("");
    const [selectedData, setSelectedData] = useState("");
    const Mode = props.route.params.Mode;
    const Purpose = props.route.params.Purpose;
    const Type = props.route.params.Type;
    const modeId = props.route.params.modeId;
    const purposeId = props.route.params.purposeId;

    const onBackClick = () => {
        navigation.navigate("SelectDoctorScreen", { Type: Type, Mode: Mode, Purpose: Purpose, modeId: modeId, purposeId: purposeId });
    };

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    const handlePress = (item) => {
        setSelectedData(item);
        const currentDate = new Date();
        const doctorAvailableDate = new Date(item.planExpiredOn);
        if (currentDate >= doctorAvailableDate) {
            DisplayError("Doctor plan not available.");
        }
    };

    const onSubmit = () => {
        const currentDate = new Date();
        const doctorAvailableDate = new Date(selectedData.planExpiredOn);
        if (selectedData == "") {
            DisplayError("Please select hospital name.")
        } else if (currentDate >= doctorAvailableDate) {
            DisplayError("Doctor plan not available.");
        } else {
            navigation.navigate("ChooseDateAndTime", { doctorData: props.route.params.selectedDoctorDetail, hospitalData: selectedData, Type: Type, Mode: Mode, Purpose: Purpose, modeId: modeId, purposeId: purposeId, location: props?.route.params?.location });
        }
    }

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer]}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Choose Clinic Location"
                    onPress={onBackClick}
                />
                <View>
                    <View style={[styles.scrollContainer]}>
                        <FlatList
                            data={locationData}
                            renderItem={({ item, index }) => {
                                return (
                                    <View>
                                        <Pressable style={[styles.locationData, selectedData == item && { backgroundColor: Colors.primaryButtonColor, color: Colors.defaultBackground }]} onPress={() => handlePress(item)} >
                                            <View>
                                                <FieldLabel text={item.name} Nospace={true} TextType={"medium"} extraStyles={[Fonts.Nunito_600SemiBold, { marginBottom: verticalScale(3) }, selectedData == item && { color: Colors.defaultBackground }]} />
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, selectedData == item && { color: Colors.defaultBackground }]}>
                                                    {item.address}
                                                </Text>
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginTop: verticalScale(3) }, selectedData == item && { color: Colors.defaultBackground }]}>
                                                    Available Date: <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.primaryButtonColor }, selectedData == item && { color: Colors.defaultBackground }]}>{item.dates}</Text>
                                                </Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                )
                            }}
                        />
                    </View>
                </View>
                <CommonButton
                    buttonText={"Continue"}
                    onPress={onSubmit}
                    extraStyles={[GlobalStyles.fixbottomcommonButton,]}
                />
            </View>
            <WarningModal showModal={showModal} warningText={warningText} setShowModal={setShowModal} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: verticalScale(15),
        position: "relative",
    },
    scrollContainer: {
        marginBottom: heightToDp(20),
        marginTop: heightToDp(2),
    },
    locationData: {
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: scale(20),
        marginTop: verticalScale(10),
        paddingVertical: verticalScale(15),
        justifyContent: "center",
        borderRadius: scale(10)
    }
})
export default QuickAccessList;