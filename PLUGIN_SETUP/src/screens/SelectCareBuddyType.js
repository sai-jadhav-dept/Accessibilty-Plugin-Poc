import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Keyboard, Pressable } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import FieldLabel from '../components/FieldLabel';
import RadioButton from '../components/RadioButton';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import { apiCall } from '../utils/ApiUtils';
import Global from './Global';

const SelectCareBuddyType = (props) => {
    const navigation = useNavigation();
    const [appointmentPurpose, setAppointmentPurpose] = useState('Nurse');
    let [displayBottomButton, setDisplayBottomButton] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [specializationData, setSpecializationData] = useState([]);
    const [warningText, setWarningText] = useState("");
    const [userTypeId, setUserTypeId] = useState("3");

    useEffect(() => {
        getUserType();
    }, [])

    const getUserType = async () => {
        try {
            const body = {
                "category": "HOPE Provider",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS,
                "timestamp": new Date().toString()
            };
            setLoading(true);
            const response = await apiCall('registration/getusertype', body);
            const userType = response.userType;
            const filteredUserType = userType.filter(item => item.id !== "4");
            setSpecializationData(filteredUserType);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (() => {
            setDisplayBottomButton(false);
        }));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, []);

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Back"
                    onPress={() => Global.fromCareCircle ? navigation.navigate("PatientDashboard", { personData: props.route.params.personData }) : navigation.navigate("Dashboard")}
                />
                <ScrollView>
                    <View>
                        <FieldLabel TextType={"ExtraLarge"} text={"Select Care Buddy Type"} />
                        <Text style={[styles.HeaderText, GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                            Use the search bar to find a specific care buddy by name, ID number or select the type.
                        </Text>
                    </View>
                    <View style={{ marginBottom: heightToDp(2), paddingHorizontal: widthToDp(4) }}>
                        {specializationData.map((item, index) => (
                            <View key={index} style={[{ marginVertical: heightToDp(1) }]}>
                                <Pressable
                                    style={({ pressed }) => ([styles.selectBox, GlobalStyles.inputBoxShadow, {
                                        opacity: pressed ? 0.5 : 1,
                                        backgroundColor: item.name === appointmentPurpose ? Colors.primaryButtonColor : Colors.defaultBackground,
                                        borderColor: item.name === appointmentPurpose ? Colors.secondarybuttonColor : Colors.textInputBorder,
                                    }])}
                                    onPress={() => {
                                        setAppointmentPurpose(item.name);
                                        setUserTypeId(item.id);
                                    }}
                                >
                                    <View style={[styles.diseaseContainer]}>
                                        <View style={styles.BoxLeft}>
                                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.mediumText, { color: item.name === appointmentPurpose ? Colors.defaultBackground : Colors.primaryTextColor }]}>
                                                {item.name}
                                            </Text>
                                            <View>
                                                {item.speciality === appointmentPurpose && (
                                                    <RadioButton selected={true} backgroundColor={Colors.defaultBackground} iconColor={Colors.primaryButtonColor} />
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.BoxRight}>
                                            <Text style={[
                                                item.name === appointmentPurpose ? GlobalStyles.smallText : GlobalStyles.extrasmallText,
                                                item.name === appointmentPurpose ? { color: Colors.defaultBackground } : { color: Colors.primaryButtonColor }
                                                , Fonts.Nunito_600SemiBold]}>
                                                Specialises in Home Health Care
                                            </Text>
                                            {item.speciality === appointmentPurpose && (
                                                <View style={{ width: "100%" }}>
                                                    <Text style={[
                                                        Fonts.Nunito_400Regular,
                                                        GlobalStyles.extrasmallText,
                                                        item.name === appointmentPurpose ? { color: Colors.defaultBackground } : { color: Colors.primaryButtonColor }
                                                        , { marginTop: heightToDp(1) }
                                                    ]}>
                                                        Lorem ipsum dolor sit amet consectetur. Suspendisse eleifend lacinia tellus felis lacus.
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                    {
                        displayBottomButton &&
                        <CommonButton
                            onPress={() => {
                                Global.nurseSelecting.Type = appointmentPurpose;
                                Global.nurseSelecting.userTypeId = userTypeId;
                                navigation.navigate("AddServices");
                            }}
                            buttonText="Continue"
                            extraStyles={{ marginTop: heightToDp(4), marginBottom: heightToDp(3) }}
                        />
                    }
                </ScrollView>
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    HeaderText: {
        marginVertical: heightToDp(2),
    },
    diseaseContainer: {
        width: '100%',
    },
    BoxRight: {
        width: "100%",
        marginTop: heightToDp(1),
        marginBottom: heightToDp(1)
    },
    icon: {
        width: widthToDp(6),
        height: heightToDp(6),
    },
    BoxLeft: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
    },
    selectBox: {
        width: '100%',
        borderRadius: 14,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: widthToDp(4),
    }
});

export default SelectCareBuddyType;