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
import VoiceSearch from '../components/VoiceSearch';

const SearchLocation = ({ route }) => {
    const navigation = useNavigation();
    const [name, setName] = useState("");

    const onSearchClick = () => {
        const routedData = route.params;
        const selectedServiceData = {
            Type: routedData.Type,
            SelectedServices: routedData.SelectedServices,
            selectedStartDate: routedData.selectedStartDate,
            selectedEndDate: routedData.selectedEndDate,
            startTime: routedData.startTime,
            endTime: routedData.endTime,
            totalServiceTime: routedData.totalServiceTime
        }
        navigation.navigate("SelectCareBuddy", selectedServiceData);
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Back"
                    onPress={() => navigation.goBack()}
                />
                <View>
                    <FieldLabel TextType={"ExtraLarge"} text={"Search a location"} />
                    <Text style={[Fonts.Nunito_400Regular, GlobalStyles.smallText, { marginVertical: heightToDp(2), marginBottom: heightToDp(4) }]}>Where should we send a care buddy?</Text>
                    <VoiceSearch
                        getName={(text) => { setName(text) }}
                        placeholderText={"Search location"} ShowlocationIcon={true} />
                    <View style={{ width: widthToDp(90), height: widthToDp(90), marginVertical: heightToDp(5), backgroundColor: Colors.lightblue, alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
                        <Text style={[GlobalStyles.largeText, { textAlign: "center" }, Fonts.Nunito_700Bold]}>
                            View Map
                        </Text>
                    </View>
                </View>
                <CommonButton
                    extraStyles={GlobalStyles.fixbottomcommonButton}
                    buttonText={"Search"}
                    onPress={onSearchClick}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
});

export default SearchLocation;