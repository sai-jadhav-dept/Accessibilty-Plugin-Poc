import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Pressable, FlatList } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import DoctorsData from '../assets/mdm/DoctorsData.json'

const Favourites = () => {
    const navigation = useNavigation();
    const [doctors, setDoctors] = useState(DoctorsData)
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const toggleSelectedIndex = (index) => {
        setSelectedIndex((prevIndex) => (prevIndex === index ? -1 : index));
    };

    const onDeleteClick = (item) => {
        const newData = DoctorsData.filter((value) => {
            return value.id != item.id
        });
        setDoctors(newData);
        toggleSelectedIndex(index);
    }


    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="My Favourites"
                    onPress={() => { navigation.navigate("Dashboard") }}
                />
                <FlatList
                    data={doctors}
                    contentContainerStyle={{ paddingBottom: heightToDp(4) }}
                    style={{ height: "100%" }}
                    keyExtractor={(item, index) => 'key' + index}
                    renderItem={({ item, index }) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <TouchableOpacity>
                                <View style={[{
                                    backgroundColor: Colors.boxBackground,
                                    marginBottom: heightToDp(3),
                                    marginTop: heightToDp(1),
                                    borderRadius: 14
                                }]}>
                                    <View style={{ flexDirection: 'row', marginBottom: -heightToDp(1) }}>
                                        <View style={styles.doctorCardDetails}>
                                            <View style={styles.doctorImageContainer}>
                                                <Image resizeMode="contain" style={{ height: heightToDp(20), width: widthToDp(24) }} source={require("../assets/images/profile.png")} />
                                            </View>
                                            <View style={{ paddingHorizontal: widthToDp(4), paddingVertical: heightToDp(2) }}>
                                                <View style={GlobalStyles.rowSpaceBetween}>
                                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{item.name}</Text>
                                                </View>
                                                <View style={GlobalStyles.rowSpaceBetween}>
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(1) }]}>{item.Specialization} ({item.Experience}+ Years)</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: heightToDp(1) }}>
                                                    <VectorIcons groupName='FontAwesome' iconName='star' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }]} />
                                                    <VectorIcons groupName='FontAwesome' iconName='star' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }]} />
                                                    <VectorIcons groupName='FontAwesome' iconName='star' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }]} />
                                                    <VectorIcons groupName='FontAwesome' iconName='star' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }]} />
                                                    <VectorIcons groupName='FontAwesome' iconName='star-half-empty' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }]} />
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: heightToDp(1) }}>
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_700Bold]}>
                                                        Approx. Charge :
                                                    </Text>
                                                    <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}><Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold, { color: Colors.primaryButtonColor }]}>₹ {item.Location[0].ClinicDetails[0].Fees} / visit</Text></Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ position: "absolute", right: widthToDp(3), top: heightToDp(1) }}>
                                        <Pressable
                                            style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}
                                            onPress={() => toggleSelectedIndex(index)}
                                        >
                                            <VectorIcons groupName='Entypo' iconName='dots-three-horizontal' iconsize={widthToDp(6)} iconstyle={[{ color: Colors.primaryTextColor }]} />
                                        </Pressable>
                                    </View>
                                    {isSelected && (
                                        <Pressable
                                            style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, padding: widthToDp(2), backgroundColor: Colors.defaultBackground, width: "25%", alignItems: "center", borderRadius: 14, position: "absolute", right: 2, marginTop: heightToDp(4) }, GlobalStyles.inputBoxShadow])}
                                            onPress={() => onDeleteClick(item)}
                                        >
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                                Delete
                                            </Text>
                                        </Pressable>
                                    )
                                    }
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    doctorCardDetails: {
        backgroundColor: Colors.boxBackground,
        padding: 12,
        width: "100%",
        borderRadius: 14,
        flexDirection: "row"
    },
    doctorImageContainer: {
        width: widthToDp(24),
    }
});

export default Favourites;