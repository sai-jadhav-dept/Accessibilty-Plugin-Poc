import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import FieldLabel from '../components/FieldLabel';
import { scale } from 'react-native-size-matters';
import moment from 'moment';
import WarningModal from '../components/WarningModal';
import MedicinesDateSelect from '../components/MedicinesDateSelect';
import Global from './Global';

const SelectDate = ({ route }) => {
    const navigation = useNavigation();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };
    const onContinueClick = () => {
        if (startDate === "" || endDate === "") {
            DisplayError("Please select valid start date or end date.");
        } else if (moment(startDate, "DD/MM/YYYY") > moment(endDate, "DD/MM/YYYY")) {
            DisplayError("end date should be greater then selected start date.");
        } else {
            Global.nurseSelecting.selectedStartDate = startDate;
            Global.nurseSelecting.selectedEndDate = endDate;
            navigation.navigate("SelectServiceTime");
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Back"
                    onPress={() => navigation.goBack()}
                />
                <View>
                    <FieldLabel text={"Select the date"} extraStyles={{ fontSize: scale(24) }} />
                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(2) }]}>Please choose the date you would like to {"\n"}schedule your care buddy service.</Text>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <View style={styles.container}>
                            <FieldLabel text={"Service Start Date"} extraStyles={{ marginVertical: widthToDp(4) }} mandatory={true} />
                            <MedicinesDateSelect onDateSelect={setStartDate} selectedDate={startDate} maxDate={endDate} />
                            <FieldLabel text={"Service End Date"} extraStyles={{ marginVertical: widthToDp(4), marginTop: heightToDp(4) }} mandatory={true} />
                            <MedicinesDateSelect onDateSelect={setEndDate} selectedDate={endDate} minDate={startDate} />
                        </View>
                    </View>
                </View>
                <CommonButton
                    onPress={onContinueClick}
                    buttonText={"Continue"}
                    extraStyles={GlobalStyles.fixbottomcommonButton}
                />
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
    },
    selectedDateContainerStyle: {
        width: widthToDp(10),
        height: widthToDp(10),
        borderRadius: widthToDp(10),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primaryButtonColor,
    },
    selectedDateStyle: {
        fontWeight: "700",
        color: Colors.defaultBackground,
    }
});

export default SelectDate;