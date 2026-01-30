import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Linking, ToastAndroid } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import { scale } from 'react-native-size-matters'
import GlobalStyles from '../utils/GlobalStyles';
import ToastMessage from './ToastMessage';
import Global from '../screens/Global';

const Header = (props) => {
    const ShowIcon = props?.ShowIcon ? true : false;
    const hideWhatsapp = props?.hideWhatsapp ? true : false;
    const scrollX = useRef(new Animated.Value(0)).current;
    const lenghtChecker = props.headerTitle && props.headerTitle.length > 23;
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessageText, setToastMessageText] = useState("");
    const handleOnPress = (() => {
        if (props.onPress) {
            props.onPress();
        } else {
            console.log("default function");
        }
    })
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
        setToastVisible(true);
        setToastMessageText(msg);
        setTimeout(() => {
            setToastVisible(false);
        }, 1500);
    };

    useEffect(() => {
        if (lenghtChecker) {
            Animated.loop(
                Animated.timing(scrollX, {
                    toValue: 1,
                    duration: 6000, // Adjust the duration for speed
                    useNativeDriver: false,
                })
            ).start();
        }
    }, [scrollX]);

    return (
        <View style={[styles.headerContainer, props.extraStyles, { width: "auto", overflow: 'hidden' }]}>
            {
                !ShowIcon &&
                <Pressable
                    style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1, zIndex: 9999, backgroundColor: Colors.defaultBackground }, styles.headerBackArrowContainer])}
                    onPress={props.onPress ? props.onPress : () => console.log("default function")}>
                    <VectorIcons groupName='AntDesign' iconName="arrowleft" iconstyle={{ color: Colors.primaryTextColor, backgroundColor: Colors.defaultBackground }} />
                </Pressable>
            }
            {!lenghtChecker ?
                <Text style={[GlobalStyles.largeText, styles.headerTitle, Fonts.Nunito_700Bold, props.headerTitleStyles, { width: "80%" }]}>
                    {props.headerTitle}
                </Text>
                :
                <View style={{ width: "120%", overflow: "hidden" }}>
                    <Animated.View
                        style={[
                            styles.marquee,
                            {
                                transform: [
                                    {
                                        translateX: scrollX.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -350], // Adjust the value based on the screen width
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Text style={[GlobalStyles.largeText, styles.headerTitle, Fonts.Nunito_700Bold,]}>{props.headerTitle}</Text>
                    </Animated.View>
                </View>
            }
            <View style={{ position: "absolute", right: 0, flexDirection: "row" }}>
                {
                    props.callActive ?
                        <View style={{ marginRight: 20 }}>
                            <VectorIcons groupName='FontAwesome' iconName="phone" iconsize={widthToDp(7)} iconstyle={{ color: Colors.primaryButtonColor }} />
                        </View>
                        : null
                }
                {
                    props.threeDotsActive ?
                        <Pressable style={props.threeDotstyle || {}}
                            onPress={props.threeDotOnPress}
                        >
                            <VectorIcons groupName='Entypo' iconName="dots-three-vertical" iconstyle={{ color: Colors.primaryTextColor }} iconsize={scale(20)} />
                        </Pressable>
                        : null
                }
            </View>
            {
                !hideWhatsapp &&
                <Pressable
                    onPress={() => { openWhatsApp() }}
                    style={({ pressed }) => ([{
                        opacity: pressed ? 0.4 : 1
                        , position: "absolute",
                        right: 0,
                        marginTop: heightToDp(2),
                        overflow: 'hidden',
                        backgroundColor: Colors.defaultBackground,
                        borderRadius: 50
                    }])}>
                    <VectorIcons groupName='FontAwesome' iconName="whatsapp" iconsize={scale(26)} iconstyle={{ color: Colors.defaultBackground, backgroundColor: Colors.successColor, paddingHorizontal: scale(3), paddingVertical: scale(2) }} />
                </Pressable>
            }
            <ToastMessage visible={toastVisible} text={toastMessageText} />
        </View>
    );
}

const styles = StyleSheet.create(
    {
        headerContainer: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            height: 55,
        },
        marquee: {
            flexDirection: 'row', // Move text horizontally
            alignItems: 'center',
        },
        text: {
            fontSize: 24,
            fontWeight: 'bold',
            maxWidth: "100%"
        },
        headerBackArrowContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: widthToDp(2),
        },
        headerTitle: {
            marginLeft: widthToDp(1),
        },
    });

export default Header;