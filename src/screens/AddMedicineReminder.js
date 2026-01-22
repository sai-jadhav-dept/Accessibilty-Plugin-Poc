import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, StyleSheet, TextInput, Keyboard, KeyboardAvoidingView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import Header from '../components/Header';
import VectorIcons from '../components/VectorIcons';
import { Dropdown } from 'react-native-element-dropdown';
import Global from './Global';
import WarningModal from '../components/WarningModal';
import moment from 'moment';
import FieldLabel from '../components/FieldLabel';
import Loader from '../components/Loader';
import Spinner from 'react-native-loading-spinner-overlay';
import { apiCall } from '../utils/ApiUtils';
import MedicinesDateSelect from '../components/MedicinesDateSelect';
import { useNavigation } from '@react-navigation/native';
import TimePicker from '../components/TimePicker';
import { DeleteMasterData, GetMasterJSONData, InsertMasterData, InsertMasterDataTimeStamp, ValidateExpiry } from '../utils/ExecuteDBQuery';
import { Modal } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import { Permission, uploadFileToS3 } from '../utils/CommonFunctions';
import { launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { scale, verticalScale } from 'react-native-size-matters';

export default function AddMedicineReminder(props) {
    const navigation = useNavigation();
    const [medicineUnits, setMedicineUnits] = useState([]);
    const [medicineTypes, setMedicineTypes] = useState([]);
    const [selectedMedicineType, setSelectedMedicineType] = useState("");
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [prescriptionImage, setPrescriptionImage] = useState("");
    const [prescriptionImageType, setPrescriptionImageType] = useState("");
    const takeMedicine = [
        { name: "Empty Stomach" },
        { name: "Before Meal" },
        { name: "With Meal" },
        { name: "After Meal" },
        { name: "Before Sleep" }
    ];
    const [loading, setLoading] = useState(false);
    const routedData = props.route.params;
    const [dosage, setDosage] = useState("");
    const [unit, setUnit] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [medicationOnSaved, setMedicationOnSaved] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [timePickerVisibility, setTimePickerVisibility] = useState(false);
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dropdownTop, setDropdownTop] = useState(0);
    const [initialDropdownTop, setInitialDropdownTop] = useState(0);
    const frequencyTypes = [
        {
            "id": 1,
            "name": "Daily",
            "gap": "1"
        },
        {
            "id": 2,
            "name": "Once in two days",
            "gap": "2"
        },
        {
            "id": 3,
            "name": "Once in three days",
            "gap": "3"
        },
        {
            "id": 4,
            "name": "Once in week",
            "gap": "7"
        },
        {
            "id": 5,
            "name": "Custom",
            "gap": ""
        },
    ];

    const [notes, setNotes] = useState("");
    const [selectedFrequencyType, setSelectedFrequencyType] = useState(frequencyTypes[0].name);
    const [selectedFrequencyGap, setSelectedFrequencyGap] = useState(frequencyTypes[0].gap);
    const [selectedPrescritonId, setSelectedPrescritonId] = useState(3);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [search, setSearch] = useState('');
    const [searched, setSearched] = useState('');
    const [startNumber, setStartNumber] = useState(1);
    const [medicines, setMedicines] = useState([]);
    const [addtime, setAddtime] = useState([]);
    const [addedPhoto, setAddedPhoto] = useState([]);
    const openDocumentUploadModal = () => {
        setShowImageUpload((pre) => !pre);
    };
    const closeDocumentUploadModal = () => {
        setShowImageUpload(false);
    };

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }
    const handleCloseModal = () => {
        setMedicines([]);
        setStartNumber(1);
        setShowMoreModal(false);
    };

    const handleSearch = () => {
        if (selectedMedicineType == "") {
            DisplayError("Please select medicine type.");
        } else if (search.trim().length == 0) {
            DisplayError("Please enter medicine name.");
        }
        else if (search.trim().length < 3) {
            DisplayError("Please enter medicine name with at least three characters.");
        }
        else if (searched != search) {
            setMedicines([]);
            setStartNumber(1);
            setSearched(search);
            GetMedicationsList("1");
        }
    };

    const loadMoreItems = () => {
        GetMedicationsList()
    };

    const GetMedicationsList = async (startNum) => {
        try {
            const body = {
                "medicineTypeId": selectedMedicineType,
                "name": search.trim(),
                "startingNumber": startNum ? startNum : startNumber.toString(),
                "recordsCount": '100',
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": "android"
            }
            setLoading(true);
            let response = await triggerApiCall('medications/getmedicineslist', body, true);
            setLoading(false);
            if (response.medications.length == 0) {
                setMedicines([]);
                setStartNumber(1);
                setSearched('');
                return DisplayError("No Records Found");
            }
            setDropdownMedicineData(response.medications, response.totalRecords == response.nextValue);
            setStartNumber(response.nextValue == 0 ? 1 : response.nextValue);
            setShowMoreModal(true);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const triggerApiCall = (endpoint, body, cacheData) => {
        return new Promise(async (res, rej) => {
            try {
                const response = await apiCall(endpoint, body, cacheData);
                console.log("ttttttttttt", response);
                res(response);
            } catch (error) {
                rej(error);
            }
        })
    }

    const handleAddTime = () => {
        if (addtime.length < 15) {
            const newAddtime = addtime.slice();
            newAddtime.push({
                timeObject: new Date(),
                medicineTekan: addtime[addtime.length - 1]?.medicineTekan
            });
            setAddtime(newAddtime);
        }
    };

    const handleRemoveTime = index => {
        if (addtime.length > 1) {
            setAddtime(addtime.filter((textInput, i) => i !== index));
        }
    };

    const handleMedicineTekan = (tekanValue, index) => {
        addtime[index].medicineTekan = tekanValue;
    };

    const CreateMedication = async () => {
        try {
            const tekenTime = addtime.map((timeObj) => {
                return {
                    "time": moment(timeObj.timeObject).format("HH:mm"),
                    "take": timeObj.medicineTekan
                }
            });
            const body = {
                "userId": Global.userID,
                "treatmentCycleId": Global.selectedCycle.toString(),
                "prescriptionId": selectedPrescritonId.toString(),
                "startDate": moment(selectedDate).format('DD-MMM-YYYY'),
                "endDate": moment(endDate).format('DD-MMM-YYYY'),
                "dosage": selectedMedicineType !== "5" ? dosage.toString() + " " + unit.name : " ",
                "timing": tekenTime,
                "interval": selectedFrequencyGap.toString(),
                "note": notes.trim(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            if (notes.trim().length > 0) {
                body["note"] = notes.trim();
            }
            setLoading(true);
            const response = await apiCall('medications/createmedication', body);
            if (addedPhoto.length !== 0) {
                await imageUploading(response.id);
            }
            setLoading(false);
            setMedicationOnSaved(true);
            DisplayError("Medication saved succesfully");
            setUnit("");
            setDosage("");
            setSelectedDate("");
            setEndDate("");
        } catch (error) {
            console.log("rrrrrrrrrrrrrrrrrrrrrrrrrr", error);

            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const imageUploading = async (medicationId) => {
        try {
            setLoading(true);
            const filePath = `REPORTS/${Global.diseaseID}/${Global.selectedCycle}/${selectedPrescritonId}/${medicationId}`
            const res = await uploadFileToS3(prescriptionImage, `/Report.` + prescriptionImageType, filePath);
            let userImage = res.body.postResponse.location;
            await UploadPrescriptionImage(userImage, medicationId);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const UploadPrescriptionImage = async (userImage, medicationId) => {
        try {
            const body = {
                "medicationId": medicationId,
                "fileName": "Report",
                "filePath": userImage,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await apiCall('medications/createmedicationreport', body);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const onSavePrescription = async () => {
        let error = false;
        let errorMsg = "";
        function newFunction() {
            return "Please select medication end date";
        }
        addtime.forEach((value, i) => {
            if (value.medicineTekan === "" || value.medicineTekan == undefined) {
                error = true;
                errorMsg = "Choose time with time of medicine taking time Does not have to be empty.";
            }
        })
        if (selectedMedicineType == "") {
            DisplayError("Please select medicine type.");
        } else if (search == "") {
            DisplayError("Please select medicine");
        } else if (dosage.trim() == "" && selectedMedicineType !== "5" && (!/^\d{0,3}\.?\d{0,2}$/g.test(dosage) || /^0+$/.test(dosage))) {
            DisplayError("Please enter Dosage");
        } else if (selectedMedicineType !== "5" && (!/^\d{0,3}\.?\d{0,2}$/g.test(dosage) || /^0+$/.test(dosage))) {
            DisplayError("Please enter a Valid Dosage");
        } else if (selectedPrescritonId == "") {
            DisplayError("Please select correct medicine name");
        } else if (selectedMedicineType != "5" && unit == "") {
            DisplayError("Please select Unit");
        } else if (selectedDate == "") {
            DisplayError("Please select medication start date");
        } else if (!moment(selectedDate).isSame(endDate, 'day') && !/^\d{1,2}$/.test(selectedFrequencyGap.trim()) || selectedFrequencyGap == "0") {
            DisplayError("Please enter valid Frequency value for days");
        } else if (error) {
            DisplayError(errorMsg);
        } else if (endDate == "") {
            DisplayError(newFunction());
        } else if (endDate < selectedDate) {
            DisplayError("Start date should be before end Date.");
        } else if (addtime.length == 0) {
            DisplayError("Please add choose time.");
        } else {
            var timeDifference = new Date(endDate) - new Date(selectedDate);
            var daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            if (!moment(selectedDate).isSame(endDate, 'day') && daysDifference < selectedFrequencyGap) {
                DisplayError("Frequency value should be less than the difference in days.");
            } else {
                await CreateMedication();
            }
        }
    }

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    }

    const handleEndDate = (date) => {
        setEndDate(date);
    }

    useEffect(() => {
        setUnit("");
    }, [selectedMedicineType])

    const getmedicinetypelist = async () => {
        try {
            const body = {
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall("medications/getmedicinetypelist", body, true);
            await updateMasterData(response.medicineType);
            await setMedicineData(response.medicineType)
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const updateMasterData = async (data) => {
        try {
            if (DeleteMasterData('MedicineType')) {
                console.log('Deleted successfully');
                if (InsertMasterData('MedicineType', data, true)) {
                    console.log('Data Inserted');
                    if (InsertMasterDataTimeStamp('MedicineType')) {
                        console.log('Time Stamp updated successfully');
                    }
                }
            }
        } catch (error) {
            console.log("Error while inserting Master Data to MedicineType: " + error);
        }
    }

    const setMedicineData = async (data) => {
        const findValue = data.find((values) => values.name === "Capsules");
        const sortedData = data.sort((a, b) => {
            if (a.name === "Other") return 1;
            if (b.name === "Other") return -1;
            return a.name.localeCompare(b.name);
        });
        setMedicineTypes(sortedData);
        setMedicineUnits(findValue.units);
    }

    const getDataFromMaster = async () => {
        setLoading(true);
        if (await ValidateExpiry('MedicineType')) {
            await getmedicinetypelist();
        }
        else {
            let masterJsonData = await GetMasterJSONData('MedicineType');
            if (masterJsonData == []) {
                await getmedicinetypelist();
            }
            else {
                setMedicineData(JSON.parse(masterJsonData));
            }
            setLoading(false);
        }
    }

    useEffect(() => {
        getDataFromMaster();
    }, [])

    const setDropdownMedicineData = (data, noMoreRecords) => {
        setMedicines(prevMedicines => {
            if (prevMedicines.length != 0) {
                prevMedicines.pop();
            }
            if (noMoreRecords) {
                return prevMedicines.concat(data);
            }
            return prevMedicines.concat(data, [{ "id": -1, "name": "Load More" }])
        })
    }

    const requestExternalWritePermission = async () => {
        if (Global.OS === "android") {
            const permisionType = Global.androidVersion > 12 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
            if (await Permission(permisionType, "request", succescallbackfunction, failurecallbackfunction)) {
                return;
            } else {
                return false
            }
        }
        else {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "request", succescallbackfunction, failurecallbackfunction)) {
                return;
            } else {
                return false;
            }
        }
    };

    const takePhoto = (options) => {
        launchCamera(options, response => {
            if (response.didCancel || response.errorCode == 'camera_unavailable' || response.errorCode == 'permission' || response.errorCode == 'others') {
                return;
            }
            const size = response.assets[0].fileSize
            const type = response.assets[0].type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxSizeInBytes = 5 * 1024 * 1024;

            if (Global.OS === "ios" || (checkFileType(type, allowedTypes) && checkFileSize(size, maxSizeInBytes))) {
                const theType = response.assets[0].type.split("/")[1];
                setPrescriptionImageType(theType);
                setPrescriptionImage(response.assets[0]);
                setAddedPhoto([{ "name": "Prescription" }]);
            } else {
                DisplayError('Please choose a valid image (JPEG or PNG) and ensure it is not larger than 5MB.');
            }
        });
    }

    const selectFile = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            const type = result[0].type;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            const size = result[0].size;
            const maxSizeInBytes = 5 * 1024 * 1024;
            if (checkFileType(type, allowedTypes) && checkFileSize(size, maxSizeInBytes)) {
                const theType = result[0].type.split("/")[1];
                setPrescriptionImageType(theType);
                setPrescriptionImage(result[0]);
                setAddedPhoto([{ "name": "Prescription" }]);
            } else {
                DisplayError('Please choose a valid image (JPEG or PNG) and ensure it is not larger than 5MB.');
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("User canceled the document picker");
            } else {
                console.log(err);
            }
        }
    }

    const checkFileSize = (fileSize, maxSize) => {
        return fileSize <= maxSize;
    };

    const checkFileType = (fileType, allowedTypes) => {
        return allowedTypes.includes(fileType);
    };

    const requestCameraPermission = async () => {
        if (Global.OS === "android") {
            if (await Permission(PERMISSIONS.ANDROID.CAMERA, "request", succescallbackfunction, failurecallbackfunction)) {
                return;
            } else {
                return false
            }
        }
        else {
            if (await Permission(PERMISSIONS.IOS.CAMERA, "request", succescallbackfunction, failurecallbackfunction)) {
                return;
            } else {
                return false
            }
        }
    };

    const succescallbackfunction = (resolve, reject) => {
        resolve(true);
    }

    const failurecallbackfunction = (resolve, reject) => {
        resolve(false);
    }

    const handleImageSelection = async (type) => {
        let options = {
            saveToPhotos: true,
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: false,
        };
        if (type == "camera") {
            if (Global.OS === "ios") {
                if (await Permission(PERMISSIONS.IOS.CAMERA, "check", succescallbackfunction, failurecallbackfunction)) {
                    if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                        takePhoto(options);
                    } else {
                        await requestCameraPermission();
                        if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                            takePhoto(options);
                        }
                    }
                } else {
                    await requestCameraPermission();
                    if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                        takePhoto(options);
                    } else {
                        await requestExternalWritePermission();
                        if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                            takePhoto(options);
                        }
                    }
                }
            } else {
                const permisionTypeCaptue = Global.androidVersion > 12 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
                if (await Permission(PERMISSIONS.ANDROID.CAMERA, "check", succescallbackfunction, failurecallbackfunction)) {
                    if (await Permission(permisionTypeCaptue, "check", succescallbackfunction, failurecallbackfunction)) {
                        takePhoto(options);
                    } else {
                        await requestCameraPermission();
                        if (await Permission(permisionTypeCaptue, "check", succescallbackfunction, failurecallbackfunction)) {
                            takePhoto(options);
                        }
                    }
                } else {
                    await requestCameraPermission();
                    if (await Permission(permisionTypeCaptue, "check", succescallbackfunction, failurecallbackfunction)) {
                        takePhoto(options);
                    } else {
                        await requestExternalWritePermission();
                        if (await Permission(permisionTypeCaptue, "check", succescallbackfunction, failurecallbackfunction)) {
                            takePhoto(options);
                        }
                    }
                }
            }
        } else if (type == "file") {
            if (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos") ||
                await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) {
                selectFile();
            }
        } else {
            if (Global.OS === "ios") {
                if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                    selectPhoto(options);
                } else {
                    await requestExternalWritePermission();
                    if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "check", succescallbackfunction, failurecallbackfunction)) {
                        selectPhoto(options);
                    }
                }
            } else {
                const permisionTypeSelect = Global.androidVersion > 12 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
                if (await Permission(permisionTypeSelect, "check", succescallbackfunction, failurecallbackfunction)) {
                    selectFile();
                } else {
                    await requestExternalWritePermission();
                    if (await Permission(permisionTypeSelect, "check", succescallbackfunction, failurecallbackfunction)) {
                        selectFile();
                    }
                }
            }
        }
    }

    const selectedMedicine = (item) => {
        setSearch(item.name);
        setSelectedPrescritonId(item.id);
        setShowMoreModal(false);
        setSearched('');
        setMedicines([]);
        setStartNumber(1);
    }

    const modalVisibility = () => {
        setMedicines([]);
        setStartNumber(1);
        setShowMoreModal(false);
        setSearched('');
    }

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer]}>
            <Header
                headerTitle={"Add New Medicine"}
                onPress={() => navigation.navigate("TreatmentData", { ...routedData, selectedTab: "Medications" })}
                extraStyles={{ marginHorizontal: widthToDp(4), zIndex: 999 }}
            />
            <KeyboardAvoidingView behavior={Global.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
                <ScrollView
                    scrollEnabled={!showMoreModal}
                    onScroll={(event) => {
                        const y = event.nativeEvent.contentOffset.y;
                        setShowMoreModal(false);
                        setSearched('');
                        setMedicines([]);
                        setStartNumber(1);
                        setDropdownTop(initialDropdownTop - y);
                    }}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View>
                        <Pressable
                            onPress={() => { modalVisibility() }}
                            style={[{ paddingHorizontal: widthToDp(6) }]}>
                            <View>
                                <FieldLabel text={"Medicine Type"} mandatory={true} />
                                <Pressable style={[styles.inputContainer]}>
                                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor }]}
                                        selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        placeholderTextColor={Colors.primaryTextColor}
                                        iconStyle={{ width: 20, height: 20 }}
                                        itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        data={medicineTypes}
                                        placeholder={"Select Medicine Type"}
                                        autoScroll={false}
                                        maxHeight={300}
                                        value={selectedMedicineType}
                                        labelField="name"
                                        valueField="id"
                                        onChange={item => {
                                            setSelectedMedicineType(item.id);
                                            setMedicineUnits(item.units);
                                            setSearch("");
                                        }}
                                    />
                                </Pressable>
                            </View>
                            <View >
                                <FieldLabel text={"Medicine Name"} mandatory={true} />
                                <View
                                    onLayout={(event) => {
                                        const y = event.nativeEvent.layout.y;
                                        const height = event.nativeEvent.layout.height;
                                        const offset = 20;
                                        setDropdownTop(y + height - offset);
                                        setInitialDropdownTop(y + height - offset);
                                    }}
                                    style={[styles.container, GlobalStyles.inputBoxShadow]}
                                >
                                    <TextInput
                                        placeholder='Search Medicine'
                                        placeholderTextColor={Colors.placeholderTextColor}
                                        style={[styles.MedicinesInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        value={search}
                                        onChangeText={(value) => {
                                            setSearch(value);
                                            setMedicines([]);
                                            setStartNumber(1);
                                            setShowMoreModal(false);
                                            setSearched('');
                                            setSelectedPrescritonId('');
                                        }}
                                        onBlur={handleCloseModal}
                                    />
                                    <Pressable
                                        keyboardShouldPersistTaps={"handled"}
                                        onPress={() => { handleSearch() }}
                                        style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1, marginRight: widthToDp(3) }])}>
                                        <VectorIcons groupName='FontAwesome' iconName='search' iconsize={widthToDp(6.5)} iconstyle={[{ color: Colors.primaryTextColor }, props.filterExtraStyles]} />
                                    </Pressable>
                                </View>
                            </View>
                            {
                                selectedMedicineType !== "5" &&
                                <View>
                                    <FieldLabel text={"Dosage"} mandatory={true} />
                                    <FieldLabel TextType={"small"} Nospace={true} extraStyles={[Fonts.Nunito_400Regular, { marginTop: heightToDp(0.5) }]} text={"to be taken each time"} />
                                    <View style={styles.dosecontainer}>
                                        <TextInput
                                            keyboardType='numeric'
                                            placeholder='Enter Dosage'
                                            placeholderTextColor={Colors.placeholderTextColor}
                                            style={[styles.doseInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { width: "50%", fontSize: responsiveFont(21) }]}
                                            value={dosage}
                                            maxLength={5}
                                            onChangeText={(value) => {
                                                setDosage(value);
                                                if (value.length == 5 || value.length > 5) {
                                                    Keyboard.dismiss();
                                                }
                                            }}
                                        />
                                        <Pressable style={[styles.inputContainer, { marginTop: heightToDp(0), width: "50%" }]}>
                                            <Dropdown
                                                style={[styles.dropdown]}
                                                placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor, fontSize: responsiveFont(21) }]}
                                                selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                                placeholderTextColor={Colors.primaryTextColor}
                                                iconStyle={{ width: 20, height: 20 }}
                                                disable={selectedMedicineType == ""}
                                                itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                                data={medicineUnits}
                                                placeholder={"Unit"}
                                                autoScroll={false}
                                                maxHeight={300}
                                                value={unit.id}
                                                labelField="name"
                                                valueField="id"
                                                onChange={item => {
                                                    setUnit(item);
                                                }}
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            }
                            <View >
                                <FieldLabel text={"Medication Start Date"} extraStyles={{ marginVertical: heightToDp(2) }} mandatory={true} />
                                <MedicinesDateSelect onDateSelect={handleDateSelect} selectedDate={selectedDate} />
                            </View>
                            <View >
                                <FieldLabel text={"Medication End Date"} extraStyles={{ marginVertical: heightToDp(2) }} mandatory={true} />
                                <MedicinesDateSelect onDateSelect={handleEndDate} selectedDate={endDate} />
                            </View>
                            {!moment(selectedDate).isSame(endDate, 'day') &&
                                (<View>
                                    <FieldLabel text={"Frequency"} mandatory={true} />
                                    <Pressable style={[styles.inputContainer]}>
                                        <Dropdown
                                            style={styles.dropdown}
                                            placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor }]}
                                            selectedTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                            placeholderTextColor={Colors.primaryTextColor}
                                            iconStyle={{ width: 20, height: 20 }}
                                            itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                            data={frequencyTypes}
                                            placeholder={"Select Medicine"}
                                            autoScroll={false}
                                            maxHeight={300}
                                            value={selectedFrequencyType}
                                            labelField="name"
                                            valueField="name"
                                            onChange={(item) => {
                                                setSelectedFrequencyType(item.name);
                                                if (item.name === "Custom") setSelectedFrequencyGap("");
                                                else setSelectedFrequencyGap(item.gap);
                                            }}>
                                            <VectorIcons groupName='AntDesign' iconName='down' iconsize={widthToDp(4)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                        </Dropdown>
                                    </Pressable>
                                    {selectedFrequencyType == "Custom" && <View style={styles.pillsContainer}>
                                        <TextInput
                                            keyboardType='numeric'
                                            placeholder='Enter the number of days gap'
                                            placeholderTextColor={Colors.placeholderTextColor}
                                            style={[styles.doseInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { width: "100%" }]}
                                            value={selectedFrequencyGap}
                                            maxLength={2}
                                            onChangeText={(value) => {
                                                setSelectedFrequencyGap(value);
                                                if (value.length == 2) {
                                                    Keyboard.dismiss();
                                                }
                                            }}
                                        />
                                    </View>}
                                </View>)}
                            <TimePicker
                                timePickerVisibility={timePickerVisibility}
                                value={addtime[selectedTimeIndex]?.timeObject || new Date()}
                                setValue={(time) => {
                                    setAddtime(prevTime => {
                                        let newTime = [];
                                        for (let i = 0; i < prevTime.length; i++) {
                                            if (selectedTimeIndex == i) {
                                                newTime.push({ timeObject: new Date(time) });
                                            } else {
                                                newTime.push(prevTime[i]);
                                            }
                                        }
                                        return newTime;
                                    })
                                }}
                                setTimePickerVisibility={setTimePickerVisibility}
                            />
                            <View>
                                <FieldLabel text={"Choose Time"} mandatory={true} />
                                {
                                    addtime.map((values, i) => {
                                        return (
                                            <View style={[{ flexDirection: 'row', marginTop: heightToDp(2), marginBottom: heightToDp(1), justifyContent: "space-evenly", alignItems: "center" }]} key={i}>
                                                <Pressable
                                                    onPress={() => {
                                                        setTimePickerVisibility(true);
                                                        setSelectedTimeIndex(i);
                                                        Keyboard.dismiss();
                                                    }}
                                                    style={[styles.doseInput, { flexDirection: 'row', alignItems: "center", width: "37%" }]}>
                                                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginLeft: -widthToDp(1), fontSize: responsiveFont(18) }]}>
                                                        {moment(values.timeObject).format("hh:mm a")}
                                                    </Text>
                                                    <VectorIcons groupName='AntDesign' iconName='clockcircle' iconstyle={{ color: Colors.primaryButtonColor, marginLeft: widthToDp(2) }} iconsize={widthToDp(5)} />
                                                </Pressable>
                                                <View style={{ flex: 1, paddingRight: widthToDp(1) }}>
                                                    <Dropdown
                                                        numberOfLines={1}
                                                        style={styles.takenDropdown}
                                                        placeholderStyle={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor, paddingLeft: widthToDp(2), }]}
                                                        selectedTextStyle={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { paddingLeft: widthToDp(2) }]}
                                                        placeholderTextColor={Colors.primaryTextColor}
                                                        iconStyle={{ width: 10, height: 20, marginHorizontal: widthToDp(1) }}
                                                        data={takeMedicine}
                                                        placeholder={"Select"}
                                                        autoScroll={false}
                                                        maxHeight={300}
                                                        value={values.medicineTekan}
                                                        labelField="name"
                                                        valueField="name"
                                                        onChange={item => {
                                                            handleMedicineTekan(item.name, i);
                                                        }}
                                                    />
                                                </View>
                                                <Pressable style={{ marginLeft: widthToDp(1) }} onPress={() => { handleRemoveTime(i) }}>
                                                    <VectorIcons groupName='MaterialIcons' iconName='delete' iconstyle={{ color: Colors.primaryButtonColor }} />
                                                </Pressable>
                                            </View>
                                        )
                                    })
                                }
                                {
                                    addtime.length !== 15 &&
                                    <Pressable
                                        style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, styles.button, GlobalStyles.inputBoxShadow,])}
                                        onPress={() => { handleAddTime() }}>
                                        <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconstyle={{ color: Colors.primaryButtonColor }} />
                                        <Text style={[GlobalStyles.buttonmediumText, { marginLeft: widthToDp(2) }, Fonts.Nunito_700Bold]}>
                                            Add More Time
                                        </Text>
                                    </Pressable>
                                }
                                <FieldLabel text={"Additional Notes"} />
                                <View style={styles.NotesContainer}>
                                    <TextInput

                                        placeholder='Enter additional instructions from the doctor. (Maximum 500 Characters)'
                                        placeholderTextColor={Colors.placeholderTextColor}
                                        style={[styles.NotesInput, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                                        value={notes}
                                        maxLength={500}
                                        multiline={true}
                                        numberOfLines={4}
                                        onChangeText={setNotes}
                                    />
                                </View>
                                <FieldLabel text={"Upload Prescription"} />
                                <FieldLabel text={"(Max 5 MB file size and JPEG/PNG images allowed)"} extraStyles={[{ fontSize: responsiveFont(14), marginTop: 0 }]} />
                                {
                                    addedPhoto.map((values, i) => {
                                        return (
                                            <View style={{ flexDirection: "row", backgroundColor: Colors.boxBackground, padding: widthToDp(2), alignItems: "center", justifyContent: "space-between", borderRadius: 14, marginVertical: verticalScale(5), width: '100%', alignSelf: "center" }} key={i}>
                                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { padding: widthToDp(2) }]}>{values.name}</Text>
                                                <Pressable style={{ marginLeft: widthToDp(1) }} onPress={() => { setAddedPhoto([]) }}>
                                                    <VectorIcons groupName='MaterialIcons' iconName='delete' iconstyle={{ color: Colors.primaryButtonColor }} />
                                                </Pressable>
                                            </View>
                                        )
                                    })
                                }
                                {
                                    addedPhoto.length == 0 && (
                                        <Pressable
                                            style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, styles.button, GlobalStyles.inputBoxShadow,])}
                                            onPress={() => { openDocumentUploadModal(); }}>
                                            <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconstyle={{ color: Colors.primaryButtonColor }} />
                                            <Text style={[GlobalStyles.buttonmediumText, { marginLeft: widthToDp(2) }, Fonts.Nunito_700Bold]}>
                                                Attach File
                                            </Text>
                                        </Pressable>
                                    )
                                }
                            </View>
                        </Pressable>
                        <View style={[{ paddingHorizontal: widthToDp(4) }]}>
                            <CommonButton
                                onPress={onSavePrescription}
                                buttonText="Save Prescription"
                                visible={true}
                                extraStyles={{ marginTop: heightToDp(4), marginBottom: heightToDp(5) }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {
                showMoreModal &&
                <ScrollView keyboardShouldPersistTaps={'handled'} style={[styles.modalContent, GlobalStyles.inputBoxShadow, { top: dropdownTop }]}>
                    {
                        medicines.map((item, index) => {
                            return (
                                <Pressable style={{ alignItems: item.id == -1 ? "center" : null, paddingVertical: heightToDp(2), paddingHorizontal: widthToDp(4), zIndex: 999 }} onPress={() => {
                                    if (item.id == -1) {
                                        return loadMoreItems();
                                    }
                                    selectedMedicine(item);
                                }}>
                                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}>{item.name}</Text>
                                </Pressable>)
                        })
                    }
                </ScrollView>
            }
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText}
                onPress={() => {
                    if (medicationOnSaved) {
                        navigation.replace("TreatmentData", { selectedTab: "Medications" });
                    }
                }} />
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={showImageUpload}>
                <View style={[{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: Colors.modalBackground
                }]}>
                    <View style={[{
                        backgroundColor: '#eee',
                        width: '90%',
                        paddingVertical: heightToDp(2),
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        borderRadius: 14
                    }]}>
                        <View style={[{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '90%'
                        }]}>
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>Upload Documents</Text>
                            <Pressable hitSlop={15}
                                onPress={() => closeDocumentUploadModal()}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}
                            >
                                <VectorIcons groupName='Ionicons' iconName='close' iconstyle={{ color: Colors.placeholderTextColor }} iconsize={scale(22)} />
                            </Pressable>
                        </View>
                        <View style={[{
                            alignItems: 'center',
                            marginTop: heightToDp(4),
                            width: '100%'
                        }]}>
                            <Pressable
                                onPress={() => {
                                    closeDocumentUploadModal();
                                    setTimeout(() => {
                                        handleImageSelection("camera")
                                    }, Global.OS === "ios" ? 500 : 0);
                                }}
                                style={({ pressed }) => ([{
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                    borderRadius: 14,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    width: '90%',
                                    padding: widthToDp(6)
                                }])}>
                                <VectorIcons groupName='FontAwesome' iconName='camera' iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(4) }]} />
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Take Photo</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    closeDocumentUploadModal();
                                    setTimeout(() => {
                                        handleImageSelection("photo")
                                    }, Global.OS === "ios" ? 500 : 0);
                                }}
                                style={({ pressed }) => ([{
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                    borderRadius: 14,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    width: '90%',
                                    padding: widthToDp(6),
                                    marginTop: heightToDp(2),
                                    marginBottom: Global.OS == "ios" ? heightToDp(0) : heightToDp(2)
                                }])}>
                                <VectorIcons groupName='MaterialIcons' iconName='file-upload'
                                    iconsize={widthToDp(7)}
                                    iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(4) }]}
                                />
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Open {Global.OS == "ios" ? "Photos" : "Gallery"}</Text>
                            </Pressable>
                            {Global.OS == "ios" && <Pressable
                                onPress={() => {
                                    closeDocumentUploadModal();
                                    setTimeout(() => {
                                        handleImageSelection("file")
                                    }, Global.OS === "ios" ? 500 : 0);
                                }}
                                style={({ pressed }) => ([GlobalStyles.rowFlexstart, styles.modalIconContainerI, {
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                }])}>
                                <VectorIcons groupName='FontAwesome' iconName='file'
                                    iconsize={widthToDp(5.5)}
                                    iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(4), marginLeft: widthToDp(2) }]}
                                />
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Open Files</Text>
                            </Pressable>}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}
const styles = StyleSheet.create({
    inputContainer: {
        marginTop: heightToDp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(2),
        borderRadius: 14,
    },
    dosecontainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: heightToDp(2),
        width: '100%',
    },
    takenDropdown: {
        width: "100%",
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        color: Colors.primaryTextColor,
        paddingVertical: heightToDp(1.5),
        paddingHorizontal: widthToDp(2),
        justifyContent: "space-between"
    },
    doseInput: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        paddingVertical: heightToDp(2),
        marginRight: widthToDp(2),
        paddingLeft: widthToDp(4),
    },
    MedicinesInput: {
        flex: 6,
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        flexWrap: "wrap",
        paddingVertical: heightToDp(2),
        marginRight: widthToDp(2),
        textAlignVertical: "center",
    },
    NotesInput: {
        flex: 6,
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        marginRight: widthToDp(2),
        textAlignVertical: 'top',
        paddingLeft: widthToDp(4),
        minHeight: heightToDp(10),
        width: '100%',
    },
    pillsContainer: {
        marginTop: heightToDp(2),
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    medicationtypeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: widthToDp(1),
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(2),
        borderRadius: 14,
    },
    dropdown: {
        height: 30,
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: 8,
        width: '100%',
        backgroundColor: Colors.boxBackground,
        color: Colors.primaryTextColor,
        fontSize: responsiveFont(22)
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(2),
        borderRadius: 14,
        borderColor: Colors.secondarybuttonColor,
        marginVertical: heightToDp(1)
    },
    NotesContainer: {
        marginTop: heightToDp(2),
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(0.5),
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        position: "relative",
        marginTop: heightToDp(2)
    },
    loadMoreButtonStyle: {
        padding: 10,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: heightToDp(2),
    },
    mainDateContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        paddingVertical: heightToDp(2),
        paddingHorizontal: widthToDp(4),
        marginTop: heightToDp(2)
    },
    modalContent: {
        marginTop: heightToDp(25),
        maxHeight: heightToDp(50),
        overflow: "hidden",
        backgroundColor: Colors.defaultBackground,
        position: 'absolute',
        left: widthToDp(4),
        width: '90%',
    }
});