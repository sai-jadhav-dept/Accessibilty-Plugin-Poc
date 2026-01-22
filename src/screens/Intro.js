import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Logo from '../components/Logo';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { useNavigation } from '@react-navigation/native';
import { heightToDp } from '../utils/Responsive';
import { useDynamicColors } from '../accessibility';
import { useAccessibility } from '../accessibility/AccessibilityContext';
import Global from './Global';
import FieldLabel from '../components/FieldLabel';
import ReadModal from '../accessibility/ReadModal';
import {  FilteredImage } from '../accessibility';
import {  FilteredImage } from '../accessibility';

export default function Intro() {
    
    const navigation = useNavigation();
    const colors = useDynamicColors();
    useEffect(()=>{
        console.log("Intro Screen Mounted",Global.accessibility.pageRead);
    })
    // const { colorInversion, greyscale, lowSaturation, highSaturation, whiteHighContrast, darkHighContrast } = useAccessibility();

    // Calculate image filter styles
    // const getImageStyle = () => {
    //     let filterStyle = {};

    //     // Apply greyscale
    //     if (greyscale) {
    //         filterStyle.tintColor = '#808080'; // Grey tint for greyscale effect
    //         filterStyle.opacity = 0.8;
    //     }
    //     // Apply low saturation (muted colors)
    //     else if (lowSaturation) {
    //         filterStyle.opacity = 0.6;
    //     }
    //     // Apply high saturation (more vivid)
    //     else if (highSaturation) {
    //         filterStyle.opacity = 1;
    //     }

    //     return filterStyle;
    // };

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer, { backgroundColor: colors.defaultBackground }]}>
            <View style={GlobalStyles.mainBox}>
                <Logo />
                <View style={{ marginTop: heightToDp(4), height: "75%" }}>
                    <View style={styles.imageContainer}>
                        <FilteredImage
                            source={require("../assets/images/medical_care.png")}
                            style={styles.mediCare}
                            resizeMode='contain'
                        />
                    </View>
                    <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor }]}>Manage treatments with ease, on one platform​</Text>
                    <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor }]}>One dashboard. Complete visibility.​</Text>
                        
                </View>
                <CommonButton
                    buttonText="Get Started"
                    visible='true'
                    onPress={() => navigation.replace("SelectLanguage")}
                    extraStyles={[GlobalStyles.fixbottomcommonButton, { backgroundColor: colors.primaryButtonColor, borderColor: colors.secondarybuttonColor }]}
                    extraTextStyles={{ color: colors.boxBackground }}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    imageContainer: {
        alignSelf: 'center',
        height: "55%",
        width: '100%',
    },
    mediCare: {
        alignSelf: 'center',
        height: "100%",
        width: '100%',
    }
});