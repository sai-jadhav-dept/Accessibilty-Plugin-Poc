import React, { useState, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, Image, FlatList, Pressable, TextInput, Modal } from 'react-native'
import Header from '../components/Header'
import GlobalStyles from '../utils/GlobalStyles'
import { scale, verticalScale } from 'react-native-size-matters';
import { heightToDp, widthToDp } from '../utils/Responsive';
import FieldLabel from '../components/FieldLabel';
import VectorIcons from '../components/VectorIcons';
import Colors from '../utils/Colors';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import Fonts from '../utils/Fonts';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Global from './Global';
import CommonButton from '../components/CommonButton';
import { fetchPostalData, validatePincode } from '../utils/CommonFunctions';

const SelectDoctorScreen = (props) => {

    const navigation = useNavigation();
    const [selectedCouncil, setSelectedCouncil] = useState("");
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState("");
    const [doctorTypes, setDoctorTypes] = useState([""]);
    const [doctorSpecializationId, setDoctorSpecializationId] = useState("");
    const [searchDoctor, setSearchDoctor] = useState("");
    const [searchNutritionPincode, setSearchNutritionPincode] = useState("");
    const [searchLocation, setSearchLocation] = useState("");
    const [doctorData, setDoctorData] = useState([]);
    const [selectedData, setSelectedData] = useState("");
    const [selectName, setSelectName] = useState(true);
    const [selectLocation, setSelectLocation] = useState(false);
    const [specialization, setSpecialization] = useState(false);
    const [pincode, setPincode] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [selectedDoctorInfo, setSelectedDoctorInfo] = useState("");
    const [validation, setValidation] = useState(false);
    const Mode = props.route.params.Mode;
    const Purpose = props.route.params.Purpose;
    const Type = props.route.params.Type;
    const modeId = props.route.params.modeId;
    const purposeId = props.route.params.purposeId;

    useEffect(() => {
        getprovidertypelist();
        GetDoctors();
    }, [])
    const getprovidertypelist = async () => {
        try {
            const body = {
                "userTypeId": "4",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall("registration/getprovidertypelist", body);
            const providerType = response.providerType.map(category => {
                return {
                    name: category.name,
                    id: category.id
                };
            });
            setDoctorTypes(providerType)
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const GetDoctors = async () => {
        try {
            const body = {
                "userTypeId": Type == "Nutritionist" ? "5" : "4",
                "mode": Mode.toString(),
                "name": searchDoctor.toString(),
                "location": searchLocation.toString(),
                "specialization": doctorSpecializationId.toString(),
                "pincode": searchNutritionPincode,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "deviceInfo": "android"
            }
            setLoading(true);
            const response = await apiCall("registration/getdoctors", body);
            if (response.doctors.length == 0) {
                setValidation(true);
            } else {
                setValidation(false);
            }
            setDoctorData(response.doctors);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const pincodeValidatingApi = async (pin) => {
        setLoading(true);
        await fetchPostalData(pin);
        setLoading(false);
        if (Global.OS == "ios") {
            await delay(200);
        }
    };

    const onSubmit = async () => {
        setLoading(true);
        const statusMessage = await validatePincode(searchNutritionPincode);
        setLoading(false);
        if (Global.OS == "ios") {
            await delay(200);
        }
        if (searchDoctor.trim() == "" && searchLocation.trim() == "" && doctorSpecializationId.trim() == "" && searchNutritionPincode.trim() == "") {
            DisplayError("Please select atleast one activity.")
        } else if (searchNutritionPincode) {
            if (await pincodeValidatingApi(searchNutritionPincode)) {
                DisplayError("Please enter valid pincode");
            } else if (statusMessage) {
                DisplayError(statusMessage)
            }
            else {
                await GetDoctors();
            }
        }
        else {
            await GetDoctors();
        }
    }

    const GetDoctorAvailableHospitalsData = async () => {
        try {
            const body = {
                "id": selectedData.id.toString(),
                "mode": Mode.toString(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall("appointments/getdoctoravailablehospitalsdata", body);
            let data = response.hospitals;
            setLoading(false);
            if (response.hospitals.length == 0) {
                DisplayError("No schedule available for selected location. Please select another location.")
            } else {
                navigation.navigate("QuickAccessList", { selectedDoctorDetail: selectedData, Type: Type, Mode: Mode, Purpose: Purpose, location: data, modeId: modeId, purposeId: purposeId });
            }
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }

    }

    const OnContinueClick = async () => {
        if (selectedData == "") {
            if (Type == "Nutritionist") {
                DisplayError("Please select Nutritionist.")
            } else {
                DisplayError("Please select doctor.")
            }
        } else if (Mode == "Virtual" || Mode == "Home Visit") {
            navigation.navigate("ChooseDateAndTime", { doctorData: selectedData, Type: Type, Mode: Mode, Purpose: Purpose, modeId: modeId, purposeId: purposeId });
        }
        else {
            await GetDoctorAvailableHospitalsData();
        }
    }
    const handlePress = (item) => {
        setSelectedData(item);
    };

    const onClear = () => {
        setSelectName(true);
        setSelectLocation(false);
        setSpecialization(false);
        setSearchDoctor("");
        setSearchLocation("");
        setSelectedCouncil("");
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    onPress={() => { navigation.navigate("AppointmentType", { Type: Type, Mode: Mode, Purpose: Purpose }) }}
                    headerTitle={Type == "Nutritionist" ? "Select Nutritionist" : "Select Doctor"}
                />
                <View>
                    <Pressable style={[styles.clearButtonContainer]} onPress={onClear} >
                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, styles.clearButtonText]}>Clear All</Text>
                    </Pressable>
                </View>
                {
                    selectName &&
                    <TextInput
                        style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, styles.inputStyle]}
                        placeholderTextColor={Colors.placeholderTextColor}
                        placeholder={Type == "Nutritionist" ? "Search by Nutritionist Name" : "Search by Doctor Name"}
                        value={searchDoctor}
                        onChangeText={text => {
                            setSearchDoctor(text);
                        }}
                    />
                }
                {
                    selectLocation &&
                    <TextInput
                        style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, styles.inputStyle]}
                        placeholderTextColor={Colors.placeholderTextColor}
                        placeholder="Search by location"
                        value={searchLocation}
                        onChangeText={text => {
                            setSearchLocation(text);
                        }}
                    />

                }

                {
                    pincode &&
                    <TextInput
                        style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, styles.inputStyle]}
                        placeholderTextColor={Colors.placeholderTextColor}
                        maxLength={6}
                        placeholder="Search by Pincode"
                        keyboardType="numeric"
                        value={searchNutritionPincode}
                        onChangeText={text => {
                            setSearchNutritionPincode(text);
                        }}
                    />
                }

                {
                    specialization &&
                    <View>
                        <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                            <Dropdown
                                style={[styles.inputtype, Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}
                                iconStyle={styles.iconStyle}
                                iconColor={Colors.primaryTextColor}
                                itemTextStyle={[GlobalStyles.mediumText]}
                                selectedTextStyle={[GlobalStyles.mediumText,]}
                                data={doctorTypes}
                                placeholder={"Select Specialization"}
                                placeholderStyle={[GlobalStyles.mediumText, { color: Colors.placeholderTextColor }]}
                                maxHeight={300}
                                labelField="name"
                                valueField="name"
                                value={selectedCouncil}
                                onChange={(item) => {
                                    setSelectedCouncil(item);
                                    setDoctorSpecializationId(item.id);
                                }}
                            />
                        </Pressable>
                    </View>

                }
                {
                    <View style={{ flexDirection: "row", marginVertical: heightToDp(2) }}>
                        <Pressable
                            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, backgroundColor: selectName ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: selectName ? Colors.boxBackground : Colors.primaryinactive }]}
                            onPress={() => {
                                setSelectName(!selectName);
                            }}
                        >
                            <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>Name</Text>
                        </Pressable>
                        {
                            Mode != "Virtual" && Mode != "Home Visit" && !pincode &&
                            <Pressable
                                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, backgroundColor: selectLocation ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: selectLocation ? Colors.boxBackground : Colors.primaryinactive }]}
                                onPress={() => {
                                    setSelectLocation(!selectLocation);
                                }}
                            >
                                <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>Location</Text>
                            </Pressable>
                        }

                        {
                            Type == "Nutritionist" && !selectLocation &&
                            <Pressable
                                style={({ pressed }) => [{ width: widthToDp(27), alignItems: "center", opacity: pressed ? 0.6 : 1, backgroundColor: specialization ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: specialization ? Colors.boxBackground : Colors.primaryinactive }]}
                                onPress={() => {
                                    setPincode(!pincode);
                                }}>
                                <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>Pincode</Text>
                            </Pressable>
                        }

                        {
                            Type == "Doctor" &&
                            <Pressable
                                style={({ pressed }) => [{ width: widthToDp(27), alignItems: "center", opacity: pressed ? 0.6 : 1, backgroundColor: specialization ? Colors.boxBackground : Colors.defaultBackground, borderRadius: 14, borderWidth: 0.4, paddingVertical: widthToDp(1), paddingHorizontal: widthToDp(2), marginLeft: widthToDp(2), borderColor: specialization ? Colors.boxBackground : Colors.primaryinactive }]}
                                onPress={() => {
                                    setSpecialization(!specialization);
                                    setPincode(false)
                                }}>
                                <Text style={[Fonts.Nunito_400Regular, GlobalStyles.extrasmallText, { color: Colors.placeholderTextColor }]}>Specialization</Text>
                            </Pressable>
                        }
                        <CommonButton
                            buttonText={"Search"}
                            extraStyles={[{ marginLeft: widthToDp(3), width: "25%", height: heightToDp(4), backgroundColor: Colors.primaryButtonColor }, GlobalStyles.extrasmallText]}
                            onPress={async () => (await onSubmit())}
                        />
                    </View>
                }
                {
                    validation &&
                    <View style={{ alignItems: "center", justifyContent: "center", marginTop: heightToDp(6) }}><Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold,]}>No {Type} Found.</Text></View>
                }
                <FlatList
                    style={{ marginTop: verticalScale(5), marginBottom: heightToDp(15) }}
                    data={doctorData}
                    renderItem={({ item, index }) =>
                        <Pressable onPress={() => handlePress(item)}
                            style={[styles.card, selectedData == item && { backgroundColor: Colors.primaryButtonColor }]}>
                            <View style={{ width: "20%" }}>
                                {item.profilePath && item.profilePath !== "" ? (
                                    <Image style={styles.doctorImage} resizeMode='cover' source={{ uri: item.profilePath }} />
                                ) : (
                                    <Image resizeMode='cover' style={styles.doctorImage} source={require("../assets/images/profile.png")} />
                                )}

                            </View>
                            <View style={{ width: "70%", }}>
                                <FieldLabel text={item.name} Nospace={true} TextType={"medium"} extraStyles={[selectedData == item && { color: Colors.defaultBackground }]} />
                            </View>
                        </Pressable>
                    }
                />
                <CommonButton
                    buttonText={"Continue"}
                    onPress={OnContinueClick}
                    extraStyles={[GlobalStyles.fixbottomcommonButton,]}
                />
            </View>
            <Modal visible={showInfo} transparent={true} animationType="slide" >
                <View style={styles.nurseInfoModal}>
                    <View style={styles.nurseInfoParentContainer}>
                        <Pressable style={styles.modalCloseButton} onPress={() => setShowInfo(false)}>
                            <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(25)} iconstyle={{ color: Colors.placeholderTextColor }} />
                        </Pressable>
                        <View style={styles.nurseInfoContainer}>
                            <View style={{ width: "20%" }}>
                                {selectedDoctorInfo.profilePath && selectedDoctorInfo.profilePath !== "" ? (
                                    <Image style={styles.doctorImage} resizeMode='cover' source={{ uri: selectedDoctorInfo.profilePath }} />
                                ) : (
                                    <Image resizeMode='cover' style={styles.doctorImage} source={require("../assets/images/profile.png")} />
                                )}
                            </View>
                            <View style={{ marginLeft: widthToDp(3) }}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{selectedDoctorInfo.name}</Text>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{selectedDoctorInfo.hopeID}</Text>
                            </View>
                        </View>
                        <View style={styles.nurseInfoHeader}>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Hope Id</Text>
                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, styles.nurseInfoDetails]}>{selectedDoctorInfo.hopeID}</Text>
                        </View>
                    </View>
                </View>
            </Modal>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} warningText={warningText} setShowModal={setShowModal} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

    doctorImage: {
        width: widthToDp(15),
        height: heightToDp(9),
        borderRadius: scale(50),
    },
    inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        marginTop: heightToDp(1),
        width: '100%',
        alignSelf: 'center',
        padding: widthToDp(2),
    },
    inputStyle: {
        marginTop: heightToDp(1),
        borderRadius: 14,
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(10),
        backgroundColor: Colors.boxBackground
    },
    card: {
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(10),
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14
    },
    nurseInfoParentContainer: {
        width: "95%",
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
        padding: widthToDp(5),
        position: "relative"
    },
    nurseInfoModal: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        justifyContent: "center",
        alignItems: "center"
    },
    modalCloseButton: {
        position: "absolute",
        backgroundColor: Colors.boxBackground,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        right: widthToDp(4),
        top: widthToDp(4),
        zIndex: 999,
    },
    nurseInfoContainer: {
        width: "100%",
        alignItems: "center",
        flexDirection: "row"
    },
    nurseInfoImage: {
        width: widthToDp(20),
        height: widthToDp(20),
        backgroundColor: Colors.boxBackground,
        borderRadius: widthToDp(30)
    },
    nurseInfoHeader: {
        marginTop: heightToDp(1)
    },
    nurseInfoDetails: {
        padding: widthToDp(3),
        backgroundColor: Colors.lightblue,
        borderRadius: 14, width: "100%",
        marginTop: heightToDp(1)
    },
    clearButtonContainer: {
        backgroundColor: Colors.primaryButtonColor,
        width: "25%",
        borderRadius: scale(10),
        padding: scale(3),
        alignSelf: "flex-end",
    },
    clearButtonText: {
        color: Colors.defaultBackground,
        textAlign: "center",
    }
})

export default SelectDoctorScreen;
