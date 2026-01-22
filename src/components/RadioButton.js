import React from 'react';
import { View, StyleSheet } from 'react-native';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import VectorIcons from './VectorIcons';

const RadioButton = (props) => {
    return (
        <View>
            {props.selected ?
                <View style={[styles.selectedContainer, { backgroundColor: props.backgroundColor, height: props.bigImage ? heightToDp(4.5) : heightToDp(3), width: props.bigImage ? heightToDp(4.5) : heightToDp(3) }, props.extraStyles]}>
                    <VectorIcons groupName='AntDesign' iconName="check" iconstyle={{ color: props.iconColor ? props.iconColor : Colors.boxBackground }} iconsize={props.bigImage ? heightToDp(3.5) : heightToDp(2)} />
                </View>
                :
                <View style={[styles.nonselectedContainer, props.extraStyles]}></View>
            }
        </View>);
}

const styles = StyleSheet.create({
    selectedContainer: {
        borderRadius: 50,
        marginLeft: widthToDp(3),
        justifyContent: 'center',
        alignItems: 'center',
    },
    nonselectedContainer: {
        borderWidth: 2,
        borderRadius: 50,
        borderColor: Colors.textInputBorder,
        height: heightToDp(3),
        marginLeft: widthToDp(3),
        width: heightToDp(3),
    }
})
export default RadioButton;