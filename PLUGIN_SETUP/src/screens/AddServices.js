import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Modal, ScrollView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import Header from '../components/Header';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';
import FieldLabel from '../components/FieldLabel';
import { Dropdown } from 'react-native-element-dropdown';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Global from './Global';

const AddServices = () => {
    const navigation = useNavigation();
    const [selectedItem, setSelectedItem] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [activeData, setActiveData] = useState([]);
    const [carebuddyType, setCarebuddyType] = useState([]);
    const [activeRefreshing, setActiveRefreshing] = useState(false);
    const [nurseRelation, setNurseRelation] = useState([]);
    let [selectedRelation, setSelectedRelation] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [providerTypeId, setProviderTypeId] = useState(1);
    let [selectedServicesID, setSelectedServicesID] = useState([]);

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    useEffect(() => {
        providerTypeList();
    }, []);

    const providerTypeList = async () => {
        try {
            const body = {
                "userTypeId": Global.nurseSelecting.userTypeId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall('registration/getprovidertypelist', body, true);
            const nurseRelationData = response.providerType.map(item => ({
                "value": item.name,
                "id": item.id
            }));
            setNurseRelation(nurseRelationData);
            const carebuddyTypeData = response.providerType.map(item => ({
                [item.name]: item.services.map(service => ({
                    "id": service.id,
                    "name": service.name,
                    "active": false
                }))
            }));
            setCarebuddyType(carebuddyTypeData);
            setSelectedRelation(nurseRelationData[0].value);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const getservicedescription = async (item) => {
        if (!Global.clicked) {
            Global.clicked = true;
            try {
                const body = {
                    "id": item.id,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                const response = await apiCall("registration/getservicedescription", body);
                setLoading(false);
                setSelectedItem(response);
                setShowInfoModal(true);
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    }

    const WarningMessage = () => {
        setShowModal(true);
        DisplayError("Please Select Any One Health Care Service");
    }

    const getFilteredCarebuddyData = () => {
        if (carebuddyType && selectedRelation) {
            const selectedNurseTypeObj = carebuddyType.find((nurseTypeObj) => {
                const nurseType = Object.keys(nurseTypeObj)[0];
                return nurseType === selectedRelation;
            });
            return selectedNurseTypeObj ? selectedNurseTypeObj[selectedRelation] : [];
        }
        return [];
    }

    const updatedCarebuddyType = (item, index) => {
        setSelectedServicesID((prevSelectedServicesID) => {
            if (!prevSelectedServicesID.includes(item.id)) {
                prevSelectedServicesID.push(item.id);
            } else {
                return prevSelectedServicesID.filter(items => items !== item.id);
            }
            return prevSelectedServicesID;
        });
        setActiveData((prevData) => {
            if (item.active) {
                prevData = prevData.filter(items => items !== item.name);
            } else {
                prevData.push(item.name);
            }
            return prevData;
        })
        const indexFinding = carebuddyType.findIndex(values => values[selectedRelation])
        setCarebuddyType((prevdata) => {
            prevdata[indexFinding][selectedRelation][index].active = !prevdata[indexFinding][selectedRelation][index].active;
            return prevdata;
        });
    }

    const resetData = (value) => {
        const indexFinding = carebuddyType.findIndex(values => values[value])
        setCarebuddyType((prevdata) => {
            prevdata[indexFinding][value].forEach(element => {
                element.active = false;
            });
            return prevdata;
        })
    }

    const onContinueClicked = () => {
        Global.nurseSelecting.SelectedServices = activeData;
        Global.nurseSelecting.selectedServicesId = selectedServicesID;
        Global.nurseSelecting.Type = selectedRelation;
        activeData.length === 0 ?
            WarningMessage()
            :
            navigation.navigate("SelectCareBuddy", { providerTypeId: providerTypeId });
    }

    useEffect(() => {
        getFilteredCarebuddyData();
        setActiveRefreshing(false);
    }, [activeRefreshing])

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Back"
                    onPress={() => navigation.goBack()}
                />
                <ScrollView>
                    <View>
                        <View style={{ marginHorizontal: widthToDp(2) }}>
                            <FieldLabel text={"Select Nurse Type"} mandatory={true} />
                        </View>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                style={[styles.dropdown]}
                                placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                inputSearchStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                iconStyle={{ width: 20, height: 20 }}
                                itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                itemContainerStyle={{ paddingHorizontal: 5, margin: -5 }}
                                data={nurseRelation}
                                placeholder="Select Nurse Type*"
                                maxHeight={300}
                                labelField="value"
                                valueField="value"
                                value={selectedRelation}
                                onChange={item => {
                                    setProviderTypeId(item.id);
                                    setSelectedRelation(item.value);
                                    resetData(item.value);
                                    setActiveData([]);
                                }}
                            />
                        </View>
                        <View style={{ marginHorizontal: widthToDp(2) }}>
                            <FieldLabel text={"Select Services"} mandatory={true} />
                        </View>
                        <View style={{ width: "100%", flexDirection: "row", flexWrap: "wrap" }}>
                            {getFilteredCarebuddyData().map((item, index) => (
                                <View style={{ width: "50%" }} key={index}>
                                    <View style={styles.optionContainer}>
                                        <Pressable
                                            style={({ pressed }) => ([
                                                GlobalStyles.selectBox,
                                                GlobalStyles.inputBoxShadow,
                                                styles.option_Button,
                                                {
                                                    opacity: pressed ? 0.5 : 1,
                                                    backgroundColor: item.active ? Colors.primaryButtonColor : Colors.defaultBackground,
                                                    borderColor: item.active ? Colors.secondarybuttonColor : Colors.textInputBorder
                                                }
                                            ])}
                                            onPress={() => {
                                                updatedCarebuddyType(item, index)
                                                setActiveRefreshing(true);
                                            }}>
                                            {
                                                item.active &&
                                                <View style={styles.selectionContainer}>
                                                    <VectorIcons groupName='AntDesign' iconName='checkcircle' iconstyle={[{ color: Colors.defaultBackground, marginTop: widthToDp(4), marginRight: widthToDp(4) }]} />
                                                </View>
                                            }
                                            <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}
                                                onPress={async () => {
                                                    await getservicedescription(item);
                                                }}
                                            >
                                                <VectorIcons groupName='Feather' iconName='info' iconstyle={[{ color: item.active ? Colors.defaultBackground : Colors.primaryButtonColor, marginTop: heightToDp(2), marginRight: widthToDp(2) }]} />
                                            </Pressable>
                                            <Text numberOfLines={2} style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: item.active ? Colors.boxBackground : Colors.primaryTextColor, marginTop: heightToDp(1) }]}>{item.name}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <CommonButton
                            onPress={onContinueClicked}
                            visible={true}
                            buttonText={"Continue"}
                            extraStyles={[{ marginTop: heightToDp(2), marginBottom: heightToDp(5) }]}
                        />
                    </View>
                </ScrollView>
            </View>
            <Modal
                transparent={true}
                visible={showInfoModal}
            >
                <View style={{ backgroundColor: Colors.modalBackground, flex: 1 }}>
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => setShowInfoModal(false)}
                    />
                    {selectedItem && (
                        <View
                            style={{
                                backgroundColor: Colors.defaultBackground,
                                width: widthToDp(95),
                                maxHeight: heightToDp(60),
                                position: "absolute",
                                padding: widthToDp(7),
                                borderRadius: 14,
                                bottom: heightToDp(3),
                                alignSelf: "center",
                            }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    position: "relative",
                                    marginBottom: heightToDp(2),
                                }}>
                                <Text style={[Fonts.Nunito_700Bold, GlobalStyles.buttonnormalText,]}>
                                    {selectedItem.name}
                                </Text>
                                <Pressable
                                    style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                                    onPress={() => setShowInfoModal(false)}
                                >
                                    <VectorIcons
                                        groupName={"Ionicons"}
                                        iconName={"close"}
                                        iconsize={scale(25)}
                                        iconstyle={styles.closeBtn}
                                    />
                                </Pressable>
                            </View>
                            <ScrollView>
                                {selectedItem.includes && <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText]}>
                                    Includes :- {selectedItem.includes}
                                </Text>}
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText]}>
                                    {selectedItem.description}
                                </Text>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </Modal>
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

const styles = StyleSheet.create({
    optionContainer: {
        width: "90%",
        alignSelf: "center",
    },
    selectionContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    option_Button: {
        marginBottom: heightToDp(1),
        marginTop: heightToDp(2),
        height: heightToDp(15),
        padding: widthToDp(4)
    },
    dropdownContainer: {
        width: '95%',
        flexDirection: 'column',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        margin: 7,
        marginTop: heightToDp(2),
        marginBottom: heightToDp(0.2),
        paddingVertical: widthToDp(1)
    },
    dropdown: {
        height: heightToDp(7),
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: 10,
        color: Colors.placeholderTextColor,
    },
    closeBtn: {
        color: Colors.primaryTextColor,
        position: "absolute",
        right: -widthToDp(3),
        top: -heightToDp(1),
    }
});

export default AddServices;