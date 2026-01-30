import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import FooterComponent from '../components/Footer';
import CommonButton from '../components/CommonButton';
import ListText from '../components/ListText';
import VectorIcons from '../components/VectorIcons';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

const MedicationDetails = (props) => {
    const navigation = useNavigation();
    const medicineDetails = props.route.params.item;
    const [quantity, setQuantity] = useState(medicineDetails.numberOfPills)
    const [isGeneralSelected, setIsGeneralSelected] = useState(true);
    const takeMedicineTimings = [
        {
            time: '08:00 AM',
            timeOfDay: 'Forenoon',
        },
        {
            time: 'Nil',
            timeOfDay: 'Afternoon',
        },
        {
            time: 'Nil',
            timeOfDay: 'Night',
        },
    ];
    const medicineInfoData = {
        tellYourDoctor: [
            "extreme drowsiness;",
            "loss of balancing or coordination;",
            "problems with walking;",
            "numbness or tingly feeling in your hands or feet;",
            "problems with buttoning clothes or picking up small items with your fingers;",
            "a seizure; or",
            "weakness or loss of movement in any part of your body.",
        ],
        alsoTellYourDoctor: [
            "unexplained muscle pain, tenderness, or weakness;",
            "low blood cell counts--fever, chills, tiredness, mouth sores, skin sores, easy bruising, unusual bleeding, pale skin, cold hands and feet, feeling light-headed or short of breath; or",
            "signs of tumor cell breakdown--tiredness, weakness, muscle cramps, nausea, vomiting, diarrhea, fast or slow heart rate, tingling in your hands and feet or around your mouth.",
        ],
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={[GlobalStyles.inputBoxShadow]}>
                <Header
                    headerTitle="Medication Details"
                    onPress={() => props.navigation.goBack()}
                    extraStyles={[{
                        paddingHorizontal: widthToDp(4),
                        backgroundColor: Colors.boxBackground
                    }]}
                    threeDotsActive={true}
                    threeDotstyle={{ marginRight: widthToDp(4) }} />
                <View style={[{
                    paddingHorizontal: widthToDp(6),
                    backgroundColor: Colors.boxBackground,
                    paddingTop: heightToDp(2)
                }]}>
                    <Text style={[GlobalStyles.largeText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                        {medicineDetails.name}
                    </Text>
                    <Text style={[GlobalStyles.extrasmallText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_600SemiBold]}>
                        {medicineDetails.dose}
                    </Text>
                    <View style={GlobalStyles.rowFlexstart}>
                        <VectorIcons groupName='MaterialCommunityIcons' iconName='pill' iconsize={widthToDp(4)} iconstyle={[{ color: Colors.primaryButtonColor }]} />
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                            {medicineDetails.numberOfPills} Pills left
                        </Text>
                    </View>
                </View>
                <View style={[GlobalStyles.rowFlexstart, {
                    width: '100%',
                    paddingTop: heightToDp(2),
                    backgroundColor: Colors.boxBackground
                }]}>
                    <Pressable
                        style={({ pressed }) => ([{
                            opacity: pressed ? 0.5 : 1,
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottomWidth: 2,
                            borderBottomColor: isGeneralSelected ? Colors.primaryButtonColor : Colors.boxBackground,
                            paddingVertical: heightToDp(2)
                        }])}
                        onPress={() => setIsGeneralSelected(true)}
                    >
                        <Text style={[Fonts.Nunito_600SemiBold, {
                            color: isGeneralSelected ? Colors.primaryButtonColor : Colors.primaryinactive,
                            fontSize: scale(16)
                        }]}>
                            GENERAL
                        </Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => ([{
                            opacity: pressed ? 0.5 : 1,
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottomWidth: 2,
                            borderBottomColor: isGeneralSelected ? Colors.boxBackground : Colors.primaryButtonColor,
                            paddingVertical: heightToDp(2)
                        }])}
                        onPress={() => setIsGeneralSelected(false)}
                    >
                        <Text style={[Fonts.Nunito_600SemiBold, {
                            color: isGeneralSelected ? Colors.primaryinactive : Colors.primaryButtonColor,
                            fontSize: scale(16)
                        }]}>
                            INFORMATION
                        </Text>
                    </Pressable>
                </View>
            </View>
            <View style={[GlobalStyles.mainBox, GlobalStyles.fixedTopSpacing]}>
                {
                    isGeneralSelected ?
                        <ScrollView>
                            <View style={[{
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                paddingHorizontal: widthToDp(4)
                            }]}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Dosage</Text>
                                <View style={[{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginTop: heightToDp(2)
                                }]}>
                                    {
                                        takeMedicineTimings.map((item, itemindex) =>
                                            <Pressable key={itemindex}
                                                style={({ pressed }) => ([GlobalStyles.columnCenter, {
                                                    opacity: pressed ? 0.5 : 1,
                                                    backgroundColor: Colors.boxBackground,
                                                    borderRadius: 14,
                                                    width: '30%',
                                                    paddingVertical: heightToDp(2)
                                                }])}>
                                                <Text style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                    {item.time}
                                                </Text>
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                                    {item.timeOfDay}
                                                </Text>
                                            </Pressable>
                                        )
                                    }
                                </View>
                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, GlobalStyles.fixedTopSpacing]}>Duration</Text>
                                <View style={[GlobalStyles.rowFlexstart, { width: '100%', marginTop: heightToDp(2) }]}>
                                    <Pressable style={({ pressed }) => ([GlobalStyles.rowSpaceBetween, {
                                        opacity: pressed ? 0.5 : 1,
                                        flex: 1,
                                        backgroundColor: Colors.boxBackground,
                                        borderRadius: 14,
                                        paddingVertical: heightToDp(2),
                                        paddingHorizontal: widthToDp(4)
                                    }])}>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{medicineDetails.numberOfDays}</Text>
                                        <VectorIcons groupName='AntDesign' iconName='down' iconsize={widthToDp(4)} iconstyle={[{ color: Colors.placeholderTextColor }]} />
                                    </Pressable>
                                    <Pressable style={({ pressed }) => ([GlobalStyles.rowFlexstart, { opacity: pressed ? 0.5 : 1, marginLeft: widthToDp(4) }])}>
                                        <VectorIcons groupName='Ionicons' iconName='pencil-sharp' size={widthToDp(4)} style={[{ color: Colors.primaryButtonColor }]} />
                                        <Text style={[GlobalStyles.buttonnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                            Edit
                                        </Text>
                                    </Pressable>
                                </View>
                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, GlobalStyles.fixedTopSpacing]}>Quantity</Text>
                                <View style={[GlobalStyles.rowFlexstart, { width: '100%', marginTop: heightToDp(2) }]}>
                                    <TextInput
                                        keyboardType='numeric'
                                        placeholder='30 Pills'
                                        placeholderTextColor={Colors.placeholderTextColor}
                                        value={quantity}
                                        onChangeText={(text) => { setQuantity(text); }}
                                        style={[GlobalStyles.mediumText, {
                                            flex: 1,
                                            backgroundColor: Colors.boxBackground,
                                            borderRadius: 14,
                                            paddingHorizontal: widthToDp(4),
                                            paddingVertical: heightToDp(2)
                                        },
                                        Fonts.Nunito_600SemiBold
                                        ]} />
                                    <Pressable style={({ pressed }) => ([GlobalStyles.rowFlexstart, { opacity: pressed ? 0.5 : 1, marginLeft: widthToDp(4) }])}>
                                        <VectorIcons groupName='Ionicons' iconName='pencil-sharp' size={widthToDp(4)} style={{ color: Colors.primaryButtonColor }} />
                                        <Text style={[GlobalStyles.buttonnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                            Edit
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                            <CommonButton
                                buttonText="Order Now"
                                visible={true}
                                onPress={() => { navigation.navigate("OrderMedicines", { item: props.route.params.item }); }}
                                extraStyles={{
                                    marginTop: heightToDp(2),
                                    marginBottom: heightToDp(6)
                                }}
                            />
                        </ScrollView>
                        :
                        <ScrollView>
                            <View style={[{
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                marginHorizontal: widthToDp(4)
                            }]}>
                                <Text style={[GlobalStyles.extrasmallText, GlobalStyles.fixedBottomSpacing, Fonts.Nunito_400Regular]}>
                                    Get emergency medical help if you have signs of an allergic reaction: hives; difficulty breathing; swelling of your face, lips, tongue, or throat.
                                </Text>
                                <Text style={[GlobalStyles.extrasmallText, GlobalStyles.fixedBottomSpacing, Fonts.Nunito_600SemiBold]}>
                                    Nelarabine may cause serious side effects of the central nervous system. These symptoms may not go away even after you stop receiving nelarabine. Tell your doctor if you have:
                                </Text>
                                {
                                    medicineInfoData.tellYourDoctor.map((item, index) =>
                                        <ListText
                                            key={index}
                                            listItem={item}
                                            extraStyles={{ marginBottom: medicineInfoData.tellYourDoctor.length - 1 == index ? heightToDp(2) : heightToDp(0.5) }}
                                        />
                                    )
                                }
                                <Text style={[GlobalStyles.extrasmallText, GlobalStyles.fixedBottomSpacing, Fonts.Nunito_600SemiBold]}>
                                    Also call your doctor at once if you have:
                                </Text>
                                {
                                    medicineInfoData.alsoTellYourDoctor.map((item, index) =>
                                        <ListText
                                            key={index}
                                            listItem={item}
                                            extraStyles={{ marginBottom: medicineInfoData.alsoTellYourDoctor.length - 1 == index ? heightToDp(5) : heightToDp(0.5) }}
                                        />
                                    )
                                }
                            </View>
                        </ScrollView>
                }
            </View>
            <FooterComponent
                navigation={props.navigation}
            />
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({

})

export default MedicationDetails;