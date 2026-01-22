import React, { createRef, useState } from 'react';
import { View, Text, Pressable, FlatList, SafeAreaView } from 'react-native';
import moment from 'moment';
import GlobalStyles from '../utils/GlobalStyles';
import Share from 'react-native-share';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp } from '../utils/Responsive';
import VitalOptions from '../components/VitalOptions';
import { scale } from "react-native-size-matters";
import FieldLabel from '../components/FieldLabel';
import ViewShot from 'react-native-view-shot';

const Vitals = (props) => {
    const viewShotRef = createRef();
    const [sendDisable, setSendDisable] = useState(false)

    const captureViewShot = async () => {
        setSendDisable(true);
        const capturedURI = await viewShotRef.current.capture();
        shareImage(capturedURI);
        setSendDisable(false);
    };

    const shareImage = async (capturedURI) => {
        if (capturedURI) {
            const options = {
                title: 'Share Image',
                url: capturedURI,
                type: 'image/jpeg',
                filename: "Vital's Data"
            };
            Share.open(options)
                .then((res) => {
                    console.log('Shared:', res);
                })
                .catch((err) => {
                    console.log('Error sharing:', err);
                });
        } else {
            console.log('No image captured yet.');
        }
        setSendDisable(false);
    };

    const createVitalsData = (newVitalData) => {
        props.setDisable(true);
        props.getVitalData(newVitalData);
    }
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <ViewShot style={{ flex: 1, backgroundColor: Colors.defaultBackground }}
                ref={viewShotRef}
                captureMode="mount"
                options={{ format: "jpg", quality: 1.0 }}
                onCapture={() => shareImage}
            >
                <View style={{ flex: 1, marginHorizontal: widthToDp(0), paddingBottom: heightToDp(5) }}>
                    <VitalOptions
                        setNotEditable={props.setNotEditable}
                        setDate={props.setDate}
                        date={props.date}
                        isReadingsScreen={sendDisable}
                        extraStyles={{ marginHorizontal: widthToDp(4) }}
                        ShareData={captureViewShot}
                        onRefreshBtn={props.onRefreshBtn}
                        cycleID={props.cycleID}
                        newVitalData={props.notEditable}
                        setEditable={props.setEditable}
                        selectedTreatmentCycleObj={props.selectedTreatmentCycleObj}
                    />
                    <FlatList
                        data={Object.values(props.newVitalData)}
                        style={GlobalStyles.fixedTopSpacing}
                        keyExtractor={(item, index) => "key" + index}
                        renderItem={({ item, index }) => {
                            return <Pressable
                                onPress={() => { createVitalsData(item) }}
                                style={({ pressed }) => ([GlobalStyles.rowSpaceBetween, {
                                    opacity: pressed ? 0.5 : 1,
                                    borderBottomWidth: 1,
                                    borderLeftColor: Colors.primaryButtonColor,
                                    borderBottomColor: Colors.primaryinactive,
                                    borderLeftWidth: widthToDp(1),
                                    paddingHorizontal: widthToDp(4),
                                    paddingVertical: widthToDp(1),

                                }])}>
                                <View style={[{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }]}>
                                    <FieldLabel
                                        TextType={"normal"}
                                        text={item?.name}
                                        Nospace={true}
                                        extraStyles={{ color: Colors.primaryinactive, fontSize: scale(16) }}
                                    />
                                    <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: (item.unit == 'C') ? 'flex-start' : 'flex-end' }]}>
                                        <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>
                                            {item.value || "--"}
                                        </Text>
                                        {
                                            item.unit == 'C' ?
                                                <View style={GlobalStyles.columnFlexstart}>
                                                    <Text style={[GlobalStyles.normalText, { marginLeft: widthToDp(0.5) }, Fonts.Nunito_600SemiBold]}>o</Text>
                                                </View>
                                                :
                                                null
                                        }
                                        <Text
                                            style={[
                                                {
                                                    color: Colors.primaryTextColor,
                                                    fontSize: (item.unit == "%" || item.unit == "C") ? scale(24) : scale(18),
                                                    marginBottom: (item.unit == "%" || item.unit == "C") ? heightToDp(0) : heightToDp(0.5)
                                                },
                                                Fonts.Nunito_600SemiBold
                                            ]}>
                                            {item.unit == '%' ? item.unit : ' ' + item.unit}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }]}>
                                    <Text style={[{ color: item.recordedBy == "Self" ? Colors.primaryButtonColor : Colors.secondarybuttonColor, fontSize: scale(14) }, Fonts.Nunito_600SemiBold]}>
                                        {item.recordedBy ? ("Recorded by " + item.recordedBy) : ""}
                                    </Text>
                                    <Text style={[GlobalStyles.smallText, { marginTop: heightToDp(0.5) }, Fonts.Nunito_600SemiBold]}>
                                        {item.time ? moment(item.time, 'hh:mm A').format('hh:mm A') : ""}
                                    </Text>
                                </View>
                            </Pressable>
                        }
                        }
                    />
                </View>
            </ViewShot>
        </SafeAreaView>
    );
}

export default Vitals;