import React, { useState, useRef } from 'react';
import { Image, Text, View, FlatList, Pressable, StyleSheet, Dimensions } from "react-native";
import { widthToDp, heightToDp } from '../utils/Responsive';
import CommonButton from '../components/CommonButton';
import Colors from '../utils/Colors';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import VectorIcons from './VectorIcons';
import { scale } from 'react-native-size-matters';

const WIDTH = Dimensions.get('window').width;

const PatientDetailsInfoModal = (props) => {
    const [buttonText, setButtonText] = useState("");
    const INTRO_DATA = [
        {
            key: 0,
            btnTxt: 'Next',
            infoTitle: "HOPE will send a verification link to your Patient’s mobile number or email ID.",
            img: require('../assets/images/authentication.png')
        },
        {
            key: 1,
            btnTxt: 'Next',
            infoTitle: "Patient have to verify and give permission to user to manage HOPE health Account",
            img: require('../assets/images/verified.png')
        },
        {
            key: 2,
            btnTxt: 'I understand',
            infoTitle: "Incase Patient is minor, Guardian have to provide consent and agree to HOPE’s T&C.",
            img: require('../assets/images/kids.png')
        },
    ];

    let [currentIndex, setCurrentIndex] = useState(1);
    const viewabilityConfig = useRef(null);

    const moveNext = () => {
        if (currentIndex == INTRO_DATA.length - 1) {
            props.functionPropNameHere();
        }
        else {
            currentIndex = currentIndex + 1
            viewabilityConfig.current.scrollToIndex({ index: currentIndex });
        }
    };

    const onViewableItemsChanged = ({ viewableItems }) => {
        const firstViewItem = viewableItems[viewableItems.length - 1].index;
        const index = INTRO_DATA.findIndex(item => item.key === firstViewItem);
        setCurrentIndex(index)
        if (firstViewItem < INTRO_DATA.length - 1) {
            setButtonText("Next")
        }
        else {
            setButtonText("I understand")
        }
    }

    const viewabilityConfigCallbackPairs = useRef([
        { onViewableItemsChanged },
    ]);

    return (
        <View style={[GlobalStyles.mainContainer, styles.modalbackground, { flexDirection: 'column-reverse' }]}>
            <View style={[styles.modalBody, { height: '80%' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: heightToDp(3) }}>
                    <Text style={[GlobalStyles.extralargeText, styles.HowText, Fonts.Nunito_700Bold]}>How it Works?</Text>
                    <Pressable style={styles.CloseButton} onPress={() => props.functionPropNameHere()}>
                        <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(20)} iconstyle={{ color: Colors.placeholderTextColor }} />
                    </Pressable>
                </View>
                <View style={{ backgroundColor: Colors.boxBackground, height: '75%', borderRadius: 14 }}>
                    <FlatList
                        data={INTRO_DATA}
                        ref={viewabilityConfig}
                        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        horizontal
                        decelerationRate={'normal'}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => {
                            return (
                                <View style={[styles.infoModalSubContainer, { width: WIDTH - (currentIndex == item.length - 1 ? widthToDp(8) : widthToDp(7)) }]}>
                                    <Text style={[GlobalStyles.largeText, styles.infoModalText, Fonts.Nunito_600SemiBold]}>{item.infoTitle}</Text>
                                    <View style={[styles.infoModalImage]}>
                                        <Image source={item.img} style={styles.infoIcon} resizeMode='contain' />
                                    </View>
                                </View>
                            );
                        }}
                    />
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <FlatList
                            data={INTRO_DATA}
                            horizontal={true}
                            pagingEnabled={true}
                            renderItem={({ item }) =>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: scale(40), color: item.key == currentIndex ? Colors.primaryButtonColor : Colors.textInputBorder }}>.</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
                <View style={{ marginTop: 10 }}>
                    <CommonButton buttonText={buttonText} onPress={() => moveNext()} extraStyles={{ width: '100%' }} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    infoIcon: {
        width: '100%',
        height: heightToDp(30),
        alignItems: 'center',
    },
    modalBody: {
        backgroundColor: 'rgba(250, 250, 250, 0.93)',
        borderRadius: 14,
        borderBottomEndRadius: 0,
        paddingTop: widthToDp(4),
        paddingHorizontal: widthToDp(4),
    },
    modalbackground: {
        backgroundColor: Colors.modalBackground,
    },
    infoModalSubContainer: {
        paddingVertical: heightToDp(4),
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        borderTopLeftRadius: 14
    },
    infoModalText: {
        paddingHorizontal: widthToDp(4),
    },
    infoModalImage: {
        backgroundColor: Colors.boxBackground,
        width: '100%',
        borderRadius: 14,
        marginTop: heightToDp(2),
        alignSelf: 'center',
    },
    HowText: {
        marginHorizontal: widthToDp(2)
    },
    CloseButton: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 50,
        height: 30,
        width: 30,
        padding: 4.5
    }
})
export default PatientDetailsInfoModal;