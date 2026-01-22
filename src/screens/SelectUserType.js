import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView, Dimensions, BackHandler } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Header from '../components/Header';
import RadioButton from '../components/RadioButton';
import { widthToDp, heightToDp } from '../utils/Responsive';
import CommonButton from '../components/CommonButton';
const { height } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { ExecuteDBQuery } from '../utils/ExecuteDBQuery';

const SelectUserType = () => {
    const navigation = useNavigation();
    let [userType, setUserType] = useState("Patient");
    const [userTypes, setUserTypes] = useState([]);
    const expiry = 1000 * 60 * 60 * 24 * 7;
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        checkUserTypeMdmTable();
        return () => {
            backHandler.remove();
        }
    }, []);

    const successCallback = (txObj, resultSet, resolve, reject) => {
        resolve(true);
    };

    const failureCallback = (txObj, error, resolve, reject) => {
        console.log('Table insert Error : ', txObj.message);
        resolve(false);
    };

    const successFetchCallback = async (txObj, resultSet, resolve, reject) => {
        if (resultSet.rows.length > 0) {
            const currentTime = new Date().getTime();
            const expiryDate = Number(resultSet.rows.item(0).FetchedOn) + expiry;
            if (currentTime > expiryDate) {
                resolve(true);
            } else {
                resolve(false);
            }
        }
        resolve(true);
    }

    const isMdmExpired = async () => {
        await ExecuteDBQuery("SELECT * FROM DataFetchTimestamps WHERE MDMName = 'UserType'", successFetchCallback, failureCallback);
    }

    const successDataFetchCallback = async (txObj, resultSet, resolve, reject) => {
        if (resultSet.rows.length == 0) {
            console.log("No data found in local db, fetching from network");
            triggerGetUserTypeApi();
        } else {
            console.log("Data found in local db");
            const isDataExpired = await isMdmExpired();
            if (isDataExpired) {
                console.log("The data is expired, fetching from network");
                triggerGetUserTypeApi();
            } else {
                console.log("The data is not expired, rendering data from local db");
                const tempData = mapData(resultSet);
                setUserTypes(tempData);
                setLoading(false);
            }
        }
        resolve(true);
    }

    const getDataFromUserTypeTable = async () => {
        await ExecuteDBQuery('SELECT * FROM UserType', successDataFetchCallback, failureCallback);
    }

    const checkUserTypeMdmTable = async () => {
        try {
            await getDataFromUserTypeTable();
        } catch (error) {
            setLoading(false);
            console.log("UserType MDM local db reading error: " + error);
        }
    }

    const triggerGetUserTypeApi = async () => {
        try {
            const body = {
                "category": "HOPE",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            const response = await apiCall('registration/getusertype', body);
            console.log("Data fetched successfully");
            setLoading(false);
            const allUserTypes = response.userType.map(item => {
                if (item.name == 'Patient') {
                    item['desc'] = 'I am the ' + item.name;
                } else if (item.name == 'Caregiver') {
                    item['desc'] = 'I am ' + item.name + ' to the Patient';
                }
                return item;
            });
            setUserTypes(allUserTypes);
            await updateTimeStampsTable();
            await updateUserTypeTable();
            await fillUserTypeTable(allUserTypes);
        }
        catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
            apiFailFallback();
        }
    }

    const apiFailFallback = async () => {
        const res = await getDataFromUserTypeTable();
        const tempData = mapData(res);
        setUserTypes(tempData);
        setLoading(false);
    }

    const mapData = (res) => {
        let tempData = [];
        for (let i = 0; i < res.rows.length; i++) {
            tempData.push({
                key: i,
                name: res.rows.item(i).Name,
                desc: res.rows.item(i).Desc,
            });
        }
        return tempData;
    }

    const successDeleteCallback = (txObj, resultSet, resolve, reject) => {
        resolve(true);
    }

    const updateUserTypeTable = async () => {
        await ExecuteDBQuery('DELETE FROM UserType', successDeleteCallback, failureCallback);
    }

    const fillUserTypeTable = async (data) => {
        try {
            let values = '';
            data.forEach(item => {
                let temp = "('" + item.name + "','" + item.desc + "'),";
                values += temp;
            });
            values = values.slice(0, -1) + ";";
            await ExecuteDBQuery("INSERT INTO UserType (Name, Desc) VALUES " + values, successCallback, failureCallback);
        } catch (error) {
            console.log("Error while inserting UserType data into usertype table: " + error);
        }
    }

    const updateTimeStampsTable = async () => {
        await ExecuteDBQuery("INSERT OR REPLACE INTO DataFetchTimestamps (MDMName, FetchedOn) VALUES ('UserType'," + new Date().getTime() + ");", successCallback, failureCallback);
    }

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header headerTitle="Select"
                    onPress={() => {
                        Global.userType = '';
                        navigation.navigate("Login");
                    }} />
                <View style={[styles.selectBoxContainer]}>
                    <FlatList
                        style={{ width: '100%' }}
                        data={userTypes}
                        keyExtractor={(item, index) => 'key' + index}
                        renderItem={({ item }) =>
                            <View>
                                <Pressable
                                    style={({ pressed }) => ([GlobalStyles.selectBox,
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                        marginBottom: heightToDp(2),
                                        backgroundColor: item.name == userType ? Colors.primaryButtonColor : Colors.boxBackground,
                                        borderColor: item.name == userType ? Colors.secondarybuttonColor : null,
                                        marginTop: heightToDp(2)
                                    },
                                    ])}
                                    onPress={() => {
                                        Global.userType = item.name;
                                        setUserType(item.name);
                                    }}>
                                    {
                                        item.name == userType ?
                                            <View style={[{ position: 'absolute', top: widthToDp(3) }]}>
                                                <RadioButton selected={true} backgroundColor={Colors.secondarybuttonColor} />
                                            </View>
                                            :
                                            <View style={[{ position: 'absolute', top: widthToDp(3) }]}>
                                                <RadioButton selected={false} />
                                            </View>
                                    }
                                    <View style={{ marginBottom: widthToDp(2), width: "100%" }}>
                                        <Text style={[GlobalStyles.selectBoxText, Fonts.Nunito_700Bold, { color: item.name == userType ? Colors.defaultBackground : Colors.primaryTextColor }]}>{item.desc}</Text>
                                    </View>
                                </Pressable>
                            </View>
                        }
                    />
                </View>
                <CommonButton buttonText="Continue"
                    onPress={() => {
                        if (userTypes.length == 0) {
                            DisplayError("No Data Found");
                        } else {
                            Global.userType = userType;
                            navigation.navigate("MyDetails");
                        }
                    }}
                    extraStyles={GlobalStyles.fixbottomcommonButton}
                />
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create(
    {
        selectBoxContainer: {
            alignItems: 'center',
            marginTop: heightToDp(height > 540 ? 30 : 24),
        },
    }
)

export default SelectUserType;