import { Pressable, Text } from 'react-native';
import React from 'react';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';
import Global from '../screens/Global';

const FieldLabel = ({ TextType, text, mandatory, Nospace, extraStyles }) => {
    const fontStyles = [GlobalStyles[`${TextType ? TextType.toLowerCase() : "large"}Text`], Nospace ? null : GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold, extraStyles];
    return (
        <Pressable onPress={() => { Global.pageReadText = text }} hitSlop={15} style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}>
            <Text style={fontStyles}>
                {text}{mandatory ? <Text style={[GlobalStyles[`${TextType ? TextType.toLowerCase() : "large"}Text`], { color: Colors.red }, Fonts.Nunito_700Bold]}>*</Text> : null}
            </Text>
        </Pressable>
    );
};
export default FieldLabel;
