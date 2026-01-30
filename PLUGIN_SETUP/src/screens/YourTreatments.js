import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, Text, Pressable, Modal, FlatList, StyleSheet, ToastAndroid, TextInput } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import FooterComponent from '../components/Footer';
import Colors from '../utils/Colors';
import VectorIcons from '../components/VectorIcons';
import CommonButton from '../components/CommonButton';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import WarningModal from '../components/WarningModal';
import { scale } from 'react-native-size-matters';
import FieldLabel from '../components/FieldLabel';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Confirmation from '../components/Confirmation';
import ToastMessage from '../components/ToastMessage';

const YourTreatments = ({ route }) => {
    const navigation = useNavigation();
    const [selectedID, setSelectedID] = useState(0);
    const [showSelectTreatmentModal, setShowSelectTreatmentModal] = useState(false);
    const [treatmentsData, setTreatmentData] = useState([]);
    const [showChangeStageModal, setShowChangeStageModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState('Chemotherapy');
    const [changeStageConfrimation, setChangeStageConfrimation] = useState(false);
    const [loading, setLoading] = useState(false);
    const prevData = route.params.diseaseData;
    let [stage, setStage] = useState(prevData?.stage)
    const [treatmentNames, setTreatmentNames] = useState({});
    let [refreshing, setRefreshing] = useState(false);
    const [changeStage, setChangeStage] = useState(stage);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [stageActive, setStageActive] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessageText, setToastMessageText] = useState("");

    let diseaseName;

    if (prevData) {
        diseaseName = prevData.name;
    }

    const reorderTreatments = (treatmentName) => {
        const sortedData = treatmentsData.slice(); // Create a shallow copy of the array
        const selectedTreatmentIndex = sortedData.findIndex(item => item.name === treatmentName);

        if (selectedTreatmentIndex !== -1) {
            const selectedTreatmentItem = sortedData.splice(selectedTreatmentIndex, 1)[0];
            sortedData.unshift(selectedTreatmentItem); // Add selected treatment at the beginning
        }

        return sortedData;
    };

    const sortedTreatmentsData = reorderTreatments(selectedTreatment);

    const ToastMessagerFunction = (msg) => {
        if (Global.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            handleShowAlert(msg);
        }
    }

    const handleShowAlert = (msg) => {
        setToastVisible(true);
        setToastMessageText(msg);
        setTimeout(() => {
            setToastVisible(false);
        }, 1500);
    };

    const createTreatmentCycle = async (data) => {
        const typeName = treatmentNames[data.id]?.trim();
        const matchingObject = treatmentsData.find(item => item.id === data.id);
        try {
            const newCycleId = matchingObject.cycles.length + 1;
            const body = {
                "userId": Global.userID,
                "diseaseId": Global.diseaseID,
                "treatmentTypeId": matchingObject.id.toString(),
                "cycle": data.createCycle == "Yes" ? newCycleId.toString() : typeName,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            await apiCall('treatment/createtreatmentcycle', body);
            getTreatmentCycleList();
            setRefreshing(true);
            setLoading(false);
            if (Global.OS == "ios") {
                setShowSelectTreatmentModal(true);
            }
            setTreatmentNames(prev => ({ ...prev, [data.id]: "" }));
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }
    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }

    let stageButton = (item) => {
        const isCurrentStage = item.item == changeStage;
        const isActiveStage = item.item > stage;
        const textColor = isCurrentStage ? Colors.boxBackground : (isActiveStage ? Colors.primaryTextColor : Colors.primaryinactive);
        return (
            <Pressable
                disabled={item.item <= stage}
                onPress={() => {
                    if (item.item < stage) {
                        console.log("You cannot select previous Stage");
                    } else {
                        if (item.item > stage) {
                            setChangeStage(item.item);
                        }
                    }
                }}
                style={({ pressed }) => ([styles.optionBox, {
                    opacity: pressed ? 0.4 : 1,
                    backgroundColor: (item.item == changeStage) ? Colors.primaryButtonColor : Colors.boxBackground
                }])}>
                <Text style={[{ fontSize: scale(16), color: textColor }, Fonts.Nunito_600SemiBold]}>{item.item}</Text>
            </Pressable>
        )
    }

    let treatmentCard = (item, index) => {
        return (
            <Pressable key={index}
                onPress={() => {
                    setTreatmentNames({});
                    setSelectedTreatment(item.name);
                    reorderTreatments(item.name);
                    if ((item.name == 'Palliative Care') && (item.cycles.length !== 0)) {
                        const palliativeCareTreatment = treatmentsData.find(item1 => item1.name === "Palliative Care");
                        const idExtract = palliativeCareTreatment?.cycles[0]?.id;
                        const typeExtract = palliativeCareTreatment?.cycles[0]?.name;
                        Global.selectedCycle = idExtract;
                        Global.selectedDiseaseName = diseaseName;
                        Global.selectedTreatmentType = typeExtract;
                        navigation.navigate("TreatmentData", { selectedTab: "vitals", fromCareCircle: route?.params?.fromCareCircle ? true : false, personData: route?.params?.personData });
                    } else {
                        const defaultId = sortedTreatmentsData.find(item2 => item2.name === item.name)
                        if (defaultId.cycles.length != 0) {
                            Global.selectedTreatmentType = defaultId.name;
                            setSelectedID(defaultId.cycles[0].id);
                        }
                        setShowSelectTreatmentModal(true);

                    }
                }}
                style={({ pressed }) => ([styles.treatmentButton, GlobalStyles.inputBoxShadow, {
                    backgroundColor: pressed ? Colors.primaryinactive : Colors.defaultBackground,
                    marginBottom: treatmentsData.length == index + 1 ? heightToDp(8) : heightToDp(2)
                }])}>
                <VectorIcons groupName={item.iconGroup} iconName={item.iconName} iconstyle={{ color: Colors.primaryButtonColor }} iconsize={scale(22)} />
                <Text style={[GlobalStyles.largeText, styles.treatmentType, Fonts.Nunito_700Bold]}>
                    {item.name}
                </Text>
            </Pressable>
        )
    }

    const renderButton = (item, text) => (
        <Pressable
            onPress={async () => { await AddCycle(item); }}
            style={({ pressed }) => ([styles.button, { backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground }])}
        >
            <Text style={[styles.createText, Fonts.Nunito_600SemiBold]}>{text}</Text>
            <VectorIcons groupName='AntDesign' iconName='pluscircle' iconstyle={{ color: Colors.secondarybuttonColor }} iconsize={scale(20)} />
        </Pressable>
    );

    const renderInput = (item) => (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TextInput
                autoCapitalize="none"
                keyboardType="default"
                placeholder="Enter treatment name"
                placeholderTextColor={Colors.placeholderTextColor}
                style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                value={treatmentNames[item.id]}
                onChangeText={text => { setTreatmentNames(prev => ({ ...prev, [item.id]: text })); }}
            />
            <Pressable
                onPress={async () => { await cycleValidation(item); }}
                style={[styles.AddingButton]}
            >
                <VectorIcons groupName='AntDesign' iconName='pluscircle' iconstyle={{ color: Colors.secondarybuttonColor }} iconsize={scale(34)} />
            </Pressable>
        </View>
    );

    const getBackgroundColor = (item, idSelected, pressed) => {
        if (item.id == idSelected) {
            return pressed ? 'rgba(69,99,355,0.5)' : Colors.primaryButtonColor;
        } else {
            return pressed ? Colors.primaryinactive : Colors.boxBackground;
        }
    };

    const renderCycleComponent = (item) => {
        if (item.name == 'Chemotherapy') {
            return renderButton(item, 'Create New Cycle');
        } else if (item.name == 'Radiation Therapy') {
            return renderButton(item, `Create New ${item.name}`);
        } else if (item.name == 'Palliative Care' && item.cycles.length == 0) {
            return renderButton(item, `Add ${item.name}`);
        } else if (item.createCycle == 'No') {
            return renderInput(item);
        } else if (item.singleCycle == 'No') {
            return renderButton(item, `Add new ${item.name}`);
        }
        return null;
    };

    let cycleCard = (item) => {
        return (
            <View style={styles.treatmentTypeContainer}>
                <View style={[styles.typeBox, { marginBottom: heightToDp(2) }]}>
                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                        {item.name}
                    </Text>
                    <View style={styles.underline} />
                </View>
                {renderCycleComponent(item)}
                <FlatList
                    data={item.cycles}
                    extraData={item.cycles}
                    keyExtractor={(itemKey, index) => itemKey.toString() + index}
                    refreshing={refreshing}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable key={index}
                                    onPress={() => {
                                        setSelectedID(item.id);
                                    }}
                                    style={({ pressed }) => ([styles.cycleButton, {
                                        backgroundColor: item.id == selectedID ? pressed ? 'rgba(69,99,355,0.5)' : Colors.primaryButtonColor : (pressed ? Colors.primaryinactive : Colors.boxBackground)
                                    }])}>
                                    <Text style={[styles.cycleText, { color: item.id == selectedID ? Colors.boxBackground : Colors.primaryinactive }, Fonts.Nunito_600SemiBold]}>
                                        {item.cycle}
                                    </Text>
                                    {
                                        item.id == selectedID ?
                                            <VectorIcons groupName='AntDesign' iconName='checkcircle' iconstyle={{ color: Colors.boxBackground }} iconsize={scale(20)} />
                                            :
                                            <VectorIcons groupName='MaterialIcons' iconName='inventory' iconsize={scale(20)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                    }
                                </Pressable>
                            </View>
                        )
                    }}
                />
            </View>

        )
    }

    const confrimChangeStage = (action, reason) => {
        if (action == 'Yes') {
            setChangeStageToGlobal();
            setChangeStageConfrimation(false);
        } else {
            setChangeStageConfrimation(false);
            setShowChangeStageModal(true);
        }
    }

    const treatmentNameRegex = /^[a-zA-Z0-9\s-]{3,150}$/;

    const cycleValidation = async (value) => {
        if (Global.OS == "ios") {
            setShowSelectTreatmentModal(false);
        }
        const typeName = treatmentNames[value.id]?.trim();
        const hasMatchingCycle = value.cycles.some(cycle => cycle.cycle === typeName);
        let checker;
        if (treatmentNames.hasOwnProperty(value.id)) {
            checker = true;
        } else {
            checker = false;
        }
        if (!checker || treatmentNames[value.id].trim() == "") {
            DisplayError("Please enter treatment name");
        } else if (!treatmentNameRegex.test(treatmentNames[value.id].trim())) {
            DisplayError("Please enter valid treatment name");
        } else if (hasMatchingCycle) {
            DisplayError(`${typeName} already exist. Please enter a different name.`);
        } else {
            await AddCycle(value);
        }
    }

    const AddCycle = async (data) => {
        if (!Global.clicked) {
            Global.clicked = true;
            if (Global.OS == "ios") {
                setShowSelectTreatmentModal(false);
            }
            await createTreatmentCycle(data);
            Global.clicked = false;
        }
    }

    let obj = [];
    let a = prevData?.maxStage;

    if (Global.DiseaseData.length === 0) {
        if (prevData?.maxStage) {
            for (let i = 1; i <= a; i++) {
                obj.push(i);
            }
        } else {
            obj = prevData?.stages;
        }
    } else {
        let matchingData = Global.DiseaseData.find((value) => value.name === diseaseName);
        if (matchingData && matchingData.stages) {
            obj = matchingData.stages;
        }
    }

    const setChangeStageToGlobal = () => {
        changetreatmentstage();
    };

    const backNavigation = () => {
        if (route.params?.fromCareCircle) {
            Global.fromCareCircle = false;
            navigation.navigate("PatientDashboard", { personData: route?.params?.personData });
        } else if (route.params.from === "Dashboard") {
            navigation.navigate("Dashboard", { diseaseData: route.params.diseaseData })
        }
        else {
            navigation.replace("MyTreatment", { refreshing: true });
        }
    }


    const getTreatmentCycleList = async () => {
        try {
            const body = {
                "diseaseId": Global.diseaseID == 0 ? prevData.id : Global.diseaseID,
                "type": prevData.type,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('treatment/gettreatmentcycleslist', body);
            setLoading(false);
            setTreatmentData(response.treatmentCycles);
            const defaultId = response.treatmentCycles.find(item2 => item2.name === selectedTreatment)
            if (defaultId?.cycles.length != 0) {
                Global.selectedTreatmentType = defaultId?.name;
                setSelectedID(defaultId?.cycles[0].id);
            }
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const changetreatmentstage = async () => {
        try {
            const body = {
                "diseaseId": Global.diseaseID,
                "stage": (changeStage).toString(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            await apiCall('treatment/changetreatmentstage', body);
            setStage(changeStage);
            setStageActive(true);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        setChangeStage(parseInt(stage) + 1);
        getTreatmentCycleList();
    }, []);

    const onSelectClick = () => {
        if (!selectedID) {
            setShowModal(true);
            setWarningText("Please select treatment cycle.");
        }
        else {
            setShowSelectTreatmentModal(false);
            Global.selectedCycle = selectedID;
            Global.selectedDiseaseName = diseaseName;
            navigation.replace("TreatmentData", { selectedTab: "vitals", personData: route?.params?.personData, fromCareCircle: route.params?.fromCareCircle ? true : false });
        }
    };

    const onChangeStage = () => {
        if (obj.length <= stage) {
            ToastMessagerFunction("Cannot change the stage, since you have reached the maximum limit.");
        } else {
            setShowChangeStageModal(true);
        }
    }

    useEffect(() => {
        setChangeStage(parseInt(stage) + 1);
        getTreatmentCycleList();
        setStageActive(false);
    }, [stageActive]);

    const iosModalHandler = () => {
        if (Global.OS == "ios") {
            setShowSelectTreatmentModal(true);
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="My Treatment"
                    onPress={() => { backNavigation() }}
                />
                <ScrollView>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <FieldLabel
                            text={diseaseName}
                            extraStyles={[Fonts.Nunito_600SemiBold, { fontSize: scale(35), color: Colors.primaryTextColor }]}
                        />
                        {prevData?.type == "Cancer" &&
                            <View style={styles.stageContainer}>
                                <View style={styles.stageBox}>
                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                                        Stage {stage}
                                    </Text>
                                </View>
                                <Pressable
                                    style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, {
                                        padding: widthToDp(2),
                                        marginLeft: widthToDp(2)
                                    }])}
                                    onPress={onChangeStage}>
                                    <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Change Stage</Text>
                                </Pressable>
                            </View>
                        }
                    </View>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <FieldLabel
                            text={"Your Treatments"}
                            extraStyles={{ marginHorizontal: widthToDp(2) }} />
                        <View style={GlobalStyles.fixedTopSpacing}>
                            {
                                treatmentsData?.map((item, index) => {
                                    return (
                                        treatmentCard(item, index)
                                    )
                                })

                            }
                        </View>
                    </View>
                </ScrollView>
            </View>
            <FooterComponent navigation={navigation} />
            <Modal transparent={true} visible={showChangeStageModal}>
                <View style={[styles.emailModalBtn]}>
                    <View style={[styles.emailModal, { width: '90%' }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={[GlobalStyles.largeText]}>Change Stage</Text>
                            <Pressable style={styles.closeButton} onPress={() => { setShowChangeStageModal(false); }}>
                                <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                            </Pressable>
                        </View>
                        <View style={styles.stageNo}>
                            <FlatList
                                data={obj}
                                keyExtractor={(item, index) => item.toString() + index}
                                refreshing={refreshing}
                                renderItem={stageButton}
                                numColumns={5}
                            />
                        </View>
                        <View style={styles.modalBottomBtnBox}>
                            <CommonButton extraStyles={[styles.modalBtn, Fonts.Nunito_600SemiBold]}
                                buttonText={"Continue"}
                                onPress={() => {
                                    setChangeStageConfrimation(true);
                                    setShowChangeStageModal(false);
                                }}>
                            </CommonButton>
                        </View>
                    </View>
                </View>
            </Modal>
            <Confirmation
                confrimation={true}
                modalHeading={"Confirmation"}
                modalText={`Are you sure you want to change the stage ?`}
                transparent={true}
                visible={changeStageConfrimation}
                action={(text, reason) => { confrimChangeStage(text, reason) }}
            />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal onPress={iosModalHandler} showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Modal transparent={true} animationType={'slide'} visible={showSelectTreatmentModal}>
                <View style={styles.modalContainer}>
                    <View style={{ height: '30%' }} />
                    <View style={styles.treatmentContainer}>
                        <View style={styles.selectTreatmentbox}>
                            <Text style={[styles.selectText, Fonts.Nunito_700Bold]}>Select Treatment</Text>
                            <Pressable
                                hitSlop={20}
                                onPress={() => setShowSelectTreatmentModal(false)}
                                style={({ pressed }) => ([styles.closeButton, { opacity: pressed ? 0.5 : 1 }])}>
                                <VectorIcons groupName="Ionicons" iconName="close" iconsize={scale(18)} iconstyle={{ color: Colors.placeholderTextColor }} />
                            </Pressable>
                        </View>
                        <View style={styles.cycleContainer}>
                            <FlatList
                                data={sortedTreatmentsData}
                                refreshing={refreshing}
                                keyExtractor={(item, index) => item.toString() + index}
                                renderItem={({ item }) => {
                                    if (selectedTreatment == item.name || item.cycles.length > 0) {
                                        return (
                                            cycleCard(item)
                                        )
                                    }
                                }}
                            />
                        </View>
                        <View style={[GlobalStyles.rowCenter, styles.buttonContainer]}>
                            <CommonButton
                                onPress={onSelectClick}
                                buttonText="Continue"
                                extraStyles={{ marginBottom: heightToDp(3), flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <ToastMessage visible={toastVisible} text={toastMessageText} />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    emailModal: {
        backgroundColor: Colors.defaultBackground,
        padding: widthToDp(4),
        shadowColor: Colors.primaryTextColor,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.41,
        shadowRadius: 9.11,
        elevation: 14,
        borderRadius: 14,
        height: "auto"
    },
    emailModalBtn: {
        flex: 1,
        backgroundColor: "rgba(52,52,52,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    stageNo: {
        marginBottom: heightToDp(4),
    },
    modalBottomBtnBox: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
    },
    modalBtn: {
        width: "100%",
        height: heightToDp(6),
        paddingHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
    stageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: heightToDp(2),
    },
    stageBox: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        padding: widthToDp(2),
    },
    treatmentButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: widthToDp(6),
        paddingVertical: heightToDp(2),
        borderRadius: 14,
    },
    treatmentType: {
        marginLeft: widthToDp(4),
    },
    underline: {
        height: 1,
        flex: 1,
        borderWidth: 0.5,
        marginLeft: widthToDp(4),
        borderColor: Colors.placeholderTextColor,
        backgroundColor: Colors.placeholderTextColor
    },
    modalContainer: {
        backgroundColor: Colors.modalBackground,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    treatmentContainer: {
        backgroundColor: Colors.defaultBackground,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        height: '70%',
        paddingHorizontal: widthToDp(4),
        paddingTop: heightToDp(2),
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    selectTreatmentbox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    selectText: {
        fontSize: scale(22),
        color: Colors.primaryTextColor,
    },
    closeButton: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 50,
        padding: widthToDp(2),
        justifyContent: "center",
        alignItems: "center"
    },
    cycleContainer: {
        flex: 1,
        width: '100%',
        marginTop: heightToDp(2),
    },
    treatmentTypeContainer: {
        width: "100%"
    },
    typeBox: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    cycleButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 14,
        width: '100%',
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(2),
        marginBottom: heightToDp(2),
    },
    cycleText: {
        fontSize: scale(16),
        flex: 1,
    },
    button: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: widthToDp(4),
        borderRadius: 14,
        marginBottom: heightToDp(2),
    },
    createText: {
        color: Colors.secondarybuttonColor,
        fontSize: scale(16),
        width: '95%',
    },
    buttonContainer: {
        width: '100%',
    },
    optionBox: {
        borderRadius: 14,
        width: 96 / 6 + "%",
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: heightToDp(2),
        marginRight: widthToDp(4),
        marginVertical: heightToDp(2)
    },
    inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        width: '83%',
        alignSelf: 'center',
        padding: widthToDp(4),
        textAlignVertical: 'top',
        marginBottom: heightToDp(1)
    },
    AddingButton: {
        width: "15%",
        alignSelf: "center",
        alignItems: "center",
        paddingVertical: widthToDp(1),
        marginBottom: heightToDp(1),
        padding: widthToDp(2)
    }
})

export default YourTreatments;
