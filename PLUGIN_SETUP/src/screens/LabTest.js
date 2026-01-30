import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, StyleSheet, Keyboard, FlatList } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Header from '../components/Header';
import VoiceSearch from '../components/VoiceSearch';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Global from './Global';

const LabTest = ({ route }) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)
    const [filteredTestType, setFilteredTestType] = useState([]);
    const [searchData, setSearchData] = useState('');
    const [filteredVoiceSearchDocsData, setFilteredVoiceSearchDocsData] = useState(filteredTestType);
    let [displayBottomButton, setDisplayBottomButton] = useState(true);

    useEffect(() => {
        GetTestTypeList();
    }, [])

    const GetTestTypeList = async () => {
        try {
            const body = {
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('appointments/gettesttypelist', body, true);
            setFilteredTestType(response.testType)
            Global.VoiceSearchedData = response.testType;
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

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

    const setFilteredData = (TestType) => {
        setFilteredVoiceSearchDocsData(TestType);
    }

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer]}>
            <View style={GlobalStyles.mainBox}>
                <Header headerTitle="Lab Test"
                    onPress={() => { navigation.navigate("CreateAppointment") }} />
                <VoiceSearch
                    placeholderText={"Search by Test Name"} extraStyles={{ fontSize: scale(16) }}
                    functionPropNameHere={(data) => {
                        setFilteredData(data);
                        if (data.length == filteredTestType.length) {
                            setSearchData("");
                        } else {
                            setSearchData(data);
                        }
                    }}
                    mainContext={this}
                    isMicOutline={false}
                    isMicNeeded={true}
                />
                <View style={{ marginTop: heightToDp(4) }}>
                    <FlatList
                        keyExtractor={(item, index) => "key" + index}
                        data={searchData == "" ? filteredTestType : filteredVoiceSearchDocsData}
                        renderItem={({ item, index }) => {
                            return (
                                <View style={{ marginTop: heightToDp(2) }}>
                                    <Pressable
                                        onPress={() => { navigation.navigate('LabTestSubcatagory', { TestTypeId: item.id, TestName: item.name }) }}
                                        style={({ pressed }) => [GlobalStyles.selectBox, styles.Button, { opacity: pressed ? 0.5 : 1, alignSelf: "center" }]}>
                                        <View style={[styles.diseaseContainer, { alignItems: "center" }]}>
                                            <View style={styles.BoxLeft}>
                                                <Text style={[GlobalStyles.largeText, Fonts.Nunito_600SemiBold, styles.diseaseText]}>{item.name}</Text>
                                            </View>
                                            <View style={styles.BoxRight}>
                                                <VectorIcons groupName="AntDesign" iconName="arrowright" iconstyle={styles.arrow} iconsize={widthToDp(8)} />
                                            </View>
                                        </View>
                                    </Pressable>
                                </View>
                            )
                        }}
                    />
                </View>
            </View>
            {displayBottomButton ?
                <Footer navigation={navigation} /> : null
            }
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </SafeAreaView>
    )
}
export default LabTest;

const styles = StyleSheet.create({
    Button: {
        backgroundColor: Colors.boxBackground,
        borderColor: Colors.textInputBorder,
        height: heightToDp(11),
    },
    diseaseContainer: {
        width: '100%',
        flexDirection: 'row'
    },
    BoxLeft: {
        width: '85%',
        flexDirection: 'column'
    },
    diseaseText: {
        lineHeight: heightToDp(5),
    },
    BoxRight: {
        width: '18%',
        flexDirection: 'column'
    },
    arrow: {
        color: Colors.primaryButtonColor,
        marginLeft: widthToDp(6),
    }
})