import React from 'react';
import { View, Pressable, Image, StyleSheet, Linking, ToastAndroid } from 'react-native';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { scale } from 'react-native-size-matters'
import Global from '../screens/Global';
import Colors from '../utils/Colors';
import FastImage from 'react-native-fast-image';
import VectorIcons from './VectorIcons';
import { FilteredImage } from '../accessibility';

const Logo = (props) => {

    const openWhatsApp = () => {
        const url = `whatsapp://send?phone=${+919820041923}&text=${encodeURIComponent("Hi")}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    ToastMessagerFunction('WhatsApp is not installed on your device');
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error('Error occurred', err));
    };

    const ToastMessagerFunction = (msg) => {
        if (Global.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            handleShowAlert(msg)
        }
    }

    const handleShowAlert = (msg) => {
        props.setToastVisible(true);
        props.setToastMessageText(msg);
        setTimeout(() => {
            props.setToastVisible(false);
        }, 1500);
    };

    return (
        <View style={[styles.Container, { marginTop: props.profile ? heightToDp(0) : heightToDp(1) }]}>
            <View style={[props.extraStyles, { width: props.visible ? props.profile ? "58%" : '75%' : '100%' }]}>
                {/* <Image resizeMode='contain' style={styles.LogoImage} source={require("../assets/images/logo.png")} /> */}
                <FilteredImage resizeMode='contain' style={styles.LogoImage} source={require("../assets/images/logo.png")} />

            </View>
            {props.visible ?
                <View style={styles.buttonContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: 'column', marginRight: widthToDp(4) }}>
                            <Pressable
                                onPress={() => { openWhatsApp() }}
                                style={({ pressed }) => ([{
                                    opacity: pressed ? 0.4 : 1,
                                    overflow: 'hidden',
                                    backgroundColor: Colors.defaultBackground,
                                    borderRadius: 50
                                }])}>
                                <VectorIcons groupName='FontAwesome' iconName="whatsapp" iconsize={scale(26)} iconstyle={{ color: Colors.defaultBackground, backgroundColor: Colors.successColor, paddingHorizontal: scale(5), paddingVertical: scale(3) }} />
                            </Pressable>
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <Pressable
                                onPress={props.chatFn}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                            >
                                <Image resizeMode='contain' style={styles.buttonIcons} source={require("../assets/vectors/chat.png")} />
                            </Pressable>
                        </View>
                    </View>
                </View>
                :
                null
            }
            {props.profile ?
                <View style={{ flexDirection: 'column', marginLeft: widthToDp(4) }}>
                    <FastImage
                        key={Date.now()}
                        resizeMode={FastImage.resizeMode.cover}
                        source={Global.userInfo.image ? { uri: `${Global.userInfo.image}`, priority: FastImage.priority.high, cache: 'web' } : require('../assets/images/profile.png')}
                        style={{
                            marginTop: heightToDp(1),
                            height: scale(40),
                            width: scale(40),
                            borderColor: Colors.primaryButtonColor,
                            borderWidth: 3,
                            borderRadius: 50,
                            overflow: 'hidden',
                            marginBottom: heightToDp(0.5)
                        }}
                    />
                </View>
                : null
            }
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