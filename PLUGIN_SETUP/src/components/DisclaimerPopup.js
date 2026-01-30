import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import Colors from '../utils/Colors';
import DisclaimerText from './DisclaimerText';
import CommonButton from './CommonButton';
import DisclaimerData from '../assets/mdm/DisclaimerData.json';


const DisclaimerPopup = (props) => {
    return (
        <Modal visible={props.Pop} animationType={'fade'} transparent={true}>
            <View style={{ flex: 1, backgroundColor: Colors.modalBackground, justifyContent: "center" }}>
                <View style={[styles.optionView, GlobalStyles.inputBoxShadow, { minHeight: props.type == "Doctor" ? heightToDp(40) : heightToDp(27) }]}>
                    <View style={styles.container}>
                        <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>Disclaimer</Text>
                        <Pressable style={{ position: "absolute", right: widthToDp(6), backgroundColor: Colors.lightblue, borderRadius: 14, padding: widthToDp(1) }} onPress={() => props.setPop(false)}>
                            <VectorIcons groupName='Ionicons' iconName='close' iconsize={widthToDp(6)} iconstyle={{ color: Colors.primaryTextColor }} />
                        </Pressable>
                    </View>
                    <ScrollView style={{ maxHeight: props?.type == "Settings" ? "55%" : props?.type == "Doctor" ? "43%" : "65%", paddingVertical: -widthToDp(2), paddingHorizontal: widthToDp(9) }}>
                        {
                            props?.type == "Settings" ? <DisclaimerText text={DeactivateUser[0].DisclaimerP} /> :
                                <DisclaimerText
                                    text={
                                        props?.type === "Doctor"
                                            ? DisclaimerData[1].DisclaimerP
                                            : props?.type === "Nutritionist"
                                                ? DisclaimerData[2].DisclaimerP
                                                : props?.type === "Nurse"
                                                    ? DisclaimerData[0].DisclaimerP
                                                    : DisclaimerData[3].DisclaimerP
                                    }
                                />
                        }
                    </ScrollView>
                    <View style={styles.checkBoxContainer}>
                        <CommonButton
                            extraStyles={{ width: "80%", marginBottom: props.type == "Doctor" && 10 }}
                            buttonText={"Accept and Continue"}
                            onPress={async () => {
                                await props.apppointmentBookingApis();
                            }}
                        ></CommonButton>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%"
        },
        optionView: {
            width: widthToDp(90),
            borderRadius: 14,
            backgroundColor: Colors.boxBackground,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            alignSelf: "center",
        },
        button: {
            alignSelf: 'center',
            width: widthToDp(20),
            marginTop: heightToDp(2),
            marginBottom: heightToDp(2),
        },
        checkBoxContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
        },
    });

export default DisclaimerPopup;