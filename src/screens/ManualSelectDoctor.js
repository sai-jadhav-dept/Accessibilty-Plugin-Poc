import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import FieldLabel from '../components/FieldLabel';
import { scale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';

const ManualSelectDoctor = (props) => {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    let Mode = props.route?.params?.Mode;
    let Type = props.route?.params?.Type;
    const [doctorName, setDoctorName] = useState('');
    const [address, setAddress] = useState('');
    const [mobileNumber, setMobileNumber] = useState("")

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const onContinueClick = () => {
        const regex = /^[A-Za-z\s]+$/;
        const validmobile = /^(?!(\d)\1{9})\d{10}$/;
        const lines = address.split('\n');
        if (doctorName.trim() === '') {
            DisplayError('Name is required.');
            return;
        } else if (!regex.test(doctorName)) {
            DisplayError('Name should contain only letters and spaces.');
            return false;
        } else if (mobileNumber == "") {
            DisplayError("Please enter mobile number");
            return;
        } else if (!validmobile.test(mobileNumber.trim())) {
            DisplayError("Please enter valid Mobile Number.");
            return;
        } else if (mobileNumber.indexOf(0) == 0) {
            DisplayError("Please enter correct mobile number");
            return;
        }
        else if (address.trim() === '') {
            DisplayError('Address is required.');
            return;
        } else if (lines.length > 5) {
            DisplayError('Address should not exceed five lines.');
            return;
        }
        navigation.navigate("ChooseDateAndTime",
            {
                sourcePage: "ManualSelectDoctor",
                Type: Type,
                DoctorName: doctorName.trim(),
                address: address,
                number: mobileNumber,
                Mode: Type == "Lab" ? '' : Mode,
                imagePath: props.route?.params?.imagePath,
                TestTypeId: props.route?.params?.TestTypeId,
                imagType: props.route?.params?.imagType,
                subCategoryTypeData: props.route?.params?.subCategoryTypeData
            }
        )
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Manual Appointment"
                    onPress={() => navigation.navigate("CreateAppointment")}
                />
                <ScrollView keyboardShouldPersistTaps={"handled"}>
                    <View style={{ paddingBottom: heightToDp(13) }}>
                        <FieldLabel text={`${Type == "Lab" ? "Lab" : "Doctor"} Name`} mandatory={true} />
                        <TextInput
                            keyboardType="default"
                            placeholder={`${Type == "Lab" ? "Lab" : "Doctor"} Name`}
                            placeholderTextColor={Colors.placeholderTextColor}
                            style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                            value={doctorName}
                            onChangeText={text => {
                                setDoctorName(text);
                            }}
                        />
                        <FieldLabel text={"Mobile Number"} mandatory={true} />
                        <TextInput
                            keyboardType="numeric"
                            placeholder={`Mobile Number`}
                            maxLength={10}
                            placeholderTextColor={Colors.placeholderTextColor}
                            style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                            value={mobileNumber}
                            onChangeText={text => {
                                setMobileNumber(text);
                            }}
                        />
                        <FieldLabel text={"Address"} mandatory={true} />
                        <TextInput
                            keyboardType="default"
                            placeholder="Address"
                            placeholderTextColor={Colors.placeholderTextColor}
                            style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold,]}
                            value={address}
                            onChangeText={text => {
                                setAddress(text);
                            }}
                            multiline
                            numberOfLines={5}
                        />

                    </View>
                    <CommonButton
                        onPress={onContinueClick}
                        buttonText="Continue"
                        extraStyles={GlobalStyles.fixbottomcommonButton}
                    />
                    {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    dropdownContainer: {
        width: '95%',
        flexDirection: 'column',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        margin: 7,
        marginTop: heightToDp(2),
        marginBottom: heightToDp(0.2),
        paddingVertical: widthToDp(1)
    },
    dropdown: {
        height: heightToDp(7),
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: 10,
        color: Colors.placeholderTextColor,
    },
    placeholderStyle: {
        marginLeft: widthToDp(2),
        fontSize: scale(18),
        color: Colors.placeholderTextColor,
    }, inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        marginTop: heightToDp(2),
        width: '95%',
        alignSelf: 'center',
        paddingVertical: heightToDp(2),
        textAlignVertical: "top",
        paddingHorizontal: widthToDp(4),

    }
});

export default ManualSelectDoctor; 