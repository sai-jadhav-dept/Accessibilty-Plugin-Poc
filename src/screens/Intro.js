import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
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

export default function Intro() {
    const navigation = useNavigation();
    const colors = useDynamicColors();
    const { colorInversion, greyscale, lowSaturation, highSaturation, whiteHighContrast, darkHighContrast } = useAccessibility();

    // Calculate image filter styles
    const getImageStyle = () => {
        let filterStyle = {};

        // Apply greyscale
        if (greyscale) {
            filterStyle.tintColor = '#808080'; // Grey tint for greyscale effect
            filterStyle.opacity = 0.8;
        }
        // Apply low saturation (muted colors)
        else if (lowSaturation) {
            filterStyle.opacity = 0.6;
        }
        // Apply high saturation (more vivid)
        else if (highSaturation) {
            filterStyle.opacity = 1;
        }

        return filterStyle;
    };

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer, { backgroundColor: colors.defaultBackground }]}>
            <View style={GlobalStyles.mainBox}>
                <Logo />
                <View style={{ marginTop: heightToDp(4), height: "75%" }}>
                    <View style={styles.imageContainer}>
                        <Image
                            resizeMode='contain'
                            source={require("../assets/images/medical_care.png")}
                            style={[styles.mediCare, getImageStyle()]}
                        />
                        {/* Apply strong color inversion overlay */}
                        {colorInversion && !greyscale && (
                            <>
                                <View style={[styles.imageOverlay, {
                                    backgroundColor: 'black',
                                    opacity: 0.5
                                }]} />
                                <View style={[styles.imageOverlay, {
                                    backgroundColor: 'white',
                                    opacity: 0.3
                                }]} />
                            </>
                        )}
                        {/* Apply greyscale overlay */}
                        {greyscale && (
                            <View style={[styles.imageOverlay, { backgroundColor: 'rgba(128, 128, 128, 0.4)' }]} />
                        )}
                        {/* Apply high contrast overlay */}
                        {(whiteHighContrast || darkHighContrast) && !colorInversion && !greyscale && (
                            <View style={[styles.imageOverlay, {
                                backgroundColor: darkHighContrast ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)'
                            }]} />
                        )}
                    </View>
                    <FieldLabel extraStyles={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: -heightToDp(2), color: colors.primaryTextColor }]} text={"Manage treatments with ease, on one platform​"} />
                    <FieldLabel extraStyles={[GlobalStyles.largeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(2), color: colors.primaryTextColor }]} text={"One dashboard. Complete visibility.​"} />
                    <FieldLabel extraStyles={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.loginAgreeTextAlignment]} text={Global.languageData.login_condition + "terms and condition for using the HOPE app."} />
                </View>
                <CommonButton
                    buttonText="Get Started"
                    visible='true'
                    onPress={() => navigation.replace("SelectLanguage")}
                    extraStyles={[GlobalStyles.fixbottomcommonButton, { backgroundColor: colors.primaryButtonColor, borderColor: colors.secondarybuttonColor }]}
                    extraTextStyles={{ color: colors.boxBackground }}
                />
                <ReadModal activeModal={Global.accessibility.pageRead} />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    imageContainer: {
        position: 'relative',
        alignSelf: 'center',
        height: "50%",
        width: '100%',
    },
    mediCare: {
        alignSelf: 'center',
        height: "80%",
        width: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
})