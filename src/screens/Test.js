import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, StyleSheet, Modal } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Header from '../components/Header';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import Footer from '../components/Footer';
import moment from 'moment';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import CalendarPicker from 'react-native-calendar-picker';
import WarningModal from '../components/WarningModal';
import { moderateScale } from 'react-native-size-matters';
import Global from './Global';
import { Permission } from '../utils/CommonFunctions';

const Test = (props) => {
    const [imageUrl, setImageUrl] = useState("");
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [selectOne, setSelectOne] = useState("");
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState({
        selectedDatestring: moment(new Date()).format('DD/MM/YYYY'),
        selectedDateObj: new Date()
    });

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }
    const test = '';
    const selectedDocData = {
        id: 0,
        key: 1,
        documentName: '',
        documentDate: '',
        documentTime: '',
        documentType: '',
    }

    const succescallbackfunction = (resolve, reject) => {
        resolve(true);
    }

    const failurecallbackfunction = (resolve, reject, message) => {
        if (message) {
            DisplayError(message);
        }
        resolve(false);
    }

    const onDateChange = (date) => {
        setSelectedStartDate({
            selectedDatestring: moment(date).format('DD/MM/YYYY'),
            selectedDateObj: date
        });
        setShowDatePickerModal(false);
        selectedDocData.documentDate = moment(date).format('DD/MM/YYYY')
        test.split("-")[0] = moment(date).format('DD/MM/YYYY')
    };

    const requestPermission = async (permissionType, platformSpecificName) => {
        return await Permission(
            permissionType,
            "request",
            succescallbackfunction,
            failurecallbackfunction,
            platformSpecificName
        );
    };

    const checkPermission = async (permissionType, platformSpecificName) => {
        return await Permission(
            permissionType,
            "check",
            succescallbackfunction,
            failurecallbackfunction,
            platformSpecificName
        );
    };

    const takePhoto = (options) => {
        launchCamera(options, response => {
            checkImage(response);
        });
    }

    const checkFileType = (fileType, allowedTypes) => {
        return allowedTypes.includes(fileType);
    };

    const checkImage = (response) => {
        if (response.didCancel || response.errorCode == 'camera_unavailable' || response.errorCode == 'permission' || response.errorCode == 'others') {
            setSelectOne("");
            return;
        }
        const type = response.assets[0].type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (checkFileType(type, allowedTypes)) {
            setImageUrl(response.assets[0].uri);
            navigation.navigate('ManualSelectDoctor', { TestName: props.route.params.TestName, Type: props.route.params.Type, imagePath: response.assets[0].uri, imagType: response.assets[0].type, TestTypeId: props.route.params.TestTypeId, subCategoryTypeData: props.route.params.subCategoryTypeData });
        } else {
            DisplayError('Please choose a valid image (JPEG or PNG).');
        }
    }

    const selectPhoto = (options) => {
        launchImageLibrary(options, response => {
            checkImage(response);
        });
    }

    const chooseFile = async (type) => {
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
                    selectPhoto(options);
                }
            }
        }
    }

    return (
        <SafeAreaView style={[GlobalStyles.mainContainer]}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={props.route.params.TestName}
                    onPress={() => { props.navigation.navigate("LabTest", { Type: props.route.params.TestName }) }}
                />
                <View style={{ marginTop: "5%" }}>
                    <Text style={[GlobalStyles.normalText, Fonts.Nunito_300Light]}>
                        {props?.route.params?.TestName} requires a prescription provided by a doctor. You may upload a new one or choose one from your saved prescriptions.
                    </Text>
                </View>
                <View style={{ marginTop: heightToDp(4) }}>
                    <View style={{ marginTop: heightToDp(2) }}>
                        <Pressable onPress={() => { chooseFile('camera'); }}
                            disabled={selectOne == "photo" ? true : false}
                            style={({ pressed }) => [GlobalStyles.selectBox, styles.Button, { opacity: pressed ? 0.5 : 1, alignItems: "center", alignSelf: "center" }]}
                        >
                            <View style={[styles.diseaseContainer, { alignItems: "center" }]}>
                                <View style={styles.BoxLeft}>
                                    <Text style={[Fonts.Nunito_600SemiBold, styles.diseaseText]}>Take Photo</Text>
                                </View>
                                <View style={styles.BoxRight}>
                                    <VectorIcons groupName="AntDesign" iconName="arrowright" iconstyle={styles.arrow} iconsize={29} />
                                </View>
                            </View>
                        </Pressable>
                    </View>
                    <View style={{ marginTop: "3%" }}>
                        <Pressable
                            onPress={() => {
                                setSelectOne("photo");
                                chooseFile("photo");
                            }}
                            style={({ pressed }) => [GlobalStyles.selectBox, styles.Button, { opacity: pressed ? 0.5 : 1, alignItems: "center", alignSelf: "center" }]}
                        >
                            <View style={[styles.diseaseContainer, { alignItems: "center" }]}>
                                <View style={styles.BoxLeft}>
                                    <Text style={[Fonts.Nunito_600SemiBold, styles.diseaseText]}>Open Gallery</Text>
                                </View>
                                <View style={styles.BoxRight}>
                                    <VectorIcons groupName="AntDesign" iconName="arrowright" iconstyle={styles.arrow} iconsize={29} />
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </View>
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
                                    style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.4 : 1 }]}>
                                    <VectorIcons groupName="Ionicons" iconName="close" iconsize={widthToDp(6)} iconstyle={[{ color: Colors.primaryTextColor }]} />
                                </Pressable>
                            </View>
                            <CalendarPicker
                                textStyle={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}
                                restrictMonthNavigation={true}
                                selectedDayColor={Colors.primaryButtonColor}
                                selectedDayTextColor={Colors.boxBackground}
                                selectedStartDate={selectedStartDate.selectedDateObj}
                                initialDate={selectedStartDate.selectedDateObj}
                                maxDate={new Date()}
                                onDateChange={onDateChange}
                            />
                        </View>
                    </View>
                </Modal>
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            </View>
            <Footer navigation={props.navigation} />
        </SafeAreaView>
    )
}
export default Test;

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
    diseaseText: [GlobalStyles.largeText, {
        lineHeight: heightToDp(5),
    }],
    BoxRight: {
        width: '18%',
        flexDirection: 'column'
    },
    arrow: {
        color: Colors.primaryButtonColor,
        marginLeft: widthToDp(6),
    },
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
    }
})