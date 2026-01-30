import { View, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import GlobalStyles from '../utils/GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import TreatmentCycle from '../components/TreatmentCycle';
import Footer from '../components/Footer';
import { widthToDp } from '../utils/Responsive';
import Global from './Global';

export default function TreatmentData({ route }) {
    const navigation = useNavigation();
    let routedData = route.params;
    const [showOtherScreen, setShowOtherScreen] = useState(false);
    const [isDisable, setIsDisable] = useState(false);

    const onBackPress = () => {
        if (showOtherScreen) {
            setShowOtherScreen(false);
            setIsDisable(false);
        }
        else if (route.params.from == "Dashboard") {
            navigation.navigate("Dashboard")
        }
        else if (route?.params?.fromCareCircle) {
            Global.fromCareCircle = false;
            navigation.replace("PatientDashboard", { personData: route?.params?.personData });
        } else if (!showOtherScreen) {
            navigation.replace("MyTreatment");
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={[GlobalStyles.mainBox, { marginHorizontal: 0 }]}>
                <Header
                    headerTitle={"Treatment Cycle"}
                    onPress={onBackPress}
                    extraStyles={{ marginHorizontal: widthToDp(4) }}
                />
                <TreatmentCycle routedData={routedData || {}} showOtherScreen={showOtherScreen} setShowOtherScreen={setShowOtherScreen} isDisable={isDisable} setDisable={setIsDisable} />
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    )
}