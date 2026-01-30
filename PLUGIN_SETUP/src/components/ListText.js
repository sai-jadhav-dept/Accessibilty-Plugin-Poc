import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import { widthToDp, heightToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import GlobalStyles from '../utils/GlobalStyles';

const ListText = (props) => {
    return (
        <View style={[styles.container, props.extraStyles]}>
            <VectorIcons
                groupName="MaterialCommunityIcons"
                iconName="checkbox-blank-circle"
                iconsize={widthToDp(2)}
                iconstyle={styles.circlecontainer}
            />
            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                {props.listItem}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: heightToDp(0.5),
    },
    circlecontainer: {
        color: Colors.primaryTextColor,
        marginRight: widthToDp(2),
        marginTop: heightToDp(1),
    }
});

export default ListText;
