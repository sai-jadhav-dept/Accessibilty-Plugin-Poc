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
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import Global from './Global';

const LabTestSubcatagory = ({ route }) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [filteredsubCategory, setFilteredsubCategory] = useState([]);
    const [searchData, setSearchData] = useState('');
    let [displayBottomButton, setDisplayBottomButton] = useState(true);
    const subCategoryType = filteredsubCategory;
    let Type = Global.appointmentType;

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    useEffect(() => {
        GetTestSubCategoryList();
    }, [])

    const GetTestSubCategoryList = async () => {
        try {
            const body = {
                "testTypeId": route.params.TestTypeId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('appointments/gettestsubcategorylist', body);
            setFilteredsubCategory(response.subCategory)
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

    const setFilteredData = (filteredData) => {
        setFilteredsubCategory(filteredData);
    }

    const checkUpload = (id) => {
        if (id == 0) {
            navigation.navigate('ManualSelectDoctor', { TestName: route.params.TestName, Type: Global.appointmentType, TestTypeId: route?.params?.TestTypeId, subCategoryTypeData: subCategoryType })
        }
        else {
            navigation.navigate('Test', { TestName: route.params.TestName, Type: Global.appointmentType, TestTypeId: route?.params?.TestTypeId, subCategoryTypeData: subCategoryType })
        }

    }
    return (
        <SafeAreaView style={[GlobalStyles.mainContainer]}>
            <View style={GlobalStyles.mainBox}>
                <Header headerTitle="Sub-Catagories"
                    onPress={() => { navigation.navigate("LabTest"); }} />
                <VoiceSearch
                    placeholderText="Search By Test Name"
                    extraStyles={[{
                        alignSelf: "center",
                        marginTop: heightToDp(4)
                    }]}
                    functionPropNameHere={(data) => {
                        setFilteredData(data);
                        if (data.length == subCategoryType.length) {
                            setSearchData("");
                        } else {
                            setSearchData(data);
                        }
                    }}
                    mainContext={this}
                    data={subCategoryType}
                    isMicOutline={false}
                    isFilterNeed={true}
                    Type={Type}
                />
                <View style={{ marginTop: heightToDp(4) }}>
                    <FlatList
                        keyExtractor={(item, index) => "key" + index}
                        data={searchData == "" ? filteredsubCategory : searchData}
                        renderItem={({ item, index }) => {
                            return (
                                <View style={{ marginTop: heightToDp(2) }}>
                                    <Pressable
                                        onPress={() => { checkUpload(item.prescriptionRequired) }}
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
            {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </SafeAreaView>
    )
}
export default LabTestSubcatagory;

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