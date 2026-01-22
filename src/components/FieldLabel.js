import { Text } from 'react-native';
import React from 'react';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';

const FieldLabel = ({ TextType, text, mandatory, Nospace, extraStyles }) => {
    const fontStyles = [GlobalStyles[`${TextType ? TextType.toLowerCase() : "large"}Text`], Nospace ? null : GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold, extraStyles];
    return (
        <Text style={fontStyles}>
            {text}{mandatory ? <Text style={[GlobalStyles[`${TextType ? TextType.toLowerCase() : "large"}Text`], { color: Colors.red }, Fonts.Nunito_700Bold]}>*</Text> : null}
        </Text>
    );
};
export default FieldLabel;
