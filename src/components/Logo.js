import React from 'react';
import { View, StyleSheet } from 'react-native';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { scale } from 'react-native-size-matters'
import Colors from '../utils/Colors';
import { AccessibleFilteredImage } from '../accessibility';

const Logo = (props) => {

    return (
        <View style={[styles.Container, { marginTop: props.profile ? heightToDp(0) : heightToDp(1) }]}>
            <View style={[props.extraStyles, { width: props.visible ? props.profile ? "58%" : '75%' : '100%' }]}>
                <AccessibleFilteredImage
                    source={require("../assets/images/logo.png")}
                    style={styles.LogoImage}
                    resizeMode='contain'
                    alt="Company Logo"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    Container: {
        flexDirection: 'row',
        alignItems: "center",
        padding: heightToDp(1),
    },
    LogoImage: {
        height: scale(40),
        width: scale(175),
        marginLeft: -widthToDp(16),
    },
    buttonContainer: {
        flexDirection: 'column',
        width: '25%',
        alignItems: 'center',
        marginLeft: widthToDp(2),
    },
    buttonIcons: {
        height: heightToDp(3.5),
    },
    profileimage: {
        marginTop: heightToDp(1),
        height: scale(33),
        width: scale(33),
        borderColor: Colors.primaryButtonColor,
        borderWidth: 3,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: heightToDp(0.5)
    }
});

export default Logo;