import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ScrollView, Image, Pressable, Modal, SafeAreaView, Dimensions, Keyboard, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Header from '../components/Header';
import CommonButton from '../components/CommonButton';
import VoiceSearch from '../components/VoiceSearch';
import RadioButton from '../components/RadioButton';
import VectorIcons from '../components/VectorIcons';
import Global from './Global';
import WarningModal from '../components/WarningModal';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from 'react-native-size-matters';
import Loader from '../components/Loader';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';

const WIDTH = Dimensions.get('window').width;

export default function DiseaseSearch(props) {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [selectedStage, setSelectedStage] = useState(-1);
    const [selectedDisease, setSelectedDisease] = useState("");
    const [showQuickFactsModal, setShowQuickFactsModal] = useState(false);
    const [displayBottomButton, setDisplayBottomButton] = useState(true);
    const [diseaseData, setDiseaseData] = useState([]);
    const [searchData, setSearchData] = useState('');
    const [hasStages, setHasStages] = useState('');
    const [diseaseCard, setDiseaseCard] = useState(false);
    const [selectedDiseaseStages, setSelectedDiseaseStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [empty, setEmpty] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setDisplayBottomButton(false);
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    });

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    let stageButton = (item, diseaseName) => {
        return (
            item.item || item.item == 0 ?
                <Pressable
                    onPress={() => { setSelectedStage(item.item) }}
                    style={({ pressed }) => ([styles.stageButton, {
                        opacity: pressed ? 0.4 : 1,
                        backgroundColor: (item.item == selectedStage) ? Colors.primaryButtonColor : Colors.boxBackground
                    }])}>
                    <Text style={[{ fontSize: scale(16), color: (item.item == selectedStage) ? Colors.boxBackground : Colors.primaryTextColor }, Fonts.Nunito_400Regular]}>{item.item}</Text>
                </Pressable>
                : null
        )
    }

    const onSelectedDisease = (item) => {
        const isSelectedDisease = Global.patientDiseaseDetials.some(e => { return e.name == item.name; });
        if (isSelectedDisease) {
            DisplayError("Already Added")
            setDiseaseCard(false);
            setSelectedDisease("");
            return;
        }
        Global.diseaseID = item.id
        setSelectedDisease(item.name);
        setSelectedDiseaseStages(item.stages)
        setDiseaseCard(true);
        setSearchData("");
        setHasStages(item.hasStages);
        setEmpty(false);
        Keyboard.dismiss();
    }

    const createTreatment = async () => {
        try {
            const body = {
                "userId": Global.userID,
                "patientId": Global.patientID,
                "diseaseId": Global.diseaseID,
                "stage": selectedStage.toString() == "-1" ? "0" : selectedStage.toString(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            await apiCall('treatment/createtreatment', body);
            if (Global.fromCareCircle) {
                navigation.replace("PatientDashboard", { fromCareCircle: props.route.params.fromCareCircle, personData: props.route.params.personData });
            } else {
                navigation.replace("MyTreatment", { refreshing: true })
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const onContinueClick = async () => {
        if (!empty && (hasStages == "No" || (selectedStage !== -1 && selectedDisease !== ""))) {
            const sameDisease = Global.patientDiseaseDetials.filter(element => {
                return element.name == selectedDisease
            });

            if (sameDisease.length > 0) {
                DisplayError("Already Added");
                return;
            }
            else {
                await createTreatment();
            }
        }
        else if (selectedDisease == "" || empty) {
            DisplayError("Please select a disease to continue");
        }
        else if (hasStages == "Yes" && selectedStage == -1) {
            DisplayError("Please Select Stage");
        }
    }
    useEffect(() => {
        cancerType();
    }, []);

    const cancerType = async () => {
        try {
            const body = {
                "patientId": Global.patientID,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall('treatment/getcancertype', body, true);
            setDiseaseData(response);
            setLoading(false);
            Global.DiseaseData = response;
            Global.VoiceSearchedData = response;
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const onBackPress = () => {
        if (Global.fromCareCircle) {
            navigation.navigate("PatientDashboard", { fromCareCircle: props.route.params.fromCareCircle, personData: props.route.params.personData });
        } else {
            navigation.replace("MyTreatment", { refreshing: true })
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header onPress={() => { onBackPress(); }} headerTitle="Add Treatment" />
                <View>
                    <Text style={[GlobalStyles.extralargeText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>Select the Disease Type</Text>
                </View>
                <VoiceSearch
                    functionPropNameHere={(data) => {
                        if (data.length == 0) {
                            setEmpty(true);
                        }
                        setSearchData(data);
                        setDiseaseCard(false);
                    }}
                    mainContext={this}
                    data={diseaseData}
                    placeholderText='Search by name'
                    isMicOutline={false}
                    isMicNeeded={true}
                    isFilterNeeded={false}
                    extraStyles={[GlobalStyles.fixedTopSpacing, { height: Global.OS == "ios" ? verticalScale(45) : null }]}
                />
                {
                    diseaseData.length == 0 ?
                        <View style={styles.emptyContainer}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>No results found</Text>
                        </View>
                        : searchData ?
                            <View>
                                <FlatList
                                    style={{ maxHeight: heightToDp(40) }}
                                    keyboardShouldPersistTaps={"handled"}
                                    data={searchData}
                                    renderItem={({ item, index }) => {
                                        return (<Pressable
                                            onPress={() => onSelectedDisease(item)}
                                            style={({ pressed }) => ([styles.diseaseButton, { backgroundColor: pressed ? Colors.primaryinactive : Colors.defaultBackground }, GlobalStyles.inputBoxShadow])}>
                                            <View>
                                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}>{item.name}</Text>
                                            </View>
                                        </Pressable>)
                                    }} />
                            </View>
                            :
                            diseaseCard ?
                                <View style={[styles.diseaseContainer, GlobalStyles.inputBoxShadow]}>
                                    <Pressable style={[GlobalStyles.fixedBottomSpacing, { flexDirection: 'row', justifyContent: 'flex-start', alignItems: "center" }]}>
                                        <Text style={[{ fontSize: scale(28), flex: 1, color: Colors.primaryTextColor }, Fonts.Nunito_600SemiBold]}>{selectedDisease}</Text>
                                        <RadioButton selected={true} backgroundColor={Colors.primaryButtonColor} />
                                    </Pressable>
                                    {hasStages == "Yes" &&
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Select Stage</Text>
                                    }
                                    <View style={[GlobalStyles.fixedBottomSpacing]}>
                                        <FlatList
                                            data={selectedDiseaseStages}
                                            keyExtractor={item => item.id}
                                            renderItem={stageButton}
                                            numColumns={5}
                                            style={{ marginRight: widthToDp(1) }}
                                        />
                                    </View>
                                    {/* <Pressable
                                        onPress={() => setShowQuickFactsModal(true)}
                                        style={({ pressed }) => ([styles.moreButton, { opacity: pressed ? 0.4 : 1 }])}
                                    >
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.primaryButtonColor }]}>Know More</Text>
                                    </Pressable> */}
                                </View> :
                                null
                }
            </View>
            <View style={{ marginHorizontal: widthToDp(4) }}>
                {displayBottomButton && <CommonButton
                    onPress={onContinueClick}
                    disabled={loading}
                    extraStyles={{ position: 'absolute', bottom: heightToDp(4), marginHorizontal: widthToDp(4) }}
                    buttonText="Continue"
                />}
            </View>
            <Modal
                visible={showQuickFactsModal}
                transparent={true}
                animationType={'slide'}>
                <ScrollView>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalBox}>
                            <View style={[{ marginTop: widthToDp(4), flexDirection: 'row' }]}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '85%', flexDirection: 'column' }}>
                                        <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>Quick Facts</Text>
                                    </View>
                                    <View style={{ width: '15%', flexDirection: 'column', marginRight: 20 }}>
                                        <Pressable
                                            onPress={() => { setShowQuickFactsModal(false) }}
                                            style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1, backgroundColor: Colors.boxBackground, borderRadius: 50, height: 35, width: 35, alignItems: "center", justifyContent: "center" }])}>
                                            <VectorIcons groupName='Ionicons' iconName="close" style={{ color: Colors.primaryTextColor }} iconsize={scale(20)} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                            <Text style={[GlobalStyles.normalText, styles.factsDesc, Fonts.Nunito_600SemiBold]}>The number of cancer survivors is expected to increase to 20.3 million by 2026.</Text>
                            <View style={styles.connectContainer}>
                                <Text style={[GlobalStyles.normalText, { marginTop: heightToDp(1) }, Fonts.Nunito_600SemiBold]}>HOPE Connect</Text>
                                <Image
                                    resizeMode='contain'
                                    source={require("../assets/images/Avatars.png")}
                                    style={[{ height: heightToDp(5), width: widthToDp(50), marginTop: heightToDp(2) }]} />
                                <Pressable
                                    onPress={() => {
                                        if (Global.fromCareCircle) {

                                            navigation.navigate('HopeConnect', {
                                                selectedOption: "CHAT", fromScreen: "DiseaseSearch",
                                                fromCareCircle: props.route.params.fromCareCircle, personData: props.route.params.personData
                                            })
                                        }
                                        else {
                                            navigation.navigate('HopeConnect', { selectedOption: "CHAT", fromScreen: "DiseaseSearch" })
                                        }
                                        setTimeout(() => {
                                            setShowQuickFactsModal(false);
                                        }, 100);
                                    }}
                                    style={({ pressed }) => ([styles.connectButton, { opacity: pressed ? 0.4 : 1 }])}>
                                    <Text style={[GlobalStyles.normalText, { color: Colors.primaryButtonColor }, Fonts.Nunito_600SemiBold]}>Connect with People</Text>
                                </Pressable>
                            </View>
                            <CommonButton
                                buttonText="Got it!"
                                extraStyles={{ marginTop: heightToDp(20), marginBottom: heightToDp(4) }}
                                onPress={() => setShowQuickFactsModal(false)}
                            />
                        </View>
                    </View>
                </ScrollView>
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
    stageButton: {
        borderRadius: 14,
        width: 96 / 6 + "%",
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: heightToDp(2),
        marginRight: widthToDp(2),
        marginVertical: heightToDp(2)
    },
    headingDesc: {
        marginTop: heightToDp(2),
        lineHeight: heightToDp(3),
        marginRight: widthToDp(8),
    },
    emptyContainer: {
        marginTop: heightToDp(22),
        justifyContent: 'center',
        alignItems: 'center',
    },
    diseaseButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        paddingBottom: heightToDp(2),
        borderBottomWidth: 1,
        borderBottomColor: Colors.modalBackground,
        paddingLeft: widthToDp(6),
        paddingTop: heightToDp(2),
    },
    diseaseContainer: {
        width: WIDTH * 0.9,
        flexDirection: 'column',
        marginTop: heightToDp(2),
        marginBottom: heightToDp(6),
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
        paddingLeft: widthToDp(6),
        paddingTop: heightToDp(2),
        paddingRight: widthToDp(3),
    },
    moreButton: {
        borderRadius: 14,
        backgroundColor: Colors.lightblue,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: heightToDp(2),
        paddingVertical: heightToDp(2),
        marginBottom: heightToDp(3),
        marginRight: widthToDp(2)
    },
    modalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: Colors.modalBackground,


    },
    modalBox: {
        height: '98%',
        backgroundColor: Colors.defaultBackground,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        paddingHorizontal: widthToDp(4),
        marginTop: heightToDp(2),
        justifyContent: "space-evenly"
    },
    factsDesc: {
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(3),
        marginTop: heightToDp(2),
        fontSize: scale(14)
    },
    connectContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: heightToDp(23),
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
    },
    connectButton: {
        backgroundColor: Colors.lightblue,
        width: '65%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: heightToDp(2),
        borderRadius: 14,
        marginTop: heightToDp(2),
        marginBottom: heightToDp(2),
    },
    groupContainer: {
        flex: 1,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
})