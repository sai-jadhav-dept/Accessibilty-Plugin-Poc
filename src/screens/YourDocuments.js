import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, Image, StyleSheet, PermissionsAndroid, ToastAndroid, SafeAreaView, ActivityIndicator } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import CommonButton from '../components/CommonButton';
import DocumentSideBarMenu from '../components/DocumentSideBarMenu';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS } from 'react-native-permissions';
import moment from 'moment';
import RNFS from 'react-native-fs';
import { Dropdown } from 'react-native-element-dropdown';
import ReportType from '../assets/mdm/ReportType.json';
import CalendarPicker from 'react-native-calendar-picker';
import WarningModal from '../components/WarningModal';
import { moderateScale, scale } from 'react-native-size-matters';
import FieldLabel from '../components/FieldLabel';
import Loader from '../components/Loader';
import Spinner from 'react-native-loading-spinner-overlay';
import { apiCall } from '../utils/ApiUtils';
import Global from './Global';
import DocumentPicker from 'react-native-document-picker';
import { Permission, uploadFileToS3 } from '../utils/CommonFunctions';
import ToastMessage from '../components/ToastMessage';
import Pdf from 'react-native-pdf';

const YourDocuments = (props) => {
    const [filteredReports, setFilteredReports] = useState(getDocs());
    const [docTypeId, setDocTypeId] = useState("1");
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [viewingType, setViewingType] = useState("");
    let [refreshing, setRefreshing] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState({
        reportType: "Consultation",
        reportId: "1"
    });
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [reportReName, setReportReName] = useState('');
    const [SelectedStartDate, setSelectedStartDate] = useState({
        selectedDatestring: moment(new Date()).format('DD/MM/YYYY'),
        selectedDateObj: new Date()
    });
    let [selectedDocument, setSelectedDocument] = useState(null);
    let [showUploadDocPrimaryModal, setShowUploadDocPrimaryModal] = useState(false);
    let [showUploadDocSecondaryModal, setShowUploadDocSecondaryModal] = useState(false);
    const [showViewFile, setShowViewFile] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Filter');
    const [selectedFileUri, setSelectedFileUri] = useState("");
    let [showFilterOptions, setShowFilterOptions] = useState(false)
    let [selectedMoreOption, setSelectedMoreOption] = useState(undefined)
    let [showRenameModal, setShowRenameModal] = useState(false)
    const [selectedDocData, setSelectedDocData] = useState({
        id: 0,
        key: 1,
        documentName: '',
        documentDate: '',
        documentTime: '',
        documentType: '',
    });
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [docUrl, setDocUrl] = useState("");
    const [fileType, setFileType] = useState("");
    const [fileTypeS3, setFileTypeS3] = useState("");
    const [dateFilter, setDatefilter] = useState([]);
    const [showRenameDatePickerModal, setShowRenameDatePickerModal] = useState(false);
    const [reportTypeMapped, setReportTypeMapped] = useState(ReportType[selectedMenu]?.map(function (e) {
        return ({ label: e.type, value: e.id });
    }) || []);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessageText, setToastMessageText] = useState("");

    useEffect(() => {
        GetTreatmentCycleReportsList();
    }, [props.dropdownValue]);

    function getDocs() {
        return filteredReports?.filter((item) => {
            if (item.documentType == selectedMenu.reportType) {
                return true;
            }
            return false;
        });
    }

    const selectPhoto = (options) => {
        launchImageLibrary(options, response => {
            if (response.didCancel || response.errorCode == 'camera_unavailable' || response.errorCode == 'permission' || response.errorCode == 'others') {
                return;
            }
            const size = response.assets[0].fileSize;
            const type = response.assets[0].type;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxSizeInBytes = 10 * 1024 * 1024;

            if (checkFileType(type, allowedTypes) && checkFileSize(size, maxSizeInBytes)) {
                const theType = response.assets[0].type.split("/")[1];
                setFileTypeS3(response.assets[0].type);
                setFileType(theType);
                setDocUrl(response.assets[0].uri);
                setShowUploadDocSecondaryModal(true);
            } else {
                DisplayError('Please choose a valid image (JPEG or PNG) and ensure it is not larger than 5MB.');
            }
        });
    }

    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const currentTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
    const ApiDocList = [
        { "iconGroup": "FontAwesome", "iconName": "stethoscope", "id": "1", "name": "Consultation" },
        { "iconGroup": "MaterialCommunityIcons", "iconName": "radiology-box-outline", "id": "2", "name": "Radiology" },
        { "iconGroup": "FontAwesome", "iconName": "flask", "id": "3", "name": "Laboratory" },
        { "iconGroup": "Foundation", "iconName": "page-export", "id": "4", "name": "Discharge" }
    ];
    let filterData = [
        {
            id: 0,
            key: 1,
            optionTitle: 'Date',
            isSelected: false,
        },
        {
            id: 1,
            key: 2,
            optionTitle: 'Date',
            isSelected: false,
        },
        {
            id: 2,
            key: 3,
            optionTitle: 'A to Z',
            isSelected: false,
        },
        {
            id: 3,
            key: 4,
            optionTitle: 'Z to A',
            isSelected: false,
        },
    ];

    const DisplayError = (text) => {
        setWarningText(text)
        if (Global.OS == "ios") {
            setShowUploadDocSecondaryModal(false);
            setTimeout(() => {
                setShowModal(true);
            }, 100);
        } else {
            setShowModal(true);
        }
    }

    const handleDatePicker = (isRenameModal) => {
        if (isRenameModal) {
            setShowRenameModal(false);
            setTimeout(() => {
                setShowRenameDatePickerModal(true);
            }, 100);
        } else {
            setShowUploadDocSecondaryModal(false);
            setTimeout(() => {
                setShowDatePickerModal(true);
            }, 100);
        }
    }

    const handleDateChange = (date, isRenameModal) => {
        setSelectedStartDate({
            selectedDatestring: moment(date).format('DD/MM/YYYY'),
            selectedDateObj: date
        });

        if (isRenameModal) {
            setShowRenameDatePickerModal(false);
            setShowRenameModal(true);
        } else {
            setShowDatePickerModal(false);
            setShowUploadDocSecondaryModal(true);
        }

        selectedDocData.reportDate = moment(date).format('DD/MM/YYYY');
        const updatedName = reportReName.replace(/^\d{2}\/\d{2}\/\d{4}/, moment(date).format('DD/MM/YYYY'));
        setReportReName(updatedName);
    }

    const handleCalandarClose = () => {
        setShowDatePickerModal(false);
        setShowUploadDocSecondaryModal(true);
    }

    const handleRenameCalandarClose = () => {
        setShowRenameDatePickerModal(false);
        setShowRenameModal(true);
    }

    const Renamebyid = async (id) => {
        let updateName = SelectedStartDate.selectedDatestring + `-` + selectedType.replace(/\s+/g, '-') + `-` + selectedMenu.reportType + "-Report";
        await UpdateTreatmentCycleReports(updateName);
        await GetReportTypeList();
        filteredReports.find((value) => {
            if (id == value.id) {
                value.documentName = reportReName
                value.documentDate = selectedDocData.reportDate
                value.documentType = selectedDocData.reportTypeType
                setShowDatePickerModal(false);
            }
        })
        await GetTreatmentCycleReportsList();
    }

    const filterbyid = (id) => {
        filterData.forEach((value) => {
            if (id == value.id) {
                setShowFilterOptions(!showFilterOptions);
                value.isSelected = true;
            } else if (id == -1) {
                value.isSelected = false;
            } else {
                value.isSelected = false;
            }
        })
    }

    const GetReportTypeList = async (check) => {
        try {
            const body = {
                "documentTypeId": docTypeId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await triggerApiCall('documents/getreporttypelist', body);
            const apiReportType = response.reportType.map((e) => {
                return {
                    label: e.name,
                    value: e.id
                }
            });
            setReportTypeMapped(apiReportType);
            setLoading(false);
            if (check == "rename") {
                setShowRenameModal(true);
            }
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        GetTreatmentCycleReportsList();
    }, [selectedMenu]);

    const GetTreatmentCycleReportsList = async () => {
        try {
            const body = {
                "treatmentCycleId": Global.selectedCycle,
                "documentTypeId": docTypeId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await triggerApiCall('documents/gettreatmentcyclereportslist', body);
            setFilteredReports(response.reports);
            setLoading(false);
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const AddTreatmentCycleReports = async () => {
        try {
            const body = {
                "userId": Global.userID,
                "treatmentCycleId": Global.selectedCycle,
                "documentTypeId": docTypeId,
                "reportTypeId": reportTypeMapped[0].value,
                "reportName": SelectedStartDate.selectedDatestring + "-" + selectedType + "-" + selectedMenu.reportType + "-" + 'Report',
                "reportDate": SelectedStartDate.selectedDatestring + ' ' + currentTime,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            if (Global.OS == "ios") {
                setshowUploadDocSecondaryModal(false);
            }
            setLoading(true);
            const response = await triggerApiCall('documents/addtreatmentcyclereports', body);
            const replacingSlash = SelectedStartDate.selectedDatestring + "-" + selectedType.replaceAll(" ", "-") + "-" + selectedMenu.reportType + "-" + 'Report';
            let data = {
                fileData: { uri: docUrl, type: fileTypeS3 },
                name: `.${fileType}`,
                keyPrefix: `REPORTS/` + `${Global.diseaseID}` + "/" + `${docTypeId}` + "/" + `${selectedMenu.reportType}` + "/" + `${response.id}` + "-" + replacingSlash.replaceAll("/", ""),
            }
            const uploadResponse = await uploadFileToS3(data.fileData, data.name, data.keyPrefix);
            const imageUrl = uploadResponse.body.postResponse.location
            console.log("imageurl", imageUrl);

            await uploadTreatmentCycleReports(response.id, imageUrl);
            setLoading(false);
            GetTreatmentCycleReportsList();
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const uploadTreatmentCycleReports = async (documentID, imageUrl) => {
        try {
            const body = {
                "id": documentID.toString(),
                "reportUrl": imageUrl,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            await triggerApiCall('documents/uploadtreatmentcyclereports', body);
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const UpdateTreatmentCycleReports = async (updateName) => {
        try {
            const body = {
                "userId": Global.userID,
                "reportId": selectedDocData.id,
                "reportTypeId": docTypeId,
                "reportName": updateName,
                "reportDate": selectedDocData.reportDate + " " + currentTime,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            await triggerApiCall('documents/updatetreatmentcyclereports', body);
            GetTreatmentCycleReportsList();
        }
        catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    const triggerApiCall = (endpoint, body, val) => {
        return new Promise(async (res, rej) => {
            try {
                const response = await apiCall(endpoint, body, val);
                res(response);
            } catch (error) {
                rej(error);
            }
        })
    }

    const checkFileSize = (fileSize, maxSize) => {
        return fileSize <= maxSize;
    };

    const checkFileType = (Type, allowedTypes) => {
        return allowedTypes.includes(Type);
    };

    const succescallbackfunction = (resolve, reject) => {
        resolve(true);
    }

    const failurecallbackfunction = (resolve, reject, message) => {
        if (message) {
            DisplayError(message);
        }
        resolve(false);
    }

    const requestExternalWritePermission = async () => {
        if (Global.OS === "android") {
            const permisionType = Global.androidVersion > 12 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
            if (await Permission(permisionType, "request", succescallbackfunction, failurecallbackfunction, "Photos")) {
                return;
            } else {
                return false
            }
        }
        else {
            if (await Permission(PERMISSIONS.IOS.PHOTO_LIBRARY, "request", succescallbackfunction, failurecallbackfunction, "Photos")) {
                return;
            } else {
                return false
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
            const maxSizeInBytes = 10 * 1024 * 1024;

            if (Global.OS === "ios" || (checkFileType(type, allowedTypes) && checkFileSize(size, maxSizeInBytes))) {
                const theType = response.assets[0].type.split("/")[1];
                setFileTypeS3(response.assets[0].type);
                setFileType(theType);
                setDocUrl(response.assets[0].uri);
                setShowUploadDocSecondaryModal(true);
            } else {
                DisplayError('Please choose a valid image (JPEG or PNG) and ensure it is not larger than 10MB.');
            }
        });
    }

    const selectFile = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            const size = result[0].size;
            const maxSizeInBytes = 10 * 1024 * 1024;
            if (checkFileSize(size, maxSizeInBytes)) {
                const theType = result[0].type.split("/")[1];
                setFileTypeS3(result[0].type);
                setFileType(theType);
                setDocUrl(result[0].uri);
                setShowUploadDocSecondaryModal(true);
            } else {
                DisplayError('The selected file is too large. Please choose a file under 10MB.');
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("User canceled the document picker");
            } else {
                console.log(err);
            }
        }
    }

    const checkPermission = async (permission, description) => {
        return await Permission(
            permission,
            "check",
            succescallbackfunction,
            failurecallbackfunction,
            description
        );
    };

    const requestPermission = async (permission, description) => {
        return await Permission(
            permission,
            "request",
            succescallbackfunction,
            failurecallbackfunction,
            description
        );
    };

    const handleImageSelection = async (type) => {
        let options = {
            saveToPhotos: true,
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: false,
        };
        if (type === "camera") {
            if (Global.OS === "ios") {
                if (
                    (await checkPermission(PERMISSIONS.IOS.CAMERA, "Camera")) ||
                    (await requestPermission(PERMISSIONS.IOS.CAMERA, "Camera"))
                ) {
                    if (
                        (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) ||
                        (await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos"))
                    ) {
                        takePhoto(options);
                    }
                }
            } else {
                const permissionTypeCapture =
                    Global.androidVersion > 12
                        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                if (
                    (await checkPermission(PERMISSIONS.ANDROID.CAMERA, "Camera")) ||
                    (await requestPermission(PERMISSIONS.ANDROID.CAMERA, "Camera"))
                ) {
                    if (
                        (await checkPermission(permissionTypeCapture, "Photos")) ||
                        (await requestPermission(permissionTypeCapture, "Photos"))
                    ) {
                        takePhoto(options);
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
                if (
                    (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) ||
                    (await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos"))
                ) {
                    selectPhoto(options);
                }
            } else {
                const permissionTypeSelect =
                    Global.androidVersion > 12
                        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                if (
                    (await checkPermission(permissionTypeSelect, "Photos")) ||
                    (await requestPermission(permissionTypeSelect, "Photos"))
                ) {
                    selectFile();
                }
            }
        }
    }

    const filterByoptions = (filter) => {
        if (filter === 'Reset') {
            const filterByDate = filteredReports.sort((a, b) => {
                const dateA = moment(a.reportDate, 'DD/MM/YYYY hh:mm A').startOf('day');
                const dateB = moment(b.reportDate, 'DD/MM/YYYY hh:mm A').startOf('day');
                return dateA.diff(dateB);
            });
            setDatefilter(filterByDate);

        } else {
            const filterByDate = filteredReports.sort((a, b) => {
                const dateA = moment(a.reportDate, 'DD/MM/YYYY hh:mm A').startOf('day');
                const dateB = moment(b.reportDate, 'DD/MM/YYYY hh:mm A').startOf('day');
                if (filter === 'Date') {
                    return dateA.diff(dateB);
                }
                if (filter === 'A to Z') {
                    return a.reportName.localeCompare(b.reportName);
                } else if (filter === 'Z to A') {
                    return b.reportName.localeCompare(a.reportName);
                }
            });
            setDatefilter(filterByDate);
        }
    };

    async function requestStoragePermission(fileData) {
        if (Global.OS === 'android') {
            const permissionType = Global.androidVersion > 12 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
            try {
                const granted = await PermissionsAndroid.request(
                    permissionType,
                    {
                        title: 'Image Permission',
                        message: 'HOPE App needs access to your images so you can download images.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    await getTreatmentCycleReports(fileData);
                } else {
                    console.log('Storage permission denied.');
                }
            } catch (err) {
                console.warn(err);
            }
        } else if (Global.OS === 'ios') {
            if (
                (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) ||
                (await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos"))
            ) {
                await getTreatmentCycleReports(fileData);
            }
        }
    }

    const handleShowAlert = (msg) => {
        setToastVisible(true);
        setToastMessageText(msg);
        setTimeout(() => {
            setToastVisible(false);
        }, 1500);
    };

    const ToastMessagerFunction = (msg) => {
        if (Global.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            handleShowAlert(msg)
        }
    }

    function getCurrentTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}${month}${day}_${hour}${minute}${seconds}`;
    }

    const getTreatmentCycleReports = async (data) => {
        try {
            const body = {
                "id": data.id,
                "coord": ["24.623061", "10.830960"],
                "location": "Mumbai",
                "deviceInfo": Global.OS,
            };
            setLoading(true);
            const response = await triggerApiCall('documents/gettreatmentcyclereports', body);
            const imageResponseUrl = response.base64;
            const extension = imageResponseUrl.split('.').pop();
            const name = data.reportName;
            const modifiedText = name.replace(/\//g, '-');
            const newModified = modifiedText.replace(" ", "-")
            const filename = `${newModified}_${getCurrentTimestamp()}`;
            const filePath = Global.OS === 'ios' ? `${RNFS.DocumentDirectoryPath}/${filename}.${extension}` : `${RNFS.DownloadDirectoryPath}/${filename}.${extension}`;
            const options = {
                fromUrl: imageResponseUrl,
                toFile: filePath,
                background: true,
                discretionary: true,
                cacheable: true,
            };
            const downloadResult = await RNFS.downloadFile(options).promise;
            setLoading(false);
            if (downloadResult.statusCode === 200) {
                ToastMessagerFunction("File downloaded successfully");
            } else {
                ToastMessagerFunction('Failed to download file');
            }
        } catch (error) {
            setLoading(false);
            if (error.status == "unknown") {
                DisplayError("File is processing, please try again later");
            } else {
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
    };

    const getViewImage = async (id) => {
        try {
            const body = {
                "id": id,
                "coord": ["24.623061", "10.830960"],
                "location": "Mumbai",
                "deviceInfo": Global.OS,
            };
            setLoading(true);
            const response = await apiCall('documents/gettreatmentcyclereports', body);
            const dataUri = response.base64;
            setSelectedFileUri(dataUri);
            setLoading(false);
            setShowViewFile(true);
        } catch (error) {
            setLoading(false);
            if (error.status == "unknown") {
                DisplayError("File is processing, please try again later");
            } else {
                DisplayError(error.msg || "Something went wrong, please try again");
            }
        }
    };

    const onSaveClick = async () => {
        if (selectedType == "") {
            DisplayError("Please select report type");
        }
        else {
            await AddTreatmentCycleReports();
            setShowUploadDocSecondaryModal(false);
            setRefreshing(true);
            setDatefilter(null);
            setDocUrl("");
        }
    }

    const handleFilterPress = (id, optionTitle) => {
        filterbyid(id);
        filterByoptions(optionTitle);
        setSelectedFilter(optionTitle);
    }

    const reportDate = selectedDocData.reportDate?.split(" ")[0];
    let dateObject;

    if (reportDate) {
        const momentDate = moment(reportDate, 'DD/MM/YYYY');
        if (momentDate.isValid()) {
            dateObject = momentDate.toDate();
        }
    }

    if (!dateObject) {
        dateObject = new Date();
    }

    const handleOnPress = () => {
        if (warningText != "Something went wrong, please try again" && Global.OS == "ios") {
            setShowUploadDocSecondaryModal(true);
        }
    }

    return (
        <View style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <View style={[GlobalStyles.rowSpaceBetween, { position: 'relative', zIndex: 999 }]}>
                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Your Documents</Text>
                    <Pressable
                        onPress={() => { setShowFilterOptions(!showFilterOptions) }}
                        style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                            opacity: pressed ? 0.5 : 1,
                            backgroundColor: Colors.boxBackground,
                            padding: widthToDp(2),
                            borderRadius: 14
                        }])}>
                        <Text style={[GlobalStyles.smallText, { marginRight: widthToDp(4) }, Fonts.Nunito_600SemiBold]}>
                            {selectedFilter}
                        </Text>
                        <VectorIcons groupName='MaterialCommunityIcons' iconName='filter-variant' iconsize={widthToDp(4)} iconstyle={{ color: Colors.primaryTextColor }} />
                    </Pressable>
                    {
                        showFilterOptions &&
                        <View style={[GlobalStyles.inputBoxShadow, {
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            backgroundColor: Colors.defaultBackground,
                            borderRadius: 14,
                            position: 'absolute',
                            top: widthToDp(10),
                            paddingHorizontal: widthToDp(2),
                            right: 0,
                            zIndex: 999
                        }]}>
                            {
                                filterData.map((item, index) =>
                                    <Pressable key={index}
                                        style={({ pressed }) => ([{
                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.defaultBackground,
                                            marginHorizontal: widthToDp(4),
                                            paddingTop: heightToDp(1),
                                            borderTopLeftRadius: index == 0 ? 14 : 0,
                                            borderTopRightRadius: index == 0 ? 14 : 0,
                                            flexDirection: "row"
                                        }])}
                                        onPress={() => { handleFilterPress(item.id, item.optionTitle) }}
                                    >
                                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.smallText, {
                                            color: item.isSelected ? Colors.primaryButtonColor : Colors.primaryTextColor
                                        }]}>
                                            {item.optionTitle}
                                        </Text>
                                        {
                                            item.optionTitle == "Date" &&
                                            <VectorIcons groupName='AntDesign' iconName={item.id == 0 ? 'arrowdown' : 'arrowup'} iconsize={widthToDp(5)} iconstyle={[{ color: Colors.primaryTextColor }]} />
                                        }
                                    </Pressable>
                                )
                            }
                            <View style={[{
                                borderBottomWidth: 1,
                                marginTop: heightToDp(1),
                                width: '90%',
                                alignSelf: 'center',
                                borderBottomColor: Colors.primaryinactive
                            }]} />
                            <Pressable
                                onPress={() => {
                                    handleFilterPress(-1, "Reset");
                                    setSelectedFilter('Filter')
                                    setShowFilterOptions(!showFilterOptions)
                                }}
                                style={{
                                    marginHorizontal: widthToDp(4),
                                    paddingTop: heightToDp(1),
                                    borderBottomLeftRadius: 14,
                                    borderBottomRightRadius: 14,
                                    marginBottom: heightToDp(1)
                                }}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.secondarybuttonColor }]}>
                                    Reset
                                </Text>
                            </Pressable>
                        </View>
                    }
                </View>
                <View style={[{ flexDirection: 'row', marginTop: heightToDp(2) }]}>
                    <View style={{ width: '28%' }}>
                        <DocumentSideBarMenu setShowFilterOptions={setShowFilterOptions} setSelectedFilter={setSelectedFilter} setselectedMoreOption={setSelectedMoreOption} menu={ApiDocList} setselectedMenu={setSelectedMenu} setDocTypeId={setDocTypeId} selectedMenu={selectedMenu} setDatefilter={setDatefilter} setselectedDocument={setSelectedDocument} setSelectedType={setSelectedType} />
                    </View>
                    <View style={[{ width: '70%', marginHorizontal: widthToDp(2) }]}>
                        <FlatList
                            data={filteredReports || dateFilter}
                            refreshing={refreshing}
                            contentContainerStyle={{ paddingBottom: heightToDp(12) }}
                            style={{ marginBottom: heightToDp(4) }}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => {
                                return (
                                    <Pressable
                                        onPress={() => {
                                            const fileExtension = item.reportName.split(".")[1]
                                            setViewingType(fileExtension);
                                            if (selectedDocument == index) {
                                                setSelectedDocument(undefined);
                                                setSelectedMoreOption(undefined)
                                            } else {
                                                setSelectedDocument(index);
                                                setSelectedMoreOption(undefined)
                                            }
                                        }}
                                        style={({ pressed }) => ([{
                                            opacity: pressed ? 0.5 : 1,
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                            backgroundColor: Colors.boxBackground,
                                            marginBottom: heightToDp(1.5),
                                            borderRadius: 14,
                                            position: 'relative',
                                            paddingVertical: heightToDp(2),
                                            paddingHorizontal: widthToDp(4)
                                        }])}>
                                        <View style={[GlobalStyles.rowSpaceBetween, { width: "100%" }]}>
                                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { width: "90%" }]}>
                                                {item.reportName}
                                            </Text>
                                        </View>
                                        <View style={[{
                                            flexDirection: 'row',
                                            justifyContent: 'space-evenly',
                                            alignItems: 'center',
                                            marginTop: heightToDp(0.2),
                                            width: '100%'
                                        }]}>
                                            <CommonButton
                                                onPress={async () => { await requestStoragePermission(item); }}
                                                buttonText="Download"
                                                extraStyles={{ width: '38%', height: heightToDp(3), backgroundColor: Colors.boxBackground }}
                                                extraTextStyles={GlobalStyles.buttonextrasmallText}
                                            />
                                            <CommonButton
                                                onPress={async () => { await getViewImage(item.id); }}
                                                buttonText="View File"
                                                extraStyles={{ width: '38%', height: heightToDp(3), backgroundColor: Colors.boxBackground }}
                                                extraTextStyles={GlobalStyles.buttonextrasmallText}
                                            />
                                            <CommonButton
                                                onPress={async () => {
                                                    await GetReportTypeList("rename");
                                                    setSelectedMoreOption(undefined);
                                                    setSelectedDocData(item);
                                                    setReportReName(item.reportName)
                                                }}
                                                buttonText="Modify"
                                                extraStyles={{ width: '35%', height: heightToDp(3), backgroundColor: Colors.boxBackground }}
                                                extraTextStyles={GlobalStyles.buttonextrasmallText}
                                            />
                                        </View>
                                        {
                                            (selectedMoreOption || selectedMoreOption == 0) && selectedMoreOption == index ?
                                                <View style={[GlobalStyles.inputBoxShadow, {
                                                    backgroundColor: Colors.boxBackground,
                                                    position: 'absolute',
                                                    zIndex: 999,
                                                    top: heightToDp(7),
                                                    right: widthToDp(4),
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    borderRadius: 14
                                                }]}>
                                                    <Pressable
                                                        onPress={async () => {
                                                            if (!Global.clicked) {
                                                                Global.clicked = true;
                                                                await GetReportTypeList("rename");
                                                                setSelectedDocData(item);
                                                                setSelectedMoreOption(undefined);
                                                                Global.clicked = false;
                                                            }
                                                        }}
                                                        style={({ pressed }) => ([{
                                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                                            padding: widthToDp(2),
                                                            borderRadius: 14
                                                        }])}>
                                                        <Text style={[{ color: Colors.primaryinactive, fontSize: scale(14) }, Fonts.Nunito_600SemiBold]}>
                                                            Modify
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                                :
                                                null
                                        }
                                    </Pressable>)
                            }}
                        />
                    </View>
                </View>
            </View>
            <View style={[{
                position: 'absolute',
                right: widthToDp(2),
                bottom: heightToDp(2)
            }]}>
                <Pressable
                    onPress={() => {
                        if (selectedMenu.reportType == ' ') {
                            DisplayError("Please select document type ");
                        }
                        else {
                            if (!Global.clicked) {
                                Global.clicked = true;
                                setShowUploadDocPrimaryModal(true);
                                GetReportTypeList();
                                setSelectedStartDate({
                                    selectedDatestring: moment(new Date()).format('DD/MM/YYYY'),
                                    selectedDateObj: new Date()
                                });
                                setSelectedDocument(undefined);
                                Global.clicked = false;
                            }
                        }
                    }}
                    style={({ pressed }) => ([{ opacity: pressed ? 0.6 : 1 }, GlobalStyles.inputBoxShadow, styles.fileUploadBtn])}>
                    <VectorIcons groupName='MaterialIcons' iconName='file-upload'
                        iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                    <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>Upload</Text>
                </Pressable>
            </View>
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={showUploadDocPrimaryModal}>
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
                        <View style={[GlobalStyles.rowSpaceBetween, { width: '90%' }]}>
                            <Text numberOfLines={1} style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { width: "90%" }]}>Upload Documents</Text>
                            <Pressable hitSlop={15}
                                onPress={() => setShowUploadDocPrimaryModal(false)}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.closeBtn])}
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
                                    setShowUploadDocPrimaryModal(false);
                                    setTimeout(() => {
                                        handleImageSelection("camera")
                                    }, Global.OS === "ios" ? 500 : 0);
                                }}
                                style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                    borderRadius: 14,
                                    width: '90%',
                                    padding: widthToDp(6)
                                }])}>
                                <VectorIcons groupName='FontAwesome' iconName='camera' iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(4) }]} />
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Take Photo</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setShowUploadDocPrimaryModal(false);
                                    setTimeout(() => {
                                        handleImageSelection("photo")
                                    }, Global.OS === "ios" ? 500 : 0);
                                }}
                                style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                    borderRadius: 14,
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
                            <Pressable
                                onPress={() => {
                                    setShowUploadDocPrimaryModal(false);
                                    setTimeout(() => {
                                        handleImageSelection("file")
                                    }, Global.OS === "ios" ? 500 : 0);
                                }}
                                style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                    backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                    borderRadius: 14,
                                    width: '90%',
                                    padding: widthToDp(6),
                                    marginTop: heightToDp(2),
                                    marginBottom: heightToDp(2)
                                }])}>
                                <VectorIcons groupName='FontAwesome' iconName='file'
                                    iconsize={widthToDp(5.5)}
                                    iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(4) }]}
                                />
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Open Files</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                visible={showUploadDocSecondaryModal}
                animationType={'slide'}>
                <View style={[{
                    flex: 1,
                    backgroundColor: Colors.modalBackground,
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }]}>
                    <View style={[{
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        backgroundColor: '#ececec',
                        paddingTop: heightToDp(1),
                        borderTopLeftRadius: 14,
                        borderTopRightRadius: 14
                    }]}>
                        <View style={[GlobalStyles.rowSpaceBetween, { width: '100%', paddingHorizontal: widthToDp(4) }]}>
                            <FieldLabel text={"Upload"} />
                            <Pressable hitSlop={15}
                                onPress={() => setShowUploadDocSecondaryModal(false)}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, marginTop: heightToDp(2) }, styles.closeBtn])}>
                                <VectorIcons groupName='Ionicons' iconName='close' iconsize={scale(20)} iconstyle={{ color: Colors.primaryTextColor }} />
                            </Pressable>
                        </View>
                        <View style={[{
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            backgroundColor: Colors.boxBackground,
                            borderRadius: 14,
                            width: '90%',
                            paddingVertical: heightToDp(2),
                            marginTop: heightToDp(2)
                        }]}>
                            <Image resizeMode='contain'
                                source={{ uri: docUrl }}
                            />
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText, {
                                marginLeft: widthToDp(4),
                                marginRight: widthToDp(4)
                            }]}>
                                {SelectedStartDate.selectedDatestring} {selectedType && `- ${selectedType} -`} {selectedMenu.reportType} Report
                            </Text>
                        </View>
                        <View style={[{
                            marginTop: heightToDp(2),
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.primaryinactive,
                            width: '90%'
                        }]} />
                        <View style={[{ justifyContent: 'flex-start', alignItems: 'flex-start', width: '90%' }]}>
                            <FieldLabel text="Report Date" />
                            <Pressable
                                onPress={() => handleDatePicker()}
                                style={({ pressed }) => ([GlobalStyles.rowSpaceBetween, {
                                    opacity: pressed ? 0.5 : 1,
                                    backgroundColor: Colors.boxBackground,
                                    width: '100%',
                                    paddingVertical: heightToDp(2),
                                    paddingHorizontal: widthToDp(4),
                                    borderRadius: 14,
                                    marginTop: heightToDp(2)
                                }])}>
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}>{SelectedStartDate.selectedDatestring}</Text>
                                <VectorIcons groupName='AntDesign' iconName="down" iconstyle={[{ color: Colors.placeholderTextColor }]} />
                            </Pressable>
                        </View>
                        <View style={[{
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '90%',

                        }]}>
                            <FieldLabel text="Choose Report Type" />
                            <Dropdown
                                dropdownPosition='top'
                                style={{
                                    marginTop: heightToDp(2),
                                    height: heightToDp(8),
                                    borderColor: Colors.primaryinactive,
                                    borderRadius: 14,
                                    paddingHorizontal: widthToDp(4),
                                    width: '100%',
                                    backgroundColor: Colors.boxBackground,
                                    color: Colors.primaryTextColor
                                }}
                                placeholderStyle={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}
                                selectedTextStyle={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}
                                placeholderTextColor={Colors.placeholderTextColor}
                                iconStyle={{ width: 30, height: 30 }}
                                iconColor={Colors.placeholderTextColor}
                                itemTextStyle={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText]}
                                data={reportTypeMapped}
                                placeholder={"Select Report Type"}
                                autoScroll={false}
                                maxHeight={300}
                                value={selectedType}
                                labelField="label"
                                valueField="label"
                                onChange={item => { setSelectedType(item.label); }}
                            />
                        </View>
                        <CommonButton buttonText="Save"
                            onPress={onSaveClick}
                            extraStyles={{
                                width: '90%',
                                marginTop: heightToDp(2),
                                marginBottom: heightToDp(2)
                            }} />
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                animationType={'slide'}
                visible={showRenameModal}>
                <SafeAreaView style={[{
                    flex: 1,
                    backgroundColor: Colors.modalBackground,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: '100%'
                }]}>
                    <View style={[{
                        backgroundColor: '#ececec',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        borderTopLeftRadius: 14,
                        borderTopRightRadius: 14,
                        paddingHorizontal: widthToDp(4)
                    }]}>
                        <View style={[GlobalStyles.rowSpaceBetween, { width: '100%' }]}>
                            <FieldLabel text={"Modify"} />
                            <Pressable hitSlop={15}
                                onPress={() => handleCalandarClose()}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1, marginTop: heightToDp(2) }, styles.closeBtn])}>
                                <VectorIcons groupName='Ionicons' iconName='close' iconsize={scale(20)} iconstyle={{ color: Colors.primaryTextColor }} />
                            </Pressable>
                        </View>
                        <View style={[{ justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }]}>
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText, {
                                marginLeft: widthToDp(4),
                                marginRight: widthToDp(4)
                            }]}>
                                {SelectedStartDate.selectedDatestring} {selectedType ? `- ${selectedType} -` : selectedDocData?.reportName?.split('-')[1] + "-" + selectedDocData?.reportName?.split('-')[2] + "-"} {selectedMenu.reportType} Report
                            </Text>
                        </View>
                        <View style={[{
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.primaryinactive,
                            marginTop: heightToDp(2),
                            width: '100%'
                        }]} />
                        <View style={[{ justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }]}>
                            <FieldLabel TextType={"large"} text={"Choose Date"} />
                            <Pressable
                                onPress={() => handleDatePicker(true)}
                                style={({ pressed }) => ([GlobalStyles.mediumText, GlobalStyles.rowSpaceBetween, {
                                    opacity: pressed ? 0.5 : 1,
                                    backgroundColor: Colors.boxBackground,
                                    width: '100%',
                                    paddingVertical: heightToDp(2),
                                    paddingHorizontal: widthToDp(4),
                                    borderRadius: 14,
                                    marginTop: heightToDp(2)
                                }])}>
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}>{selectedDocData.reportDate?.split(' ')[0]}</Text>
                                <VectorIcons groupName='AntDesign' iconName='down' iconstyle={[{ color: Colors.primaryTextColor, marginRight: widthToDp(1) }]} />
                            </Pressable>
                        </View>
                        <View style={[{ justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }]}>
                            <FieldLabel text="Choose Report Type" />
                            <Pressable
                                style={({ pressed }) => ([
                                    GlobalStyles.rowSpaceBetween, {
                                        opacity: pressed ? 0.5 : 1,
                                        backgroundColor: Colors.boxBackground,
                                        width: '100%',
                                        paddingVertical: heightToDp(2),
                                        paddingHorizontal: widthToDp(4),
                                        borderRadius: 14,
                                        marginTop: heightToDp(2)
                                    }])}>
                                <Dropdown
                                    dropdownPosition='top'
                                    style={{
                                        height: heightToDp(4),
                                        borderColor: Colors.primaryinactive,
                                        borderRadius: 14,
                                        paddingLeft: 2,
                                        width: '100%',
                                        backgroundColor: Colors.boxBackground,
                                        color: Colors.primaryTextColor
                                    }}
                                    placeholderStyle={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}
                                    selectedTextStyle={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}
                                    placeholderTextColor={Colors.placeholderTextColor}
                                    iconStyle={{ width: 30, height: 30 }}
                                    itemTextStyle={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText,]}
                                    data={reportTypeMapped}
                                    iconColor={{ color: Colors.placeholderTextColor }}
                                    placeholder={selectedDocData?.reportName?.split("-")[1] + "-" + selectedDocData?.reportName?.split("-")[2]}
                                    autoScroll={false}
                                    maxHeight={300}
                                    value={selectedType}
                                    labelField="label"
                                    valueField="label"
                                    onChange={item => {
                                        setSelectedType(item.label);
                                    }} />
                            </Pressable>
                        </View>
                        <CommonButton
                            onPress={async () => {
                                setShowRenameModal(false);
                                await Renamebyid(selectedDocData.id);
                            }}
                            buttonText="Save"
                            extraStyles={{
                                width: '100%',
                                marginTop: heightToDp(2),
                                marginBottom: heightToDp(2)
                            }} />
                    </View>
                </SafeAreaView>
            </Modal>
            <Modal
                visible={showDatePickerModal}
                animationType={'fade'}
                transparent={true}>
                <View style={[GlobalStyles.columnCenter, styles.modalcontainer]}>
                    <View style={styles.boxcontainer}>
                        <View style={styles.selectcontainer}>
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
                            onDateChange={(e) => handleDateChange(e, false)}
                            selectedStartDate={dateObject}
                            initialDate={dateObject}
                            maxDate={new Date()}
                        />
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showRenameDatePickerModal}
                animationType={'fade'}
                transparent={true}>
                <View style={[GlobalStyles.columnCenter, styles.modalcontainer]}>
                    <View style={styles.boxcontainer}>
                        <View style={styles.selectcontainer}>
                            <Pressable
                                hitSlop={15}
                                onPress={() => handleRenameCalandarClose()}
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
                            onDateChange={(e) => handleDateChange(e, true)}
                            selectedStartDate={dateObject}
                            initialDate={dateObject}
                            maxDate={new Date()}
                        />
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showViewFile}
                animationType={'fade'}
                transparent={false}>
                <SafeAreaView style={{ flex: 1 }}>
                    <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Pressable onPress={() => { setShowViewFile(false); }}
                            style={({ pressed }) => ([styles.viewReportClosebtn, { opacity: pressed ? 0.5 : 1 }])}
                        >
                            <VectorIcons groupName={"Ionicons"} iconName={"close"} iconsize={scale(18)} iconstyle={{ color: Colors.primaryTextColor }} />
                        </Pressable>
                        <View style={{ alignSelf: "center", width: '95%', backgroundColor: Colors.textInputBorder, height: '95%' }}>
                            {selectedFileUri ?
                                ((fileType == "pdf" || viewingType == "pdf") ?
                                    <Pdf
                                        renderActivityIndicator={() => <>
                                            <ActivityIndicator size="large" color={Colors.primaryButtonColor} />
                                        </>}
                                        onStartShouldSetResponder={() => true}
                                        trustAllCerts={false}
                                        source={{ uri: selectedFileUri, cache: true }}
                                        style={styles.pdf}
                                    />
                                    :
                                    <Image source={{ uri: selectedFileUri }} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
                                ) : (
                                    <View style={{ width: "100%", height: "100%", backgroundColor: Colors.textInputBorder, justifyContent: "center", alignItems: "center" }}>
                                        <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>No image</Text>
                                    </View>
                                )
                            }
                        </View>
                    </Pressable>
                </SafeAreaView>
            </Modal>
            <ToastMessage visible={toastVisible} text={toastMessageText} extraStyles={{ marginBottom: "10%" }} />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} onPress={() => handleOnPress()} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    modalcontainer: {
        backgroundColor: Colors.modalBackground,
        flex: 1,
    },
    boxcontainer: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        width: '97%',
        paddingBottom: widthToDp(4),
    },
    selectcontainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    closeButton: {
        marginRight: 8,
        marginTop: widthToDp(4),
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        borderRadius: 50,
        alignItems: "center",
        height: moderateScale(30),
        width: moderateScale(30),
    },
    viewReportClosebtn: {
        backgroundColor: Colors.boxBackground,
        marginHorizontal: widthToDp(2),
        padding: widthToDp(2),
        borderRadius: 50,
        alignSelf: "flex-end",
    },
    moreVitalsStyle: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: Colors.boxBackground,
        marginBottom: heightToDp(2),
        borderRadius: 14,
        position: 'relative',
    },
    pdf: {
        flex: 1,
        width: '100%',
    },
    fileUploadBtn: {
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: heightToDp(2),
        paddingHorizontal: widthToDp(4)
    },
    closeBtn: {
        backgroundColor: Colors.boxBackground,
        padding: widthToDp(2),
        borderRadius: 50
    }
});
export default YourDocuments;