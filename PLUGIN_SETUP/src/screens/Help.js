import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Linking, Pressable } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';

const Help = () => {
    const navigation = useNavigation();
    const customMessage = "Hello, this is my custom message for support.";
    const encodedCustomMessage = encodeURIComponent(customMessage);
    const emailUrl = `mailto:Support@hopetheapp.com?subject=Hello&body=${encodedCustomMessage}`;
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Help & Support"
                    onPress={() => navigation.navigate("SettingsPage")}
                />
                <View style={{ flex: 1 }}>
                    <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold]}>Email Us :</Text>
                    <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])} onPress={() => { Linking.openURL(emailUrl) }}>
                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>Support@hopetheapp.com</Text>
                    </Pressable>
                </View>
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
});

export default Help;
