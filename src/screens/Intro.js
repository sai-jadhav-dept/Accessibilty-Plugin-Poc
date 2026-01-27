import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Logo from '../components/Logo';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { useNavigation } from '@react-navigation/native';
import { heightToDp } from '../utils/Responsive';
import { useDynamicColors, AccessibleFilteredImage, useAccessibility } from '../accessibility';
import ReadModal from '../accessibility/ReadModal';
import Global from './Global';
import FieldLabel from '../components/FieldLabel';

export default function Intro() {

    const navigation = useNavigation();
    const colors = useDynamicColors();
    const { highlightLinks } = useAccessibility();

    const [readModal, setReadModal] = useState(false);

    useEffect(() => {
        // Ensure Global is initialized to false on component mount
        Global.accessibility.pageRead = false;
        setReadModal(false);

        const checkInterval = setInterval(() => {
            setReadModal(Global.accessibility.pageRead);
        }, 100);

        return () => clearInterval(checkInterval);
    }, []);

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer, { backgroundColor: colors.defaultBackground }]}>
            <View style={GlobalStyles.mainBox}>
                <Logo />
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} pointerEvents='auto'>
                    <View style={{ flex: 1, justifyContent: 'space-between', marginBottom: heightToDp(4) }}>
                        <View style={styles.imageContainer}>
                            <AccessibleFilteredImage
                                source={require("../assets/images/medical_care.png")}
                                style={styles.mediCare}
                                resizeMode='contain'
                                alt="Healthcare professionals helping patients manage treatments"
                            />
                        </View>
                        <FieldLabel extraStyles={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor }]} text="Manage treatments with ease, on one platform​" />
                        <FieldLabel extraStyles={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor }]} text="Here is a simple placeholder paragraph written in clear English for general use. It contains neutral wording, no specific meaning, and flows naturally. This text is useful for testing layouts, typography, spacing, and overall visual balance in documents, websites, or design projects without distracting readers or conveying unintended information clearly." />

                        <View style={{ marginTop: heightToDp(2)}}>
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: colors.primaryTextColor }]}>
                                For more information, visit our{' '}
                                <TouchableOpacity
                                    onPress={() => Linking.openURL('https://example.com/privacy')}
                                    accessibilityRole="link"
                                    accessibilityLabel="Privacy Policy link"
                                >
                                    <Text style={[
                                        styles.link,
                                        { color: colors.primaryTextColor },
                                        highlightLinks &&
                                         styles.linkHighlighted
                                    ]}>
                                        Privacy Policy
                                    </Text>
                                </TouchableOpacity>
                                {' '}or{' '}
                                <TouchableOpacity
                                    onPress={() => Linking.openURL('https://example.com/terms')}
                                    accessibilityRole="link"
                                    accessibilityLabel="Terms of Service link"
                                >
                                    <Text style={[
                                        styles.link,
                                        { color: colors.primaryTextColor },
                                        highlightLinks && styles.linkHighlighted
                                    ]}>
                                        Terms of Service
                                    </Text>
                                </TouchableOpacity>
                            </Text>
                        </View>
                    </View>
                    <CommonButton
                        buttonText="Get Started"
                        visible={true}
                        onPress={() => navigation.replace("SelectLanguage")}
                        extraStyles={[{ backgroundColor: colors.primaryButtonColor, borderColor: colors.secondarybuttonColor, marginBottom: heightToDp(4) }]}
                        extraTextStyles={{ color: colors.boxBackground }}
                    />
                </ScrollView>
                <ReadModal activeModal={readModal} />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    imageContainer: {
        alignSelf: 'center',
        height: 300,
        width: '100%',
        marginTop: heightToDp(4),
    },
    mediCare: {
        alignSelf: 'center',
        height: "100%",
        width: '100%',
    },
    link: {
        textDecorationLine: 'underline',
        fontWeight: '700',
    },
    linkHighlighted: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        paddingHorizontal: 4,
        paddingVertical: 2,
    }
});