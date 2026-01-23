import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Logo from '../components/Logo';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { useNavigation } from '@react-navigation/native';
import { heightToDp } from '../utils/Responsive';
import { useDynamicColors, AccessibleImage } from '../accessibility';
import ReadModal from '../accessibility/ReadModal';
import Global from './Global';
import FieldLabel from '../components/FieldLabel';

export default function Intro() {

    const navigation = useNavigation();
    const colors = useDynamicColors();

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
                <View style={{ marginTop: heightToDp(4), height: "75%" }}>
                    <View style={styles.imageContainer}>
                        <AccessibleImage
                            source={require("../assets/images/medical_care.png")}
                            style={styles.mediCare}
                            resizeMode='contain'
                        />
                    </View>
                    <FieldLabel extraStyles={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor }]} text="Manage treatments with ease, on one platform​" />
                    <FieldLabel extraStyles={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor }]} text="Here is a simple placeholder paragraph written in clear English for general use. It contains neutral wording, no specific meaning, and flows naturally. This text is useful for testing layouts, typography, spacing, and overall visual balance in documents, websites, or design projects without distracting readers or conveying unintended information clearly." />
                </View>
                <CommonButton
                    buttonText="Get Started"
                    visible='true'
                    onPress={() => navigation.replace("SelectLanguage")}
                    extraStyles={[GlobalStyles.fixbottomcommonButton, { backgroundColor: colors.primaryButtonColor, borderColor: colors.secondarybuttonColor }]}
                    extraTextStyles={{ color: colors.boxBackground }}
                />
                <ReadModal activeModal={readModal} />
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
})