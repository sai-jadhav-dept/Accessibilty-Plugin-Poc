import { View, Text, FlatList, ImageBackground, Pressable } from 'react-native';
import React, { useState } from 'react';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import CommonButton from './CommonButton';
import Fonts from '../utils/Fonts';
import { ScaledSheet } from 'react-native-size-matters';
import GlobalStyles from '../utils/GlobalStyles';
import Colors from '../utils/Colors';

let ITEM_WIDTH = widthToDp(90);
let ITEM_MARGIN = 0;
let CAROUSEL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

export default function TreatmentCardCarousel({ DATA, myRef }) {

    const [currentIndex, setCurrentIndex] = useState(0);
    let snapIntervalAmount = DATA.length > 1 ? widthToDp(80) + ITEM_MARGIN * 2 : CAROUSEL_WIDTH;

    if (DATA.length > 1) {
        ITEM_WIDTH = widthToDp(80);
        CAROUSEL_WIDTH = widthToDp(80) + ITEM_MARGIN * 2;
    } else {
        ITEM_WIDTH = widthToDp(90);
        CAROUSEL_WIDTH = widthToDp(90) + ITEM_MARGIN * 2;
    }
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        const index = Math.round(contentOffset.x / CAROUSEL_WIDTH);
        setCurrentIndex(index);
    };

    return (
        <FlatList
            data={DATA}
            ref={myRef}
            onScroll={handleScroll}
            contentContainerStyle={[styles.contentContainer, currentIndex == 0 && { paddingLeft: -widthToDp(5.5) }]}
            pagingEnabled
            decelerationRate={"fast"}
            snapToInterval={snapIntervalAmount}
            horizontal
            style={{ width: widthToDp(95), alignSelf: "center" }}
            renderItem={({ item }) => {
                return (
                    <View style={[styles.item, { width: widthToDp(80) }]}>
                        <View style={{ margin: widthToDp(2), padding: 0 }}>
                            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginTop: heightToDp(2),
                                        width: '100%'
                                    }}>
                                    <ImageBackground
                                        resizeMode="cover"
                                        source={require('../assets/vectors/orange_slice.png')}
                                        style={[{ width: '100%', borderRadius: 14 }]}>
                                        <View
                                            style={{
                                                backgroundColor: 'rgba(255,203,1,0.8)',
                                                width: '100%',
                                                borderRadius: 14,
                                                padding: widthToDp(4),
                                                paddingVertical: heightToDp(4)
                                            }}>
                                            <View style={{ padding: 10 }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{item.status}</Text>
                                                <Text style={[GlobalStyles.normalText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>
                                                    {item.type}
                                                </Text>
                                                <Text style={[GlobalStyles.normalText, { marginTop: heightToDp(1) }, Fonts.Nunito_700Bold]}>
                                                    Cycle {item.cycle}
                                                </Text>
                                                <View style={styles.rowCenter}>
                                                    <VectorIcons
                                                        groupName="FontAwesome"
                                                        iconName="calendar"
                                                        iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(2) }]}
                                                    />
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold]}>{item.date}</Text>
                                                </View>
                                                <View style={styles.rowCenter}>
                                                    <VectorIcons
                                                        groupName="AntDesign"
                                                        iconName="clockcircle"
                                                        iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(2) }]}
                                                    />
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold]}>{item.time}</Text>
                                                </View>
                                                <View style={{ width: '60%', marginTop: heightToDp(2) }}>
                                                    <CommonButton
                                                        buttonText="Schedule Now"
                                                        extraStyles={{
                                                            height: heightToDp(4),
                                                            width: '100%',
                                                            backgroundColor: Colors.primaryButtonColor,
                                                            borderColor: Colors.boxBackground
                                                        }}
                                                        extraTextStyles={{ color: Colors.boxBackground }}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                );
            }}
        />
    )
}


const styles = ScaledSheet.create({
    rowCenter: {
        flexDirection: 'row',
        marginTop: heightToDp(2),
        alignItems: 'center',
    }
});