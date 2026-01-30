import React, { useState, useRef } from 'react';
import { Dimensions, Text, View, FlatList, StyleSheet, Image } from 'react-native';
import CommonButton from './CommonButton';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import { widthToDp, heightToDp } from '../utils/Responsive';
import GlobalStyles from '../utils/GlobalStyles';
import { scale } from 'react-native-size-matters';
const WIDTH = Dimensions.get('window').width;

const GroupsList = (props) => {
    const [currentPage, setCurrentPage] = useState(0);
    const viewabilityConfig = useRef(null);

    const onViewableItemsChanged = ({ viewableItems }) => {
        const firstViewItem = viewableItems[viewableItems.length - 1].index;
        const index = props.groupData.findIndex(item => item.key === firstViewItem);
        setCurrentPage(index + 1);
    }

    const viewabilityConfigCallbackPairs = useRef([{ onViewableItemsChanged }]);

    return (
        <View>
            <FlatList
                data={props.groupData}
                ref={viewabilityConfig}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                horizontal
                decelerationRate={'normal'}
                scrollEventThrottle={16}
                renderItem={({ item }) =>
                    <View style={styles.container}>
                        <View style={styles.icon}>
                            <Image resizeMode='contain' style={styles.groupIcon} source={require("../assets/vectors/group_icon.png")} />
                        </View>
                        <View style={[{ flexDirection: 'column', width: '54%', paddingHorizontal: 10 }]}>
                            <Text style={[GlobalStyles.normalText, styles.groupname]}>{item.groupName}</Text>
                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_300Light]}>{item.groupDescription}</Text>
                        </View>
                        <View style={styles.buttoncontainer}>
                            <CommonButton buttonText="Join" extraTextStyles={{ fontSize: scale(14) }} extraStyles={styles.Button} />
                        </View>
                    </View>}
            />
            <View style={{ alignItems: 'center', width: '100%', marginTop: -25 }}>
                <FlatList
                    data={props.groupData}
                    horizontal={true}
                    pagingEnabled={true}
                    renderItem={({ item }) =>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: scale(40), color: item.groupId == currentPage ? Colors.primaryButtonColor : Colors.textInputBorder }}>.</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: WIDTH - widthToDp(6),
        paddingVertical: 10,
        paddingHorizontal: 3,
        alignItems: "center",
    },
    icon: {
        alignContent: "center",
    },
    groupname: {
        marginBottom: heightToDp(1),
    },
    buttoncontainer: {
        width: '18%',
        justifyContent: 'flex-end',
        alignSelf: "flex-end",
    },
    groupIcon: {
        height: heightToDp(10),
        width: heightToDp(10),
    },
    Button: {
        height: heightToDp(5),
    }
});

export default GroupsList;