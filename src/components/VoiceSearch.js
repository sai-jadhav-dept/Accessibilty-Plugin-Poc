import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Modal, Text, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Voice from '@react-native-voice/voice';
import { widthToDp, heightToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import { scale } from 'react-native-size-matters';
import Global from '../screens/Global';
import { Permission } from '../utils/CommonFunctions';
import { PERMISSIONS } from 'react-native-permissions';
import WarningModal from './WarningModal';

const VoiceSearch = (props) => {
    const silenceTimer = useRef(null);
    const [searchText, setSearchText] = useState('');
    const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    let filterData = (value) => {
        if (value == "") {
            props.functionPropNameHere([]);
        } else {
            let filteredData = Global?.VoiceSearchedData?.filter(item => {
                if (item.name.toLowerCase().includes(value.toLowerCase())) {
                    return item;
                }
            });
            props.functionPropNameHere(filteredData);
        }
    }

    const onSpeechStartHandler = (e) => {
        console.log('e>onSpeechStartHandler =>', e);
    }

    const onSpeechEndHandler = (e) => {
        console.log('e>onSpeechEndHandler ', e);
        setShowVoiceSearchModal(false);
    }

    const onSpeechResultsHandler = (e) => {
        setSearchText(e.value[0].charAt(0).toUpperCase() + e.value[0].slice(1));
        setShowVoiceSearchModal(false);
        if (props.functionPropNameHere) {
            filterData(e.value[0].charAt(0).toUpperCase() + e.value[0].slice(1));
        }
        if (Global.OS == "ios") {
            clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(async () => {
                Voice.stop();
            }, 1000);
        }
    }


    useEffect(() => {
        Voice.onSpeechStart = onSpeechStartHandler;
        Voice.onSpeechEnd = onSpeechEndHandler;
        Voice.onSpeechResults = onSpeechResultsHandler;
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const requestMicrophonePermission = async () => {
        if (Global.OS === "android") {
            if (await Permission(PERMISSIONS.ANDROID.RECORD_AUDIO, "request", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                return;
            } else {
                return false
            }
        }
        else {
            if (await Permission(PERMISSIONS.IOS.MICROPHONE, "request", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                return;
            } else {
                return false
            }
        }
    };


    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }

    const permissionHandler = async () => {
        if (Global.OS === "ios") {
            if (await Permission(PERMISSIONS.IOS.MICROPHONE, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                if (await Permission(PERMISSIONS.IOS.MICROPHONE, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                    onVoiceSearchBtnClick();
                } else {
                    await requestMicrophonePermission();
                    if (await Permission(PERMISSIONS.IOS.MICROPHONE, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                        onVoiceSearchBtnClick();
                    }
                }
            } else {
                await requestMicrophonePermission();
                if (await Permission(PERMISSIONS.IOS.MICROPHONE, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                    onVoiceSearchBtnClick();
                } else {
                    if (await Permission(PERMISSIONS.IOS.MICROPHONE, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                        onVoiceSearchBtnClick();
                    }
                }
            }
        } else {
            if (await Permission(PERMISSIONS.ANDROID.RECORD_AUDIO, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                if (await Permission(PERMISSIONS.ANDROID.RECORD_AUDIO, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                    onVoiceSearchBtnClick();
                } else {
                    await requestMicrophonePermission();
                    if (await Permission(PERMISSIONS.ANDROID.RECORD_AUDIO, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                        onVoiceSearchBtnClick();
                    }
                }
            } else {
                await requestMicrophonePermission();
                if (await Permission(PERMISSIONS.ANDROID.RECORD_AUDIO, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                    onVoiceSearchBtnClick();
                } else {
                    if (await Permission(PERMISSIONS.ANDROID.RECORD_AUDIO, "check", succescallbackfunction, failurecallbackfunction, "Microphone")) {
                        onVoiceSearchBtnClick();
                    }
                }
            }
        }
    }

    const succescallbackfunction = (resolve, reject) => {
        resolve(true);
    }

    const failurecallbackfunction = (resolve, reject, message) => {
        if (message && !showVoiceSearchModal) {
            DisplayError(message);
        }
        resolve(false);
    }

    const onVoiceSearchBtnClick = async () => {
        setSearchText('');
        setShowVoiceSearchModal(true);
        try {
            await Voice.start('en-US');
        } catch (error) {
            console.log(error, 'error');
        }
    }

    const handleisFilterNeed = () => {
        if (props.setshowFilterOptions) {
            props.setshowFilterOptions(!props.showFilterOptions);
        }
    }


    return (
        <View style={[styles.container, GlobalStyles.inputBoxShadow, props.extraStyles]}>
            {props.isSearchOutline ?
                <VectorIcons groupName='AntDesign' iconName={'search1'}
                    iconsize={widthToDp(5)}
                    iconstyle={[{ color: Colors.placeholderTextColor, marginRight: widthToDp(2) }]}
                />
                :
                props.ShowlocationIcon ? <VectorIcons groupName="Ionicons" iconName={"location-outline"}
                    iconsize={widthToDp(6)}
                    iconstyle={[{ color: Colors.placeholderTextColor, marginRight: widthToDp(2) }]}
                /> : null
            }
            <TextInput
                onChangeText={(value) => {
                    props.functionPropNameHere ?
                        filterData(value) : props?.getName(value)
                }}
                placeholder={props.placeholderText}
                keyboardType={props.keyboardType == 'numeric' ? 'numeric' : 'default'}
                defaultValue={searchText}
                placeholderTextColor={Colors.placeholderTextColor}
                style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { flex: 5 }]}
                maxLength={props.keyboardType == 'numeric' ? 10 : null}
                autoFocus={props.isAutofocusRequired ? true : false}
            />
            {props.isMicNeeded ?
                <Pressable
                    hitSlop={15}
                    onPress={permissionHandler}
                    style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                >
                    <VectorIcons groupName='Ionicons' iconName={props.isMicOutline ? 'mic-outline' : 'mic'}
                        iconsize={widthToDp(7)}
                        iconstyle={[{ color: props.isMicOutline ? Colors.primaryTextColor : Colors.primaryinactive }]}
                    />
                </Pressable>
                : null
            }
            {
                props.isFilterNeed ?
                    <Pressable
                        onPress={() => { handleisFilterNeed() }}
                        style={({ pressed }) => ([styles.button, props.filterExtraStyles, { opacity: pressed ? 0.4 : 1 }])}>
                        <VectorIcons groupName='Ionicons' iconName='filter' iconsize={widthToDp(6.5)} iconstyle={[{ color: Colors.primaryTextColor }, props.filterExtraStyles]} />
                    </Pressable>
                    :
                    null
            }
            {
                props.isSearchButtonNeed ?
                    <Pressable
                        keyboardShouldPersistTaps={"handled"}
                        onPress={() => {
                            props.onSearch()
                        }}
                        style={({ pressed }) => ([props.filterExtraStyles, { opacity: pressed ? 0.4 : 1, marginRight: widthToDp(2) }])}>
                        <VectorIcons groupName='FontAwesome' iconName='search' iconsize={widthToDp(6.5)} iconstyle={[{ color: Colors.primaryTextColor }, props.filterExtraStyles]} />
                    </Pressable>
                    :
                    null
            }
            <Modal
                visible={showVoiceSearchModal}
                transparent={true}
                animationType={"fade"}
            >
                <View style={[GlobalStyles.columnCenter, styles.modalcontainer]}>
                    <View style={styles.searchcontainer}>
                        <View style={styles.closeicon}>
                            <Pressable
                                onPress={() => setShowVoiceSearchModal(false)}
                                hitSlop={15}
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}
                            >
                                <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(25)} iconstyle={{ color: Colors.placeholderTextColor }} />
                            </Pressable>
                        </View>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Say Something...</Text>
                        <VectorIcons groupName='FontAwesome' iconName='microphone'
                            iconsize={scale(40)}
                            iconstyle={[{ color: props.isMicOutline ? Colors.primaryTextColor : Colors.primaryinactive }]}
                        />
                    </View>
                </View>
            </Modal>
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: widthToDp(4),
        paddingVertical: heightToDp(0.5),
        alignItems: 'center',
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
    },
    button: {
        marginLeft: widthToDp(4),
        backgroundColor: Colors.boxBackground,
        paddingHorizontal: widthToDp(2),
        paddingVertical: heightToDp(1),
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalcontainer: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
    },
    searchcontainer: {
        width: '80%',
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: widthToDp(4),
        paddingTop: heightToDp(1.5),
        paddingBottom: heightToDp(4),
    },
    closeicon: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    }
})

export default VoiceSearch;