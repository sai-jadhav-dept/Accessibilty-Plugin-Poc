import { View, Text, SafeAreaView, TextInput, ScrollView, Keyboard, Pressable } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { scale, ScaledSheet, verticalScale } from 'react-native-size-matters';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import VectorIcons from '../components/VectorIcons';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import Global from './Global';
import moment from 'moment';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import FastImage from 'react-native-fast-image';

export default function LatestDiscussion(props) {
    const navigation = useNavigation();
    const [dataArray, setDataArray] = useState([]);
    const [replyText, setReplyText] = useState('');
    const textInputRef = useRef(null);
    const [displayBottomButton, setDisplayBottomButton] = useState(true);
    const scrollRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const emogiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    useEffect(() => { GetDiscussionDetails() }, [])

    const GetDiscussionDetails = async () => {
        try {
            const body = {
                "forumId": props.route.params.selectedId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true)
            const response = await triggerApiCall('forum/getdiscussiondetails', body);
            setDataArray(response.forumData);
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
        })
    }

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setDisplayBottomButton(false);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, [])

    const addCommentToArray = () => {
        const newReplie = {
            id: dataArray.comments[dataArray.comments.length - 1]?.id + 1 || 0,
            name: Global.userInfo.firstName + " " + Global.userInfo.lastName,
            profilePath: Global.userInfo.image,
            comment: replyText.trim(),
            commentedOn: new Date()
        }
        dataArray.comments.push(newReplie);
    }

    const addComment = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            const body = {
                "userId": Global.userID,
                "forumId": props.route.params.selectedId,
                "comment": replyText.trim(),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            try {
                setLoading(true)
                await triggerApiCall('forum/addcomment', body);
                addCommentToArray();
                setReplyText("");
                setLoading(false);
            } catch (error) {
                setLoading(false);
                DisplayError(e.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    }

    const handleSent = async () => {
        if (replyText.trim() == "") {
            DisplayError("Please enter text in comment field");
        }
        else if (replyText != "" && emogiRegex.test(replyText)) {
            DisplayError("Please enter valid comment");
        }
        else {
            await addComment();
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <Header
                headerTitle={"Latest Discussion"}
                extraStyles={{ paddingHorizontal: widthToDp(4) }}
                onPress={() => { navigation.navigate('HopeConnect', { selectedOption: "FORUM" }) }}
            />
            <View style={[GlobalStyles.mainBox]}>

                <ScrollView style={{ paddingBottom: heightToDp(10) }}
                    ref={scrollRef}>
                    <View style={GlobalStyles.fixedTopSpacing}>
                        <View style={{ flexDirection: "row", alignItems: "center", overflow: "visible" }}>
                            <View style={[styles.shadow, { borderRadius: 14 }]}>
                                <FastImage
                                    resizeMode={FastImage.resizeMode.cover}
                                    style={{ width: widthToDp(10), height: widthToDp(10), borderRadius: 14 }}
                                    source={dataArray.profilePath !== "" ? { uri: dataArray.profilePath } : require("../assets/images/profile.png")}
                                />
                            </View>
                            <View style={{ marginLeft: widthToDp(4) }}>
                                <Text style={[Fonts.Nunito_600SemiBold, { fontSize: scale(14) }]}>{dataArray.startedBy}</Text>
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { color: Colors.normalText }]}>{dataArray.username}</Text>
                            </View>
                        </View>
                        <Text style={[Fonts.Nunito_700Bold, GlobalStyles.smallText, GlobalStyles.fixedTopSpacing]}>{dataArray.title}</Text>
                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText]}>Category : {dataArray.category}</Text>
                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText]}>{dataArray.description}</Text>
                    </View>
                    <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold, GlobalStyles.fixedTopSpacing]}>Replies</Text>
                    <View style={{ marginTop: heightToDp(0) }}>
                        {
                            dataArray.comments?.map((item, index) => {
                                return (
                                    <View key={index} style={{ flexDirection: "row", alignItems: "center", paddingVertical: heightToDp(2), borderBottomWidth: 1, borderBottomColor: Colors.placeholderTextColor }}>
                                        <View style={styles.shadow} >
                                            <FastImage
                                                resizeMode={FastImage.resizeMode.cover}
                                                style={{ width: widthToDp(10), height: widthToDp(10), borderRadius: 14 }}
                                                source={item.profilePath !== "" ? { uri: item.profilePath } : require("../assets/images/profile.png")}
                                            />
                                        </View>
                                        <View style={{ marginLeft: widthToDp(4), flexWrap: 'wrap' }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: widthToDp(75) }}>
                                                <Text style={[Fonts.Nunito_700Bold, GlobalStyles.smallText]}>{item.name}</Text>
                                                <Text style={[Fonts.Nunito_600SemiBold, { fontSize: scale(10), color: Colors.placeholderTextColor }]}>{moment(item.commentedOn).format("hh:mm a")}</Text>
                                            </View>
                                            <View style={{ width: widthToDp(15), flexDirection: "row", marginTop: heightToDp(1) }}>
                                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText, { width: widthToDp(75), textAlign: "justify" }]}>{item.comment}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                </ScrollView>
                <View style={[{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.placeholderTextColor, borderRadius: 14, paddingHorizontal: widthToDp(4), marginBottom: heightToDp(5), marginTop: heightToDp(2), backgroundColor: Colors.boxBackground, }, Global.OS == "ios" && { position: "absolute", bottom: !displayBottomButton ? heightToDp(35) : heightToDp(1) }]}>
                    <TextInput
                        ref={textInputRef}
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder='Add a reply...'
                        placeholderTextColor={Colors.placeholderTextColor}
                        style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { width: '90%', height: Global.OS == "ios" ? verticalScale(35) : null }]}
                        keyboardType="default"
                    />
                    <Pressable onPress={handleSent} style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}>
                        <VectorIcons groupName='Ionicons' iconName="send" iconstyle={{ color: Colors.primaryButtonColor }} />
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
            {displayBottomButton ?
                <Footer navigation={navigation} /> : null
            }
        </SafeAreaView>
    )
}

const styles = ScaledSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: widthToDp(10),
        height: widthToDp(10),
        backgroundColor: Colors.placeholderTextColor,
        borderRadius: 14
    }
});