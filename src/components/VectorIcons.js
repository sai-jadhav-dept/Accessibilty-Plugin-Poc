import React from 'react';
import { View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import Octicons from 'react-native-vector-icons/Octicons';
import { widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';

const VectorIcons = (props) => {
    const iconsize = props.iconsize ? props.iconsize : widthToDp(6);
    const iconstyle = props.iconstyle ? props.iconstyle : { color: Colors.primaryinactive };

    return (
        <View style={[props.extraStyles]}>
            {
                props.groupName == 'AntDesign' ? <AntDesign name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'FontAwesome' ? <FontAwesome name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'FontAwesome5' ? <FontAwesome5 name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'Ionicons' ? <Ionicons name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'Entypo' ? <Entypo name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'MaterialIcons' ? <MaterialIcons name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'Feather' ? <Feather name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'MaterialCommunityIcons' ? <MaterialCommunityIcons name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'EvilIcons' ? <EvilIcons name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'Foundation' ? <Foundation name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
            {
                props.groupName == 'Octicons' ? <Octicons name={props.iconName} size={iconsize} style={iconstyle} /> : null
            }
        </View>
    );
}

export default VectorIcons;