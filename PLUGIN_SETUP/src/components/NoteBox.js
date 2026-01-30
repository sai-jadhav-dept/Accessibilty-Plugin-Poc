import React from 'react';
import { View, Image, Text } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import Fonts from '../utils/Fonts';

const NoteBox = (props) => {
    return (
        <View style={[GlobalStyles.boxMainContainer, GlobalStyles.inputBoxShadow]}>
            <Image source={require('../assets/vectors/error_red.png')} style={{ width: 25, height: 25 }} resizeMode='contain' />
            <Text style={[GlobalStyles.boxTitleText, Fonts.Nunito_700Bold, { marginTop: heightToDp(1), fontSize: responsiveFont(22) }]}>Important Note!</Text>
            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(16) }]}>Dear Caregiver,</Text>
            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginBottom: widthToDp(2), fontSize: responsiveFont(16) }]}>By medical law, it is mandatory to take Patient’s consent to manage the treatment behalf.</Text>
        </View>
    );
}
export default NoteBox;