import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TextInput, FlatList, KeyboardAvoidingView } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import CommonButton from './CommonButton';
import GlobalStyles from '../utils/GlobalStyles';
import FieldLabel from '../components/FieldLabel'
import { scale } from 'react-native-size-matters';
import WarningModal from './WarningModal';
import Global from '../screens/Global';

export default function Confirmation(props) {
    const [reason, setReason] = useState('');
    const [displayError, setDisplayError] = useState(false);
    const [selectedReason, setSelectedReason] = useState('Unavoidable personal event');
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");

    const emogiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    const reasons = [
        {
            key: 0,
            reason: 'Unavoidable personal event',
        },
        {
            key: 1,
            reason: 'Illness (self or family members)',
        },
        {
            key: 2,
            reason: 'Emergency Medical Issues',
        },
        {
            key: 3,
            reason: 'Other',
        }
    ];

    useEffect(() => {
        setReason("");
    }, []);

    const handleCancelCrossbutton = () => {
        if (props.setShowConfirmationModal) {
            props.setShowConfirmationModal(false);
        } else {
            onSubmit();
        }
        setDisplayError(false);
    };

    const handleSelectedReason = (item) => {
        setSelectedReason(item.reason);
        setDisplayError(false);
    };

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const onSubmit = (text) => {
        if (props.confrimation) {
            if (text == "Yes") {
                props.action('Yes', reason);
            } else {
                props.action('No', reason);
            }
        } else {
            if (selectedReason == 'Other') {
                if (reason.trim() != '') {
                    if (!emogiRegex.test(reason)) {
                        props.action('Yes', reason);
                        setReason("");
                        setSelectedReason('Reason 1');
                    } else {
                        DisplayError("Please enter a Valid reason");
                    }
                }
                else {
                    setDisplayError(true);
                }
            } else {
                props.action('Yes', selectedReason);
                setReason("");
                setSelectedReason('Reason 1');
            }
        }
    }

    return (
        <>
            <Modal transparent={props.transparent} visible={props.visible}>
                <KeyboardAvoidingView
                    behavior={Global.OS === 'ios' ? 'padding' : null}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={[styles.modalHeading, GlobalStyles.largeText, Fonts.Nunito_600SemiBold]}>{props.modalHeading}</Text>
                                <View style={{ marginTop: -heightToDp(1) }}>
                                    <Pressable style={styles.modalCloseButton} onPress={() => handleCancelCrossbutton()}>
                                        <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(22)} iconstyle={{ color: Colors.placeholderTextColor }} />
                                    </Pressable>
                                </View>
                            </View>
                            <Text style={[GlobalStyles.smallText, styles.modalText, Fonts.Nunito_600SemiBold]}>{props.modalText}</Text>
                            {
                                props.confrimation ?
                                    <View style={styles.modalBottomBtn}>
                                        <CommonButton extraStyles={[styles.modalBtnConfirmation, Fonts.Nunito_600SemiBold]}
                                            buttonText={"Yes"}
                                            onPress={() => { onSubmit("Yes") }}>
                                        </CommonButton>
                                        <CommonButton extraStyles={[styles.modalBtnConfirmation, Fonts.Nunito_600SemiBold]}
                                            buttonText={"No"}
                                            onPress={onSubmit} >
                                        </CommonButton>
                                    </View>
                                    :
                                    (
                                        <View>
                                            <FieldLabel text={'Select Reason'} extraStyles={GlobalStyles.mediumText} mandatory={true} />
                                            <FlatList
                                                keyExtractor={(item, index) => "key" + index}
                                                data={reasons}
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
                                                        <Text style={[GlobalStyles.extrasmallText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>
                                                            {item.reason}
                                                        </Text>
                                                    </Pressable>
                                                }
                                            />
                                            {
                                                selectedReason == 'Other' &&
                                                <View style={{ width: "100%", marginTop: heightToDp(2) }}>
                                                    <TextInput
                                                        multiline={true}
                                                        numberOfLines={4}
                                                        value={reason}
                                                        maxLength={50}
                                                        placeholderTextColor={Colors.placeholderTextColor}
                                                        style={[GlobalStyles.loginEmailTextInput, GlobalStyles.inputBoxShadow, Fonts.Nunito_600SemiBold, styles.reasonInput]}
                                                        placeholder={"Write a Reason"}
                                                        onChangeText={text => { setReason(text); }}
                                                    />
                                                </View>
                                            }
                                            {displayError &&
                                                <Text style={[Fonts.Nunito_600SemiBold, { color: Colors.red, marginTop: heightToDp(2), fontSize: scale(14) }]}>*Please enter a valid reason</Text>
                                            }
                                            <View style={styles.modalBottomBtnBox}>
                                                <CommonButton extraStyles={[styles.modalBtn, Fonts.Nunito_600SemiBold, GlobalStyles.fixedTopSpacing]}
                                                    buttonText={"Submit"}
                                                    onPress={() => onSubmit("Yes")}>
                                                </CommonButton>
                                            </View>
                                        </View>
                                    )
                            }
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </>
    )
}
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.modalBackground,
        alignItems: "center",
        justifyContent: "center"
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
    modalHeading: {
        width: "80%",
        padding: widthToDp(1),
        marginBottom: heightToDp(1),
    },
    modalText: {
        alignSelf: "center",
        width: "95%",
        lineHeight: 20,
    },
    modalBtnConfirmation: {
        width: "30%",
        height: heightToDp(6),
        marginHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
    modalCloseButton: {
        backgroundColor: Colors.defaultBackground,
        borderRadius: 50,
        padding: widthToDp(1.5),
        justifyContent: "center",
        alignItems: "center"
    },
    modalBottomBtnBox: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    modalBottomBtn: {
        marginTop: heightToDp(2),
        width: "100%",
        flexDirection: "row",
        justifyContent: "center"
    },
    modalBtn: {
        width: "50%",
        height: heightToDp(6),
        paddingHorizontal: widthToDp(4),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14
    },
    reasonInput: {
        paddingHorizontal: widthToDp(6),
        marginTop: heightToDp(2),
        borderTopWidth: 0,
        height: 90,
        textAlignVertical: 'top',
    },
    reasonButton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: heightToDp(0.5)
    },
    ReasonContainer: {
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 1.5,
        borderColor: Colors.primaryButtonColor,
        justifyContent: 'center',
        alignItems: 'center',
    }
});