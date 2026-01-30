import { View, Text, Pressable, StyleSheet, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { scale } from 'react-native-size-matters';
import moment from 'moment';

export default function MedicineReminderCard({ item, responseMedicationReminder, index, setselectedId, EnableMedicationAlert, Triggerupdatereminderstatus, isTimeLine, cancelMedication, modifyModalFunction, selectedMedicineDate }) {
    const now = moment();
    let visible = true;
    if (selectedMedicineDate?.dateStr) {
        const selectedDate = selectedMedicineDate.dateStr === 'Today'
            ? moment()
            : moment(selectedMedicineDate.dateStr, 'DD/MM/YYYY');
        const itemTime = moment(item.time, ['h:mm A']);
        const itemDateTime = moment(selectedDate)
            .set({
                hour: itemTime.get('hour'),
                minute: itemTime.get('minute'),
                second: 0,
                millisecond: 0,
            });
        if (itemDateTime.isBefore(now)) {
            visible = true; // past
        } else {
            visible = false; // future
        }
    }
    return (
        <View style={[isTimeLine ? styles.topContainer : [styles.topContainer, {
            borderLeftWidth: responseMedicationReminder.length - 1 == index ? 0 : 1,
            paddingBottom: responseMedicationReminder.length - 1 == index ? heightToDp(33) : heightToDp(2),
        }]]}>
            <View style={[styles.medicineDataCard, !isTimeLine && { marginLeft: widthToDp(4), marginRight: widthToDp(4), backgroundColor: item.completedStatus !== "2" ? Colors.defaultBackground : Colors.boxBackground, opacity: item.completedStatus !== "2" ? 1 : 0.7 }]}>
                <View style={[styles.medicineCardHeader]}>
                    <View style={{ width: "100%" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5), width: "80%", textDecorationLine: item.completedStatus == "2" ? "line-through" : "none" }, Fonts.Nunito_700Bold]}>
                                {item.name}
                            </Text>
                            {item.completedStatus !== "2" &&
                                (!visible &&
                                    <Pressable style={({ pressed }) => ([styles.activeCard, { opacity: pressed ? 0.5 : 1 }])}
                                        onPress={() => { cancelMedication(item); }}
                                    >
                                        <VectorIcons groupName="Entypo" iconName="cross" iconsize={scale(26)} iconstyle={[{ color: Colors.secondarybuttonColor }]} />
                                    </Pressable>)
                            }
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: heightToDp(2) }}>
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                {item.dosage}
                            </Text>
                            {isTimeLine &&
                                (<>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: widthToDp(2) }}>
                                        <VectorIcons groupName={"AntDesign"} iconName={"clockcircle"} iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(16)} />
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(2) }]}>
                                            {item.time}
                                        </Text>
                                    </View>
                                </>)}
                            <View style={[styles.takenMedicine]}>
                                <Text style={[{ color: Colors.successColor, fontSize: scale(12) }, Fonts.Nunito_600SemiBold]}>{item.taken || item.take}</Text>
                            </View>
                            {
                                item.completedStatus !== "2" &&
                                (!visible && <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.editButton])}
                                    onPress={() => { modifyModalFunction(item); }}
                                >
                                    <Image resizeMode='contain' style={styles.sliceImage_new} source={require("../assets/images/prescription.png")} />
                                </Pressable>)
                            }
                        </View>
                    </View>
                </View>
                {item.completedStatus !== "2" &&
                    <View style={[{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', width: '100%', borderRadius: 14 }]}>
                        {!isTimeLine && <View style={[{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', marginVertical: heightToDp(1) }]}>
                            <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, borderRadius: 14, paddingBottom: heightToDp(1), paddingHorizontal: widthToDp(2) }])}
                                onPress={() => { EnableMedicationAlert(item, item.alertsEnabled); }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <VectorIcons groupName="MaterialCommunityIcons" iconName="bell-outline" iconstyle={[{ color: Colors.primaryButtonColor }]} />
                                    <Text style={[GlobalStyles.buttonextrasmallText, { paddingLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>{item.alertsEnabled ? "Disable Alerts" : "Enable Alerts"}</Text>
                                </View>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    // if (item.completedStatus == "0")
                                    Triggerupdatereminderstatus(item);
                                }}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, borderRadius: 14, paddingBottom: heightToDp(1), paddingHorizontal: widthToDp(2) }])}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <VectorIcons groupName='AntDesign' iconName='checkcircle' iconstyle={[{ color: Colors.successColor }]} />
                                    <Text style={[GlobalStyles.buttonextrasmallText, { paddingLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>{item.completedStatus == 1 ? "Completed" : "Mark as complete"}</Text>
                                </View>
                            </Pressable>
                        </View>}
                    </View>
                }
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    topContainer: {
        borderLeftColor: Colors.primaryButtonColor,
        width: '95%',
        marginLeft: widthToDp(6),
        paddingTop: heightToDp(2),
    },
    medicineDataCard: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: Colors.defaultBackground,
        borderWidth: 1,
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        marginLeft: widthToDp(6),
        marginRight: widthToDp(2),
    },
    medicineCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: widthToDp(6),
        marginTop: heightToDp(2),
        justifyContent: "space-between",
        width: "87%",
    },
    inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        width: '30%',
        alignSelf: 'center',
        padding: widthToDp(4),
    },
    sliceImage_new: {
        height: widthToDp(7),
        width: widthToDp(7),
        marginTop: heightToDp(1)
    },
    activeCard: {
        borderRadius: 14,
        paddingVertical: heightToDp(1),
        paddingHorizontal: widthToDp(2),
        marginTop: -widthToDp(3),
        marginRight: -widthToDp(3)
    },
    takenMedicine: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        paddingVertical: heightToDp(1),
        paddingHorizontal: widthToDp(3),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: widthToDp(2)
    },
    editButton: {
        borderRadius: 14,
        paddingVertical: heightToDp(1),
        paddingHorizontal: widthToDp(2),
        marginBottom: heightToDp(1),
        marginRight: -widthToDp(3),
        position: "absolute", right: 0
    }
});