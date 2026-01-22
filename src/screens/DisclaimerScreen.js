import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, BackHandler } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import DisclaimerText from '../components/DisclaimerText';
import FieldLabel from '../components/FieldLabel';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Global from './Global';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Colors from '../utils/Colors';

const DisclaimerScreen = (props) => {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);

    const onBackClick = () => {
        navigation.navigate("PatientDetails", { UserData: props.route.params.UserData });
        return true;
    }
    const messageText = "I willingly provide consent for the management of my child's health information. I understand that this consent allows for the necessary collection, use, and sharing of health information to ensure the well-being and healthcare of my child. I am aware of my rights to access and correct this information. My child's privacy and confidentiality will be respected throughout this process, and I trust that the healthcare professionals involved will provide the best possible care.";

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const onAcceptBtnClicked = async () => {
        try {
            const body = {
                "patientId": props.route.params.patientId,
                "userId": Global.userID,
                "status": "Approved",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await apiCall('registration/updateuserstatus', body);
            Global.patientList.forEach((o, i) => {
                if (o.id === props.route.params.patientId) {
                    Global.patientList[i].status = 'Approved';
                    Global.patientList[i].AppointmentDate = moment(new Date()).format('DD/MM/YYYY');
                    Global.patientList[i].AppointmentTime = moment().format('LT');
                }
            });
            setLoading(false);
            navigation.navigate("Dashboard");
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        const backBtnHandler = BackHandler.addEventListener("hardwareBackPress", onBackClick);
        return () => {
            backBtnHandler.remove();
        }
    }, []);

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <FieldLabel text={"Disclaimer"} Nospace={true} extraStyles={styles.heading} TextType={"ExtraLarge"} />
                <ScrollView style={styles.textContainer}>
                    <DisclaimerText text={messageText} />
                </ScrollView>
                <View style={GlobalStyles.fixedTopSpacing}>
                    <CommonButton
                        onPress={onAcceptBtnClicked}
                        buttonText={"Accept and Continue"}
                        extraStyles={[GlobalStyles.commonButton]}
                    />
                    <Pressable onPress={onBackClick} style={[({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }]), styles.BackButton]}>
                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Back</Text>
                    </Pressable>
                </View>
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    BackButton: {
        alignSelf: "center",
        marginTop: heightToDp(2)
    },
    heading: {
        alignSelf: "center",
        marginTop: heightToDp(4)
    },
    textContainer: {
        marginTop: heightToDp(2),
        maxHeight: "70%",
        paddingHorizontal: widthToDp(2),
        alignContent: "center"
    }

});

export default DisclaimerScreen;