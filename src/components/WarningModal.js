import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import GlobalStyles from '../utils/GlobalStyles';
import { heightToDp, widthToDp } from '../utils/Responsive';
import CommonButton from './CommonButton';
import Global from '../screens/Global';
import { useNavigation } from '@react-navigation/native';

export default function WarningModal(props) {
    const navigation = useNavigation();

    const onLogoutClick = async () => {
        await Global.zim.logout();
        Global.userID = 0;
        Global.clicked = false;
        Global.authExpired = false;
        Global.Biometric_UserId = 0;
        Global.Biometric_Id = '';
        Global.messages = [];
        Global.setMessageRefresh = false;
        Global.notificationChannelIds = {};
        Global.VoiceSearchedData = [];
        Global.patientID = 0;
        Global.inputType = '';
        Global.cachedData = {};
        Global.inputValue = '';
        Global.selectedCountryCode = '';
        Global.diseaseID = 0;
        Global.userType = '';
        Global.userInfo = {
            firstName: '',
            lastName: '',
            email: '',
            countryCode: '',
            mobileNo: '',
            gender: '',
            DOB: '',
            pincode: '',
            image: '',
            Biometric_Enabled: 'Enable',
            Device_Id: ''
        }
        Global.DiseaseData = [];
        Global.Biometric_UserId = '';
        Global.Biometric_Id = '';
        Global.appointmentDetails = [];
        Global.patientDiseaseDetials = [];
        Global.MedicineData = [];
        Global.trustedLabDetails = [];
        Global.trustedLabDetails = [];
        Global.selectedCycle = "";
        navigation.reset({
            index: 0,
            routes: [
                { name: 'Login' }
            ]
        });
    }

    const okClick = async () => {
        if (Global.authExpired) {
            await onLogoutClick();
        } else {
            if (props.onPress) {
                props.onPress();
            }
            props.setShowModal(false);
        }
    }

    return (
        <Modal visible={props.showModal} animationType={'fade'} transparent={true}>
            <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center" }}>
                <View style={styles.optionView}>
                    <Text style={[GlobalStyles.largeText, styles.warningMessage, Fonts.Nunito_600SemiBold]}>
                        {props.warningText}
                    </Text>
                    {
                        props.extrabuttons ?
                            <View style={styles.validButton}>
                                <CommonButton
                                    buttonText="Yes"
                                    onPress={() => {
                                        if (props.onPress) {
                                            props.onPress(true);
                                        }
                                        props.setShowModal(false);
                                    }}
                                    extraStyles={styles.button}
                                />
                                <CommonButton
                                    buttonText="No"
                                    onPress={() => {
                                        if (props.onPress) {
                                            props.onPress(false);
                                        }
                                        props.setShowModal(false);
                                    }}
                                    extraStyles={styles.button}
                                />
                            </View>
                            :
                            <CommonButton
                                buttonText="OK"
                                onPress={okClick}
                                extraStyles={styles.button}
                            />
                    }
                </View>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
    warningMessage: {
        marginTop: heightToDp(2),
        paddingHorizontal: widthToDp(6),
        textAlign: "center",
    },
    optionView: {
        minHeight: heightToDp(24),
        width: widthToDp(80),
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        justifyContent: 'space-around',
        alignItems: 'center',
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
    button: {
        alignSelf: 'center',
        width: widthToDp(20),
        height: heightToDp(6),
        marginBottom: heightToDp(2),
    },
    validButton: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: widthToDp(2)
    },
});