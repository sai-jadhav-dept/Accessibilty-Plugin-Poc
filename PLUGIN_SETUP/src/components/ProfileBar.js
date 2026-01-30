import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import GlobalStyles from '../utils/GlobalStyles';
import WarningModal from './WarningModal';
import FieldLabel from './FieldLabel';
import { scale } from 'react-native-size-matters';
import { Permission } from '../utils/CommonFunctions';
import Global from '../screens/Global';
import FastImage from 'react-native-fast-image';

const ProfileBar = (props) => {
    const navigation = useNavigation();
    let [imageUrl, setImageUrl] = useState("");
    const [pressDisable, setPressDisable] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }

    const checkFileSize = (fileSize, maxSize) => {
        return fileSize <= maxSize;
    };

    const checkFileType = (fileType, allowedTypes) => {
        return allowedTypes.includes(fileType);
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

    const takePhoto = (options) => {
        launchCamera(options, response => {
            checkImage(response);
        });
    }

    const selectPhoto = (options) => {
        launchImageLibrary(options, response => {
            checkImage(response);
        });
    }

    const checkImage = (response) => {
        if (response.didCancel || response.errorCode == 'camera_unavailable' || response.errorCode == 'permission' || response.errorCode == 'others') {
            return;
        }
        const size = response.assets[0].fileSize
        const type = response.assets[0].type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSizeInBytes = 10 * 1024 * 1024;
        if (Global.OS === "ios" || (checkFileType(type, allowedTypes) && checkFileSize(size, maxSizeInBytes))) {
            const uri = response.assets[0].uri;
            setImageUrl(uri);
            props.getimage(response.assets[0]);
        } else {
            DisplayError('Please choose a valid image (JPEG or PNG) and ensure it is not larger than 10MB.');
        }
    }

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

    const handleImageSelection = async (type) => {
        let options = {
            saveToPhotos: true,
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: false,
        };
        if (type === "camera") {
            if (Global.OS === "ios") {
                if (await checkPermission(PERMISSIONS.IOS.CAMERA, "Camera") ||
                    await requestPermission(PERMISSIONS.IOS.CAMERA, "Camera")) {

                    if (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos") ||
                        await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) {
                        takePhoto(options);
                    }
                }
            } else {
                const permissionTypeCapture = Global.androidVersion > 12
                    ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                    : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                if (await checkPermission(PERMISSIONS.ANDROID.CAMERA, "Camera") ||
                    await requestPermission(PERMISSIONS.ANDROID.CAMERA, "Camera")) {

                    if (await checkPermission(permissionTypeCapture, "Photos") ||
                        await requestPermission(permissionTypeCapture, "Photos")) {
                        takePhoto(options);
                    }
                }
            }
        } else {
            if (Global.OS === "ios") {
                if (await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos") ||
                    await requestPermission(PERMISSIONS.IOS.PHOTO_LIBRARY, "Photos")) {
                    selectPhoto(options);
                }
            } else {
                const permissionTypeSelect = Global.androidVersion > 12
                    ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                    : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                if (await checkPermission(permissionTypeSelect, "Photos") ||
                    await requestPermission(permissionTypeSelect, "Photos")) {
                    selectPhoto(options);
                }
            }
        }
    }

    const handlePatientPicture = () => {
        props.setshowOptionDropdown(false)
        if (!imageUrl) {
            handleImageSelection('camera');
        }
        else {
            setPressDisable(true);
        }
    }
    const handlePatientDetailsFormNavigation = () => {
        navigation.navigate("PatientDetailsForm", { UserData: props.userData, id: props.userData.id, fromScreen: "PatientDetails", viewRelation: true, setting: false });
    }

    const handleTakephotobutton = () => {
        props.setshowOptionDropdown(false);
        handleImageSelection('camera');
    }

    const handlePhotoLibraryButton = () => {
        props.setshowOptionDropdown(false);
        handleImageSelection("photo");
    }

    if (props.isProfileExists) {
        return (
            <View style={[styles.profileBarContainer, props.extraStyles]}>
                <View style={[styles.profileDescriptionText]}>
                    <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold]}>{props.userData.firstName} {props.userData.lastName}</Text>
                    {props.data.status === "Approved" || props.userStatus === "Approved" || props.userData.isRegistered !== "YES" ?
                        <Pressable
                            onPress={() => handlePatientDetailsFormNavigation()}
                            style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, { marginTop: heightToDp(1) }])}
                        >
                            <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>Edit Profile</Text>
                        </Pressable>
                        : null
                    }
                </View>
                <View style={{ flexDirection: 'column' }}>
                    <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, { overflow: "hidden", borderRadius: 50 }])}>
                        <FastImage
                            resizeMode={FastImage.resizeMode.cover}
                            style={{ width: widthToDp(15), height: widthToDp(15) }}
                            source={(props.data?.profilePicturePath || props.data?.profilePath) ? { uri: `${(props.data.profilePicturePath || props.data?.profilePath)}`, priority: FastImage.priority.high, cache: 'web' } : require("../assets/images/profile.png")}
                        />
                    </Pressable>
                </View>
            </View>
        )
    } else {
        return (
            <View style={[styles.container, props.extraStyles]}>
                <FieldLabel text={props.isPatientProfile ? "Patient's Picture" : "Picture"} extraStyles={[GlobalStyles.largeText, { marginBottom: widthToDp(1), marginTop: widthToDp(0) }]} />
                <View style={[styles.profileBarContainer, GlobalStyles.fixedTopSpacing]}>
                    <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])} onPress={() => handlePatientPicture()} disabled={pressDisable}>
                        <FastImage
                            resizeMode={FastImage.resizeMode.cover}
                            style={styles.profileImageSelector}
                            source={imageUrl ? { uri: `${imageUrl}`, priority: FastImage.priority.high, cache: 'web' } : props.image ? { uri: `${props.image}`, priority: FastImage.priority.high, cache: 'web' } : require("../assets/vectors/camera.png")}

                        />
                    </Pressable>
                    <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                    <Pressable
                        onPress={() => { props.setshowOptionDropdown((pre) => !pre); }}
                        style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, GlobalStyles.rowCenter, styles.button])}
                    >
                        <VectorIcons groupName='FontAwesome' iconName="camera" iconstyle={{ color: Colors.primaryButtonColor }} iconsize={scale(21)} />
                        <Text style={[GlobalStyles.buttonmediumText, styles.selectText, Fonts.Nunito_600SemiBold]}>Choose Photo</Text>
                    </Pressable>
                    {
                        props.showOptionDropdown ?
                            <Pressable style={[styles.boxcontainer, GlobalStyles.inputBoxShadow, { zIndex: 100 }]}>
                                <View>
                                    <Pressable onPress={() => handleTakephotobutton()}
                                        style={({ pressed },) => ([
                                            styles.Camera,
                                            {
                                                opacity: pressed ? 0.4 : 1,
                                                backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground
                                            }
                                        ])}>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Take Photo</Text>
                                    </Pressable>
                                </View>
                                <View>
                                    <Pressable
                                        onPress={() => handlePhotoLibraryButton()}
                                        style={({ pressed },) => ([
                                            styles.Camera, {
                                                opacity: pressed ? 0.4 : 1,
                                                backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                                borderTopWidth: 0,
                                                borderTopLeftRadius: 0,
                                                borderTopRightRadius: 0,
                                                borderBottomLeftRadius: 14,
                                                borderBottomRightRadius: 14
                                            }
                                        ])}
                                    >
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Photo Library</Text>
                                    </Pressable>
                                </View>
                            </Pressable>
                            : null
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create(
    {
        container: {
            width: '100%',
            flexDirection: 'column',
            marginTop: heightToDp(2),
            zIndex: 99
        },
        profileBarContainer: {
            width: '98%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        selectText: {
            marginLeft: 5
        },
        button: {
            position: 'relative',
            marginLeft: widthToDp(6),
            backgroundColor: Colors.boxBackground,
            paddingHorizontal: widthToDp(2),
            paddingVertical: heightToDp(2),
            borderRadius: 14,
        },
        profileImageSelector: {
            height: heightToDp(8),
            width: widthToDp(16),
            borderRadius: 50
        },
        profileDescriptionText: {
            flexDirection: 'column',
            width: '85%'
        },
        boxcontainer: {
            position: 'absolute',
            top: heightToDp(8),
            left: widthToDp(25),
            backgroundColor: Colors.boxBackground,
            borderRadius: 14,
        },
        Camera: {
            paddingHorizontal: widthToDp(6),
            paddingVertical: heightToDp(1),
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: 'rgba(60,60,67,0.1)',
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
        }
    }
)

export default ProfileBar;