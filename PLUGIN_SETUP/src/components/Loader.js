import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Fonts from '../utils/Fonts';

const Loader = () => (
    <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primaryButtonColor } />
        <Text style={[Fonts.Nunito_700Bold,GlobalStyles.normalText,{color: Colors.primaryButtonColor,margin:widthToDp(2)}]}>Loading</Text>
    </View>
);

const styles = StyleSheet.create({
    loaderContainer: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        height:heightToDp(16),
        width:widthToDp(32),
        marginTop: heightToDp(4),
        alignItems:"center",
        justifyContent:"center"
    }
});

export default Loader;
