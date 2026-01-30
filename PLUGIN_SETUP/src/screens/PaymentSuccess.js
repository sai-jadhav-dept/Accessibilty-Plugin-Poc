import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Linking } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Share from 'react-native-share';
import CommonButton from '../components/CommonButton';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import Global from '../screens/Global';
import { scale } from 'react-native-size-matters';
import ViewShot from 'react-native-view-shot';
import moment from 'moment';
import FastImage from 'react-native-fast-image';


const PaymentSuccess = (props) => {
    const orderID = props.route.params.orderId;
    const finalAmount = props?.route.params?.finalAmount;

    const viewShotRef = React.createRef();
    const navigation = useNavigation();

    const filteredCareBuddyData = Global.nurseSearchData.find((value) => {
        return value.id === Global.nurseSelecting.CareBuddyId;
    });

    const NurseName = Global.NurseappointmentDetails.NurseName;
    const NurseImage = Global.NurseappointmentDetails.NurseImage;
    const inputStartDate = Global.nurseSelecting.selectedStartDate;

    const formattedStartDate = moment(inputStartDate).format("DD-MM-YYYY");
    const selectedStartDate = formattedStartDate;
    const [nurseFees, setNurseFees] = useState(filteredCareBuddyData.serviceCharge);

    const mobileNumber = filteredCareBuddyData.mobileNumber;
    const inputEndDate = Global.nurseSelecting.selectedEndDate;
    const formattedEndDate = moment(inputEndDate).format("DD-MM-YYYY");
    const selectedEndDate = formattedEndDate;
    const SelectedServices = Global.nurseSelecting.SelectedServices;

    const startTime = Global.NurseappointmentDetails.startTime;

    const endTime = Global.NurseappointmentDetails.endTime;

    const totalServiceTime = Global.NurseappointmentDetails.totalServiceTime.label
    const [imageURI, setImageURI] = useState("");
    const [sendDisable, setSendDisable] = useState(false);

    const captureViewShot = async () => {
        setSendDisable(true);
        const capturedURI = await viewShotRef.current.capture(); // Capture the image's URI
        setImageURI(capturedURI); // Set the image URI in the state
        shareImage(capturedURI)
    };

    const shareImage = async (capturedURI) => {
        if (capturedURI) {
            const options = {
                title: 'Share Image',
                url: capturedURI,
                type: 'image/jpeg', // Specify the image type
            };
            Share.open(options)
                .then((res) => {
                    console.log('Shared:', res);
                    setImageURI(""); // Reset the imageURI state after sharing
                })
                .catch((err) => {
                    console.log('Error sharing:', err);
                    setImageURI(""); // Reset the imageURI state even if sharing failed
                });
        } else {
            console.log('No image captured yet.');
        }
        setSendDisable(false);
    };

    useEffect(() => {
        setImageURI("");
        const startDate = moment(Global.nurseSelecting.selectedStartDate);
        const endDate = moment(Global.nurseSelecting.selectedEndDate);
        const daysDifference = Math.max(1, endDate.diff(startDate, 'days') + 1);
        setNurseFees(nurseFees * daysDifference);
    }, []);


    const dialCall = (number) => {
        Linking.openURL(Global.OS === 'android' ? `tel:${number}` : `telprompt:${number}`);
    };




    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <ScrollView>
                    <ViewShot style={{ flex: 1, backgroundColor: Colors.defaultBackground, paddingHorizontal: sendDisable ? widthToDp(4) : widthToDp(0) }}
                        ref={viewShotRef}
                        captureMode="mount"
                        options={{ format: "jpg", quality: 1.0 }}
                        onCapture={capturedURI => {
                            setImageURI(capturedURI);
                        }}>
                        <View style={GlobalStyles.fixedTopSpacing}>
                            <VectorIcons groupName='AntDesign' iconName="checkcircle" iconsize={40}
                                iconstyle={{
                                    alignSelf: "center",
                                    marginBottom: heightToDp(2),
                                    marginRight: widthToDp(2),
                                    color: Colors.successColor
                                }} />
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, styles.paymentData]}>₹ {Global.doctorAmount}/-</Text>
                            <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                <FastImage
                                    resizeMode={FastImage.resizeMode.cover}
                                    style={styles.profileimage}
                                    source={NurseImage == '' ? require("../assets/images/profile.png") : { uri: NurseImage }}
                                />
                                <Text style={[GlobalStyles.largeText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(3), marginTop: heightToDp(2) }]}>{Global.NurseappointmentDetails?.gender == "Male" ? "Mr" : "Ms"} {NurseName}</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: Colors.placeholderTextColor, height: 2, marginVertical: heightToDp(2) }}></View>
                        <View>
                            <Text style={[GlobalStyles.largeText, Fonts.Nunito_600SemiBold, styles.paymentData, { marginBottom: heightToDp(1) }]}>Service Confirmed</Text>
                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_400Regular, styles.paymentData, { marginBottom: heightToDp(1) }]}>{orderID}</Text>
                        </View>
                        <View style={{ backgroundColor: Colors.lightblue, paddingHorizontal: widthToDp(4), paddingVertical: heightToDp(2), borderRadius: 14, marginTop: heightToDp(2), flexDirection: 'row', justifyContent: "space-evenly" }}>
                            <View style={styles.packagesDays}>
                                <Text style={[Fonts.Nunito_700Bold, GlobalStyles.normalText]}>{selectedStartDate}</Text>
                            </View>
                            <View style={styles.packagesDays}>
                                <Text style={[Fonts.Nunito_700Bold, GlobalStyles.normalText]}>To</Text>
                            </View>
                            <View style={styles.packagesDays}>
                                <Text style={[Fonts.Nunito_700Bold, GlobalStyles.normalText]}>{selectedEndDate}</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: Colors.lightblue, paddingHorizontal: widthToDp(4), paddingVertical: heightToDp(2), borderRadius: 14, marginTop: heightToDp(2) }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: heightToDp(1), backgroundColor: Colors.defaultBackground, paddingHorizontal: widthToDp(2), paddingVertical: heightToDp(1), borderRadius: 14 }}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                        From : <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>{startTime}</Text>
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: heightToDp(1), backgroundColor: Colors.defaultBackground, paddingHorizontal: widthToDp(2), paddingVertical: heightToDp(1), borderRadius: 14 }}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                        To : <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>{endTime}</Text>
                                    </Text>
                                </View>
                            </View>
                            {totalServiceTime && totalServiceTime?.length != 0 &&
                                <View style={[styles.totalServices]}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                        Total Service : <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>{totalServiceTime}</Text>
                                    </Text>
                                </View>
                            }
                            {
                                SelectedServices && SelectedServices.length !== 0 &&
                                <View style={[styles.totalServices, { marginTop: heightToDp(2) }]}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                        Services Provided : <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold]}>{SelectedServices?.join(', ')}</Text>
                                    </Text>
                                </View>
                            }
                        </View>
                        {
                            !sendDisable && (
                                <View style={{ flexDirection: "row", paddingVertical: heightToDp(3), alignSelf: "center" }}>
                                    <Pressable onPress={() => dialCall(mobileNumber)} style={({ pressed }) => ([styles.shareButton, { marginRight: widthToDp(4) }, { opacity: pressed ? 0.4 : 1 }])}>
                                        <VectorIcons groupName='FontAwesome' iconName='phone' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Connect</Text>
                                    </Pressable>
                                    <Pressable onPress={() => { captureViewShot() }} style={({ pressed }) => ([styles.shareButton, { opacity: pressed ? 0.4 : 1 }])}>
                                        <VectorIcons groupName='Ionicons' iconName='share' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Share</Text>
                                    </Pressable>
                                </View>
                            )
                        }
                    </ViewShot>
                    <CommonButton
                        buttonText="Back to Dashboard"
                        extraStyles={[GlobalStyles.commonButton, { marginBottom: heightToDp(5) }]}
                        onPress={() => { navigation.navigate("Dashboard") }}
                    />
                </ScrollView>
            </View>
            <Footer navigation={navigation} />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    paymentData: {
        alignSelf: "center",
        marginBottom: heightToDp(2)
    },
    profileimage: {
        borderRadius: 50,
        height: scale(53),
        width: scale(53)
    },
    packagesDays: {
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        padding: widthToDp(2),
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        padding: widthToDp(2),
        marginTop: heightToDp(1)
    },
    totalServices: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.defaultBackground,
        paddingHorizontal: widthToDp(2),
        paddingVertical: heightToDp(1),
        borderRadius: 14,
        marginTop: heightToDp(1)
    }
});

export default PaymentSuccess;