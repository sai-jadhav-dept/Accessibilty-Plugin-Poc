
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, FlatList } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import VoiceSearch from '../components/VoiceSearch';
import FastImage from 'react-native-fast-image';
import { scale } from 'react-native-size-matters';
import FieldLabel from '../components/FieldLabel';

const MyNurseAppointment = () => {
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [selectedFilter, setSelectedFilter] = useState({
        showValue: "Filters",
        value: "Confirmed"
    });
    const appointmentFilterData = [
        {
            key: 0,
            name: 'Confirmed',
            value: 'Upcoming',
            id: 1,
        },
        {
            key: 1,
            name: 'Completed',
            value: 'Completed',
            id: 2,
        },
        {
            key: 2,
            name: 'Cancelled',
            value: 'Cancelled',
            id: 3,
        },
    ];
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const appointmentList = [
        {
            profilImage: "",
            name: "Jane Doe",
            location: "Pune",
            date: "10 May 2024",
            time: "09:00AM -12:00 PM",
            services: ["Daily Care", "Medication", "Feeding"]
        },
        {
            profilImage: "",
            name: "Jane Doe",
            location: "Pune",
            date: "10 May 2024",
            time: "09:00AM -12:00 PM",
            services: ["Daily Care", "Medication", "Feeding"]
        },
        {
            profilImage: "",
            name: "Jane Doe",
            location: "Pune",
            date: "10 May 2024",
            time: "09:00AM -12:00 PM",
            services: ["Daily Care", "Medication", "Feeding"]
        },
    ];

    useEffect(() => {
        setShowFilterDropdown(false);
    }, [])

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="My Appointments"
                    onPress={() => navigation.navigate("Dashboard")}
                />
                <VoiceSearch
                    placeholderText={"Search"}
                    getName={(text) => { setName(text) }}
                    isSearchOutline={true}
                    isMicNeeded={true}
                    extraStyles={{
                        marginTop: heightToDp(2),
                    }}
                    keyboardType={"default"}
                />
                <View style={{ display: "flex", alignItems: "flex-end", marginVertical: heightToDp(2) }}>
                    <Pressable
                        onPress={() => setShowFilterDropdown(preValue => !preValue)}
                        style={({ pressed }) => ([styles.filtercontainer, { opacity: pressed ? 0.4 : 1, width: (selectedFilter == 'Filter') ? widthToDp(28) : widthToDp(32) }])}
                    >
                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(14) }]}>
                            {selectedFilter.showValue}
                        </Text>
                        <VectorIcons groupName='MaterialCommunityIcons' iconName='filter-variant' iconstyle={[{ color: Colors.primaryTextColor, marginHorizontal: widthToDp(2) }]} />
                    </Pressable>
                </View>
                {showFilterDropdown &&
                    <FlatList
                        data={appointmentFilterData}
                        style={[styles.boxcontainer, GlobalStyles.inputBoxShadow, { marginTop: heightToDp(1) }]}
                        keyExtractor={(item, index) => "key" + index}
                        renderItem={({ item, index, data }) =>
                            <Pressable
                                onPress={() => {
                                    setShowFilterDropdown(false);
                                    setSelectedFilter({
                                        showValue: item.value,
                                        value: item.name
                                    });
                                }}
                                style={({ pressed }) => ([{
                                    opacity: pressed ? 0.4 : 1,
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                    paddingHorizontal: widthToDp(6),
                                    paddingVertical: heightToDp(1),
                                    borderTopWidth: (index == 0) ? 1 : 0,
                                    borderBottomWidth: 1,
                                    borderLeftWidth: 1,
                                    borderColor: 'rgba(60,60,67,0.1)',
                                    borderTopLeftRadius: (index == 0) ? 14 : 0,
                                    borderTopRightRadius: (index == 0) ? 14 : 0,
                                    borderBottomLeftRadius: (index == appointmentFilterData.length - 1) ? 14 : 0,
                                    borderBottomRightRadius: (index == appointmentFilterData.length - 1) ? 14 : 0
                                }])}>
                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>{item.value}</Text>
                            </Pressable>
                        }
                    />}
                <ScrollView>
                    {appointmentList.map((item) =>

                        <View style={[{ marginVertical: heightToDp(1), padding: widthToDp(2) }]}>
                            <Pressable
                                style={({ pressed }) => ([GlobalStyles.inputBoxShadow, {
                                    width: '100%',
                                    borderRadius: 14,
                                    padding: widthToDp(6),
                                    opacity: pressed ? 0.5 : 1,
                                    backgroundColor: Colors.defaultBackground,
                                    overflow: "hidden"

                                }])}
                            >
                                <View style={{ flexDirection: "row" }}>
                                    <View>
                                        <FastImage
                                            resizeMode={FastImage.resizeMode.cover}
                                            style={styles.profileimage}
                                            source={item.profilImage !== "" ?
                                                { uri: item.profilImage, priority: FastImage.priority.high, cache: 'web' }
                                                :
                                                require("../assets/images/profile.png")}
                                        />
                                    </View>
                                    <View style={{ marginLeft: widthToDp(4) }}>
                                        <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>{item.name}</Text>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{item.location}</Text>
                                    </View>
                                </View>
                                <View style={[styles.vectorIconsContainer]}>
                                    <View style={styles.rowCenter}>
                                        <VectorIcons
                                            groupName="FontAwesome"
                                            iconName="calendar"
                                            iconsize={widthToDp(6)}
                                            iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(2) }]}
                                        />
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]} >{item.date}</Text>
                                    </View>
                                </View>
                                <View style={[styles.vectorIconsContainer]}>
                                    <View style={styles.rowCenter}>
                                        <VectorIcons
                                            groupName="AntDesign"
                                            iconName="clockcircle"
                                            iconsize={widthToDp(6)}
                                            iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(2) }]}
                                        />
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]} >{item.time}</Text>
                                    </View>
                                </View>
                                <FlatList
                                    style={{ marginTop: heightToDp(2) }}
                                    data={item.services}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(service) => service.toString()}
                                    renderItem={({ item: service }) => (
                                        <View style={[styles.rowCenter, { backgroundColor: Colors.boxBackground, marginRight: widthToDp(2) }]}>
                                            <FieldLabel text={service} Nospace={true} TextType={"Small"} />
                                        </View>
                                    )}
                                    ListEmptyComponent={() => null}
                                />

                                <View style={[GlobalStyles.rowSpaceBetween, { marginTop: heightToDp(2), }]}>
                                    <CommonButton
                                        buttonText="Reschedule"
                                        extraStyles={{
                                            width: '45%',
                                            backgroundColor: Colors.defaultBackground,
                                            borderColor: Colors.textInputBorder,
                                            borderWidth: 2
                                        }}
                                        extraTextStyles={{ color: Colors.primaryButtonColor }}
                                    />
                                    <CommonButton
                                        buttonText="Connect"
                                        extraStyles={{
                                            width: '45%',
                                            backgroundColor: Colors.primaryButtonColor,
                                            borderColor: Colors.boxBackground
                                        }}
                                        extraTextStyles={{ color: Colors.boxBackground }}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    filtercontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(1),
        borderRadius: 14,
    },
    profileimage: {
        top: heightToDp(0.5),
        borderRadius: 50,
        height: scale(50),
        width: scale(50),
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthToDp(4),
        paddingVertical: widthToDp(4),
        borderRadius: 14
    },
    boxcontainer: {
        position: 'absolute',
        top: heightToDp(24),
        right: 0,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        zIndex: 10
    },
    vectorIconsContainer: {
        flexDirection: "row",
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginTop: heightToDp(2),
    }
});

export default MyNurseAppointment;