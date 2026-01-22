import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';

const PaymentConfirmation = (props) => {
    const orderId = props?.route.params?.orderId;
    const doctorData = props?.route.params?.doctorData || "";
    const paymentData = props?.route.params?.paymentData || "";
    const paymentStatus = props?.route.params?.paymentStatus;
    const finalAmount = props?.route.params?.finalAmount;
    const navigation = useNavigation();

    const onContinueClick = () => {
        if (doctorData != "") {
            if (paymentStatus) {
                navigation.navigate("PaymentSummary", { doctorData: doctorData, orderId: orderId, paymentData: paymentData, finalAmount: finalAmount });
            } else {
                navigation.navigate("DoctorReviewAppointment", { modeId: doctorData.modeId, purposeId: doctorData.purposeId, Mode: doctorData.Mode, Purpose: doctorData.Purpose, hospitaldata: doctorData.hospitaldata, selectedDoctorDetail: doctorData.selectedDoctorDetail, SelectedDate: doctorData.SelectedDate, Time: doctorData.Time, Type: doctorData.Type, location: props?.route?.params?.location });
            }
        } else {
            if (paymentStatus) {
                navigation.navigate("PaymentSuccess", { orderId: orderId, finalAmount: finalAmount })
            } else {
                navigation.navigate("AppointmentReview")
            }
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <View style={styles.imgContainer}>
                    <View style={styles.circle}></View>
                    {paymentStatus ?
                        <VectorIcons groupName='AntDesign' iconName='check' iconsize={widthToDp(9)}
                            iconstyle={styles.iconstyle} /> :
                        <VectorIcons groupName='Ionicons' iconName='close' iconsize={widthToDp(9)}
                            iconstyle={styles.iconstyle} />}
                    <Image resizeMode='cover' style={styles.mainimage} source={require("../assets/images/paymentRejectScreenImg.png")} />
                </View>
                {paymentStatus ?
                    <View style={{ alignItems: "center" }}>
                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold,]}>
                            Payment Successful!
                        </Text>
                        <View style={{ marginHorizontal: widthToDp(5), marginTop: heightToDp(2), alignItems: "center" }}>
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_400Regular,]}>
                                Your Payment was successful.
                            </Text>
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_400Regular,]}>
                                Thank you for using our service.
                            </Text>
                        </View>
                    </View>
                    :
                    <View style={{ alignItems: "center" }}>
                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold,]}>
                            Payment Failed!
                        </Text>
                        <View style={{ marginHorizontal: widthToDp(5), marginTop: heightToDp(2), alignItems: "center" }}>
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_400Regular,]}>
                                Something went wrong!
                            </Text>
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_400Regular,]}>
                                Don’t worry. Let’s try again.
                            </Text>
                        </View>
                    </View>
                }
                <CommonButton
                    buttonText={paymentStatus ? "Continue" : "Try Again"}
                    extraStyles={[GlobalStyles.fixbottomcommonButton, { marginBottom: heightToDp(4) }]}
                    visible={true}
                    onPress={() => { onContinueClick(); }}
                />
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    imgContainer: {
        marginTop: heightToDp(6),
        justifyContent: "center",
        alignItems: "center",
    },
    mainimage: {
        height: heightToDp(45),
        width: widthToDp(55),
    },
    circle: {
        height: heightToDp(9),
        width: widthToDp(17),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 50,
        position: "absolute",
        right: widthToDp(28),
        bottom: heightToDp(13),
        zIndex: 99
    },
    iconstyle: {
        position: "absolute",
        left: widthToDp(5),
        bottom: -heightToDp(30),
        zIndex: 99,
        color: Colors.boxBackground
    }
});

export default PaymentConfirmation;