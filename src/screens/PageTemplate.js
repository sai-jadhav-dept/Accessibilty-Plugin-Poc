import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import Global from '../screens/Global';

const PageTemplates = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Select Appointment Type"
                    onPress={() => navigation.navigate("CreateAppointment")}
                />
                <View>

                </View>
                <CommonButton
                    extraStyles={GlobalStyles.fixbottomcommonButton}
                />
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({});

export default PageTemplates;
