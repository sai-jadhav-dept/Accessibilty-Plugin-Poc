import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Pressable } from 'react-native';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';

const windowWidth = Dimensions.get('window').width;

let ITEM_WIDTH = widthToDp(90);
let ITEM_MARGIN = 0;
let CAROUSEL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

export default function ReusableCarousel({ DATA, useRefValue, item_width, item_margin, carousel_width, defaultCenter, renderItemFunc, showBtn = true }) {
    ITEM_WIDTH = defaultCenter ? widthToDp(90) : widthToDp(item_width) || widthToDp(90);
    ITEM_MARGIN = defaultCenter ? 0 : item_margin || 0;
    CAROUSEL_WIDTH = defaultCenter ? ITEM_WIDTH + ITEM_MARGIN * 2 : carousel_width || ITEM_WIDTH + ITEM_MARGIN * 2;
    const [showLeftBtn, setShowLeftBtn] = useState(true);
    let snapIntervalAmount = DATA.length > 1 ? widthToDp(80) + ITEM_MARGIN * 2 : CAROUSEL_WIDTH;

    const handleScrollToOffset = (offsetValue) => {
        useRefValue.current.scrollToOffset({ offset: offsetValue, animated: true });
    }

    const forWardFlatList = () => {
        setShowLeftBtn(false);
        handleScrollToOffset(windowWidth);
    }

    const backWardFlatList = () => {
        setShowLeftBtn(true);
        handleScrollToOffset(0);
    }

    const handleScroll = (event) => {
        if (event.nativeEvent.contentOffset.x == 0) setShowLeftBtn(true);
        else setShowLeftBtn(false);
    }

    return (<View style={styles.container}>
        {(showBtn && !showLeftBtn) && <Pressable style={({ pressed }) => ([styles.leftArrowBtn, { opacity: pressed ? 0.5 : 1 }])}
            onPress={backWardFlatList}>
            <VectorIcons groupName="AntDesign" iconName="left" iconsize={widthToDp(5)} iconstyle={styles.ArrowIcon} />
        </Pressable>}
        {(showBtn && showLeftBtn) && <Pressable style={({ pressed }) => ([styles.rightArrowBtn, { opacity: pressed ? 0.5 : 1 }])}
            onPress={forWardFlatList}>
            <VectorIcons groupName="AntDesign" iconName="right" iconsize={widthToDp(5)} iconstyle={styles.ArrowIcon} />
        </Pressable>}
        <FlatList
            data={DATA}
            ref={useRefValue}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            snapToInterval={snapIntervalAmount}
            decelerationRate={"fast"}
            onScroll={handleScroll}
            keyExtractor={(item, index) => index}
            renderItem={({ item, index }) => (
                renderItemFunc(item, index)
            )}
        />
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: "visible",
        zIndex: -1,
    },
    leftArrowBtn: {
        position: "absolute",
        zIndex: 10,
        left: 0,
        top: -heightToDp(1),
        paddingVertical: widthToDp(4),
        paddingHorizontal: 0,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
    },
    rightArrowBtn: {
        position: "absolute",
        zIndex: 10,
        right: 0,
        top: -heightToDp(1),
        paddingVertical: widthToDp(4),
        paddingHorizontal: 0,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
    },
    ArrowIcon: {
        color: Colors.primaryTextColor
    }
});