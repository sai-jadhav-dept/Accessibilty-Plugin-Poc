import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RadioButton from '../components/RadioButton';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';

export default function AppointmentType({ route }) {
    const appointmentPurposeOption = [
        {
            "id": "1",
            "name": "First time visit"
        },
        {
            "id": "2",
            "name": "Follow-up visit"
        }
    ]
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [modeId, setModeId] = useState("");
    const [purposeId, setPurposeId] = useState("1");
    const [appointmentType, setAppointmentType] = useState('In Person');
    const [appointmentPurpose, setAppointmentPurpose] = useState('First time visit');
    const appointmentOption =
        route.params.Type == "Nutritionist" ?
            [
                {
                    id: 1,
                    name: 'In Person Visit',
                    value: "In Person",
                },
                {
                    id: 2,
                    name: 'Virtual',
                    value: 'Virtual'
                },
                {
                    id: 3,
                    name: 'Home Visit',
                    value: 'Home Visit'
                },
            ]
            :
            [
                {
                    id: 1,
                    name: 'In Person Visit',
                    value: "In Person",
                },
                {
                    id: 2,
                    name: 'Virtual',
                    value: 'Virtual'
                },
            ]

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const setGlobalModeid = (id) => {
        setModeId(id);

    }
    const setPurposeID = (id) => {
        setPurposeId(id);
    }

    useEffect(() => {
        setGlobalModeid(1);
    }, []);


    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <View style={{ position: "relative", flex: 1 }}>
                    <Header
                        headerTitle="Select Appointment Type"
                        onPress={() => navigation.navigate("CreateAppointment")}
                    />
                    <ScrollView>
                        <View>
                            <Text style={[Fonts.Nunito_700Bold, styles.typeText]}>Appointment Type</Text>
                            {
                                appointmentOption.map((item, index) =>
                                    <View key={index}>
                                        {index % 2 == 0 ?
                                            <View style={GlobalStyles.rowSpaceBetween}>
                                                <View style={{ width: '50%', margin: widthToDp(1) }}>
                                                    <Pressable
                                                        style={({ pressed }) => ([
                                                            GlobalStyles.selectBox,
                                                            styles.optionButton,
                                                            {
                                                                opacity: pressed ? 0.5 : 1,
                                                                backgroundColor: item.value == appointmentType ? Colors.primaryButtonColor : Colors.boxBackground,
                                                                borderColor: item.value == appointmentType ? Colors.secondarybuttonColor : Colors.textInputBorder
                                                            }
                                                        ])}
                                                        onPress={() => {
                                                            setAppointmentType(item.value);
                                                            setGlobalModeid(appointmentOption[index].id)

                                                        }}
                                                    >
                                                        {
                                                            item.value == appointmentType ?
                                                                <View style={styles.selectionContainer}>
                                                                    <RadioButton selected={true} backgroundColor={Colors.secondarybuttonColor} />
                                                                </View>
                                                                :
                                                                <View style={styles.selectionContainer}>
                                                                    <RadioButton selected={false} />
                                                                </View>
                                                        }
                                                        <Text style={[Fonts.Nunito_700Bold, { color: item.value == appointmentType ? Colors.boxBackground : Colors.primaryTextColor, fontSize: scale(16) }]}>{item.name}</Text>
                                                    </Pressable>
                                                </View>
                                                {
                                                    index != 2 &&
                                                    <View style={{ width: '50%' }}>
                                                        <Pressable
                                                            style={({ pressed }) => ([
                                                                GlobalStyles.selectBox,
                                                                styles.optionButton, {
                                                                    opacity: pressed ? 0.5 : 1,
                                                                    backgroundColor: appointmentOption[index + 1]?.name == appointmentType ? Colors.primaryButtonColor : Colors.boxBackground,
                                                                    borderColor: appointmentOption[index + 1]?.name == appointmentType ? Colors.secondarybuttonColor : Colors.textInputBorder
                                                                }
                                                            ])}
                                                            onPress={() => {
                                                                setAppointmentType(appointmentOption[index + 1]?.name)
                                                                setGlobalModeid(appointmentOption[index + 1].id)
                                                            }}
                                                        >
                                                            {
                                                                appointmentOption[index + 1]?.name == appointmentType ?
                                                                    <View style={styles.selectionContainer}>
                                                                        <RadioButton selected={true} backgroundColor={Colors.secondarybuttonColor} />
                                                                    </View>
                                                                    :
                                                                    <View style={styles.selectionContainer}>
                                                                        <RadioButton selected={false} />
                                                                    </View>
                                                            }
                                                            <Text style={[Fonts.Nunito_700Bold, { color: appointmentOption[index + 1]?.name == appointmentType ? Colors.boxBackground : Colors.primaryTextColor, fontSize: scale(16) }]}>{appointmentOption[index + 1]?.name || 'temp data (logic to be changed)'}</Text>
                                                        </Pressable>
                                                    </View>
                                                }

                                            </View>
                                            :
                                            null
                                        }
                                    </View>
                                )
                            }
                        </View>
                        <View>
                            <Text style={[Fonts.Nunito_700Bold, styles.typeText]}>Purpose of appointment</Text>
                            {
                                appointmentPurposeOption.map((item, index) =>
                                    <View key={index}>
                                        {
                                            index % 2 == 0 ?
                                                <View style={GlobalStyles.rowSpaceBetween}>
                                                    <View style={{ width: '50%', margin: widthToDp(1) }}>
                                                        <Pressable
                                                            style={({ pressed }) => ([
                                                                GlobalStyles.selectBox,
                                                                styles.option_Button,
                                                                {
                                                                    opacity: pressed ? 0.5 : 1,
                                                                    backgroundColor: item.name == appointmentPurpose ? Colors.primaryButtonColor : Colors.boxBackground,
                                                                    borderColor: item.name == appointmentPurpose ? Colors.secondarybuttonColor : Colors.textInputBorder
                                                                }
                                                            ])}
                                                            onPress={() => {
                                                                setAppointmentPurpose(item.name)
                                                                setPurposeID(appointmentPurposeOption[index].id);
                                                            }}
                                                        >
                                                            {
                                                                item.name == appointmentPurpose ?
                                                                    <View style={styles.selectionContainer}>
                                                                        <RadioButton selected={true} backgroundColor={Colors.secondarybuttonColor} />
                                                                    </View>
                                                                    :
                                                                    <View style={styles.selectionContainer}>
                                                                        <RadioButton selected={false} />
                                                                    </View>
                                                            }
                                                            <Text style={[Fonts.Nunito_700Bold, { color: item.name == appointmentPurpose ? Colors.boxBackground : Colors.primaryTextColor, fontSize: scale(16) }]}>{item.name}</Text>
                                                        </Pressable>
                                                    </View>
                                                    <View style={{ width: '50%' }}>
                                                        <Pressable
                                                            style={({ pressed }) => ([
                                                                GlobalStyles.selectBox,
                                                                styles.option_Button,
                                                                {
                                                                    opacity: pressed ? 0.5 : 1,
                                                                    backgroundColor: appointmentPurposeOption[index + 1]?.name == appointmentPurpose ? Colors.primaryButtonColor : Colors.boxBackground,
                                                                    borderColor: appointmentPurposeOption[index + 1]?.name == appointmentPurpose ? Colors.secondarybuttonColor : Colors.textInputBorder
                                                                }
                                                            ])}
                                                            onPress={() => {
                                                                setAppointmentPurpose(appointmentPurposeOption[index + 1]?.name)
                                                                setPurposeID(appointmentPurposeOption[index + 1]?.id)
                                                            }}
                                                        >
                                                            {
                                                                appointmentPurposeOption[index + 1]?.name == appointmentPurpose ?
                                                                    <View style={styles.selectionContainer}>
                                                                        <RadioButton selected={true} backgroundColor={Colors.secondarybuttonColor} />
                                                                    </View>
                                                                    :
                                                                    <View style={styles.selectionContainer}>
                                                                        <RadioButton selected={false} />
                                                                    </View>
                                                            }
                                                            <Text style={[Fonts.Nunito_700Bold, { color: appointmentPurposeOption[index + 1]?.name == appointmentPurpose ? Colors.boxBackground : Colors.primaryTextColor, fontSize: item.id == 3 ? scale(15) : scale(16), width: "100%" }]}>
                                                                {appointmentPurposeOption[index + 1]?.name}</Text>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                                :
                                                null
                                        }
                                    </View>
                                )
                            }
                        </View>

                        {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
                        <Spinner
                            visible={loading}
                            color={Colors.primaryButtonColor}
                            customIndicator={<Loader />}
                            textStyle={{ color: Colors.primaryButtonColor }}
                        />
                    </ScrollView>
                </View>
                <CommonButton
                    buttonText="Continue"
                    visible='true'
                    onPress={() => {
                        navigation.navigate("SelectDoctorScreen", { locationData: '', Mode: appointmentType, Type: route?.params?.Type, Purpose: appointmentPurpose, modeId: modeId, purposeId: purposeId })
                    }}
                    extraStyles={[{ marginTop: heightToDp(1), marginBottom: heightToDp(5) }]}
                />
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    typeText: [GlobalStyles.largeText, {
        marginHorizontal: widthToDp(2),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    }],
    optionButton: {
        marginBottom: heightToDp(2),
        marginTop: heightToDp(2),
        height: heightToDp(15),
        width: '90%',
    },
    option_Button: {
        marginBottom: heightToDp(2),
        marginTop: heightToDp(2),
        width: '90%',
    },
    selectionContainer: {
        position: 'absolute',
        top: heightToDp(2),
    }
})
