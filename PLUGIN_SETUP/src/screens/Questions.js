import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, Dimensions, FlatList } from 'react-native'
import GlobalStyles from '../utils/GlobalStyles'
import { widthToDp, heightToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import CommonButton from '../components/CommonButton';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import RadioButton from '../components/RadioButton';
import { scale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';
import questionList from '../assets/mdm/questionList.json';

const windowHeight = Dimensions.get('window').height;
const Questions = () => {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [quationList, setQuationList] = useState(questionList);
    function checkAllAccepted() {
        const checked = quationList.every((question) => question.isAccepted !== false);
        if (checked) {
            return navigation.navigate("Dashboard");
        } else {
            setShowModal(true);
        }
    }
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <Header headerTitle="Questions"
                onPress={() => { navigation.navigate("Dashboard"); }}
                extraStyles={{
                    marginHorizontal: widthToDp(4)
                }}
                headerTitleStyles={{ marginLeft: 5 }} />
            <ScrollView contentContainerStyle={{ flexGrow: windowHeight - 100 }} nestedScrollEnabled={true}>
                <View style={styles.searchContainer}>
                    <FlatList
                        data={quationList}
                        renderItem={({ item, index }) => {
                            return (
                                <View style={styles.quationsContainer} key={item.id}>
                                    <View style={styles.quations}>
                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>{item.quation}</Text>
                                    </View>
                                    <View style={styles.optioncontainer}>
                                        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.4 : 1 }, styles.optionBox]}
                                            onPress={() => {
                                                const newArray = quationList.map((value, i) => { return index == i ? ({ ...value, isAccepted: "Yes" }) : value; });
                                                setQuationList(newArray);
                                            }}>
                                            <View style={{ flexDirection: 'column', alignItems: 'center', width: '48%' }}>
                                                <Text style={[Fonts.Nunito_600SemiBold, {
                                                    color: item.isAccepted == "Yes" ? Colors.primaryButtonColor : Colors.primaryTextColor,
                                                    fontSize: scale(16)
                                                }]}>
                                                    Yes
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'column', alignItems: 'center', width: '52%' }}>
                                                {item.isAccepted == "Yes" ? (
                                                    <RadioButton selected={true} backgroundColor={Colors.primaryButtonColor} />
                                                ) : (
                                                    <RadioButton selected={false} />
                                                )}
                                            </View>
                                        </Pressable>
                                        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.4 : 1 }, styles.optionBox]}
                                            onPress={() => {
                                                const newArray = quationList.map((value, i) => { return index == i ? ({ ...value, isAccepted: "No" }) : value; });
                                                setQuationList(newArray);
                                            }}>
                                            <View style={{ flexDirection: 'column', alignItems: 'center', width: '48%' }}>
                                                <Text
                                                    style={[
                                                        {
                                                            color: item.isAccepted == "No" ? Colors.primaryButtonColor : Colors.primaryTextColor,
                                                            fontSize: scale(16)
                                                        },
                                                        Fonts.Nunito_600SemiBold
                                                    ]}>
                                                    No
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'column', alignItems: 'center', width: '52%' }}>
                                                {item.isAccepted == "No" ? (
                                                    <RadioButton selected={true} backgroundColor={Colors.primaryButtonColor} />
                                                ) : (
                                                    <RadioButton selected={false} />
                                                )}
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            )
                        }}
                    />
                    < CommonButton
                        buttonText="Continue"
                        visible=' true'
                        onPress={() => { checkAllAccepted(); }}
                        extraStyles={{ marginTop: heightToDp(1), marginBottom: heightToDp(2) }} />
                </View>
            </ScrollView>
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={"Please Select all the field"} />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    searchContainer: {
        flex: 1,
        marginHorizontal: widthToDp(1),
        width: "90%",
        alignSelf: "center"
    },
    mainContainer: {
        alignItems: 'center',
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(2),
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginTop: heightToDp(2)
    },
    optioncontainer: {
        width: '50%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quationsContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        marginTop: heightToDp(2),
    },
    quations: {
        width: "50%",
    },
    optionBox: {
        width: '46.5%',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        paddingVertical: heightToDp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: widthToDp(2)
    }
});
export default Questions;