import React from 'react';
import { View, Text, Pressable } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import { useDynamicColors } from '../accessibility';
import VectorIcons from './VectorIcons';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Global from '../screens/Global';

export default function CommonButton(props) {

    const enlargeButtons = Global.accessibility?.enlargeButtons || false;
    const sizeMultiplier = enlargeButtons ? 1.3 : 1;
    const colors = useDynamicColors();

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
            style={({ pressed }) => ([
                GlobalStyles.commonButton, 
                { 
                    opacity: pressed ? 0.6 : 1,
                    paddingVertical: heightToDp(1.8) * sizeMultiplier,
                    paddingHorizontal: widthToDp(4) * sizeMultiplier,
                    minHeight: 48 * sizeMultiplier,
                }, 
                props.extraStyles
            ])}>
            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                {
                    props.visiblePlus
                        ?
                        <View>
                            <VectorIcons groupName='AntDesign' iconName="pluscircle" iconstyle={[{ color: colors.secondarybuttonColor, marginHorizontal: widthToDp(2),fontSize: 16 * sizeMultiplier }, props.extraStylesPlus]} />
                        </View>
                        :
                        null
                }
                <View style={{ flexDirection: 'column' }}>
                    <Text style={[GlobalStyles.mediumText, { color: colors.buttonTextColor || colors.boxBackground,fontSize: 14 * sizeMultiplier }, Fonts.Nunito_600SemiBold, props.extraTextStyles]}>{props.buttonText}</Text>
                </View>
                {
                    props.visible
                        ?
                        <View>
                            <VectorIcons groupName='AntDesign' iconName="arrowright" iconstyle={{ color: colors.buttonTextColor || colors.boxBackground, marginHorizontal: widthToDp(2), marginTop: heightToDp(0.35), fontSize: 16 * sizeMultiplier }} />
                        </View>
                        :
                        null
                }
            </View>
        </Pressable>
    );
}