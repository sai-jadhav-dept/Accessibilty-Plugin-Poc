import React from 'react';
import { View, Text, Pressable } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import VectorIcons from './VectorIcons';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Global from '../screens/Global';

export default function CommonButton(props) {

    const handleOnPress = (async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            if (props.onPress) {
                await props.onPress();
            } else {
                console.log("default function");
            }
            Global.clicked = false;
        }
    })

    return (
        <Pressable disabled={props.disabled} onPress={() => { handleOnPress() }}
            style={({ pressed }) => ([GlobalStyles.commonButton, { opacity: pressed ? 0.6 : 1 }, props.extraStyles])}>
            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                {
                    props.visiblePlus
                        ?
                        <View>
                            <VectorIcons groupName='AntDesign' iconName="pluscircle" iconstyle={[{ color: Colors.secondarybuttonColor, marginHorizontal: widthToDp(2) }, props.extraStylesPlus]} />
                        </View>
                        :
                        null
                }
                <View style={{ flexDirection: 'column' }}>
                    <Text style={[GlobalStyles.mediumText, { color: Colors.boxBackground }, Fonts.Nunito_600SemiBold, props.extraTextStyles]}>{props.buttonText}</Text>
                </View>
                {
                    props.visible
                        ?
                        <View>
                            <VectorIcons groupName='AntDesign' iconName="arrowright" iconstyle={{ color: Colors.boxBackground, marginHorizontal: widthToDp(2), marginTop: heightToDp(0.35) }} />
                        </View>
                        :
                        null
                }
            </View>
        </Pressable>
    );
}