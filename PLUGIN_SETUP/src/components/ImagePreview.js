import React from 'react';
import { View, StyleSheet, Modal, Pressable, SafeAreaView } from 'react-native';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp, responsiveFont } from '../utils/Responsive';
import CommonButton from './CommonButton';
import { scale } from 'react-native-size-matters';
import VectorIcons from './VectorIcons';
import FieldLabel from './FieldLabel';
import FastImage from 'react-native-fast-image';

export default function ImagePreview(props) {

    const onSubmit = (text) => {
        if (text == "Yes") {
            props.action('Yes');
            props.setShowModal(false);
        } else {
            props.action('No');
            props.setShowModal(false);
        }
    }

    return (
        <Modal visible={props.showModal} animationType={'fade'} transparent={true}>
            <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
                <View style={{ flex: 1, backgroundColor: Colors.modalBackground }}>
                    <View style={styles.optionView}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "90%", marginBottom: heightToDp(1) }}>
                            <FieldLabel text={"Image Preview"} extraStyles={{ width: "90%", marginLeft: widthToDp(2) }} />
                            <Pressable onPress={() => { props.setShowModal(false); }}>
                                <VectorIcons groupName='Entypo' iconName='cross' iconstyle={[{
                                    marginTop: heightToDp(2), backgroundColor: Colors.defaultBackground,
                                    borderRadius: 50,
                                    padding: widthToDp(1),
                                    justifyContent: "center",
                                    alignItems: "center"
                                }]} />
                            </Pressable>
                        </View>
                        {
                            props?.imageResponse?.uri &&
                            <FastImage
                                resizeMode={FastImage.resizeMode.cover}
                                style={styles.profileimage}
                                source={{ uri: props.imageResponse.uri }}
                            />
                        }
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "70%", marginTop: heightToDp(2) }}>
                            <CommonButton
                                buttonText="Cancel"
                                onPress={() => {
                                    onSubmit("No");
                                }}
                                extraStyles={styles.button}
                                extraTextStyles={{
                                    fontSize: responsiveFont(20)
                                }}
                            />
                            <CommonButton
                                buttonText="OK"
                                onPress={() => {
                                    onSubmit("Yes")
                                }}
                                extraStyles={styles.button}
                                extraTextStyles={{
                                    fontSize: responsiveFont(20)
                                }}
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}
const styles = StyleSheet.create({
    optionView: {
        minHeight: heightToDp(24),
        width: widthToDp(80),
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: heightToDp(35),
        alignSelf: "center",
        shadowColor: Colors.primaryTextColor,
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
    },
    profileimage: {
        top: heightToDp(0.5),
        borderRadius: 50,
        height: scale(80),
        width: scale(80),
    },
    button: {
        alignSelf: 'center',
        width: widthToDp(20),
        height: heightToDp(6),
        marginBottom: heightToDp(2),

    }
});