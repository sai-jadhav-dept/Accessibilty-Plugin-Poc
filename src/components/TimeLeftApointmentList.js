import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import moment from 'moment';
import { scale } from 'react-native-size-matters';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import { heightToDp, widthToDp } from '../utils/Responsive';
import CommonButton from './CommonButton';
import VectorIcons from './VectorIcons';
import GlobalStyles from '../utils/GlobalStyles';

let ITEM_WIDTH = widthToDp(90);
let ITEM_MARGIN = 0;
let CAROUSEL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

const TimeLeftApointmentList = ({ DATA, setShowConfirmationModal, setPopUpData, viewabilityConfig }) => {
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

    const onCompleteClick = (index) => {
        lappsedAppointments.splice(index, 1);
        if (lappsedAppointments.length == 0) {
            setShowPopup(false);
        }
    }

    const handlecancelButton = (item) => {
        setShowConfirmationModal(true);
        setPopUpData(item);
    }

    const handleRescheduledButton = (item) => {
        console.log('Pending');
    }

    return (
        <View style={GlobalStyles.fixedTopSpacing}>
            <FlatList
                data={DATA}
                ref={viewabilityConfig}
                pagingEnabled={true}
                horizontal snapToInterval={snapIntervalAmount}
                decelerationRate={"fast"}
                onScroll={handleScroll}
                contentContainerStyle={[styles.contentContainer, currentIndex == 0 && { paddingLeft: -widthToDp(6) }]}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index }) => {
                    return (
                        <View style={{ width: ITEM_WIDTH }}>
                            <View style={{ padding: 10, width: ITEM_WIDTH }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                    <View style={[styles.appointmentContainer]}>
                                        <View style={{ padding: 20 }}>
                                            <Text numberOfLines={1} style={[styles.appointmentHeading, Fonts.Nunito_700Bold, { fontSize: scale(20) }]}> {item.Name} </Text>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                                <View style={styles.detailsContainer}>
                                                    <VectorIcons groupName="FontAwesome" iconName="calendar" iconsize={widthToDp(5)} iconstyle={styles.detailsIcon} />
                                                    <Text style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_700Bold]}>{moment(item.Date).format("DD-MMM-YY")}</Text>
                                                </View>
                                                <View style={styles.detailsContainer}>
                                                    <VectorIcons groupName="AntDesign" iconName="clockcircle" iconsize={widthToDp(5)} iconstyle={styles.detailsIcon} />
                                                    <Text style={[GlobalStyles.backgroundnormalText, Fonts.Nunito_700Bold]}>{item.Time}</Text>
                                                </View>
                                            </View>
                                            <View style={[styles.ButtonContainer, GlobalStyles.fixedBottomSpacing]}>
                                                <View style={{ width: '40%' }}>
                                                    <CommonButton
                                                        buttonText="Cancel"
                                                        onPress={() => handlecancelButton()}
                                                        extraStyles={styles.Button}
                                                        extraTextStyles={{ color: Colors.primaryButtonColor }}
                                                    />
                                                </View>
                                                <View style={{ width: '50%' }}>
                                                    <CommonButton
                                                        buttonText="Reschedule"
                                                        onPress={() => handleRescheduledButton(item)}
                                                        extraStyles={[styles.Button, { width: '100%' }]}
                                                        extraTextStyles={{ color: Colors.primaryButtonColor }}
                                                    />
                                                </View>

                                            </View>
                                            <View style={{ width: '100%' }}>
                                                <CommonButton
                                                    buttonText="Mark as Complete"
                                                    onPress={() => onCompleteClick(index)}
                                                    extraStyles={styles.Button}
                                                    extraTextStyles={{ color: Colors.primaryButtonColor }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: ITEM_MARGIN,
        margin: 0,
        borderWidth: 2,
        borderColor: Colors.primaryTextColor,
        paddingLeft: widthToDp(9)
    },
    appointmentContainer: {
        backgroundColor: Colors.primaryButtonColor,
        width: '100%',
        borderRadius: 14,
        marginTop: -heightToDp(1),
    },
    appointmentHeading: {
        color: Colors.boxBackground,
        width: "95%",
        flexWrap: 'wrap'
    },
    detailsContainer: {
        flexDirection: 'row',
        marginTop: heightToDp(2),
        alignItems: 'center',
        width: '50%',
    },
    detailsIcon: {
        color: Colors.secondarybuttonColor,
        marginRight: widthToDp(2),
    },
    Button: {
        height: heightToDp(5),
        width: '100%',
        backgroundColor: Colors.boxBackground,
    },
    ButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-around",
        marginTop: heightToDp(2)
    }
});
export default TimeLeftApointmentList;