import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, FlatList, SafeAreaView, KeyboardAvoidingView, TextInput, Image } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import VectorIcons from '../components/VectorIcons';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/core';
import Global from './Global';
import { moderateScale, scale } from 'react-native-size-matters';
import moment from 'moment';
import CalendarPicker from 'react-native-calendar-picker';
import Loader from '../components/Loader';
import Spinner from 'react-native-loading-spinner-overlay';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import MedicineReminderCard from '../components/MedicineReminderCard';
import ComingSoon from '../components/ComingSoon';
import CommonButton from '../components/CommonButton';
import { Dropdown } from 'react-native-element-dropdown';

const minimum6Months = new Date().setMonth(new Date().getMonth() - 6);
const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 2);

const MedicineReminders = (props) => {
    const navigation = useNavigation();
    const [selectedTopButton, setSelectedTopButton] = useState('Reminders');
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [selectedMedicineDate, setSelectedMedicineDate] = useState({
        dateStr: "Today",
        dateObj: new Date()
    });
    const [loading, setLoading] = useState(false);
    const [medicineData, setMedicineData] = useState(Global.MedicineData);
    const [responseMedicationReminder, setResponseMedicationReminder] = useState([]);
    const [completeStatus, setCompleteStatus] = useState(false);
    const [alertStatus, setAlertStatus] = useState(false);
    const [selectedId, setSelectedId] = useState(1);
    const [cancelPopUp, setCancelPopUp] = useState(false);
    const [medicineDetail, setMedicineDetail] = useState(false);
    const [MedicineDetailCard, setMedicineDetailCard] = useState({});
    const [selectedFileUri, setSelectedFileUri] = useState("");
    const [showViewFile, setShowViewFile] = useState(false);
    const [singleDay, setSingleDay] = useState(false);
    const [modifyPopUp, setModifyPopUp] = useState(false);
    const [dosageSplited, setDosageSplited] = useState({});
    const [dosage, setDosage] = useState("");
    const [dosageVisible, setDosageVisible] = useState({});
    const [selectedCancelData, setselectedCancelData] = useState([]);
    const [medicineTaken, setMedicineTaken] = useState("");
    const takeMedicine = [
        { name: "Empty Stomach" },
        { name: "Before Meal" },
        { name: "With Meal" },
        { name: "After Meal" },
        { name: "Before Sleep" }
    ];
    const reasons = [
        {
            key: 0,
            reason: 'Only this reminder',
        },
        {
            key: 1,
            reason: 'This and future reminder',
        }
    ];
    const [selectedReason, setSelectedReason] = useState(reasons[0].reason);
    const handleSelectedReason = (item) => {
        setSelectedReason(item.reason);
    };
    const GetMedicationApi = () => {
        GetMedicationReminders();
        GetMedicineList();
    }

    useEffect(() => {
        GetMedicationApi();
    }, [props.dropdownValue, selectedMedicineDate]);

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const UserSelectedDate = moment(selectedMedicineDate.dateObj).format("DD/MM/YYYY");
    const topButtons = [
        "Reminders",
        "Prescription",
        "My Shelf",
    ];

    const toggleItem = (item) => {
        const newData = responseMedicationReminder.map((accItem) => {
            if (accItem.time === item.time) {
                const newItem = {};
                for (let key in accItem) {
                    newItem[key] = accItem[key];
                }
                newItem.expanded = !accItem.expanded;
                return newItem;
            } else {
                return accItem;
            }
        });
        setResponseMedicationReminder(newData);
    };

    const MedicineCardHeader = ({ item, index }) => {
        const now = moment();
        let iconColor = Colors.lightblue;
        if (selectedMedicineDate?.dateStr) {
            const selectedDate = selectedMedicineDate.dateStr === 'Today'
                ? moment()
                : moment(selectedMedicineDate.dateStr, 'DD/MM/YYYY');
            const itemTime = moment(item.time, ['h:mm A']);
            const itemDateTime = moment(selectedDate)
                .set({
                    hour: itemTime.get('hour'),
                    minute: itemTime.get('minute'),
                    second: 0,
                    millisecond: 0,
                });
            if (itemDateTime.isBefore(now)) {
                iconColor = Colors.primaryButtonColor; // past
            } else {
                iconColor = Colors.lightblue; // future
            }
        }
        return (
            <Pressable onPress={() => {
                toggleItem(item);
            }} hitSlop={10} style={({ pressed }) => ([GlobalStyles.rowFlexstart, { opacity: pressed ? 0.5 : 1, width: '100%' }])}>
                <VectorIcons groupName='MaterialCommunityIcons' iconName='checkbox-blank-circle' iconstyle={[{ color: iconColor, marginRight: widthToDp(4) }]} />
                <Text style={[GlobalStyles.normalText, { marginRight: widthToDp(4) }, Fonts.Nunito_700Bold]}>{item.time}</Text>
                <View style={[{ borderBottomWidth: 1, borderBottomColor: 'rgba(60, 60, 67, 0.36)', flex: 1 }]}></View>
                <View>
                    <VectorIcons groupName='AntDesign' iconName={item.expanded ? 'right' : 'down'} iconstyle={[{ color: Colors.primaryTextColor, marginLeft: widthToDp(3) }]} />
                </View>
            </Pressable>
        );
    };

    const addDates = (dateObj, numOfDays) => {
        const resultDate = new Date(dateObj);
        return resultDate.setDate(resultDate.getDate() + numOfDays);
    }

    const increaseOneDay = () => {
        onDateChange(addDates(selectedMedicineDate.dateObj, 1));
    }

    const decreaseOneDay = () => {
        if (minimum6Months < selectedMedicineDate.dateObj) {
            onDateChange(addDates(selectedMedicineDate.dateObj, -1));
        }
    }

    const onDateChange = (date) => {
        const todayDateStr = moment(new Date()).format("DD/MM/YYYY");
        setSelectedMedicineDate({ dateStr: moment(date).format("DD/MM/YYYY") == todayDateStr ? "Today" : moment(date).format('DD/MM/YYYY'), dateObj: date });
        setShowDatePickerModal(false);
    }

    const GetMedicineList = async () => {
        try {
            const body = {
                "treatmentCycleId": Global.selectedCycle,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await triggerApiCall('medications/getmedicinelist', body);
            setMedicineData(response.medicines);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const Triggerupdatereminderstatus = async (item) => {
        try {
            const body = {
                "medicationId": item.id.toString(),
                "action": "enable",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await triggerApiCall('medications/updatereminderstatus', body);
            responseMedicationReminder.forEach((e) => {
                if (e.id === item.id) {
                    e.completedStatus = 1
                }
            });
            setLoading(false);
            setCompleteStatus(!completeStatus);
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const GetMedicationReminders = async () => {
        try {
            const body = {
                "treatmentCycleId": Global.selectedCycle,
                "date": UserSelectedDate.toString(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await triggerApiCall('medications/getmedicationreminders', body);
            setResponseMedicationReminder(response.remainders);
            const updatedMedicineData = response.remainders.map((o, i) => {
                if (o.id === selectedId) {
                    const updatedObject = {
                        id: o.id.length,
                        dose: o.dosage,
                        unit: o.unit,
                        name: o.medicine,
                        selectedTakeMedicine: o.taken,
                    };
                    return updatedObject;
                }
                return o;
            });
            Global.MedicineData = updatedMedicineData;
            setLoading(false);
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const onSubmit = async () => {
        setCancelPopUp(false);
        try {
            const body = {
                "userId": Global.userID,
                "id": selectedReason == reasons[0].reason ? selectedCancelData.id : "0",
                "medicationId": selectedCancelData.medicationId,
                "date": moment(UserSelectedDate, "DD-MM-YYYY").format("YYYY-MM-DD").toString(),
                "time": moment(selectedCancelData.time, "hh:mm A").format("hh:mm"),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await apiCall("medications/cancelmedication", body);
            setLoading(false);
            await GetMedicineList();
            await GetMedicationReminders();
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const onModifySubmit = async () => {
        const stored = Global.MedicineData.filter((datas) => datas.id == selectedCancelData.id);
        if (stored[0].dosage.length !== 0 && dosage.length == 0) {
            DisplayError("Please enter dosage");
        } else {
            setModifyPopUp(false);
            try {
                const body = {
                    "userId": Global.userID,
                    "id": selectedReason == reasons[0].reason ? selectedCancelData.id : "0",
                    "medicationId": selectedCancelData.medicationId,
                    "date": moment(UserSelectedDate, "DD-MM-YYYY").format("YYYY-MM-DD").toString(),
                    "time": moment(selectedCancelData.time, "hh:mm A").format("hh:mm"),
                    "dosage": selectedCancelData.dosage && selectedCancelData.dosage.split(' ')[1]
                        ? dosage + ` ${selectedCancelData.dosage.split(' ')[1]}`
                        : dosage,
                    "takeTime": medicineTaken,
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                };
                setLoading(true);
                await apiCall("medications/updatemedication", body);
                setLoading(false);
                await GetMedicineList();
                await GetMedicationReminders();
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
    }

    const cancelModal = async (data) => {
        setSingleDay(data.nextCount == 0);
        setCancelPopUp(true);
        setSelectedReason(reasons[0].reason);
        setselectedCancelData(data);
    }

    const modifyModalFunction = async (data) => {
        setSingleDay(data.nextCount == 0);
        setselectedCancelData(data);
        setSelectedReason(data.nextCount == 0 ? reasons[0].reason : reasons[1].reason);
        const stored = Global.MedicineData.filter((datas) => datas.id == selectedCancelData.id);
        setDosageVisible(stored[0].dosage.lenght !== 0);
        setModifyPopUp(true);
        setDosageSplited({ first: data.dosage.split(' ')[0], last: data.dosage.split(' ')[1] });
        setDosage(data.dosage.split(' ')[0]);
        setMedicineTaken(data.take);
    };

    const EnableMedicationAlert = async (item, isDisable) => {
        try {
            const body = {
                "medicationId": item.id.toString(),
                "action": isDisable ? 'Disable' : "Enable",
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await triggerApiCall('medications/enablemedicationalert', body);
            responseMedicationReminder.forEach((e) => {
                if (e.id === item.id) {
                    e.alertsEnabled = isDisable ? false : true;
                }
            });
            setAlertStatus(!alertStatus);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const triggerApiCall = (endpoint, body) => {
        return new Promise(async (res, rej) => {
            try {
                const response = await apiCall(endpoint, body);
                res(response);
            } catch (error) {
                rej(error);
            }
        });
    }

    const getMedicationData = async (data, index) => {
        try {
            const body = {
                "treatmentCycleId": Global.selectedCycle,
                "medicationId": data.id,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall('medications/getmedicationdata', body);
            setMedicineDetailCard(response.medicationData);
            setLoading(false);
            setMedicineDetail(true);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const getViewImage = async (item) => {
        setSelectedFileUri(item.reportPath);
        setMedicineDetail(false);
        setShowViewFile(true);
    };

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer, { marginBottom: heightToDp(10) }]}>
            <View style={styles.topcontainer}>
                <View style={GlobalStyles.rowSpaceBetween}>
                    {
                        topButtons.map((item, index) =>
                            <Pressable
                                key={index}
                                onPress={() => setSelectedTopButton(item)}
                                style={({ pressed }) => ([styles.topButton, {
                                    opacity: pressed ? 0.5 : 1,
                                    backgroundColor: selectedTopButton == item ? Colors.primaryButtonColor : Colors.boxBackground
                                }])}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, {
                                    color: selectedTopButton == item ? Colors.boxBackground : Colors.primaryTextColor, fontSize: responsiveFont(16)
                                }]}>
                                    {item}
                                </Text>
                            </Pressable>
                        )
                    }
                </View>
                {selectedTopButton == 'Reminders' &&
                    <View>
                        <View style={styles.reminderContainer}>
                            <Pressable style={({ pressed }) => ([styles.button, { opacity: pressed ? 0.5 : 1 }])}
                                onPress={() => {
                                    setShowDatePickerModal(true)
                                }}>
                                <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>{selectedMedicineDate.dateStr}</Text>
                                <VectorIcons
                                    groupName='AntDesign'
                                    iconName='right'
                                    iconsize={widthToDp(5)}
                                    iconstyle={[{ color: Colors.primaryButtonColor }]}
                                />
                            </Pressable>
                            <View style={styles.button}>
                                <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])} onPress={decreaseOneDay}>
                                    <VectorIcons groupName='AntDesign' iconName='left' iconstyle={[{ color: Colors.primaryButtonColor }]} />
                                </Pressable>
                                <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, marginLeft: widthToDp(4) }])}
                                    onPress={increaseOneDay}>
                                    <VectorIcons groupName='AntDesign' iconName='right' iconstyle={[{ color: Colors.primaryButtonColor }]} />
                                </Pressable>
                            </View>
                        </View>
                        <FlatList
                            style={GlobalStyles.fixedTopSpacing}
                            data={responseMedicationReminder}
                            keyExtractor={(item, index) => index + "Key"}
                            renderItem={({ item, index }) => {
                                const isFirstItem = index === 0 || item.time !== responseMedicationReminder[index - 1].time;
                                return (
                                    <View style={[GlobalStyles.columnFlexstart, { marginBottom: responseMedicationReminder.length - 1 == index ? heightToDp(28) : 0 }]}>
                                        {isFirstItem && <MedicineCardHeader item={item} index={index} />}
                                        {!item.expanded &&
                                            <MedicineReminderCard item={item} responseMedicationReminder={responseMedicationReminder} index={index} setselectedId={setSelectedId} EnableMedicationAlert={EnableMedicationAlert} Triggerupdatereminderstatus={Triggerupdatereminderstatus} cancelMedication={cancelModal} modifyModalFunction={modifyModalFunction} selectedMedicineDate={selectedMedicineDate} />
                                        }
                                    </View>
                                )
                            }}
                        />
                        <Modal
                            visible={showDatePickerModal}
                            animationType={'fade'}
                            transparent={true}>
                            <View style={[GlobalStyles.columnCenter, styles.modalcontainer]}>
                                <View style={{ borderRadius: 14, width: '97%', paddingBottom: widthToDp(4), backgroundColor: Colors.boxBackground }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <Pressable
                                            hitSlop={15}
                                            onPress={() => { setShowDatePickerModal(false); }}
                                            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.4 : 1 }]}
                                        >
                                            <VectorIcons groupName="Ionicons" iconName="close" iconstyle={[{ color: Colors.primaryTextColor }]} />
                                        </Pressable>
                                    </View>
                                    <CalendarPicker
                                        textStyle={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}
                                        restrictMonthNavigation={true}
                                        selectedDayColor={Colors.primaryButtonColor}
                                        selectedDayTextColor={Colors.boxBackground}
                                        selectedStartDate={selectedMedicineDate.dateObj}
                                        initialDate={selectedMedicineDate.dateObj}
                                        minDate={minimum6Months}
                                        maxDate={maxDate}
                                        onDateChange={onDateChange}
                                    />
                                </View>
                            </View>
                        </Modal>
                    </View>}
                {selectedTopButton == 'Prescription' &&
                    <View>
                        <View style={styles.container}>
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>Prescriptions</Text>
                        </View>
                        <FlatList
                            style={[GlobalStyles.fixedTopSpacing, { zIndex: -1 }]}
                            data={medicineData}
                            keyExtractor={(item, index) => index + "Key"}
                            renderItem={({ item, index }) =>
                                <Pressable
                                    onPress={() => { getMedicationData(item, index); }}
                                    style={({ pressed }) => ([{
                                        flexDirection: 'column',
                                        justifyContent: 'flex-start',
                                        borderBottomColor: Colors.textInputBorder,
                                        borderBottomWidth: 1,
                                        paddingBottom: heightToDp(2),
                                        marginBottom: medicineData.length - 1 == index ? heightToDp(29) : 0,
                                        opacity: pressed ? 0.4 : 1
                                    }])}
                                >
                                    <View style={{ flexDirection: "row", width: '100%', marginVertical: heightToDp(2), alignItems: "center" }}>
                                        <View style={{ width: '88%' }}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{item.name}</Text>
                                            <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold, { marginTop: 3 }]}>{item.unit}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            }
                        />
                    </View>}
                {selectedTopButton == 'My Shelf' &&
                    <View style={{ marginTop: heightToDp(2), flex: 1 }}>
                        <ComingSoon />
                    </View>
                }
                <View style={[{
                    position: 'absolute',
                    bottom: -heightToDp(6),
                    right: widthToDp(4)
                }]}>
                    <Pressable
                        onPress={() => { navigation.navigate("AddMedicineReminder") }}
                        style={({ pressed }) => ([GlobalStyles.inputBoxShadow, GlobalStyles.rowSpaceBetween, {
                            opacity: pressed ? 0.4 : 1,
                            backgroundColor: Colors.defaultBackground,
                            paddingHorizontal: widthToDp(4),
                            paddingVertical: heightToDp(2),
                            borderRadius: 14
                        }])}>
                        <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconstyle={{ color: Colors.primaryButtonColor }} />
                        <Text style={[GlobalStyles.buttonnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                            Create New
                        </Text>
                    </Pressable>
                </View>
            </View>
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <Modal transparent={true} visible={cancelPopUp}>
                <KeyboardAvoidingView
                    behavior={Global.OS === 'ios' ? 'padding' : null}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={[styles.modalHeading, GlobalStyles.largeText, Fonts.Nunito_700Bold]}>Delete this Medication?</Text>
                                <View style={{ marginTop: -heightToDp(3) }}>
                                    <Pressable style={styles.modalCloseButton} onPress={() => setCancelPopUp(false)}>
                                        <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                    </Pressable>
                                </View>
                            </View>
                            <View>
                                {
                                    singleDay ?
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { width: "80%", marginLeft: widthToDp(2) }]}>Are you sure you want to delete this medication</Text>
                                        :
                                        <FlatList
                                            keyExtractor={(item, index) => "key" + index}
                                            data={reasons}
                                            style={{ marginLeft: widthToDp(2) }}
                                            renderItem={({ item, index }) =>
                                                <Pressable
                                                    onPress={() => handleSelectedReason(item)}
                                                    style={({ pressed }) => ([styles.reasonButton, { opacity: pressed ? 0.5 : 1 }])}
                                                >
                                                    <View style={styles.ReasonContainer}>
                                                        <View
                                                            style={[{
                                                                width: 9,
                                                                height: 9,
                                                                backgroundColor: item.reason == selectedReason ? Colors.primaryButtonColor : Colors.boxBackground,
                                                                borderRadius: 50
                                                            }]}
                                                        />
                                                    </View>
                                                    <Text style={[GlobalStyles.normalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                                        {item.reason}
                                                    </Text>
                                                </Pressable>
                                            }
                                        />
                                }
                                {
                                    singleDay ?
                                        <View style={styles.modalBottomBtn}>
                                            <CommonButton extraStyles={[styles.modalBtnConfirmation, Fonts.Nunito_600SemiBold]}
                                                buttonText={"Yes"}
                                                onPress={onSubmit}>
                                            </CommonButton>
                                            <CommonButton extraStyles={[styles.modalBtnConfirmation, Fonts.Nunito_600SemiBold]}
                                                buttonText={"No"}
                                                onPress={() => { setCancelPopUp(false); }} >
                                            </CommonButton>
                                        </View>
                                        :
                                        <View style={styles.modalBottomBtnBox}>
                                            <CommonButton extraStyles={[styles.modalBtn, Fonts.Nunito_600SemiBold, GlobalStyles.fixedTopSpacing]}
                                                buttonText={"Submit"}
                                                onPress={onSubmit}>
                                            </CommonButton>
                                        </View>
                                }
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <Modal transparent={true} visible={modifyPopUp}>
                <KeyboardAvoidingView
                    behavior={Global.OS === 'ios' ? 'padding' : null}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={[styles.modalHeading, GlobalStyles.largeText, Fonts.Nunito_700Bold]}>Modify this Medication?</Text>
                                <View style={{ marginTop: -heightToDp(3) }}>
                                    <Pressable style={styles.modalCloseButton} onPress={() => setModifyPopUp(false)}>
                                        <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                    </Pressable>
                                </View>
                            </View>
                            <View>
                                {
                                    !singleDay &&
                                    <FlatList
                                        keyExtractor={(item, index) => "key" + index}
                                        data={reasons}
                                        style={{ marginLeft: widthToDp(2) }}
                                        renderItem={({ item, index }) =>
                                            <Pressable
                                                onPress={() => handleSelectedReason(item)}
                                                style={({ pressed }) => ([styles.reasonButton, { opacity: pressed ? 0.5 : 1 }])}
                                            >
                                                <View style={styles.ReasonContainer}>
                                                    <View
                                                        style={[{
                                                            width: 9,
                                                            height: 9,
                                                            backgroundColor: item.reason == selectedReason ? Colors.primaryButtonColor : Colors.boxBackground,
                                                            borderRadius: 50
                                                        }]}
                                                    />
                                                </View>
                                                <Text style={[GlobalStyles.normalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                                    {item.reason}
                                                </Text>
                                            </Pressable>
                                        }
                                    />
                                }
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: heightToDp(1), width: "90%", marginLeft: widthToDp(2) }}>
                                    {
                                        dosageVisible &&
                                        (<>
                                            <TextInput
                                                keyboardType="numeric"
                                                placeholder="50"
                                                placeholderTextColor={Colors.placeholderTextColor}
                                                style={[styles.inputtype, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                                value={dosage}
                                                onChangeText={text => {
                                                    setDosage(text);
                                                }}
                                            />
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(2) }]}>
                                                {dosageSplited.last}
                                            </Text>
                                        </>)
                                    }
                                    <Dropdown
                                        numberOfLines={1}
                                        style={styles.takenDropdown}
                                        placeholderStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor, paddingLeft: widthToDp(2), }]}
                                        selectedTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { paddingLeft: widthToDp(2) }]}
                                        placeholderTextColor={Colors.primaryTextColor}
                                        iconStyle={{ width: 10, height: 20, marginHorizontal: widthToDp(1) }}
                                        data={takeMedicine}
                                        placeholder={"Select"}
                                        autoScroll={false}
                                        maxHeight={300}
                                        value={medicineTaken}
                                        labelField="name"
                                        valueField="name"
                                        onChange={item => {
                                            setMedicineTaken(item.name);
                                        }}
                                    />
                                </View>
                                <View style={styles.modalBottomBtnBox}>
                                    <CommonButton extraStyles={[styles.modalBtn, Fonts.Nunito_600SemiBold, GlobalStyles.fixedTopSpacing]}
                                        buttonText={"Submit"}
                                        onPress={onModifySubmit}>
                                    </CommonButton>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <Modal transparent={true} visible={medicineDetail}>
                <KeyboardAvoidingView
                    behavior={Global.OS === 'ios' ? 'padding' : null}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContentDetail}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={[styles.modalHeading, GlobalStyles.largeText, Fonts.Nunito_700Bold]}>Medication Details</Text>
                                <View style={{ marginTop: -heightToDp(3) }}>
                                    <Pressable style={styles.modalCloseButton} onPress={() => setMedicineDetail(false)}>
                                        <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                    </Pressable>
                                </View>
                            </View>
                            <FlatList
                                keyExtractor={(item, index) => "key" + index}
                                data={MedicineDetailCard}
                                renderItem={({ item, index }) =>
                                    <View style={{ backgroundColor: Colors.primaryButtonColor, padding: widthToDp(2), borderRadius: 14, marginBottom: heightToDp(1.5) }}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.defaultBackground, width: "33%" }]}>
                                                Start Date
                                            </Text>
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(1), color: Colors.defaultBackground }]}>
                                                : {moment(item.startDate).format('DD MMM YYYY')}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.defaultBackground, width: "33%" }]}>
                                                End Date
                                            </Text>
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(1), color: Colors.defaultBackground }]}>
                                                : {moment(item.endDate).format('DD MMM YYYY')}
                                            </Text>
                                        </View><View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.defaultBackground, width: "33%" }]}>
                                                Dosage
                                            </Text>
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(1), color: Colors.defaultBackground }]}>
                                                : {item.dosage}
                                            </Text>
                                        </View>
                                        {
                                            item.note.length !== 0 &&
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.defaultBackground, width: "33%" }]}>
                                                    Note
                                                </Text>
                                                <Text style={[GlobalStyles.smallText, { color: Colors.defaultBackground, marginLeft: widthToDp(1), width: "65%" }, Fonts.Nunito_600SemiBold]}>
                                                    : {item.note}
                                                </Text>
                                            </View>}
                                        <View style={{ flexDirection: "row", }}>
                                            <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.defaultBackground, width: "33%" }]}>
                                                Timing
                                            </Text>
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginLeft: widthToDp(1), color: Colors.defaultBackground }]}>
                                                {item.timings
                                                    .split(', ')
                                                    .map(timing => {
                                                        const [time, label] = timing.split(' - ');
                                                        const formattedTime = moment(time, 'HH:mm:ss').format('hh:mm A');
                                                        return `${formattedTime} - ${label}`;
                                                    })
                                                    .join('\n')}
                                            </Text>
                                        </View>
                                        {
                                            item.reportPath.length !== 0 &&
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.defaultBackground, width: "33%" }]}>
                                                    Prescription
                                                </Text>
                                                <Pressable
                                                    onPress={() => getViewImage(item)}
                                                    style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, marginLeft: widthToDp(1), backgroundColor: Colors.defaultBackground, padding: widthToDp(2), borderRadius: 14 }])}
                                                >
                                                    <Text style={[GlobalStyles.smallText, { color: Colors.primaryButtonColor }, Fonts.Nunito_600SemiBold]}>
                                                        View file
                                                    </Text>
                                                </Pressable>
                                            </View>}
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <Modal
                visible={showViewFile}
                animationType={'fade'}
                transparent={false}>
                <SafeAreaView style={{ flex: 1 }}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Pressable onPress={() => {
                            setShowViewFile(false);
                            setMedicineDetail(true);
                        }}
                            style={({ pressed }) => ([styles.viewReportClosebtn, { opacity: pressed ? 0.5 : 1 }])}
                        >
                            <VectorIcons groupName={"Ionicons"} iconName={"close"} iconsize={scale(18)} iconstyle={{ color: Colors.primaryTextColor }} />
                        </Pressable>
                        <View style={{ alignSelf: "center", width: '95%', backgroundColor: Colors.textInputBorder, height: '95%' }}>
                            {selectedFileUri ?
                                (<Image source={{ uri: selectedFileUri }} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />)
                                : (
                                    <View style={{ width: "100%", height: "100%", backgroundColor: Colors.textInputBorder, justifyContent: "center", alignItems: "center" }}>
                                        <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>No image</Text>
                                    </View>
                                )
                            }
                        </View>
                    </Pressable>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topcontainer: {
        paddingHorizontal: widthToDp(4),
        marginTop: heightToDp(2),
        flex: 1,
    },
    topButton: {
        paddingVertical: heightToDp(2),
        paddingHorizontal: widthToDp(4),
        borderRadius: 14,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: heightToDp(2),
    },
    boxcontainer: {
        position: 'absolute',
        top: heightToDp(6),
        right: widthToDp(2),
        zIndex: 10,
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
    },
    reminderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: heightToDp(2),
    },
    button: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: 'center',
    },
    modalcontainer: {
        backgroundColor: Colors.modalBackground,
        flex: 1,
    },
    closeButton: {
        marginRight: widthToDp(2),
        marginTop: widthToDp(4),
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        borderRadius: 50,
        alignItems: "center",
        height: moderateScale(30),
        width: moderateScale(30),
    },
    medicineDataCard: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: Colors.defaultBackground,
        borderWidth: 1,
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        marginLeft: widthToDp(6),
        marginRight: widthToDp(2),
    },
    medicineCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: widthToDp(6),
        marginTop: heightToDp(2),
        justifyContent: "space-between",
        width: "87%",
    },
    modalBottomBtnBox: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    modalContent: {
        width: widthToDp(80),
        backgroundColor: Colors.boxBackground,
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
    modalContentDetail: {
        width: "92%",
        backgroundColor: Colors.boxBackground,
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
        height: "auto",
        maxHeight: "90%"
    },
    modalBtn: {
        width: "50%",
        height: heightToDp(6),
        paddingHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
    ReasonContainer: {
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 1.5,
        borderColor: Colors.primaryButtonColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reasonButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: heightToDp(0.5)
    },
    modalText: {
        alignSelf: "center",
        width: "95%",
        lineHeight: 25,
    },
    modalCloseButton: {
        backgroundColor: Colors.defaultBackground,
        borderRadius: 50,
        padding: widthToDp(1.5),
        justifyContent: "center",
        alignItems: "center"
    },
    modalHeading: {
        width: "90%",
        padding: widthToDp(1),
        paddingLeft: 0,
        marginBottom: heightToDp(1),
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        alignItems: "center",
        justifyContent: "center"
    },
    takenDropdown: {
        width: "62%",
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        color: Colors.primaryTextColor,
        paddingVertical: heightToDp(1.5),
        paddingHorizontal: widthToDp(2),
        justifyContent: "space-between",
        marginLeft: widthToDp(2)
    },
    inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        width: '30%',
        alignSelf: 'center',
        padding: widthToDp(4),
        paddingVertical: widthToDp(2),
    },
    viewReportClosebtn: {
        backgroundColor: Colors.boxBackground,
        marginHorizontal: widthToDp(2),
        padding: widthToDp(2),
        borderRadius: 50,
        alignSelf: "flex-end",
    },
    modalBottomBtn: {
        marginTop: heightToDp(2),
        width: "100%",
        flexDirection: "row",
        justifyContent: "center"
    },
    modalBtnConfirmation: {
        width: "30%",
        height: heightToDp(6),
        marginHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
});
export default MedicineReminders;