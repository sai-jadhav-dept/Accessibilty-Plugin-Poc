import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Logo from '../components/Logo';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { useNavigation } from '@react-navigation/native';
import { heightToDp } from '../utils/Responsive';

export default function Intro() {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Logo />
                <View style={{ marginTop: heightToDp(4), height: "75%" }}>
                    <Image
                        resizeMode='contain'
                        source={require("../assets/images/medical_care.png")}
                        style={styles.mediCare}
                    />
                    <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4) }]}>Manage treatments with ease, on one platform​</Text>
                </View>
                <CommonButton
                    buttonText="Get Started"
                    visible='true'
                    onPress={() => navigation.replace("SelectLanguage")}
                    extraStyles={GlobalStyles.fixbottomcommonButton}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    mediCare: {
        alignSelf: 'center',
        height: "55%"
    }
})