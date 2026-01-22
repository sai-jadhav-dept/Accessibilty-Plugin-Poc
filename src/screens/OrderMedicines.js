import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Keyboard, SafeAreaView } from 'react-native';
import Header from '../components/Header';
import FooterComponent from '../components/Footer';
import VoiceSearch from '../components/VoiceSearch';
import { widthToDp, heightToDp } from '../utils/Responsive';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import VectorIcons from '../components/VectorIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/core';
import { scale } from 'react-native-size-matters';

const data = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
    { label: 'Item 4', value: '4' },
    { label: 'Item 5', value: '5' },
    { label: 'Item 6', value: '6' },
    { label: 'Item 7', value: '7' },
    { label: 'Item 8', value: '8' },
];

const OrderMedicines = (props) => {
    const [medicine, setMedicine] = useState("");
    const navigation = useNavigation();

    const handleFilteredData = (filteredData) => {
        console.log(filteredData);
    }

    const onlinePharmacies = [
        {
            key: 0,
            id: 1,
            logo: require("../assets/images/apollo_pharmacy.png"),
            name: 'Apollo Pharmacy',
        },
        {
            key: 1,
            id: 2,
            logo: require("../assets/images/pharm_easy.png"),
            name: 'Pharm Easy',
        },
        {
            key: 2,
            id: 3,
            logo: require("../assets/images/practo.png"),
            name: 'Practo',
        },
        {
            key: 3,
            id: 4,
            logo: require("../assets/images/1mg.png"),
            name: '1mg',
        },
        {
            key: 4,
            id: 5,
            logo: require("../assets/images/medlife.png"),
            name: 'Medlife',
        },
        {
            key: 5,
            id: 6,
            logo: require("../assets/images/netmeds.png"),
            name: 'Netmeds',
        },
    ];
    let [displayBottomButton, setDisplayBottomButton] = useState(true);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (() => {
            setDisplayBottomButton(false);
        }));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, []);

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Order Medicines"
                    onPress={() => props.navigation.goBack()}
                />
                <ScrollView>
                    <View style={[{ borderBottomWidth: 1, borderBottomColor: Colors.textInputBorder }]}>
                        <View style={GlobalStyles.columnFlexstart}>
                            <View style={[GlobalStyles.columnFlexstart, { marginTop: heightToDp(2) }]}>
                                <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.inputContainer, GlobalStyles.inputBoxShadow])}>
                                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor }]}
                                        selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        itemTextStyle={[GlobalStyles.mediumText]}
                                        data={data}
                                        placeholder={"Select Prescription"}
                                        autoScroll={false}
                                        maxHeight={300}
                                        value={medicine}
                                        labelField="label"
                                        valueField="label"
                                        onChange={item => { setMedicine(item.label) }} />
                                </Pressable>
                                <View style={[GlobalStyles.rowFlexstart, { width: '100%', marginTop: heightToDp(2) }]}>
                                    <View style={[{
                                        borderBottomColor: Colors.textInputBorder,
                                        borderBottomWidth: 1,
                                        flex: 1,
                                        marginRight: widthToDp(4)
                                    }]} />
                                    <Text style={[
                                        Fonts.Nunito_600SemiBold, {
                                            color: Colors.primaryinactive,
                                            fontSize: scale(16)
                                        }]}>
                                        OR
                                    </Text>
                                    <View style={[{
                                        borderBottomColor: Colors.textInputBorder,
                                        borderBottomWidth: 1,
                                        flex: 1,
                                        marginLeft: widthToDp(4)
                                    }]} />
                                </View>
                                <VoiceSearch
                                    placeholderText="Search Medicine"
                                    extraStyles={GlobalStyles.fixedTopSpacing}
                                    functionPropNameHere={handleFilteredData}
                                />
                            </View>
                            <View style={[GlobalStyles.rowSpaceBetween, { width: '100%', marginTop: heightToDp(8) }]}>
                                <View style={[{
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start'
                                }]}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>
                                        Nelarabine
                                    </Text>
                                    <Text style={[GlobalStyles.extrasmallText, { marginTop: heightToDp(1) }, Fonts.Nunito_600SemiBold]}>
                                        1500 mg/m2 IV
                                    </Text>
                                </View>
                                <Pressable
                                    style={({ pressed }) => ([styles.topButton, GlobalStyles.rowFlexstart, {
                                        opacity: pressed ? 0.5 : 1,
                                        backgroundColor: Colors.boxBackground,
                                        borderRadius: 14
                                    }])}
                                    onPress={() => {
                                        navigation.navigate("MedicationDetails", { item: props.route.params.item })
                                    }}>
                                    <VectorIcons groupName='Feather' iconName='info' iconsize={widthToDp(4)} iconstyle={{ color: Colors.primaryButtonColor }} />
                                    <Text style={[GlobalStyles.buttonnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                        Details
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    <View style={[GlobalStyles.columnFlexstart, {
                        width: '100%',
                        paddingHorizontal: widthToDp(4),
                        marginTop: heightToDp(2)
                    }]}>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>
                            Order from
                        </Text>
                        <View style={[{
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '100%',
                            marginTop: heightToDp(2)
                        }]}>
                            {
                                onlinePharmacies.map((item, index) =>
                                    <View key={index}>
                                        {
                                            index % 2 == 0 ?
                                                <View style={[GlobalStyles.rowSpaceAround, {
                                                    width: '100%',
                                                    marginTop: heightToDp(1),
                                                    marginBottom: index == onlinePharmacies.length - 2 ? heightToDp(6) : heightToDp(3)
                                                }]}>
                                                    <Pressable style={({ pressed }) => ([GlobalStyles.inputBoxShadow, {
                                                        opacity: pressed ? 0.8 : 1,
                                                        backgroundColor: Colors.defaultBackground,
                                                        paddingVertical: heightToDp(2),
                                                        paddingHorizontal: widthToDp(6),
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: 14
                                                    }])}>
                                                        <Image
                                                            resizeMode='contain'
                                                            source={item.logo}
                                                            style={[{ width: widthToDp(20), height: heightToDp(9) }]}
                                                        />
                                                    </Pressable>
                                                    <Pressable style={[GlobalStyles.inputBoxShadow, {
                                                        backgroundColor: Colors.defaultBackground,
                                                        paddingVertical: heightToDp(2),
                                                        paddingHorizontal: widthToDp(6),
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: 14
                                                    }]}>
                                                        <Image
                                                            resizeMode='contain'
                                                            source={onlinePharmacies[index + 1].logo}
                                                            style={[{ width: widthToDp(20), height: heightToDp(9) }]}
                                                        />
                                                    </Pressable>
                                                </View>
                                                :
                                                null
                                        }
                                    </View>
                                )
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>
            {displayBottomButton ?
                <FooterComponent navigation={props.navigation} /> : null}
        </SafeAreaView>
    );

}

export default OrderMedicines;

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: heightToDp(2),
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(2),
        borderRadius: 14,
    },
    dropdown: {
        height: 30,
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: 8,
        width: '100%',
        backgroundColor: Colors.boxBackground,
        color: Colors.primaryTextColor,
    },
    topButton: {
        paddingVertical: heightToDp(2),
        paddingHorizontal: widthToDp(4),
        borderRadius: 14,
    }
});