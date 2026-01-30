import React from 'react';
import { View, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import { widthToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
import ComingSoon from '../components/ComingSoon';

const Faqs = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={"FAQs"}
                    onPress={() => { navigation.goBack() }}
                    extraStyles={{ marginHorizontal: widthToDp() }}
                />
                <ComingSoon />
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    )
}

export default Faqs;